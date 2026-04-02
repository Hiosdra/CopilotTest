import * as fs from "node:fs";
import * as path from "node:path";
import { prompt } from "../utils/prompt.js";

const TEST_TEMPLATES: Record<string, string> = {
  web: `---
platform: web
tags: [smoke]
---

# Feature: <FEATURE_NAME>

<FEATURE_NAME> feature tests

## Scenario: <SCENARIO_NAME>
@smoke
- Given I am on the page
- When I perform an action
- Then I should see the expected result
`,
  api: `---
platform: api
tags: [api, smoke]
---

# Feature: <FEATURE_NAME>

<FEATURE_NAME> API tests

## Scenario: <SCENARIO_NAME>
@smoke
- Given I have the required data
- When I send a request to the API
- Then I should receive the expected response
`,
  mobile: `---
platform: mobile
tags: [mobile, smoke]
---

# Feature: <FEATURE_NAME>

<FEATURE_NAME> mobile tests

## Scenario: <SCENARIO_NAME>
@smoke
- Given I have the app open
- When I interact with the UI
- Then I should see the expected behavior
`,
};

export async function createCommand(args: string[]) {
  const type = args[0];

  if (!type || type !== "test") {
    console.error("❌ Invalid create command");
    console.error("\nUsage:");
    console.error("  copilot-test create test");
    process.exit(1);
  }

  console.log("🆕 Create New Test\n");

  // Check if tests directory exists
  if (!fs.existsSync("tests")) {
    console.log("Creating tests/ directory...");
    fs.mkdirSync("tests");
  }

  // Get test details
  const testType = await promptTestType();
  const featureName = await prompt("Feature name:", "My Feature");
  const scenarioName = await prompt("Scenario name:", "My Scenario");

  const baseFileName = featureName.toLowerCase().replace(/\s+/g, "-");
  const defaultFileName = `${baseFileName}.feature.md`;
  const fileName = await prompt("File name:", defaultFileName);

  const filePath = path.join("tests", fileName);

  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.error(`\n❌ File already exists: ${filePath}`);
    process.exit(1);
  }

  // Generate test content
  const template = TEST_TEMPLATES[testType];
  const content = template
    .replace(/<FEATURE_NAME>/g, featureName)
    .replace(/<SCENARIO_NAME>/g, scenarioName);

  // Write file
  fs.writeFileSync(filePath, content);

  console.log(`\n✅ Created ${filePath}`);
  console.log("\nNext steps:");
  console.log(`  1. Edit ${filePath} to add your test scenarios and steps`);
  console.log(`  2. Run: copilot-test run ${filePath}`);
}

async function promptTestType(): Promise<"web" | "api" | "mobile"> {
  console.log("Test type:");
  console.log("  1. Web Test (Playwright)");
  console.log("  2. API Test (REST)");
  console.log("  3. Mobile Test (Android)");

  const input = await prompt("Select (1-3):", "1");

  switch (input) {
    case "1":
      return "web";
    case "2":
      return "api";
    case "3":
      return "mobile";
    default:
      return "web";
  }
}
