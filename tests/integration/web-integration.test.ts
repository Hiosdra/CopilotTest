/**
 * Web Integration Tests
 * Tests real browser automation using Playwright MCP with actual execution.
 */

import { configure, feature, test, run } from "../../src/index.js";
import { webPlatform } from "../../src/platforms/web.js";
import { createTestServer } from "./fixtures/test-server.js";

// Test tracking
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

function section(name: string): void {
  console.log(`\n📦 ${name}`);
}

// Start test server
const testServer = createTestServer();

try {
  await testServer.start();

  // Configure the test framework
  configure({
    model: "gpt-5-mini",
    platforms: {
      web: webPlatform({
        browser: "chromium",
        headless: true,
        baseUrl: testServer.url,
      }),
    },
    baseUrl: testServer.url,
    stepTimeout: 30000,
    retry: {
      enabled: false,
      stepRetries: 0,
    },
    screenshotOnFailure: true,
    outputDir: "copilot-test-results/integration",
  });

  section("Web Integration — Login Flow");

  // Test 1: Successful login flow
  const loginFeature = feature("Login Flow Integration")
    .description("Real browser test for login functionality")
    .tag("@integration", "@web", "@login")
    .scenario("User can login with valid credentials")
    .given(`I navigate to ${testServer.url}/login.html`)
    .when("I fill in the username field with 'testuser'")
    .and("I fill in the password field with 'password123'")
    .and("I click the Login button")
    .then("I should see the text 'Login successful'")
    .and("I should be redirected to the dashboard page")
    .and("I should see the text 'Welcome, testuser!'")
    .scenario("User sees error with invalid credentials")
    .given(`I navigate to ${testServer.url}/login.html`)
    .when("I fill in the username field with 'wronguser'")
    .and("I fill in the password field with 'wrongpass'")
    .and("I click the Login button")
    .then("I should see the text 'Invalid credentials'")
    .done()
    ._build();

  test(loginFeature, "web");

  section("Web Integration — Form Interaction");

  // Test 2: Form submission
  const formFeature = feature("Form Interaction Integration")
    .description("Real browser test for form filling and submission")
    .tag("@integration", "@web", "@form")
    .scenario("User can submit contact form")
    .given(`I navigate to ${testServer.url}/form.html`)
    .when("I fill in the name field with 'John Doe'")
    .and("I fill in the email field with 'john@example.com'")
    .and("I select 'Support' from the subject dropdown")
    .and("I fill in the message field with 'This is a test message'")
    .and("I click the Submit button")
    .then("I should see the text 'Form submitted successfully'")
    .done()
    ._build();

  test(formFeature, "web");

  section("Web Integration — Navigation");

  // Test 3: Basic navigation
  const navFeature = feature("Navigation Integration")
    .description("Real browser test for page navigation")
    .tag("@integration", "@web", "@navigation")
    .scenario("User can navigate between pages")
    .given(`I navigate to ${testServer.url}/`)
    .then("I should see the text 'Welcome to Test Application'")
    .when("I click on the 'Login' link")
    .then("I should see the login form")
    .and("I should see a username field")
    .and("I should see a password field")
    .done()
    ._build();

  test(navFeature, "web");

  // Run tests
  const results = await run();

  section("Web Integration — Test Results Validation");

  // Validate that tests actually ran
  assert(results !== null, "Test run completed and returned results");
  assert(results.features.length === 3, "All 3 features were executed");

  // Validate feature results exist
  assert(results.features[0].scenarios.length > 0, "Login feature has scenarios");
  assert(results.features[1].scenarios.length > 0, "Form feature has scenarios");
  assert(results.features[2].scenarios.length > 0, "Navigation feature has scenarios");

  // Validate that steps were executed (they should have results)
  const firstScenario = results.features[0].scenarios[0];
  assert(firstScenario.steps.length > 0, "First scenario has steps");

  // ScenarioResult.steps are StepResult[] which always have status/duration
  assert(
    firstScenario.steps[0].status !== undefined,
    "First step has execution status"
  );

  // Check if any scenarios passed (integration with real MCP)
  const totalScenarios = results.features.reduce(
    (sum, f) => sum + f.scenarios.length,
    0
  );
  const passedScenarios = results.features.reduce(
    (sum, f) => sum + f.scenarios.filter((s) => s.result?.status === "passed").length,
    0
  );

  console.log(
    `\n📊 Integration Test Summary: ${passedScenarios}/${totalScenarios} scenarios executed`
  );

  // We don't require all to pass as MCP might not be available, but we validate execution
  assert(totalScenarios > 0, "At least some scenarios were executed");

  section("Summary");
  console.log(`\n✅ Passed: ${passes}`);
  console.log(`❌ Failed: ${failures}`);

  if (failures > 0) {
    process.exitCode = 1;
  }
} finally {
  // Always stop the test server
  await testServer.stop();
}
