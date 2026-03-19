/**
 * Example Configuration with AI Cost Tracking
 *
 * This example demonstrates how to configure AI cost tracking and budget management
 * in CopilotTest to monitor and optimize AI model usage costs.
 */

import { configure, feature, test, run } from "./src/index.js";
import { webPlatform } from "./src/platforms/web.js";

// Configure with cost tracking enabled
configure({
  // AI Model Configuration
  model: "gpt-4o", // or "gpt-4o-mini" for lower costs

  // Platform configurations
  platforms: {
    web: webPlatform({
      headless: true,
      baseUrl: "https://example.com",
    }),
  },

  // ============================================
  // AI Cost Tracking Configuration
  // ============================================
  costTracking: {
    // Enable cost tracking
    enabled: true,

    // Model pricing (cost per token in USD)
    // These are default prices - update them based on your actual pricing
    pricing: {
      "gpt-4o": {
        input: 0.0025 / 1000,  // $2.50 per 1M input tokens
        output: 0.01 / 1000,   // $10 per 1M output tokens
      },
      "gpt-4o-mini": {
        input: 0.00015 / 1000, // $0.15 per 1M input tokens
        output: 0.0006 / 1000, // $0.60 per 1M output tokens
      },
      "gpt-4": {
        input: 0.03 / 1000,    // $30 per 1M input tokens
        output: 0.06 / 1000,   // $60 per 1M output tokens
      },
    },

    // Budget limits to control costs
    budget: {
      perTest: 0.50,      // Maximum $0.50 per test scenario
      daily: 10.00,       // Maximum $10.00 per day
      monthly: 200.00,    // Maximum $200.00 per month
    },

    // Alert handlers for budget monitoring
    alerts: {
      // Called when cost approaches limit (80% threshold)
      onThresholdReached: (cost, limit) => {
        console.warn(`⚠️  Cost Warning: ${cost.toFixed(4)} approaching limit ${limit.toFixed(4)}`);
      },

      // Called when budget is exceeded
      onBudgetExceeded: (cost, limit) => {
        console.error(`🚨 Budget Exceeded: ${cost.toFixed(4)} > ${limit.toFixed(4)}`);
        // You could throw an error here to stop execution
        // throw new Error(`Budget exceeded: ${cost.toFixed(4)} > ${limit.toFixed(4)}`);
      },
    },
  },

  // ============================================
  // Cost Optimization (Future Enhancement)
  // ============================================
  optimization: {
    // Use cheaper models for simple steps
    adaptiveModel: {
      enabled: false, // Not yet implemented
      simpleSteps: "gpt-4o-mini",  // Use mini for Given/When steps
      validations: "gpt-4o",        // Use full model for Then steps
    },

    // Cache AI responses to reduce duplicate calls
    cache: {
      enabled: false, // Not yet implemented
      ttl: 86400,     // 24 hours
    },

    // Reuse sessions across scenarios
    sessionReuse: false, // Not yet implemented
  },

  // Output directory for reports
  outputDir: "copilot-test-results",

  // Other configurations
  stepTimeout: 30000,
  retries: 0,
});

// Example test with cost tracking
const loginFeature = feature("User Authentication")
  .description("Test login workflows with cost tracking")
  .tag("@auth", "@cost-tracking-demo")

  .scenario("Successful login")
    .tag("@smoke")
    .given("I am on the login page")
    .when("I enter username 'admin' and password 'admin123'")
    .and("I click the Login button")
    .then("I should see the dashboard")
    .and("I should see my username displayed")
    .done()

  .scenario("Failed login with invalid credentials")
    .given("I am on the login page")
    .when("I enter username 'admin' and password 'wrongpassword'")
    .and("I click the Login button")
    .then("I should see an error message")
    .and("I should still be on the login page")
    .done();

test(loginFeature, "web");

// Run tests
// After execution, you'll see:
// 1. Cost summary in console output
// 2. Cost metrics in HTML report
// 3. Cost details in JSON report
// 4. Budget alerts if limits are exceeded

// Example output:
// ============================================================
//
// 📊 Results:
//   Total:   2
//   Passed:  2 ✅
//   Failed:  0 ❌
//   Skipped: 0 ⊘
//   Pass rate: 100%
//   Duration: 5432ms
//
// 💰 AI Cost Summary:
//   Total Cost: $0.0234
//   Total Tokens: 2.34K
//     - Input:  1.89K ($0.0047)
//     - Output: 451 ($0.0045)
//   Average cost per scenario: $0.0117
//   Most expensive: User Authentication::Successful login ($0.0145)
//
// 📁 Report saved to: copilot-test-results/

if (require.main === module) {
  run();
}

export { loginFeature };
