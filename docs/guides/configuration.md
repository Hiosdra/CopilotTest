# Configuration Guide

Comprehensive reference for configuring CopilotTest for your testing needs.

## Configuration File

### Basic Structure

Create a `copilot-test.config.yaml` file in your project root:

```yaml
# copilot-test.config.yaml
model: gpt-5-mini
reasoningEffort: medium

platforms:
  web:
    platform: web
    browser: chromium
  api:
    platform: api
    baseUrl: "https://api.example.com"
  mobile:
    platform: mobile
    device: emulator-5554

stepTimeout: 30000
screenshotOnFailure: true
outputDir: copilot-test-results

parallel: true
maxWorkers: 4
retry:
  enabled: true
  stepRetries: 3
```

## AI Model Configuration

### Model Selection

Choose the AI model that best fits your needs:

```yaml
model: gpt-5-mini             # Default: Fast, accurate, cost-effective
# model: gpt-4o-mini      # Faster, cheaper, good for simple tests
# model: claude-sonnet    # Alternative model
```

### Recommended: 0x Multiplier Models

For cost-effective test execution, we recommend using models with a **0x multiplier** — these are included in your GitHub Copilot plan at no additional cost and don't consume premium requests.

| Model | Multiplier | Speed | Best For |
|-------|-----------|-------|----------|
| **gpt-5-mini** | 0x | Fast | Default choice — great balance of speed and quality |
| **gpt-4.1** | 0x | Fast | Alternative 0x option |
| gpt-5.4-mini | 0x | Fast | Latest mini model |

> **💡 Tip:** Always prefer 0x multiplier models for CI/CD pipelines and automated test runs to keep costs predictable. Reserve premium models (1x+ multiplier) for debugging complex test failures.

```yaml
# Recommended: 0x multiplier model (no extra cost)
model: "gpt-5-mini"

# Premium models (consume premium requests):
# model: "gpt-5.2"    # 1x multiplier
# model: "claude-sonnet-4"  # 1x multiplier
```

### Model Comparison

| Model | Speed | Cost | Best For |
|-------|-------|------|----------|
| **gpt-5-mini** ⭐ | Fast | Low | General testing, CI/CD (recommended default) |
| **gpt-4o-mini** | Very Fast | Low | Simple scenarios, development |
| **claude-sonnet** | Medium | Moderate | Complex validations, analysis |

### Reasoning Effort

Control how much the AI thinks before acting:

```yaml
reasoningEffort: low       # Fast, direct
# reasoningEffort: medium  # Balanced (default)
# reasoningEffort: high    # Thorough, slower
```

**When to use:**
- **Low**: Simple, straightforward tests
- **Medium**: Most tests (default)
- **High**: Complex scenarios, critical paths

## Platform Configuration

### Web Platform

```yaml
platforms:
  web:
    platform: web
    browser: chromium       # 'chromium', 'firefox', 'webkit'
    headless: true          # Run without UI
    baseUrl: "https://example.com"  # Base URL for relative paths
```

### API Platform

```yaml
platforms:
  api:
    platform: api
    baseUrl: "https://api.example.com"
    defaultHeaders:
      Content-Type: application/json
      Authorization: "Bearer ${API_TOKEN}"
```

### Mobile Platform

```yaml
platforms:
  mobile:
    platform: mobile
    device: emulator-5554        # Device ID from 'adb devices'
    avd: Pixel_6_API_33          # Or AVD name
    appPackage: com.example.app  # App package
    appActivity: .MainActivity   # Main activity
```

### Multiple Platforms

Configure multiple platforms in one config:

```yaml
model: gpt-5-mini
platforms:
  web:
    platform: web
    browser: chromium
    baseUrl: "https://example.com"
  api:
    platform: api
    baseUrl: "https://api.example.com"
  mobile:
    platform: mobile
    device: emulator-5554
    appPackage: com.example.app
```

## Execution Configuration

### Timeouts

```yaml
stepTimeout: 30000        # 30 seconds per step (default)
# stepTimeout: 60000      # 60 seconds for slower operations
```

