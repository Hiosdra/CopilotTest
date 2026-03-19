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
  // Parallel execution options (NEW)
  parallel: true,                     // Enable parallel scenario execution
  maxWorkers: 4,                      // Number of concurrent workers (or 'auto' for CPU-based)
  workerTimeout: 300000,              // Max time per scenario (ms, default: 5 minutes)
  failFast: false,                    // Stop all workers on first failure
});
```

## Parallel Execution

Run scenarios in parallel for significantly faster test execution:

```typescript
configure({
  model: 'gpt-4o',
  platforms: { web: webPlatform() },
  parallel: true,           // Enable parallel execution
  maxWorkers: 4,            // Run 4 scenarios concurrently
  workerTimeout: 300000,    // 5 minute timeout per worker
  failFast: false,          // Continue running even if one fails
});
```

### Configuration Options

- **`parallel`**: Enable/disable parallel execution (default: `false`)
- **`maxWorkers`**: Number of concurrent workers
  - Use a number (e.g., `4`) for fixed worker count
  - Use `'auto'` to automatically determine based on CPU cores (CPU count - 1)
- **`workerTimeout`**: Maximum time a scenario can run before timing out (default: `300000ms` / 5 minutes)
- **`failFast`**: Stop all workers immediately when any scenario fails (default: `false`)

### Benefits

- **Faster execution**: 50+ scenarios can run in minutes instead of tens of minutes
- **Better resource utilization**: Utilize multiple CPU cores effectively
- **CI/CD optimization**: Reduce pipeline execution time
- **Proper isolation**: Each scenario gets its own session and resources

### Example Output

```
⚡ Running 12 scenarios with 4 workers

[Worker 0] Starting scenario: User login
[Worker 1] Starting scenario: Password reset
[Worker 2] Starting scenario: Profile update
[Worker 3] Starting scenario: Logout flow
[Worker 0] ✅ User login (2341ms) [1/12]
[Worker 0] Starting scenario: Two-factor auth
[Worker 2] ✅ Profile update (2456ms) [2/12]
...

✨ Parallel execution complete: 11 passed, 1 failed
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

## 🎨 Visual Regression Testing

CopilotTest includes built-in support for visual regression testing to detect unintended visual changes in your application.

### Overview

Visual regression testing captures screenshots of your application and compares them against baseline images to detect:
- Layout shifts
- CSS changes
- Font rendering differences
- Color changes
- Image differences
- Responsive design issues

### Quick Start

```typescript
import { configure, feature, test, run, webPlatform } from 'copilot-test';

configure({
  model: 'gpt-4o',
  platforms: {
    web: webPlatform({
      browser: 'chromium',
      headless: true,
    }),
  },
  visualRegression: {
    enabled: true,
    threshold: 0.1,        // 0.1% difference tolerance
    baselineDir: 'tests/visual-baselines',
    diffDir: 'copilot-test-results/visual-diffs',
    algorithm: 'pixel',    // 'pixel' | 'perceptual' | 'ssim'
  },
});

test(
  feature('Homepage Visual Regression')
    .scenario('Visual consistency check')
      .given('I am on https://example.com')
      .then('I take a full page screenshot named "homepage-full"')
      .and('the visual appearance matches the baseline within 0.1% threshold')
      .done()
    ._build(),
  'web'
);

await run();
```

### Configuration Options

Add visual regression configuration to your `configure()` call:

```typescript
configure({
  platforms: { web: webPlatform() },
  visualRegression: {
    enabled: true,           // Enable visual regression testing
    threshold: 0.1,          // Difference tolerance (0-100%)
    baselineDir: 'tests/visual-baselines',  // Where baselines are stored
    diffDir: 'copilot-test-results/visual-diffs',  // Where diffs are saved
    algorithm: 'pixel',      // Comparison algorithm
  },
});
```

### Comparison Features

#### 1. Full Page Screenshots

