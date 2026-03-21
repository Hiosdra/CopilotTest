# API Integration Test Suite Example

Comprehensive API testing examples covering REST, GraphQL, authentication, and webhooks using the CopilotTest framework with curl MCP.

## Overview

This suite demonstrates API testing best practices:

- **REST API**: CRUD operations, pagination, filtering, sorting
- **Authentication**: JWT, OAuth, API keys, token refresh
- **GraphQL**: Queries, mutations, variables, nested data
- **Webhooks**: Registration, delivery, retries, signatures

## Structure

```
api-testing/
├── features/
│   ├── rest-api.spec.ts          # REST CRUD operations
│   ├── authentication.spec.ts     # Auth flows (JWT, OAuth, API keys)
│   ├── graphql-api.spec.ts       # GraphQL queries and mutations
│   └── webhooks.spec.ts          # Webhook integration
├── fixtures/
│   └── api-data.ts               # API endpoints and test data
└── README.md                     # This file
```

## Running Tests

```bash
# Run all API tests (explicit file list)
copilot-test run \
  examples/api-testing/features/rest-api.spec.ts \
  examples/api-testing/features/authentication.spec.ts \
  examples/api-testing/features/graphql-api.spec.ts \
  examples/api-testing/features/webhooks.spec.ts

# Run specific feature
copilot-test run examples/api-testing/features/rest-api.spec.ts

# Note: Each spec file includes configure() and can be run standalone
```

## Test Features

### 1. REST API (`rest-api.spec.ts`)

Complete REST API testing with all HTTP methods.

**Key Scenarios:**
- ✅ GET list of resources (with pagination)
- ✅ GET single resource by ID
- ✅ POST create new resource
- ✅ PUT full update
- ✅ PATCH partial update
- ✅ DELETE resource
- ✅ 404 for non-existent resources
- ✅ 400 for invalid data
- ✅ Header validation
- ✅ Filtering and sorting

**Example:**
```typescript
.scenario('POST request creates new resource')
.when('I send a POST request to /users')
.withDocString(JSON.stringify({ name: 'John', email: 'john@example.com' }, null, 2))
.then('the response status should be 201')
.and('the response should include a generated ID')
```

### 2. Authentication (`authentication.spec.ts`)

Comprehensive authentication testing.

**Key Scenarios:**
- ✅ JWT token authentication
- ✅ Token refresh flow
- ✅ Unauthorized requests (401)
- ✅ Expired token handling
- ✅ API key authentication
- ✅ Invalid credentials
- ✅ OAuth 2.0 flow

**Example:**
```typescript
.scenario('User authenticates and receives JWT')
.when('I send a POST request to /auth/login')
.withDocString(JSON.stringify({ username: 'user', password: 'pass' }))
.then('the response should include access_token')
.and('the response should include refresh_token')
```

### 3. GraphQL API (`graphql-api.spec.ts`)

GraphQL query and mutation testing.

**Key Scenarios:**
- ✅ Execute GraphQL queries
- ✅ Query with variables
- ✅ Mutations (create, update, delete)
- ✅ Nested field queries
- ✅ Error handling

**Example:**
```typescript
.scenario('Execute GraphQL query with variables')
.when('I send a GraphQL query')
.withDocString(`{
  "query": "query GetUser($id: ID!) { user(id: $id) { id name email } }",
  "variables": { "id": "1" }
}`)
.then('the response should contain the requested user')
```

### 4. Webhooks (`webhooks.spec.ts`)

Webhook integration and delivery testing.

**Key Scenarios:**
- ✅ Register webhook endpoint
- ✅ Webhook event delivery
- ✅ Signature verification
- ✅ Retry on failure
- ✅ List webhooks
- ✅ Delete webhook

**Example:**
```typescript
.scenario('Webhook delivers event payload')
.given('I have registered webhook for "user.created" events')
.when('a user is created')
.then('webhook POST should be sent to my endpoint')
.and('payload should include event type and data')
.and('request should include X-Webhook-Signature header')
```

## API Testing Patterns

### CRUD Pattern

```typescript
// Create
.when('I send a POST request to /users')
.withDocString(JSON.stringify(userData))
.then('response status should be 201')

// Read
.when('I send a GET request to /users/1')
.then('response status should be 200')

// Update
.when('I send a PUT request to /users/1')
.withDocString(JSON.stringify(updatedData))
.then('response should reflect updates')

// Delete
.when('I send a DELETE request to /users/1')
.then('response status should be 204')
```

