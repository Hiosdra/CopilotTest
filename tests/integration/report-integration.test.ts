/**
 * Report Integration Tests
 * Tests end-to-end report generation with real test execution.
 */

import { configure, feature, test, run } from "../../src/index.js";
import { webPlatform } from "../../src/platforms/web.js";
import { apiPlatform } from "../../src/platforms/api.js";
import { buildHtmlReport } from "../../src/reporter.js";
import { createTestServer } from "./fixtures/test-server.js";
import { readFile, access, mkdir } from "fs/promises";
import { join } from "path";

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

// Helper to check if file exists
async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// Start test server
const testServer = createTestServer();

try {
  await testServer.start();

  const outputDir = "copilot-test-results/integration-report-test";

  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  // Configure the test framework
  configure({
    model: "gpt-5-mini",
    platforms: {
      web: webPlatform({
        browser: "chromium",
        headless: true,
        baseUrl: testServer.url,
      }),
      api: apiPlatform({
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
    outputDir,
  });

  section("Report Integration — Test Execution");

  // Create separate features for each platform to ensure correct execution
  const webFeature = feature("Web Platform Tests")
    .description("Web tests for report generation")
    .tag("@integration", "@web", "@report")
    .scenario("Web test scenario")
    .given(`I navigate to ${testServer.url}/`)
    .then("I should see the welcome message")
    .done()
    ._build();

  const apiFeature = feature("API Platform Tests")
    .description("API tests for report generation")
    .tag("@integration", "@api", "@report")
    .scenario("API test scenario")
    .given("the API is available")
    .when("I send a GET request to /api/users")
    .then("I should get a list of users")
    .done()
    ._build();

  // Test on appropriate platforms
  test(webFeature, "web");
  test(apiFeature, "api");

  const apiFeature2 = feature("API Report Test")
    .description("API tests for report generation")
    .tag("@integration", "@api", "@report")
    .scenario("List users via API")
    .given(`the API is available at ${testServer.url}/api`)
    .when("I send a GET request to /api/users")
    .then("the response status should be 200")
    .done()
    ._build();

  // Test second API feature
  test(apiFeature2, "api");

  // Run tests and generate reports
  const results = await run();

  section("Report Integration — Report Generation Validation");

  // Validate test results exist
  assert(results !== null, "Test run completed with results");
  assert(results.features.length > 0, "At least one feature was executed");

  // Generate HTML report
  const htmlReport = buildHtmlReport(results);
  assert(htmlReport.length > 0, "HTML report was generated");
  assert(htmlReport.includes("<!DOCTYPE html>"), "Report contains valid HTML");
  assert(htmlReport.includes("CopilotTest Report"), "Report contains expected title");

  // Validate report structure
  assert(htmlReport.includes("<html"), "Report has html tag");
  assert(htmlReport.includes("<head"), "Report has head section");
  assert(htmlReport.includes("<body"), "Report has body section");
  assert(htmlReport.includes("<style"), "Report has CSS styles");

  // Validate report content
  assert(
    htmlReport.includes(results.features[0].feature.name),
    "Report includes feature name"
  );
  assert(
    htmlReport.includes(results.features[0].scenarios[0].scenario.name),
    "Report includes scenario name"
  );

  // Check for test statistics in report
  assert(htmlReport.includes("Total Scenarios"), "Report includes total count");
  assert(
    htmlReport.includes("Passed") || htmlReport.includes("Failed"),
    "Report includes pass/fail counts"
  );

  // Validate report metadata
  assert(
    htmlReport.includes(new Date().getFullYear().toString()),
    "Report includes timestamp with current year"
  );

  section("Report Integration — File System Validation");

  // Check if report files were created
  const reportPath = join(outputDir, "report.html");
  const reportExists = await fileExists(reportPath);

  if (reportExists) {
    console.log(`  ℹ Report file created at: ${reportPath}`);
    const reportContent = await readFile(reportPath, "utf-8");
    assert(reportContent.length > 0, "Report file has content");
    assert(reportContent.includes("<!DOCTYPE html>"), "Report file is valid HTML");
  } else {
    console.log(`  ℹ Report file not created (expected in some test modes)`);
  }

  section("Report Integration — Report Format Validation");

  // Test that report can handle different result statuses
  const hasPassedScenarios = results.features.some((f) =>
    f.scenarios.some((s) => s.result?.status === "passed")
  );
  const hasFailedScenarios = results.features.some((f) =>
    f.scenarios.some((s) => s.result?.status === "failed")
  );

  if (hasPassedScenarios) {
    console.log("  ℹ Report includes passed scenarios");
  }
  if (hasFailedScenarios) {
    console.log("  ℹ Report includes failed scenarios");
  }

  // Validate step-level reporting
  const firstScenario = results.features[0].scenarios[0];
  if (firstScenario.steps.length > 0) {
    assert(
      htmlReport.includes(firstScenario.steps[0].step.text),
      "Report includes step text"
    );
  }

  section("Report Integration — Multi-Feature Reporting");

  // Validate multi-feature report structure
  assert(
    results.features.length >= 2,
    "Multiple features executed for comprehensive report"
  );

  // Each feature should be represented in the report
  for (const featureResult of results.features) {
    assert(
      htmlReport.includes(featureResult.feature.name),
      `Report includes feature: ${featureResult.feature.name}`
    );
  }

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
