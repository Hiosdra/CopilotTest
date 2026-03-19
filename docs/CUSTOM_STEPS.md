# Custom Step Definitions

Custom step definitions allow you to define exact implementations for critical business steps while still leveraging AI for other steps. This hybrid approach combines the deterministic behavior of traditional BDD frameworks with the flexibility of AI-driven testing.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Use Cases](#use-cases)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Overview

By default, CopilotTest uses AI to interpret and execute test steps. Custom step definitions allow you to:

- **Define exact implementations** for critical business steps
- **Create reusable step libraries** for common patterns
- **Ensure deterministic behavior** for certain steps
- **Mix AI-driven and traditional step definitions** in the same test

### How It Works

1. Register custom step definitions using `defineStep()`
2. When a step matches a custom definition's pattern, it executes the custom handler
3. If no custom definition matches, the step falls back to AI execution
4. Custom definitions can be enabled/disabled via configuration

## Quick Start

```typescript
import { feature, configure, test, run, defineStep, webPlatform } from '@copilot-test/core';

// Define a custom step
defineStep(/^I login as "(.+)" with password "(.+)"$/, async (context, username, password) => {
  const { session } = context;
  // Implement your exact login logic here using the session
  // The session provides access to the Copilot SDK session with MCP tools
  // For example, you might use Playwright MCP tools through the session:
  // await session.sendAndWait({ prompt: `Navigate to /login and fill username ${username}` });

  // Note: Direct page access is not available in the context.
  // You need to interact through the session or implement your own page management.
});

// Configure tests
configure({
  model: "gpt-4o",
  platforms: { web: webPlatform() },
  useCustomStepDefinitions: true, // Default: true
});

// Use in scenario
const loginFeature = feature('Login')
  .scenario('Admin login')
    .given('I login as "admin" with password "admin123"') // Uses custom definition
    .when('I click on the profile menu')                   // Uses AI
    .then('I should see my username')                       // Uses AI
  .done();

test(loginFeature, 'web');
await run();
```

## API Reference

### `defineStep(pattern, handler)`

Registers a custom step definition.

**Parameters:**
- `pattern: RegExp` - Regular expression to match step text (without the keyword)
- `handler: (context, ...matches) => Promise<void> | void` - Function to execute when pattern matches

**Example:**
```typescript
defineStep(/^I login as "(.+)" with password "(.+)"$/, async (context, username, password) => {
  // username and password are captured from the pattern
  // context contains: step, session, feature, scenario, platform
});
```

### `StepContext` Interface

Context object passed to custom step handlers:

```typescript
interface StepContext {
  step: Step;              // Current step object
  session?: unknown;       // Copilot SDK session
  feature?: Feature;       // Current feature
  scenario?: Scenario;     // Current scenario
  platform?: PlatformConfig; // Platform configuration
}
```

### `clearStepDefinitions()`

Clears all registered step definitions. Useful for testing or resetting between test runs.

```typescript
clearStepDefinitions();
```

### `getStepDefinitions()`

Returns all registered step definitions. Useful for debugging or introspection.

```typescript
const definitions = getStepDefinitions();
console.log(`Registered ${definitions.length} custom steps`);
```

### Configuration Option

Control custom step definitions via configuration:

```typescript
configure({
  // ... other config
  useCustomStepDefinitions: true,  // Enable custom steps (default: true)
  // Set to false to disable custom steps and use only AI
});
```

## Use Cases

### 1. Critical Business Logic

Define exact implementations for authentication, payment processing, or other critical flows:

```typescript
defineStep(/^I complete the checkout process$/, async (context) => {
  // Exact implementation ensures no surprises in production-critical flow
  await submitOrder();
  await confirmPayment();
  await verifyReceipt();
});
```

### 2. Reusable Step Libraries

Create a library of common steps that can be reused across multiple features:

```typescript
// auth-steps.ts
export function registerAuthSteps() {
  defineStep(/^I login as "(.+)"$/, async (context, username) => {
    // Shared login implementation
  });

  defineStep(/^I logout$/, async (context) => {
    // Shared logout implementation
  });
}

// test.spec.ts
import { registerAuthSteps } from './auth-steps';
registerAuthSteps();
```

### 3. Test Data Management

Handle test data setup and cleanup with custom steps:

```typescript
defineStep(/^the database contains (\d+) users$/, async (context, count) => {
  const numUsers = parseInt(count, 10);
  await testDataService.seedUsers(numUsers);
});

defineStep(/^the database is clean$/, async (context) => {
  await testDataService.cleanup();
});
```

### 4. External System Integration

Integrate with external systems that AI can't access:

```typescript
defineStep(/^I receive an email with subject "(.+)"$/, async (context, subject) => {
  // Check email service API that AI doesn't have access to
  const email = await emailService.getLatestEmail();
  if (email.subject !== subject) {
    throw new Error(`Expected email subject "${subject}", got "${email.subject}"`);
  }
});
```

### 5. Performance-Critical Steps

Execute steps that need to be fast and don't require AI reasoning:

```typescript
defineStep(/^I generate (\d+) test records$/, async (context, count) => {
  // Fast bulk operation without AI overhead
  await bulkInsert(parseInt(count, 10));
});
```

## Best Practices

### Pattern Design

✅ **Good patterns:**
```typescript
// Specific and unambiguous
defineStep(/^I login as "(.+)" with password "(.+)"$/, ...);
defineStep(/^I click the "(.+)" button$/, ...);
defineStep(/^the response status code should be (\d+)$/, ...);
```

❌ **Avoid vague patterns:**
```typescript
// Too broad - might match unintended steps
defineStep(/^I (.+)$/, ...);
defineStep(/^the (.+)$/, ...);
```

### Error Handling

Always throw meaningful errors in custom steps:

```typescript
defineStep(/^I login as "(.+)"$/, async (context, username) => {
  const user = await findUser(username);

  if (!user) {
    throw new Error(`User "${username}" not found in test database`);
  }

  await loginAs(user);
});
```

### Context Usage

Access context properties safely:

```typescript
defineStep(/^I check the current feature$/, async (context) => {
  if (!context.feature) {
    throw new Error('Feature context not available');
  }

  console.log(`Running in feature: ${context.feature.name}`);
});
```

### Data Tables

Handle data tables in custom steps:

```typescript
defineStep(/^I create the following users$/, async (context) => {
  const { step } = context;

  if (!step.table) {
    throw new Error('Expected data table');
  }

  const [headers, ...rows] = step.table;
  for (const row of rows) {
    const user = Object.fromEntries(
      headers.map((h, i) => [h, row[i]])
    );
    await createUser(user);
  }
});
```

### Doc Strings

Access doc strings for complex data:

```typescript
defineStep(/^I send the following JSON payload$/, async (context) => {
  const { step } = context;

  if (!step.docString) {
    throw new Error('Expected doc string with JSON payload');
  }

  const payload = JSON.parse(step.docString);
  await apiClient.post('/endpoint', payload);
});
```

### Combining with AI

Use custom definitions strategically:

```typescript
// Custom step for critical setup
defineStep(/^I have a valid session token$/, async (context) => {
  const token = await authService.generateToken();
  context.session.setToken(token);
});

// Feature that mixes custom and AI steps
feature('API Testing')
  .scenario('Create resource')
    .given('I have a valid session token')    // Custom (deterministic)
    .when('I create a new user')              // AI (flexible)
    .then('the user should be persisted')     // AI (flexible)
    .and('I should receive a success response') // AI (flexible)
  .done();
```

## Examples

### Complete Example: E-commerce Testing

```typescript
import { feature, configure, test, run, defineStep, webPlatform } from '@copilot-test/core';

// Setup
configure({
  model: "gpt-4o",
  platforms: { web: webPlatform({ baseUrl: "https://shop.example.com" }) },
});

// Custom steps for critical flows
defineStep(/^I login as "(.+)" with password "(.+)"$/, async (ctx, username, password) => {
  // Exact login implementation
  await page.goto('/login');
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('.user-menu');
});

defineStep(/^my cart contains (\d+) items$/, async (ctx, count) => {
  // Programmatic cart setup for faster tests
  const numItems = parseInt(count, 10);
  await cartService.addItems(numItems);
});

defineStep(/^I complete the checkout with card ending in "(.+)"$/, async (ctx, lastFour) => {
  // Critical payment flow with exact implementation
  await page.click('#checkout-button');
  await page.fill('#card-number', `4242 4242 4242 ${lastFour}`);
  await page.fill('#expiry', '12/25');
  await page.fill('#cvc', '123');
  await page.click('#submit-payment');
  await page.waitForSelector('.order-confirmation');
});

// Test feature
const checkoutFeature = feature('Checkout Process')
  .tag('@critical')

  .scenario('Successful purchase')
    .given('I login as "testuser" with password "test123"')  // Custom
    .and('my cart contains 3 items')                          // Custom
    .when('I complete the checkout with card ending in "4242"') // Custom
    .then('I should see the order confirmation page')         // AI
    .and('I should receive an order confirmation email')      // AI

  .scenario('Checkout with discount code')
    .given('I login as "testuser" with password "test123"')  // Custom
    .and('my cart contains 2 items')                          // Custom
    .when('I apply the discount code "SAVE20"')              // AI
    .and('I complete the checkout with card ending in "1234"') // Custom
    .then('I should see a 20% discount applied')              // AI
    .and('I should see the discounted total on the confirmation page') // AI

  .done();

test(checkoutFeature, 'web');
await run();
```

### Example: API Testing with Custom Steps

```typescript
import { feature, configure, test, run, defineStep, apiPlatform } from '@copilot-test/core';

configure({
  model: "gpt-4o",
  platforms: { api: apiPlatform({ baseUrl: "https://api.example.com" }) },
});

// Custom step for authentication
defineStep(/^I authenticate as "(.+)"$/, async (ctx, role) => {
  const token = await authService.getTokenForRole(role);
  ctx.session.setHeader('Authorization', `Bearer ${token}`);
});

// Custom step for database state
defineStep(/^the database contains (\d+) users$/, async (ctx, count) => {
  await testDb.seedUsers(parseInt(count, 10));
});

const apiFeature = feature('User API')
  .scenario('List users')
    .given('I authenticate as "admin"')         // Custom
    .and('the database contains 10 users')      // Custom
    .when('I send a GET request to /users')     // AI
    .then('the response status should be 200')  // AI
    .and('the response should contain 10 users') // AI
  .done();

test(apiFeature, 'api');
await run();
```

## Migration from Traditional BDD Frameworks

If you're migrating from Cucumber, Playwright/Test, or similar frameworks:

1. **Copy your existing step definitions** and adapt them to the CopilotTest API
2. **Remove custom steps gradually** as you gain confidence in AI execution
3. **Keep custom steps for critical paths** where deterministic behavior is essential
4. **Let AI handle the rest** for faster test development

```typescript
// Before (Cucumber style)
Given('I login as {string} with password {string}', async (username, password) => {
  // implementation
});

// After (CopilotTest)
defineStep(/^I login as "(.+)" with password "(.+)"$/, async (context, username, password) => {
  // same implementation
});
```

## Troubleshooting

### Custom step not executing

Check that:
1. `useCustomStepDefinitions` is not set to `false` in config
2. Your regex pattern matches the step text exactly
3. The step is registered before `run()` is called

### Context properties undefined

Some context properties are only available during scenario execution:
- `feature`, `scenario`, `platform` are set during `runScenario()`
- `session` is available after session creation

### Pattern conflicts

If multiple patterns match a step, the first registered definition wins. Be specific with your patterns to avoid conflicts.

## See Also

- [Main README](../README.md) - Framework overview
- [Examples](../tests/custom-steps-example.spec.ts) - Complete working example
- [API Documentation](../src/types.ts) - Type definitions
