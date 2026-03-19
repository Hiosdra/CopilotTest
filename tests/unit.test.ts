/**
 * Unit tests for CopilotTest core modules.
 * Validates DSL builder, runtime step-response parsing, and HTML report generation.
 */

import { feature } from "../src/dsl.js";
import { CopilotTestRuntime } from "../src/runtime.js";
import { buildHtmlReport } from "../src/reporter.js";
import { webPlatform } from "../src/platforms/web.js";
import { apiPlatform } from "../src/platforms/api.js";
import { mobilePlatform } from "../src/platforms/mobile.js";
import {
  defineStep,
  clearStepDefinitions,
  getStepDefinitions,
} from "../src/step-registry.js";
import type { Feature, TestRun, StepContext } from "../src/types.js";

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

// ── DSL Tests ───────────────────────────────────────────────

section("DSL — feature/scenario/step builder");

const feat: Feature = feature("User Authentication")
  .description("Test login workflows")
  .tag("@auth")
  .scenario("Successful login")
    .tag("@smoke")
    .given("I am on the login page")
    .when("I enter valid credentials")
    .and("I click the Login button")
    .then("I should see the dashboard")
    .done()
  .scenario("Failed login")
    .given("I am on the login page")
    .when("I enter invalid credentials")
    .then("I should see an error message")
    .done()
  ._build();

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

// ── DSL — background steps ──────────────────────────────────

section("DSL — background steps");

const featWithBg: Feature = feature("Dashboard")
  .background()
    .given("I am logged in as admin")
    .and("I navigate to the dashboard")
  .scenario("View widgets")
    .then("I should see the widgets panel")
    .done()
  ._build();

assert(featWithBg.background !== undefined, "feature has background");
assertEqual(featWithBg.background!.length, 2, "background has 2 steps");
assertEqual(featWithBg.background![0].keyword, "Given", "background step keyword");
assertEqual(featWithBg.background![0].text, "I am logged in as admin", "background step text");
assertEqual(featWithBg.scenarios.length, 1, "feature has 1 scenario");

// ── DSL — table and docString ───────────────────────────────

section("DSL — table and docString attachments");

const featWithTable: Feature = feature("Data entry")
  .scenario("Fill form with table data")
    .given("I have the following users")
    .withTable([
      ["name", "email"],
      ["Alice", "alice@test.com"],
      ["Bob", "bob@test.com"],
    ])
    .when("I submit the form")
    .withDocString('{"action": "submit"}')
    .then("all users are created")
    .done()
  ._build();

const tableStep = featWithTable.scenarios[0].steps[0];
assert(tableStep.table !== undefined, "step has table");
assertEqual(tableStep.table!.length, 3, "table has 3 rows");
assertEqual(tableStep.table![1][0], "Alice", "table row data");

const docStep = featWithTable.scenarios[0].steps[1];
assert(docStep.docString !== undefined, "step has docString");
assert(docStep.docString!.includes("submit"), "docString contains submit");

// ── DSL — chaining multiple scenarios via .scenario() ───────

section("DSL — chaining scenarios via .scenario()");

const chainedFeat: Feature = feature("Chaining")
  .scenario("First")
    .given("step one")
  .scenario("Second")
    .given("step two")
    .done()
  ._build();

assertEqual(chainedFeat.scenarios.length, 2, "chained feature has 2 scenarios");
assertEqual(chainedFeat.scenarios[0].name, "First", "first chained scenario name");
assertEqual(chainedFeat.scenarios[1].name, "Second", "second chained scenario name");

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

// ── Runtime — buildStepPrompt ────────────────────────────────

section("Runtime — buildStepPrompt");

const stepPrompt = runtime.buildStepPrompt({
  keyword: "Given",
  text: "I am on the login page",
});
assert(stepPrompt.includes("Given"), "step prompt includes keyword");
assert(stepPrompt.includes("I am on the login page"), "step prompt includes text");
assert(stepPrompt.includes("JSON"), "step prompt asks for JSON response");

const tablePrompt = runtime.buildStepPrompt({
  keyword: "When",
  text: "I fill the form",
  table: [["name", "value"], ["user", "admin"]],
});
assert(tablePrompt.includes("Data table"), "table prompt includes data table");
assert(tablePrompt.includes("admin"), "table prompt includes table data");

const docStringPrompt = runtime.buildStepPrompt({
  keyword: "Then",
  text: "the response matches",
  docString: '{"ok": true}',
});
assert(docStringPrompt.includes("Doc string"), "docString prompt includes doc string label");
assert(docStringPrompt.includes('"ok": true'), "docString prompt includes content");

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

const customStepResult = await customRuntime.executeStep(
  { keyword: "Given", text: 'I login as "testuser" with password "secret"' },
  { _mock: true }
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
  { _mock: true }
);

assertEqual(failedStepResult.status, "failed", "failed custom step returns failed status");
assert(failedStepResult.error?.includes("Intentional test failure"), "error message is captured");

// ── Custom Step Definitions — Fallback to AI ────────────────

section("Custom Step Definitions — AI Fallback");

// Step without custom definition should fall back to AI (mock mode)
const aiFallbackResult = await customRuntime.executeStep(
  { keyword: "Then", text: "I should see the dashboard" },
  { _mock: true }
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
  { _mock: true }
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

const testFeature = feature("Test Feature").scenario("Test Scenario").given("I check the context").done()._build();
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

// ── Summary ──────────────────────────────────────────────────

console.log("\n" + "=".repeat(50));
console.log(`\n📊 Test Results: ${passes} passed, ${failures} failed\n`);

if (failures > 0) {
  process.exit(1);
}
