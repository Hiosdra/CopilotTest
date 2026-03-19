/**
 * Accessibility Testing with Custom Step Definitions
 *
 * This example demonstrates how to use pre-defined accessibility steps
 * for natural language accessibility testing.
 *
 * Run with: COPILOT_A11Y_STEPS_LIVE=1 tsx tests/a11y-steps-example.spec.ts
 */

import {
  feature,
  configure,
  run,
  webPlatform,
  registerAccessibilitySteps,
} from "../src/index.js";

// Only run if explicitly enabled
if (!process.env.COPILOT_A11Y_STEPS_LIVE) {
  console.log("⏭️  Skipping accessibility steps example. Set COPILOT_A11Y_STEPS_LIVE=1 to run.");
  process.exit(0);
}

// Register accessibility step definitions
registerAccessibilitySteps();

// Configure test framework
configure({
  model: "gpt-4o",
  platforms: {
    web: webPlatform({
      browser: "chromium",
      headless: false,
      baseUrl: "https://www.example.com",
    }),
  },
  useCustomStepDefinitions: true, // Enable custom steps
  outputDir: "copilot-test-results",
});

// Example 1: Basic WCAG compliance check
feature("Accessibility - Basic Compliance")
  .scenario("Check WCAG compliance using natural language")
    .given("I am on the example.com homepage")
    .when("I check WCAG compliance")
    .then("the accessibility score should be at least 80")
    .and("there should be no critical violations");

// Example 2: Keyboard navigation
feature("Accessibility - Keyboard Navigation")
  .scenario("Verify keyboard accessibility")
    .given("I am on the example.com homepage")
    .then("I can navigate the page with keyboard")
    .and("the tab order should be correct");

// Example 3: Screen reader compatibility
feature("Accessibility - Screen Reader")
  .scenario("Check screen reader support")
    .given("I am on the example.com homepage")
    .then("the page should be screen reader compatible")
    .and("all images should have alt text")
    .and("the page should have proper ARIA landmarks");

// Example 4: Form accessibility
feature("Accessibility - Forms")
  .scenario("Validate form accessibility")
    .given("I navigate to a page with a form")
    .then("all form fields should have labels")
    .and("the color contrast should meet WCAG AA standards");

// Example 5: Heading structure
feature("Accessibility - Content Structure")
  .scenario("Check semantic HTML structure")
    .given("I am on the example.com homepage")
    .then("the heading structure should be valid")
    .and("there should be no serious violations");

// Example 6: Comprehensive accessibility test
feature("Accessibility - Full Audit")
  .scenario("Complete accessibility validation")
    .given("I am on the example.com homepage")
    .when("I verify WCAG2AA compliance")
    .then("the accessibility score should be above 85")
    .and("there should be no critical violations")
    .and("there should be no serious violations")
    .and("I can navigate using keyboard")
    .and("the page should be screen reader compatible")
    .and("all images should have alt text")
    .and("the heading structure should be valid");

// Example 7: Mixed AI and custom steps
feature("Accessibility - Mixed Testing")
  .scenario("Combine AI and custom accessibility steps")
    .given("I navigate to https://www.example.com")
    .and("I wait for the page to load")
    .when("I check accessibility") // Custom step
    .then("the accessibility score should be at least 75") // Custom step
    .and("I should see the main heading") // AI step
    .and("there should be no accessibility violations"); // Custom step

// Run all tests
await run();

console.log("\n✨ All accessibility tests completed!");
console.log("📊 Check the HTML report in copilot-test-results/report.html");
