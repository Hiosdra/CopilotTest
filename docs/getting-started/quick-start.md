# Quick Start

Get up and running with CopilotTest in under 5 minutes!

## 1. Initialize a New Project

```bash
npx copilot-test init
```

Follow the prompts to set up your project. For this quick start, select:
- Platform: **web**
- Model: **gpt-4o-mini** (fastest for learning)
- Language: **TypeScript**

## 2. Set Your GitHub Token

```bash
export GITHUB_TOKEN=your_github_token_here
```

## 3. Run the Example Test

The `init` command creates an example test. Run it:

```bash
npx copilot-test run tests/login.spec.ts
```

You should see output like:

```
🧪 CopilotTest - Test Execution
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature: Example Web Test
  Scenario: Basic navigation
    ✓ Given I am on https://example.com (1.2s)
    ✓ When I click the "More information" link (0.8s)
    ✓ Then I should see "IANA" in the page title (0.3s)

✨ Results: 1 feature, 1 scenario, 3 steps
   ✓ Passed: 1 scenario (3 steps)
   ✗ Failed: 0 scenarios

📊 Report: copilot-test-results/report.html
```

## 4. View the Test Report

Open the HTML report in your browser:

```bash
# On macOS
open copilot-test-results/report.html

# On Linux
xdg-open copilot-test-results/report.html

# Or use the CLI
npx copilot-test report
```

The report shows:
- Test execution summary
- Detailed step-by-step results
- Screenshots (for failures)
- AI reasoning for each step
- Performance metrics

## 5. Write Your First Custom Test

Create a new file `tests/my-first-test.spec.ts`:

```typescript
import { configure, feature, test, run } from 'copilot-test';
import { webPlatform } from 'copilot-test';

configure({
  model: 'gpt-4o-mini',
  platforms: {
    web: webPlatform({
      browser: 'chromium',
      headless: false  // See the browser in action
    })
  }
});

test(
  feature('Google Search')
    .scenario('Search for CopilotTest')
      .given('I am on https://www.google.com')
      .when('I type "CopilotTest BDD framework" in the search box')
      .and('I press Enter')
      .then('I should see search results')
      .and('the results should contain "test"')
      .done()
    ._build(),
  'web'
);
```

**Note:** This file doesn't include `await run()` because it's designed to be executed via the CLI, which handles execution automatically.

Run your test:

```bash
npx copilot-test run tests/my-first-test.spec.ts
```

## 6. Understanding the Test Structure

Let's break down what's happening:

```typescript
// 1. Configure CopilotTest
configure({
  model: 'gpt-4o-mini',              // AI model to use
  platforms: {
    web: webPlatform({ ... })         // Platform configuration
  }
});

// 2. Define a feature
feature('Google Search')              // Feature name

// 3. Create a scenario
  .scenario('Search for CopilotTest') // Scenario name

// 4. Write steps in Given/When/Then style
  .given('I am on https://www.google.com')     // Setup
  .when('I type "..." in the search box')       // Action
  .and('I press Enter')                         // Additional action
  .then('I should see search results')          // Assertion
  .and('the results should contain "test"')     // Additional assertion

// 5. Complete the scenario and feature
  .done()      // End scenario
  ._build()    // Build feature

// 6. Register test (CLI handles execution)
test(feature, 'web');  // Register test for web platform
```

**Note:** When using the CLI to run tests, you don't need to call `await run()`—the CLI handles execution automatically. Only include `await run()` if you're running the test file directly with Node.js/tsx.

## Key Concepts

### No Step Implementations Needed

Unlike traditional BDD frameworks, you don't write step definitions. The AI interprets your natural language steps and executes them automatically.

### Write What You Mean

Steps should be clear and specific:

✅ **Good:**
- "I am on https://example.com"
- "I click the 'Submit' button"
- "I should see an error message 'Invalid email'"

❌ **Avoid:**
- "I navigate" (missing URL)
- "I click" (which element?)
- "I should see an error" (what message?)

### Multiple Platforms

You can test web, API, and mobile apps with the same DSL:

```typescript
// Web test
test(feature('Web Login')..., 'web');

// API test
test(feature('Users API')..., 'api');

// Mobile test
test(feature('App Onboarding')..., 'mobile');
```

## Next Steps

Now that you have CopilotTest running, explore more:

- [Your First Test](./your-first-test.md) - Detailed walkthrough
- [Running Tests](./running-tests.md) - CLI options and filtering
- [Best Practices](../guides/best-practices.md) - Write effective tests
- [Web Testing Guide](../guides/web-testing.md) - Deep dive into web testing

## Quick Tips

1. **Start simple**: Begin with basic navigation and assertions
2. **Be specific**: Clear steps help the AI understand your intent
3. **Use headless: false** initially to watch tests execute
4. **Check reports**: Review AI reasoning when tests fail
5. **Use tags**: Organize tests with `@smoke`, `@regression`, etc.

```typescript
feature('Login')
  .tag('@smoke', '@critical')
  .scenario('Admin login')
    .tag('@auth')
    // ... steps
```

**Note:** The CLI currently parses the `--tag` flag but doesn't apply filtering during execution. For tag-based filtering, configure it programmatically or use multiple test files.

## Getting Help

- [Troubleshooting](../troubleshooting/common-errors.md)
- [AI Interpretation Issues](../troubleshooting/ai-interpretation-issues.md)
