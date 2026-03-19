# Scenario Outline Feature

This document explains how to use Scenario Outlines for parameterized testing in CopilotTest.

## Overview

Scenario Outlines allow you to run the same test scenario with multiple sets of data, reducing duplication and improving maintainability. This follows the standard Gherkin BDD pattern.

## Basic Usage

```typescript
import { feature, test, configure, run } from "copilot-test";
import { webPlatform } from "copilot-test";

configure({
  platforms: { web: webPlatform() }
});

test(
  feature("User Login")
    .scenarioOutline("Login with different credentials")
      .given("I am on the login page")
      .when('I enter username "<username>" and password "<password>"')
      .then('I should see "<message>"')
      .examples([
        { username: "admin", password: "admin123", message: "Welcome Admin" },
        { username: "user", password: "wrong", message: "Invalid credentials" },
        { username: "", password: "", message: "Please fill all fields" }
      ])
      .done()
    ._build(),
  "web"
);

run();
```

## How It Works

1. **Define placeholders**: Use `<placeholder>` syntax in step text
2. **Provide examples**: Call `.examples([...])` with an array of data objects
3. **Runtime expansion**: Each example becomes a separate scenario execution
4. **Parameter substitution**: Placeholders are replaced with actual values from each example

## Features

### Parameter Substitution

Any text in angle brackets `<name>` in step definitions will be replaced with values from the examples:

```typescript
.when('I search for "<query>"')
.then('I should see "<count>" results')
.examples([
  { query: "typescript", count: "10" },
  { query: "python", count: "8" }
])
```

### Mixing with Regular Scenarios

You can combine regular scenarios with scenario outlines in the same feature:

```typescript
feature("Shopping Cart")
  .scenario("Empty cart on start")
    .given("I am a new user")
    .then("my cart should be empty")
    .done()
  .scenarioOutline("Add items with different quantities")
    .when('I add "<quantity>" items')
    .then('cart should have "<quantity>" items')
    .examples([
      { quantity: "1" },
      { quantity: "5" },
      { quantity: "10" }
    ])
    .done()
  ._build()
```

### Using Tags

Scenario outlines support tags just like regular scenarios:

```typescript
.scenarioOutline("Parameterized test")
  .tag("@smoke", "@critical")
  .given('step with "<param>"')
  // ...
```

### Chaining Multiple Outlines

You can chain multiple scenario outlines:

```typescript
feature("API Testing")
  .scenarioOutline("Test GET endpoints")
    .when('I request "<endpoint>"')
    .examples([{ endpoint: "/users" }, { endpoint: "/posts" }])
  .scenarioOutline("Test POST endpoints")
    .when('I POST to "<endpoint>"')
    .examples([{ endpoint: "/users" }, { endpoint: "/comments" }])
    .done()
```

## Test Reports

In test execution and reports, each example appears as a separate scenario:
- "Login with different credentials (Example 1)"
- "Login with different credentials (Example 2)"
- "Login with different credentials (Example 3)"

This makes it easy to identify which specific data set caused a failure.

## Best Practices

1. **Use descriptive parameter names**: Choose clear names like `<username>` instead of `<val1>`
2. **Keep examples focused**: Each outline should test one specific behavior with different data
3. **Include edge cases**: Add examples for empty strings, special characters, boundary values
4. **Organize examples logically**: Order examples from happy path to error cases

## Complete Example

See `tests/scenario-outline.example.ts` for a comprehensive demonstration including:
- Login with multiple user types
- Search with different queries
- Form validation with various inputs
- Mixing regular scenarios with outlines

## API Reference

### Methods

- `.scenarioOutline(name: string)`: Create a new scenario outline
- `.examples(data: Record<string, string>[])`: Provide example data rows
- `.done()`: Complete the outline and return to FeatureBuilder

### Types

```typescript
interface Scenario {
  name: string;
  tags: string[];
  steps: Step[];
  examples?: Record<string, string>[];
  isOutline?: boolean;
}
```

## Migration from Regular Scenarios

Converting duplicate scenarios to outlines:

**Before:**
```typescript
.scenario("Login as admin")
  .when('I enter username "admin"')
  .done()
.scenario("Login as user")
  .when('I enter username "user"')
  .done()
```

**After:**
```typescript
.scenarioOutline("Login as different users")
  .when('I enter username "<username>"')
  .examples([
    { username: "admin" },
    { username: "user" }
  ])
  .done()
```
