export { feature } from "./dsl.js";
export { configure, test, testOnly, run } from "./runner.js";
export { CopilotTestRuntime } from "./runtime.js";
export { webPlatform } from "./platforms/web.js";
export { apiPlatform } from "./platforms/api.js";
export { mobilePlatform } from "./platforms/mobile.js";
export { DebugController } from "./debug.js";
export {
  defineStep,
  clearStepDefinitions,
  getStepDefinitions,
} from "./step-registry.js";

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
  StepContext,
  StepDefinition,
  StepDefinitionHandler,
} from "./types.js";
export type { DebugContext, DebugCommand, DebugAction } from "./debug.js";
