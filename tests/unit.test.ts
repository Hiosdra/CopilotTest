/**
 * Unit tests for CopilotTest core modules.
 * Validates Feature object structure, runtime step-response parsing, and HTML report generation.
 */

import { CopilotTestRuntime } from "../src/runtime.js";
import { buildHtmlReport } from "../src/reporter.js";
import { compareTestRuns } from "../src/compare.js";
import { webPlatform } from "../src/platforms/web.js";
import { apiPlatform } from "../src/platforms/api.js";
import { mobilePlatform } from "../src/platforms/mobile.js";
import { DebugController } from "../src/debug.js";
import { ScenarioContext } from "../src/types.js";
import {
  defineStep,
  clearStepDefinitions,
  getStepDefinitions,
} from "../src/step-registry.js";
import { configure, run, test } from "../src/runner.js";
import {
  analyzePerformance,
  getStepPerformanceBreakdown,
  formatDuration,
  comparePerformance,
} from "../src/performance.js";
import type { Feature, TestRun, Scenario, Step, StepContext } from "../src/types.js";
import { writeFile, mkdir, rm } from "fs/promises";

let failures = 0;
let passes = 0;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✘ FAIL: ${message}`);
    failures++;
  } else {
    console.log(`  ✔ PASS: ${message}`);
    passes++;
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    console.error(
      `  ✘ FAIL: ${message} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
    failures++;
  } else {
    console.log(`  ✔ PASS: ${message}`);
    passes++;
  }
}

function section(name: string): void {
  console.log(`\n📦 ${name}`);
}

// ── Feature Structure Tests ──────────────────────────────────

section("Feature — object structure");

const feat: Feature = {
  name: "User Authentication",
  description: "Test login workflows",
  tags: ["@auth"],
  scenarios: [
    {
      name: "Successful login",
      tags: ["@smoke"],
      steps: [
        { keyword: "Given", text: "I am on the login page" },
        { keyword: "When", text: "I enter valid credentials" },
        { keyword: "And", text: "I click the Login button" },
        { keyword: "Then", text: "I should see the dashboard" },
      ],
    },
    {
      name: "Failed login",
      tags: [],
      steps: [
        { keyword: "Given", text: "I am on the login page" },
        { keyword: "When", text: "I enter invalid credentials" },
        { keyword: "Then", text: "I should see an error message" },
      ],
    },
  ],
};

assertEqual(feat.name, "User Authentication", "feature name");
assertEqual(feat.description, "Test login workflows", "feature description");
assert(feat.tags.includes("@auth"), "feature tag @auth");
assertEqual(feat.scenarios.length, 2, "feature has 2 scenarios");

const [scenario1, scenario2] = feat.scenarios;

assertEqual(scenario1.name, "Successful login", "first scenario name");
assert(scenario1.tags.includes("@smoke"), "first scenario tag @smoke");
assertEqual(scenario1.steps.length, 4, "first scenario has 4 steps");
assertEqual(scenario1.steps[0].keyword, "Given", "first step keyword is Given");
assertEqual(scenario1.steps[0].text, "I am on the login page", "first step text");
assertEqual(scenario1.steps[2].keyword, "And", "third step keyword is And");

assertEqual(scenario2.name, "Failed login", "second scenario name");
assertEqual(scenario2.steps.length, 3, "second scenario has 3 steps");

// ── Feature — background steps ───────────────────────────────

section("Feature — background steps");

const featWithBg: Feature = {
  name: "Dashboard",
  tags: [],
  background: [
    { keyword: "Given", text: "I am logged in as admin" },
    { keyword: "And", text: "I navigate to the dashboard" },
  ],
  scenarios: [
    {
      name: "View widgets",
      tags: [],
      steps: [
        { keyword: "Then", text: "I should see the widgets panel" },
      ],
    },
  ],
};

assert(featWithBg.background !== undefined, "feature has background");
assertEqual(featWithBg.background!.length, 2, "background has 2 steps");
assertEqual(featWithBg.background![0].keyword, "Given", "background step keyword");
assertEqual(featWithBg.background![0].text, "I am logged in as admin", "background step text");
assertEqual(featWithBg.scenarios.length, 1, "feature has 1 scenario");

// ── Feature — table and docString ────────────────────────────

section("Feature — table and docString attachments");

const featWithTable: Feature = {
  name: "Data entry",
  tags: [],
  scenarios: [
    {
      name: "Fill form with table data",
      tags: [],
      steps: [
        {
          keyword: "Given",
          text: "I have the following users",
          table: [
            ["name", "email"],
            ["Alice", "alice@test.com"],
            ["Bob", "bob@test.com"],
          ],
        },
        {
          keyword: "When",
          text: "I submit the form",
          docString: '{"action": "submit"}',
        },
        { keyword: "Then", text: "all users are created" },
      ],
    },
  ],
};

const tableStep = featWithTable.scenarios[0].steps[0];
assert(tableStep.table !== undefined, "step has table");
assertEqual(tableStep.table!.length, 3, "table has 3 rows");
assertEqual(tableStep.table![1][0], "Alice", "table row data");

const docStep = featWithTable.scenarios[0].steps[1];
assert(docStep.docString !== undefined, "step has docString");
assert(docStep.docString!.includes("submit"), "docString contains submit");

// ── Feature — multiple scenarios ─────────────────────────────

section("Feature — multiple scenarios");

const chainedFeat: Feature = {
  name: "Chaining",
  tags: [],
  scenarios: [
    {
      name: "First",
      tags: [],
      steps: [
        { keyword: "Given", text: "step one" },
      ],
    },
    {
      name: "Second",
      tags: [],
      steps: [
        { keyword: "Given", text: "step two" },
      ],
    },
  ],
};

assertEqual(chainedFeat.scenarios.length, 2, "chained feature has 2 scenarios");
assertEqual(chainedFeat.scenarios[0].name, "First", "first chained scenario name");
assertEqual(chainedFeat.scenarios[1].name, "Second", "second chained scenario name");

// ── Feature — scenario outline with examples ────────────────

section("Feature — scenario outline with examples");

const outlineFeat: Feature = {
  name: "User Login",
  tags: [],
  scenarios: [
    {
      name: "Login with different credentials",
      tags: [],
      steps: [
        { keyword: "Given", text: "I am on the login page" },
        { keyword: "When", text: "I enter username \"<username>\" and password \"<password>\"" },
        { keyword: "Then", text: "I should see \"<message>\"" },
      ],
      examples: [
        { username: "admin", password: "admin123", message: "Welcome Admin" },
        { username: "user", password: "wrong", message: "Invalid credentials" },
        { username: "", password: "", message: "Please fill all fields" },
      ],
      isOutline: true,
    },
  ],
};

