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
