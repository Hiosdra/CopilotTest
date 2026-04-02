/**
 * Unit tests for markdown-parser.ts and config-loader.ts.
 * Uses the same assert/section harness as unit.test.ts.
 */

import { parseFeatureMarkdown, parseFeatureFile } from "../src/markdown-parser.js";
import { loadConfig } from "../src/config-loader.js";
import { writeFile, mkdir, rm } from "fs/promises";
import { join } from "path";

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

// ── Helper to build a minimal valid feature markdown ─────────────────────

function featureMd(opts: {
  platform?: string;
  fmTags?: string[];
  debugMode?: boolean;
  featureName?: string;
  description?: string;
  background?: string;
  scenarios?: string;
  extra?: string;
}): string {
  const fmLines: string[] = [];
  fmLines.push(`platform: ${opts.platform ?? "web"}`);
  if (opts.fmTags) fmLines.push(`tags:\n${opts.fmTags.map((t) => `  - ${t}`).join("\n")}`);
  if (opts.debugMode) fmLines.push("debugMode: true");

  let body = `---\n${fmLines.join("\n")}\n---\n\n`;
  body += `# Feature: ${opts.featureName ?? "Test Feature"}\n`;
  if (opts.description) body += `\n${opts.description}\n`;
  if (opts.background) body += `\n## Background\n\n${opts.background}\n`;
  if (opts.scenarios) body += `\n${opts.scenarios}`;
  if (opts.extra) body += `\n${opts.extra}`;
  return body;
}

// ── Temp dir for file-based tests ────────────────────────────────────────

const TEMP_DIR = join(process.cwd(), ".test-parser-tmp");

// ═════════════════════════════════════════════════════════════════════════
// parseFeatureMarkdown() tests
// ═════════════════════════════════════════════════════════════════════════

// 1. Basic feature parsing
section("parseFeatureMarkdown — basic feature parsing");

{
  const md = featureMd({
    scenarios: `## Scenario: Login\n\n- Given the user is on the login page\n- When the user enters credentials\n- Then the user is logged in\n`,
  });
  const result = parseFeatureMarkdown(md);
  assertEqual(result.feature.name, "Test Feature", "feature name matches");
  assertEqual(result.platform, "web", "platform matches");
  assertEqual(result.feature.scenarios.length, 1, "one scenario parsed");
  assertEqual(result.feature.scenarios[0].name, "Login", "scenario name");
  assertEqual(result.feature.scenarios[0].steps.length, 3, "three steps parsed");
  assertEqual(result.feature.scenarios[0].steps[0].keyword, "Given", "first step keyword");
  assertEqual(result.feature.scenarios[0].steps[0].text, "the user is on the login page", "first step text");
  assertEqual(result.feature.scenarios[0].steps[1].keyword, "When", "second step keyword");
  assertEqual(result.feature.scenarios[0].steps[2].keyword, "Then", "third step keyword");
}

// 2. Frontmatter parsing
section("parseFeatureMarkdown — frontmatter parsing");

{
  const md = featureMd({
    platform: "api",
    fmTags: ["smoke", "critical"],
    debugMode: true,
    scenarios: `## Scenario: Ping\n\n- Given the API is running\n`,
  });
  const result = parseFeatureMarkdown(md);
  assertEqual(result.platform, "api", "platform from frontmatter");
  assert(Array.isArray(result.tags), "tags is an array");
  assert(result.tags!.includes("smoke"), "tags include smoke");
  assert(result.tags!.includes("critical"), "tags include critical");
  assertEqual(result.debugMode, true, "debugMode from frontmatter");
}

// 3. Missing frontmatter — should throw ParseError
section("parseFeatureMarkdown — missing frontmatter");

{
  let threw = false;
  let errMsg = "";
  try {
    parseFeatureMarkdown("# Feature: No frontmatter\n\n## Scenario: X\n\n- Given step\n");
  } catch (e: unknown) {
    threw = true;
    errMsg = (e as Error).message;
  }
  assert(threw, "throws on missing frontmatter");
  assert(errMsg.includes("frontmatter"), "error mentions frontmatter");
}

// 4. Missing platform in frontmatter
section("parseFeatureMarkdown — missing platform");

