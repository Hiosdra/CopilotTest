/**
 * Demo script to showcase the enhanced reporting features
 * This creates sample test runs to demonstrate:
 * - Enhanced HTML reports with filtering and search
 * - Dashboard with multiple runs
 * - Trends tracking
 * - Comparison between runs
 */

import type { TestRun } from "../src/types.js";
import { generateReport } from "../src/reporter.js";
import { compareTestRuns } from "../src/compare.js";

// Create sample test run 1
const testRun1: TestRun = {
  startedAt: new Date("2024-01-15T10:30:00Z"),
  finishedAt: new Date("2024-01-15T10:32:15Z"),
  features: [
    {
      feature: {
        name: "User Authentication",
        description: "Test user login and authentication flows",
        tags: ["@auth", "@smoke"],
        scenarios: [],
      },
      scenarios: [
        {
          scenario: {
            name: "Successful login with valid credentials",
            tags: ["@smoke", "@critical"],
            steps: [],
          },
          status: "passed",
          duration: 1250,
          steps: [
            {
              step: { keyword: "Given", text: "I am on the login page" },
              status: "passed",
              duration: 300,
              aiReasoning: "Navigated to login page successfully",
            },
            {
              step: { keyword: "When", text: "I enter valid credentials" },
              status: "passed",
              duration: 450,
              aiReasoning: "Filled in username and password fields",
            },
            {
              step: { keyword: "Then", text: "I should see the dashboard" },
              status: "passed",
              duration: 500,
              aiReasoning: "Dashboard loaded successfully",
            },
          ],
        },
        {
          scenario: {
            name: "Failed login with invalid credentials",
            tags: ["@smoke"],
            steps: [],
          },
          status: "passed",
          duration: 850,
          steps: [
            {
              step: { keyword: "Given", text: "I am on the login page" },
              status: "passed",
              duration: 250,
            },
            {
              step: { keyword: "When", text: "I enter invalid credentials" },
              status: "passed",
              duration: 300,
            },
            {
              step: { keyword: "Then", text: "I should see an error message" },
              status: "passed",
              duration: 300,
              aiReasoning: "Error message displayed correctly",
            },
          ],
        },
      ],
      duration: 2100,
    },
    {
      feature: {
        name: "Shopping Cart",
        tags: ["@cart"],
        scenarios: [],
      },
      scenarios: [
        {
          scenario: {
            name: "Add item to cart",
            tags: ["@cart", "@critical"],
            steps: [],
          },
          status: "failed",
          duration: 1500,
          steps: [
            {
              step: { keyword: "Given", text: "I am viewing a product" },
              status: "passed",
              duration: 400,
            },
            {
              step: { keyword: "When", text: "I click Add to Cart" },
              status: "passed",
              duration: 500,
            },
            {
              step: { keyword: "Then", text: "the cart count should increase" },
              status: "failed",
              duration: 600,
              error: "Cart count did not update",
              aiReasoning: "Cart API returned 500 error",
            },
          ],
        },
      ],
      duration: 1500,
    },
  ],
  summary: {
    total: 3,
    passed: 2,
    failed: 1,
    skipped: 0,
  },
  metadata: {
    timestamp: "2024-01-15T10:30:00Z",
    duration: 135000,
    environment: "staging",
    git: {
      branch: "main",
      commit: "abc1234",
      author: "John Doe",
    },
    ci: {
      buildNumber: "100",
      jobUrl: "https://github.com/example/repo/actions/runs/100",
    },
  },
};

