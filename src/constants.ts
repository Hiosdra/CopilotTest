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
  DEFAULT_SYSTEM_MESSAGE: `You are an autonomous QA testing agent.
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

**Always think:** "Will any data from this step be needed later? If yes, store it in context with a clear name."`,
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
