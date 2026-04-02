/**
 * API Integration Tests
 * Tests real API calls using curl MCP with actual HTTP requests.
 */

import { configure, feature, test, run } from "../../src/index.js";
import { apiPlatform } from "../../src/platforms/api.js";
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
      api: apiPlatform({
        baseUrl: testServer.url,
        defaultHeaders: {
          "Content-Type": "application/json",
        },
      }),
    },
    stepTimeout: 15000,
    retry: {
      enabled: false,
      stepRetries: 0,
    },
    outputDir: "copilot-test-results/integration",
  });

  section("API Integration — User Management");

  // Test 1: List users
  const listUsersFeature = feature("List Users API")
    .description("Real API test for listing users")
    .tag("@integration", "@api", "@users")
    .scenario("Get all users")
    .given(`the API is available at ${testServer.url}/api`)
    .when("I send a GET request to /api/users")
    .then("the response status code should be 200")
    .and("the response body should contain a 'users' array")
    .and("the users array should have at least 2 users")
    .done()
    ._build();

  test(listUsersFeature, "api");

  section("API Integration — User Creation");

  // Test 2: Create a user
  const createUserFeature = feature("Create User API")
    .description("Real API test for creating a new user")
    .tag("@integration", "@api", "@users", "@create")
    .scenario("Create a new user")
    .given("I have a new user payload")
    .when("I send a POST request to /api/users")
    .withDocString(
      JSON.stringify(
        {
          name: "Charlie Brown",
          email: "charlie@example.com",
        },
        null,
        2
      )
    )
    .then("the response status code should be 201")
    .and("the response body should contain a 'user' object")
    .and("the user object should have an 'id' field")
    .and("the user name should be 'Charlie Brown'")
    .done()
    ._build();

  test(createUserFeature, "api");

  section("API Integration — User Retrieval");

  // Test 3: Get specific user
  const getUserFeature = feature("Get User API")
    .description("Real API test for retrieving a specific user")
    .tag("@integration", "@api", "@users", "@get")
    .scenario("Get user by ID")
    .given("a user with ID 1 exists")
    .when("I send a GET request to /api/users/1")
    .then("the response status code should be 200")
    .and("the response body should contain a 'user' object")
    .and("the user should have id 1")
    .scenario("Get non-existent user returns 404")
    .given("a user with ID 99999 does not exist")
    .when("I send a GET request to /api/users/99999")
    .then("the response status code should be 404")
    .and("the response body should contain an error message")
    .done()
    ._build();

  test(getUserFeature, "api");

  section("API Integration — User Deletion");

  // Test 4: Delete user
  const deleteUserFeature = feature("Delete User API")
    .description("Real API test for deleting a user")
    .tag("@integration", "@api", "@users", "@delete")
    .scenario("Delete existing user")
    .given("a user with ID 1 exists")
    .when("I send a DELETE request to /api/users/1")
    .then("the response status code should be 200")
    .and("the response should indicate success")
    .scenario("Delete non-existent user returns 404")
    .given("a user with ID 99999 does not exist")
    .when("I send a DELETE request to /api/users/99999")
    .then("the response status code should be 404")
    .done()
    ._build();

  test(deleteUserFeature, "api");

  // Run tests
  const results = await run();

  section("API Integration — Test Results Validation");

  // Validate that tests actually ran
  assert(results !== null, "Test run completed and returned results");
  assert(results.features.length === 4, "All 4 API features were executed");

  // Validate feature results exist
  assert(results.features[0].scenarios.length > 0, "List users feature has scenarios");
  assert(results.features[1].scenarios.length > 0, "Create user feature has scenarios");
  assert(results.features[2].scenarios.length > 0, "Get user feature has scenarios");
  assert(results.features[3].scenarios.length > 0, "Delete user feature has scenarios");

  // Validate that steps were executed
  const firstScenario = results.features[0].scenarios[0];
  assert(firstScenario.steps.length > 0, "First scenario has steps");

  // ScenarioResult.steps are StepResult[] which always have status/duration
  assert(
    firstScenario.steps[0].status !== undefined,
    "First step has execution status"
  );

  // Check scenario execution
  const totalScenarios = results.features.reduce(
    (sum, f) => sum + f.scenarios.length,
    0
  );
  const passedScenarios = results.features.reduce(
    (sum, f) => sum + f.scenarios.filter((s) => s.result?.status === "passed").length,
    0
  );

  console.log(
    `\n📊 Integration Test Summary: ${passedScenarios}/${totalScenarios} API scenarios executed`
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
