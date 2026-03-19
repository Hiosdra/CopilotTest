/**
 * Supported platform types for test execution.
 * - web: Browser-based testing via Playwright
 * - mobile: Mobile app testing via Android emulator
 * - api: REST API testing via curl
 * - desktop: Desktop application testing
 */
export type Platform = "web" | "mobile" | "api" | "desktop";

/**
 * Retry strategy types for backoff behavior.
 * - fixed: Wait a constant delay between retries
 * - exponential: Double the delay each time (with optional cap)
 * - custom: Use a custom delay function
 */
export type RetryStrategy = "fixed" | "exponential" | "custom";

/**
 * Custom function to determine whether a step should be retried.
 * @param error - The error that occurred
 * @param attempt - The current attempt number (1-indexed)
 * @returns True if the step should be retried, false otherwise
 */
export type ShouldRetryFn = (error: Error | string, attempt: number) => boolean;

/**
 * Custom function to calculate retry delay.
 * @param attempt - The current attempt number (1-indexed)
 * @returns Delay in milliseconds before the next retry
 */
export type DelayFn = (attempt: number) => number;

/**
 * Configuration for retry and error recovery behavior.
 */
export interface RetryConfig {
  /** Enable retry functionality */
  enabled?: boolean;
  /** Number of times to retry individual steps (default: 0) */
  stepRetries?: number;
  /** Delay between step retries in milliseconds (for fixed strategy, default: 1000) */
  stepRetryDelay?: number;
  /** Number of times to retry entire scenarios (default: 0) */
  scenarioRetries?: number;
  /** Retry strategy: fixed, exponential, or custom */
  strategy?: RetryStrategy;
  /** Initial delay for exponential backoff (default: 1000ms) */
  initialDelay?: number;
  /** Maximum delay cap for exponential backoff (default: 10000ms) */
  maxDelay?: number;
  /** Backoff multiplier for exponential strategy (default: 2) */
  backoffFactor?: number;
  /** Array of error messages/patterns to retry on (strings or RegExp) */
  retryOn?: Array<string | RegExp>;
  /** Array of error messages/patterns to skip retry on (strings or RegExp) */
  skipRetryOn?: Array<string | RegExp>;
  /** Custom function to determine if retry should happen */
  shouldRetry?: ShouldRetryFn;
  /** Custom function to calculate retry delay */
  delayFn?: DelayFn;
  /** Track and report flaky tests that pass only after retries */
  trackFlaky?: boolean;
  /** Number of retries required to consider a test flaky (default: 2) */
  flakyThreshold?: number;
  /** Callback when a flaky test is detected */
  onFlakyDetected?: (scenarioName: string, attempts: number) => void;
}

/**
 * BDD step keywords from Gherkin syntax.
 */
export type StepKeyword = "Given" | "When" | "Then" | "And" | "But";

/**
 * Represents a single test step in a scenario.
 */
export interface Step {
  /** The keyword indicating the step type (Given, When, Then, And, But) */
  keyword: StepKeyword;
  /** The text description of the step */
  text: string;
  /** Optional data table attached to the step */
  table?: string[][];
  /** Optional multi-line string (doc string) attached to the step */
  docString?: string;
}

/**
 * Context provided to custom step definitions during execution.
 */
export interface StepContext {
  /** The Copilot SDK session (if available) */
  session?: unknown;
  /** The feature being executed */
  feature?: Feature;
  /** The scenario being executed */
  scenario?: Scenario;
  /** The step being executed */
  step: Step;
  /** The platform configuration */
  platform?: PlatformConfig;
  /** Shared scenario context for cross-step state */
  scenarioContext?: ScenarioContext;
}

/**
 * Handler function for custom step definitions.
 * @param context - The step execution context
 * @param matches - Captured groups from the regex pattern
 */
export type StepDefinitionHandler = (
  context: StepContext,
  ...matches: Array<string | undefined>
) => Promise<void> | void;

/**
 * Defines a custom step implementation with a regex pattern and handler.
 */
