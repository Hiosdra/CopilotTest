# Cross-Step State Management

This document explains how to use the cross-step state management feature in CopilotTest to share data between steps within a scenario.

## Overview

The `ScenarioContext` class provides a shared state object that persists across all steps within a single scenario. This allows you to:

- Store values from API responses (user IDs, tokens, etc.)
- Pass data between steps
- Reference previous step results
- Build complex multi-step workflows

## How It Works

### 1. AI-Driven Context Management

When using the AI-driven testing mode, the AI agent automatically manages context:

```typescript
feature('User Management')
  .scenario('Create and verify user')
    .given('I create a new user with name "Alice"')
    // AI stores the user ID in context automatically
    .when('I fetch the user with ID from the previous step')
    // AI reads the user ID from context
    .then('The user details should match');
```

The AI agent:
- Extracts relevant values from API responses
- Stores them in the context using the `context` field in its JSON response
- Reads context values when executing subsequent steps
- References context data in its reasoning

### 2. Response Format with Context

When the AI completes a step, it can include context updates in its response:

```json
{
  "status": "passed",
  "reasoning": "Created user successfully",
  "context": {
    "userId": "12345",
    "username": "alice"
  }
}
```

These context values are automatically available to all following steps in the scenario.

### 3. Context in Step Prompts

Each step receives the current context state in its prompt:

````
Execute this BDD step: When I fetch the user

## Current Context
The following data is available from previous steps:
```json
{
  "userId": "12345",
  "username": "alice"
}
```

Respond with JSON only: {"status": "passed"|"failed", "reasoning": "<what you did>", "error": "<error if failed>", "context": {"key": "value"}}
````

## API Reference

### ScenarioContext Class

```typescript
import { ScenarioContext } from 'copilot-test';

const context = new ScenarioContext();
```

#### Methods

##### `set(key: string, value: unknown): void`
Store a value in the context.

```typescript
context.set('userId', '12345');
context.set('authToken', 'abc-xyz');
context.set('isActive', true);
```

##### `get<T>(key: string): T | undefined`
Retrieve a value from the context.

```typescript
const userId = context.get<string>('userId');
const isActive = context.get<boolean>('isActive');
```

##### `has(key: string): boolean`
Check if a key exists in the context.

```typescript
if (context.has('userId')) {
  // Do something
}
```

##### `delete(key: string): boolean`
Remove a key from the context. Returns `true` if the key existed.

```typescript
context.delete('tempData');
```

##### `clear(): void`
Remove all data from the context.

```typescript
context.clear();
```

##### `keys(): string[]`
Get all keys in the context.

```typescript
const keys = context.keys(); // ['userId', 'authToken']
```

##### `toJSON(): Record<string, unknown>`
Convert the context to a plain JavaScript object.

```typescript
const obj = context.toJSON();
// { userId: '12345', authToken: 'abc-xyz' }
```

##### `fromJSON(json: Record<string, unknown>): void`
Load data from a plain JavaScript object.

```typescript
context.fromJSON({
  userId: '12345',
  authToken: 'abc-xyz'
});
```

## Examples

### Example 1: User Creation and Verification

```typescript
const userFlow = feature('User Management')
  .scenario('Create and verify user')
    .given('I have a JSON API at https://api.example.com')
    .when('I create a user with name "Alice" and email "alice@example.com"')
    // AI stores: {"userId": "123"}
    .then('I should receive a 201 status')
    .when('I fetch the user using the ID from context')
    // AI uses context.userId in the request
    .then('the user name should be "Alice"')
    .and('the email should be "alice@example.com"')
    .done();
```

### Example 2: Authentication Flow

```typescript
const authFlow = feature('Authentication')
  .scenario('Login and make authenticated request')
    .given('I have an auth API')
    .when('I login with username "test" and password "pass"')
    // AI stores: {"authToken": "jwt-token-here"}
    .then('I receive an authentication token')
    .when('I make a GET request to /profile with the auth token')
    // AI uses context.authToken in Authorization header
    .then('I should see my profile data')
    .done();
```

