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
│   ├── rest-api.feature.md          # REST CRUD operations
│   ├── authentication.feature.md     # Auth flows (JWT, OAuth, API keys)
│   ├── graphql-api.feature.md       # GraphQL queries and mutations
│   └── webhooks.feature.md          # Webhook integration
├── fixtures/
│   └── api-data.ts                  # API endpoints and test data
└── README.md                        # This file
```

## Running Tests

```bash
# Run all API tests (explicit file list)
copilot-test run \
  examples/api-testing/features/rest-api.feature.md \
  examples/api-testing/features/authentication.feature.md \
  examples/api-testing/features/graphql-api.feature.md \
  examples/api-testing/features/webhooks.feature.md

# Run specific feature
copilot-test run examples/api-testing/features/rest-api.feature.md
```

## Test Features

### 1. REST API (`rest-api.feature.md`)

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
```markdown
## Scenario: POST request creates new resource
- When I send a POST request to /users with body:
  ```json
  { "name": "John", "email": "john@example.com" }
  ```
- Then the response status should be 201
- And the response should include a generated ID
```

### 2. Authentication (`authentication.feature.md`)

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
```markdown
## Scenario: User authenticates and receives JWT
- When I send a POST request to /auth/login with body:
  ```json
  { "username": "user", "password": "pass" }
  ```
- Then the response should include access_token
- And the response should include refresh_token
```

### 3. GraphQL API (`graphql-api.feature.md`)

GraphQL query and mutation testing.

**Key Scenarios:**
- ✅ Execute GraphQL queries
- ✅ Query with variables
- ✅ Mutations (create, update, delete)
- ✅ Nested field queries
- ✅ Error handling

**Example:**
```markdown
## Scenario: Execute GraphQL query with variables
- When I send a GraphQL query:
  ```graphql
  query GetUser($id: ID!) { user(id: $id) { id name email } }
  ```
  with variables: `{ "id": "1" }`
- Then the response should contain the requested user
```

### 4. Webhooks (`webhooks.feature.md`)

Webhook integration and delivery testing.

**Key Scenarios:**
- ✅ Register webhook endpoint
- ✅ Webhook event delivery
- ✅ Signature verification
- ✅ Retry on failure
- ✅ List webhooks
- ✅ Delete webhook

**Example:**
```markdown
## Scenario: Webhook delivers event payload
- Given I have registered webhook for "user.created" events
- When a user is created
- Then webhook POST should be sent to my endpoint
- And payload should include event type and data
- And request should include X-Webhook-Signature header
```

## API Testing Patterns

### CRUD Pattern

```markdown
## Scenario: Create resource
- When I send a POST request to /users with user data
- Then response status should be 201

## Scenario: Read resource
- When I send a GET request to /users/1
- Then response status should be 200

## Scenario: Update resource
- When I send a PUT request to /users/1 with updated data
- Then response should reflect updates

## Scenario: Delete resource
- When I send a DELETE request to /users/1
- Then response status should be 204
```

### Authentication Pattern

```markdown
## Scenario: Authenticate and use token
- When I login to get token
- And I store the token
- When I send GET to /api/protected with token in Authorization header
- Then I should have access to protected resource
```

### Pagination Pattern

```markdown
## Scenario: API supports pagination
- When I send GET to /posts?_page=1&_limit=10
- Then response should contain 10 items
- And response should include pagination metadata
- When I request page 2
- Then I should get next set of results
```

### Error Handling Pattern

```markdown
## Scenario: API returns proper error responses
- When I send invalid request
- Then response status should be 400 or 422
- And response should include error details
- And error message should be descriptive
```

## Configuration

```yaml
# copilot-test.config.yaml
model: gpt-4o
platforms:
  api:
    platform: api
    baseUrl: https://api.example.com
stepTimeout: 15000
outputDir: copilot-test-results/api-testing
```

## Using Fixtures

Reference fixture data directly in your Markdown step descriptions:

```markdown
## Scenario: Create user via API
- When I send a POST request to /api/users with the test user data
- Then the response status should be 201
```

> **Note:** Fixture data files (`fixtures/api-data.ts`) are still used by the test runner.
> Reference fixture values by name in your step descriptions.

## Best Practices

### 1. Test All HTTP Methods

```markdown
## Scenario: GET retrieves resource
## Scenario: POST creates resource
## Scenario: PUT updates resource
## Scenario: PATCH partially updates
## Scenario: DELETE removes resource
```

### 2. Verify Response Structure

```markdown
- Then response status should be 200
- And response should be valid JSON
- And response should include required fields
- And response time should be under 2000ms
```

### 3. Test Error Cases

```markdown
## Scenario: GET non-existent resource returns 404
## Scenario: POST with invalid data returns 400
## Scenario: Request without auth returns 401
## Scenario: Insufficient permissions returns 403
```

### 4. Validate Headers

```markdown
- Then Content-Type should be "application/json"
- And response should include CORS headers
- And Cache-Control header should be present
```

### 5. Check Security

```markdown
## Scenario: Sensitive endpoints require authentication
## Scenario: Tokens expire after timeout
## Scenario: Invalid tokens are rejected
## Scenario: Rate limiting is enforced
```

## Advanced Patterns

### Chained Requests

```markdown
## Scenario: Create and then retrieve resource
- When I POST to /users to create user
- Then I should get the new user ID
- When I GET /users/{id} with that ID
- Then I should retrieve the created user
```

### Batch Operations

```markdown
## Scenario: Batch create multiple resources
- When I POST to /users/batch with multiple users
- Then all users should be created
- And response should include all IDs
```

### Conditional Requests

```markdown
## Scenario: Conditional GET with ETag
- When I GET /users/1
- And I save the ETag header
- When I GET /users/1 again with If-None-Match header
- Then response should be 304 Not Modified if unchanged
```

## Troubleshooting

### CORS Issues

**Problem**: API returns CORS errors

**Solution**: Check CORS headers or use proxy
```markdown
- Then Access-Control-Allow-Origin header should be present
```

### Rate Limiting

**Problem**: Tests hit rate limits

**Solution**: Add delays or use test API keys
```yaml
# copilot-test.config.yaml
stepTimeout: 5000  # Add buffer for rate limits
```

### Authentication Tokens

**Problem**: Tokens expire during test run

**Solution**: Refresh tokens or use long-lived test tokens
```markdown
## Scenario: Refresh token before expiry
- When token is about to expire
- And I call /auth/refresh with refresh token
- Then I receive new access token
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
      - run: copilot-test run examples/api-testing/features/*.feature.md
```

## Next Steps

- Check [E-Commerce Examples](../e-commerce/README.md)
- Review [SaaS App Examples](../saas-app/README.md)
- Explore [Mobile App Examples](../mobile-app/README.md)
