import type { TestRun, ScenarioResult, StepResult } from "./types.js";

/**
 * Performance summary statistics for a test run.
 */
export interface PerformanceSummary {
  /** Total duration of all scenarios */
  totalDuration: number;
  /** Average step duration */
  avgStepDuration: number;
  /** Slowest step with its duration */
  slowestStep?: { step: string; duration: number; scenario: string };
  /** Fastest step with its duration */
  fastestStep?: { step: string; duration: number; scenario: string };
  /** Average AI think time */
  avgAiThinkTime: number;
  /** Average execution time */
  avgExecutionTime: number;
  /** Total screenshots taken */
  totalScreenshots: number;
  /** Total network requests (if tracked) */
  totalNetworkRequests: number;
}

/**
 * Performance breakdown for individual steps.
 */
export interface StepPerformance {
  /** Step description */
  step: string;
  /** Scenario name */
  scenario: string;
  /** Total duration */
  duration: number;
  /** AI think time */
  aiTime: number;
  /** Execution time */
  execTime: number;
}

/**
 * Analyzes test run and generates performance summary.
 */
export function analyzePerformance(testRun: TestRun): PerformanceSummary {
  let totalSteps = 0;
  let totalStepDuration = 0;
  let totalAiThinkTime = 0;
  let totalExecutionTime = 0;
  let aiTimeCount = 0;
  let execTimeCount = 0;
  let slowest: { step: string; duration: number; scenario: string } | undefined;
  let fastest: { step: string; duration: number; scenario: string } | undefined;
  let totalScreenshots = 0;
  let totalNetworkRequests = 0;

  for (const featureResult of testRun.features) {
    for (const scenarioResult of featureResult.scenarios) {
      // Aggregate resource metrics
      if (scenarioResult.resources) {
        totalScreenshots += scenarioResult.resources.screenshots || 0;
        totalNetworkRequests += scenarioResult.resources.networkRequests || 0;
      }

      for (const stepResult of scenarioResult.steps) {
        if (stepResult.status === "skipped") continue;

        totalSteps++;
        totalStepDuration += stepResult.duration;

        // Track AI think time and execution time
        if (stepResult.metrics) {
          if (stepResult.metrics.aiThinkTime !== undefined) {
            totalAiThinkTime += stepResult.metrics.aiThinkTime;
            aiTimeCount++;
          }
          if (stepResult.metrics.executionTime !== undefined) {
            totalExecutionTime += stepResult.metrics.executionTime;
            execTimeCount++;
          }
        }

        const stepDesc = `${stepResult.step.keyword} ${stepResult.step.text}`;

        // Track slowest step
        if (!slowest || stepResult.duration > slowest.duration) {
          slowest = {
            step: stepDesc,
            duration: stepResult.duration,
            scenario: scenarioResult.scenario.name,
          };
        }

        // Track fastest step (but skip skipped steps)
        if (!fastest || stepResult.duration < fastest.duration) {
          fastest = {
            step: stepDesc,
            duration: stepResult.duration,
            scenario: scenarioResult.scenario.name,
          };
        }
      }
    }
  }

  return {
    totalDuration: testRun.metadata?.duration || 0,
    avgStepDuration: totalSteps > 0 ? totalStepDuration / totalSteps : 0,
    avgAiThinkTime: aiTimeCount > 0 ? totalAiThinkTime / aiTimeCount : 0,
    avgExecutionTime: execTimeCount > 0 ? totalExecutionTime / execTimeCount : 0,
    slowestStep: slowest,
    fastestStep: fastest,
    totalScreenshots,
    totalNetworkRequests,
  };
}

/**
 * Gets detailed step performance breakdown for all steps.
 */
