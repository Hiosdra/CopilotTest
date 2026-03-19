import type {
  Feature,
  Scenario,
  Step,
  PlatformConfig,
  CopilotTestConfig,
  StepResult,
  ScenarioResult,
  FeatureResult,
  ScenarioContext,
  StepContext,
} from "./types.js";
import { DebugController, type DebugContext } from "./debug.js";
import { ScenarioContext as ScenarioContextClass } from "./types.js";
import { findStepDefinition } from "./step-registry.js";

export const DEFAULT_SYSTEM_MESSAGE = `You are an autonomous QA testing agent.
Your job is to execute BDD test steps by interacting with the provided tools.

Rules:
1. Execute each step faithfully using the available MCP tools.
2. After completing a step, respond ONLY with a JSON object in this exact format:
   {"status": "passed"|"failed", "reasoning": "<explanation>", "error": "<error message if failed>", "context": {"key": "value"}}
3. For web tests: use Playwright tools to navigate, interact, and verify.
4. For API tests: use curl tools to make HTTP requests and verify responses.
5. For mobile tests: use Android tools to interact with the emulator.
6. Be thorough in verifications - check that the expected outcome is actually true.
7. If a step cannot be performed, mark it as failed with a clear error message.
8. Never skip verification steps.

## Context Management
You have access to a shared context object that persists across steps within a scenario.

**When to store data in context:**
- After creating a resource (store the ID, e.g., userId, orderId, cartId)
- After authentication (store tokens, session IDs)
- When extracting data from responses that will be referenced in later steps
- When you see step text mentioning "for later use", "from previous step", "using the ID from context", etc.

**What to store:**
- Resource IDs (userId, productId, orderId, etc.)
- Authentication tokens and credentials
- Status codes or important response values
- Any data explicitly mentioned in the step that should be remembered

**How to store:**
- Use the "context" field in your JSON response
- Use descriptive key names (e.g., "userId" not just "id")
- Store primitive values and objects, not complex structures
- Example: {"status": "passed", "reasoning": "User created with ID 12345", "context": {"userId": "12345", "username": "alice"}}

**Reading from context:**
- The context from previous steps will be provided to you in each step prompt
- When a step mentions "using the ID from context" or "from previous step", look for the relevant value in the context
- If context is empty but the step expects it, mark the step as failed

**Always think:** "Will any data from this step be needed later? If yes, store it in context with a clear name."`;

export class CopilotTestRuntime {
  private config: CopilotTestConfig;
  private client: unknown = null;
  private currentFeature?: Feature;
  private currentScenario?: Scenario;
  private currentPlatform?: PlatformConfig;

  constructor(config: CopilotTestConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    try {
      const { CopilotClient } = await import("@github/copilot-sdk");
      this.client = new CopilotClient();
    } catch {
      // SDK not available - use mock mode for development/demo
      this.client = { _mock: true };
    }
  }

  async stop(): Promise<void> {
    if (
      this.client &&
      typeof (this.client as Record<string, unknown>).stop === "function"
    ) {
      await (this.client as { stop(): Promise<void> }).stop();
    }
    this.client = null;
  }

  async runFeature(
    feature: Feature,
    platformKey: string
  ): Promise<FeatureResult> {
    const platform = this.config.platforms[platformKey];
    if (!platform) {
      throw new Error(`Platform "${platformKey}" not found in config`);
    }

    const startTime = Date.now();
    const scenarioResults: ScenarioResult[] = [];

    // Expand scenario outlines into multiple scenarios
    const expandedScenarios = this.expandScenarioOutlines(feature.scenarios);

    for (const scenario of expandedScenarios) {
      const result = await this.runScenario(feature, scenario, platform);
      scenarioResults.push(result);
    }

    return {
      feature,
      scenarios: scenarioResults,
      duration: Date.now() - startTime,
    };
  }

  private expandScenarioOutlines(scenarios: Scenario[]): Scenario[] {
    const expanded: Scenario[] = [];

    for (const scenario of scenarios) {
      if (scenario.examples && scenario.examples.length > 0) {
        // Expand scenario outline into multiple scenarios
        for (let i = 0; i < scenario.examples.length; i++) {
          const exampleData = scenario.examples[i];
          const expandedScenario: Scenario = {
            name: `${scenario.name} (Example ${i + 1})`,
            tags: [...scenario.tags],
            steps: scenario.steps.map((step) => ({
              ...step,
              text: this.substituteParameters(step.text, exampleData),
            })),
            debugMode: scenario.debugMode,
          };
          expanded.push(expandedScenario);
        }
      } else {
        // Regular scenario, no expansion needed
        expanded.push(scenario);
      }
    }

    return expanded;
  }

