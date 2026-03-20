# Your First Test

This guide walks you through creating your first CopilotTest from scratch, explaining each concept along the way.

## What We'll Build

We'll create a complete login test that:
1. Navigates to a login page
2. Enters credentials
3. Submits the form
4. Verifies successful authentication

## Prerequisites

- CopilotTest installed ([Installation Guide](./installation.md))
- GitHub token configured
- Basic understanding of BDD (Given/When/Then)

## Step 1: Create the Test File

Create a new file `tests/login.spec.ts`:

```bash
mkdir -p tests
touch tests/login.spec.ts
```

## Step 2: Import CopilotTest

Add the necessary imports:

```typescript
import { configure, feature, test, run } from 'copilot-test';
import { webPlatform } from 'copilot-test';
```

**What these do:**
- `configure`: Set up test configuration
- `feature`: Create a feature (high-level functionality)
- `test`: Register a test for execution
- `run`: Execute all registered tests
- `webPlatform`: Web testing configuration

## Step 3: Configure CopilotTest

Add configuration at the top of your file:

```typescript
configure({
  model: 'gpt-4o',                   // AI model to use
  platforms: {
    web: webPlatform({
      browser: 'chromium',            // Browser choice
      headless: false,                // Show browser window
      baseUrl: 'https://demo.example.com'  // Base URL for relative paths
    })
  },
  stepTimeout: 30000,                 // 30 seconds per step
  screenshotOnFailure: true,          // Capture screenshots on failure
  outputDir: 'test-results'           // Report output directory
});
```

## Step 4: Define the Feature

Create a feature representing the login functionality:

```typescript
const loginFeature = feature('User Authentication')
  .tag('@critical', '@smoke')
  .description('Tests for user login functionality')
```

**Feature elements:**
- `feature('name')`: Creates a new feature
- `.tag(...)`: Add tags for filtering (e.g., `@smoke`, `@regression`)
- `.description(...)`: Describe the feature (optional)

## Step 5: Add Your First Scenario

Add a scenario for successful login:

```typescript
const loginFeature = feature('User Authentication')
  .tag('@critical', '@smoke')
  .description('Tests for user login functionality')

  .scenario('Successful admin login')
    .tag('@auth')
    .given('I am on the login page')
    .when('I enter username "admin@example.com"')
    .and('I enter password "SecurePassword123"')
    .and('I click the "Login" button')
    .then('I should see the dashboard')
    .and('I should see a welcome message "Welcome, Admin"')
    .done()

  ._build();
```

**Scenario structure:**
- `.scenario('name')`: Start a new scenario
- `.given(...)`: Setup/precondition steps
- `.when(...)`: Action steps
- `.then(...)`: Assertion/verification steps
- `.and(...)`: Additional steps of any type
- `.done()`: Complete the scenario
- `._build()`: Build the complete feature

## Step 6: Register the Test

Tell CopilotTest about this feature:

```typescript
test(loginFeature, 'web');
```

**Note:** When using the CLI (`copilot-test run`), you don't need to call `await run()` in your test file—the CLI handles execution. If you want to run the test file directly with Node.js/tsx, you would add `await run()` at the end.

## Complete Test File

Here's the complete `tests/login.spec.ts`:

```typescript
import { configure, feature, test } from 'copilot-test';
import { webPlatform } from 'copilot-test';

configure({
  model: 'gpt-4o',
  platforms: {
    web: webPlatform({
      browser: 'chromium',
      headless: false,
      baseUrl: 'https://demo.example.com'
    })
  },
  stepTimeout: 30000,
  screenshotOnFailure: true,
  outputDir: 'test-results'
});

const loginFeature = feature('User Authentication')
  .tag('@critical', '@smoke')
  .description('Tests for user login functionality')

  .scenario('Successful admin login')
    .tag('@auth')
    .given('I am on the login page')
    .when('I enter username "admin@example.com"')
    .and('I enter password "SecurePassword123"')
    .and('I click the "Login" button')
    .then('I should see the dashboard')
    .and('I should see a welcome message "Welcome, Admin"')
    .done()

  ._build();

test(loginFeature, 'web');
```

**Note:** This file doesn't include `await run()` because it's designed to be executed via the CLI. The CLI imports the file and calls `run()` itself.

## Step 7: Run Your Test

Execute the test:

```bash
npx copilot-test run tests/login.spec.ts
```

Expected output:

```
🧪 CopilotTest - Test Execution
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature: User Authentication [@critical, @smoke]
  Scenario: Successful admin login [@auth]
    ✓ Given I am on the login page (1.8s)
    ✓ When I enter username "admin@example.com" (0.5s)
    ✓ And I enter password "SecurePassword123" (0.4s)
    ✓ And I click the "Login" button (1.2s)
    ✓ Then I should see the dashboard (0.6s)
    ✓ And I should see a welcome message "Welcome, Admin" (0.3s)

✨ Results: 1 feature, 1 scenario, 6 steps
   ✓ Passed: 1 scenario (6 steps)
   Duration: 4.8s

📊 Report: test-results/report.html
```

