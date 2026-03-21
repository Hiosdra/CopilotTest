# API Testing Guide

Comprehensive guide to REST API testing with CopilotTest using the curl MCP server.

## Overview

CopilotTest uses the curl MCP server to test REST APIs. The AI interprets your test steps and makes HTTP requests to your API endpoints.

## Configuration

### Basic Setup

```typescript
import { configure, apiPlatform } from 'copilot-test';

configure({
  model: 'gpt-4o',
  platforms: {
    api: apiPlatform({
      baseUrl: 'https://api.example.com',
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      }
    })
  }
});
```

### Environment-Specific Configuration

```typescript
const API_CONFIG = {
  development: 'http://localhost:3000/api',
  staging: 'https://api-staging.example.com',
  production: 'https://api.example.com'
};

configure({
  platforms: {
    api: apiPlatform({
      baseUrl: API_CONFIG[process.env.NODE_ENV || 'development']
    })
  }
});
```

## HTTP Methods

### GET Requests

```typescript
.scenario('Get list of users')
  .given('the Users API is available')
  .when('I send a GET request to /users')
  .then('the response status should be 200')
  .and('the response should contain a list of users')
  .and('each user should have an id, name, and email')
  .done()

.scenario('Get specific user')
  .given('a user with ID 123 exists')
  .when('I send a GET request to /users/123')
  .then('the response status should be 200')
  .and('the response should contain user with ID 123')
  .and('the user name should be "John Doe"')
  .done()
```

### POST Requests

```typescript
.scenario('Create a new user')
  .given('the Users API is available')
  .when('I send a POST request to /users')
  .withDocString(`{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "role": "user"
  }`)
  .then('the response status should be 201')
  .and('the response should contain the created user')
  .and('the user should have a generated id')
  .done()
```

### PUT Requests

```typescript
.scenario('Update user details')
  .given('a user with ID 123 exists')
  .when('I send a PUT request to /users/123')
  .withDocString(`{
    "name": "John Updated",
    "email": "john.updated@example.com"
  }`)
  .then('the response status should be 200')
  .and('the response should contain the updated user')
  .and('the name should be "John Updated"')
  .done()
```

### PATCH Requests

```typescript
.scenario('Partially update user')
  .given('a user with ID 123 exists')
  .when('I send a PATCH request to /users/123')
  .withDocString(`{
    "email": "newemail@example.com"
  }`)
  .then('the response status should be 200')
  .and('the email should be updated')
  .and('other fields should remain unchanged')
  .done()
```

### DELETE Requests

```typescript
.scenario('Delete a user')
  .given('a user with ID 123 exists')
  .when('I send a DELETE request to /users/123')
  .then('the response status should be 204')

  .when('I send a GET request to /users/123')
  .then('the response status should be 404')
  .done()
```

## Request/Response Patterns

### Request Headers

```typescript
.scenario('API with custom headers')
  .given('the API is available')
  .when('I send a GET request to /protected')
  .and('I set header "X-API-Key" to "secret-key"')
  .and('I set header "X-Request-ID" to "12345"')
  .then('the response status should be 200')
  .done()
```

### Query Parameters

```typescript
.scenario('Filter users by role')
  .given('the Users API has multiple users')
  .when('I send a GET request to /users?role=admin&status=active')
  .then('the response status should be 200')
  .and('all users should have role "admin"')
  .and('all users should have status "active"')
  .done()

.scenario('Paginated results')
  .given('the Users API has 100 users')
  .when('I send a GET request to /users?page=2&limit=10')
  .then('the response status should be 200')
  .and('the response should contain 10 users')
  .and('the response should include pagination metadata')
  .done()
```

### Response Validation

#### Status Codes

```typescript
.then('the response status should be 200')      // OK
.then('the response status should be 201')      // Created
.then('the response status should be 204')      // No Content
.then('the response status should be 400')      // Bad Request
.then('the response status should be 401')      // Unauthorized
.then('the response status should be 403')      // Forbidden
.then('the response status should be 404')      // Not Found
.then('the response status should be 500')      // Internal Server Error
```

#### Response Body

```typescript
// JSON structure
.then('the response should be valid JSON')
.and('the response should have property "data"')
.and('the response.data should be an array')
.and('the response.data should have length 10')

// Specific values
.and('the response.user.name should be "Alice"')
.and('the response.user.email should be "alice@example.com"')
.and('the response.user.active should be true')

// Type checking
.and('the response.id should be a number')
.and('the response.email should be a string')
.and('the response.tags should be an array')
```

#### Response Headers

```typescript
.then('the response should have header "Content-Type"')
.and('the Content-Type should be "application/json"')
.and('the response should have header "X-RateLimit-Remaining"')
```

## Complete CRUD Example

