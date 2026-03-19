# Built-in Assertion Library

CopilotTest now includes a powerful built-in assertion library for explicit validations! Mix AI-driven BDD steps with type-safe, unambiguous assertions.

## Installation

The assertion library is included in the main package:

```typescript
import { expect } from "copilot-test";
```

## Quick Start

```typescript
import { feature, expect } from "copilot-test";

const apiTest = feature("User API")
  .scenario("Create user")
    .when("I create a new user with email 'test@example.com'")
    .then(async ({ api, context }) => {
      const userId = context.get('userId');
      const user = await api.get(`/users/${userId}`);

      expect(user.status).toBe(201);
      expect(user.data).toHaveProperty('email', 'test@example.com');
      expect(user.data.id).toBeGreaterThan(0);
    })
    .done()
  ._build();
```

## Assertion API

### Value Assertions

```typescript
expect(value).toBe(expected)                    // Strict equality (===)
expect(value).toEqual(expected)                 // Deep equality
expect(value).toBeGreaterThan(n)                // Numeric comparison
expect(value).toBeLessThan(n)                   // Numeric comparison
expect(value).toBeGreaterThanOrEqual(n)         // Numeric comparison
expect(value).toBeLessThanOrEqual(n)            // Numeric comparison
expect(value).toBeTruthy()                      // Truthy check
expect(value).toBeFalsy()                       // Falsy check
expect(value).toBeNull()                        // Null check
expect(value).toBeUndefined()                   // Undefined check
expect(value).toBeDefined()                     // Defined check
expect(value).toBeNaN()                         // NaN check
expect(value).toBeInstanceOf(Class)             // Instance check
```

### Object & Array Assertions

```typescript
expect(obj).toHaveProperty(key, value?)         // Property check
expect(array).toHaveLength(n)                   // Length check
expect(obj).toMatchObject(partial)              // Partial object match
expect(array).toContain(item)                   // Array/string contains
```

### String Assertions

```typescript
expect(str).toMatch(/regex/)                    // Regex match
expect(str).toMatch("substring")                // String match
expect(str).toContain(substring)                // Contains substring
expect(str).toStartWith(prefix)                 // Starts with
expect(str).toEndWith(suffix)                   // Ends with
```

### Async Assertions (Promises)

```typescript
await expect(promise).resolves.toBe(value)      // Promise resolves to value
await expect(promise).resolves.toEqual(expected)
await expect(promise).rejects.toThrow()         // Promise rejects
await expect(promise).rejects.toThrow("error")  // Rejects with message
await expect(promise).rejects.toThrow(/regex/)  // Rejects matching regex
```

### Web-Specific Assertions (Playwright)

#### Locator Assertions

```typescript
await expect(page.locator('h1')).toHaveText('Welcome')
await expect(page.locator('h1')).toContainText('Wel')
await expect(page.locator('input')).toHaveValue('test')
await expect(page.locator('.btn')).toBeVisible()
await expect(page.locator('.hidden')).toBeHidden()
await expect(page.locator('button')).toBeEnabled()
await expect(page.locator('button')).toBeDisabled()
await expect(page.locator('checkbox')).toBeChecked()
await expect(page.locator('div')).toHaveAttribute('data-test', 'value')
await expect(page.locator('div')).toHaveClass('active')
await expect(page.locator('.items')).toHaveCount(5)
```

#### Page Assertions

```typescript
await expect(page).toHaveURL('https://example.com/dashboard')
await expect(page).toHaveURL(/dashboard/)
await expect(page).toHaveTitle('Dashboard - App')
await expect(page).toHaveTitle(/Dashboard/)
```

## Hybrid Approach

Combine natural language steps with explicit assertions:

### Example 1: API Testing

```typescript
feature('User Management')
  .scenario('Create and verify user')
    .given('the API is available')              // AI-driven
    .when('I create a new user')                // AI-driven
    .then(async ({ api, context }) => {
      // Explicit assertions for critical validations
      const user = await api.get(`/users/${context.get('userId')}`);
      expect(user.status).toBe(201);
      expect(user.data).toMatchObject({
        email: expect(user.data.email).toMatch(/@/),
        role: 'user'
      });
    })
```