### Authentication Pattern

```typescript
// Login and get token
.scenario('Authenticate and use token')
.when('I login to get token')
.and('I store the token')
.when('I send GET to /api/protected with token in Authorization header')
.then('I should have access to protected resource')
```

### Pagination Pattern

```typescript
.scenario('API supports pagination')
.when('I send GET to /posts?_page=1&_limit=10')
.then('response should contain 10 items')
.and('response should include pagination metadata')
.when('I request page 2')
.then('I should get next set of results')
```

### Error Handling Pattern

```typescript
.scenario('API returns proper error responses')
.when('I send invalid request')
.then('response status should be 400 or 422')
.and('response should include error details')
.and('error message should be descriptive')
```

## Configuration

```typescript
configure({
  model: 'gpt-4o',
  platforms: {
    api: apiPlatform({
      baseUrl: 'https://api.example.com'
    })
  },
  stepTimeout: 15000,
  outputDir: 'copilot-test-results/api-testing',
});
```

## Using Fixtures

```typescript
import { apiEndpoints, testUser, testPost } from '../fixtures/api-data.js';

.when(`I send a POST request to ${apiEndpoints.users}`)
.withDocString(JSON.stringify(testUser, null, 2))
```

## Best Practices

### 1. Test All HTTP Methods

```typescript
.scenario('GET retrieves resource')
.scenario('POST creates resource')
.scenario('PUT updates resource')
.scenario('PATCH partially updates')
.scenario('DELETE removes resource')
```

### 2. Verify Response Structure

```typescript
.then('response status should be 200')
.and('response should be valid JSON')
.and('response should include required fields')
.and('response time should be under 2000ms')
```

### 3. Test Error Cases

```typescript
// 404 Not Found
.scenario('GET non-existent resource returns 404')

// 400 Bad Request
.scenario('POST with invalid data returns 400')

// 401 Unauthorized
.scenario('Request without auth returns 401')

// 403 Forbidden
.scenario('Insufficient permissions returns 403')
```

### 4. Validate Headers

```typescript
.then('Content-Type should be "application/json"')
.and('response should include CORS headers')
.and('Cache-Control header should be present')
```

### 5. Check Security

```typescript
.scenario('Sensitive endpoints require authentication')
.scenario('Tokens expire after timeout')
.scenario('Invalid tokens are rejected')
.scenario('Rate limiting is enforced')
```

## Advanced Patterns

### Chained Requests

```typescript
.scenario('Create and then retrieve resource')
.when('I POST to /users to create user')
.then('I should get the new user ID')
.when('I GET /users/{id} with that ID')
.then('I should retrieve the created user')
```

### Batch Operations

```typescript
.scenario('Batch create multiple resources')
.when('I POST to /users/batch')
.withDocString(JSON.stringify([user1, user2, user3]))
.then('all users should be created')
.and('response should include all IDs')
```

### Conditional Requests

```typescript
.scenario('Conditional GET with ETag')
.when('I GET /users/1')
.and('I save the ETag header')
.when('I GET /users/1 again with If-None-Match header')
.then('response should be 304 Not Modified if unchanged')
```

## Troubleshooting

### CORS Issues

**Problem**: API returns CORS errors

**Solution**: Check CORS headers or use proxy
```typescript
.then('Access-Control-Allow-Origin header should be present')
```

### Rate Limiting

**Problem**: Tests hit rate limits

**Solution**: Add delays or use test API keys
```typescript
configure({
  stepTimeout: 5000, // Add buffer for rate limits
});
```

### Authentication Tokens

**Problem**: Tokens expire during test run

**Solution**: Refresh tokens or use long-lived test tokens
```typescript
.scenario('Refresh token before expiry')
.when('token is about to expire')
.and('I call /auth/refresh with refresh token')
.then('I receive new access token')
```

## CI/CD Integration

```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      API_BASE_URL: ${{ secrets.API_BASE_URL }}
      API_KEY: ${{ secrets.API_KEY }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx tsx examples/api-testing/features/*.spec.ts
```

## Next Steps

- Check [E-Commerce Examples](../e-commerce/README.md)
- Review [SaaS App Examples](../saas-app/README.md)
- Explore [Mobile App Examples](../mobile-app/README.md)
