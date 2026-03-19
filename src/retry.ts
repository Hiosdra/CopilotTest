import type { RetryConfig, RetryStrategy } from "./types.js";

/**
 * Default retry configuration values.
 */
export const DEFAULT_RETRY_CONFIG: Required<Omit<RetryConfig, 'shouldRetry' | 'delayFn' | 'onFlakyDetected' | 'retryOn' | 'skipRetryOn'>> = {
  enabled: false,
  stepRetries: 0,
  stepRetryDelay: 1000,
  scenarioRetries: 0,
  strategy: "fixed",
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  trackFlaky: false,
  flakyThreshold: 2,
};

/**
 * Calculate the delay before the next retry attempt.
 * @param attempt - The current attempt number (1-indexed)
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 */
export function calculateRetryDelay(attempt: number, config: RetryConfig): number {
  // Use custom delay function if provided
  if (config.delayFn) {
    return config.delayFn(attempt);
  }

  const strategy = config.strategy ?? DEFAULT_RETRY_CONFIG.strategy;

  switch (strategy) {
    case "exponential": {
      const initialDelay = config.initialDelay ?? DEFAULT_RETRY_CONFIG.initialDelay;
      const backoffFactor = config.backoffFactor ?? DEFAULT_RETRY_CONFIG.backoffFactor;
      const maxDelay = config.maxDelay ?? DEFAULT_RETRY_CONFIG.maxDelay;

      // Calculate exponential delay: initialDelay * (backoffFactor ^ (attempt - 1))
      const delay = initialDelay * Math.pow(backoffFactor, attempt - 1);

      // Cap at maxDelay
      return Math.min(delay, maxDelay);
    }

    case "custom":
      // Custom strategy without delayFn defaults to fixed
      return config.stepRetryDelay ?? DEFAULT_RETRY_CONFIG.stepRetryDelay;

    case "fixed":
    default:
      return config.stepRetryDelay ?? DEFAULT_RETRY_CONFIG.stepRetryDelay;
  }
}

/**
 * Check if an error matches a pattern (string or RegExp).
 * @param error - The error message or Error object
 * @param pattern - String or RegExp to match against
 * @returns True if the error matches the pattern
 */
function matchesPattern(error: string | Error, pattern: string | RegExp): boolean {
  const errorMessage = typeof error === "string" ? error : error.message;

  if (typeof pattern === "string") {
    return errorMessage.toLowerCase().includes(pattern.toLowerCase());
  }

  // RegExp pattern
  return pattern.test(errorMessage);
}

/**
 * Determine if a step should be retried based on the error and configuration.
 * @param error - The error that occurred
 * @param attempt - The current attempt number (1-indexed)
 * @param config - Retry configuration
 * @param maxRetries - Maximum number of retries allowed
 * @returns True if the step should be retried
 */
export function shouldRetryStep(
  error: string | Error,
  attempt: number,
  config: RetryConfig,
  maxRetries: number
): boolean {
  // Check if we've exceeded max retries first (global limit)
  if (attempt > maxRetries) {
    return false;
  }

  // Use custom shouldRetry function if provided
  // Custom function has full control and can implement its own logic
  if (config.shouldRetry) {
    return config.shouldRetry(error, attempt);
  }

  // Check skipRetryOn patterns first (these take precedence)
  if (config.skipRetryOn && config.skipRetryOn.length > 0) {
    for (const pattern of config.skipRetryOn) {
      if (matchesPattern(error, pattern)) {
        return false;
      }
    }
  }

  // Check retryOn patterns (if specified, only retry on these)
  if (config.retryOn && config.retryOn.length > 0) {
    for (const pattern of config.retryOn) {
      if (matchesPattern(error, pattern)) {
        return true;
      }
    }
    // If retryOn is specified but no pattern matched, don't retry
    return false;
  }

  // Default: retry if not explicitly skipped
  return true;
}

/**
 * Sleep for a specified duration.
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after the delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a test is considered flaky based on retry attempts.
 * @param retryCount - Number of retries that were needed
 * @param config - Retry configuration
 * @returns True if the test is considered flaky
 */
export function isFlaky(retryCount: number, config: RetryConfig): boolean {
  if (!config.trackFlaky) {
    return false;
  }

  const threshold = config.flakyThreshold ?? DEFAULT_RETRY_CONFIG.flakyThreshold;
  return retryCount >= threshold;
}

/**
 * Report a flaky test if configured.
 * @param scenarioName - Name of the scenario
 * @param attempts - Total number of attempts (including successful one)
 * @param config - Retry configuration
 */
export function reportFlakyTest(
  scenarioName: string,
  attempts: number,
  config: RetryConfig
): void {
  if (config.onFlakyDetected) {
    config.onFlakyDetected(scenarioName, attempts);
  } else {
    // Default logging
    console.warn(
      `⚠️  Flaky test detected: "${scenarioName}" passed on attempt ${attempts} (after ${attempts - 1} retries)`
    );
  }
}
