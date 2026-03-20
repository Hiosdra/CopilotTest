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
  RetryAttempt,
} from "./types.js";
import { DebugController, type DebugContext } from "./debug.js";
import { ScenarioContext as ScenarioContextClass } from "./context.js";
import { PromptBuilder } from "./prompt-builder.js";
import { SessionManager } from "./session-manager.js";
import { SystemMessages } from "./constants.js";
import { findStepDefinition } from "./step-registry.js";
import { escapeRegex, isPlainObject } from "./utils.js";
import {
  calculateRetryDelay,
  shouldRetryStep,
  sleep,
  isFlaky,
  reportFlakyTest,
  DEFAULT_RETRY_CONFIG,
} from "./retry.js";
import { PluginManager } from "./plugin-manager.js";

export class CopilotTestRuntime {
  private config: CopilotTestConfig;
  private client: unknown = null;
  private currentFeature?: Feature;
  private currentScenario?: Scenario;
  private currentPlatform?: PlatformConfig;
  private promptBuilder: PromptBuilder;
  private sessionManager: SessionManager;
  private pluginManager: PluginManager;

  constructor(config: CopilotTestConfig) {
    this.config = config;
    this.promptBuilder = new PromptBuilder();
    // Initialize SessionManager in mock mode if client is not available
    this.sessionManager = new SessionManager(false);
    // Initialize PluginManager and register plugins from config
    this.pluginManager = new PluginManager();
    if (config.plugins) {
      this.pluginManager.registerAll(config.plugins);
    }
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

  /**
   * Trigger onTestRunStart hooks for all registered plugins.
   */
  async triggerTestRunStart(): Promise<void> {
    await this.pluginManager.onTestRunStart(this.config);
  }

  /**
   * Trigger onTestRunEnd hooks for all registered plugins.
   */
  async triggerTestRunEnd(results: import("./types.js").TestRun): Promise<void> {
    await this.pluginManager.onTestRunEnd(results);
  }

  async runFeature(
    feature: Feature,
    platformKey: string
  ): Promise<FeatureResult> {
    const platform = this.config.platforms[platformKey];
    if (!platform) {
      throw new Error(`Platform "${platformKey}" not found in config`);
    }

    // Execute onFeatureStart hooks
    await this.pluginManager.onFeatureStart(feature);

    const startTime = Date.now();
    const scenarioResults: ScenarioResult[] = [];

    // Expand scenario outlines into multiple scenarios
    const expandedScenarios = this.expandScenarioOutlines(feature.scenarios);

    for (const scenario of expandedScenarios) {
      const result = await this.runScenario(feature, scenario, platform);
      scenarioResults.push(result);
    }

    const featureResult: FeatureResult = {
      feature,
      scenarios: scenarioResults,
      duration: Date.now() - startTime,
    };

    // Execute onFeatureEnd hooks
    await this.pluginManager.onFeatureEnd(feature, featureResult);

    return featureResult;
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
      const escapedKey = escapeRegex(key);
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
    // Execute onScenarioStart hooks
    await this.pluginManager.onScenarioStart(scenario);

    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    let scenarioFailed = false;
    let scenarioAborted = false;

    // Track resource metrics
    const resourceMetrics: import("./types.js").ResourceMetrics = {
      screenshots: 0,
      // Note: networkRequests tracking not yet implemented
    };

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
            const stepResult = await this.executeStep(step, session, context, action.input, scenario);
            stepResults.push(stepResult);

            // Track resource usage from step
            if (stepResult.screenshot) {
              resourceMetrics.screenshots = (resourceMetrics.screenshots || 0) + 1;
            }

            if (stepResult.status === "failed") {
              scenarioFailed = true;
            }
            continue;
          } else if (action.type === "step" || action.type === "continue") {
            console.log("\n▶️  Continuing...");
            // Continue to execute the step below
          }
        }

        const stepResult = await this.executeStep(step, session, context, undefined, scenario);
        stepResults.push(stepResult);