export function getStepPerformanceBreakdown(
  testRun: TestRun
): StepPerformance[] {
  const breakdown: StepPerformance[] = [];

  for (const featureResult of testRun.features) {
    for (const scenarioResult of featureResult.scenarios) {
      for (const stepResult of scenarioResult.steps) {
        if (stepResult.status === "skipped") continue;

        breakdown.push({
          step: `${stepResult.step.keyword} ${stepResult.step.text}`,
          scenario: scenarioResult.scenario.name,
          duration: stepResult.duration,
          aiTime: stepResult.metrics?.aiThinkTime || 0,
          execTime: stepResult.metrics?.executionTime || 0,
        });
      }
    }
  }

  return breakdown;
}

/**
 * Formats duration in milliseconds to human-readable string.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Generates a text-based performance report.
 */
export function generatePerformanceReport(testRun: TestRun): string {
  const summary = analyzePerformance(testRun);
  const breakdown = getStepPerformanceBreakdown(testRun);

  const lines: string[] = [];

  lines.push("\n");
  lines.push("Performance Summary");
  lines.push("==================");
  lines.push(`Total Duration: ${formatDuration(summary.totalDuration)}`);
  lines.push(`Average Step Duration: ${formatDuration(summary.avgStepDuration)}`);

  if (summary.slowestStep) {
    lines.push(
      `Slowest Step: "${summary.slowestStep.step}" (${formatDuration(summary.slowestStep.duration)})`
    );
  }

  if (summary.fastestStep) {
    lines.push(
      `Fastest Step: "${summary.fastestStep.step}" (${formatDuration(summary.fastestStep.duration)})`
    );
  }

  lines.push(`Average AI Think Time: ${formatDuration(summary.avgAiThinkTime)}`);
  lines.push(
    `Average Execution Time: ${formatDuration(summary.avgExecutionTime)}`
  );

  if (summary.totalScreenshots > 0) {
    lines.push(`Total Screenshots: ${summary.totalScreenshots}`);
  }

  if (summary.totalNetworkRequests > 0) {
    lines.push(`Total Network Requests: ${summary.totalNetworkRequests}`);
  }

  // Generate step performance table
  if (breakdown.length > 0) {
    lines.push("\n");
    lines.push("Step Performance Breakdown:");
    lines.push(
      "┌─────────────────────────────────┬──────────┬──────────┬──────────┐"
    );
    lines.push(
      "│ Step                            │ Duration │ AI Time  │ Exec Time│"
    );
    lines.push(
      "├─────────────────────────────────┼──────────┼──────────┼──────────┤"
    );

    // Show top 10 slowest steps
    const topSteps = breakdown
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    for (const step of topSteps) {
      const stepText = step.step.length > 31 ? step.step.slice(0, 28) + "..." : step.step;
      lines.push(
        `│ ${stepText.padEnd(31)} │ ${formatDuration(step.duration).padStart(8)} │ ${formatDuration(step.aiTime).padStart(8)} │ ${formatDuration(step.execTime).padStart(8)} │`
      );
    }

    lines.push(
      "└─────────────────────────────────┴──────────┴──────────┴──────────┘"
    );
  }

  return lines.join("\n");
}

/**
 * Compares current performance with baseline and returns trend indicators.
 */
export function comparePerformance(
  current: PerformanceSummary,
  baseline: PerformanceSummary
): {
  totalDurationChange: number;
  avgStepDurationChange: number;
  trend: "improved" | "degraded" | "stable";
} {
  const threshold = 0.05; // 5% threshold for stability

  const totalDurationChange =
    baseline.totalDuration > 0
      ? (current.totalDuration - baseline.totalDuration) / baseline.totalDuration
      : 0;

  const avgStepDurationChange =
    baseline.avgStepDuration > 0
      ? (current.avgStepDuration - baseline.avgStepDuration) /
        baseline.avgStepDuration
      : 0;

  let trend: "improved" | "degraded" | "stable" = "stable";
  if (totalDurationChange < -threshold || avgStepDurationChange < -threshold) {
    trend = "improved";
  } else if (
    totalDurationChange > threshold ||
    avgStepDurationChange > threshold
  ) {
    trend = "degraded";
  }

  return {
    totalDurationChange,
    avgStepDurationChange,
    trend,
  };
}