assertEqual(outlineFeat.scenarios.length, 1, "outline feature has 1 scenario");
const outline = outlineFeat.scenarios[0];
assertEqual(outline.name, "Login with different credentials", "outline scenario name");
assert(outline.isOutline === true, "scenario is marked as outline");
assert(outline.examples !== undefined, "scenario has examples");
assertEqual(outline.examples!.length, 3, "scenario has 3 examples");
assertEqual(outline.examples![0].username, "admin", "first example has username");
assertEqual(outline.examples![1].message, "Invalid credentials", "second example has message");
assertEqual(outline.steps.length, 3, "outline has 3 steps");
assert(outline.steps[1].text.includes("<username>"), "step text contains placeholder");
assert(outline.steps[1].text.includes("<password>"), "step text contains placeholder");

// ── Feature — mixing scenario outline and regular scenario ──

section("Feature — mixing scenario outline and regular scenario");

const mixedFeat: Feature = {
  name: "Mixed",
  tags: [],
  scenarios: [
    {
      name: "Parameterized test",
      tags: [],
      steps: [
        { keyword: "Given", text: "I have \"<count>\" items" },
        { keyword: "Then", text: "I should have <count> total" },
      ],
      examples: [
        { count: "5" },
        { count: "10" },
      ],
      isOutline: true,
    },
    {
      name: "Regular test",
      tags: [],
      steps: [
        { keyword: "Given", text: "I have a fixed value" },
        { keyword: "Then", text: "I should see expected result" },
      ],
    },
  ],
};

assertEqual(mixedFeat.scenarios.length, 2, "mixed feature has 2 scenarios");
assertEqual(mixedFeat.scenarios[0].isOutline, true, "first scenario is outline");
assertEqual(mixedFeat.scenarios[1].isOutline, undefined, "second scenario is not outline");
assertEqual(mixedFeat.scenarios[0].examples!.length, 2, "outline has 2 examples");
assertEqual(mixedFeat.scenarios[1].examples, undefined, "regular scenario has no examples");

// ── Feature — scenario outline with tags ─────────────────────

section("Feature — scenario outline with tags");

const taggedOutline: Feature = {
  name: "Tagged",
  tags: [],
  scenarios: [
    {
      name: "Tagged outline",
      tags: ["@smoke", "@parameterized"],
      steps: [
        { keyword: "Given", text: "I use value \"<value>\"" },
      ],
      examples: [{ value: "test" }],
      isOutline: true,
    },
  ],
};

assert(taggedOutline.scenarios[0].tags.includes("@smoke"), "outline has @smoke tag");
assert(taggedOutline.scenarios[0].tags.includes("@parameterized"), "outline has @parameterized tag");

// ── Runtime — expandScenarioOutlines ─────────────────

section("Runtime — scenario outline expansion via public API");

// Test expansion through runtime.runFeature() mock execution
// The expanded scenarios will be reflected in the FeatureResult

// First, verify that a feature with scenario outlines gets expanded correctly
// by checking scenario names in a mock run
const mockRuntime = new CopilotTestRuntime({
  platforms: { web: webPlatform() },
});

await mockRuntime.start();

// Run the outline feature and check the expansion in results
const outlineResult = await mockRuntime.runFeature(outlineFeat, "web");

assertEqual(outlineResult.scenarios.length, 3, "outline expanded to 3 scenarios");
assertEqual(outlineResult.scenarios[0].scenario.name, "Login with different credentials (Example 1)", "first expanded scenario name");
assertEqual(outlineResult.scenarios[1].scenario.name, "Login with different credentials (Example 2)", "second expanded scenario name");
assertEqual(outlineResult.scenarios[2].scenario.name, "Login with different credentials (Example 3)", "third expanded scenario name");

// Check that parameters are substituted in step text
assert(outlineResult.scenarios[0].steps[1].step.text.includes("admin"), "first example has admin username");
assert(outlineResult.scenarios[0].steps[1].step.text.includes("admin123"), "first example has admin123 password");
assert(outlineResult.scenarios[1].steps[1].step.text.includes("user"), "second example has user username");
assert(outlineResult.scenarios[1].steps[1].step.text.includes("wrong"), "second example has wrong password");
assert(outlineResult.scenarios[0].steps[2].step.text.includes("Welcome Admin"), "first example has welcome message");
assert(outlineResult.scenarios[1].steps[2].step.text.includes("Invalid credentials"), "second example has error message");

// Test that regular scenarios mixed with outlines work correctly
const mixedResult = await mockRuntime.runFeature(mixedFeat, "web");
assertEqual(mixedResult.scenarios.length, 3, "mixed feature expands to 3 scenarios (2 from outline + 1 regular)");
assertEqual(mixedResult.scenarios[2].scenario.name, "Regular test", "regular scenario preserved");
assert(!mixedResult.scenarios[2].scenario.name.includes("Example"), "regular scenario name not modified");

await mockRuntime.stop();

// Test edge cases with special characters in parameters
section("Runtime — parameter substitution edge cases");

const edgeCaseRuntime = new CopilotTestRuntime({
  platforms: { web: webPlatform() },
});

await edgeCaseRuntime.start();

// Test regex metacharacters in parameter keys
const regexMetaFeat: Feature = {
  name: "Regex Meta",
  tags: [],
  scenarios: [
    {
      name: "Test with regex metacharacters",
      tags: [],
      steps: [
        { keyword: "Given", text: "I use \"<key.with.dots>\" and \"<key(with)parens>\"" },
      ],
      examples: [
        { "key.with.dots": "value1", "key(with)parens": "value2" },
      ],
      isOutline: true,
    },
  ],
};

const regexMetaResult = await edgeCaseRuntime.runFeature(regexMetaFeat, "web");
assert(regexMetaResult.scenarios[0].steps[0].step.text.includes("value1"), "dots in key name handled");
assert(regexMetaResult.scenarios[0].steps[0].step.text.includes("value2"), "parens in key name handled");
assert(!regexMetaResult.scenarios[0].steps[0].step.text.includes("<key.with.dots>"), "placeholder removed");

// Test $ replacement patterns in parameter values
const dollarFeat: Feature = {
  name: "Dollar Signs",
  tags: [],
  scenarios: [
    {
      name: "Test with $ in values",
      tags: [],
      steps: [
        { keyword: "Given", text: "I use \"<value>\"" },
      ],
      examples: [
        { value: "$1 costs $100" },
        { value: "$$special$$" },
      ],
      isOutline: true,
    },
  ],
};

const dollarResult = await edgeCaseRuntime.runFeature(dollarFeat, "web");
assert(dollarResult.scenarios[0].steps[0].step.text.includes("$1 costs $100"), "$ in value preserved");
assert(dollarResult.scenarios[1].steps[0].step.text.includes("$$special$$"), "multiple $ preserved");

await edgeCaseRuntime.stop();

// ── Runtime — parseStepResponse ─────────────────────────────

