/**
 * Supported platform types for test execution.
 * - web: Browser-based testing via Playwright
 * - mobile: Mobile app testing via Android emulator
 * - api: REST API testing via curl
 * - desktop: Desktop application testing
 */
export type Platform = "web" | "mobile" | "api" | "desktop";

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
  /** Number of times to retry failed scenarios */
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
  /** Visual regression testing configuration */
  visualRegression?: {
    /** Enable visual regression testing */
    enabled: boolean;
    /** Difference tolerance as a percentage (0-100) */
    threshold: number;
    /** Directory for storing baseline images */
    baselineDir: string;
    /** Directory for storing diff images */
    diffDir: string;
    /** Comparison algorithm to use */
    algorithm?: "pixel" | "perceptual" | "ssim";
  };
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