### Screenshots

```yaml
screenshotOnFailure: true   # Capture on failure (default)
# screenshotOnFailure: false  # Disable screenshots
```

### Output Directory

```yaml
outputDir: copilot-test-results    # Default
# outputDir: test-reports          # Custom directory
```

### Base URL

```yaml
# Platform-specific base URL
platforms:
  web:
    platform: web
    baseUrl: "https://staging.example.com"  # Platform-specific
```

## Parallel Execution

### Basic Parallel Configuration

```yaml
parallel: true             # Enable parallel execution
maxWorkers: 4              # Number of concurrent workers
workerTimeout: 300000      # 5 minutes per worker
failFast: false            # Continue even if one fails
```

### Auto Worker Count

```yaml
parallel: true
maxWorkers: auto           # Automatically use (CPU cores - 1)
```

### Fail Fast

```yaml
parallel: true
failFast: true             # Stop all workers on first failure
```

## Retry Configuration

### Basic Retry

```yaml
retry:
  enabled: true
  stepRetries: 3             # Retry up to 3 times
  stepRetryDelay: 1000       # Wait 1 second between retries
```

### Exponential Backoff

```yaml
retry:
  enabled: true
  stepRetries: 5
  strategy: exponential
  initialDelay: 1000         # Start with 1 second
  maxDelay: 10000            # Cap at 10 seconds
  backoffFactor: 2           # Double each time: 1s, 2s, 4s, 8s, 10s
```

### Conditional Retry

```yaml
retry:
  enabled: true
  stepRetries: 3

  # Only retry these errors
  retryOn:
    - timeout
    - "network error"
    - "connection refused"

  # Never retry these errors
  skipRetryOn:
    - "assertion failed"
    - "validation error"
```

### Custom Retry Logic

```yaml
retry:
  enabled: true
  stepRetries: 5
  strategy: exponential
  initialDelay: 1000
  maxDelay: 30000
  retryOn:
    - "rate limit"
    - "server error"
```

> **Note:** For advanced custom retry logic (e.g., custom `shouldRetry` functions or dynamic delay calculations), use a [JavaScript plugin](../advanced/plugins.md) to extend the retry behavior.

### Flaky Test Tracking

```yaml
retry:
  enabled: true
  trackFlaky: true
  flakyThreshold: 2
```

> **Note:** To handle flaky test events (e.g., sending notifications when flaky tests are detected), use a [plugin](../advanced/plugins.md) with an `onFlakyDetected` hook.

## Watch Mode

### Basic Watch Configuration

```yaml
watch:
  enabled: true
  include:
    - "src/**/*.ts"
    - "tests/**/*.feature.md"
  exclude:
    - "node_modules/**"
    - "dist/**"
```

### Watch Options

```yaml
watch:
  enabled: true
  include:
    - "src/**/*.ts"
    - "tests/**/*.feature.md"
  exclude:
    - "node_modules/**"
    - "dist/**"
  debounce: 300              # Wait 300ms before re-running
  runMode: all               # 'all' | 'related' | 'changed-files'
  failedFirst: true          # Run failed tests first
  clearConsole: false        # Don't clear console between runs
  verbose: true              # Show detailed output
```

## Performance Monitoring

### Basic Performance Configuration

```yaml
performance:
  warnThreshold: 5000        # Warn if step > 5 seconds
  failThreshold: 30000       # Fail if step > 30 seconds
```

### Advanced Performance Monitoring

```yaml
performance:
  warnThreshold: 5000
  failThreshold: 30000
  trackTrends: true          # Track performance over time
  reportSlowSteps: true      # Include slow steps in report
```

## Debug Mode

### Basic Debug

```yaml
debugMode: true
```

### Debug with Breakpoints

```yaml
debugMode: true
breakpoints:
  - "When I click submit"
  - "Then I should see"
```

### Interactive Step-Through

```yaml
debugMode: true
interactive: true            # Step through each step manually
```

