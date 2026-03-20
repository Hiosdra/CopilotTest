# Running Tests

Learn all the ways to run and control your CopilotTest test execution.

## Basic Execution

### Run All Tests

Execute all tests in your test directory:

```bash
copilot-test run
```

By default, this runs all `*.spec.ts` or `*.spec.js` files in the `tests/` directory.

### Run Specific File

Run a single test file:

```bash
copilot-test run tests/login.spec.ts
```

### Run Multiple Files

Run multiple specific files:

```bash
copilot-test run tests/login.spec.ts tests/checkout.spec.ts
```

## Filtering Tests

### By Tag

Run tests with specific tags:

```bash
# Run smoke tests
copilot-test run --tag=@smoke

# Run critical tests
copilot-test run --tag=@critical

# Run multiple tags (OR logic)
copilot-test run --tag=@smoke,@regression
```

### By Name Pattern

Filter tests by feature or scenario name:

```bash
# Run tests with "login" in the name
copilot-test run --filter="login"

# Case-insensitive matching
copilot-test run --filter="LOGIN"
```

### By Environment

Set the environment for your tests:

```bash
copilot-test run --env=staging
copilot-test run --env=production
```

Access the environment in your config:

```typescript
configure({
  baseUrl: process.env.TEST_ENV === 'production'
    ? 'https://example.com'
    : 'https://staging.example.com'
});
```

## Execution Modes

### Headless Mode

Run browsers without UI (faster, for CI/CD):

```bash
copilot-test run --headless
```

In configuration:

```typescript
configure({
  platforms: {
    web: webPlatform({
      headless: true
    })
  }
});
```

### Parallel Execution

Run scenarios in parallel for faster execution:

```bash
copilot-test run --parallel
```

With custom worker count:

```bash
copilot-test run --parallel --max-workers=6
```

In configuration:

```typescript
configure({
  parallel: true,
  maxWorkers: 4,        // or 'auto' for CPU-based
  workerTimeout: 300000 // 5 minutes per scenario
});
```

### Debug Mode

Run tests with debugging enabled:

```bash
copilot-test run --debug
```

In configuration:

```typescript
configure({
  debugMode: true,
  breakpoints: ['When I click submit', 'Then I should see']
});
```

## Programmatic Execution

### From Node.js

Run tests programmatically:

```typescript
import { configure, feature, test, run } from 'copilot-test';
import { webPlatform } from 'copilot-test';

// Configuration
configure({
  model: 'gpt-4o',
  platforms: {
    web: webPlatform({ browser: 'chromium' })
  }
});

// Register tests
test(
  feature('Login')
    .scenario('Successful login')
      .given('I am on the login page')
      .when('I enter valid credentials')
      .then('I should see the dashboard')
      .done()
    ._build(),
  'web'
);

// Execute
await run();
```

### With Options

Pass runtime options:

```typescript
import { configure, test, run, getConfig } from 'copilot-test';

configure({
  model: 'gpt-4o',
  platforms: {
    web: webPlatform()
  }
});

// Register tests
test(loginFeature, 'web');
test(checkoutFeature, 'web');

// Run with options
const results = await run();

console.log(`Passed: ${results.summary.passed}`);
console.log(`Failed: ${results.summary.failed}`);

// Exit with error code if failures
if (results.summary.failed > 0) {
  process.exit(1);
}
```

## Watch Mode

Run tests continuously during development:

```bash
copilot-test run tests/login.spec.ts --watch
```

### Interactive Commands

When in watch mode:

```
Interactive Commands:
  a - Run all tests
  f - Run only failed tests
  q - Quit watch mode
  Enter - Re-run tests
```

### Watch Configuration

```typescript
configure({
  watch: {
    enabled: true,
    include: ['src/**/*.ts', 'tests/**/*.spec.ts'],
    exclude: ['node_modules/**', 'dist/**'],
    debounce: 300,
    runMode: 'all',
    failedFirst: true
  }
});
```

## Retry Failed Tests

Automatically retry failed scenarios:

```typescript
configure({
  retry: {
    enabled: true,
    stepRetries: 3,
    stepRetryDelay: 1000
  }
});
```

Run only failed tests from the last run:

```bash
copilot-test run --failed
```

## Output and Reporting

### Console Output

Control console verbosity:

```bash
# Standard output
copilot-test run

# Verbose output
copilot-test run --verbose

# Quiet output (errors only)
copilot-test run --quiet
```

