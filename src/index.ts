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

// Test data management exports
export {
  defineFixture,
  getFixture,
  loadFixtures,
  clearFixtures,
  listFixtures,
  createFixtureRegistry,
} from "./fixtures.js";

export {
  defineFactory,
  faker,
  type Factory,
  type FactoryDefinition,
  type FactoryContext,
} from "./factory.js";

export {
  seed,
  registerSeedHandler,
  registerDefaultSeedHandler,
  clearSeedHandlers,
  type SeedData,
  type SeedHandler,
} from "./seed.js";

export {
  mockApi,
  createMockApi,
  type MockResponse,
  type MockRoute,
  type HttpMethod,
} from "./mock.js";

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
  HookContext,
  HookHandler,
  LifecycleHooks,
} from "./types.js";
export type { DebugContext, DebugCommand, DebugAction } from "./debug.js";
export type { FixtureData } from "./fixtures.js";
