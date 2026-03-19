/**
 * Example demonstrating Scenario Outline feature for parameterized testing.
 * This file shows how to use scenarioOutline() and examples() for data-driven tests.
 */

import { feature } from "../src/dsl.js";
import { configure, test, run } from "../src/runner.js";
import { webPlatform } from "../src/platforms/web.js";

// Configure test runtime
configure({
  platforms: {
    web: webPlatform(),
  },
  outputDir: "./test-results",
});

// Example 1: Login with different credentials
test(
  feature("User Authentication")
    .description("Test login with multiple user types")
    .scenarioOutline("Login with different credentials")
      .tag("@auth", "@parameterized")
      .given("I am on the login page")
      .when('I enter username "<username>" and password "<password>"')
      .and("I click the Login button")
      .then('I should see "<message>"')
      .examples([
        { username: "admin", password: "admin123", message: "Welcome Admin" },
        { username: "user", password: "user123", message: "Welcome User" },
        { username: "guest", password: "guest123", message: "Welcome Guest" },
        { username: "invalid", password: "wrong", message: "Invalid credentials" },
        { username: "", password: "", message: "Please fill all fields" },
      ])
      .done()
    ._build(),
  "web"
);

// Example 2: Search functionality with different queries
test(
  feature("Search Functionality")
    .scenarioOutline("Search with different queries")
      .tag("@search")
      .given("I am on the search page")
      .when('I search for "<query>"')
      .then('I should see "<expectedCount>" results')
      .and('the results should contain "<keyword>"')
      .examples([
        { query: "typescript", expectedCount: "10", keyword: "TypeScript" },
        { query: "javascript", expectedCount: "15", keyword: "JavaScript" },
        { query: "python", expectedCount: "8", keyword: "Python" },
      ])
      .done()
    ._build(),
  "web"
);

// Example 3: Form validation with different inputs
test(
  feature("Form Validation")
    .scenarioOutline("Validate email field")
      .given("I am on the registration form")
      .when('I enter email "<email>"')
      .and("I submit the form")
      .then('I should see validation message "<validationMessage>"')
      .examples([
        { email: "valid@example.com", validationMessage: "Email is valid" },
        { email: "invalid.email", validationMessage: "Please enter a valid email" },
        { email: "@example.com", validationMessage: "Please enter a valid email" },
        { email: "", validationMessage: "Email is required" },
      ])
      .done()
    ._build(),
  "web"
);

// Example 4: Mixing regular scenarios with scenario outlines
test(
  feature("Shopping Cart")
    .scenario("Add single item to cart")
      .given("I am on the product page")
      .when("I click Add to Cart")
      .then("I should see 1 item in cart")
      .done()
    .scenarioOutline("Add multiple quantities")
      .given("I am on the product page")
      .when('I select quantity "<quantity>"')
      .and("I click Add to Cart")
      .then('I should see "<quantity>" items in cart')
      .examples([
        { quantity: "2" },
        { quantity: "5" },
        { quantity: "10" },
      ])
      .done()
    ._build(),
  "web"
);

// Run all tests
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("🚀 Running Scenario Outline Examples...\n");
  console.log("Note: These are example tests demonstrating the API.");
  console.log("They will run in mock mode (no real browser interaction).\n");

  run().then(() => {
    console.log("\n✅ Example tests completed!");
    console.log("\nKey features demonstrated:");
    console.log("  • scenarioOutline() method for parameterized tests");
    console.log("  • examples() method with data arrays");
    console.log("  • Parameter substitution using <placeholders>");
    console.log("  • Mixing regular scenarios with scenario outlines");
    console.log("  • Each example becomes a separate test execution");
  });
}
