# Retry Mechanisms and Error Recovery - Implementation Summary

## Overview

This implementation adds comprehensive retry mechanisms and error recovery strategies to CopilotTest, addressing the issue of test failures due to transient errors such as network timeouts, race conditions, flaky animations, and server delays.

## Key Features Implemented

### 1. **Step-Level Retry**
- Retry individual failing steps automatically
- Configurable number of retry attempts (`stepRetries`)
- Configurable delay between retries (`stepRetryDelay`)
- Maintains backward compatibility (retries disabled by default)

### 2. **Multiple Retry Strategies**

#### Fixed Delay
```typescript
retry: {
  enabled: true,
  strategy: "fixed",
  stepRetryDelay: 1000,  // Always wait 1s between retries
}
```

#### Exponential Backoff
```typescript
retry: {
  enabled: true,
  strategy: "exponential",
  initialDelay: 1000,     // First retry after 1s
  backoffFactor: 2,       // Double each time: 1s, 2s, 4s, 8s...
  maxDelay: 10000,        // Cap at 10s
}
```

#### Custom Strategy
```typescript
retry: {
  enabled: true,
  delayFn: (attempt) => {
    // Custom delay calculation
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  },
}
```

### 3. **Conditional Retry**

#### Retry Only on Specific Errors
```typescript
retry: {
  enabled: true,
  retryOn: [
    "timeout",
    "network error",
    /connection refused/i,
  ],
}
```

#### Skip Retry on Specific Errors
```typescript
retry: {
  enabled: true,
  skipRetryOn: [
    "assertion failed",
    /validation error/i,
  ],
}
```

#### Custom Retry Logic
```typescript
retry: {
  enabled: true,
  shouldRetry: (error, attempt) => {
    const msg = typeof error === "string" ? error : error.message;
    if (msg.toLowerCase().includes("rate limit")) {
      return attempt <= 5;  // Retry rate limits up to 5 times
    }
    if (msg.toLowerCase().includes("server error")) {
      return attempt <= 3;  // Retry server errors up to 3 times
    }
    return false;  // Don't retry other errors
  },
}
```

### 4. **Flaky Test Detection**

Automatically tracks and reports tests that pass only after retries:

```typescript
retry: {
  enabled: true,
  trackFlaky: true,
  flakyThreshold: 2,  // Consider flaky if passes after 2+ retries
  onFlakyDetected: (scenarioName, attempts) => {
    console.warn(`⚠️ Flaky test: "${scenarioName}" passed on attempt ${attempts}`);
    // Could send notification, create GitHub issue, etc.
  },
}
```

### 5. **Enhanced Reporting**

#### Console Output
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

#### HTML Report
- Retry badges showing retry count
- Detailed attempt history with status and duration
- Color-coded attempt status (red for failed, green for passed)
- Expandable retry details section

## Technical Implementation

### New Types and Interfaces

```typescript
// Retry configuration
interface RetryConfig {
  enabled?: boolean;
  stepRetries?: number;
  stepRetryDelay?: number;
  scenarioRetries?: number;
  strategy?: "fixed" | "exponential" | "custom";
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryOn?: Array<string | RegExp>;
  skipRetryOn?: Array<string | RegExp>;
  shouldRetry?: (error: Error | string, attempt: number) => boolean;
  delayFn?: (attempt: number) => number;
  trackFlaky?: boolean;
  flakyThreshold?: number;
  onFlakyDetected?: (scenarioName: string, attempts: number) => void;
}

// Retry attempt tracking
interface RetryAttempt {
  attemptNumber: number;
  status: "passed" | "failed" | "skipped" | "pending";
  duration: number;
  error?: string;
}

// Enhanced StepResult
interface StepResult {
  // ... existing fields
  retryCount?: number;
  retryAttempts?: RetryAttempt[];
}
```

### New Modules

- **`src/retry.ts`**: Core retry logic utilities
  - `calculateRetryDelay()`: Calculate delay based on strategy
  - `shouldRetryStep()`: Determine if step should be retried
  - `isFlaky()`: Detect flaky tests
  - `reportFlakyTest()`: Report flaky test detection

### Modified Modules

- **`src/runtime.ts`**: Implements retry logic in `executeStep()`
- **`src/reporter.ts`**: Enhanced HTML and console output
- **`src/runner.ts`**: Enhanced console output for retries
- **`src/types.ts`**: Added retry-related types
- **`src/index.ts`**: Exports retry utilities and types

## Testing

Added 46 comprehensive unit tests covering:
- Fixed delay strategy
- Exponential backoff strategy
- Custom delay functions
- Conditional retry (retryOn/skipRetryOn)
- Custom shouldRetry functions
- Flaky test detection
- HTML report rendering with retries
- Step execution with retries

**Test Results**: All 247 tests passing ✅

## Backward Compatibility

- Retries are **disabled by default** (`enabled: false`)
- Existing `retries` config field still works (for scenario-level retries)
- New `retry.scenarioRetries` can be used instead
- No breaking changes to existing APIs

## Usage Examples

See `examples/README.md` and `examples/retry-example.ts` for complete examples.

## Benefits

1. **Improved Test Stability**: Automatically handles transient failures
2. **Reduced Flaky Tests**: Configurable retry logic reduces false failures
3. **Better Debugging**: Detailed retry information helps identify issues
4. **Flexible Configuration**: Multiple strategies for different scenarios
5. **Flaky Test Detection**: Automatically identify unreliable tests
6. **Production Ready**: Comprehensive testing and backward compatibility

## Future Enhancements (Not Implemented)

The following features from the original issue were not implemented but could be added later:
- Per-step retry override (e.g., `.retry(5, { delay: 2000 })`)
- Recovery actions (e.g., `.onFailure(async ({ page }) => { ... })`)
- Wait strategies (networkIdle, elementStable, custom conditions)
- Auto-heal selectors
- Circuit breaker pattern

These features would require DSL changes and more complex state management, so they were deferred to maintain minimal changes and avoid breaking existing code.