section("Runtime — parseStepResponse");

const runtime = new CopilotTestRuntime({
  platforms: { web: webPlatform() },
});

const passedJson = runtime.parseStepResponse(
  '{"status": "passed", "reasoning": "Clicked button successfully"}'
);
assertEqual(passedJson.status, "passed", "parse passed JSON status");
assertEqual(passedJson.reasoning, "Clicked button successfully", "parse passed JSON reasoning");
assertEqual(passedJson.error, undefined, "parse passed JSON has no error");

const failedJson = runtime.parseStepResponse(
  '{"status": "failed", "reasoning": "Element not found", "error": "Timeout"}'
);
assertEqual(failedJson.status, "failed", "parse failed JSON status");
assertEqual(failedJson.error, "Timeout", "parse failed JSON error");

const heuristicFail = runtime.parseStepResponse(
  "Something failed to load on the page"
);
assertEqual(heuristicFail.status, "failed", "heuristic detects failure");

const heuristicPass = runtime.parseStepResponse(
  "The element was found and is visible"
);
assertEqual(heuristicPass.status, "passed", "heuristic detects pass");

const embeddedJson = runtime.parseStepResponse(
  'Some preamble text\n\n{"status": "passed", "reasoning": "All good"}\n\nSome trailing text'
);
assertEqual(embeddedJson.status, "passed", "parse embedded JSON status");
assertEqual(embeddedJson.reasoning, "All good", "parse embedded JSON reasoning");

const contextResponse = runtime.parseStepResponse(
  '{"status": "passed", "reasoning": "User created", "context": {"userId": "12345", "username": "alice"}}'
);
assertEqual(contextResponse.status, "passed", "parse context response status");
assert(contextResponse.context !== undefined, "parse context response has context");
assertEqual(contextResponse.context!["userId"], "12345", "parse context userId");
assertEqual(contextResponse.context!["username"], "alice", "parse context username");

// Test context validation - array should be ignored
const contextArrayResponse = runtime.parseStepResponse(
  '{"status": "passed", "reasoning": "Test", "context": ["invalid", "array"]}'
);
assertEqual(contextArrayResponse.context, undefined, "parse context array returns undefined");

// Test context validation - string should be ignored
const contextStringResponse = runtime.parseStepResponse(
  '{"status": "passed", "reasoning": "Test", "context": "invalid string"}'
);
assertEqual(contextStringResponse.context, undefined, "parse context string returns undefined");

// Test context validation - null should be ignored
const contextNullResponse = runtime.parseStepResponse(
  '{"status": "passed", "reasoning": "Test", "context": null}'
);
assertEqual(contextNullResponse.context, undefined, "parse context null returns undefined");

// Test context validation - number should be ignored
const contextNumberResponse = runtime.parseStepResponse(
  '{"status": "passed", "reasoning": "Test", "context": 123}'
);
assertEqual(contextNumberResponse.context, undefined, "parse context number returns undefined");

// ── ScenarioContext ──────────────────────────────────────────

section("ScenarioContext — state management");

const ctx = new ScenarioContext();

// Test set and get
ctx.set("userId", "12345");
ctx.set("username", "alice");
ctx.set("isActive", true);
ctx.set("count", 42);

assertEqual(ctx.get("userId"), "12345", "get userId");
assertEqual(ctx.get("username"), "alice", "get username");
assertEqual(ctx.get("isActive"), true, "get isActive");
assertEqual(ctx.get("count"), 42, "get count");

// Test has
assert(ctx.has("userId"), "has userId");
assert(!ctx.has("nonExistent"), "has nonExistent returns false");

// Test keys
const keys = ctx.keys();
assertEqual(keys.length, 4, "keys length");
assert(keys.includes("userId"), "keys includes userId");
assert(keys.includes("username"), "keys includes username");

// Test toJSON
const json = ctx.toJSON();
assertEqual(json.userId, "12345", "toJSON userId");
assertEqual(json.username, "alice", "toJSON username");
assertEqual(json.isActive, true, "toJSON isActive");
assertEqual(json.count, 42, "toJSON count");

// Test delete
const deleted = ctx.delete("count");
assert(deleted, "delete returns true");
assert(!ctx.has("count"), "count deleted");
assertEqual(ctx.keys().length, 3, "keys length after delete");

// Test clear
ctx.clear();
assertEqual(ctx.keys().length, 0, "keys length after clear");
assert(!ctx.has("userId"), "userId cleared");

// Test fromJSON
ctx.fromJSON({ x: 1, y: 2, z: "test" });
assertEqual(ctx.get("x"), 1, "fromJSON x");
assertEqual(ctx.get("y"), 2, "fromJSON y");
assertEqual(ctx.get("z"), "test", "fromJSON z");
assertEqual(ctx.keys().length, 3, "fromJSON keys length");

// ── Runtime — buildStepPrompt ────────────────────────────────

section("Runtime — buildStepPrompt");

const emptyContext = new ScenarioContext();

const stepPrompt = runtime.buildStepPrompt({
  keyword: "Given",
  text: "I am on the login page",
}, emptyContext);
assert(stepPrompt.includes("Given"), "step prompt includes keyword");
assert(stepPrompt.includes("I am on the login page"), "step prompt includes text");
assert(stepPrompt.includes("JSON"), "step prompt asks for JSON response");

const tablePrompt = runtime.buildStepPrompt({
  keyword: "When",
  text: "I fill the form",
  table: [["name", "value"], ["user", "admin"]],
}, emptyContext);
assert(tablePrompt.includes("Data table"), "table prompt includes data table");
assert(tablePrompt.includes("admin"), "table prompt includes table data");

const docStringPrompt = runtime.buildStepPrompt({
  keyword: "Then",
  text: "the response matches",
  docString: '{"ok": true}',
}, emptyContext);
assert(docStringPrompt.includes("Doc string"), "docString prompt includes doc string label");
assert(docStringPrompt.includes('"ok": true'), "docString prompt includes content");

// Test with context
const contextWithData = new ScenarioContext();
contextWithData.set("userId", "12345");
contextWithData.set("authToken", "abc-xyz");

const promptWithContext = runtime.buildStepPrompt({
  keyword: "When",
  text: "I fetch the user",
}, contextWithData);
assert(promptWithContext.includes("Current Context"), "step prompt includes context section");
assert(promptWithContext.includes("userId"), "step prompt includes context key");
assert(promptWithContext.includes("12345"), "step prompt includes context value");

// ── Runtime — buildSystemPrompt ──────────────────────────────

section("Runtime — buildSystemPrompt");

const sysPrompt = runtime.buildSystemPrompt(
  feat,
  feat.scenarios[0],
  webPlatform()
);
assert(sysPrompt.includes("User Authentication"), "system prompt includes feature name");
assert(sysPrompt.includes("Successful login"), "system prompt includes scenario name");
assert(sysPrompt.includes("web"), "system prompt includes platform");
assert(sysPrompt.includes("autonomous QA testing agent"), "system prompt includes default instructions");

