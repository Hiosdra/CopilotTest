/**
 * Performance Monitoring Example
 *
 * This example demonstrates how to use the performance monitoring
 * features in CopilotTest to track and analyze test execution metrics.
 *
 * To run this example:
 * COPILOT_PERFORMANCE_LIVE=1 tsx examples/performance-monitoring.ts
 */

import {
  feature,
  configure,
  test,
  run,
  webPlatform,
  analyzePerformance,
  generatePerformanceReport,
} from "../src/index.js";

// Configure with performance monitoring enabled
configure({
  platforms: {
    web: webPlatform(),
  },
  stepTimeout: 30000,
  outputDir: "copilot-test-results",
  // Enable performance monitoring with thresholds
  performance: {
    warnThreshold: 5000,   // Warn if step takes > 5s
    failThreshold: 10000,  // Fail if step takes > 10s
    trackTrends: true,     // Track performance trends over time
    trendsFile: "performance-trends.json",
  },
});

// Define a test with steps that will be monitored
const loginFeature = feature("User Login Performance")
  .description("Monitor login flow performance")
  .tag("@performance")
  .scenario("Successful login with performance tracking")
    .given("I am on the login page")
    .when("I enter username 'admin' and password 'password123'")
    .and("I click the login button")
    .then("I should see the dashboard within 3 seconds")
    .and("The page should be fully loaded")
    .done()
  ._build();

test(loginFeature, "web");

// Only run if explicitly enabled
if (process.env.COPILOT_PERFORMANCE_LIVE === "1") {
  console.log("\n🎯 Running Performance Monitoring Example\n");

  // Run the tests
  const testRun = await run();

  console.log("\n" + "=".repeat(60));
  console.log("Performance Analysis");
  console.log("=".repeat(60));

  // Analyze performance
  const perfSummary = analyzePerformance(testRun);

  console.log(`\nTotal Duration: ${perfSummary.totalDuration}ms`);
  console.log(`Average Step Duration: ${perfSummary.avgStepDuration.toFixed(1)}ms`);
  console.log(`Average AI Think Time: ${perfSummary.avgAiThinkTime.toFixed(1)}ms`);
  console.log(`Average Execution Time: ${perfSummary.avgExecutionTime.toFixed(1)}ms`);

  if (perfSummary.slowestStep) {
    console.log(
      `\nSlowest Step: "${perfSummary.slowestStep.step}" (${perfSummary.slowestStep.duration}ms)`
    );
  }

  if (perfSummary.fastestStep) {
    console.log(
      `Fastest Step: "${perfSummary.fastestStep.step}" (${perfSummary.fastestStep.duration}ms)`
    );
  }

  console.log(`\nTotal Screenshots: ${perfSummary.totalScreenshots}`);
  console.log(`Total Network Requests: ${perfSummary.totalNetworkRequests}`);

  // Generate full performance report
  console.log(generatePerformanceReport(testRun));

  console.log("\n✅ Performance monitoring example completed!");
  console.log("📊 Check the HTML report for detailed performance metrics.");
} else {
  console.log("\n⏭️  Skipping live performance test (set COPILOT_PERFORMANCE_LIVE=1 to run)\n");
}