## Custom MCP Servers

### Add Custom MCP Server

```yaml
mcpServers:
  database:
    type: stdio
    command: npx
    args: ["@copilot-test/postgres-mcp"]
    env:
      DATABASE_URL: "${DATABASE_URL}"
  slack:
    type: stdio
    command: node
    args: ["./mcp-servers/slack-server.js"]
    env:
      SLACK_TOKEN: "${SLACK_TOKEN}"
```

## Environment-Based Configuration

### Using Environment Variables

```yaml
model: "${AI_MODEL:-gpt-5-mini}"

platforms:
  web:
    platform: web
    headless: "${CI:-false}"
    baseUrl: "${BASE_URL:-https://staging.example.com}"

parallel: "${PARALLEL:-false}"
maxWorkers: "${MAX_WORKERS:-4}"

outputDir: "${OUTPUT_DIR:-copilot-test-results}"
```

### Multiple Environment Configs

Use separate YAML config files per environment:

```yaml
# copilot-test.config.yaml (default/development)
platforms:
  web:
    platform: web
    baseUrl: "http://localhost:3000"
    headless: false
```

```yaml
# copilot-test.config.staging.yaml
platforms:
  web:
    platform: web
    baseUrl: "https://staging.example.com"
    headless: true
```

```yaml
# copilot-test.config.production.yaml
platforms:
  web:
    platform: web
    baseUrl: "https://example.com"
    headless: true
```

Run with a specific config:

```bash
copilot-test run --config copilot-test.config.staging.yaml
```

## Plugin Configuration

### Register Plugins

```yaml
plugins:
  - "./plugins/my-plugin.ts"
  - "./plugins/slack-notifier.ts"
  - "./plugins/junit-reporter.ts"
```

> **Note:** Plugins are written in TypeScript. Each plugin file exports its configuration and hooks. See [Plugins](../advanced/plugins.md) for details on authoring plugins.

## Custom Step Definitions

### Enable Custom Steps

```yaml
useCustomStepDefinitions: true
```

Then define custom steps in TypeScript:

```typescript
import { defineStep } from 'copilot-test';

defineStep(/^I login as "(.+)"$/, async (context, username) => {
  // Custom implementation
});
```

## Complete Configuration Example

```yaml
# copilot-test.config.yaml

# AI Configuration
model: "${AI_MODEL:-gpt-5-mini}"
reasoningEffort: medium

# Platforms
platforms:
  web:
    platform: web
    browser: chromium
    headless: "${CI:-false}"
    baseUrl: "${WEB_URL:-https://staging.example.com}"
  api:
    platform: api
    baseUrl: "${API_URL:-https://api-staging.example.com}"
    defaultHeaders:
      Authorization: "Bearer ${API_TOKEN}"

# Execution
stepTimeout: 30000
screenshotOnFailure: true
outputDir: test-results

# Parallel Execution
parallel: "${CI:-false}"
maxWorkers: "${CI:+auto}"  # 'auto' in CI
workerTimeout: 300000
failFast: false

# Retry Strategy
retry:
  enabled: true
  stepRetries: 3
  strategy: exponential
  initialDelay: 1000
  maxDelay: 10000
  retryOn:
    - timeout
    - "network error"
  trackFlaky: true

# Performance Monitoring
performance:
  warnThreshold: 5000
  failThreshold: 30000

# Watch Mode (development)
watch:
  enabled: true
  include:
    - "src/**/*.ts"
    - "tests/**/*.feature.md"
  exclude:
    - "node_modules/**"
  debounce: 300

# Debug Mode
debugMode: false

# Custom Steps
useCustomStepDefinitions: true

# Plugins
plugins:
  - "./plugins/my-plugin.ts"
```

## Next Steps

- [Best Practices](./best-practices.md) - Configuration best practices
- [Advanced Parallel Execution](../advanced/parallel-execution.md)
- [Custom MCP Servers](../advanced/custom-mcp-servers.md)
- [Plugins](../advanced/plugins.md)