{
  let threw = false;
  let errMsg = "";
  try {
    parseFeatureMarkdown("---\ntags:\n  - foo\n---\n\n# Feature: X\n\n## Scenario: Y\n\n- Given step\n");
  } catch (e: unknown) {
    threw = true;
    errMsg = (e as Error).message;
  }
  assert(threw, "throws on missing platform");
  assert(errMsg.includes("platform"), "error mentions platform");
}

// 5. Missing Feature heading
section("parseFeatureMarkdown — missing Feature heading");

{
  let threw = false;
  let errMsg = "";
  try {
    parseFeatureMarkdown("---\nplatform: web\n---\n\n## Scenario: Y\n\n- Given step\n");
  } catch (e: unknown) {
    threw = true;
    errMsg = (e as Error).message;
  }
  assert(threw, "throws on missing Feature heading");
  assert(errMsg.includes("Feature"), "error mentions Feature heading");
}

// 6. Feature description
section("parseFeatureMarkdown — feature description");

{
  const md = featureMd({
    description: "This is a description of the feature.\nIt spans multiple lines.",
    scenarios: `## Scenario: Stub\n\n- Given step\n`,
  });
  const result = parseFeatureMarkdown(md);
  assert(result.feature.description != null, "description is present");
  assert(result.feature.description!.includes("description of the feature"), "description text matches");
  assert(result.feature.description!.includes("multiple lines"), "multi-line description preserved");
}

// 7. Background section
section("parseFeatureMarkdown — background section");

{
  const md = featureMd({
    background: "- Given the user is logged in\n- And the dashboard is visible",
    scenarios: `## Scenario: View Profile\n\n- When the user clicks profile\n- Then the profile page loads\n`,
  });
  const result = parseFeatureMarkdown(md);
  assert(result.feature.background != null, "background is present");
  assertEqual(result.feature.background!.length, 2, "two background steps");
  assertEqual(result.feature.background![0].keyword, "Given", "background step 1 keyword");
  assertEqual(result.feature.background![1].keyword, "And", "background step 2 keyword");
}

// 8. Multiple scenarios
section("parseFeatureMarkdown — multiple scenarios");

{
  const md = featureMd({
    scenarios: [
      "## Scenario: First\n\n- Given step one\n",
      "## Scenario: Second\n\n- Given step two\n- When step three\n",
      "## Scenario: Third\n\n- Given step four\n- When step five\n- Then step six\n",
    ].join("\n"),
  });
  const result = parseFeatureMarkdown(md);
  assertEqual(result.feature.scenarios.length, 3, "three scenarios parsed");
  assertEqual(result.feature.scenarios[0].name, "First", "first scenario name");
  assertEqual(result.feature.scenarios[1].name, "Second", "second scenario name");
  assertEqual(result.feature.scenarios[2].name, "Third", "third scenario name");
  assertEqual(result.feature.scenarios[0].steps.length, 1, "first scenario has 1 step");
  assertEqual(result.feature.scenarios[1].steps.length, 2, "second scenario has 2 steps");
  assertEqual(result.feature.scenarios[2].steps.length, 3, "third scenario has 3 steps");
}

// 9. Scenario tags
section("parseFeatureMarkdown — scenario tags");

{
  const md = featureMd({
    scenarios: `## Scenario: Tagged\n\n@smoke @critical\n\n- Given step\n`,
  });
  const result = parseFeatureMarkdown(md);
  const scenario = result.feature.scenarios[0];
  assert(scenario.tags.includes("@smoke"), "scenario has @smoke tag");
  assert(scenario.tags.includes("@critical"), "scenario has @critical tag");
}

// 10. Step keywords
section("parseFeatureMarkdown — step keywords");

{
  const md = featureMd({
    scenarios: `## Scenario: All keywords\n\n- Given step one\n- When step two\n- Then step three\n- And step four\n- But step five\n`,
  });
  const result = parseFeatureMarkdown(md);
  const steps = result.feature.scenarios[0].steps;
  assertEqual(steps.length, 5, "five steps parsed");
  assertEqual(steps[0].keyword, "Given", "Given keyword");
  assertEqual(steps[1].keyword, "When", "When keyword");
  assertEqual(steps[2].keyword, "Then", "Then keyword");
  assertEqual(steps[3].keyword, "And", "And keyword");
  assertEqual(steps[4].keyword, "But", "But keyword");
}