  private substituteParameters(text: string, data: Record<string, string>): string {
    let result = text;
    for (const [key, value] of Object.entries(data)) {
      // Escape regex metacharacters in key to prevent incorrect matches
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Use callback to prevent "$" in value from being interpreted as replacement pattern
      result = result.replace(new RegExp(`<${escapedKey}>`, "g"), () => value);
    }
    return result;
  }

  async runScenario(
    feature: Feature,
    scenario: Scenario,
    platform: PlatformConfig
  ): Promise<ScenarioResult> {
    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    let scenarioFailed = false;
    let scenarioAborted = false;

    // Check if debug mode is enabled
    const debugEnabled =
      this.config.debugMode === true || scenario.debugMode === true;
    const debugController = debugEnabled
      ? new DebugController(
          this.config.breakpoints || [],
          this.config.interactive === true
        )
      : null;

    // Store context for custom step definitions
    this.currentFeature = feature;
    this.currentScenario = scenario;
    this.currentPlatform = platform;

    // Build steps including background
    const allSteps: Step[] = [
      ...(feature.background ?? []),
      ...scenario.steps,
    ];

    // Create scenario context
    const context = new ScenarioContextClass();

    let session: unknown = null;

    try {
      session = await this.createSession(feature, scenario, platform);

      for (let i = 0; i < allSteps.length; i++) {
        const step = allSteps[i];

        if (scenarioFailed) {
          stepResults.push({
            step,
            status: "skipped",
            duration: 0,
          });
          continue;
        }

        // Debug mode: check for breakpoint
        if (debugController && debugController.shouldBreak(step)) {
          const debugContext: DebugContext = {
            scenario,
            currentStepIndex: i,
            currentStep: step,
            allSteps,
            backgroundStepCount: feature.background?.length ?? 0,
            stepResults: [...stepResults],
            session,
          };

          const action =
            await debugController.startInteractiveConsole(debugContext);

          if (action.type === "exit") {
            console.log("\n🛑 Debug mode exited by user");
            scenarioAborted = true;
            // Mark remaining steps as skipped
            for (let j = i; j < allSteps.length; j++) {
              stepResults.push({
                step: allSteps[j],
                status: "skipped",
                duration: 0,
              });
            }
            break;
          } else if (action.type === "skip") {
            console.log("\n⏭️  Skipping step");
            stepResults.push({
              step,
              status: "skipped",
              duration: 0,
            });
            continue;
          } else if (action.type === "retry") {
            if (action.input) {
              console.log(`\n🔄 Retrying step with input: "${action.input}"`);
            } else {
              console.log("\n🔄 Retrying step...");
            }
            // Execute step with optional override input
            const stepResult = await this.executeStep(step, session, context, action.input);
            stepResults.push(stepResult);
            if (stepResult.status === "failed") {
              scenarioFailed = true;
            }
            continue;
          } else if (action.type === "step" || action.type === "continue") {
            console.log("\n▶️  Continuing...");
            // Continue to execute the step below
          }
        }

        const stepResult = await this.executeStep(step, session, context);
        stepResults.push(stepResult);

        // Update context with any values returned from the step
        if (stepResult.contextUpdates) {
          for (const [key, value] of Object.entries(stepResult.contextUpdates)) {
            context.set(key, value);
          }
        }

        if (stepResult.status === "failed") {
          scenarioFailed = true;
        }
      }
    } catch (err) {
      scenarioFailed = true;
      // If session creation failed, mark all steps as failed/skipped
      if (stepResults.length === 0 && allSteps.length > 0) {
        stepResults.push({
          step: allSteps[0],
          status: "failed",
          duration: 0,
          error: err instanceof Error ? err.message : String(err),
        });
        for (const step of allSteps.slice(1)) {
          stepResults.push({ step, status: "skipped", duration: 0 });
        }
      }
    } finally {
      if (debugController) {
        debugController.cleanup();
      }

      if (
        session &&
        typeof (session as Record<string, unknown>).close === "function"
      ) {
        await (session as { close(): Promise<void> }).close();
      }
    }

    return {
      scenario,
      status: scenarioAborted ? "skipped" : scenarioFailed ? "failed" : "passed",
      steps: stepResults,
      duration: Date.now() - startTime,
    };
  }

