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
export {
  createAccessibilityTester,
  defaultAccessibilityConfig,
} from "./a11y.js";

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
export type { DebugContext, DebugCommand, DebugAction } from "./debug.js";
export type {
  AccessibilityConfig,
  AccessibilityScanResult,
  AccessibilityViolation,
  AccessibilityNode,
  WCAGStandard,
  ViolationLevel,
  ScanOptions,
  KeyboardNavigationResult,
  ColorContrastResult,
  HeadingStructure,
} from "./a11y.js";