// ── Platform configs ─────────────────────────────────────────

section("Platform configs");

const web = webPlatform({ browser: "firefox", headless: false, baseUrl: "http://localhost:3000" });
assertEqual(web.platform, "web", "web platform type");
assertEqual(web.mcpServer.type, "stdio", "web MCP type");
assertEqual(web.mcpServer.command, "npx", "web MCP command");
assert(web.mcpServer.args!.includes("firefox"), "web MCP args include browser");
assert(!web.mcpServer.args!.includes("--headless"), "web MCP args exclude headless when false");
assert(web.systemContext!.includes("http://localhost:3000"), "web systemContext includes baseUrl");

const api = apiPlatform({ baseUrl: "http://api.example.com", defaultHeaders: { Authorization: "Bearer token" } });
assertEqual(api.platform, "api", "api platform type");
assert(api.mcpServer.env !== undefined, "api MCP has env");
assert(api.mcpServer.env!.DEFAULT_HEADERS!.includes("Bearer token"), "api env includes auth header");

const mobile = mobilePlatform({ device: "pixel-5", avd: "test-avd", appPackage: "com.example.app" });
assertEqual(mobile.platform, "mobile", "mobile platform type");
assert(mobile.mcpServer.args!.includes("pixel-5"), "mobile MCP args include device");
assert(mobile.mcpServer.args!.includes("--avd"), "mobile MCP args include avd flag");
assert(mobile.mcpServer.args!.includes("com.example.app"), "mobile MCP args include app package");

// ── Reporter — HTML generation ──────────────────────────────

section("Reporter — HTML report generation");

const testRun: TestRun = {
  startedAt: new Date("2025-01-01T00:00:00Z"),
  finishedAt: new Date("2025-01-01T00:00:05Z"),
  features: [
    {
      feature: feat,
      scenarios: [
        {
          scenario: feat.scenarios[0],
          status: "passed",
          steps: feat.scenarios[0].steps.map((step) => ({
            step,
            status: "passed" as const,
            duration: 100,
            aiReasoning: "Step executed successfully",
          })),
          duration: 400,
        },
        {
          scenario: feat.scenarios[1],
          status: "failed",
          steps: [
            {
              step: feat.scenarios[1].steps[0],
              status: "passed" as const,
              duration: 50,
            },
            {
              step: feat.scenarios[1].steps[1],
              status: "failed" as const,
              duration: 200,
              error: "Element not found",
            },
            {
              step: feat.scenarios[1].steps[2],
              status: "skipped" as const,
              duration: 0,
            },
          ],
          duration: 250,
        },
      ],
      duration: 650,
    },
  ],
  summary: { total: 2, passed: 1, failed: 1, skipped: 0 },
};

const html = buildHtmlReport(testRun);

assert(html.includes("<!DOCTYPE html>"), "HTML report has doctype");
assert(html.includes("CopilotTest Report"), "HTML report has title");
assert(html.includes("User Authentication"), "HTML report includes feature name");
assert(html.includes("Successful login"), "HTML report includes scenario name");
assert(html.includes("Element not found"), "HTML report includes error message");
assert(html.includes("AI Reasoning"), "HTML report includes reasoning section");
assert(html.includes("badge-passed"), "HTML report has passed badge");
assert(html.includes("badge-failed"), "HTML report has failed badge");
assert(html.includes("badge-skipped"), "HTML report has skipped badge");
assert(html.includes("50%"), "HTML report shows pass rate");

// ── Debug Tests ──────────────────────────────────────────────

section("Debug — scenario debug mode");

const debugScenario: Feature = {
  name: "Debug Test",
  tags: [],
  scenarios: [
    {
      name: "With debug enabled",
      tags: [],
      debugMode: true,
      steps: [
        { keyword: "Given", text: "I am on the homepage" },
        { keyword: "When", text: "I click the button" },
        { keyword: "Then", text: "I should see a message" },
      ],
    },
  ],
};

assert(debugScenario.scenarios[0].debugMode === true, "scenario has debug mode enabled");
assertEqual(debugScenario.scenarios[0].name, "With debug enabled", "debug scenario name");
assertEqual(debugScenario.scenarios[0].steps.length, 3, "debug scenario has 3 steps");

section("Debug — breakpoint detection");

const debugController = new DebugController(
  ["When I click the button", "Then I should see a message"],
  false
);

const step1: Step = { keyword: "Given", text: "I am on the homepage" };
const step2: Step = { keyword: "When", text: "I click the button" };
const step3: Step = { keyword: "Then", text: "I should see a message" };

assert(!debugController.shouldBreak(step1), "no breakpoint on Given step");
assert(debugController.shouldBreak(step2), "breakpoint on When step");
assert(debugController.shouldBreak(step3), "breakpoint on Then step");

section("Debug — partial/substring breakpoint matching");

const partialController = new DebugController(
  ["click", "see a message"],
  false
);

assert(!partialController.shouldBreak(step1), "no partial match on Given step");
assert(partialController.shouldBreak(step2), "partial match on 'click' in When step");
assert(partialController.shouldBreak(step3), "partial match on 'see a message' in Then step");

partialController.cleanup();

section("Debug — step-through mode");

const stepController = new DebugController([], true);

assert(stepController.shouldBreak(step1), "step-through breaks on all steps");
assert(stepController.shouldBreak(step2), "step-through breaks on all steps");
assert(stepController.shouldBreak(step3), "step-through breaks on all steps");

stepController.cleanup();
debugController.cleanup();

// ── Comparison Tests ─────────────────────────────────────────

section("Comparison — compareTestRuns function");

// Create test data for comparison
const baselineRun: TestRun = {
  startedAt: new Date("2024-01-15T10:00:00Z"),
  finishedAt: new Date("2024-01-15T10:05:00Z"),
  features: [
    {
      feature: { name: "Feature A", tags: [], scenarios: [] },
      scenarios: [
        {
          scenario: { name: "Test 1", tags: [], steps: [] },
          status: "failed",
          steps: [],
          duration: 1000,
        },
        {
          scenario: { name: "Test 2", tags: [], steps: [] },
          status: "passed",
          steps: [],
          duration: 500,
        },
        {
          scenario: { name: "Test 3", tags: [], steps: [] },
          status: "passed",
          steps: [],
          duration: 2000,
        },
      ],
      duration: 3500,
    },
  ],
  summary: { total: 3, passed: 2, failed: 1, skipped: 0 },
};

