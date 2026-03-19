export type Platform = "web" | "mobile" | "api" | "desktop";

export type StepKeyword = "Given" | "When" | "Then" | "And" | "But";

export interface Step {
  keyword: StepKeyword;
  text: string;
  table?: string[][];
  docString?: string;
}

export interface StepContext {
  session?: unknown;
  feature?: Feature;
  scenario?: Scenario;
  step: Step;
  platform?: PlatformConfig;
}

export type StepDefinitionHandler = (
  context: StepContext,
  ...matches: Array<string | undefined>
) => Promise<void> | void;

export interface StepDefinition {
  pattern: RegExp;
  handler: StepDefinitionHandler;
}

export interface Scenario {
  name: string;
  tags: string[];
  steps: Step[];
  examples?: Record<string, string>[];
  isOutline?: boolean;
}

export interface Feature {
  name: string;
  description?: string;
  tags: string[];
  background?: Step[];
  scenarios: Scenario[];
}

export interface McpServerConfig {
  type: "stdio" | "sse" | "http";
  command?: string;
  args?: string[];
  url?: string;
  headers?: Record<string, string>;
  env?: Record<string, string>;
  cwd?: string;
  tools?: string[];
  timeout?: number;
}

export interface PlatformConfig {
  platform: Platform;
  mcpServer: McpServerConfig;
  systemContext?: string;
}

export interface CopilotTestConfig {
  model?: string;
  platforms: Record<string, PlatformConfig>;
  baseUrl?: string;
  stepTimeout?: number;
  retries?: number;
  screenshotOnFailure?: boolean;
  outputDir?: string;
  mcpServers?: Record<string, McpServerConfig>;
  reasoningEffort?: "low" | "medium" | "high";
  useCustomStepDefinitions?: boolean;
  parallel?: boolean;
  maxWorkers?: number | "auto";
  workerTimeout?: number;
  failFast?: boolean;
}

export interface StepResult {
  step: Step;
  status: "passed" | "failed" | "skipped" | "pending";
  duration: number;
  error?: string;
  screenshot?: string;
  aiReasoning?: string;
  contextUpdates?: Record<string, unknown>;
}

export interface ScenarioResult {
  scenario: Scenario;
  status: "passed" | "failed" | "skipped";
  steps: StepResult[];
  duration: number;
}

export interface FeatureResult {
  feature: Feature;
  scenarios: ScenarioResult[];
  duration: number;
}

export interface TestRun {
  startedAt: Date;
  finishedAt?: Date;
  features: FeatureResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

export class ScenarioContext {
  private data: Map<string, unknown>;

  constructor() {
    this.data = new Map();
  }

  set(key: string, value: unknown): void {
    this.data.set(key, value);
  }

  get<T = unknown>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  delete(key: string): boolean {
    return this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  keys(): string[] {
    return Array.from(this.data.keys());
  }

  toJSON(): Record<string, unknown> {
    return Object.fromEntries(this.data.entries());
  }

  fromJSON(json: Record<string, unknown>): void {
    this.data.clear();
    for (const [key, value] of Object.entries(json)) {
      this.data.set(key, value);
    }
  }
}