// Create sample test run 2 (improved)
const testRun2: TestRun = {
  startedAt: new Date("2024-01-15T14:20:00Z"),
  finishedAt: new Date("2024-01-15T14:21:45Z"),
  features: [
    {
      feature: {
        name: "User Authentication",
        description: "Test user login and authentication flows",
        tags: ["@auth", "@smoke"],
        scenarios: [],
      },
      scenarios: [
        {
          scenario: {
            name: "Successful login with valid credentials",
            tags: ["@smoke", "@critical"],
            steps: [],
          },
          status: "passed",
          duration: 950,
          steps: [
            {
              step: { keyword: "Given", text: "I am on the login page" },
              status: "passed",
              duration: 200,
              aiReasoning: "Navigated to login page successfully",
            },
            {
              step: { keyword: "When", text: "I enter valid credentials" },
              status: "passed",
              duration: 350,
              aiReasoning: "Filled in username and password fields",
            },
            {
              step: { keyword: "Then", text: "I should see the dashboard" },
              status: "passed",
              duration: 400,
              aiReasoning: "Dashboard loaded successfully",
            },
          ],
        },
        {
          scenario: {
            name: "Failed login with invalid credentials",
            tags: ["@smoke"],
            steps: [],
          },
          status: "passed",
          duration: 750,
          steps: [
            {
              step: { keyword: "Given", text: "I am on the login page" },
              status: "passed",
              duration: 200,
            },
            {
              step: { keyword: "When", text: "I enter invalid credentials" },
              status: "passed",
              duration: 250,
            },
            {
              step: { keyword: "Then", text: "I should see an error message" },
              status: "passed",
              duration: 300,
              aiReasoning: "Error message displayed correctly",
            },
          ],
        },
      ],
      duration: 1700,
    },
    {
      feature: {
        name: "Shopping Cart",
        tags: ["@cart"],
        scenarios: [],
      },
      scenarios: [
        {
          scenario: {
            name: "Add item to cart",
            tags: ["@cart", "@critical"],
            steps: [],
          },
          status: "passed", // FIXED!
          duration: 1200,
          steps: [
            {
              step: { keyword: "Given", text: "I am viewing a product" },
              status: "passed",
              duration: 350,
            },
            {
              step: { keyword: "When", text: "I click Add to Cart" },
              status: "passed",
              duration: 450,
            },
            {
              step: { keyword: "Then", text: "the cart count should increase" },
              status: "passed",
              duration: 400,
              aiReasoning: "Cart count updated correctly",
            },
          ],
        },
      ],
      duration: 1200,
    },
  ],
  summary: {
    total: 3,
    passed: 3,
    failed: 0,
    skipped: 0,
  },
  metadata: {
    timestamp: "2024-01-15T14:20:00Z",
    duration: 105000,
    environment: "staging",
    git: {
      branch: "main",
      commit: "def5678",
      author: "Jane Smith",
    },
    ci: {
      buildNumber: "101",
      jobUrl: "https://github.com/example/repo/actions/runs/101",
    },
  },
};

// Generate reports
console.log("📊 Generating sample reports...\n");

await generateReport(testRun1, "copilot-test-results");
console.log("✓ Generated first test run report");

// Wait a moment to ensure different timestamps
await new Promise(resolve => setTimeout(resolve, 100));

await generateReport(testRun2, "copilot-test-results");
console.log("✓ Generated second test run report");
console.log("✓ Generated dashboard and trends");

// Generate comparison
const comparison = await compareTestRuns(
  "copilot-test-results/runs/" + testRun1.startedAt.toISOString().replace(/[:.]/g, "-").slice(0, -5) + ".json",
  "copilot-test-results/runs/" + testRun2.startedAt.toISOString().replace(/[:.]/g, "-").slice(0, -5) + ".json",
  "copilot-test-results/comparison.html"
);

console.log("\n📈 Comparison Results:");
console.log(`  Improvements:     ${comparison.changes.improved.length}`);
console.log(`  Regressions:      ${comparison.changes.regressed.length}`);
console.log(`  Duration Change:  ${comparison.performance.durationChange}`);

console.log("\n✅ Demo complete! Open these files in your browser:");
console.log("  - copilot-test-results/index.html (Dashboard)");
console.log("  - copilot-test-results/report.html (Latest report)");
console.log("  - copilot-test-results/comparison.html (Comparison)");