```typescript
feature('Full Page Visual Test')
  .scenario('Homepage appearance')
    .given('I am on https://example.com')
    .then('I take a full page screenshot named "homepage"')
    .and('the visual appearance matches the baseline')
    .done();
```

#### 2. Element Screenshots

```typescript
feature('Component Visual Test')
  .scenario('Product card appearance')
    .given('I am on https://example.com/products')
    .when('I locate the product card element')
    .then('I take a screenshot of the element named "product-card"')
    .and('the element appearance matches the baseline')
    .done();
```

#### 3. Responsive Testing

Test visual appearance across different viewports:

```typescript
feature('Responsive Design')
  .scenario('Desktop viewport')
    .given('I am on https://example.com')
    .and('the viewport is 1920x1080 pixels')
    .then('I take a screenshot named "homepage-desktop"')
    .and('the appearance matches the baseline')
    .done()
  .scenario('Tablet viewport')
    .given('I am on https://example.com')
    .and('the viewport is 768x1024 pixels')
    .then('I take a screenshot named "homepage-tablet"')
    .and('the appearance matches the baseline')
    .done()
  .scenario('Mobile viewport')
    .given('I am on https://example.com')
    .and('the viewport is 375x667 pixels')
    .then('I take a screenshot named "homepage-mobile"')
    .and('the appearance matches the baseline')
    .done();
```

#### 4. Hiding Dynamic Content

Exclude dynamic elements that change frequently:

```typescript
feature('Visual Test with Dynamic Content')
  .scenario('Hide dynamic elements')
    .given('I am on https://example.com/dashboard')
    .when('I hide elements with class "timestamp"')
    .and('I hide elements with class "ad-banner"')
    .and('I hide elements with class "dynamic-content"')
    .then('I take a screenshot named "dashboard-stable"')
    .and('the appearance matches the baseline')
    .done();
```

#### 5. Waiting for Stability

Wait for animations and fonts to load before capturing:

```typescript
feature('Animated Page Visual Test')
  .scenario('Wait for stability')
    .given('I am on https://example.com/animated-page')
    .and('I wait for all CSS animations to complete')
    .and('I wait for all web fonts to load')
    .and('I wait 1000ms for page stability')
    .then('I take a screenshot named "animated-page-stable"')
    .and('the appearance matches the baseline')
    .done();
```

### Programmatic API

You can also use the visual regression API directly:

```typescript
import { createVisualRegression } from 'copilot-test';

const visual = createVisualRegression({
  enabled: true,
  threshold: 0.1,
  baselineDir: 'tests/visual-baselines',
  diffDir: 'copilot-test-results/visual-diffs',
});

// Enable baseline update mode
visual.enableBaselineUpdate();

// Compare screenshot
const result = await visual.compareScreenshot(page, 'homepage', {
  fullPage: true,
  threshold: 0.05,
  hideElements: ['.timestamp', '.ad-banner'],
});

if (!result.passed) {
  console.log(`Visual difference: ${result.difference}%`);
  console.log(`Diff pixels: ${result.diffPixels}`);
  console.log(`Diff image: ${result.diffPath}`);
}

// Compare element
const elementResult = await visual.compareElement(
  page.locator('.product-card'),
  'product-card',
  { threshold: 0.1 }
);

// Responsive comparison
const responsiveResults = await visual.compareResponsive(
  page,
  'homepage',
  { breakpoints: ['desktop', 'tablet', 'mobile'] }
);
```

### Managing Baselines

#### Creating Initial Baselines

Run your tests with baseline update mode to create initial baseline images:

```bash
# Set environment variable to update baselines
npm run test:visual -- --update-visual-baselines

# Or programmatically
visual.enableBaselineUpdate();
```

Baselines are stored in your configured `baselineDir` (default: `tests/visual-baselines/`):

```
tests/visual-baselines/
├── homepage-desktop.png
├── homepage-tablet.png
├── homepage-mobile.png
└── product-card.png
```

