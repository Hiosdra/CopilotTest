export { feature } from "./dsl.js";
export { configure, test, testOnly, run } from "./runner.js";
export { CopilotTestRuntime } from "./runtime.js";
export { webPlatform } from "./platforms/web.js";
export { apiPlatform } from "./platforms/api.js";
export { mobilePlatform } from "./platforms/mobile.js";
export { expect, AssertionError } from "./assertions/index.js";

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
} from "./types.js";

export type {
  Matchers,
  AsyncMatchers,
  WebMatchers,
  PageMatchers,
  Locator,
  Page,
} from "./assertions/index.js";
