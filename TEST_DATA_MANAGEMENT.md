# Test Data Management Features

This document describes the test data management features added to CopilotTest.

## Overview

The framework now includes comprehensive test data management capabilities:
- **Fixtures** - Static, reusable test data
- **Factories** - Dynamic data generation with Faker.js integration
- **Lifecycle Hooks** - beforeAll, afterAll, beforeEach, afterEach
- **Database Seeding** - Utilities for seeding test databases
- **API Mocking** - Mock HTTP responses for testing
- **Shared Context** - Data sharing across hooks and scenarios

## 1. Fixtures

Define and reuse static test data across your tests.

```typescript
import { defineFixture, getFixture } from 'copilot-test';

// Define fixtures
const users = defineFixture('users', {
  admin: {
    username: 'admin@example.com',
    password: 'Admin123!',
    role: 'administrator',
  },
  regularUser: {
    username: 'user@example.com',
    password: 'User123!',
    role: 'user',
  },
});

// Use in tests
feature('Login')
  .scenario('Admin login')
    .given('I am on the login page')
    .when(`I login with username "${users.admin.username}"`)
    .then('I should see the admin dashboard');
```

**API:**
- `defineFixture(name, data)` - Define and register a fixture
- `getFixture(name)` - Retrieve a fixture by name
- `loadFixtures(fixtures)` - Load multiple fixtures at once
- `clearFixtures()` - Clear all registered fixtures
- `listFixtures()` - List all fixture names

## 2. Factories

Generate dynamic test data with Faker.js integration.

```typescript
import { defineFactory, faker } from 'copilot-test';

const userFactory = defineFactory({
  username: ({ sequence }) => `user${sequence}@example.com`,
  password: 'Test123!',
  firstName: ({ faker }) => faker.person.firstName(),
  lastName: ({ faker }) => faker.person.lastName(),
  email: ({ faker }) => faker.internet.email(),
  createdAt: () => new Date().toISOString(),
});

// Use in tests or setup
const user1 = userFactory.build();
const user2 = userFactory.build({ username: 'custom@example.com' });
const users = userFactory.buildList(5); // Create 5 users
```

**Factory Context:**
- `sequence` - Auto-incrementing number for unique values
- `faker` - Full Faker.js API for realistic data
- `data` - Access to other built fields

**API:**
- `factory.build(overrides?)` - Build a single instance
- `factory.buildList(count, overrides?)` - Build multiple instances
- `factory.resetSequence()` - Reset sequence to 0
- `factory.setSequence(value)` - Set sequence to a specific value

## 3. Lifecycle Hooks

Execute code at specific points in the test lifecycle.

```typescript
import { feature } from 'copilot-test';

const testFeature = feature('User Management')
  .beforeAll(async ({ context }) => {
    // Runs once before all scenarios
    await seed('users', [{ id: 1, username: 'admin' }]);
    context.set('testStartTime', Date.now());
  })
  .afterAll(async ({ context }) => {
    // Runs once after all scenarios
    await cleanup();
  })
  .beforeEach(async ({ context, scenario }) => {
    // Runs before each scenario
    const testUser = userFactory.build();
    context.set('testUser', testUser);
  })
  .afterEach(async ({ context, scenario }) => {
    // Runs after each scenario
    const userId = context.get('userId');
    if (userId) {
      await deleteUser(userId);
    }
  })
  .scenario('Create user')
    .when('I create a new user')
    .then('the user should be created');
```

**Hook Context:**
- `context` - ScenarioContext for storing/retrieving data
- `feature` - The current feature being executed
- `scenario` - The current scenario (not available in beforeAll/afterAll)

## 4. Database Seeding

Seed databases with test data using custom handlers.

```typescript
import { seed, registerSeedHandler, registerDefaultSeedHandler } from 'copilot-test';

// Register a handler for a specific collection
registerSeedHandler('users', async (collection, data) => {
  await db.collection(collection).insertMany(data);
});

// Register a default handler for all collections
registerDefaultSeedHandler(async (collection, data) => {
  await db.collection(collection).insertMany(Array.isArray(data) ? data : [data]);
});

// Use in tests or hooks
feature('User Management')
  .beforeAll(async () => {
    await seed('users', [
      { id: 1, username: 'admin', role: 'admin' },
      { id: 2, username: 'user', role: 'user' },
    ]);
  });
```

