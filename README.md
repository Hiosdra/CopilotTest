# 🧪 CopilotTest — AI-Driven BDD Testing Framework

Write test scenarios in **Given/When/Then** style — no step implementations required. GitHub Copilot SDK with MCP servers (Playwright, Android Emulator, curl) autonomously interprets and executes each step.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Your Tests                    │
│  feature("Login")                               │
│    .scenario("Successful login")                │
│      .given("I am on the login page")           │
│      .when("I enter valid credentials")         │
│      .then("I see the dashboard")               │
└─────────────────┬───────────────────────────────┘
                  │ DSL (src/dsl.ts)
                  ▼
┌─────────────────────────────────────────────────┐
│             CopilotTest Runner                  │
│  configure() → test() → run()                   │
└─────────────────┬───────────────────────────────┘
                  │ src/runtime.ts
                  ▼
┌─────────────────────────────────────────────────┐
│           GitHub Copilot SDK                    │
│  CopilotClient → Session → sendAndWait()        │
└────────┬──────────────┬──────────────┬──────────┘
         │              │              │
    Playwright      curl MCP      Android MCP
       MCP         (REST APIs)   (Mobile apps)
  (Web browsers)
```

## Quick Start

```bash
npm install
npm run build
npm test
```

## Writing Tests

### Web Test

```typescript
import { configure, feature, test, run } from 'copilot-test';
import { webPlatform } from 'copilot-test';

configure({
  model: 'gpt-4o',
  platforms: { web: webPlatform({ browser: 'chromium' }) },
});

test(
  feature('User Authentication')
    .scenario('Successful login')
      .given("I am on https://example.com/login")
      .when("I enter username 'admin' and password 'secret'")
      .and("I click the Login button")
      .then("I should see the dashboard")
      .done()
    ._build(),
  'web'
);

await run();
```

### API Test

```typescript
import { configure, feature, test, run } from 'copilot-test';
import { apiPlatform } from 'copilot-test';

configure({
  model: 'gpt-4o',
  platforms: { api: apiPlatform({ baseUrl: 'https://api.example.com' }) },
});

test(
  feature('Users API')
    .scenario('Create a user')
      .given("the Users API is available")
      .when("I POST to /users")
      .withDocString('{"name": "Alice", "email": "alice@example.com"}')
      .then("the response status is 201")
      .and("the response contains the new user's id")
      .done()
    ._build(),
  'api'
);

await run();
```

### Mobile Test

```typescript
import { configure, feature, test, run } from 'copilot-test';
import { mobilePlatform } from 'copilot-test';

configure({
  model: 'gpt-4o',
  platforms: {
    mobile: mobilePlatform({
      device: 'emulator-5554',
      appPackage: 'com.example.app',
    }),
  },
});

test(
  feature('App Onboarding')
    .scenario('New user completes onboarding')
      .given("the app is launched for the first time")
      .when("I tap 'Get Started'")
      .and("I fill in my profile details")
      .then("I see the home screen")
      .done()
    ._build(),
  'mobile'
);

await run();
```

## Configuration Reference

```typescript
configure({
  model: 'gpt-4o',                    // AI model to use
  reasoningEffort: 'high',            // 'low' | 'medium' | 'high'
  platforms: {
    web: webPlatform({ ... }),
    api: apiPlatform({ ... }),
    mobile: mobilePlatform({ ... }),
  },
  baseUrl: 'https://example.com',     // Default base URL
  stepTimeout: 30000,                 // Timeout per step (ms)
  retries: 2,                         // Retry failed scenarios
  screenshotOnFailure: true,          // Capture screenshots on failure
  outputDir: 'copilot-test-results',  // Report output directory
  mcpServers: {                       // Additional MCP servers
    database: { type: 'stdio', command: 'npx', args: ['my-db-mcp'] },
  },
});
```

## DSL Reference

```typescript
feature(name: string)
  .tag(...tags)
  .description(text)
  .background()
    .given(step)
    .and(step)
    .scenario(name)  // ends background, starts scenario
  .scenario(name)
    .tag(...tags)
    .given(step)
    .when(step)
    .then(step)
    .and(step)
    .but(step)
    .withTable([[header1, header2], [val1, val2]])
    .withDocString(text)
    .scenario(nextScenario)  // chain next scenario
    .done()  // end builder, returns FeatureBuilder
  ._build()  // returns Feature object
```

## How It Works

1. **You write** BDD scenarios with Given/When/Then steps — no implementation needed
2. **CopilotTest** creates a GitHub Copilot SDK session per scenario
3. **The AI agent** receives your step as a prompt with platform-specific tools available
4. **MCP tools** allow the AI to actually interact with browsers, APIs, or mobile apps
5. **Results** are collected, displayed in real-time, and saved as an HTML report

## CI/CD — GitHub Actions

```yaml
name: BDD Tests
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
      - run: npm run build
      - run: npm test
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-report
          path: copilot-test-results/
```

## Design Principles

| Principle | Description |
|-----------|-------------|
| **Zero-implementation** | Write intent, not code. The AI figures out how to execute it. |
| **Platform agnostic** | Same DSL for web, mobile, and API testing |
| **AI-powered** | GitHub Copilot SDK drives test execution via MCP tools |
| **BDD-native** | Given/When/Then syntax promotes collaboration |
| **Transparent** | AI reasoning is captured and included in reports |
| **Extensible** | Add custom MCP servers for any tool or platform |

## Project Structure

```
src/
  types.ts          # Core TypeScript interfaces
  dsl.ts            # Fluent BDD builder (feature/scenario/step)
  runtime.ts        # CopilotTestRuntime — core AI execution engine
  runner.ts         # Test queue, configure/test/run functions
  reporter.ts       # HTML/JSON report generator
  compare.ts        # Test run comparison utilities
  cli-compare.ts    # CLI for comparing test runs
  platforms/
    web.ts          # Playwright MCP platform config
    api.ts          # curl MCP platform config
    mobile.ts       # Android MCP platform config
  index.ts          # Public API exports
