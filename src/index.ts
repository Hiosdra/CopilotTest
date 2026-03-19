export { feature } from "./dsl.js";
export { configure, test, testOnly, run, TestRunner, getEnvironment, getConfig, getDefaultRunner } from "./runner.js";
export { CopilotTestRuntime } from "./runtime.js";
export { webPlatform } from "./platforms/web.js";
export { apiPlatform } from "./platforms/api.js";
export { mobilePlatform } from "./platforms/mobile.js";
export { DebugController } from "./debug.js";
export { compareTestRuns } from "./compare.js";
export { ScenarioContext } from "./types.js";
export { startWatchMode, WatchMode } from "./watch.js";
export {
  defineStep,
  clearStepDefinitions,
  getStepDefinitions,
} from "./step-registry.js";
export {
  calculateRetryDelay,
  shouldRetryStep,
  isFlaky,
  reportFlakyTest,
  DEFAULT_RETRY_CONFIG,
} from "./retry.js";
export {
  analyzePerformance,
  getStepPerformanceBreakdown,
  generatePerformanceReport,
  comparePerformance,
  formatDuration,
} from "./performance.js";

export type {
  Platform,
  StepKeyword,
  Step,
  Scenario,
  Feature,
  PlatformConfig,
  McpServerConfig,
  CopilotTestConfig,
  WatchConfig,
  StepResult,
  ScenarioResult,
  FeatureResult,
  TestRun,
  TestRunMetadata,
  StepContext,
  StepDefinition,
  StepDefinitionHandler,
  RetryConfig,
  RetryStrategy,
  RetryAttempt,
  ShouldRetryFn,
  DelayFn,
  PerformanceConfig,
  StepMetrics,
  ResourceMetrics,
} from "./types.js";
export type { DebugContext, DebugCommand, DebugAction } from "./debug.js";
export type {
  PerformanceSummary,
  StepPerformance,
} from "./performance.js";