// 11. Data table attached to step
section("parseFeatureMarkdown — data table attached to step");

{
  const md = featureMd({
    scenarios: `## Scenario: With table\n\n- Given the following users:\n  | name  | role  |\n  |-------|-------|\n  | Alice | admin |\n  | Bob   | user  |\n`,
  });
  const result = parseFeatureMarkdown(md);
  const step = result.feature.scenarios[0].steps[0];
  assert(step.table != null, "step has table");
  assert(Array.isArray(step.table), "table is an array");
  // Header row + 2 data rows (separator row is excluded)
  assertEqual(step.table!.length, 3, "table has header + 2 data rows");
  assert(step.table![0].includes("name"), "header contains 'name'");
  assert(step.table![1].includes("Alice"), "first data row contains Alice");
  assert(step.table![2].includes("Bob"), "second data row contains Bob");
}

// 12. DocString attached to step
section("parseFeatureMarkdown — docString attached to step");

{
  const md = featureMd({
    scenarios: `## Scenario: With docstring\n\n- Given the request body:\n  \`\`\`json\n  {"name": "Alice"}\n  \`\`\`\n`,
  });
  const result = parseFeatureMarkdown(md);
  const step = result.feature.scenarios[0].steps[0];
  assert(step.docString != null, "step has docString");
  assert(step.docString!.includes('"name"'), "docString contains field name");
  assert(step.docString!.includes("Alice"), "docString contains value");
}

// 13. Scenario Outline with examples
section("parseFeatureMarkdown — scenario outline with examples");

{
  const md = featureMd({
    scenarios: `## Scenario Outline: Login with <role>\n\n- Given the user is a <role>\n- When they enter <password>\n- Then they see <page>\n\n| role  | password | page      |\n|-------|----------|-----------|\n| admin | secret   | dashboard |\n| user  | pass123  | home      |\n`,
  });
  const result = parseFeatureMarkdown(md);
  const scenario = result.feature.scenarios[0];
  assertEqual(scenario.name, "Login with <role>", "outline name");
  assertEqual(scenario.isOutline, true, "isOutline is true");
  assert(scenario.examples != null, "examples present");
  assert(Array.isArray(scenario.examples), "examples is an array");
  assertEqual(scenario.examples!.length, 2, "two example rows");
  assertEqual(scenario.examples![0]["role"], "admin", "first example role");
  assertEqual(scenario.examples![0]["password"], "secret", "first example password");
  assertEqual(scenario.examples![1]["role"], "user", "second example role");
  assertEqual(scenario.examples![1]["page"], "home", "second example page");
}

// 14. Frontmatter tags merge with feature tags
section("parseFeatureMarkdown — frontmatter tags merge");

{
  // Build markdown manually to control YAML quoting for @-prefixed tags
  const md = `---
platform: web
tags:
  - smoke
  - regression
---

# Feature: Tag merge

## Scenario: Stub

- Given step
`;
  const result = parseFeatureMarkdown(md);
  const tags = result.feature.tags;
  assert(tags.includes("@smoke"), "frontmatter tag 'smoke' gets @ prefix and merges");
  assert(tags.includes("@regression"), "frontmatter tag 'regression' gets @ prefix");
}

// 15. Debug mode propagation
section("parseFeatureMarkdown — debug mode propagation");

{
  const md = featureMd({
    debugMode: true,
    scenarios: `## Scenario: One\n\n- Given step\n\n## Scenario: Two\n\n- Given step\n`,
  });
  const result = parseFeatureMarkdown(md);
  for (const s of result.feature.scenarios) {
    assertEqual(s.debugMode, true, `scenario "${s.name}" has debugMode true`);
  }
}

// 16. Empty scenarios
section("parseFeatureMarkdown — empty scenarios");

{
  const md = featureMd({
    scenarios: `## Scenario: Empty\n\n`,
  });
  const result = parseFeatureMarkdown(md);
  assertEqual(result.feature.scenarios.length, 1, "one scenario parsed");
  assertEqual(result.feature.scenarios[0].steps.length, 0, "empty steps array");
}

// 17. Complex full feature
section("parseFeatureMarkdown — complex full feature");

