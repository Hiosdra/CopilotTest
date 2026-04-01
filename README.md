# 🧪 CopilotTest — AI-Driven BDD Testing Framework

Write test scenarios in **Given/When/Then** style — no step implementations required. GitHub Copilot SDK with MCP servers (Playwright, Android Emulator, curl) autonomously interprets and executes each step.

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Your .feature.md Tests             │
│  # Feature: Login                               │
│  ## Scenario: Successful login                  │
│  - Given I am on the login page                 │
│  - When I enter valid credentials               │
│  - Then I see the dashboard                     │
└─────────────────┬───────────────────────────────┘
                  │ Markdown Parser (src/parser.ts)
                  ▼
┌─────────────────────────────────────────────────┐
│             CopilotTest Runner                  │
│  parse → enqueue → run                           │
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

## 📚 Documentation

**New to CopilotTest?** Start with our comprehensive documentation:

- 📖 **[Complete Documentation](./docs/README.md)** - Full documentation index
- 🚀 **[Getting Started](./docs/getting-started/installation.md)** - Installation and setup
- ⚡ **[Quick Start Guide](./docs/getting-started/quick-start.md)** - Get running in 5 minutes
- 📝 **[Your First Test](./docs/getting-started/your-first-test.md)** - Step-by-step tutorial
- 🌐 **[Web Testing](./docs/guides/web-testing.md)** - Test web applications
- 🔌 **[API Testing](./docs/guides/api-testing.md)** - Test REST APIs
- 📱 **[Mobile Testing](./docs/guides/mobile-testing.md)** - Test mobile apps
- ⭐ **[Best Practices](./docs/guides/best-practices.md)** - Write effective tests
- ⚙️ **[Configuration](./docs/guides/configuration.md)** - Complete config reference
- 🐛 **[Debugging](./docs/guides/debugging.md)** - Debug failing tests
- 🔧 **[Troubleshooting](./docs/troubleshooting/common-errors.md)** - Common issues & solutions

**Advanced Features:**
- [Custom Steps](./docs/CUSTOM_STEPS.md) | [Plugins](./docs/PLUGINS.md) | [Debug Mode](./docs/DEBUG_MODE.md) | [Watch Mode](./docs/watch-mode.md) | [Performance](./docs/performance-monitoring.md)

## Quick Start

### Using the CLI (Recommended)

```bash
# Install globally or use npx
npm install -g copilot-test
# or
npx copilot-test <command>

# Initialize new project
copilot-test init

# Run tests
copilot-test run

# List all tests
copilot-test list

# Validate configuration
copilot-test validate

# Health check
copilot-test doctor
```

### Manual Setup

```bash
npm install
npm run build
npm test
```

## CLI Reference

The CLI tool provides comprehensive commands for managing your test projects.

### Commands

#### `init` - Initialize New Project

Interactive project scaffolding with templates and examples.

```bash
copilot-test init

# Prompts for:
# - Project name
# - Platforms (web, api, mobile)
# - AI Model
# - Install dependencies
```

Creates:
- `copilot-test.config.yaml` - Configuration file
- `tests/` directory with example `.feature.md` tests
- `package.json` (if not exists)
- `.gitignore`
- `README.md`

#### `run` - Run Tests

Execute tests with various options.

```bash
# Run all tests
copilot-test run

# Run specific file
copilot-test run tests/login.feature.md

# Run with filters
copilot-test run --tag=@smoke
copilot-test run --filter="login"
copilot-test run --env=staging

# Run with options
copilot-test run --headless
copilot-test run --parallel
copilot-test run --debug
```

#### `list` - List Available Tests

Display all features and scenarios in your test suite.

```bash
copilot-test list

# Output:
# Feature: User Login (tests/login.feature.md)
#   ✓ Scenario: Successful admin login [@smoke]
#   ✓ Scenario: Invalid credentials [@negative]
# Total: 2 features, 6 scenarios
```

#### `report` - Generate and View Reports

Open reports or compare test runs.

```bash
# Open latest report in browser
copilot-test report
copilot-test report open

# Compare two test runs
copilot-test report compare \
  --baseline copilot-test-results/runs/baseline.json \
  --current copilot-test-results/runs/current.json \
  --output comparison.html
```