```typescript
feature('Users API')
  .scenario('Complete CRUD flow')
    .tag('@api', '@crud')

    // CREATE
    .given('the Users API is available')
    .when('I send a POST request to /users')
    .withDocString(`{
      "name": "Test User",
      "email": "test@example.com",
      "role": "user"
    }`)
    .then('the response status should be 201')
    .and('the response should contain property "id"')
    .and('I store the response.id as "userId"')

    // READ
    .when('I send a GET request to /users/{userId}')
    .then('the response status should be 200')
    .and('the name should be "Test User"')
    .and('the email should be "test@example.com"')

    // UPDATE
    .when('I send a PUT request to /users/{userId}')
    .withDocString(`{
      "name": "Updated User",
      "email": "updated@example.com",
      "role": "admin"
    }`)
    .then('the response status should be 200')
    .and('the name should be "Updated User"')
    .and('the role should be "admin"')

    // DELETE
    .when('I send a DELETE request to /users/{userId}')
    .then('the response status should be 204')

    // VERIFY DELETION
    .when('I send a GET request to /users/{userId}')
    .then('the response status should be 404')
    .done()
  ._build();
```

## Authentication Testing

### Bearer Token

```typescript
.scenario('Access protected endpoint')
  .given('I have a valid authentication token')
  .when('I send a GET request to /protected')
  .and('I set header "Authorization" to "Bearer {token}"')
  .then('the response status should be 200')
  .done()

.scenario('Access without token')
  .given('I do not have an authentication token')
  .when('I send a GET request to /protected')
  .then('the response status should be 401')
  .and('the error should be "Unauthorized"')
  .done()
```

### API Key

```typescript
.scenario('Access with API key')
  .given('I have a valid API key')
  .when('I send a GET request to /data')
  .and('I set header "X-API-Key" to "{apiKey}"')
  .then('the response status should be 200')
  .done()
```

### Basic Auth

```typescript
.scenario('Basic authentication')
  .given('the API uses basic authentication')
  .when('I send a GET request to /admin')
  .and('I authenticate with username "admin" and password "secret"')
  .then('the response status should be 200')
  .done()
```

### OAuth 2.0

```typescript
.scenario('OAuth token flow')
  .given('I need to access protected resources')
  .when('I send a POST request to /oauth/token')
  .withDocString(`{
    "grant_type": "client_credentials",
    "client_id": "my-client",
    "client_secret": "my-secret"
  }`)
  .then('the response status should be 200')
  .and('the response should contain "access_token"')
  .and('I store the response.access_token as "token"')

  .when('I send a GET request to /api/resource')
  .and('I set header "Authorization" to "Bearer {token}"')
  .then('the response status should be 200')
  .done()
```

## Validation Testing

### Input Validation

```typescript
feature('Input Validation')
  .scenario('Required field missing')
    .given('the Users API requires name and email')
    .when('I send a POST request to /users')
    .withDocString(`{
      "name": "John"
    }`)
    .then('the response status should be 400')
    .and('the error should mention "email is required"')
    .done()

  .scenario('Invalid email format')
    .given('the Users API validates email format')
    .when('I send a POST request to /users')
    .withDocString(`{
      "name": "John",
      "email": "invalid-email"
    }`)
    .then('the response status should be 400')
    .and('the error should mention "invalid email format"')
    .done()

  .scenario('Duplicate email')
    .given('a user with email "john@example.com" exists')
    .when('I send a POST request to /users')
    .withDocString(`{
      "name": "Another John",
      "email": "john@example.com"
    }`)
    .then('the response status should be 409')
    .and('the error should be "Email already exists"')
    .done()
  ._build();
```

## Error Handling

### 4xx Client Errors

```typescript
.scenario('Bad Request - Invalid JSON')
  .when('I send a POST request to /users')
  .withDocString(`{ invalid json }`)
  .then('the response status should be 400')
  .and('the error should mention "invalid JSON"')
  .done()

.scenario('Unauthorized Access')
  .when('I send a GET request to /admin without credentials')
  .then('the response status should be 401')
  .done()

.scenario('Forbidden Resource')
  .given('I am authenticated as a regular user')
  .when('I send a GET request to /admin/users')
  .then('the response status should be 403')
  .done()

.scenario('Resource Not Found')
  .when('I send a GET request to /users/99999')
  .then('the response status should be 404')
  .and('the error should be "User not found"')
  .done()
```

### 5xx Server Errors

```typescript
.scenario('Internal Server Error')
  .given('the server is experiencing issues')
  .when('I send a GET request to /users')
  .then('the response status should be 500')
  .and('the error should contain "Internal Server Error"')
  .done()
```

## Advanced Patterns

### Chained Requests