#### Updating Baselines

When you intentionally change the UI, update baselines:

```bash
# Update all baselines
npm run test:visual -- --update-visual-baselines

# Or selectively approve changes after review
visual.enableBaselineUpdate();
```

#### Reviewing Differences

When tests fail due to visual differences, review the diff images:

```
copilot-test-results/visual-diffs/
├── homepage-current.png        # Current screenshot
├── homepage-diff.png           # Highlighted differences
├── product-card-current.png
└── product-card-diff.png
```

### CI/CD Integration

#### Store Baselines in Git

Commit baseline images to version control:

```bash
git add tests/visual-baselines/
git commit -m "Add visual regression baselines"
```

#### GitHub Actions Example

```yaml
name: Visual Regression Tests
on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npm run build

      # Run visual regression tests
      - name: Run visual tests
        run: npm run test:visual
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          COPILOT_VISUAL_LIVE: 1

      # Upload diffs on failure
      - name: Upload visual diffs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs
          path: copilot-test-results/visual-diffs/

      # Upload reports
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-report
          path: copilot-test-results/
```

### Comparison Algorithms

Choose the algorithm that best fits your needs:

- **pixel**: Fast pixel-level comparison (default)
  - Best for exact visual matching
  - Sensitive to anti-aliasing differences

- **perceptual**: Human perception-based comparison
  - Better for detecting meaningful visual changes
  - More tolerant of minor rendering differences

- **ssim**: Structural Similarity Index (SSIM)
  - Compares image structure and patterns
  - Good for detecting layout changes

### Advanced Options

#### Custom Tolerance Per Test

Override the global threshold for specific tests:

```typescript
feature('Strict Visual Test')
  .scenario('Exact match required')
    .given('I am on https://example.com')
    .then('I take a screenshot with 0.01% threshold named "exact-match"')
    .and('the appearance matches the baseline')
    .done();
```

#### Ignore Regions

Ignore specific regions during comparison:

```typescript
// Using programmatic API
const result = await visual.compareScreenshot(page, 'dashboard', {
  ignoreRegions: [
    { x: 0, y: 0, width: 200, height: 50 },  // Header area
    { x: 800, y: 600, width: 300, height: 200 },  // Ad banner
  ],
});
```

### Best Practices

1. **Baseline Management**
   - Store baselines in version control
   - Review visual diffs before updating baselines
   - Document intentional visual changes

2. **Test Stability**
   - Hide dynamic content (timestamps, ads, etc.)
   - Wait for animations to complete
   - Ensure fonts are loaded before capturing

3. **Viewport Testing**
   - Test key breakpoints: desktop, tablet, mobile
   - Use consistent viewport sizes
   - Test both portrait and landscape orientations

4. **Threshold Tuning**
   - Start with 0.1% threshold
   - Increase for tests with unavoidable variations
   - Use stricter thresholds for critical UI components

5. **CI/CD Integration**
   - Run visual tests in consistent environments
   - Upload diffs as artifacts for review
   - Consider using dedicated visual testing services for cross-browser testing

### Example Output

When visual differences are detected:

```
Visual Regression Test Failed

Homepage Comparison:
  Baseline:   tests/visual-baselines/homepage.png
  Current:    copilot-test-results/visual-diffs/homepage-current.png
  Diff:       copilot-test-results/visual-diffs/homepage-diff.png

  Difference: 2.3% (threshold: 0.1%)
  Changed pixels: 4,521

  Status: FAILED
```

### Troubleshooting

**Issue**: Tests fail with small differences on CI but pass locally
- **Solution**: Ensure consistent environment (fonts, browser version, OS)

**Issue**: Fonts look different between runs
- **Solution**: Wait for web fonts to load before capturing screenshots

**Issue**: Animations cause inconsistent results
- **Solution**: Wait for animations to complete or hide animated elements

**Issue**: Dynamic content causes failures
- **Solution**: Hide dynamic elements or use ignore regions