#### `validate` - Validate Configuration

Check your configuration and environment setup.

```bash
copilot-test validate

# Checks:
# ✓ Configuration file exists and is valid
# ✓ Test files present
# ✓ Dependencies installed
# ✓ Node.js version compatible
# ⚠ Warnings and errors
```

#### `create` - Create New Test

Scaffold a new test file from templates.

```bash
copilot-test create test

# Prompts for:
# - Test type (web, api, mobile)
# - Feature name
# - Scenario name
# - File name
```

#### `doctor` - System Health Check

Comprehensive environment validation.

```bash
copilot-test doctor

# Checks:
# ✓ Node.js version
# ✓ Dependencies present
# ✓ Config file valid
# ✓ API keys configured
# ⚠ Warnings and issues
```

#### `config` - Manage Global Configuration

Set and manage global CLI preferences.

```bash
# Set configuration
copilot-test config set model gpt-4o
copilot-test config set headless true
copilot-test config set parallel true

# Get configuration value
copilot-test config get model

# List all configuration
copilot-test config list

# Delete configuration
copilot-test config delete model
```

### Options

Global options available for commands:

- `-v, --version` - Show CLI version
- `-h, --help` - Show help information
- `--env <name>` - Set environment
- `--tag <tag>` - Filter by tag
- `--parallel` - Enable parallel execution
- `--headless` - Run in headless mode
- `--debug` - Enable debug output

## Writing Tests

### Web Test

````markdown
---
platform: web
tags: [auth, smoke]
---

# Feature: User Authentication

## Scenario: Successful login
- Given I am on https://example.com/login
- When I enter username 'admin' and password 'secret'
- And I click the Login button
- Then I should see the dashboard
````

### API Test

````markdown
---
platform: api
tags: [api, crud]
---

# Feature: Users API

## Scenario: Create a user
- Given the Users API is available
- When I POST to /users with body:
  ```json
  {"name": "Alice", "email": "alice@example.com"}
  ```
- Then the response status is 201
- And the response contains the new user's id
````

### Mobile Test

````markdown
---
platform: mobile
tags: [mobile, onboarding]
---

# Feature: App Onboarding

## Scenario: New user completes onboarding
- Given the app is launched for the first time
- When I tap 'Get Started'
- And I fill in my profile details
- Then I see the home screen
````

## Configuration Reference

All configuration lives in `copilot-test.config.yaml` at the project root:

```yaml
model: gpt-4o                        # AI model to use
reasoningEffort: high                 # low | medium | high
stepTimeout: 30000                    # Timeout per step (ms)
retries: 2                            # Retry failed scenarios
screenshotOnFailure: true             # Capture screenshots on failure
outputDir: copilot-test-results       # Report output directory

platforms:
  web:
    platform: web
    browser: chromium
    headless: true
    baseUrl: "https://example.com"
  api:
    platform: api
    baseUrl: "https://api.example.com"
    defaultHeaders:
      Content-Type: application/json
  mobile:
    platform: mobile
    device: emulator-5554
    appPackage: com.example.app
    appActivity: .MainActivity

mcpServers:                           # Additional MCP servers
  database:
    type: stdio
    command: npx
    args: [my-db-mcp]

parallel: true                        # Enable parallel scenario execution
maxWorkers: 4                         # Number of concurrent workers (or 'auto' for CPU-based)
workerTimeout: 300000                 # Max time per scenario (ms, default: 5 minutes)
failFast: false                       # Stop all workers on first failure

watch:
  enabled: true                       # Enable watch mode
  include: ["tests/**/*.feature.md"]  # Files to watch
  exclude: ["node_modules/**", "dist/**"]  # Files to exclude
  debounce: 300                       # Delay before re-running (ms)
  runMode: all                        # all | related | changed-files
  failedFirst: true                   # Run failed tests first
  clearConsole: false                 # Clear console before each run
```

## Watch Mode

Run tests continuously during development with automatic re-execution on file changes:

```bash
npm run test:watch tests/login.feature.md
```

**Note**: Watch mode CLI requires a test file path. Watch mode automatically parses `.feature.md` files and handles test execution.

### Interactive Controls

When running in a terminal, watch mode provides keyboard controls:

```
Interactive Commands:
  a - Run all tests
  f - Run only failed tests
  q - Quit watch mode
  Enter - Re-run tests
```

### Watch Mode UI

```
╔════════════════════════════════════════╗
║      COPILOT TEST - WATCH MODE         ║
╚════════════════════════════════════════╝

📁 Watching 42 files...

============================================================
🔄 Running tests... (10:30:45 AM)
============================================================

📝 Changed files:
  • src/login.ts
  • tests/login.feature.md

[Test execution output...]

╔════════════════════════════════════════╗
║ Status: ✓ All tests passed            ║
║ Tests: 12 passed, 0 failed            ║
║ Pass rate: 100%                        ║
║ Duration: 2345ms                       ║
╚════════════════════════════════════════╝

👀 Watching for file changes...
```

### Configuration

Watch mode is configured in `copilot-test.config.yaml` under the `watch` key:

```yaml
watch:
  enabled: true                       # Enable watch mode
  include: ["tests/**/*.feature.md"]  # Files to watch
  exclude: ["node_modules/**", "dist/**"]  # Files to exclude
  debounce: 300                       # Delay before re-running (ms)
  runMode: all                        # all | related | changed-files
  failedFirst: true                   # Run failed tests first
  clearConsole: false                 # Clear console before each run
  maxWorkers: 2                       # Limit workers in watch mode
```

See [Watch Mode Documentation](./docs/watch-mode.md) for more details.

## Parallel Execution

Run scenarios in parallel for significantly faster test execution:

Parallel execution is configured in `copilot-test.config.yaml`:

```yaml
model: gpt-4o
parallel: true              # Enable parallel execution
maxWorkers: 4               # Run 4 scenarios concurrently
workerTimeout: 300000       # 5 minute timeout per worker
failFast: false             # Continue running even if one fails
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



## Test Format Reference

Tests are written as `.feature.md` Markdown files with YAML frontmatter:

```markdown
---
platform: web | api | mobile         # Required: target platform
tags: [tag1, tag2]                    # Optional: tags for filtering
---

# Feature: Feature Name

Optional feature-level description text.

## Background
- Given a common precondition
- And another shared setup step

## Scenario: First scenario name
- Given some initial context
- When an action is performed
- Then an expected outcome occurs
- And another assertion
- But not this other thing

## Scenario: Second scenario name
- Given a different context
- When I do something else
- Then I see the expected result

## Scenario Outline: Parameterized scenario
- Given I am on the <page> page
- When I search for '<query>'
- Then I see <count> results

| page   | query   | count |
|--------|---------|-------|
| home   | shoes   | 10    |
| search | jackets | 5     |
```

### Structure

- **YAML frontmatter** (`---`): Declares `platform` and optional `tags`
- **`# Feature:`**: Top-level heading names the feature
- **`## Background`**: Steps shared across all scenarios (optional)
- **`## Scenario:`**: Individual test scenario
- **`## Scenario Outline:`**: Parameterized scenario with an examples table
- **Step prefixes**: `Given`, `When`, `Then`, `And`, `But` as Markdown list items (`- `)

## How It Works

1. **You write** `.feature.md` files with Given/When/Then steps — no implementation needed
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
| **Platform agnostic** | Same Markdown format for web, mobile, and API testing |
| **AI-powered** | GitHub Copilot SDK drives test execution via MCP tools |
| **BDD-native** | Given/When/Then syntax promotes collaboration |
| **Transparent** | AI reasoning is captured and included in reports |
| **Extensible** | Add custom MCP servers for any tool or platform |

## Project Structure

```
src/
  types.ts          # Core TypeScript interfaces
  parser.ts         # Markdown/YAML test file parser
  runtime.ts        # CopilotTestRuntime — core AI execution engine
  runner.ts         # Test queue and run orchestration
  reporter.ts       # HTML/JSON report generator
  compare.ts        # Test run comparison utilities
  cli-compare.ts    # CLI for comparing test runs
  platforms/
    web.ts          # Playwright MCP platform config
    api.ts          # curl MCP platform config
    mobile.ts       # Android MCP platform config
  index.ts          # Public API exports
tests/
  login.feature.md      # Web test example
  api-users.feature.md  # API test example
  mobile-app.feature.md # Mobile test example
copilot-test.config.yaml  # Project configuration
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