**API:**
- `seed(collection, data)` - Seed a collection with data
- `registerSeedHandler(collection, handler)` - Register handler for specific collection
- `registerDefaultSeedHandler(handler)` - Register default handler
- `clearSeedHandlers()` - Clear all handlers

## 5. API Mocking

Mock HTTP responses for testing without hitting real APIs.

```typescript
import { mockApi } from 'copilot-test';

feature('Product List')
  .beforeEach(() => {
    // Mock successful response
    mockApi.get('/api/products', {
      status: 200,
      body: [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 },
      ],
    });

    // Mock with wildcard
    mockApi.get('/api/users/*', {
      status: 200,
      body: { id: 123, name: 'User' },
    });

    // Mock with regex
    mockApi.get(/^\/api\/products\/\d+$/, {
      status: 200,
      body: { id: 1, name: 'Product' },
    });
  })
  .afterEach(() => {
    mockApi.clear(); // Clean up mocks
  })
  .scenario('Display products')
    .when('I navigate to products page')
    .then('I should see 2 products');
```

**API:**
- `mockApi.get(url, response)` - Mock GET request
- `mockApi.post(url, response)` - Mock POST request
- `mockApi.put(url, response)` - Mock PUT request
- `mockApi.patch(url, response)` - Mock PATCH request
- `mockApi.delete(url, response)` - Mock DELETE request
- `mockApi.clear()` - Clear all mocks
- `mockApi.list()` - List all registered mocks
- `createMockApi()` - Create isolated mock instance

**Mock Response:**
```typescript
{
  status: number,        // HTTP status code
  body?: any,           // Response body (auto-stringified if object)
  headers?: object,     // Response headers
  delay?: number,       // Delay in ms before responding
}
```

## 6. Complete Example

See `tests/data-management-example.spec.ts` for a comprehensive example that demonstrates all features working together.

```typescript
import {
  feature,
  defineFixture,
  defineFactory,
  faker,
  seed,
  registerSeedHandler,
  mockApi,
} from 'copilot-test';

// Define fixtures
const users = defineFixture('users', {
  admin: { username: 'admin@test.com', password: 'Admin123!' },
});

// Define factories
const userFactory = defineFactory({
  username: ({ sequence }) => `user${sequence}@test.com`,
  firstName: ({ faker }) => faker.person.firstName(),
});

// Register seed handlers
registerSeedHandler('users', async (collection, data) => {
  await db.insert(collection, data);
});

// Create feature with hooks
const testFeature = feature('Complete Example')
  .beforeAll(async ({ context }) => {
    await seed('users', [{ id: 1, username: 'admin' }]);
  })
  .beforeEach(async ({ context }) => {
    mockApi.get('/api/users', { status: 200, body: [] });
    const testUser = userFactory.build();
    context.set('testUser', testUser);
  })
  .afterEach(async ({ context }) => {
    mockApi.clear();
  })
  .scenario('Test with all features')
    .given('I have test data prepared')
    .when('I perform an action')
    .then('I should see expected results');
```

## Running the Example

```bash
# View available features without running tests
npx tsx tests/data-management-example.spec.ts

# Run the actual tests
COPILOT_DATA_DEMO_LIVE=1 npx tsx tests/data-management-example.spec.ts
```

## Testing

All features are thoroughly tested in `tests/unit.test.ts`. Run tests with:

```bash
npm test
```

## Benefits

- **Reusable test data** - Define once, use everywhere
- **Consistent fixtures** - Avoid hardcoding test data
- **Dynamic generation** - Create realistic test data with Faker.js
- **Easy cleanup** - Lifecycle hooks ensure proper setup/teardown
- **Reduced duplication** - DRY principle for test data
- **Better maintainability** - Centralized test data management