  private async createSession(
    feature: Feature,
    scenario: Scenario,
    platform: PlatformConfig
  ): Promise<unknown> {
    if (
      !this.client ||
      (this.client as Record<string, unknown>)._mock === true
    ) {
      // Return a mock session for development/demo
      return { _mock: true };
    }

    const { approveAll } = await import("@github/copilot-sdk");

    const mcpServers: Record<string, unknown> = {
      platform: {
        ...this.buildMcpServerConfig(platform.mcpServer),
      },
    };

    // Add extra MCP servers from config
    if (this.config.mcpServers) {
      for (const [key, serverConfig] of Object.entries(this.config.mcpServers)) {
        mcpServers[key] = this.buildMcpServerConfig(serverConfig);
      }
    }

    const systemMessage = this.buildSystemPrompt(feature, scenario, platform);

    const clientWithSession = this.client as {
      createSession(opts: unknown): Promise<unknown>;
    };

    return clientWithSession.createSession({
      model: this.config.model,
      reasoningEffort: this.config.reasoningEffort,
      mcpServers,
      systemMessage: { mode: "replace", content: systemMessage },
      onPermissionRequest: approveAll,
      hooks: {
        onPreToolUse: () => ({ permissionDecision: "allow" as const }),
        onPostToolUse: (input: { toolName: string }) => {
          process.stdout.write(`  🔧 Tool: ${input.toolName}\n`);
        },
      },
    });
  }

  private buildMcpServerConfig(
    serverConfig: import("./types.js").McpServerConfig
  ): Record<string, unknown> {
    const tools = serverConfig.tools ?? ["*"];
    const mcpTimeout = serverConfig.timeout;

    if (serverConfig.type === "stdio" || !serverConfig.type) {
      return {
        type: "local",
        command: serverConfig.command ?? "",
        args: serverConfig.args ?? [],
        env: serverConfig.env,
        cwd: serverConfig.cwd,
        tools,
        ...(mcpTimeout !== undefined ? { timeout: mcpTimeout } : {}),
      };
    } else {
      // sse or http
      return {
        type: serverConfig.type,
        url: serverConfig.url ?? "",
        headers: serverConfig.headers,
        tools,
        ...(mcpTimeout !== undefined ? { timeout: mcpTimeout } : {}),
      };
    }
  }