const currentRun: TestRun = {
  startedAt: new Date("2024-01-15T11:00:00Z"),
  finishedAt: new Date("2024-01-15T11:04:00Z"),
  features: [
    {
      feature: { name: "Feature A", tags: [], scenarios: [] },
      scenarios: [
        {
          scenario: { name: "Test 1", tags: [], steps: [] },
          status: "passed", // Improved!
          steps: [],
          duration: 950,
        },
        {
          scenario: { name: "Test 2", tags: [], steps: [] },
          status: "failed", // Regression!
          steps: [],
          duration: 600,
        },
        {
          scenario: { name: "Test 4", tags: [], steps: [] }, // New test
          status: "passed",
          steps: [],
          duration: 800,
        },
      ],
      duration: 2350,
    },
  ],
  summary: { total: 3, passed: 2, failed: 1, skipped: 0 },
};

// Write test files
const testDir = "/tmp/copilot-test-comparison";
await mkdir(testDir, { recursive: true });
await writeFile(
  `${testDir}/baseline.json`,
  JSON.stringify(baselineRun),
  "utf-8"
);
await writeFile(
  `${testDir}/current.json`,
  JSON.stringify(currentRun),
  "utf-8"
);

// Run comparison
const result = await compareTestRuns(
  `${testDir}/baseline.json`,
  `${testDir}/current.json`
);

// Test improvements detection
assertEqual(result.changes.improved.length, 1, "detects 1 improvement");
assertEqual(
  result.changes.improved[0].name,
  "Feature A::Test 1",
  "improvement is Test 1"
);
assertEqual(
  result.changes.improved[0].baselineStatus,
  "failed",
  "improvement from failed"
);
assertEqual(
  result.changes.improved[0].currentStatus,
  "passed",
  "improvement to passed"
);

// Test regressions detection
assertEqual(result.changes.regressed.length, 1, "detects 1 regression");
assertEqual(
  result.changes.regressed[0].name,
  "Feature A::Test 2",
  "regression is Test 2"
);
assertEqual(
  result.changes.regressed[0].baselineStatus,
  "passed",
  "regression from passed"
);
assertEqual(
  result.changes.regressed[0].currentStatus,
  "failed",
  "regression to failed"
);

// Test new scenarios detection
assertEqual(result.changes.newScenarios.length, 1, "detects 1 new scenario");
assertEqual(
  result.changes.newScenarios[0],
  "Feature A::Test 4",
  "new scenario is Test 4"
);

// Test removed scenarios detection
assertEqual(
  result.changes.removedScenarios.length,
  1,
  "detects 1 removed scenario"
);
assertEqual(
  result.changes.removedScenarios[0],
  "Feature A::Test 3",
  "removed scenario is Test 3"
);

// Test performance threshold (>100ms)
assert(
  result.performance.scenarioChanges.length === 0,
  "no performance changes >100ms threshold"
);

// Test with performance change
const performanceRun: TestRun = {
  startedAt: new Date("2024-01-15T12:00:00Z"),
  finishedAt: new Date("2024-01-15T12:05:00Z"),
  features: [
    {
      feature: { name: "Feature B", tags: [], scenarios: [] },
      scenarios: [
        {
          scenario: { name: "Slow Test", tags: [], steps: [] },
          status: "passed",
          steps: [],
          duration: 2000, // Was 1000, now 2000 (+1000ms)
        },
      ],
      duration: 2000,
    },
  ],
  summary: { total: 1, passed: 1, failed: 0, skipped: 0 },
};

await writeFile(
  `${testDir}/performance.json`,
  JSON.stringify(performanceRun),
  "utf-8"
);

const perfResult = await compareTestRuns(
  `${testDir}/baseline.json`,
  `${testDir}/performance.json`
);

// Should not detect the slow test since it's a different feature
// But let's create a proper performance test
const baselinePerf: TestRun = {
  startedAt: new Date("2024-01-15T10:00:00Z"),
  finishedAt: new Date("2024-01-15T10:05:00Z"),
  features: [
    {
      feature: { name: "Perf Feature", tags: [], scenarios: [] },
      scenarios: [
        {
          scenario: { name: "Performance Test", tags: [], steps: [] },
          status: "passed",
          steps: [],
          duration: 1000,
        },
      ],
      duration: 1000,
    },
  ],
  summary: { total: 1, passed: 1, failed: 0, skipped: 0 },
};

const currentPerf: TestRun = {
  startedAt: new Date("2024-01-15T11:00:00Z"),
  finishedAt: new Date("2024-01-15T11:04:00Z"),
  features: [
    {
      feature: { name: "Perf Feature", tags: [], scenarios: [] },
      scenarios: [
        {
          scenario: { name: "Performance Test", tags: [], steps: [] },
          status: "passed",
          steps: [],
          duration: 1250, // +250ms - should be detected
        },
      ],
      duration: 1250,
    },
  ],
  summary: { total: 1, passed: 1, failed: 0, skipped: 0 },
};

await writeFile(
  `${testDir}/baseline-perf.json`,
  JSON.stringify(baselinePerf),
  "utf-8"
);
await writeFile(
  `${testDir}/current-perf.json`,
  JSON.stringify(currentPerf),
  "utf-8"
);

const perfTest = await compareTestRuns(
  `${testDir}/baseline-perf.json`,
  `${testDir}/current-perf.json`
);

assertEqual(
  perfTest.performance.scenarioChanges.length,
  1,
  "detects performance change >100ms"
);
assertEqual(
  perfTest.performance.scenarioChanges[0].diff,
  250,
  "performance diff is +250ms"
);

// Clean up test files
await rm(testDir, { recursive: true, force: true });

// ── Custom Step Definitions ─────────────────────────────────

section("Custom Step Definitions — Registry");

// Clear any existing definitions
clearStepDefinitions();
assertEqual(getStepDefinitions().length, 0, "registry starts empty");

// Define some custom steps
let step1Executed = false;
let step1Args: string[] = [];

defineStep(/^I login as "(.+)" with password "(.+)"$/, async (context, username, password) => {
  step1Executed = true;
  step1Args = [username, password];
});

assertEqual(getStepDefinitions().length, 1, "registry has 1 definition after defineStep");

let step2Executed = false;
defineStep(/^I click the button$/, async () => {
  step2Executed = true;
});

assertEqual(getStepDefinitions().length, 2, "registry has 2 definitions");

// ── Custom Step Definitions — Matching ──────────────────────

section("Custom Step Definitions — Pattern Matching");

const { findStepDefinition } = await import("../src/step-registry.js");

const match1 = findStepDefinition('I login as "admin" with password "admin123"');
assert(match1 !== null, "finds matching step definition");
assertEqual(match1!.matches.length, 2, "extracts 2 captured groups");
assertEqual(match1!.matches[0], "admin", "first capture is username");
assertEqual(match1!.matches[1], "admin123", "second capture is password");

const match2 = findStepDefinition("I click the button");
assert(match2 !== null, "finds step without captures");
assertEqual(match2!.matches.length, 0, "no captured groups");

