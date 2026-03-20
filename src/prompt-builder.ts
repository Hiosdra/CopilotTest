/**
 * Prompt building utilities for AI step execution
 * Extracted from CopilotTestRuntime for better maintainability
 */

import { SystemMessages } from "./constants.js";
import type { Step, ScenarioContext, PlatformConfig, Scenario } from "./types.js";

/**
 * PromptBuilder constructs AI prompts for test step execution
 */
export class PromptBuilder {
  /**
   * Build a complete prompt for step execution
   */
  buildStepPrompt(
    step: Step,
    context: ScenarioContext,
    platform: PlatformConfig,
    scenario: Scenario,
    overrideInput?: string
  ): string {
    const parts: string[] = [];

    // Add system context
    parts.push("=== TEST CONTEXT ===");
    parts.push(`Platform: ${platform.platform}`);
    parts.push(`Scenario: ${scenario.name}`);
    if (scenario.tags && scenario.tags.length > 0) {
      parts.push(`Tags: ${scenario.tags.join(", ")}`);
    }
    parts.push("");

    // Add platform-specific configuration
    if (platform.systemContext) {
      parts.push("=== PLATFORM CONFIG ===");
      parts.push(platform.systemContext);
      parts.push("");
    }

    // Add scenario context if available
    const contextData = context.getAll();
    if (Object.keys(contextData).length > 0) {
      parts.push("=== SCENARIO CONTEXT ===");
      for (const [key, value] of Object.entries(contextData)) {
        let valueStr: string;
        if (value instanceof Error) {
          valueStr = value.stack ?? value.message;
        } else if (value !== null && typeof value === "object") {
          try {
            valueStr = JSON.stringify(value);
          } catch {
            valueStr = String(value);
          }
        } else {
          valueStr = String(value);
        }
        parts.push(`${key}: ${valueStr}`);
      }
      parts.push("");
    }

    // Add the step to execute
    parts.push("=== STEP TO EXECUTE ===");
    parts.push(`${step.keyword} ${overrideInput ?? step.text}`);

    // Add step attachments if present
    if (step.table && step.table.length > 0) {
      parts.push("");
      parts.push("Data Table:");
      parts.push(this.formatTable(step.table));
    }

    if (step.docString) {
      parts.push("");
      parts.push("Doc String:");
      parts.push("```");
      parts.push(step.docString);
      parts.push("```");
    }

    parts.push("");
    parts.push("=== INSTRUCTIONS ===");
    parts.push("Execute this test step and respond with the result in the exact JSON format specified.");
    parts.push("Remember: Your response must be ONLY valid JSON, no other text.");

    return parts.join("\n");
  }

  /**
   * Format a data table for display in prompt
   */
  private formatTable(table: string[][]): string {
    if (table.length === 0) {
      return "";
    }

    // Calculate column widths
    const colWidths: number[] = [];
    for (let colIndex = 0; colIndex < table[0].length; colIndex++) {
      const maxWidth = Math.max(
        ...table.map((row) => (row[colIndex] || "").length)
      );
      colWidths.push(maxWidth);
    }

    // Format rows
    const formattedRows = table.map((row) => {
      const cells = row.map((cell, index) => {
        return (cell || "").padEnd(colWidths[index]);
      });
      return `| ${cells.join(" | ")} |`;
    });

    // Add separator after header
    if (formattedRows.length > 1) {
      const separator = `|${colWidths.map((width) => "-".repeat(width + 2)).join("|")}|`;
      formattedRows.splice(1, 0, separator);
    }

    return formattedRows.join("\n");
  }

  /**
   * Get the default system message
   */
  getSystemMessage(): string {
    return SystemMessages.DEFAULT_SYSTEM_MESSAGE;
  }

  /**
   * Build a custom system message with additional context
   */
  buildCustomSystemMessage(additionalInstructions?: string): string {
    if (!additionalInstructions) {
      return this.getSystemMessage();
    }

    return `${this.getSystemMessage()}\n\nADDITIONAL INSTRUCTIONS:\n${additionalInstructions}`;
  }

  /**
   * Extract and format platform-specific system context
   */
  buildPlatformContext(platform: PlatformConfig): string {
    const parts: string[] = [];

    parts.push(`Platform Type: ${platform.platform}`);

    if (platform.systemContext) {
      parts.push(`System Context: ${platform.systemContext}`);
    }

    return parts.join("\n");
  }
}