  async executeStep(
    step: Step,
    session: unknown,
    context: ScenarioContext,
    overrideInput?: string
  ): Promise<StepResult> {
    const startTime = Date.now();

    // Check if custom step definitions are enabled (default: true)
    const useCustomSteps = this.config.useCustomStepDefinitions !== false;

    // Try to match custom step definition first (if enabled)
    if (useCustomSteps) {
      const match = findStepDefinition(step.text);
      if (match) {
        try {
          // Build context for custom step handler
          const stepContext: StepContext = {
            step,
            session,
            feature: this.currentFeature,
            scenario: this.currentScenario,
            platform: this.currentPlatform,
            scenarioContext: context, // Pass ScenarioContext to custom steps
          };

          // Execute custom step handler with captured matches
          await match.definition.handler(stepContext, ...match.matches);

          return {
            step,
            status: "passed",
            duration: Date.now() - startTime,
            aiReasoning: `[Custom] Step "${step.keyword} ${step.text}" executed via custom definition`,
          };
        } catch (err) {
          return {
            step,
            status: "failed",
            duration: Date.now() - startTime,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      }
    }

    // Fall back to AI execution if no custom definition matched
    const prompt = this.buildStepPrompt(step, context, overrideInput);
    const timeout = this.config.stepTimeout ?? 30000;

    try {
      if ((session as Record<string, unknown>)._mock === true) {
        // Mock mode - simulate step execution
        await new Promise((resolve) => setTimeout(resolve, 50));
        return {
          step,
          status: "passed",
          duration: Date.now() - startTime,
          aiReasoning: `[Mock] Step "${step.keyword} ${step.text}" executed successfully`,
        };
      }

      const sessionWithSend = session as {
        sendAndWait(
          opts: { prompt: string },
          timeout?: number
        ): Promise<{ data: { content: string } } | undefined>;
      };

      const response = await sessionWithSend.sendAndWait(
        { prompt },
        timeout
      );

      if (!response) {
        return {
          step,
          status: "failed",
          duration: Date.now() - startTime,
          error: "No response received from AI",
        };
      }

      const parsed = this.parseStepResponse(response.data.content);

      return {
        step,
        status: parsed.status,
        duration: Date.now() - startTime,
        error: parsed.error,
        aiReasoning: parsed.reasoning,
        contextUpdates: parsed.context,
      };
    } catch (err) {
      return {
        step,
        status: "failed",
        duration: Date.now() - startTime,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  parseStepResponse(content: string): {
    status: "passed" | "failed";
    reasoning: string;
    error?: string;
    context?: Record<string, unknown>;
  } {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*"status"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as {
          status: "passed" | "failed";
          reasoning: string;
          error?: string;
          context?: unknown;
        };

        // Validate context is a plain object (not array, null, or primitive)
        let validatedContext: Record<string, unknown> | undefined;
        if (
          parsed.context &&
          typeof parsed.context === "object" &&
          !Array.isArray(parsed.context)
        ) {
          validatedContext = parsed.context as Record<string, unknown>;
        }

        return {
          status: parsed.status === "failed" ? "failed" : "passed",
          reasoning: parsed.reasoning ?? content,
          error: parsed.error,
          context: validatedContext,
        };
      } catch {
        // Fall through to heuristic
      }
    }

    // Heuristic: if content contains "failed" or "error", mark as failed
    const lower = content.toLowerCase();
    if (lower.includes("failed") || lower.includes("error:")) {
      return { status: "failed", reasoning: content, error: content };
    }

    return { status: "passed", reasoning: content };
  }

  buildSystemPrompt(
    feature: Feature,
    scenario: Scenario,
    platform: PlatformConfig
  ): string {
    const parts = [
      DEFAULT_SYSTEM_MESSAGE,
      "",
      `## Current Test Context`,
      `Feature: ${feature.name}`,
      feature.description ? `Description: ${feature.description}` : "",
      `Scenario: ${scenario.name}`,
      `Platform: ${platform.platform}`,
      "",
    ].filter(Boolean);

    if (platform.systemContext) {
      parts.push("## Platform Instructions", platform.systemContext, "");
    }

    if (feature.background && feature.background.length > 0) {
      parts.push("## Background Steps");
      for (const step of feature.background) {
        parts.push(`  ${step.keyword} ${step.text}`);
      }
      parts.push("");
    }

    parts.push("## Scenario Steps");
    for (const step of scenario.steps) {
      parts.push(`  ${step.keyword} ${step.text}`);
    }

    return parts.join("\n");
  }

  buildStepPrompt(step: Step, context: ScenarioContext, overrideInput?: string): string {
    const stepText = overrideInput ?? step.text;
    const parts = [`Execute this BDD step: ${step.keyword} ${stepText}`];

    if (overrideInput) {
      parts.push(
        `\nNote: Original step text was "${step.text}" but user requested retry with: "${overrideInput}"`
      );
    }

    if (step.table) {
      parts.push("\nData table:");
      for (const row of step.table) {
        parts.push(`| ${row.join(" | ")} |`);
      }
    }

    if (step.docString) {
      parts.push("\nDoc string:");
      parts.push("```");
      parts.push(step.docString);
      parts.push("```");
    }

    // Add current context if it has any data
    const contextKeys = context.keys();
    if (contextKeys.length > 0) {
      parts.push("\n## Current Context");
      parts.push("The following data is available from previous steps:");
      parts.push("```json");
      parts.push(JSON.stringify(context.toJSON(), null, 2));
      parts.push("```");
    }

    parts.push(
      '\nRespond with JSON only: {"status": "passed"|"failed", "reasoning": "<what you did>", "error": "<error if failed>", "context": {"key": "value"}}'
    );
    parts.push(
      '\nIMPORTANT: In the "context" field, store any data from this step that might be needed in future steps.'
    );
    parts.push(
      'Ask yourself: "Did I create a resource? Extract an ID? Get a token? If yes, add it to context with a descriptive key name."'
    );

    return parts.join("\n");
  }
}
