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

// Export all types
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

// Export builder types for advanced usage
export type {
  FeatureBuilder,
  ScenarioBuilder,
  ScenarioOutlineBuilder,
  BackgroundBuilder,
} from "./dsl.js";

// Export debug types
export type { DebugContext, DebugCommand, DebugAction } from "./debug.js";

// Export utility types
export type {
  AsyncStep,
  SyncStep,
  StepFunction,
  StepMatcher,
  StepHandler,
  DeepPartial,
  RequireAtLeastOne,
  RequireKeys,
  Mutable,
  DataOnly,
  EventMap,
  EventKey,
  EventPayload,
} from "./utility-types.js";

// Export performance types
export type {
  PerformanceSummary,
  StepPerformance,
} from "./performance.js";
