# Retry Mechanisms and Error Recovery

This directory contains examples of using CopilotTest's retry mechanisms and error recovery strategies.

## Basic Retry Configuration

```yaml
# copilot-test.config.yaml
retry:
  enabled: true
  stepRetries: 3        # Retry individual steps up to 3 times
  stepRetryDelay: 1000  # Wait 1s between retries
```

## Exponential Backoff

```yaml
# copilot-test.config.yaml
retry:
  enabled: true
  stepRetries: 5
  strategy: exponential
  initialDelay: 1000     # First retry after 1s
  maxDelay: 10000        # Cap at 10s
  backoffFactor: 2       # Double delay each time
  # Delays: 1s, 2s, 4s, 8s, 10s
```

## Conditional Retry (Only Retry Specific Errors)

```yaml
# copilot-test.config.yaml
retry:
  enabled: true
  stepRetries: 3

  # Only retry on network/timeout errors
  retryOn:
    - timeout
    - network error
    - /connection refused/i

  # Don't retry on assertion failures
  skipRetryOn:
    - assertion failed
    - /validation error/i
```

## Custom Retry Logic

> **Note:** Custom retry functions (`shouldRetry`, `delayFn`) require programmatic configuration.
> For simple retry patterns, use the YAML config above. For advanced logic, see the
> [Custom Steps Guide](../docs/CUSTOM_STEPS.md).

```yaml
# copilot-test.config.yaml — basic retry config
retry:
  enabled: true
  stepRetries: 5
  strategy: exponential
  initialDelay: 1000
  maxDelay: 30000
  backoffFactor: 2
```

## Flaky Test Detection

```yaml
# copilot-test.config.yaml
retry:
  enabled: true
  stepRetries: 3

  # Track tests that pass only after retries
  trackFlaky: true
  flakyThreshold: 2  # Consider flaky if passes after 2+ retries
```

> **Note:** Custom callbacks (e.g., `onFlakyDetected`) require programmatic configuration.
> See the [Plugins Guide](../docs/PLUGINS.md) for lifecycle hooks.

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

- `retry-example.feature.md` - Complete example with all retry features
- See the test suite in `tests/unit.test.ts` for more examples
