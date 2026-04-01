# Plugin System

The CopilotTest framework includes a powerful plugin system that allows you to extend test execution with custom lifecycle hooks. Plugins can observe and react to test lifecycle events at every level: test runs, features, scenarios, and steps.

## Table of Contents

- [Overview](#overview)
- [Plugin Interface](#plugin-interface)
- [Creating a Plugin](#creating-a-plugin)
- [Registering Plugins](#registering-plugins)
- [Lifecycle Hooks](#lifecycle-hooks)
- [Built-in Plugin Examples](#built-in-plugin-examples)
- [Best Practices](#best-practices)

## Overview

The plugin system enables you to:

- **Track test execution**: Monitor test progress and collect metrics
- **Send notifications**: Alert teams via Slack, Teams, or other channels
- **Generate custom reports**: Create JUnit XML, JSON, or other custom formats
- **Monitor performance**: Track slow steps and identify bottlenecks
- **Integrate with external tools**: Send data to analytics, monitoring, or CI/CD systems
- **Implement custom workflows**: Add team-specific behavior to your tests

## Plugin Interface

A plugin is an object that implements the `Plugin` interface with a unique name and optional lifecycle hooks:

```typescript
interface Plugin {
  /** Unique plugin name */
  name: string;

  /** Called when the test run starts, before any features are executed */
  onTestRunStart?(config: CopilotTestConfig): void | Promise<void>;

  /** Called when a feature starts execution */
  onFeatureStart?(feature: Feature): void | Promise<void>;

  /** Called when a scenario starts execution */
  onScenarioStart?(scenario: Scenario): void | Promise<void>;

  /** Called when a step starts execution */
  onStepStart?(step: Step): void | Promise<void>;

  /** Called when a step completes execution */
  onStepEnd?(step: Step, result: StepResult): void | Promise<void>;

  /** Called when a scenario completes execution */
  onScenarioEnd?(scenario: Scenario, result: ScenarioResult): void | Promise<void>;

  /** Called when a feature completes execution */
  onFeatureEnd?(feature: Feature, result: FeatureResult): void | Promise<void>;

  /** Called when the test run completes */
  onTestRunEnd?(results: TestRun): void | Promise<void>;
}
```

## Creating a Plugin

Use the `definePlugin()` helper function to create a type-safe plugin:

```typescript
import { definePlugin } from '@copilot-test/core';

const myPlugin = definePlugin({
  name: 'my-plugin',

  onTestRunStart(config) {
    console.log('Starting test run...');
  },

  onStepEnd(step, result) {
    if (result.status === 'failed') {
      console.error(`Step failed: ${step.keyword} ${step.text}`);
      console.error(`Error: ${result.error}`);
    }
  },

  onTestRunEnd(results) {
    console.log(`Tests complete: ${results.summary.passed}/${results.summary.total} passed`);
  },
});
```

## Registering Plugins

Add plugins to your configuration:

```yaml
# copilot-test.config.yaml
platforms:
  web:
    type: web
    headless: true
plugins:
  - ./plugins/my-plugin
```

You can register multiple plugins:

```yaml
# copilot-test.config.yaml
platforms:
  web:
    type: web
    headless: true
plugins:
  - name: slack-notifier
    webhook: ${SLACK_WEBHOOK}
  - name: junit-reporter
    outputFile: junit-results.xml
  - name: performance-monitor
    threshold: 5000
```

> **Note:** Plugins are still defined in TypeScript using `definePlugin()`. The YAML config references plugin modules or configures built-in plugins.

## Lifecycle Hooks

### Hook Execution Order

```
onTestRunStart
  ↓
  onFeatureStart
    ↓
    onScenarioStart
      ↓
      onStepStart
      onStepEnd
      ↓
    onScenarioEnd
    ↓
  onFeatureEnd
  ↓
onTestRunEnd
```

### Hook Details

#### onTestRunStart(config)

Called once when the test run starts, before any features are executed.

**Parameters:**
- `config`: The test configuration object

**Use cases:**
- Initialize resources
- Set up external connections
- Log test configuration

#### onFeatureStart(feature)

Called when a feature starts execution.

**Parameters:**
- `feature`: The feature being executed

**Use cases:**
- Track feature execution
- Set up feature-specific state
- Log feature information

#### onScenarioStart(scenario)

Called when a scenario starts execution.

**Parameters:**
- `scenario`: The scenario being executed

**Use cases:**
- Track scenario execution
- Set up scenario-specific state
- Start timing measurements

#### onStepStart(step)

Called when a step starts execution.

**Parameters:**
- `step`: The step being executed

**Use cases:**
- Log step information
- Start detailed timing
- Track step execution

#### onStepEnd(step, result)

Called when a step completes execution.

**Parameters:**
- `step`: The step that was executed
- `result`: The step execution result

**Use cases:**
- Collect step metrics
- Send failure notifications
- Track performance
- Detect flaky steps

#### onScenarioEnd(scenario, result)

Called when a scenario completes execution.

**Parameters:**
- `scenario`: The scenario that was executed
- `result`: The scenario execution result

**Use cases:**
- Track scenario results
- Calculate scenario metrics
- Send notifications
- Generate reports

#### onFeatureEnd(feature, result)

Called when a feature completes execution.

**Parameters:**
- `feature`: The feature that was executed
- `result`: The feature execution result

**Use cases:**
- Track feature results
- Calculate feature metrics
- Generate feature reports

#### onTestRunEnd(results)

Called once when the test run completes.

**Parameters:**
- `results`: Complete test run results

**Use cases:**
- Generate final reports
- Send summary notifications
- Upload results to external systems
- Clean up resources

## Plugin Examples

Below are example plugin implementations. You can adapt these patterns to create your own custom plugins:

### 1. Slack Notifier

Sends notifications to Slack on test failures:

```typescript
// Example plugin implementation
const slackPlugin = (options: {
  webhook: string;
  onlyFailures?: boolean;
  channel?: string;
}) => ({
  name: 'slack-notifier',
  onTestComplete: async (result) => {
    if (options.onlyFailures && result.status === 'passed') return;

    await fetch(options.webhook, {
      method: 'POST',
      body: JSON.stringify({
        channel: options.channel,
        text: `Test ${result.status}: ${result.feature.title}`
      })
    });
  }
});

```

```yaml
# copilot-test.config.yaml
plugins:
  - name: slack-notifier
    webhook: ${SLACK_WEBHOOK}
    onlyFailures: true
    channel: "#test-results"
```

### 2. JUnit Reporter

Generates JUnit-compatible XML reports:

```typescript
// Example plugin implementation
const junitPlugin = (options: { outputFile: string }) => ({
  name: 'junit-reporter',
  onRunComplete: async (results) => {
    // Generate JUnit XML from results
    const xml = generateJUnitXML(results);
    await fs.writeFile(options.outputFile, xml);
  }
});

```

```yaml
# copilot-test.config.yaml
plugins:
  - name: junit-reporter
    outputFile: junit-results.xml
```

### 3. Performance Monitor

Tracks and reports slow steps:

```typescript
// Example plugin implementation
const performancePlugin = (options: { threshold: number; report: string }) => ({
  name: 'performance-monitor',
  onStepComplete: async (step, result, duration) => {
    if (duration > options.threshold) {
      console.warn(`Slow step (${duration}ms): ${step.text}`);
    }
  }
});

```

```yaml
# copilot-test.config.yaml
plugins:
  - name: performance-monitor
    threshold: 5000  # Warn if step > 5s
    report: performance.json
```

### 4. Console Logger

Detailed console logging:

```typescript
// Example plugin implementation
const consoleLoggerPlugin = {
  name: 'console-logger',
  onStepStart: (step) => console.log(`▶ ${step.text}`),
  onStepComplete: (step, result) => {
    console.log(result.status === 'passed' ? '✓' : '✗', step.text);
  }
};

```

```yaml
# copilot-test.config.yaml
plugins:
  - name: console-logger
```

### 5. JSON Reporter

Custom JSON reports:

```typescript
// Example plugin implementation
const jsonReporterPlugin = (options: { outputFile: string }) => ({
  name: 'json-reporter',
  onRunComplete: async (results) => {
    await fs.writeFile(options.outputFile, JSON.stringify(results, null, 2));
  }
});

```

```yaml
# copilot-test.config.yaml
plugins:
  - name: json-reporter
    outputFile: test-results.json
```

## Best Practices

### 1. Error Handling

Plugin errors are caught and logged but don't disrupt test execution. However, you should still handle errors gracefully:

```typescript
const myPlugin = definePlugin({
  name: 'my-plugin',

  async onTestRunEnd(results) {
    try {
      await sendResultsToAPI(results);
    } catch (error) {
      console.error('Failed to send results:', error);
      // Don't throw - let tests continue
    }
  },
});
```

### 2. Async Operations

Hooks support both sync and async operations. Use async when needed:

```typescript
const myPlugin = definePlugin({
  name: 'async-plugin',

  async onStepEnd(step, result) {
    // Async operations are supported
    await logToDatabase(step, result);
  },
});
```

### 3. State Management

Use closures to maintain state across hooks:

```typescript
function metricPlugin() {
  const metrics = {
    steps: 0,
    failures: 0,
    totalDuration: 0,
  };

  return definePlugin({
    name: 'metric-tracker',

    onStepEnd(step, result) {
      metrics.steps++;
      metrics.totalDuration += result.duration;
      if (result.status === 'failed') {
        metrics.failures++;
      }
    },

    onTestRunEnd(results) {
      console.log('Metrics:', metrics);
    },
  });
}
```

### 4. Resource Cleanup

Use `onTestRunEnd` to clean up resources:

```typescript
const dbPlugin = definePlugin({
  name: 'db-logger',

  async onTestRunStart(config) {
    // Initialize connection
    await db.connect();
  },

  async onTestRunEnd(results) {
    // Clean up
    await db.disconnect();
  },
});
```

### 5. Conditional Logic

Plugins can implement conditional logic based on configuration or results:

```typescript
function smartNotifierPlugin(options: { onlyFailures?: boolean }) {
  return definePlugin({
    name: 'smart-notifier',

    async onScenarioEnd(scenario, result) {
      if (options.onlyFailures && result.status !== 'failed') {
        return; // Skip notification for passed tests
      }

      await sendNotification(scenario, result);
    },
  });
}
```

### 6. Plugin Composition

Create reusable plugin factories:

```typescript
function createReporterPlugin(
  name: string,
  formatter: (results: TestRun) => string
) {
  return definePlugin({
    name,

    onTestRunEnd(results) {
      const output = formatter(results);
      console.log(output);
    },
  });
}

// Use the factory
const customReporter = createReporterPlugin(
  'custom-reporter',
  (results) => `Tests: ${results.summary.passed}/${results.summary.total}`
);
```

## Advanced Examples

### Multi-Channel Notifier

```typescript
const notifierPlugin = definePlugin({
  name: 'multi-channel-notifier',

  async onTestRunEnd(results) {
    const summary = {
      total: results.summary.total,
      passed: results.summary.passed,
      failed: results.summary.failed,
      passRate: Math.round((results.summary.passed / results.summary.total) * 100),
    };

    // Send to multiple channels in parallel
    await Promise.all([
      sendToSlack(summary),
      sendToTeams(summary),
      sendToEmail(summary),
    ]);
  },
});
```

### Flaky Test Detector

```typescript
const flakyDetectorPlugin = definePlugin({
  name: 'flaky-detector',

  onStepEnd(step, result) {
    if (result.retryCount && result.retryCount > 0 && result.status === 'passed') {
      console.warn(
        `🔄 Flaky step detected: "${step.keyword} ${step.text}" ` +
        `(passed after ${result.retryCount} retries)`
      );
    }
  },
});
```

### CI/CD Integration

```typescript
const ciIntegrationPlugin = definePlugin({
  name: 'ci-integration',

  async onTestRunEnd(results) {
    if (process.env.CI) {
      // Upload results to CI system
      await uploadToCI({
        buildId: process.env.BUILD_ID,
        results,
      });

      // Set exit code based on results
      if (results.summary.failed > 0) {
        process.exitCode = 1;
      }
    }
  },
});
```

## Contributing

We welcome contributions of new plugins! Please submit your plugins as examples or create a separate plugin package that others can install.

See the [Contributing Guide](../CONTRIBUTING.md) for more information.
