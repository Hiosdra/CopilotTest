import * as fs from "node:fs";
import * as path from "node:path";
import { prompt } from "../utils/prompt.js";

const TEST_TEMPLATES = {
  web: `import { feature, test, run } from "copilot-test";

test(
  feature("<FEATURE_NAME>")
    .tag("@web")
    .scenario("<SCENARIO_NAME>")
    .tag("@smoke")
    .given("I am on the page")
    .when("I perform an action")
    .then("I should see the expected result")
    .done()
    ._build(),
  "web"
);

await run();
`,
  api: `import { feature, test, run } from "copilot-test";

test(
  feature("<FEATURE_NAME>")
    .tag("@api")
    .scenario("<SCENARIO_NAME>")
    .tag("@smoke")
    .given("I have the required data")
    .when("I send a request to the API")
    .then("I should receive the expected response")
    .done()
    ._build(),
  "api"
);

await run();
`,
  mobile: `import { feature, test, run } from "copilot-test";

test(
  feature("<FEATURE_NAME>")
    .tag("@mobile")
    .scenario("<SCENARIO_NAME>")
    .tag("@smoke")
    .given("I have the app open")
    .when("I interact with the UI")
    .then("I should see the expected behavior")
    .done()
    ._build(),
  "mobile"
);

await run();
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
  const fileName = await prompt("File name:", `${featureName.toLowerCase().replace(/\s+/g, "-")}.spec.ts`);

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
  console.log(`  1. Edit ${filePath} to add your test steps`);
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