const noMatch = findStepDefinition("I do something that is not defined");
assertEqual(noMatch, null, "returns null for non-matching step");

// ── Custom Step Definitions — Execution ─────────────────────

section("Custom Step Definitions — Execution");

const customRuntime = new CopilotTestRuntime({
  platforms: { web: webPlatform() },
  useCustomStepDefinitions: true,
});

// Test that custom step executes
step1Executed = false;
step1Args = [];

const testContext = new ScenarioContext();

const customStepResult = await customRuntime.executeStep(
  { keyword: "Given", text: 'I login as "testuser" with password "secret"' },
  { _mock: true },
  testContext
);

assert(step1Executed, "custom step handler was executed");
assertEqual(step1Args[0], "testuser", "custom step received username");
assertEqual(step1Args[1], "secret", "custom step received password");
assertEqual(customStepResult.status, "passed", "custom step result is passed");
assert(customStepResult.aiReasoning?.includes("[Custom]"), "result indicates custom execution");

// Test that custom step failure is caught
defineStep(/^I fail deliberately$/, async () => {
  throw new Error("Intentional test failure");
});

const failedStepResult = await customRuntime.executeStep(
  { keyword: "When", text: "I fail deliberately" },
  { _mock: true },
  testContext
);

assertEqual(failedStepResult.status, "failed", "failed custom step returns failed status");
assert(failedStepResult.error?.includes("Intentional test failure"), "error message is captured");

// ── Custom Step Definitions — Fallback to AI ────────────────

section("Custom Step Definitions — AI Fallback");

// Step without custom definition should fall back to AI (mock mode)
const aiFallbackResult = await customRuntime.executeStep(
  { keyword: "Then", text: "I should see the dashboard" },
  { _mock: true },
  testContext
);

assertEqual(aiFallbackResult.status, "passed", "non-custom step uses AI");
assert(aiFallbackResult.aiReasoning?.includes("[Mock]"), "result indicates mock AI execution");

// ── Custom Step Definitions — Disabled ──────────────────────

section("Custom Step Definitions — Can be Disabled");

const noCustomRuntime = new CopilotTestRuntime({
  platforms: { web: webPlatform() },
  useCustomStepDefinitions: false,
});

step1Executed = false;

const disabledCustomResult = await noCustomRuntime.executeStep(
  { keyword: "Given", text: 'I login as "testuser" with password "secret"' },
  { _mock: true },
  testContext
);

assert(!step1Executed, "custom step not executed when disabled");
assertEqual(disabledCustomResult.status, "passed", "falls back to AI when disabled");
assert(disabledCustomResult.aiReasoning?.includes("[Mock]"), "uses AI execution");

// ── Custom Step Definitions — Context ───────────────────────

section("Custom Step Definitions — Context Object");

let receivedContext: StepContext | null = null;

clearStepDefinitions();
defineStep(/^I check the context$/, async (context) => {
  receivedContext = context;
});

const testFeature: Feature = {
  name: "Test Feature",
  tags: [],
  scenarios: [
    {
      name: "Test Scenario",
      tags: [],
      steps: [
        { keyword: "Given", text: "I check the context" },
      ],
    },
  ],
};
const testScenario = testFeature.scenarios[0];
const testPlatform = webPlatform();

const contextRuntime = new CopilotTestRuntime({
  platforms: { web: testPlatform },
});

// We need to simulate a scenario run to set the context
contextRuntime["currentFeature"] = testFeature;
contextRuntime["currentScenario"] = testScenario;
contextRuntime["currentPlatform"] = testPlatform;

await contextRuntime.executeStep(
  { keyword: "Given", text: "I check the context" },
  { _mock: true }
);

assert(receivedContext !== null, "context was passed to handler");
assertEqual(receivedContext!.step.text, "I check the context", "context has step");
assertEqual(receivedContext!.feature?.name, "Test Feature", "context has feature");
assertEqual(receivedContext!.scenario?.name, "Test Scenario", "context has scenario");
assert(receivedContext!.session !== undefined, "context has session");
assert(receivedContext!.platform !== undefined, "context has platform");

// Clean up
clearStepDefinitions();

// ── Custom Step Definitions — Regex Validation ──────────────

section("Custom Step Definitions — Regex Validation");

// Test that global and sticky flags are rejected
let globalFlagError: Error | null = null;
try {
  defineStep(/test/g, async () => {});
} catch (err) {
  globalFlagError = err as Error;
}
assert(globalFlagError !== null, "global flag throws error");
assert(globalFlagError!.message.includes("global"), "error mentions global flag");

let stickyFlagError: Error | null = null;
try {
  defineStep(/test/y, async () => {});
} catch (err) {
  stickyFlagError = err as Error;
}
assert(stickyFlagError !== null, "sticky flag throws error");
assert(stickyFlagError!.message.includes("sticky"), "error mentions sticky flag");

// Normal patterns should work fine
defineStep(/^test pattern$/, async () => {});
assertEqual(getStepDefinitions().length, 1, "normal pattern registered successfully");

clearStepDefinitions();

// ── Parallel Configuration ──────────────────────────────────

section("Parallel Configuration");

// Test parallel config options - verify TypeScript typing
configure({
  platforms: { web: webPlatform() },
  parallel: true,
  maxWorkers: 4,
  workerTimeout: 300000,
  failFast: false,
});

assert(true, "parallel config with maxWorkers as number");

configure({
  platforms: { web: webPlatform() },
  parallel: true,
  maxWorkers: "auto",
});

assert(true, "parallel config with maxWorkers as 'auto'");

configure({
  platforms: { web: webPlatform() },
  parallel: false,
});

assert(true, "parallel config disabled");

// ── Retry Mechanisms ─────────────────────────────────────────

section("Retry — calculateRetryDelay");

const { calculateRetryDelay, shouldRetryStep, isFlaky } = await import("../src/retry.js");
import type { RetryConfig } from "../src/types.js";

// Test fixed strategy
const fixedConfig: RetryConfig = {
  enabled: true,
  strategy: "fixed",
  stepRetryDelay: 1000,
};

assertEqual(calculateRetryDelay(1, fixedConfig), 1000, "fixed delay for attempt 1");
assertEqual(calculateRetryDelay(2, fixedConfig), 1000, "fixed delay for attempt 2");
assertEqual(calculateRetryDelay(3, fixedConfig), 1000, "fixed delay for attempt 3");

// Test exponential strategy
const exponentialConfig: RetryConfig = {
  enabled: true,
  strategy: "exponential",
  initialDelay: 100,
  backoffFactor: 2,
  maxDelay: 1000,
};

