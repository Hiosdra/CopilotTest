import { configure } from "./src/index.js";
import { feature } from "./src/dsl.js";
import { test, run } from "./src/runner.js";
import { webPlatform } from "./src/platforms/web.js";

// Configure CopilotTest with retry mechanisms
configure({
  model: "gpt-4o",
  platforms: {
    web: webPlatform({
      browser: "chromium",
      headless: true,
    }),
  },
  retry: {
    // Enable retry functionality
    enabled: true,

    // Step-level retry
    stepRetries: 3,

    // Exponential backoff strategy
    strategy: "exponential",
    initialDelay: 1000,      // First retry after 1s
    maxDelay: 10000,         // Cap at 10s
    backoffFactor: 2,        // Double delay each time

    // Conditional retry - only retry on transient errors
    retryOn: [
      "timeout",
      "network error",
      /connection refused/i,
      /ECONNREFUSED/i,
    ],

    // Don't retry on assertion failures
    skipRetryOn: [
      "assertion failed",
      /validation error/i,
    ],

    // Track flaky tests
    trackFlaky: true,
    flakyThreshold: 2,

    // Custom callback when flaky test detected
    onFlakyDetected: (scenarioName, attempts) => {
      console.error(`⚠️  Flaky test: "${scenarioName}" passed on attempt ${attempts}`);
      // Could send notification, create issue, etc.
    },
  },
});

// Example feature with potentially flaky steps
const flakyFeature = feature("Flaky API Test")
  .tag("@api")
  .scenario("API call with retries")
    .given("the API server is running")
    .when("I make a request to the flaky endpoint")
    .then("I should receive a successful response")
    .done()
  ._build();

test(flakyFeature, "web");

// Run the test
await run();
