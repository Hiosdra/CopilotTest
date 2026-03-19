/**
 * Test parallel execution with mock scenarios
 */

import { configure, test, run } from "../src/runner.js";
import { feature } from "../src/dsl.js";
import { webPlatform } from "../src/platforms/web.js";

// Configure with parallel execution enabled
configure({
  platforms: {
    web: webPlatform({ browser: "chromium", headless: true }),
  },
  parallel: true,
  maxWorkers: 4,
  workerTimeout: 30000,
  failFast: false,
});

// Create a feature with multiple scenarios to test parallel execution
const parallelFeature = feature("Parallel Test Suite")
  .description("Testing parallel scenario execution")
  .tag("@parallel")
  .scenario("Quick Test 1")
    .given("I have a test setup")
    .when("I execute a quick test")
    .then("the test should pass")
    .done()
  .scenario("Quick Test 2")
    .given("I have another test setup")
    .when("I execute another quick test")
    .then("the test should pass")
    .done()
  .scenario("Quick Test 3")
    .given("I have a third test setup")
    .when("I execute a third quick test")
    .then("the test should pass")
    .done()
  .scenario("Quick Test 4")
    .given("I have a fourth test setup")
    .when("I execute a fourth quick test")
    .then("the test should pass")
    .done()
  .scenario("Quick Test 5")
    .given("I have a fifth test setup")
    .when("I execute a fifth quick test")
    .then("the test should pass")
    .done()
  ._build();

test(parallelFeature, "web");

const startTime = Date.now();
const result = await run();
const duration = Date.now() - startTime;

console.log("\n🎯 Parallel Execution Validation:");
console.log(`   Total scenarios: ${result.summary.total}`);
console.log(`   Passed: ${result.summary.passed}`);
console.log(`   Failed: ${result.summary.failed}`);
console.log(`   Duration: ${duration}ms`);

// Verify results
if (result.summary.total !== 5) {
  console.error(`❌ Expected 5 scenarios, got ${result.summary.total}`);
  process.exit(1);
}

if (result.summary.passed !== 5) {
  console.error(`❌ Expected 5 passed scenarios, got ${result.summary.passed}`);
  process.exit(1);
}

console.log("\n✅ Parallel execution test completed successfully!");
