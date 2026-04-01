# Scenario Outline Feature

This document explains how to use Scenario Outlines for parameterized testing in CopilotTest.

## Overview

Scenario Outlines allow you to run the same test scenario with multiple sets of data, reducing duplication and improving maintainability. This follows the standard Gherkin BDD pattern.

## Basic Usage

```markdown
<!-- tests/login.feature.md -->
---
platform: web
---
# Feature: User Login

## Scenario Outline: Login with different credentials
- Given I am on the login page
- When I enter username "<username>" and password "<password>"
- Then I should see "<message>"

### Examples:
| username | password | message |
|----------|----------|---------|
| admin | admin123 | Welcome Admin |
| user | wrong | Invalid credentials |
| | | Please fill all fields |
```

## How It Works

1. **Define placeholders**: Use `<placeholder>` syntax in step text
2. **Provide examples**: Call `.examples([...])` with an array of data objects (required)
3. **Runtime expansion**: Each example becomes a separate scenario execution
4. **Parameter substitution**: Placeholders are replaced with actual values from each example

## Important Notes

- **Examples are required**: A Scenario Outline must have at least one example. If you call `.scenarioOutline()` without `.examples([...])`, an error will be thrown.
- **Safe parameter substitution**: Parameter keys can contain special characters (dots, parentheses, etc.), and values containing `$` symbols are handled correctly.

## Features

### Parameter Substitution

Any text in angle brackets `<name>` in step definitions will be replaced with values from the examples:

```markdown
- When I search for "<query>"
- Then I should see "<count>" results

### Examples:
| query | count |
|-------|-------|
| typescript | 10 |
| python | 8 |
```

### Special Characters Support

Parameter keys and values support special characters:

```markdown
- Given I use "<key.with.dots>" and "<value>"

### Examples:
| key.with.dots | value |
|---------------|-------|
| value1 | $100 price |
```

Both regex metacharacters in keys (`.`, `(`, `)`, `*`, etc.) and replacement patterns in values (`$1`, `$$`, etc.) are handled safely.

### Mixing with Regular Scenarios

You can combine regular scenarios with scenario outlines in the same feature:

```markdown
# Feature: Shopping Cart

## Scenario: Empty cart on start
- Given I am a new user
- Then my cart should be empty

## Scenario Outline: Add items with different quantities
- When I add "<quantity>" items
- Then cart should have "<quantity>" items

### Examples:
| quantity |
|----------|
| 1 |
| 5 |
| 10 |
```

### Using Tags

Scenario outlines support tags just like regular scenarios:

```markdown
## Scenario Outline: Parameterized test
<!-- tags: [smoke, critical] -->
- Given step with "<param>"

### Examples:
| param |
|-------|
| ... |
```

### Chaining Multiple Outlines

You can chain multiple scenario outlines:

```markdown
# Feature: API Testing

## Scenario Outline: Test GET endpoints
- When I request "<endpoint>"

### Examples:
| endpoint |
|----------|
| /users |
| /posts |

## Scenario Outline: Test POST endpoints
- When I POST to "<endpoint>"

### Examples:
| endpoint |
|----------|
| /users |
| /comments |
```

## Test Reports

In test execution and reports, each example appears as a separate scenario:
- "Login with different credentials (Example 1)"
- "Login with different credentials (Example 2)"
- "Login with different credentials (Example 3)"

This makes it easy to identify which specific data set caused a failure.

## Best Practices

1. **Always provide examples**: Call `.examples([...])` with at least one example object
2. **Use descriptive parameter names**: Choose clear names like `<username>` instead of `<val1>`
3. **Keep examples focused**: Each outline should test one specific behavior with different data
4. **Include edge cases**: Add examples for empty strings, special characters, boundary values
5. **Organize examples logically**: Order examples from happy path to error cases

## Complete Example

See `tests/scenario-outline.example.feature.md` for a comprehensive demonstration including:
- Login with multiple user types
- Search with different queries
- Form validation with various inputs
- Mixing regular scenarios with outlines

## API Reference

### Methods

- `.scenarioOutline(name: string)`: Create a new scenario outline
- `.examples(data: Record<string, string>[])`: Provide example data rows (required, must have at least one)
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

> **Markdown equivalent:** In `.feature.md` files, scenario outlines use `## Scenario Outline:` headings with `### Examples:` tables containing the parameter data.

## Error Handling

If you forget to provide examples, a clear error will be thrown:

```markdown
<!-- This will cause a validation error: -->
## Scenario Outline: Outline without examples
- Given some step
<!-- Error: Scenario Outline "Outline without examples" must have at least one example -->
<!-- (Missing ### Examples: table) -->
```

## Migration from Regular Scenarios

Converting duplicate scenarios to outlines:

**Before:**
```markdown
## Scenario: Login as admin
- When I enter username "admin"

## Scenario: Login as user
- When I enter username "user"
```

**After:**
```markdown
## Scenario Outline: Login as different users
- When I enter username "<username>"

### Examples:
| username |
|----------|
| admin |
| user |
```