```typescript
.scenario('Create order and add items')
  .given('the Order API is available')

  // Create order
  .when('I send a POST request to /orders')
  .withDocString(`{"customerId": 123}`)
  .then('the response status should be 201')
  .and('I store the response.id as "orderId"')

  // Add first item
  .when('I send a POST request to /orders/{orderId}/items')
  .withDocString(`{"productId": 456, "quantity": 2}`)
  .then('the response status should be 201')

  // Add second item
  .when('I send a POST request to /orders/{orderId}/items')
  .withDocString(`{"productId": 789, "quantity": 1}`)
  .then('the response status should be 201')

  // Verify order
  .when('I send a GET request to /orders/{orderId}')
  .then('the response status should be 200')
  .and('the order should have 2 items')
  .and('the total quantity should be 3')
  .done()
```

### Conditional Logic

```typescript
.scenario('Different responses based on query')
  .given('the API supports different response formats')

  .when('I send a GET request to /users?format=json')
  .then('the response status should be 200')
  .and('the Content-Type should be "application/json"')

  .when('I send a GET request to /users?format=xml')
  .then('the response status should be 200')
  .and('the Content-Type should be "application/xml"')
  .done()
```

### Rate Limiting

```typescript
.scenario('API rate limiting')
  .given('the API has rate limit of 10 requests per minute')
  .when('I send 11 GET requests to /users rapidly')
  .then('the 11th request should return status 429')
  .and('the response should have header "X-RateLimit-Reset"')
  .and('the error should be "Rate limit exceeded"')
  .done()
```

### Data-Driven API Testing

```typescript
feature('Product API Validation')
  .scenarioOutline('Create products with different data')
    .when('I send a POST request to /products')
    .withDocString(`{
      "name": "<name>",
      "price": <price>,
      "category": "<category>"
    }`)
    .then('the response status should be <status>')
    .and('the response should contain "<message>"')
    .examples([
      { name: 'Laptop', price: 999, category: 'Electronics', status: 201, message: 'id' },
      { name: '', price: 999, category: 'Electronics', status: 400, message: 'name is required' },
      { name: 'Laptop', price: -10, category: 'Electronics', status: 400, message: 'price must be positive' },
      { name: 'Laptop', price: 999, category: '', status: 400, message: 'category is required' }
    ])
    .done()
  ._build();
```

## Testing Async Operations

### Polling for Completion

```typescript
.scenario('Wait for async job completion')
  .given('the API supports background jobs')
  .when('I send a POST request to /jobs/process')
  .withDocString(`{"data": "large-dataset"}`)
  .then('the response status should be 202')
  .and('the response should contain "jobId"')
  .and('I store the response.jobId as "jobId"')

  .when('I poll GET /jobs/{jobId} every 2 seconds')
  .then('the job status should eventually be "completed"')
  .and('the result should be available')
  .done()
```

### Webhooks

```typescript
.scenario('Webhook delivery')
  .given('I have a webhook endpoint configured')
  .when('an event occurs in the system')
  .then('a POST request should be sent to my webhook URL')
  .and('the payload should contain event details')
  .and('the webhook should include signature for verification')
  .done()
```

## Performance Testing

### Response Time

```typescript
.scenario('API response time')
  .when('I send a GET request to /users')
  .then('the response status should be 200')
  .and('the response time should be less than 500ms')
  .done()
```

### Concurrent Requests

```typescript
.scenario('Handle concurrent requests')
  .when('I send 100 concurrent GET requests to /users')
  .then('all requests should return status 200')
  .and('no requests should fail')
  .done()
```

## Best Practices

### 1. Store and Reuse Data

```typescript
// Store created resource ID
.and('I store the response.id as "userId"')

// Use stored ID in subsequent requests
.when('I send a GET request to /users/{userId}')
```

### 2. Test Error Responses

Always test both success and failure cases:

```typescript
.scenario('Successful creation')
  // ... happy path
  .done()

.scenario('Creation fails with invalid data')
  // ... error case
  .done()
```

### 3. Verify Response Structure

```typescript
.then('the response should have property "id"')
.and('the response should have property "name"')
.and('the response should have property "createdAt"')
.and('the createdAt should be a valid ISO date')
```

### 4. Clean Up After Tests

```typescript
.scenario('Cleanup test data')
  .given('I created a test user with ID {userId}')
  .when('I send a DELETE request to /users/{userId}')
  .then('the response status should be 204')
  .done()
```

## Debugging API Tests

### View Request/Response

Enable debug mode to see full request and response:

```typescript
configure({
  debugMode: true
});
```

### Check AI Reasoning

Review the AI's reasoning in the HTML report to understand how it interpreted your steps.

### Use Verbose Assertions

```typescript
// Good - specific assertion
.then('the response.user.email should be "alice@example.com"')

// Avoid - vague assertion
.then('the response should be correct')
```

## Next Steps

- [Web Testing Guide](./web-testing.md) - Test web applications
- [Mobile Testing Guide](./mobile-testing.md) - Test mobile apps
- [Best Practices](./best-practices.md) - Write better tests
- [Custom Steps](../CUSTOM_STEPS.md) - Create reusable API steps