### Example 3: Shopping Cart Workflow

```typescript
const cartFlow = feature('Shopping Cart')
  .scenario('Add items and checkout')
    .given('I have an e-commerce API')
    .when('I create a new shopping cart')
    // AI stores: {"cartId": "cart-abc"}
    .then('I receive a cart ID')
    .when('I add product "prod-1" to the cart')
    // AI uses context.cartId
    .then('the item is added successfully')
    .when('I add product "prod-2" to the cart')
    .then('the cart should contain 2 items')
    .when('I checkout with the cart')
    // AI uses context.cartId, stores: {"orderId": "order-xyz"}
    .then('I receive an order confirmation')
    .done();
```

### Example 4: Multi-Step API Testing

```typescript
const apiTest = feature('Complex API Flow')
  .scenario('Create, update, and delete resource')
    .given('I have a REST API')
    .when('I POST a new resource with data {"name": "Test"}')
    // AI stores: {"resourceId": "res-123"}
    .then('the response status should be 201')
    .when('I GET the resource using the ID from context')
    // AI uses context.resourceId
    .then('the response should include the name "Test"')
    .when('I PUT an update to the resource with {"name": "Updated"}')
    // AI uses context.resourceId
    .then('the update should succeed')
    .when('I GET the resource again')
    .then('the name should be "Updated"')
    .when('I DELETE the resource')
    // AI uses context.resourceId
    .then('the resource should be deleted successfully')
    .done();
```

## Best Practices

1. **Descriptive Variable Names**: Use clear, descriptive keys like `userId`, `authToken`, `orderId` rather than generic names like `id`, `token`.

2. **Clean Context Between Scenarios**: Context is automatically cleared between scenarios. Each scenario starts with a fresh context.

3. **Let AI Decide What to Store**: The AI agent will intelligently determine what values should be stored in context based on the step descriptions.

4. **Be Explicit in Step Descriptions**: When you want to use a value from context, mention it explicitly:
   - ✅ "I fetch the user with ID from context"
   - ✅ "I make an authenticated request using the token from previous step"
   - ❌ "I fetch the user" (ambiguous which user)

5. **Verify Context Values**: Include verification steps to ensure context values are correct:
   ```typescript
   .then('the user ID should be stored in context')
   .and('the user ID should be a valid UUID')
   ```

## Implementation Details

### Context Flow

1. **Scenario Start**: New `ScenarioContext` instance is created
2. **Step Execution**: Context is passed to each step
3. **AI Response**: AI can include `context` field with updates
4. **Context Merge**: Updates are merged into the scenario context
5. **Next Step**: Updated context is available to the next step
6. **Scenario End**: Context is cleared for the next scenario

### Context in System Prompt

The AI agent receives instructions about context management:

```
## Context Management
You have access to a shared context object that persists across steps within a scenario.
- Use the "context" field in your response to store values for later steps.
- The context from previous steps will be provided to you in each step prompt.
- Common use cases: storing IDs, tokens, user data, or any values needed in subsequent steps.
- Example: {"status": "passed", "reasoning": "User created", "context": {"userId": "12345"}}
```

## Limitations

1. **Scenario Scope**: Context is scoped to a single scenario. It does not persist across scenarios or features.

2. **JSON Serialization**: Only JSON-serializable values can be stored in context (strings, numbers, booleans, objects, arrays). Functions and class instances cannot be stored.

3. **No Type Safety in AI Mode**: When the AI manages context, there's no compile-time type checking. The AI determines what to store and retrieve.

## Future Enhancements

Potential improvements planned for future versions:

- Global context across scenarios within a feature
- Context persistence to files for cross-feature sharing
- Context validation and schema enforcement
- Context cleanup hooks
- Manual context manipulation in custom step definitions
