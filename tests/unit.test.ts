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
import type { Feature, TestRun } from "../src/types.js";

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

// ── DSL — scenario outline with examples ────────────

section("DSL — scenario outline with examples");

const outlineFeat: Feature = feature("User Login")
  .scenarioOutline("Login with different credentials")
    .given("I am on the login page")
    .when('I enter username "<username>" and password "<password>"')
    .then('I should see "<message>"')
    .examples([
      { username: "admin", password: "admin123", message: "Welcome Admin" },
      { username: "user", password: "wrong", message: "Invalid credentials" },
      { username: "", password: "", message: "Please fill all fields" },
    ])
    .done()
  ._build();

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

// ── DSL — mixing scenario outline and regular scenario ─────

section("DSL — mixing scenario outline and regular scenario");

const mixedFeat: Feature = feature("Mixed")
  .scenarioOutline("Parameterized test")
    .given('I have "<count>" items')
    .then('I should have <count> total')
    .examples([
      { count: "5" },
      { count: "10" },
    ])
  .scenario("Regular test")
    .given("I have a fixed value")
    .then("I should see expected result")
    .done()
  ._build();

assertEqual(mixedFeat.scenarios.length, 2, "mixed feature has 2 scenarios");
assertEqual(mixedFeat.scenarios[0].isOutline, true, "first scenario is outline");
assertEqual(mixedFeat.scenarios[1].isOutline, undefined, "second scenario is not outline");
assertEqual(mixedFeat.scenarios[0].examples!.length, 2, "outline has 2 examples");
assertEqual(mixedFeat.scenarios[1].examples, undefined, "regular scenario has no examples");

// ── DSL — scenario outline with tags ─────────────────

section("DSL — scenario outline with tags");

const taggedOutline: Feature = feature("Tagged")
  .scenarioOutline("Tagged outline")
    .tag("@smoke", "@parameterized")
    .given('I use value "<value>"')
    .examples([{ value: "test" }])
    .done()
  ._build();

assert(taggedOutline.scenarios[0].tags.includes("@smoke"), "outline has @smoke tag");
assert(taggedOutline.scenarios[0].tags.includes("@parameterized"), "outline has @parameterized tag");

// ── Runtime — expandScenarioOutlines ─────────────────

section("Runtime — expandScenarioOutlines");

const outlineRuntime = new CopilotTestRuntime({
  platforms: { web: webPlatform() },
});

// Test parameter substitution
const substituted = (outlineRuntime as any).substituteParameters(
  'username is "<username>" and password is "<password>"',
  { username: "admin", password: "secret123" }
);
assert(substituted.includes("admin"), "substitution includes username value");
assert(substituted.includes("secret123"), "substitution includes password value");
assert(!substituted.includes("<username>"), "substitution removes username placeholder");
assert(!substituted.includes("<password>"), "substitution removes password placeholder");

// Test scenario expansion
const expandedScenarios = (outlineRuntime as any).expandScenarioOutlines(
  outlineFeat.scenarios
);
assertEqual(expandedScenarios.length, 3, "outline expanded to 3 scenarios");
assertEqual(expandedScenarios[0].name, "Login with different credentials (Example 1)", "first expanded scenario name");
assertEqual(expandedScenarios[1].name, "Login with different credentials (Example 2)", "second expanded scenario name");
assertEqual(expandedScenarios[2].name, "Login with different credentials (Example 3)", "third expanded scenario name");

// Check that parameters are substituted
assert(expandedScenarios[0].steps[1].text.includes("admin"), "first example has admin username");
assert(expandedScenarios[0].steps[1].text.includes("admin123"), "first example has admin123 password");
assert(expandedScenarios[1].steps[1].text.includes("user"), "second example has user username");
assert(expandedScenarios[1].steps[1].text.includes("wrong"), "second example has wrong password");
assert(expandedScenarios[0].steps[2].text.includes("Welcome Admin"), "first example has welcome message");
assert(expandedScenarios[1].steps[2].text.includes("Invalid credentials"), "second example has error message");

// Test that regular scenarios are not expanded
const mixedExpanded = (outlineRuntime as any).expandScenarioOutlines(
  mixedFeat.scenarios
);
assertEqual(mixedExpanded.length, 3, "mixed feature expands to 3 scenarios (2 from outline + 1 regular)");
assertEqual(mixedExpanded[2].name, "Regular test", "regular scenario preserved");
assert(!mixedExpanded[2].name.includes("Example"), "regular scenario name not modified");

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

// ── Summary ──────────────────────────────────────────────────

console.log("\n" + "=".repeat(50));
console.log(`\n📊 Test Results: ${passes} passed, ${failures} failed\n`);

if (failures > 0) {
  process.exit(1);
}
