# Running Tests

Learn all the ways to run and control your CopilotTest test execution.

## Basic Execution

### Run All Tests

Execute all tests in your test directory:

```bash
copilot-test run
```

By default, this runs all `*.feature.md` files in the `tests/` directory.

### Run Specific File

Run a single test file:

```bash
copilot-test run tests/login.feature.md
```

### Run Multiple Files

Run multiple specific files:

```bash
copilot-test run tests/login.feature.md tests/checkout.feature.md
```

## Filtering Tests

**Note:** The CLI currently parses filtering flags (`--tag`, `--filter`) but doesn't apply them during execution. Use configuration options or filter tests by running specific files. Full CLI flag support is planned for future releases.

### By Environment

Set the environment for your tests (currently supported):

```bash
copilot-test run --env=staging
copilot-test run --env=production
```

This sets `process.env.ENVIRONMENT`, which you can reference in your `copilot-test.config.yaml` via environment variable interpolation or use separate config files per environment.

## Execution Modes

Configure execution modes in your configuration file:

### Headless Mode

Set in `copilot-test.config.yaml`:

```yaml
platforms:
  web:
    platform: web
    browser: chromium
    headless: true  # Set to false for local debugging
```

### Parallel Execution

Set in `copilot-test.config.yaml`:

```yaml
parallel: true
maxWorkers: 4          # or 'auto' for CPU-based
workerTimeout: 300000  # 5 minutes per scenario
```

### Debug Mode

Set in `copilot-test.config.yaml`:

```yaml
debugMode: true
breakpoints:
  - "When I click submit"
  - "Then I should see"
```

## Programmatic Execution

> **Note:** Normal usage is via `.feature.md` files and the CLI. The Node.js API below is for advanced users who need programmatic control.

### From Node.js

Run tests programmatically:

```typescript
import { loadConfig, loadTests, run } from 'copilot-test';

// Load YAML configuration
const config = await loadConfig('./copilot-test.config.yaml');

// Load all .feature.md test files
const tests = await loadTests('./tests/**/*.feature.md');

// Execute
await run(config, tests);
```

### With Options

Pass runtime options:

```typescript
import { loadConfig, loadTests, run } from 'copilot-test';

const config = await loadConfig('./copilot-test.config.yaml');
const tests = await loadTests('./tests/**/*.feature.md');

// Run and inspect results
const results = await run(config, tests);

console.log(`Passed: ${results.summary.passed}`);
console.log(`Failed: ${results.summary.failed}`);

// Exit with error code if failures
if (results.summary.failed > 0) {
  process.exit(1);
}
```

## Retry Failed Tests

Automatically retry failed scenarios in `copilot-test.config.yaml`:

```yaml
retry:
  enabled: true
  stepRetries: 3
  stepRetryDelay: 1000
```

## Output and Reporting

### Console Output

Console output is generated automatically during test execution.

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

Set in `copilot-test.config.yaml`:

```yaml
outputDir: custom-results
```

## Advanced Options

### Fail Fast

Set in `copilot-test.config.yaml`:

```yaml
failFast: true
```

### Step Timeout

Set in `copilot-test.config.yaml`:

```yaml
stepTimeout: 60000  # 60 seconds
```

### Screenshot Control

Set in `copilot-test.config.yaml`:

```yaml
screenshotOnFailure: true  # or false
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

      - run: npx copilot-test run
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: copilot-test-results/
```

**Note:** Configure headless mode and parallel execution in your `copilot-test.config.yaml` file, not via CLI flags.

### GitLab CI

```yaml
test:
  image: node:20
  script:
    - npm ci
    - npx copilot-test run
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
        sh 'npx copilot-test run'
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
export COPILOT_MODEL=gpt-5-mini

# Environment
export TEST_ENV=staging

# Headless mode
export HEADLESS=true

# Parallel execution
export PARALLEL=true
export MAX_WORKERS=4
```

Access in `copilot-test.config.yaml` (static values; for dynamic env-based config, use the Node.js API):

```yaml
model: gpt-5-mini
platforms:
  web:
    platform: web
    browser: chromium
    headless: true
parallel: true
maxWorkers: 4
```

## Performance Optimization

### Parallel Execution Best Practices

Set in `copilot-test.config.yaml`:

```yaml
parallel: true
maxWorkers: auto       # CPU cores - 1
workerTimeout: 300000
failFast: false        # Complete all tests even if some fail
```

### Selective Test Execution

Run specific test files:

```bash
# Run specific features
copilot-test run tests/login.feature.md tests/checkout.feature.md
```

### Resource Management

Set in `copilot-test.config.yaml`:

```yaml
stepTimeout: 30000            # Prevent hanging tests
screenshotOnFailure: true     # Only capture when needed
platforms:
  web:
    platform: web
    browser: chromium
    headless: true            # Faster in CI
```

## Listing Available Tests

View all tests without running them:

```bash
copilot-test list
```

Output:

```
Feature: User Authentication (tests/login.feature.md)
  ✓ Scenario: Successful login [@smoke, @auth]
  ✓ Scenario: Invalid credentials [@negative, @auth]
  ✓ Scenario: Password reset [@auth]

Feature: Shopping Cart (tests/cart.feature.md)
  ✓ Scenario: Add product to cart [@smoke]
  ✓ Scenario: Remove product from cart [@cart]

Total: 2 features, 5 scenarios
```

## Next Steps

- [Best Practices](../guides/best-practices.md) - Write effective tests
- [Configuration Guide](../guides/configuration.md) - Advanced configuration
- [CI/CD Integration](../advanced/ci-cd-integration.md) - Automate your tests
- [Performance Tuning](../advanced/performance-tuning.md) - Optimize execution