### Report Generation

Reports are automatically generated after each run:

```
copilot-test-results/
├── report.html           # Latest HTML report
├── report.json           # Latest JSON results
└── runs/
    ├── 2024-01-15T10-30-00.html
    └── 2024-01-15T10-30-00.json
```

Open the latest report:

```bash
copilot-test report
```

### Custom Output Directory

Specify a custom output directory:

```bash
copilot-test run --output-dir=custom-results
```

In configuration:

```typescript
configure({
  outputDir: 'custom-results'
});
```

## Advanced Options

### Fail Fast

Stop execution on first failure:

```bash
copilot-test run --fail-fast
```

```typescript
configure({
  failFast: true
});
```

### Step Timeout

Set custom timeout per step:

```bash
copilot-test run --step-timeout=60000  # 60 seconds
```

```typescript
configure({
  stepTimeout: 60000
});
```

### Screenshot Control

Control screenshot capture:

```bash
# Always capture screenshots
copilot-test run --screenshot=always

# Only on failure (default)
copilot-test run --screenshot=failure

# Never capture
copilot-test run --screenshot=never
```

```typescript
configure({
  screenshotOnFailure: true  // or false
});
```

## CI/CD Integration

### GitHub Actions

```yaml
name: CopilotTest
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - run: npx copilot-test run --headless --parallel
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: copilot-test-results/
```

### GitLab CI

```yaml
test:
  image: node:20
  script:
    - npm ci
    - npx copilot-test run --headless --parallel
  artifacts:
    when: always
    paths:
      - copilot-test-results/
  variables:
    GITHUB_TOKEN: $GITHUB_TOKEN
```

### Jenkins

```groovy
pipeline {
  agent any

  stages {
    stage('Test') {
      steps {
        sh 'npm ci'
        sh 'npx copilot-test run --headless --parallel'
      }
    }
  }

  post {
    always {
      publishHTML([
        reportDir: 'copilot-test-results',
        reportFiles: 'report.html',
        reportName: 'CopilotTest Report'
      ])
    }
  }
}
```

## Environment Variables

Configure CopilotTest via environment variables:

```bash
# GitHub token (required)
export GITHUB_TOKEN=your_token

# Model selection
export COPILOT_MODEL=gpt-4o

# Environment
export TEST_ENV=staging

# Headless mode
export HEADLESS=true

# Parallel execution
export PARALLEL=true
export MAX_WORKERS=4
```

Access in configuration:

```typescript
configure({
  model: process.env.COPILOT_MODEL || 'gpt-4o',
  platforms: {
    web: webPlatform({
      headless: process.env.HEADLESS === 'true'
    })
  },
  parallel: process.env.PARALLEL === 'true',
  maxWorkers: parseInt(process.env.MAX_WORKERS || '4')
});
```

## Performance Optimization

### Parallel Execution Best Practices

```typescript
configure({
  parallel: true,
  maxWorkers: 'auto',  // CPU cores - 1
  workerTimeout: 300000,
  failFast: false      // Complete all tests even if some fail
});
```

### Selective Test Execution

Run only what changed:

```bash
# Run tests affected by recent changes
copilot-test run --changed

# Run specific features
copilot-test run --tag=@smoke --tag=@critical
```

### Resource Management

```typescript
configure({
  stepTimeout: 30000,          // Prevent hanging tests
  screenshotOnFailure: true,   // Only capture when needed
  platforms: {
    web: webPlatform({
      headless: true            // Faster in CI
    })
  }
});
```

## Listing Available Tests

View all tests without running them:

```bash
copilot-test list
```

Output:

```
Feature: User Authentication (tests/login.spec.ts)
  ✓ Scenario: Successful login [@smoke, @auth]
  ✓ Scenario: Invalid credentials [@negative, @auth]
  ✓ Scenario: Password reset [@auth]

Feature: Shopping Cart (tests/cart.spec.ts)
  ✓ Scenario: Add product to cart [@smoke]
  ✓ Scenario: Remove product from cart [@cart]

Total: 2 features, 5 scenarios
```

## Next Steps

- [Best Practices](../guides/best-practices.md) - Write effective tests
- [Configuration Guide](../guides/configuration.md) - Advanced configuration
- [CI/CD Integration](../advanced/ci-cd-integration.md) - Automate your tests
- [Performance Tuning](../advanced/performance-tuning.md) - Optimize execution