### Example 2: Web Testing

```typescript
feature('Login')
  .scenario('Admin login')
    .given('I am on the login page')            // AI-driven
    .when('I login as "admin"')                 // AI-driven
    .then('I should see the dashboard')         // AI-driven
    .and(async ({ page }) => {
      // Explicit security check
      await expect(page.locator('[data-user-role]')).toHaveText('Administrator');
      await expect(page).toHaveURL(/\/dashboard/);
    })
```

### Example 3: Complex Validation

```typescript
feature('Data Validation')
  .scenario('Verify API response structure')
    .when('I fetch the user profile')
    .then(async ({ api }) => {
      const response = await api.get('/profile');

      // Multiple explicit assertions
      expect(response.status).toBe(200);
      expect(response.data.permissions).toHaveLength(5);
      expect(response.data.permissions).toContain('read');
      expect(response.data.profile.age).toBeGreaterThan(0);
      expect(response.data.profile.age).toBeLessThan(150);
    })
```

## Benefits

### 🎯 **Unambiguous Validations**
No more relying on AI interpretation. Assertions are clear and explicit.

### 🔒 **Type-Safe**
Full TypeScript support with type inference and autocomplete.

### 🧪 **Familiar API**
Similar to Jest/Vitest matchers - easy to learn if you know those tools.

### 🔄 **Flexible**
Mix AI-driven steps and explicit assertions as needed.

### 📝 **Better Error Messages**
Clear, descriptive error messages when assertions fail.

### ⚡ **No Dependencies**
Built-in with zero additional dependencies.

## When to Use Explicit Assertions

Use explicit assertions for:

- ✅ Critical security checks (user roles, permissions)
- ✅ Complex data structure validations
- ✅ Precise numeric comparisons
- ✅ Regex pattern matching
- ✅ Promise resolution/rejection testing
- ✅ Production test suites requiring certainty

Use AI-driven steps for:

- ✅ Navigation and user interactions
- ✅ Setup and teardown
- ✅ Simple visibility checks
- ✅ Exploratory testing

## Error Handling

All assertions throw `AssertionError` when they fail:

```typescript
import { AssertionError } from "copilot-test";

try {
  expect(42).toBe(43);
} catch (e) {
  if (e instanceof AssertionError) {
    console.log(e.message); // "Expected 42 to be 43"
  }
}
```

## Advanced Examples

### Promise Testing

```typescript
.then(async ({ api }) => {
  // Test successful resolution
  const promise = api.get('/data');
  await expect(promise).resolves.toHaveProperty('status', 200);

  // Test rejection
  const failPromise = api.get('/invalid');
  await expect(failPromise).rejects.toThrow();
  await expect(failPromise).rejects.toThrow(/404/);
})
```

### Nested Object Validation

```typescript
.then(async ({ api }) => {
  const response = await api.get('/user');

  expect(response.data).toMatchObject({
    profile: {
      firstName: expect(response.data.profile.firstName).toBeDefined(),
      age: expect(response.data.profile.age).toBeGreaterThan(0)
    }
  });
})
```

### Array Validations

```typescript
.then(async ({ api }) => {
  const users = await api.get('/users');

  expect(users.data).toHaveLength(10);
  expect(users.data).toContain(
    expect(users.data[0]).toHaveProperty('email')
  );

  users.data.forEach(user => {
    expect(user.email).toMatch(/@/);
  });
})
```

## Migration from Pure AI Approach

### Before (AI-driven only):

```typescript
.then('the user status should be 201')
.and('the response should have an email property')
```

### After (Hybrid with explicit assertions):

```typescript
.then(async ({ api, context }) => {
  const user = await api.get(`/users/${context.get('userId')}`);
  expect(user.status).toBe(201);
  expect(user.data).toHaveProperty('email');
})
```

## See Also

- [Hybrid Example Tests](./tests/hybrid-example.ts) - Complete examples
- [Assertion Tests](./tests/assertions.test.ts) - Full test coverage
- [Main Documentation](../README.md) - Framework overview