assertEqual(calculateRetryDelay(1, exponentialConfig), 100, "exponential delay attempt 1: 100ms");
assertEqual(calculateRetryDelay(2, exponentialConfig), 200, "exponential delay attempt 2: 200ms");
assertEqual(calculateRetryDelay(3, exponentialConfig), 400, "exponential delay attempt 3: 400ms");
assertEqual(calculateRetryDelay(4, exponentialConfig), 800, "exponential delay attempt 4: 800ms");
assertEqual(calculateRetryDelay(5, exponentialConfig), 1000, "exponential delay attempt 5: capped at 1000ms");
assertEqual(calculateRetryDelay(6, exponentialConfig), 1000, "exponential delay attempt 6: still capped at 1000ms");

// Test custom delay function
const customConfig: RetryConfig = {
  enabled: true,
  strategy: "custom",
  delayFn: (attempt) => attempt * 500,
};

assertEqual(calculateRetryDelay(1, customConfig), 500, "custom delay attempt 1");
assertEqual(calculateRetryDelay(2, customConfig), 1000, "custom delay attempt 2");
assertEqual(calculateRetryDelay(3, customConfig), 1500, "custom delay attempt 3");

section("Retry — shouldRetryStep");

// Test default behavior (retry everything)
const defaultConfig: RetryConfig = { enabled: true };
assert(shouldRetryStep("Network timeout", 1, defaultConfig, 3), "retries timeout by default");
assert(shouldRetryStep("Connection refused", 1, defaultConfig, 3), "retries connection error by default");
assert(shouldRetryStep("Assertion failed", 1, defaultConfig, 3), "retries assertion error by default");

// Test retryOn patterns (only retry matching errors)
const retryOnConfig: RetryConfig = {
  enabled: true,
  retryOn: ["timeout", /network error/i],
};

assert(shouldRetryStep("Network timeout", 1, retryOnConfig, 3), "retries on 'timeout' match");
assert(shouldRetryStep("Network Error: Connection lost", 1, retryOnConfig, 3), "retries on regex match");
assert(!shouldRetryStep("Assertion failed", 1, retryOnConfig, 3), "doesn't retry non-matching error");
assert(!shouldRetryStep("Validation error", 1, retryOnConfig, 3), "doesn't retry validation error");

// Test skipRetryOn patterns (skip specific errors)
const skipRetryConfig: RetryConfig = {
  enabled: true,
  skipRetryOn: ["assertion failed", /validation error/i],
};

assert(!shouldRetryStep("Assertion failed", 1, skipRetryConfig, 3), "skips 'assertion failed'");
assert(!shouldRetryStep("Validation Error: Invalid input", 1, skipRetryConfig, 3), "skips validation error");
assert(shouldRetryStep("Network timeout", 1, skipRetryConfig, 3), "retries timeout (not skipped)");
assert(shouldRetryStep("Connection refused", 1, skipRetryConfig, 3), "retries connection error (not skipped)");

// Test max retries
assert(!shouldRetryStep("Network timeout", 4, defaultConfig, 3), "doesn't retry when max retries exceeded");

// Test custom shouldRetry function
const customRetryConfig: RetryConfig = {
  enabled: true,
  shouldRetry: (error, attempt) => {
    const msg = typeof error === "string" ? error : error.message;
    const lowerMsg = msg.toLowerCase();  // Case-insensitive matching
    if (lowerMsg.includes("rate limit")) {
      return attempt <= 4;  // Retry on attempts 1-4, don't retry on attempt 5+
    }
    if (lowerMsg.includes("server error")) {
      return attempt <= 2;  // Retry on attempts 1-2, don't retry on attempt 3+
    }
    return false;
  },
};

assert(shouldRetryStep("Rate limit exceeded", 1, customRetryConfig, 10), "custom retry for rate limit");
assert(shouldRetryStep("Rate limit exceeded", 4, customRetryConfig, 10), "custom retry attempt 4 for rate limit");
assert(!shouldRetryStep("Rate limit exceeded", 5, customRetryConfig, 10), "no retry attempt 5 for rate limit");
assert(shouldRetryStep("Server error 500", 1, customRetryConfig, 10), "custom retry for server error");
assert(shouldRetryStep("Server error 500", 2, customRetryConfig, 10), "custom retry attempt 2 for server error");
assert(!shouldRetryStep("Server error 500", 3, customRetryConfig, 10), "no retry attempt 3 for server error");
assert(!shouldRetryStep("Assertion failed", 1, customRetryConfig, 10), "custom doesn't retry assertion");

section("Retry — isFlaky detection");

const flakyConfig: RetryConfig = {
  enabled: true,
  trackFlaky: true,
  flakyThreshold: 2,
};

assert(!isFlaky(0, flakyConfig), "not flaky with 0 retries");
assert(!isFlaky(1, flakyConfig), "not flaky with 1 retry (below threshold)");
assert(isFlaky(2, flakyConfig), "flaky with 2 retries (at threshold)");
assert(isFlaky(3, flakyConfig), "flaky with 3 retries (above threshold)");

const flakyDisabledConfig: RetryConfig = {
  enabled: true,
  trackFlaky: false,
};

assert(!isFlaky(5, flakyDisabledConfig), "not flaky when tracking disabled");

section("Retry — HTML report rendering with retries");

// Create a test run with retry information
const retryTestRun: TestRun = {
  startedAt: new Date("2026-03-19T12:00:00Z"),
  finishedAt: new Date("2026-03-19T12:00:05Z"),
  features: [
    {
      feature: {
        name: "Retry Test Feature",
        tags: [],
        scenarios: [
          {
            name: "Flaky scenario",
            tags: ["@flaky"],
            steps: [
              { keyword: "Given", text: "a flaky step" },
            ],
          },
        ],
      },
      scenarios: [
        {
          scenario: {
            name: "Flaky scenario",
            tags: ["@flaky"],
            steps: [{ keyword: "Given", text: "a flaky step" }],
          },
          status: "passed",
          duration: 3500,
          steps: [
            {
              step: { keyword: "Given", text: "a flaky step" },
              status: "passed",
              duration: 3500,
              retryCount: 2,
              retryAttempts: [
                { attemptNumber: 1, status: "failed", duration: 1000, error: "Timeout" },
                { attemptNumber: 2, status: "failed", duration: 1200, error: "Network error" },
                { attemptNumber: 3, status: "passed", duration: 1300 },
              ],
            },
          ],
          duration: 3500,
        },
      ],
      duration: 3500,
    },
  ],
  summary: { total: 1, passed: 1, failed: 0, skipped: 0 },
};

const retryHtml = buildHtmlReport(retryTestRun);

assert(retryHtml.includes("Retried 2x"), "HTML report includes retry badge");
assert(retryHtml.includes("Attempt 1"), "HTML report includes attempt 1");
assert(retryHtml.includes("Attempt 2"), "HTML report includes attempt 2");
assert(retryHtml.includes("Attempt 3"), "HTML report includes attempt 3");
assert(retryHtml.includes("Timeout"), "HTML report includes first error");
assert(retryHtml.includes("Network error"), "HTML report includes second error");
assert(retryHtml.includes("retry-badge"), "HTML report has retry badge CSS class");
assert(retryHtml.includes("retry-details"), "HTML report has retry details CSS class");

