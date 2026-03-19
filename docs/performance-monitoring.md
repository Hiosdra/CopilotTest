# Performance Monitoring

CopilotTest provides comprehensive performance monitoring and step-level metrics to help you identify slow tests, detect performance regressions, and optimize test execution.

## Features

### 1. Step-Level Metrics

Every step execution is tracked with detailed timing information:

```typescript
interface StepMetrics {
  duration: number;         // Total step duration (ms)
  aiThinkTime?: number;     // Time AI spent processing (ms)
  executionTime?: number;   // Time executing MCP tools (ms)
  networkTime?: number;     // Network request time (ms)
  renderTime?: number;      // Browser render time (ms)
}
```

### 2. Resource Tracking

Track resource usage at the scenario level:

```typescript
interface ResourceMetrics {
  memoryUsed?: number;      // Peak memory usage (MB)
  cpuTime?: number;         // CPU time (ms)
  networkRequests?: number; // Number of network requests
  screenshots?: number;     // Number of screenshots taken
}
```

### 3. Performance Configuration

Configure performance thresholds and tracking:

```typescript
configure({
  platforms: { web: webPlatform() },
  performance: {
    warnThreshold: 5000,      // Warn if step > 5s
    failThreshold: 10000,     // Fail if step > 10s
    trackTrends: true,        // Track performance trends
    trendsFile: 'performance-trends.json',
  },
});
```

## Usage

### Basic Setup

Enable performance monitoring in your configuration:

```typescript
import { configure, webPlatform } from 'copilot-test';

configure({
  platforms: { web: webPlatform() },
  performance: {
    warnThreshold: 5000,   // Warn if step takes > 5s
    failThreshold: 10000,  // Fail if step takes > 10s
  },
});
```

### Analyzing Performance

After running tests, analyze the performance data:

```typescript
import { run, analyzePerformance, generatePerformanceReport } from 'copilot-test';

const testRun = await run();

// Get performance summary
const summary = analyzePerformance(testRun);
console.log(`Average step duration: ${summary.avgStepDuration}ms`);
console.log(`Slowest step: ${summary.slowestStep?.step} (${summary.slowestStep?.duration}ms)`);

// Generate detailed performance report
console.log(generatePerformanceReport(testRun));
```

### Performance Report Output

The performance report includes:

```
Performance Summary
==================
Total Duration: 45.2s
Average Step Duration: 2.1s
Slowest Step: "When I load 1000 items" (12.3s)
Fastest Step: "Given I am logged in" (0.5s)
Average AI Think Time: 0.8s
Average Execution Time: 1.3s

Step Performance Breakdown:
┌─────────────────────────────────┬──────────┬──────────┬──────────┐
│ Step                            │ Duration │ AI Time  │ Exec Time│
├─────────────────────────────────┼──────────┼──────────┼──────────┤
│ Given I am on the login page    │ 1.2s     │ 0.3s     │ 0.9s     │
│ When I enter valid credentials  │ 2.1s     │ 0.5s     │ 1.6s     │
│ Then I should see the dashboard │ 3.5s     │ 0.4s     │ 3.1s     │
└─────────────────────────────────┴──────────┴──────────┴──────────┘
```

### HTML Report

Performance metrics are automatically included in the HTML report:

- Step duration breakdown (Total, AI Time, Execution Time)
- Inline metrics display for each step
- Resource usage statistics (screenshots, network requests)

### Comparing Performance

Compare current performance with a baseline:

```typescript
import { comparePerformance, analyzePerformance } from 'copilot-test';

const baseline = analyzePerformance(baselineTestRun);
const current = analyzePerformance(currentTestRun);

const comparison = comparePerformance(current, baseline);

console.log(`Duration change: ${(comparison.totalDurationChange * 100).toFixed(1)}%`);
console.log(`Trend: ${comparison.trend}`); // 'improved', 'degraded', or 'stable'
```

## Performance Thresholds

### Warning Threshold

Steps exceeding `warnThreshold` will trigger a console warning:

```
⚠️  Performance warning: Step took 6234ms (threshold: 5000ms)
```

### Fail Threshold

Steps exceeding `failThreshold` will be marked as failed:

```typescript
// Step will fail if it takes > 10 seconds
configure({
  performance: {
    failThreshold: 10000,
  },
});
```

## Best Practices

1. **Set Realistic Thresholds**: Based on your application's performance characteristics
2. **Track Trends**: Enable trend tracking to monitor performance over time
3. **Review Slow Steps**: Use the performance report to identify and optimize slow tests
4. **Resource Monitoring**: Track screenshots and network requests to understand test overhead
5. **CI Integration**: Use performance data in CI to detect regressions

## API Reference

### analyzePerformance(testRun)

Analyzes a test run and returns performance summary statistics.

**Returns**: `PerformanceSummary`

### getStepPerformanceBreakdown(testRun)

Gets detailed performance breakdown for all steps.

**Returns**: `StepPerformance[]`

### generatePerformanceReport(testRun)

Generates a text-based performance report.

**Returns**: `string`

### comparePerformance(current, baseline)

Compares current performance with baseline and returns trend indicators.

**Returns**: `{ totalDurationChange, avgStepDurationChange, trend }`

### formatDuration(ms)

Formats duration in milliseconds to human-readable string.

**Returns**: `string` (e.g., "1.5s", "500ms")

## Example

See [examples/performance-monitoring.ts](../examples/performance-monitoring.ts) for a complete working example.