        // Track resource usage from step
        if (stepResult.screenshot) {
          resourceMetrics.screenshots = (resourceMetrics.screenshots || 0) + 1;
        }

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

    const scenarioResult: ScenarioResult = {
      scenario,
      status: scenarioAborted ? "skipped" : scenarioFailed ? "failed" : "passed",
      steps: stepResults,
      duration: Date.now() - startTime,
      resources: resourceMetrics,
    };

    // Execute onScenarioEnd hooks
    await this.pluginManager.onScenarioEnd(scenario, scenarioResult);

    return scenarioResult;
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
    overrideInput?: string,
    scenario?: Scenario
  ): Promise<StepResult> {
    const retryConfig = this.config.retry ?? {};
    const enabled = retryConfig.enabled ?? DEFAULT_RETRY_CONFIG.enabled;
    const maxRetries = enabled
      ? (retryConfig.stepRetries ?? DEFAULT_RETRY_CONFIG.stepRetries)
      : 0;

    // If retries are disabled or maxRetries is 0, execute normally
    if (!enabled || maxRetries === 0) {
      return this.executeStepOnce(step, session, context, overrideInput);
    }

    // Execute with retry logic
    const retryAttempts: RetryAttempt[] = [];
    let attempt = 0;
    let lastError: string | undefined;

    while (attempt <= maxRetries) {
      attempt++;
      const attemptStartTime = Date.now();

      try {
        const result = await this.executeStepOnce(step, session, context, overrideInput);

        // Record this attempt
        retryAttempts.push({
          attemptNumber: attempt,
          status: result.status,
          duration: Date.now() - attemptStartTime,
          error: result.error,
        });

        if (result.status === "passed") {
          // Success! Check if this test is flaky
          const retryCount = attempt - 1;
          if (retryCount > 0 && isFlaky(retryCount, retryConfig)) {
            // Report flaky test - use passed scenario parameter for thread safety
            const scenarioName = scenario?.name ?? "Unknown scenario";
            reportFlakyTest(scenarioName, attempt, retryConfig);
          }

          // Return successful result with retry metadata
          return {
            ...result,
            retryCount,
            retryAttempts,
          };
        }

        // Step failed - check if we should retry
        lastError = result.error ?? "Step failed";

        if (attempt > maxRetries) {
          // No more retries left
          return {
            ...result,
            retryCount: attempt - 1,
            retryAttempts,
          };
        }

        // Check if we should retry based on error
        if (!shouldRetryStep(lastError, attempt, retryConfig, maxRetries)) {
          // Don't retry this error
          return {
            ...result,
            retryCount: attempt - 1,
            retryAttempts,
          };
        }

        // Calculate delay before retry
        const delay = calculateRetryDelay(attempt, retryConfig);
        console.log(
          `  ⚠️  Step failed (attempt ${attempt}/${maxRetries + 1}): ${lastError}`
        );
        console.log(`  ⏳ Retrying in ${delay}ms...`);

        // Wait before retrying
        await sleep(delay);
      } catch (err) {
        // Unexpected error during execution
        const errorMsg = err instanceof Error ? err.message : String(err);
        retryAttempts.push({
          attemptNumber: attempt,
          status: "failed",
          duration: Date.now() - attemptStartTime,
          error: errorMsg,
        });

        lastError = errorMsg;

        if (attempt > maxRetries || !shouldRetryStep(errorMsg, attempt, retryConfig, maxRetries)) {
          return {
            step,
            status: "failed",
            duration: Date.now() - attemptStartTime,
            error: errorMsg,
            retryCount: attempt - 1,
            retryAttempts,
          };
        }

        const delay = calculateRetryDelay(attempt, retryConfig);
        console.log(`  ⚠️  Step error (attempt ${attempt}/${maxRetries + 1}): ${errorMsg}`);
        console.log(`  ⏳ Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }

    // Should not reach here, but just in case
    return {
      step,
      status: "failed",
      duration: 0,
      error: lastError ?? "Step failed after all retries",
      retryCount: maxRetries,
      retryAttempts,
    };
  }

  private async executeStepOnce(
    step: Step,
    session: unknown,
    context: ScenarioContext,
    overrideInput?: string
  ): Promise<StepResult> {
    // Execute onStepStart hooks
    await this.pluginManager.onStepStart(step);

    let result: StepResult;

    try {
      result = await this.executeStepImpl(step, session, context, overrideInput);
    } catch (error) {
      // If executeStepImpl throws, create a failed result
      const duration = Date.now();
      result = {
        step,
        status: "failed",
        duration: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Execute onStepEnd hooks
    await this.pluginManager.onStepEnd(step, result);

    return result;
  }

  private async executeStepImpl(
    step: Step,
    session: unknown,
    context: ScenarioContext,
    overrideInput?: string
  ): Promise<StepResult> {
    const startTime = Date.now();
    const aiStartTime = Date.now();

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

          const duration = Date.now() - startTime;
          return {
            step,
            status: "passed",
            duration,
            aiReasoning: `[Custom] Step "${step.keyword} ${step.text}" executed via custom definition`,
            metrics: {
              duration,
              executionTime: duration,
              aiThinkTime: 0,
            },
          };
        } catch (err) {
          const duration = Date.now() - startTime;
          return {
            step,
            status: "failed",
            duration,
            error: err instanceof Error ? err.message : String(err),
            metrics: {
              duration,
              executionTime: duration,
              aiThinkTime: 0,
            },
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
        const duration = Date.now() - startTime;
        return {
          step,
          status: "passed",
          duration,
          aiReasoning: `[Mock] Step "${step.keyword} ${step.text}" executed successfully`,
          metrics: {
            duration,
            aiThinkTime: 25,
            executionTime: 25,
          },
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
      const aiEndTime = Date.now();

      if (!response) {
        const duration = Date.now() - startTime;
        return {
          step,
          status: "failed",
          duration,
          error: "No response received from AI",
          metrics: {
            duration,
            aiThinkTime: aiEndTime - aiStartTime,
            executionTime: 0,
          },
        };
      }

      const parsed = this.parseStepResponse(response.data.content);
      const executionEndTime = Date.now();
      const duration = executionEndTime - startTime;
      const aiThinkTime = aiEndTime - aiStartTime;
      const executionTime = executionEndTime - aiEndTime;

      // Check performance thresholds
      if (this.config.performance) {
        const { warnThreshold, failThreshold } = this.config.performance;

        if (failThreshold && duration > failThreshold) {
          return {
            step,
            status: "failed",
            duration,
            error: `Step exceeded fail threshold: ${duration}ms > ${failThreshold}ms`,
            aiReasoning: parsed.reasoning,
            contextUpdates: parsed.context,
            metrics: {
              duration,
              aiThinkTime,
              executionTime,
            },
          };
        }

        if (warnThreshold && duration > warnThreshold) {
          console.warn(`⚠️  Performance warning: Step took ${duration}ms (threshold: ${warnThreshold}ms)`);
        }
      }

      return {
        step,
        status: parsed.status,
        duration,
        error: parsed.error,
        aiReasoning: parsed.reasoning,
        contextUpdates: parsed.context,
        metrics: {
          duration,
          aiThinkTime,
          executionTime,
        },
      };
    } catch (err) {
      const duration = Date.now() - startTime;
      return {
        step,
        status: "failed",
        duration,
        error: err instanceof Error ? err.message : String(err),
        metrics: {
          duration,
          aiThinkTime: Date.now() - aiStartTime,
          executionTime: 0,
        },
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
        if (parsed.context && isPlainObject(parsed.context)) {
          validatedContext = parsed.context;
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
      SystemMessages.DEFAULT_SYSTEM_MESSAGE,
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