{
  const md = `---
platform: web
tags:
  - e2e
  - auth
debugMode: true
---

# Feature: User Management

Full user lifecycle including creation, authentication, and profile management.

## Background

- Given the application is running
- And the database is seeded

## Scenario: Successful login

@smoke @critical

- Given the user navigates to "/login"
- When the user enters credentials:
  | field    | value        |
  |----------|--------------|
  | username | admin        |
  | password | secret123    |
- Then the user sees the dashboard

## Scenario: View profile

- Given the user is logged in
- When the user clicks "Profile"
- Then the user sees their profile details:
  \`\`\`json
  {"name": "Admin User", "role": "admin"}
  \`\`\`

## Scenario Outline: Role-based access

- Given the user is a <role>
- When the user visits <page>
- Then the status is <status>

| role  | page     | status |
|-------|----------|--------|
| admin | /admin   | 200    |
| user  | /admin   | 403    |
| guest | /profile | 302    |
`;

  const result = parseFeatureMarkdown(md);

  // Feature-level
  assertEqual(result.feature.name, "User Management", "complex: feature name");
  assert(result.feature.description!.includes("Full user lifecycle"), "complex: description");
  assertEqual(result.platform, "web", "complex: platform");
  assertEqual(result.debugMode, true, "complex: debugMode");

  // Tags merged from frontmatter
  assert(result.feature.tags.includes("@e2e"), "complex: merged tag @e2e");
  assert(result.feature.tags.includes("@auth"), "complex: merged tag @auth");

  // Background
  assert(result.feature.background != null, "complex: background present");
  assertEqual(result.feature.background!.length, 2, "complex: 2 background steps");

  // Scenarios
  assertEqual(result.feature.scenarios.length, 3, "complex: 3 scenarios");

  // Scenario 1 — login with tags and table
  const s1 = result.feature.scenarios[0];
  assertEqual(s1.name, "Successful login", "complex: scenario 1 name");
  assert(s1.tags.includes("@smoke"), "complex: scenario 1 @smoke tag");
  assert(s1.tags.includes("@critical"), "complex: scenario 1 @critical tag");
  assertEqual(s1.steps.length, 3, "complex: scenario 1 has 3 steps");
  assert(s1.steps[1].table != null, "complex: scenario 1 step 2 has table");
  assertEqual(s1.debugMode, true, "complex: scenario 1 debugMode propagated");

  // Scenario 2 — profile with docString
  const s2 = result.feature.scenarios[1];
  assertEqual(s2.name, "View profile", "complex: scenario 2 name");
  assert(s2.steps[2].docString != null, "complex: scenario 2 step 3 has docString");
  assert(s2.steps[2].docString!.includes("Admin User"), "complex: docString content");

  // Scenario 3 — outline with examples
  const s3 = result.feature.scenarios[2];
  assertEqual(s3.name, "Role-based access", "complex: scenario 3 name");
  assertEqual(s3.isOutline, true, "complex: scenario 3 isOutline");
  assertEqual(s3.examples!.length, 3, "complex: 3 example rows");
  assertEqual(s3.examples![0]["role"], "admin", "complex: first example role");
  assertEqual(s3.examples![2]["status"], "302", "complex: third example status");
}

// ═════════════════════════════════════════════════════════════════════════
// loadConfig() tests
// ═════════════════════════════════════════════════════════════════════════

section("loadConfig — load YAML config");

// 18. Load YAML config
{
  await mkdir(TEMP_DIR, { recursive: true });
  const configPath = join(TEMP_DIR, "test-config.yaml");
  try {
    await writeFile(
      configPath,
      `model: gpt-4o
stepTimeout: 30000
retries: 2
screenshotOnFailure: true
platforms:
  default:
    platform: web
    browser: chromium
    headless: true
`
    );
    const config = await loadConfig(configPath);
    assertEqual(config.model, "gpt-4o", "config model");
    assertEqual(config.stepTimeout, 30000, "config stepTimeout");
    assertEqual(config.retries, 2, "config retries");
    assertEqual(config.screenshotOnFailure, true, "config screenshotOnFailure");
    assert(config.platforms["default"] != null, "default platform exists");
    assertEqual(config.platforms["default"].platform, "web", "default platform is web");
  } finally {
    await rm(TEMP_DIR, { recursive: true, force: true });
  }
}

