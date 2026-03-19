# Retry Mechanisms and Error Recovery

This directory contains examples of using CopilotTest's retry mechanisms and error recovery strategies.

## Basic Retry Configuration

```typescript
configure({
  platforms: { web: webPlatform() },
  retry: {
    enabled: true,
    stepRetries: 3,        // Retry individual steps up to 3 times
    stepRetryDelay: 1000,  // Wait 1s between retries
  },
});
```

## Exponential Backoff

```typescript
configure({
  platforms: { web: webPlatform() },
  retry: {
    enabled: true,
    stepRetries: 5,
    strategy: "exponential",
    initialDelay: 1000,     // First retry after 1s
    maxDelay: 10000,        // Cap at 10s
    backoffFactor: 2,       // Double delay each time
    // Delays: 1s, 2s, 4s, 8s, 10s
  },
});
```

## Conditional Retry (Only Retry Specific Errors)

```typescript
configure({
  platforms: { web: webPlatform() },
  retry: {
    enabled: true,
    stepRetries: 3,

    // Only retry on network/timeout errors
    retryOn: [
      "timeout",
      "network error",
      /connection refused/i,
    ],

    // Don't retry on assertion failures
    skipRetryOn: [
      "assertion failed",
      /validation error/i,
    ],
  },
});
```

## Custom Retry Logic

```typescript
configure({
  platforms: { web: webPlatform() },
  retry: {
    enabled: true,

    // Custom retry logic
    shouldRetry: (error, attempt) => {
      const msg = typeof error === "string" ? error : error.message;

      // Retry rate limits up to 5 times
      if (msg.toLowerCase().includes("rate limit")) {
        return attempt <= 5;
      }

      // Retry server errors up to 3 times
      if (msg.toLowerCase().includes("server error")) {
        return attempt <= 3;
      }

      // Don't retry other errors
      return false;
    },

    // Custom delay calculation
    delayFn: (attempt) => {
      return Math.min(1000 * Math.pow(2, attempt), 30000);
    },
  },
});
```

## Flaky Test Detection

```typescript
configure({
  platforms: { web: webPlatform() },
  retry: {
    enabled: true,
    stepRetries: 3,

    // Track tests that pass only after retries
    trackFlaky: true,
    flakyThreshold: 2,  // Consider flaky if passes after 2+ retries

    // Custom callback when flaky test detected
    onFlakyDetected: (scenarioName, attempts) => {
      console.warn(`⚠️  Flaky test: "${scenarioName}" passed on attempt ${attempts}`);
      // Could send notification, create GitHub issue, etc.
    },
  },
});
```

## Retry Report Output

When retries are enabled, the console output shows retry information:

```
Scenario: Login test
  ✓ Given I am on the login page (150ms)
  ⚠️  When I enter credentials (retried 2x)
       ✗ Attempt 1: failed (1200ms)
       ✗ Attempt 2: failed (1150ms)
       ✓ Attempt 3: passed (1100ms)
  ✓ Then I should be logged in (200ms)

Result: PASSED (with 2 retries)
```

The HTML report includes:
- Retry badges showing how many times a step was retried
- Detailed retry attempt history with status and duration
- Visual indicators for flaky tests

## Example Files

- `retry-example.ts` - Complete example with all retry features
- See the test suite in `tests/unit.test.ts` for more examples