export interface StepDefinition {
  /** Regular expression to match step text */
  pattern: RegExp;
  /** Handler function to execute when pattern matches */
  handler: StepDefinitionHandler;
}

/**
 * Represents a test scenario with steps and optional examples.
 */
export interface Scenario {
  /** Name of the scenario */
  name: string;
  /** Tags for filtering and categorization */
  tags: string[];
  /** Steps to execute in the scenario */
  steps: Step[];
  /** Examples for scenario outlines (data-driven testing) */
  examples?: Record<string, string>[];
  /** Whether this is a scenario outline */
  isOutline?: boolean;
  /** Enable debug mode for this scenario */
  debugMode?: boolean;
}

/**
 * Represents a test feature containing multiple scenarios.
 */
export interface Feature {
  /** Name of the feature */
  name: string;
  /** Optional description of the feature */
  description?: string;
  /** Tags for filtering and categorization */
  tags: string[];
  /** Background steps executed before each scenario */
  background?: Step[];
  /** Scenarios in this feature */
  scenarios: Scenario[];
}

/**
 * Configuration for an MCP (Model Context Protocol) server.
 */
export interface McpServerConfig {
  /** Type of MCP server connection */
  type: "stdio" | "sse" | "http";
  /** Command to execute for stdio servers */
  command?: string;
  /** Arguments for the command */
  args?: string[];
  /** URL for SSE or HTTP servers */
  url?: string;
  /** HTTP headers for SSE/HTTP servers */
  headers?: Record<string, string>;
  /** Environment variables for the server process */
  env?: Record<string, string>;
  /** Working directory for the server process */
  cwd?: string;
  /** Specific tools to enable from this server */
  tools?: string[];
  /** Connection timeout in milliseconds */
  timeout?: number;
}

/**
 * Platform-specific configuration for test execution.
 */
export interface PlatformConfig {
  /** Platform type (web, mobile, api, desktop) */
  platform: Platform;
  /** MCP server configuration for this platform */
  mcpServer: McpServerConfig;
  /** Additional context/instructions for the AI agent */
  systemContext?: string;
}

/**
 * Main configuration for CopilotTest framework.
 */
export interface CopilotTestConfig {
  /** AI model to use (default: gpt-4o) */
  model?: string;
  /** Platform configurations keyed by platform name */
  platforms: Record<string, PlatformConfig>;
  /** Base URL for web tests */
  baseUrl?: string;
  /** Timeout per step in milliseconds */
  stepTimeout?: number;
  /** Number of times to retry failed scenarios (deprecated: use retry.scenarioRetries) */
  retries?: number;
  /** Capture screenshots on test failure */
  screenshotOnFailure?: boolean;
  /** Directory for test reports and artifacts */
  outputDir?: string;
  /** Additional MCP servers to connect */
  mcpServers?: Record<string, McpServerConfig>;
  /** AI reasoning effort level */
  reasoningEffort?: "low" | "medium" | "high";
  /** Enable global debug mode */
  debugMode?: boolean;
  /** Breakpoints for debug mode (step text patterns) */
  breakpoints?: string[];
  /** Enable interactive debug console */
  interactive?: boolean;
  /** Use custom step definitions instead of AI */
  useCustomStepDefinitions?: boolean;
  /** Enable parallel scenario execution */
  parallel?: boolean;
  /** Number of parallel workers (or 'auto' for CPU-based) */
  maxWorkers?: number | "auto";
  /** Timeout per worker in milliseconds */
  workerTimeout?: number;
  /** Stop all workers on first failure */
  failFast?: boolean;
  /** Retry and error recovery configuration */
  retry?: RetryConfig;
}

/**
 * Information about a single retry attempt.
 */
export interface RetryAttempt {
  /** Attempt number (1-indexed) */
  attemptNumber: number;
  /** Status of this attempt */
  status: "passed" | "failed" | "skipped" | "pending";
  /** Duration of this attempt in milliseconds */
  duration: number;
  /** Error message if failed */
  error?: string;
}

/**
 * Result of executing a single step.
 */
