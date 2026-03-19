export { feature } from "./dsl.js";
export { configure, test, testOnly, run, TestRunner, getEnvironment, getConfig } from "./runner.js";
export { CopilotTestRuntime } from "./runtime.js";
export { webPlatform } from "./platforms/web.js";
export { apiPlatform } from "./platforms/api.js";
export { mobilePlatform } from "./platforms/mobile.js";
export { DebugController } from "./debug.js";
export { compareTestRuns } from "./compare.js";
export { ScenarioContext } from "./types.js";
export {
  defineStep,
  clearStepDefinitions,
  getStepDefinitions,
} from "./step-registry.js";

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
  StepResult,
  ScenarioResult,
  FeatureResult,
  TestRun,
  TestRunMetadata,
  StepContext,
  StepDefinition,
  StepDefinitionHandler,
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