tests/
  login.spec.ts     # Web test example
  api-users.spec.ts # API test example
  mobile-app.spec.ts # Mobile test example
copilot-test.config.ts  # Global config example
```

## 📊 Enhanced Test Reporting

CopilotTest generates interactive HTML reports with advanced filtering, search, and historical tracking capabilities.

### Report Structure

After running tests, reports are saved in the configured output directory (default: `copilot-test-results/`):

```
copilot-test-results/
├── index.html                    # Dashboard showing all test runs
├── report.html                   # Latest test run report
├── report.json                   # Latest test run data
├── trends.json                   # Historical trends data
└── runs/
    ├── 2024-01-15T10-30-00.html # Timestamped run report
    ├── 2024-01-15T10-30-00.json # Timestamped run data
    ├── 2024-01-15T14-20-00.html
    └── 2024-01-15T14-20-00.json
```

### Interactive Features

#### 1. Filtering & Search

The HTML report includes interactive controls:

- **Status Filters**: View All, Passed only, or Failed only scenarios
- **Search**: Filter scenarios by name in real-time
- **Tag Filters**: Click tags to filter scenarios by specific tags
- **Export**: Download test results as JSON

#### 2. Metadata Display

Reports automatically capture CI/CD metadata from environment variables:

```typescript
{
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "duration": 45000,
    "environment": "staging",
    "git": {
      "branch": "main",
      "commit": "abc123",
      "author": "John Doe"
    },
    "ci": {
      "buildNumber": "123",
      "jobUrl": "https://github.com/owner/repo/actions/runs/123"
    }
  }
}
```

Supported environment variables:
- `NODE_ENV`, `ENVIRONMENT` → environment
- `GITHUB_REF_NAME`, `GIT_BRANCH` → git.branch
- `GITHUB_SHA`, `GIT_COMMIT` → git.commit
- `GITHUB_ACTOR`, `GIT_AUTHOR` → git.author
- `GITHUB_RUN_NUMBER`, `BUILD_NUMBER` → ci.buildNumber
- GitHub Actions URL auto-generated from `GITHUB_SERVER_URL`, `GITHUB_REPOSITORY`, `GITHUB_RUN_ID`

#### 3. Dashboard

Open `copilot-test-results/index.html` to view:

- History of recent test runs (up to 20)
- Pass/fail trends over time
- Duration trends
- Quick access to individual run reports
- Download links for JSON data

#### 4. AI Reasoning

AI reasoning is captured in collapsible sections (collapsed by default):

- Click "AI Reasoning" to expand/collapse
- Shows the AI's thought process for each step
- Helps debug why a step passed or failed

### 🔍 Comparing Test Runs

Compare two test runs to identify improvements, regressions, and performance changes.

#### Using the API

```typescript
import { compareTestRuns } from 'copilot-test';

const result = await compareTestRuns(
  'copilot-test-results/runs/2024-01-15T10-30-00.json',
  'copilot-test-results/runs/2024-01-15T14-20-00.json',
  'comparison.html'
);

console.log('Improvements:', result.changes.improved.length);
console.log('Regressions:', result.changes.regressed.length);
console.log('Duration change:', result.performance.durationChange);
```

#### Using the CLI

```bash
npx tsx src/cli-compare.ts \
  --baseline copilot-test-results/runs/2024-01-15T10-30-00.json \
  --current copilot-test-results/runs/2024-01-15T14-20-00.json \
  --output comparison.html
```

#### Comparison Report Features

The comparison report shows:

- **Summary Cards**: Pass rate change, duration change, improvements, regressions
- **Improvements**: Tests that were failing and now pass
- **Regressions**: Tests that were passing and now fail
- **New Scenarios**: Scenarios added since baseline
- **Removed Scenarios**: Scenarios removed since baseline
- **Performance Changes**: Top 10 scenarios with significant duration changes (>100ms)

The CLI exits with code 1 if regressions are detected, making it ideal for CI/CD pipelines.

### CI/CD Integration

#### GitHub Actions Example

```yaml
name: BDD Tests with Comparison
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
      - run: npm run build

      # Download previous run results
      - uses: actions/download-artifact@v4
        continue-on-error: true
        with:
          name: test-results-baseline
          path: baseline/

      # Run tests
      - run: npm test
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      # Compare with baseline if it exists
      - name: Compare with baseline
        if: hashFiles('baseline/report.json') != ''
        run: |
          npx tsx src/cli-compare.ts \
            --baseline baseline/report.json \
            --current copilot-test-results/report.json \
            --output copilot-test-results/comparison.html
        continue-on-error: true

      # Upload current run as next baseline
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results-baseline
          path: copilot-test-results/report.json

      # Upload full report
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-reports
          path: copilot-test-results/
```

### Trends & Historical Analysis

The `trends.json` file tracks up to 50 recent test runs:

```json
{
  "runs": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "duration": 45000,
      "total": 25,
      "passed": 23,
      "failed": 2,
      "skipped": 0,
      "passRate": 92
    }
  ]
}
```

Use this data to:
- Track test suite stability over time
- Monitor test execution duration trends
- Identify flaky tests (tests with inconsistent results)
- Measure improvement or degradation in pass rates
