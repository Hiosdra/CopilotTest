/**
 * Constants used throughout the CopilotTest framework
 * Centralizing these improves maintainability and consistency
 */

// Step statuses
export const StepStatus = {
  PASSED: "passed",
  FAILED: "failed",
  SKIPPED: "skipped",
  PENDING: "pending",
} as const;

export type StepStatusType = typeof StepStatus[keyof typeof StepStatus];

// Scenario statuses
export const ScenarioStatus = {
  PASSED: "passed",
  FAILED: "failed",
  SKIPPED: "skipped",
} as const;

export type ScenarioStatusType = typeof ScenarioStatus[keyof typeof ScenarioStatus];

// Icons for console output
export const Icons = {
  CHECK_MARK: "✔",
  CROSS_MARK: "✘",
  CHECK_EMOJI: "✅",
  CROSS_EMOJI: "❌",
  WARNING: "⚠",
  INFO: "ℹ",
} as const;

// Default timeouts (in milliseconds)
export const Timeouts = {
  STEP_EXECUTION: 30000, // 30 seconds
  SCENARIO_TIMEOUT: 300000, // 5 minutes
  SESSION_CLOSE: 5000, // 5 seconds
} as const;

// Retry defaults
export const RetryDefaults = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 10000, // 10 seconds
  BACKOFF_MULTIPLIER: 2,
} as const;

// Performance defaults
export const PerformanceDefaults = {
  WARN_THRESHOLD: 5000, // 5 seconds
  FAIL_THRESHOLD: 10000, // 10 seconds
} as const;

// Video recording defaults
export const VideoDefaults = {
  FORMAT: "webm",
  QUALITY: 80,
  FPS: 25,
} as const;

// Platform defaults
export const PlatformDefaults = {
  WEB_HEADLESS: true,
  WEB_VIEWPORT_WIDTH: 1280,
  WEB_VIEWPORT_HEIGHT: 720,
  MOBILE_DEVICE: "Pixel 5",
} as const;

// System messages and prompts
export const SystemMessages = {
  DEFAULT_SYSTEM_MESSAGE: `You are an AI testing assistant executing BDD test scenarios.
Your task is to interpret and execute test steps written in natural language.

IMPORTANT RULES:
1. You must respond with ONLY valid JSON in this exact format:
   {"status": "passed", "reasoning": "explanation"} OR
   {"status": "failed", "error": "error message", "reasoning": "explanation"}

2. Do not include ANY text before or after the JSON.
3. Do not use markdown code blocks or any formatting.
4. The response must be parseable as JSON.

When executing a step:
- If the step succeeds, return: {"status": "passed", "reasoning": "what you did"}
- If the step fails, return: {"status": "failed", "error": "what went wrong", "reasoning": "why it failed"}

The reasoning field should briefly explain what action was taken or attempted.`,
} as const;

// File paths and directories
export const Paths = {
  DEFAULT_REPORT_DIR: "copilot-test-reports",
  DEFAULT_SCREENSHOT_DIR: "screenshots",
  DEFAULT_VIDEO_DIR: "videos",
  DEFAULT_BASELINE_DIR: "tests/visual-baselines",
  DEFAULT_DIFF_DIR: "tests/visual-diffs",
} as const;

// Error messages
export const ErrorMessages = {
  SCENARIO_OUTLINE_REQUIRES_EXAMPLES: "Scenario outline requires examples",
  INVALID_STEP_RESPONSE: "Invalid step response format",
  SESSION_INITIALIZATION_FAILED: "Failed to initialize session",
  STEP_EXECUTION_TIMEOUT: "Step execution timed out",
} as const;
