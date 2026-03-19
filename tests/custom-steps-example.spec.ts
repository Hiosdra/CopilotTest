/**
 * Example: Custom Step Definitions with AI Fallback
 *
 * This example demonstrates how to use custom step definitions for critical
 * business logic while falling back to AI for other steps.
 */

import {
  feature,
  configure,
  test,
  run,
  defineStep,
  webPlatform,
} from "../src/index.js";

// Configure the test framework
configure({
  model: "gpt-4o",
  platforms: {
    web: webPlatform({
      browser: "chromium",
      baseUrl: "https://example.com",
    }),
  },
  stepTimeout: 30000,
  useCustomStepDefinitions: true, // Enable custom steps (default: true)
});

// ─────────────────────────────────────────────────────────────
// Define Custom Steps for Critical Business Logic
// ─────────────────────────────────────────────────────────────

/**
 * Custom login step with exact implementation.
 * This ensures deterministic behavior for authentication.
 */
defineStep(
  /^I login as "(.+)" with password "(.+)"$/,
  async (context, username, password) => {
    const { session } = context;
    console.log(`  🔧 [Custom] Logging in as ${username}`);

    // In a real implementation, you would use session to access Playwright tools
    // For this example, we'll simulate the login
    // Example: const page = await session.getPage();
    // await page.goto('/login');
    // await page.fill('#username', username);
    // await page.fill('#password', password);
    // await page.click('button[type="submit"]');

    // Simulated login logic
    if (username === "admin" && password === "admin123") {
      console.log(`  ✓ Login successful`);
    } else {
      throw new Error(`Invalid credentials for ${username}`);
    }
  }
);

/**
 * Custom step for API token retrieval.
 * Ensures consistent token management across tests.
 */
defineStep(/^I have a valid API token$/, async (context) => {
  console.log(`  🔧 [Custom] Retrieving API token`);

  // In a real implementation, you would retrieve an actual token
  // Example: const token = await authService.getToken();
  // context.session.setToken(token);

  console.log(`  ✓ API token acquired`);
});

/**
 * Custom step for database cleanup.
 * Critical for test isolation and reliability.
 */
defineStep(/^the database is clean$/, async (context) => {
  console.log(`  🔧 [Custom] Cleaning database`);

  // In a real implementation, you would clean the database
  // Example: await db.query('DELETE FROM test_data WHERE created_by = ?', ['test']);

  console.log(`  ✓ Database cleaned`);
});

/**
 * Custom step with data table support.
 * Processes table data for form filling.
 */
defineStep(/^I fill the form with the following data$/, async (context) => {
  const { step } = context;

  if (!step.table) {
    throw new Error("Expected data table for form filling");
  }

  console.log(`  🔧 [Custom] Filling form with ${step.table.length - 1} rows`);

  // In a real implementation, you would iterate through the table
  // const [headers, ...rows] = step.table;
  // for (const row of rows) {
  //   const data = Object.fromEntries(headers.map((h, i) => [h, row[i]]));
  //   await page.fill(`#${data.field}`, data.value);
  // }

  console.log(`  ✓ Form filled`);
});

// ─────────────────────────────────────────────────────────────
// Define Test Scenarios (Hybrid: Custom + AI Steps)
// ─────────────────────────────────────────────────────────────

const hybridFeature = feature("Hybrid Testing")
  .description(
    "Demonstrates mixing custom step definitions with AI-driven steps"
  )
  .tag("@example")
  .tag("@custom-steps")

  .background()
    .given("the database is clean") // Uses custom definition
    .and("I have a valid API token") // Uses custom definition

  .scenario("Admin login with custom steps")
    .tag("@smoke")
    .given('I login as "admin" with password "admin123"') // Uses custom definition
    .when("I click on the profile menu") // Uses AI (no custom definition)
    .then("I should see my username") // Uses AI (no custom definition)

  .scenario("User registration with mixed steps")
    .given("I am on the registration page") // Uses AI
    .when("I fill the form with the following data") // Uses custom definition
    .withTable([
      ["field", "value"],
      ["username", "newuser"],
      ["email", "newuser@example.com"],
      ["password", "securepass123"],
    ])
    .and("I click the Register button") // Uses AI
    .then("I should see a welcome message") // Uses AI
    .and("I should receive a confirmation email") // Uses AI

  .scenario("Dashboard access")
    .given('I login as "user" with password "user123"') // Uses custom definition
    .when("I navigate to the dashboard") // Uses AI
    .then("I should see my recent activity") // Uses AI
    .and("I should see the analytics widget") // Uses AI

  .done();

// ─────────────────────────────────────────────────────────────
// Run the Tests
// ─────────────────────────────────────────────────────────────

test(hybridFeature, "web");

// Note: Uncomment the following line to actually run the tests
// await run();

console.log("\n✅ Custom steps example loaded successfully!");
console.log("📝 This example demonstrates:");
console.log("   • Custom step definitions for critical business logic");
console.log("   • AI fallback for non-critical steps");
console.log("   • Data table support in custom steps");
console.log("   • Background steps with custom definitions");
console.log("   • Hybrid approach (custom + AI)");
console.log("\n💡 To run this example:");
console.log("   1. Uncomment the 'await run()' line above");
console.log("   2. Run: npx tsx tests/custom-steps-example.spec.ts");
console.log("   3. Or add to package.json scripts\n");
