export { feature } from "./dsl.js";
export { configure, test, testOnly, run, TestRunner, getEnvironment, getConfig, getDefaultRunner } from "./runner.js";
export { CopilotTestRuntime } from "./runtime.js";
export { webPlatform } from "./platforms/web.js";
export { apiPlatform } from "./platforms/api.js";
export { mobilePlatform } from "./platforms/mobile.js";
export { DebugController } from "./debug.js";
export { compareTestRuns } from "./compare.js";
export { ScenarioContext } from "./context.js";
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

// Export plugin system
export { PluginManager, definePlugin } from "./plugin-manager.js";

// Export new architectural modules
export { SessionManager, isMockSession, isClosableSession } from "./session-manager.js";
export { PromptBuilder } from "./prompt-builder.js";
export {
  errorToString,
  classifyError,
  shouldRetryError,
  formatErrorMessage,
  ErrorCategory,
} from "./error-utils.js";
export {
  StepStatus,
  ScenarioStatus,
  Icons,
  Timeouts,
  RetryDefaults,
  PerformanceDefaults,
  VideoDefaults,
  PlatformDefaults,
  SystemMessages,
  Paths,
  ErrorMessages,
} from "./constants.js";

// Export new architectural types
export type {
  Session,
  MockSession,
} from "./session-manager.js";

export type {
  ClassifiedError,
} from "./error-utils.js";

export type {
  StepStatusType,
  ScenarioStatusType,
} from "./constants.js";

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
  Plugin,
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
