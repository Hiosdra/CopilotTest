import { feature, configure, run, definePlugin, type Plugin } from "../src/index.js";
import { webPlatform } from "../src/platforms/web.js";
import { TestRunner } from "../src/runner.js";
import type {
  CopilotTestConfig,
  Feature,
  Scenario,
  Step,
  StepResult,
  ScenarioResult,
  FeatureResult,
  TestRun
} from "../src/types.js";

// Test harness
const results: { name: string; passed: boolean; error?: string }[] = [];

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function section(name: string, fn: () => void | Promise<void>): void {
  results.push({ name: `📦 ${name}`, passed: true });
}

async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    results.push({ name: `  ✔ PASS: ${name}`, passed: true });
  } catch (err) {
    results.push({
      name: `  ✘ FAIL: ${name}`,
      passed: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// Plugin System Tests
section("Plugin System — Basic Plugin Creation", () => {});

await test("definePlugin creates a plugin", async () => {
  const plugin = definePlugin({
    name: "test-plugin",
    onTestRunStart: () => {},
  });

  assert(plugin.name === "test-plugin", "Plugin has correct name");
  assert(typeof plugin.onTestRunStart === "function", "Plugin has onTestRunStart hook");
});

await test("plugin can be created with all lifecycle hooks", async () => {
  const plugin = definePlugin({
    name: "full-plugin",
    onTestRunStart: () => {},
    onFeatureStart: () => {},
    onScenarioStart: () => {},
    onStepStart: () => {},
    onStepEnd: () => {},
    onScenarioEnd: () => {},
    onFeatureEnd: () => {},
    onTestRunEnd: () => {},
  });

  assert(plugin.name === "full-plugin", "Plugin has correct name");
  assert(typeof plugin.onTestRunStart === "function", "Has onTestRunStart");
  assert(typeof plugin.onFeatureStart === "function", "Has onFeatureStart");
  assert(typeof plugin.onScenarioStart === "function", "Has onScenarioStart");
  assert(typeof plugin.onStepStart === "function", "Has onStepStart");
  assert(typeof plugin.onStepEnd === "function", "Has onStepEnd");
  assert(typeof plugin.onScenarioEnd === "function", "Has onScenarioEnd");
  assert(typeof plugin.onFeatureEnd === "function", "Has onFeatureEnd");
  assert(typeof plugin.onTestRunEnd === "function", "Has onTestRunEnd");
});

section("Plugin System — Plugin Manager", () => {});

await test("PluginManager can register plugins", async () => {
  const { PluginManager } = await import("../src/plugin-manager.js");
  const manager = new PluginManager();

  const plugin1 = definePlugin({ name: "plugin1" });
  const plugin2 = definePlugin({ name: "plugin2" });

  manager.register(plugin1);
  manager.register(plugin2);

  const plugins = manager.getPlugins();
  assert(plugins.length === 2, "Manager has 2 plugins");
  assert(plugins[0].name === "plugin1", "First plugin is plugin1");
  assert(plugins[1].name === "plugin2", "Second plugin is plugin2");
});

await test("PluginManager prevents duplicate plugin names", async () => {
  const { PluginManager } = await import("../src/plugin-manager.js");
  const manager = new PluginManager();

  const plugin1 = definePlugin({ name: "duplicate" });
  const plugin2 = definePlugin({ name: "duplicate" });

  manager.register(plugin1);

  let errorThrown = false;
  try {
    manager.register(plugin2);
  } catch (err) {
    errorThrown = true;
    assert(
      (err as Error).message.includes("already registered"),
      "Error message mentions already registered"
    );
  }

  assert(errorThrown, "Error was thrown for duplicate name");
});

await test("PluginManager can clear all plugins", async () => {
  const { PluginManager } = await import("../src/plugin-manager.js");
  const manager = new PluginManager();

  manager.register(definePlugin({ name: "plugin1" }));
  manager.register(definePlugin({ name: "plugin2" }));

  assert(manager.getPlugins().length === 2, "Manager has 2 plugins before clear");

  manager.clear();

  assert(manager.getPlugins().length === 0, "Manager has no plugins after clear");
});

section("Plugin System — Plugin Execution", () => {});

await test("plugins receive onTestRunStart hook", async () => {
  let receivedConfig: CopilotTestConfig | null = null;

  const testPlugin = definePlugin({
    name: "start-plugin",
    onTestRunStart: (config) => {
      receivedConfig = config;
    },
  });

  const runner = new TestRunner();
  runner.configure({
    platforms: { web: webPlatform({ headless: true }) },
    plugins: [testPlugin],
  });

  const testFeature = feature("Test Feature")
    .scenario("Test Scenario")
    .given("a test step")
    .done()
    ._build();

  runner.test(testFeature, "web");

  await runner.run();

  assert(receivedConfig !== null, "Plugin received config");
  assert(receivedConfig?.platforms !== undefined, "Config has platforms");
});

await test("plugins receive onTestRunEnd hook", async () => {
  let receivedResults: TestRun | null = null;

  const endPlugin = definePlugin({
    name: "end-plugin",
    onTestRunEnd: (results) => {
      receivedResults = results;
    },
  });

  const runner = new TestRunner();
  runner.configure({
    platforms: { web: webPlatform({ headless: true }) },
    plugins: [endPlugin],
  });

  const testFeature = feature("Test Feature")
    .scenario("Test Scenario")
    .given("a test step")
    .done()
    ._build();

  runner.test(testFeature, "web");

  await runner.run();

  assert(receivedResults !== null, "Plugin received results");
  assert(receivedResults?.summary !== undefined, "Results have summary");
  assert(receivedResults?.features.length === 1, "Results have 1 feature");
});

await test("plugins receive onFeatureStart hook", async () => {
  let receivedFeature: Feature | null = null;

  const featurePlugin = definePlugin({
    name: "feature-plugin",
    onFeatureStart: (feature) => {
      receivedFeature = feature;
    },
  });

  const runner = new TestRunner();
  runner.configure({
    platforms: { web: webPlatform({ headless: true }) },
    plugins: [featurePlugin],
  });

  const testFeature = feature("My Test Feature")
    .scenario("Test Scenario")
    .given("a test step")
    .done()
    ._build();

  runner.test(testFeature, "web");

  await runner.run();

  assert(receivedFeature !== null, "Plugin received feature");
  assert(receivedFeature?.name === "My Test Feature", "Feature has correct name");
});

await test("plugins receive onFeatureEnd hook with results", async () => {
  let receivedFeature: Feature | null = null;
  let receivedResult: FeatureResult | null = null;

  const featureEndPlugin = definePlugin({
    name: "feature-end-plugin",
    onFeatureEnd: (feature, result) => {
      receivedFeature = feature;
      receivedResult = result;
    },
  });

  const runner = new TestRunner();
  runner.configure({
    platforms: { web: webPlatform({ headless: true }) },
    plugins: [featureEndPlugin],
  });

  const testFeature = feature("My Test Feature")
    .scenario("Test Scenario")
    .given("a test step")
    .done()
    ._build();

  runner.test(testFeature, "web");

  await runner.run();

  assert(receivedFeature !== null, "Plugin received feature");
  assert(receivedResult !== null, "Plugin received result");
  assert(receivedResult?.scenarios.length === 1, "Result has 1 scenario");
  assert(typeof receivedResult?.duration === "number", "Result has duration");
});

await test("plugins receive onScenarioStart hook", async () => {
  let receivedScenario: Scenario | null = null;

  const scenarioPlugin = definePlugin({
    name: "scenario-plugin",
    onScenarioStart: (scenario) => {
      receivedScenario = scenario;
    },
  });

  const runner = new TestRunner();
  runner.configure({
    platforms: { web: webPlatform({ headless: true }) },
    plugins: [scenarioPlugin],
  });

  const testFeature = feature("Test Feature")
    .scenario("My Test Scenario")
    .given("a test step")
    .done()
    ._build();

  runner.test(testFeature, "web");

  await runner.run();

  assert(receivedScenario !== null, "Plugin received scenario");
  assert(receivedScenario?.name === "My Test Scenario", "Scenario has correct name");
});

await test("plugins receive onScenarioEnd hook with results", async () => {
  let receivedScenario: Scenario | null = null;
  let receivedResult: ScenarioResult | null = null;

  const scenarioEndPlugin = definePlugin({
    name: "scenario-end-plugin",
    onScenarioEnd: (scenario, result) => {
      receivedScenario = scenario;
      receivedResult = result;
    },
  });

  const runner = new TestRunner();
  runner.configure({
    platforms: { web: webPlatform({ headless: true }) },
    plugins: [scenarioEndPlugin],
  });

  const testFeature = feature("Test Feature")
    .scenario("My Test Scenario")
    .given("a test step")
    .done()
    ._build();

  runner.test(testFeature, "web");

  await runner.run();

  assert(receivedScenario !== null, "Plugin received scenario");
  assert(receivedResult !== null, "Plugin received result");
  assert(receivedResult?.status !== undefined, "Result has status");
  assert(receivedResult?.steps.length === 1, "Result has 1 step");
});

await test("plugins receive onStepStart hook", async () => {
  let receivedStep: Step | null = null;
  let stepCount = 0;

  const stepPlugin = definePlugin({
    name: "step-plugin",
    onStepStart: (step) => {
      receivedStep = step;
      stepCount++;
    },
  });

  const runner = new TestRunner();
  runner.configure({
    platforms: { web: webPlatform({ headless: true }) },
    plugins: [stepPlugin],
  });

  const testFeature = feature("Test Feature")
    .scenario("Test Scenario")
    .given("first step")
    .when("second step")
    .then("third step")
    .done()
    ._build();

  runner.test(testFeature, "web");

  await runner.run();

  assert(receivedStep !== null, "Plugin received step");
  assert(stepCount >= 1, "Plugin received at least 1 step");
});

await test("plugins receive onStepEnd hook with results", async () => {
  let receivedStep: Step | null = null;
  let receivedResult: StepResult | null = null;
  let stepCount = 0;

  const stepEndPlugin = definePlugin({
    name: "step-end-plugin",
    onStepEnd: (step, result) => {
      receivedStep = step;
      receivedResult = result;
      stepCount++;
    },
  });

  const runner = new TestRunner();
  runner.configure({
    platforms: { web: webPlatform({ headless: true }) },
    plugins: [stepEndPlugin],
  });

  const testFeature = feature("Test Feature")
    .scenario("Test Scenario")
    .given("first step")
    .when("second step")
    .done()
    ._build();

  runner.test(testFeature, "web");

  await runner.run();

  assert(receivedStep !== null, "Plugin received step");
  assert(receivedResult !== null, "Plugin received result");
  assert(receivedResult?.status !== undefined, "Result has status");
  assert(typeof receivedResult?.duration === "number", "Result has duration");
  assert(stepCount >= 1, "Plugin received at least 1 step");
});

section("Plugin System — Multiple Plugins", () => {});

await test("multiple plugins all receive hooks", async () => {
  const calls: string[] = [];

  const plugin1 = definePlugin({
    name: "plugin1",
    onTestRunStart: () => calls.push("plugin1:start"),
    onTestRunEnd: () => calls.push("plugin1:end"),
  });

  const plugin2 = definePlugin({
    name: "plugin2",
    onTestRunStart: () => calls.push("plugin2:start"),
    onTestRunEnd: () => calls.push("plugin2:end"),
  });

  const plugin3 = definePlugin({
    name: "plugin3",
    onTestRunStart: () => calls.push("plugin3:start"),
    onTestRunEnd: () => calls.push("plugin3:end"),
  });

  const runner = new TestRunner();
  runner.configure({
    platforms: { web: webPlatform({ headless: true }) },
    plugins: [plugin1, plugin2, plugin3],
  });

  const testFeature = feature("Test Feature")
    .scenario("Test Scenario")
    .given("a test step")
    .done()
    ._build();

  runner.test(testFeature, "web");

  await runner.run();

  assert(calls.includes("plugin1:start"), "Plugin1 start called");
  assert(calls.includes("plugin2:start"), "Plugin2 start called");
  assert(calls.includes("plugin3:start"), "Plugin3 start called");
  assert(calls.includes("plugin1:end"), "Plugin1 end called");
  assert(calls.includes("plugin2:end"), "Plugin2 end called");
  assert(calls.includes("plugin3:end"), "Plugin3 end called");
  assert(calls.indexOf("plugin1:start") < calls.indexOf("plugin1:end"), "Start before end");
});

section("Plugin System — Error Handling", () => {});

await test("plugin errors don't break test execution", async () => {
  let testCompleted = false;

  const errorPlugin = definePlugin({
    name: "error-plugin",
    onStepStart: () => {
      throw new Error("Plugin error");
    },
  });

  const normalPlugin = definePlugin({
    name: "normal-plugin",
    onTestRunEnd: () => {
      testCompleted = true;
    },
  });

  const runner = new TestRunner();
  runner.configure({
    platforms: { web: webPlatform({ headless: true }) },
    plugins: [errorPlugin, normalPlugin],
  });

  const testFeature = feature("Test Feature")
    .scenario("Test Scenario")
    .given("a test step")
    .done()
    ._build();

  runner.test(testFeature, "web");

  // Should not throw
  await runner.run();

  assert(testCompleted, "Test completed despite plugin error");
});

section("Plugin System — Async Hooks", () => {});

await test("plugins can use async hooks", async () => {
  let asyncCompleted = false;

  const asyncPlugin = definePlugin({
    name: "async-plugin",
    onTestRunStart: async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      asyncCompleted = true;
    },
  });

  const runner = new TestRunner();
  runner.configure({
    platforms: { web: webPlatform({ headless: true }) },
    plugins: [asyncPlugin],
  });

  const testFeature = feature("Test Feature")
    .scenario("Test Scenario")
    .given("a test step")
    .done()
    ._build();

  runner.test(testFeature, "web");

  await runner.run();

  assert(asyncCompleted, "Async hook completed");
});

section("Plugin System — Use Cases", () => {});

await test("plugin can count test results", async () => {
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  const counterPlugin = definePlugin({
    name: "counter-plugin",
    onScenarioEnd: (scenario, result) => {
      totalTests++;
      if (result.status === "passed") passedTests++;
      if (result.status === "failed") failedTests++;
    },
  });

  const runner = new TestRunner();
  runner.configure({
    platforms: { web: webPlatform({ headless: true }) },
    plugins: [counterPlugin],
  });

  const testFeature = feature("Test Feature")
    .scenario("Scenario 1")
    .given("step 1")
    .scenario("Scenario 2")
    .given("step 2")
    .done()
    ._build();

  runner.test(testFeature, "web");

  await runner.run();

  assert(totalTests === 2, "Plugin counted 2 scenarios");
  assert(passedTests >= 0, "Plugin counted passed scenarios");
  assert(totalTests === passedTests + failedTests, "Counts add up correctly");
});

await test("plugin can collect step durations", async () => {
  const durations: number[] = [];

  const timingPlugin = definePlugin({
    name: "timing-plugin",
    onStepEnd: (step, result) => {
      durations.push(result.duration);
    },
  });

  const runner = new TestRunner();
  runner.configure({
    platforms: { web: webPlatform({ headless: true }) },
    plugins: [timingPlugin],
  });

  const testFeature = feature("Test Feature")
    .scenario("Test Scenario")
    .given("step 1")
    .when("step 2")
    .then("step 3")
    .done()
    ._build();

  runner.test(testFeature, "web");

  await runner.run();

  assert(durations.length >= 1, "Plugin collected at least 1 step duration");
  assert(durations.every((d) => typeof d === "number"), "All durations are numbers");
});

// Print results
console.log("\n");
for (const result of results) {
  console.log(result.name);
  if (!result.passed && result.error) {
    console.log(`     Error: ${result.error}`);
  }
}

const passCount = results.filter((r) => r.passed).length;
const failCount = results.filter((r) => !r.passed).length;

console.log("\n" + "=".repeat(50));
console.log(`\n📊 Test Results: ${passCount} passed, ${failCount} failed\n`);

// Exit with error code if any tests failed
if (failCount > 0) {
  process.exit(1);
}
