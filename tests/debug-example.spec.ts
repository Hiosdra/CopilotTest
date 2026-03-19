/**
 * Example demonstrating debug mode features
 *
 * Run with: tsx tests/debug-example.spec.ts
 *
 * This example shows:
 * 1. Enabling debug mode at configuration level
 * 2. Setting breakpoints on specific steps
 * 3. Using .debug() on individual scenarios
 */

import { configure, feature, test, run, webPlatform } from "../src/index.js";

// Example 1: Debug mode with breakpoints via configuration
configure({
  model: "gpt-4o",
  platforms: {
    web: webPlatform({
      browser: "chromium",
      headless: true,
      baseUrl: "https://example.com",
    }),
  },
  // Enable debug features globally
  debugMode: false, // Set to true to enable debug for all scenarios
  breakpoints: [
    "When I click the submit button",
    "Then I should see an error message",
  ],
  interactive: false, // Set to true for step-by-step execution
  outputDir: "./test-reports",
});

// Example 2: Debug mode on specific scenario using .debug()
const loginFeature = feature("User Login")
  .description("Test various login scenarios with debug capabilities")
  .scenario("Successful admin login")
    .given("I am on the login page")
    .when("I enter username 'admin' and password 'secret123'")
    .and("I click the login button")
    .then("I should be redirected to the dashboard")
    .and("I should see 'Welcome Admin' message")
    .scenario("Failed login with invalid credentials")
    .debug() // Enable debug mode for this scenario only
    .given("I am on the login page")
    .when("I enter username 'invalid' and password 'wrong'")
    .and("I click the login button")
    .then("I should see an error message")
    .and("I should remain on the login page")
    .done()
  ._build();

test(loginFeature, "web");

// Example 3: Debug mode with breakpoints
const checkoutFeature = feature("Shopping Cart Checkout")
  .scenario("Complete purchase flow")
    .given("I have items in my cart")
    .when("I proceed to checkout")
    .and("I enter shipping information")
    .and("I enter payment details")
    .and("I click the submit button") // This will trigger breakpoint
    .then("I should see a confirmation message")
    .and("I should receive an order number")
    .done()
  ._build();

test(checkoutFeature, "web");

console.log("\n📚 Debug Mode Example");
console.log("=".repeat(60));
console.log("\nThis example demonstrates debug mode features:");
console.log("\n1. Global debug mode:");
console.log("   configure({ debugMode: true })");
console.log("\n2. Breakpoints on specific steps:");
console.log("   configure({ breakpoints: ['When I click the submit button'] })");
console.log("\n3. Interactive step-through:");
console.log("   configure({ interactive: true })");
console.log("\n4. Scenario-level debug:");
console.log("   scenario('Test').debug().given(...)");
console.log("\n5. Interactive console commands:");
console.log("   - continue (c)    : Continue execution");
console.log("   - step (s)        : Execute next step");
console.log("   - skip            : Skip current step");
console.log("   - inspect context : Show scenario details");
console.log("   - inspect results : Show step results");
console.log("   - retry [input]   : Retry step");
console.log("   - exit (q)        : Exit debug mode");
console.log("\n" + "=".repeat(60));
console.log("\n💡 To enable interactive debugging:");
console.log("   1. Set debugMode: true in configure()");
console.log("   2. Or call .debug() on specific scenarios");
console.log("   3. Run your tests and use the interactive console\n");

// Note: Actual execution would require Copilot SDK setup
// This is a demonstration of the API
// Uncomment below to run (requires proper setup):
// await run();