// 19. Environment variable resolution
section("loadConfig — environment variable resolution");

{
  await mkdir(TEMP_DIR, { recursive: true });
  const configPath = join(TEMP_DIR, "env-config.yaml");
  const savedModel = process.env["COPILOT_MODEL"];
  const savedUrl = process.env["BASE_URL"];
  try {
    process.env["COPILOT_MODEL"] = "gpt-4-turbo";
    process.env["BASE_URL"] = "https://example.com";
    await writeFile(
      configPath,
      `model: \${COPILOT_MODEL}
baseUrl: \${BASE_URL}
platforms: {}
`
    );
    const config = await loadConfig(configPath);
    assertEqual(config.model, "gpt-4-turbo", "env var resolved for model");
    assertEqual(config.baseUrl, "https://example.com", "env var resolved for baseUrl");
  } finally {
    if (savedModel !== undefined) process.env["COPILOT_MODEL"] = savedModel;
    else delete process.env["COPILOT_MODEL"];
    if (savedUrl !== undefined) process.env["BASE_URL"] = savedUrl;
    else delete process.env["BASE_URL"];
    await rm(TEMP_DIR, { recursive: true, force: true });
  }
}

// 20. Environment variable with default
section("loadConfig — environment variable with default");

{
  await mkdir(TEMP_DIR, { recursive: true });
  const configPath = join(TEMP_DIR, "env-default-config.yaml");
  const saved = process.env["PARSER_TEST_UNSET_VAR_XYZ"];
  try {
    delete process.env["PARSER_TEST_UNSET_VAR_XYZ"];
    await writeFile(
      configPath,
      `model: \${PARSER_TEST_UNSET_VAR_XYZ:-gpt-4o-mini}
platforms: {}
`
    );
    const config = await loadConfig(configPath);
    assertEqual(config.model, "gpt-4o-mini", "default value used when env var unset");
  } finally {
    if (saved !== undefined) process.env["PARSER_TEST_UNSET_VAR_XYZ"] = saved;
    else delete process.env["PARSER_TEST_UNSET_VAR_XYZ"];
    await rm(TEMP_DIR, { recursive: true, force: true });
  }
}

// 21. Web platform expansion
section("loadConfig — web platform expansion");

{
  await mkdir(TEMP_DIR, { recursive: true });
  const configPath = join(TEMP_DIR, "web-platform.yaml");
  try {
    await writeFile(
      configPath,
      `platforms:
  myWeb:
    platform: web
    browser: firefox
    headless: false
    baseUrl: https://app.example.com
`
    );
    const config = await loadConfig(configPath);
    const p = config.platforms["myWeb"];
    assert(p != null, "myWeb platform exists");
    assertEqual(p.platform, "web", "platform is web");
    assert(p.mcpServer != null, "mcpServer present");
    assertEqual(p.mcpServer.type, "stdio", "mcpServer type is stdio");
    assertEqual(p.mcpServer.command, "npx", "mcpServer command is npx");
    assert(p.mcpServer.args!.includes("@playwright/mcp"), "args include @playwright/mcp");
    assert(p.mcpServer.args!.includes("firefox"), "args include firefox browser");
    assert(!p.mcpServer.args!.includes("--headless"), "headless=false means no --headless arg");
    assert(p.systemContext != null, "systemContext present");
    assert(p.systemContext!.includes("https://app.example.com"), "systemContext includes baseUrl");
  } finally {
    await rm(TEMP_DIR, { recursive: true, force: true });
  }
}

// 22. API platform expansion
section("loadConfig — API platform expansion");

{
  await mkdir(TEMP_DIR, { recursive: true });
  const configPath = join(TEMP_DIR, "api-platform.yaml");
  try {
    await writeFile(
      configPath,
      `platforms:
  myApi:
    platform: api
    baseUrl: https://api.example.com
    defaultHeaders:
      Authorization: Bearer token123
`
    );
    const config = await loadConfig(configPath);
    const p = config.platforms["myApi"];
    assert(p != null, "myApi platform exists");
    assertEqual(p.platform, "api", "platform is api");
    assert(p.mcpServer.args!.includes("@copilot-test/curl-mcp"), "args include curl-mcp");
    assert(p.mcpServer.env != null, "mcpServer env present");
    assert(p.mcpServer.env!["DEFAULT_HEADERS"] != null, "DEFAULT_HEADERS env set");
    assert(p.systemContext!.includes("https://api.example.com"), "systemContext includes baseUrl");
  } finally {
    await rm(TEMP_DIR, { recursive: true, force: true });
  }
}