section("Retry — Step execution with retries");

// Test that retry logic integrates with runtime
const retryRuntime = new CopilotTestRuntime({
  platforms: { web: webPlatform() },
  retry: {
    enabled: true,
    stepRetries: 2,
    stepRetryDelay: 10, // Very short delay for testing
    strategy: "fixed",
  },
});

await retryRuntime.start();

// Create a simple step and context
const retryTestStep: Step = { keyword: "When", text: "test step executes" };
const retryTestContext = new ScenarioContext();

// Execute step (should work in mock mode)
const retryStepResult = await retryRuntime.executeStep(
  retryTestStep,
  { _mock: true },
  retryTestContext
);

assertEqual(retryStepResult.status, "passed", "retry runtime executes step successfully");
// In mock mode, steps always pass on first try, so retryCount should be 0
assertEqual(retryStepResult.retryCount ?? 0, 0, "no retries needed in mock mode");

await retryRuntime.stop();

// ── Watch Mode Configuration ──────────────────────────────────

section("Watch Mode Configuration");

// Test watch mode config options - verify TypeScript typing and structure
configure({
  platforms: { web: webPlatform() },
  watch: {
    enabled: true,
    include: ["src/**/*.ts", "tests/**/*.spec.ts"],
    exclude: ["node_modules/**", "dist/**"],
    debounce: 300,
    runMode: "all",
    clearConsole: true,
    notifications: false,
    verbose: true,
    maxWorkers: 2,
  },
});

assert(true, "watch config with all options");

configure({
  platforms: { web: webPlatform() },
  watch: {
    enabled: true,
    runMode: "related",
  },
});

assert(true, "watch config with minimal options");

configure({
  platforms: { web: webPlatform() },
  watch: {
    enabled: false,
  },
});

assert(true, "watch config disabled");

// Test runMode options
configure({
  platforms: { web: webPlatform() },
  watch: {
    runMode: "changed-files",
    failedFirst: true,
  },
});

assert(true, "watch config with changed-files mode");

// ── Performance Monitoring ───────────────────────────────────

section("Performance — analyzePerformance");

const { analyzePerformance, getStepPerformanceBreakdown, formatDuration } = await import("../src/performance.js");

const perfTestRun: TestRun = {
  startedAt: new Date(),
  finishedAt: new Date(Date.now() + 5000),
  features: [
    {
      feature: { name: "Performance Test", tags: [], scenarios: [] },
      scenarios: [
        {
          scenario: { name: "Test Scenario", tags: [], steps: [] },
          status: "passed",
          steps: [
            {
              step: { keyword: "Given", text: "step 1" },
              status: "passed",
              duration: 1000,
              metrics: {
                duration: 1000,
                aiThinkTime: 300,
                executionTime: 700,
              },
            },
            {
              step: { keyword: "When", text: "step 2" },
              status: "passed",
              duration: 2000,
              metrics: {
                duration: 2000,
                aiThinkTime: 500,
                executionTime: 1500,
              },
            },
            {
              step: { keyword: "Then", text: "step 3" },
              status: "passed",
              duration: 500,
              metrics: {
                duration: 500,
                aiThinkTime: 100,
                executionTime: 400,
              },
            },
          ],
          duration: 3500,
          resources: {
            screenshots: 2,
            networkRequests: 5,
          },
        },
      ],
      duration: 3500,
    },
  ],
  summary: { total: 1, passed: 1, failed: 0, skipped: 0 },
  metadata: {
    timestamp: new Date().toISOString(),
    duration: 5000,
  },
};

const perfSummary = analyzePerformance(perfTestRun);

assertEqual(perfSummary.totalDuration, 5000, "total duration from metadata");
assert(
  Math.abs(perfSummary.avgStepDuration - 1166.67) < 1,
  "average step duration is ~1166.67ms"
);
assertEqual(perfSummary.avgAiThinkTime, 300, "average AI think time is 300ms");
assert(
  Math.abs(perfSummary.avgExecutionTime - 866.67) < 1,
  "average execution time is ~866.67ms"
);
assertEqual(perfSummary.totalScreenshots, 2, "total screenshots is 2");
assertEqual(perfSummary.totalNetworkRequests, 5, "total network requests is 5");
assert(perfSummary.slowestStep !== undefined, "slowest step is defined");
assertEqual(
  perfSummary.slowestStep?.duration,
  2000,
  "slowest step is 2000ms"
);
assert(perfSummary.fastestStep !== undefined, "fastest step is defined");
assertEqual(perfSummary.fastestStep?.duration, 500, "fastest step is 500ms");

section("Performance — getStepPerformanceBreakdown");

const breakdown = getStepPerformanceBreakdown(perfTestRun);

assertEqual(breakdown.length, 3, "breakdown has 3 steps");
assertEqual(breakdown[0].duration, 1000, "first step duration is 1000ms");
assertEqual(breakdown[0].aiTime, 300, "first step AI time is 300ms");
assertEqual(breakdown[0].execTime, 700, "first step exec time is 700ms");
assertEqual(breakdown[1].duration, 2000, "second step duration is 2000ms");
assertEqual(breakdown[2].duration, 500, "third step duration is 500ms");

section("Performance — formatDuration");

assertEqual(formatDuration(500), "500ms", "formats 500ms");
assertEqual(formatDuration(1500), "1.5s", "formats 1500ms as 1.5s");
assertEqual(formatDuration(10234), "10.2s", "formats 10234ms as 10.2s");

section("Performance — comparePerformance");

const baselinePerformance = analyzePerformance({
  ...perfTestRun,
  metadata: { ...perfTestRun.metadata!, duration: 4000 },
});

const currentPerformance = analyzePerformance({
  ...perfTestRun,
  metadata: { ...perfTestRun.metadata!, duration: 5000 },
});

const comparison = comparePerformance(currentPerformance, baselinePerformance);

assert(comparison.totalDurationChange > 0, "duration increased");
assert(
  Math.abs(comparison.totalDurationChange - 0.25) < 0.01,
  "duration increased by 25%"
);
assertEqual(comparison.trend, "degraded", "trend is degraded");

// Test stable trend
const stableComparison = comparePerformance(
  currentPerformance,
  currentPerformance
);
assertEqual(stableComparison.trend, "stable", "stable trend detected");
assertEqual(stableComparison.totalDurationChange, 0, "no change");

// ── Summary ──────────────────────────────────────────────────

console.log("\n" + "=".repeat(50));
console.log(`\n📊 Test Results: ${passes} passed, ${failures} failed\n`);

if (failures > 0) {
  process.exit(1);
}
