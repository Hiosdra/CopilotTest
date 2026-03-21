/**
 * Factory functions for creating StepResult objects
 * Provides consistent error handling and result creation across the codebase
 */

import type { Step, StepResult, StepMetrics } from "../types.js";

/**
 * Creates a failed step result with consistent error handling
 * @param step The step that failed
 * @param error The error that occurred
 * @param duration Duration of the step execution in milliseconds
 * @param metrics Optional metrics for the step execution
 * @returns A StepResult object with status "failed"
 */
export function createFailedStepResult(
  step: Step,
  error: unknown,
  duration: number,
  metrics?: Partial<StepMetrics>
): StepResult {
  const result: StepResult = {
    step,
    status: "failed",
    duration,
    error: error instanceof Error ? error.message : String(error),
  };

  if (metrics) {
    result.metrics = metrics as StepMetrics;
  }

  return result;
}

/**
 * Creates a passed step result
 * @param step The step that passed
 * @param duration Duration of the step execution in milliseconds
 * @param aiReasoning Optional AI reasoning for the step
 * @param metrics Optional metrics for the step execution
 * @returns A StepResult object with status "passed"
 */
export function createPassedStepResult(
  step: Step,
  duration: number,
  aiReasoning?: string,
  metrics?: Partial<StepMetrics>
): StepResult {
  const result: StepResult = {
    step,
    status: "passed",
    duration,
  };

  if (aiReasoning) {
    result.aiReasoning = aiReasoning;
  }

  if (metrics) {
    result.metrics = metrics as StepMetrics;
  }

  return result;
}

/**
 * Creates a skipped step result
 * @param step The step that was skipped
 * @returns A StepResult object with status "skipped"
 */
export function createSkippedStepResult(step: Step): StepResult {
  return {
    step,
    status: "skipped",
    duration: 0,
  };
}