## Step 8: Add More Scenarios

Expand your test by adding negative test cases:

```typescript
const loginFeature = feature('User Authentication')
  .tag('@critical', '@smoke')

  .scenario('Successful admin login')
    .tag('@auth')
    .given('I am on the login page')
    .when('I enter username "admin@example.com"')
    .and('I enter password "SecurePassword123"')
    .and('I click the "Login" button')
    .then('I should see the dashboard')
    .done()

  .scenario('Login with invalid credentials')
    .tag('@auth', '@negative')
    .given('I am on the login page')
    .when('I enter username "admin@example.com"')
    .and('I enter password "WrongPassword"')
    .and('I click the "Login" button')
    .then('I should see an error message "Invalid credentials"')
    .and('I should remain on the login page')
    .done()

  .scenario('Login with empty fields')
    .tag('@auth', '@validation')
    .given('I am on the login page')
    .when('I click the "Login" button')
    .then('I should see an error message "Username is required"')
    .done()

  ._build();
```

## Understanding What Happens

When you run the test:

1. **CopilotTest starts** with your configuration
2. **For each scenario:**
   - Creates a GitHub Copilot SDK session
   - Connects to the Playwright MCP server
3. **For each step:**
   - Sends the step text to the AI
   - AI interprets the intent
   - AI uses MCP tools (browser automation) to execute
   - Captures the result
4. **After execution:**
   - Generates HTML and JSON reports
   - Saves screenshots (if failures occurred)
   - Displays summary

## Key Concepts Explained

### Given/When/Then

- **Given**: Setup the initial state
  - Navigate to pages
  - Set up test data
  - Configure application state

- **When**: Perform actions
  - Click buttons
  - Fill forms
  - Make API calls

- **Then**: Verify outcomes
  - Check text content
  - Verify URLs
  - Validate data

### Step Clarity

Write steps as if instructing a person:

✅ **Clear and specific:**
```typescript
.given('I am on https://example.com/login')
.when('I enter "john@example.com" in the email field')
.and('I enter "password123" in the password field')
.and('I click the "Sign In" button')
.then('I should be redirected to https://example.com/dashboard')
```

❌ **Vague and unclear:**
```typescript
.given('I navigate')
.when('I login')
.then('it works')
```

### Tags for Organization

Use tags to organize and filter tests:

```typescript
.tag('@smoke')      // Quick smoke tests
.tag('@regression') // Full regression suite
.tag('@critical')   // Critical path tests
.tag('@slow')       // Slow-running tests
.tag('@api')        // API tests
.tag('@ui')         // UI tests
```

Run specific tags:

```bash
npx copilot-test run --tag=@smoke
npx copilot-test run --tag=@critical
```

## Next Steps

Now that you've created your first test:

1. [Running Tests](./running-tests.md) - Learn CLI options
2. [Best Practices](../guides/best-practices.md) - Write better tests
3. [Web Testing Guide](../guides/web-testing.md) - Advanced web testing
4. [Debugging](../guides/debugging.md) - Debug failing tests

## Common Patterns

### Testing Forms

```typescript
.scenario('Submit contact form')
  .given('I am on the contact page')
  .when('I enter "John Doe" in the name field')
  .and('I enter "john@example.com" in the email field')
  .and('I enter "Hello!" in the message field')
  .and('I click the "Send" button')
  .then('I should see "Message sent successfully"')
```

### Testing Navigation

```typescript
.scenario('Navigate to product page')
  .given('I am on the home page')
  .when('I click the "Products" link')
  .and('I click on "Product ABC"')
  .then('I should see "Product ABC" in the heading')
  .and('I should see the price "$99.99"')
```

### Testing Authentication

```typescript
.scenario('Logout')
  .given('I am logged in as "admin@example.com"')
  .when('I click the user menu')
  .and('I click "Logout"')
  .then('I should be redirected to the login page')
  .and('I should see "You have been logged out"')
```

## Troubleshooting

### Test Times Out

If steps timeout, increase the timeout:

```typescript
configure({
  stepTimeout: 60000  // 60 seconds
});
```

### AI Misunderstands Step

Rephrase the step to be more specific:

```typescript
// Instead of:
.when('I submit the form')

// Use:
.when('I click the "Submit" button')
```

### Browser Not Found

Ensure Playwright browsers are installed:

```bash
npx playwright install chromium
```

## Practice Exercise

Try creating a test for an e-commerce checkout flow:

1. Add products to cart
2. Proceed to checkout
3. Enter shipping information
4. Select payment method
5. Place order
6. Verify order confirmation

Use the patterns you learned in this guide!
