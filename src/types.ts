export type Platform = "web" | "mobile" | "api" | "desktop";

export type StepKeyword = "Given" | "When" | "Then" | "And" | "But";

export interface Step {
  keyword: StepKeyword;
  text: string;
  table?: string[][];
  docString?: string;
}

export interface Scenario {
  name: string;
  tags: string[];
  steps: Step[];
  examples?: { headers: string[]; rows: string[][] };
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
}

export interface StepResult {
  step: Step;
  status: "passed" | "failed" | "skipped" | "pending";
  duration: number;
  error?: string;
  screenshot?: string;
  aiReasoning?: string;
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