// 23. Mobile platform expansion
section("loadConfig — mobile platform expansion");

{
  await mkdir(TEMP_DIR, { recursive: true });
  const configPath = join(TEMP_DIR, "mobile-platform.yaml");
  try {
    await writeFile(
      configPath,
      `platforms:
  myMobile:
    platform: mobile
    device: emulator-5556
    avd: Pixel_6_API_33
    appPackage: com.example.app
    appActivity: .MainActivity
`
    );
    const config = await loadConfig(configPath);
    const p = config.platforms["myMobile"];
    assert(p != null, "myMobile platform exists");
    assertEqual(p.platform, "mobile", "platform is mobile");
    assert(p.mcpServer.args!.includes("@copilot-test/android-mcp"), "args include android-mcp");
    assert(p.mcpServer.args!.includes("emulator-5556"), "args include device");
    assert(p.mcpServer.args!.includes("--avd"), "args include --avd flag");
    assert(p.mcpServer.args!.includes("Pixel_6_API_33"), "args include avd name");
    assert(p.mcpServer.args!.includes("--app-package"), "args include --app-package flag");
    assert(p.mcpServer.args!.includes("com.example.app"), "args include app package");
    assert(p.mcpServer.args!.includes("--app-activity"), "args include --app-activity flag");
    assert(p.mcpServer.args!.includes(".MainActivity"), "args include app activity");
    assert(p.systemContext!.includes("emulator-5556"), "systemContext mentions device");
  } finally {
    await rm(TEMP_DIR, { recursive: true, force: true });
  }
}

// 24. Missing config file
section("loadConfig — missing config file");

{
  let threw = false;
  let errMsg = "";
  try {
    await loadConfig(join(process.cwd(), "nonexistent-config-file-xyz.yaml"));
  } catch (e: unknown) {
    threw = true;
    errMsg = (e as Error).message;
  }
  assert(threw, "throws on missing config file");
  assert(errMsg.includes("not found") || errMsg.includes("Config file"), "error mentions missing file");
}

// 25. Invalid YAML
section("loadConfig — invalid YAML");

{
  await mkdir(TEMP_DIR, { recursive: true });
  const configPath = join(TEMP_DIR, "invalid.yaml");
  try {
    await writeFile(configPath, "this is not valid yaml: [: {:\n");
    let threw = false;
    try {
      await loadConfig(configPath);
    } catch {
      threw = true;
    }
    assert(threw, "throws on invalid YAML");
  } finally {
    await rm(TEMP_DIR, { recursive: true, force: true });
  }
}

// ═════════════════════════════════════════════════════════════════════════
// parseFeatureFile() tests
// ═════════════════════════════════════════════════════════════════════════

// 26. Load from disk
section("parseFeatureFile — load from disk");

{
  await mkdir(TEMP_DIR, { recursive: true });
  const filePath = join(TEMP_DIR, "disk-test.feature.md");
  try {
    await writeFile(
      filePath,
      `---
platform: api
---

# Feature: API Health

## Scenario: Health check

- Given the API is running
- When I send a GET request to "/health"
- Then the response status is 200
`
    );
    const result = await parseFeatureFile(filePath);
    assertEqual(result.feature.name, "API Health", "feature name from disk");
    assertEqual(result.platform, "api", "platform from disk");
    assertEqual(result.feature.scenarios.length, 1, "one scenario from disk");
    assertEqual(result.feature.scenarios[0].steps.length, 3, "three steps from disk");
  } finally {
    await rm(TEMP_DIR, { recursive: true, force: true });
  }
}

// ═════════════════════════════════════════════════════════════════════════
// Results
// ═════════════════════════════════════════════════════════════════════════

console.log(`\n📊 Test Results: ${passes} passed, ${failures} failed\n`);

if (failures > 0) {
  process.exit(1);
}