export interface StepResult {
  /** The step that was executed */
  step: Step;
  /** Execution status */
  status: "passed" | "failed" | "skipped" | "pending";
  /** Time taken to execute in milliseconds */
  duration: number;
  /** Error message if failed */
  error?: string;
  /** Path to screenshot if captured */
  screenshot?: string;
  /** AI reasoning for the step execution */
  aiReasoning?: string;
  /** Context updates from this step */
  contextUpdates?: Record<string, unknown>;
  /** Number of retry attempts made (0 if passed on first try) */
  retryCount?: number;
  /** Details of each retry attempt */
  retryAttempts?: RetryAttempt[];
}

/**
 * Result of executing a scenario.
 */
export interface ScenarioResult {
  /** The scenario that was executed */
  scenario: Scenario;
  /** Overall status of the scenario */
  status: "passed" | "failed" | "skipped";
  /** Results of individual steps */
  steps: StepResult[];
  /** Total duration in milliseconds */
  duration: number;
}

/**
 * Result of executing a feature.
 */
export interface FeatureResult {
  /** The feature that was executed */
  feature: Feature;
  /** Results of scenarios in the feature */
  scenarios: ScenarioResult[];
  /** Total duration in milliseconds */
  duration: number;
}

/**
 * Metadata about the test run environment and execution.
 */
export interface TestRunMetadata {
  /** ISO timestamp of test run start */
  timestamp: string;
  /** Total duration in milliseconds */
  duration: number;
  /** Environment name (e.g., 'staging', 'production') */
  environment?: string;
  /** Git information */
  git?: {
    /** Git branch name */
    branch?: string;
    /** Commit SHA */
    commit?: string;
    /** Commit author */
    author?: string;
  };
  /** CI/CD information */
  ci?: {
    /** Build number */
    buildNumber?: string;
    /** URL to CI job */
    jobUrl?: string;
  };
}

/**
 * Complete test run results.
 */
export interface TestRun {
  /** When the test run started */
  startedAt: Date;
  /** When the test run finished */
  finishedAt?: Date;
  /** Results of all features executed */
  features: FeatureResult[];
  /** Aggregate summary statistics */
  summary: {
    /** Total number of scenarios */
    total: number;
    /** Number of passed scenarios */
    passed: number;
    /** Number of failed scenarios */
    failed: number;
    /** Number of skipped scenarios */
    skipped: number;
  };
  /** Test run metadata */
  metadata?: TestRunMetadata;
}

/**
 * Manages shared state across steps within a scenario.
 * Allows steps to store and retrieve data during test execution.
 */
export class ScenarioContext {
  private data: Map<string, unknown>;

  constructor() {
    this.data = new Map();
  }

  /**
   * Store a value in the context.
   * @param key - The key to store the value under
   * @param value - The value to store
   */
  set(key: string, value: unknown): void {
    this.data.set(key, value);
  }

  /**
   * Retrieve a value from the context.
   * @param key - The key to retrieve
   * @returns The stored value, or undefined if not found
   */
  get<T = unknown>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  /**
   * Check if a key exists in the context.
   * @param key - The key to check
   * @returns True if the key exists, false otherwise
   */
  has(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * Remove a key from the context.
   * @param key - The key to remove
   * @returns True if the key was removed, false if it didn't exist
   */
  delete(key: string): boolean {
    return this.data.delete(key);
  }

  /**
   * Clear all data from the context.
   */
  clear(): void {
    this.data.clear();
  }

  /**
   * Get all keys in the context.
   * @returns Array of all keys
   */
  keys(): string[] {
    return Array.from(this.data.keys());
  }

  /**
   * Convert the context to a plain JSON object.
   * @returns Plain object representation of the context
   */
  toJSON(): Record<string, unknown> {
    return Object.fromEntries(this.data.entries());
  }

  /**
   * Load context data from a plain JSON object.
   * Clears existing data before loading.
   * @param json - Plain object to load into context
   */
  fromJSON(json: Record<string, unknown>): void {
    this.data.clear();
    for (const [key, value] of Object.entries(json)) {
      this.data.set(key, value);
    }
  }
}
