/**
 * Example test demonstrating visual regression testing capabilities.
 *
 * This test shows how to use visual regression testing to detect visual changes
 * in web applications across different viewports and scenarios.
 *
 * To run this test with visual regression enabled, set the environment variable:
 * COPILOT_VISUAL_LIVE=1 npm run test:visual
 */

import {
  configure,
  feature,
  test,
  run,
  webPlatform,
  createVisualRegression,
} from "../src/index.js";

// Only run if explicitly enabled
const shouldRun = process.env.COPILOT_VISUAL_LIVE === "1";

if (!shouldRun) {
  console.log("⏭️  Skipping visual regression example (set COPILOT_VISUAL_LIVE=1 to run)");
  process.exit(0);
}

// Configure with visual regression enabled
configure({
  model: "gpt-4o",
  platforms: {
    web: webPlatform({
      browser: "chromium",
      headless: true,
      visualRegression: {
        enabled: true,
        threshold: 0.1,
        baselineDir: "tests/visual-baselines",
        diffDir: "copilot-test-results/visual-diffs",
      },
    }),
  },
  visualRegression: {
    enabled: true,
    threshold: 0.1, // 0.1% difference tolerance
    baselineDir: "tests/visual-baselines",
    diffDir: "copilot-test-results/visual-diffs",
    algorithm: "pixel",
  },
  outputDir: "copilot-test-results",
});

// Example 1: Full page visual regression
test(
  feature("Homepage Visual Regression")
    .tag("@visual")
    .tag("@smoke")
    .scenario("Visual consistency check")
      .given("I am on https://example.com")
      .then(async ({ page }) => {
        // Note: In actual usage, the AI agent would handle this through custom steps
        // or by understanding the visual regression instructions in the step text
        console.log("Taking full page screenshot for visual comparison");
        console.log("AI agent should use browser_take_screenshot tool");
        console.log("Baseline: tests/visual-baselines/homepage-full.png");
      })
      .and("I take a full page screenshot named 'homepage-full'")
      .and("the visual appearance matches the baseline within 0.1% threshold")
      .done()
    ._build(),
  "web"
);

// Example 2: Element-specific visual regression
test(
  feature("Product Card Visual Regression")
    .tag("@visual")
    .tag("@component")
    .scenario("Product card appearance")
      .given("I am on https://example.com/products")
      .when("I locate the first product card")
      .then("I take a screenshot of the product card element named 'product-card'")
      .and("the product card appearance matches the baseline")
      .done()
    ._build(),
  "web"
);

// Example 3: Responsive visual regression
test(
  feature("Responsive Design Visual Regression")
    .tag("@visual")
    .tag("@responsive")
    .scenario("Desktop viewport appearance")
      .given("I am on https://example.com")
      .and("the viewport is 1920x1080 pixels")
      .then("I take a screenshot named 'homepage-desktop'")
      .and("the appearance matches the baseline")
      .done()
    .scenario("Tablet viewport appearance")
      .given("I am on https://example.com")
      .and("the viewport is 768x1024 pixels")
      .then("I take a screenshot named 'homepage-tablet'")
      .and("the appearance matches the baseline")
      .done()
    .scenario("Mobile viewport appearance")
      .given("I am on https://example.com")
      .and("the viewport is 375x667 pixels")
      .then("I take a screenshot named 'homepage-mobile'")
      .and("the appearance matches the baseline")
      .done()
    ._build(),
  "web"
);

// Example 4: Visual regression with dynamic content hidden
test(
  feature("Visual Regression with Dynamic Content")
    .tag("@visual")
    .scenario("Hide dynamic elements before comparison")
      .given("I am on https://example.com/dashboard")
      .when("I hide elements with class 'timestamp'")
      .and("I hide elements with class 'ad-banner'")
      .and("I hide elements with class 'dynamic-content'")
      .then("I take a screenshot named 'dashboard-stable'")
      .and("the appearance matches the baseline")
      .done()
    ._build(),
  "web"
);

// Example 5: Visual regression after interaction
test(
  feature("Interactive Visual Regression")
    .tag("@visual")
    .tag("@interaction")
    .scenario("Modal dialog appearance")
      .given("I am on https://example.com")
      .when("I click the 'Open Modal' button")
      .and("I wait for the modal to appear")
      .then("I take a screenshot of the modal named 'modal-dialog'")
      .and("the modal appearance matches the baseline")
      .done()
    .scenario("Dropdown menu appearance")
      .given("I am on https://example.com")
      .when("I hover over the 'Menu' button")
      .and("I wait for the dropdown to appear")
      .then("I take a screenshot of the dropdown named 'dropdown-menu'")
      .and("the dropdown appearance matches the baseline")
      .done()
    ._build(),
  "web"
);

// Example 6: Visual regression with waiting for stability
test(
  feature("Visual Regression with Animation Stability")
    .tag("@visual")
    .tag("@animation")
    .scenario("Animated page after stabilization")
      .given("I am on https://example.com/animated-page")
      .and("I wait for all CSS animations to complete")
      .and("I wait for all web fonts to load")
      .and("I wait 1000ms for page stability")
      .then("I take a screenshot named 'animated-page-stable'")
      .and("the appearance matches the baseline")
      .done()
    ._build(),
  "web"
);

// Run all visual regression tests
console.log("\n🎨 Visual Regression Testing Example\n");
console.log("This example demonstrates visual regression testing capabilities.");
console.log("The AI agent will use Playwright MCP screenshot tools to capture and compare images.\n");

await run();

console.log("\n✅ Visual regression example complete!");
console.log("\nTo update baselines, run with: --update-visual-baselines flag");
console.log("To view diffs, check: copilot-test-results/visual-diffs/");
console.log("To review baselines, check: tests/visual-baselines/\n");
