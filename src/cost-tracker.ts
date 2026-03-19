/**
 * AI Cost Tracking Module
 *
 * Tracks token usage and costs for AI model interactions during test execution.
 */

import type { CostTrackingConfig, CostMetrics, ModelPricing } from "./types.js";

/**
 * Default pricing for common AI models (USD per token).
 * Based on typical market rates as of 2025.
 */
const DEFAULT_PRICING: Record<string, ModelPricing> = {
  "gpt-4o": {
    input: 0.0025 / 1000,  // $2.50 per 1M input tokens
    output: 0.01 / 1000,   // $10 per 1M output tokens
  },
  "gpt-4o-mini": {
    input: 0.00015 / 1000, // $0.15 per 1M input tokens
    output: 0.0006 / 1000, // $0.60 per 1M output tokens
  },
  "gpt-4": {
    input: 0.03 / 1000,    // $30 per 1M input tokens
    output: 0.06 / 1000,   // $60 per 1M output tokens
  },
  "gpt-3.5-turbo": {
    input: 0.0005 / 1000,  // $0.50 per 1M input tokens
    output: 0.0015 / 1000, // $1.50 per 1M output tokens
  },
};

/**
 * Tracks AI model costs during test execution.
 */
export class CostTracker {
  private config: CostTrackingConfig;
  private pricing: Record<string, ModelPricing>;
  private totalInputTokens: number = 0;
  private totalOutputTokens: number = 0;
  private totalCost: number = 0;
  private dailyCost: number = 0;
  private monthlyCost: number = 0;
  private lastResetDate: Date = new Date();
  private model: string;

  constructor(config: CostTrackingConfig, model: string = "gpt-4o") {
    this.config = config;
    this.model = model;

    // Merge custom pricing with defaults
    this.pricing = {
      ...DEFAULT_PRICING,
      ...(config.pricing || {}),
    };
  }

  /**
   * Track token usage for a step execution.
   * In real implementation, this would extract token info from AI response.
   * For now, we estimate based on text length as a placeholder.
   */
  trackStep(inputText: string, outputText: string, model?: string): CostMetrics {
    // Estimate token count (rough approximation: 1 token ≈ 4 characters)
    const inputTokens = Math.ceil(inputText.length / 4);
    const outputTokens = Math.ceil(outputText.length / 4);

    return this.trackTokens(inputTokens, outputTokens, model);
  }

  /**
   * Track exact token usage (when available from AI SDK).
   */
  trackTokens(inputTokens: number, outputTokens: number, model?: string): CostMetrics {
    const modelName = model || this.model;
    const pricing = this.pricing[modelName] || this.pricing["gpt-4o"];

    const inputCost = inputTokens * pricing.input;
    const outputCost = outputTokens * pricing.output;
    const totalStepCost = inputCost + outputCost;

    // Update totals
    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;
    this.totalCost += totalStepCost;
    this.dailyCost += totalStepCost;
    this.monthlyCost += totalStepCost;

    // Check budget alerts
    this.checkBudgetAlerts(totalStepCost);

    return {
      inputTokens,
      outputTokens,
      costUSD: totalStepCost,
      model: modelName,
    };
  }

  /**
   * Get aggregated cost metrics.
   */
  getMetrics(): CostMetrics {
    return {
      inputTokens: this.totalInputTokens,
      outputTokens: this.totalOutputTokens,
      costUSD: this.totalCost,
      model: this.model,
    };
  }

  /**
   * Reset daily/monthly counters if needed.
   */
  private resetIfNeeded(): void {
    const now = new Date();
    const lastReset = this.lastResetDate;

    // Reset daily cost if it's a new day
    if (now.getDate() !== lastReset.getDate() ||
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear()) {
      this.dailyCost = 0;
    }

    // Reset monthly cost if it's a new month
    if (now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear()) {
      this.monthlyCost = 0;
    }

    this.lastResetDate = now;
  }

  /**
   * Check budget limits and trigger alerts.
   */
  private checkBudgetAlerts(stepCost: number): void {
    if (!this.config.alerts || !this.config.budget) {
      return;
    }

    this.resetIfNeeded();

    const { budget, alerts } = this.config;

    // Check per-test budget
    if (budget.perTest && stepCost > budget.perTest) {
      if (alerts.onBudgetExceeded) {
        alerts.onBudgetExceeded(stepCost, budget.perTest);
      }
    } else if (budget.perTest && stepCost > budget.perTest * 0.8) {
      if (alerts.onThresholdReached) {
        alerts.onThresholdReached(stepCost, budget.perTest);
      }
    }

    // Check daily budget
    if (budget.daily) {
      if (this.dailyCost > budget.daily) {
        if (alerts.onBudgetExceeded) {
          alerts.onBudgetExceeded(this.dailyCost, budget.daily);
        }
      } else if (this.dailyCost > budget.daily * 0.8) {
        if (alerts.onThresholdReached) {
          alerts.onThresholdReached(this.dailyCost, budget.daily);
        }
      }
    }

    // Check monthly budget
    if (budget.monthly) {
      if (this.monthlyCost > budget.monthly) {
        if (alerts.onBudgetExceeded) {
          alerts.onBudgetExceeded(this.monthlyCost, budget.monthly);
        }
      } else if (this.monthlyCost > budget.monthly * 0.8) {
        if (alerts.onThresholdReached) {
          alerts.onThresholdReached(this.monthlyCost, budget.monthly);
        }
      }
    }
  }

  /**
   * Format cost for display.
   */
  static formatCost(cost: number): string {
    return `$${cost.toFixed(4)}`;
  }

  /**
   * Format token count for display.
   */
  static formatTokens(tokens: number): string {
    if (tokens > 1000000) {
      return `${(tokens / 1000000).toFixed(2)}M`;
    } else if (tokens > 1000) {
      return `${(tokens / 1000).toFixed(2)}K`;
    }
    return tokens.toString();
  }

  /**
   * Generate a cost summary report.
   */
  generateSummary(): string {
    const metrics = this.getMetrics();
    const inputCostUSD = metrics.inputTokens * (this.pricing[this.model]?.input || 0);
    const outputCostUSD = metrics.outputTokens * (this.pricing[this.model]?.output || 0);

    return `
AI Cost Summary
===============
Model: ${this.model}
Total Cost: ${CostTracker.formatCost(metrics.costUSD)}
Total Tokens: ${CostTracker.formatTokens(metrics.inputTokens + metrics.outputTokens)}
  - Input:  ${CostTracker.formatTokens(metrics.inputTokens)} (${CostTracker.formatCost(inputCostUSD)})
  - Output: ${CostTracker.formatTokens(metrics.outputTokens)} (${CostTracker.formatCost(outputCostUSD)})
`.trim();
  }
}

/**
 * Aggregate cost metrics from multiple sources.
 */
export function aggregateCostMetrics(costs: (CostMetrics | undefined)[]): CostMetrics {
  const validCosts = costs.filter((c): c is CostMetrics => c !== undefined);

  if (validCosts.length === 0) {
    return {
      inputTokens: 0,
      outputTokens: 0,
      costUSD: 0,
    };
  }

  return {
    inputTokens: validCosts.reduce((sum, c) => sum + c.inputTokens, 0),
    outputTokens: validCosts.reduce((sum, c) => sum + c.outputTokens, 0),
    costUSD: validCosts.reduce((sum, c) => sum + c.costUSD, 0),
    model: validCosts[0].model,
  };
}
