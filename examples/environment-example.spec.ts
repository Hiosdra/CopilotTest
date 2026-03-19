/**
 * Example demonstrating environment management in CopilotTest
 *
 * Run with different environments:
 * - npm run test:env-example (defaults to local)
 * - COPILOT_ENV=staging tsx examples/environment-example.spec.ts
 * - COPILOT_ENV=production tsx examples/environment-example.spec.ts
 */

import { configure, feature, test, run, getEnvironment, getConfig } from "../src/index.js";
import { webPlatform } from "../src/platforms/web.js";
import { apiPlatform } from "../src/platforms/api.js";

// Configure with environment support
configure({
  model: "gpt-4o",
  reasoningEffort: "medium",

  // Default/base configuration
  platforms: {
    web: webPlatform({ browser: "chromium", headless: true }),
    api: apiPlatform({ defaultHeaders: { "Content-Type": "application/json" } }),
  },

  baseUrl: "http://localhost:3000",
  stepTimeout: 30000,
  retries: 1,
  screenshotOnFailure: false,
  outputDir: "copilot-test-results",

  // Environment-specific configurations
  environments: {
    local: {
      baseUrl: "http://localhost:3000",
      apiUrl: "http://localhost:8080/api",
      timeout: 60000,
      headless: false,
      screenshotOnFailure: false,
    },

    staging: {
      baseUrl: "https://staging.example.com",
      apiUrl: "https://api.staging.example.com",
      timeout: 30000,
      headless: true,
      apiKey: process.env.STAGING_API_KEY ?? "staging-demo-key",
      screenshotOnFailure: true,
    },

    production: {
      baseUrl: "https://example.com",
      apiUrl: "https://api.example.com",
      timeout: 30000,
      headless: true,
      apiKey: process.env.PROD_API_KEY ?? "prod-demo-key",
      screenshotOnFailure: true,
    },
  },
});

// Get current environment info
const currentEnv = getEnvironment();
const currentConfig = getConfig();

console.log(`\n🌍 Running in ${currentEnv} environment`);
console.log(`📍 Base URL: ${currentConfig?.baseUrl}`);
console.log(`⏱️  Timeout: ${currentConfig?.stepTimeout}ms`);
console.log(`📸 Screenshot on failure: ${currentConfig?.screenshotOnFailure}\n`);

// Define a feature that demonstrates environment-aware testing
const environmentTest = feature("Environment Configuration Test")
  .description("Verify that environment-specific configuration is applied correctly")
  .tag("@environment", "@example")

  .scenario("Check current environment configuration")
    .given("the test framework is configured with multiple environments")
    .when("I check the current environment name")
    .then(`the environment should be "${currentEnv}"`)
    .and(`the base URL should be "${currentConfig?.baseUrl}"`)
  .done()

  .scenario("Verify environment-specific timeout")
    .given("different environments have different timeout configurations")
    .when("I check the configured timeout")
    .then(`the timeout should be ${currentConfig?.stepTimeout} milliseconds`)
  .done()

  ._build();

// Queue the test
test(environmentTest, "web");

// Run tests
(async () => {
  try {
    const results = await run();

    console.log(`\n✅ Environment test completed successfully!`);
    console.log(`   Total scenarios: ${results.summary.total}`);
    console.log(`   Passed: ${results.summary.passed}`);
    console.log(`   Failed: ${results.summary.failed}\n`);

    if (results.summary.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Environment test failed:`, error);
    process.exit(1);
  }
})();
