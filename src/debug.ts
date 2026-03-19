import * as readline from "readline";
import type { Step, StepResult, Scenario } from "./types.js";

export interface DebugContext {
  scenario: Scenario;
  currentStepIndex: number;
  currentStep: Step;
  allSteps: Step[];
  backgroundStepCount: number;
  stepResults: StepResult[];
  session: unknown;
}

export interface DebugCommand {
  name: string;
  description: string;
  execute: (context: DebugContext, args: string[]) => Promise<DebugAction>;
}

export type DebugAction =
  | { type: "continue" }
  | { type: "skip" }
  | { type: "retry"; input?: string }
  | { type: "exit" }
  | { type: "step" };

export class DebugController {
  private breakpoints: string[];
  private stepThrough: boolean;
  private rl: readline.Interface | null = null;

  constructor(breakpoints: string[] = [], stepThrough: boolean = false) {
    this.breakpoints = breakpoints.map((bp) => bp.toLowerCase().trim());
    this.stepThrough = stepThrough;
  }

  shouldBreak(step: Step): boolean {
    if (this.stepThrough) {
      return true;
    }

    const stepTextFull = `${step.keyword} ${step.text}`.toLowerCase().trim();
    const stepTextOnly = step.text.toLowerCase().trim();

    return this.breakpoints.some((bp) => {
      if (!bp) {
        return false;
      }
      // Support substring matching for more flexible breakpoints
      return stepTextFull.includes(bp) || stepTextOnly.includes(bp);
    });
  }

  async startInteractiveConsole(context: DebugContext): Promise<DebugAction> {
    // Check if running in a non-interactive environment (e.g., CI)
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      console.log("\n⚠️  DEBUG MODE: Non-interactive terminal detected");
      console.log("    Auto-continuing execution (interactive debug requires a TTY)");
      return { type: "continue" };
    }

    const step = context.currentStep;
    console.log("\n🔍 DEBUG MODE - Breakpoint reached");
    console.log(`📍 Step: ${step.keyword} ${step.text}`);
    console.log(`📊 Step ${context.currentStepIndex + 1}/${context.allSteps.length}`);

    if (context.stepResults.length > 0) {
      const lastResult = context.stepResults[context.stepResults.length - 1];
      console.log(`⏱️  Last step: ${lastResult.status} (${lastResult.duration}ms)`);
      if (lastResult.aiReasoning) {
        console.log(`💭 Reasoning: ${lastResult.aiReasoning}`);
      }
    }

    return this.promptUser(context);
  }

  private async promptUser(context: DebugContext): Promise<DebugAction> {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "copilot-debug> ",
    });

    return new Promise((resolve) => {
      console.log("\nAvailable commands:");
      console.log("  continue (c)    - Continue execution");
      console.log("  step (s)        - Execute next step");
      console.log("  skip            - Skip current step");
      console.log("  inspect context - Show scenario context");
      console.log("  inspect results - Show step results");
      console.log("  retry [input]   - Retry step with optional input");
      console.log("  exit (q)        - Exit debug mode");
      console.log("");

      this.rl!.prompt();

      this.rl!.on("line", async (line) => {
        const trimmed = line.trim();
        if (!trimmed) {
          this.rl!.prompt();
          return;
        }

        const parts = trimmed.split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        let action: DebugAction | null = null;

        switch (command) {
          case "continue":
          case "c":
            this.stepThrough = false;
            action = { type: "continue" };
            break;

          case "step":
          case "s":
            this.stepThrough = true;
            action = { type: "step" };
            break;

          case "skip":
            action = { type: "skip" };
            break;

          case "inspect":
            if (args[0] === "context") {
              this.inspectContext(context);
            } else if (args[0] === "results") {
              this.inspectResults(context);
            } else {
              console.log("Usage: inspect [context|results]");
            }
            this.rl!.prompt();
            break;

          case "retry":
            action = { type: "retry", input: args.join(" ") || undefined };
            break;

          case "exit":
          case "q":
            action = { type: "exit" };
            break;

          default:
            console.log(`Unknown command: ${command}`);
            console.log('Type "continue", "step", "skip", "inspect", "retry", or "exit"');
            this.rl!.prompt();
            break;
        }

        if (action) {
          this.rl!.close();
          this.rl = null;
          resolve(action);
        }
      });

      this.rl!.on("close", () => {
        if (this.rl) {
          resolve({ type: "continue" });
        }
      });
    });
  }

  private inspectContext(context: DebugContext): void {
    console.log("\n📋 Scenario Context:");
    console.log(`  Name: ${context.scenario.name}`);
    console.log(`  Tags: ${context.scenario.tags.join(", ") || "none"}`);
    console.log(`  Total Steps: ${context.allSteps.length}`);
    if (context.backgroundStepCount > 0) {
      console.log(`  Background Steps: ${context.backgroundStepCount}`);
    }
    console.log(`  Current Step: ${context.currentStepIndex + 1}`);
    console.log("\n📝 All Steps:");
    context.allSteps.forEach((step, idx) => {
      const marker = idx === context.currentStepIndex ? "→" : " ";
      const status = context.stepResults[idx]?.status || "pending";
      const statusIcon =
        status === "passed"
          ? "✓"
          : status === "failed"
            ? "✗"
            : status === "skipped"
              ? "○"
              : "·";
      const prefix = idx < context.backgroundStepCount ? "[Background] " : "";
      console.log(
        `  ${marker} ${statusIcon} ${prefix}${step.keyword} ${step.text}`
      );
    });
    console.log("");
  }

  private inspectResults(context: DebugContext): void {
    console.log("\n📊 Step Results:");
    if (context.stepResults.length === 0) {
      console.log("  No steps executed yet");
    } else {
      context.stepResults.forEach((result, idx) => {
        const statusIcon =
          result.status === "passed"
            ? "✓"
            : result.status === "failed"
              ? "✗"
              : result.status === "skipped"
                ? "○"
                : "·";
        console.log(
          `  ${statusIcon} ${result.step.keyword} ${result.step.text}`
        );
        console.log(`     Status: ${result.status}`);
        console.log(`     Duration: ${result.duration}ms`);
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        }
        if (result.aiReasoning) {
          console.log(`     Reasoning: ${result.aiReasoning}`);
        }
      });
    }
    console.log("");
  }

  cleanup(): void {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }
}
