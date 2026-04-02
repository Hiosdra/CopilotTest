# API Testing Guide

Comprehensive guide to REST API testing with CopilotTest using the curl MCP server.

## Overview

CopilotTest uses the curl MCP server to test REST APIs. The AI interprets your test steps and makes HTTP requests to your API endpoints.

## Configuration

### Basic Setup

```yaml
# copilot-test.config.yaml
model: gpt-5-mini
platforms:
  api:
    platform: api
    baseUrl: "https://api.example.com"
    defaultHeaders:
      Content-Type: application/json
      Authorization: "Bearer ${API_TOKEN}"
```

### Environment-Specific Configuration

```yaml
# copilot-test.config.yaml
platforms:
  api:
    platform: api
    baseUrl: "${API_BASE_URL:-http://localhost:3000/api}"
```

> Override the base URL per environment using environment variables or separate config files.

## HTTP Methods

### GET Requests

```markdown
## Scenario: Get list of users
- Given the Users API is available
- When I send a GET request to /users
- Then the response status should be 200
- And the response should contain a list of users
- And each user should have an id, name, and email

## Scenario: Get specific user
- Given a user with ID 123 exists
- When I send a GET request to /users/123
- Then the response status should be 200
- And the response should contain user with ID 123
- And the user name should be "John Doe"
```

### POST Requests

```markdown
## Scenario: Create a new user
- Given the Users API is available
- When I send a POST request to /users with body:
  ```json
  {
    "name": "Alice Smith",
    "email": "alice@example.com",
    "role": "user"
  }
  ```
- Then the response status should be 201
- And the response should contain the created user
- And the user should have a generated id
```

### PUT Requests

```markdown
## Scenario: Update user details
- Given a user with ID 123 exists
- When I send a PUT request to /users/123 with body:
  ```json
  {
    "name": "John Updated",
    "email": "john.updated@example.com"
  }
  ```
- Then the response status should be 200
- And the response should contain the updated user
- And the name should be "John Updated"
```

### PATCH Requests

```markdown
## Scenario: Partially update user
- Given a user with ID 123 exists
- When I send a PATCH request to /users/123 with body:
  ```json
  {
    "email": "newemail@example.com"
  }
  ```
- Then the response status should be 200
- And the email should be updated
- And other fields should remain unchanged
```

### DELETE Requests

```markdown
## Scenario: Delete a user
- Given a user with ID 123 exists
- When I send a DELETE request to /users/123
- Then the response status should be 204
- When I send a GET request to /users/123
- Then the response status should be 404
```

## Request/Response Patterns

### Request Headers

```markdown
## Scenario: API with custom headers
- Given the API is available
- When I send a GET request to /protected
- And I set header "X-API-Key" to "secret-key"
- And I set header "X-Request-ID" to "12345"
- Then the response status should be 200
```

### Query Parameters

```markdown
## Scenario: Filter users by role
- Given the Users API has multiple users
- When I send a GET request to /users?role=admin&status=active
- Then the response status should be 200
- And all users should have role "admin"
- And all users should have status "active"

## Scenario: Paginated results
- Given the Users API has 100 users
- When I send a GET request to /users?page=2&limit=10
- Then the response status should be 200
- And the response should contain 10 users
- And the response should include pagination metadata
```

### Response Validation

#### Status Codes

```markdown
- Then the response status should be 200      <!-- OK -->
- Then the response status should be 201      <!-- Created -->
- Then the response status should be 204      <!-- No Content -->
- Then the response status should be 400      <!-- Bad Request -->
- Then the response status should be 401      <!-- Unauthorized -->
- Then the response status should be 403      <!-- Forbidden -->
- Then the response status should be 404      <!-- Not Found -->
- Then the response status should be 500      <!-- Internal Server Error -->
```

#### Response Body

```markdown
<!-- JSON structure -->
- Then the response should be valid JSON
- And the response should have property "data"
- And the response.data should be an array
- And the response.data should have length 10

<!-- Specific values -->
- And the response.user.name should be "Alice"
- And the response.user.email should be "alice@example.com"
- And the response.user.active should be true

<!-- Type checking -->
- And the response.id should be a number
- And the response.email should be a string
- And the response.tags should be an array
```

#### Response Headers

```markdown
- Then the response should have header "Content-Type"
- And the Content-Type should be "application/json"
- And the response should have header "X-RateLimit-Remaining"
```

## Complete CRUD Example

```markdown
---
platform: api
tags: [api, crud]
---

# Feature: Users API

## Scenario: Complete CRUD flow
@api @crud
- Given the Users API is available
- When I send a POST request to /users with body:
  ```json
  {
    "name": "Test User",
    "email": "test@example.com",
    "role": "user"
  }
  ```
- Then the response status should be 201
- And the response should contain property "id"
- And I store the response.id as "userId"
- When I send a GET request to /users/{userId}
- Then the response status should be 200
- And the name should be "Test User"
- And the email should be "test@example.com"
- When I send a PUT request to /users/{userId} with body:
  ```json
  {
    "name": "Updated User",
    "email": "updated@example.com",
    "role": "admin"
  }
  ```
- Then the response status should be 200
- And the name should be "Updated User"
- And the role should be "admin"
- When I send a DELETE request to /users/{userId}
- Then the response status should be 204
- When I send a GET request to /users/{userId}
- Then the response status should be 404
```

## Authentication Testing

### Bearer Token

```markdown
## Scenario: Access protected endpoint
- Given I have a valid authentication token
- When I send a GET request to /protected
- And I set header "Authorization" to "Bearer {token}"
- Then the response status should be 200

## Scenario: Access without token
- Given I do not have an authentication token
- When I send a GET request to /protected
- Then the response status should be 401
- And the error should be "Unauthorized"
```

### API Key

```markdown
## Scenario: Access with API key
- Given I have a valid API key
- When I send a GET request to /data
- And I set header "X-API-Key" to "{apiKey}"
- Then the response status should be 200
```

### Basic Auth

```markdown
## Scenario: Basic authentication
- Given the API uses basic authentication
- When I send a GET request to /admin
- And I authenticate with username "admin" and password "secret"
- Then the response status should be 200
```

### OAuth 2.0

```markdown
## Scenario: OAuth token flow
- Given I need to access protected resources
- When I send a POST request to /oauth/token with body:
  ```json
  {
    "grant_type": "client_credentials",
    "client_id": "my-client",
    "client_secret": "my-secret"
  }
  ```
- Then the response status should be 200
- And the response should contain "access_token"
- And I store the response.access_token as "token"
- When I send a GET request to /api/resource
- And I set header "Authorization" to "Bearer {token}"
- Then the response status should be 200
```

## Validation Testing

### Input Validation

```markdown
---
platform: api
---

# Feature: Input Validation

## Scenario: Required field missing
- Given the Users API requires name and email
- When I send a POST request to /users with body:
  ```json
  {
    "name": "John"
  }
  ```
- Then the response status should be 400
- And the error should mention "email is required"

## Scenario: Invalid email format
- Given the Users API validates email format
- When I send a POST request to /users with body:
  ```json
  {
    "name": "John",
    "email": "invalid-email"
  }
  ```
- Then the response status should be 400
- And the error should mention "invalid email format"

## Scenario: Duplicate email
- Given a user with email "john@example.com" exists
- When I send a POST request to /users with body:
  ```json
  {
    "name": "Another John",
    "email": "john@example.com"
  }
  ```
- Then the response status should be 409
- And the error should be "Email already exists"
```

## Error Handling

### 4xx Client Errors

```markdown
## Scenario: Bad Request - Invalid JSON
- When I send a POST request to /users with body:
  ```
  { invalid json }
  ```
- Then the response status should be 400
- And the error should mention "invalid JSON"

## Scenario: Unauthorized Access
- When I send a GET request to /admin without credentials
- Then the response status should be 401

## Scenario: Forbidden Resource
- Given I am authenticated as a regular user
- When I send a GET request to /admin/users
- Then the response status should be 403

## Scenario: Resource Not Found
- When I send a GET request to /users/99999
- Then the response status should be 404
- And the error should be "User not found"
```

### 5xx Server Errors

```markdown
## Scenario: Internal Server Error
- Given the server is experiencing issues
- When I send a GET request to /users
- Then the response status should be 500
- And the error should contain "Internal Server Error"
```

## Advanced Patterns

### Chained Requests

```markdown
## Scenario: Create order and add items
- Given the Order API is available
- When I send a POST request to /orders with body:
  ```json
  {"customerId": 123}
  ```
- Then the response status should be 201
- And I store the response.id as "orderId"
- When I send a POST request to /orders/{orderId}/items with body:
  ```json
  {"productId": 456, "quantity": 2}
  ```
- Then the response status should be 201
- When I send a POST request to /orders/{orderId}/items with body:
  ```json
  {"productId": 789, "quantity": 1}
  ```
- Then the response status should be 201
- When I send a GET request to /orders/{orderId}
- Then the response status should be 200
- And the order should have 2 items
- And the total quantity should be 3
```

### Conditional Logic

```markdown
## Scenario: Different responses based on query
- Given the API supports different response formats
- When I send a GET request to /users?format=json
- Then the response status should be 200
- And the Content-Type should be "application/json"
- When I send a GET request to /users?format=xml
- Then the response status should be 200
- And the Content-Type should be "application/xml"
```

### Rate Limiting

```markdown
## Scenario: API rate limiting
- Given the API has rate limit of 10 requests per minute
- When I send 11 GET requests to /users rapidly
- Then the 11th request should return status 429
- And the response should have header "X-RateLimit-Reset"
- And the error should be "Rate limit exceeded"
```

### Data-Driven API Testing

```markdown
## Scenario Outline: Create products with different data
- When I send a POST request to /products with body:
  ```json
  {
    "name": "<name>",
    "price": <price>,
    "category": "<category>"
  }
  ```
- Then the response status should be <status>
- And the response should contain "<message>"

### Examples:
| name   | price | category    | status | message                |
|--------|-------|-------------|--------|------------------------|
| Laptop | 999   | Electronics | 201    | id                     |
|        | 999   | Electronics | 400    | name is required       |
| Laptop | -10   | Electronics | 400    | price must be positive |
| Laptop | 999   |             | 400    | category is required   |
```

## Testing Async Operations

### Polling for Completion

```markdown
## Scenario: Wait for async job completion
- Given the API supports background jobs
- When I send a POST request to /jobs/process with body:
  ```json
  {"data": "large-dataset"}
  ```
- Then the response status should be 202
- And the response should contain "jobId"
- And I store the response.jobId as "jobId"
- When I poll GET /jobs/{jobId} every 2 seconds
- Then the job status should eventually be "completed"
- And the result should be available
```

### Webhooks

```markdown
## Scenario: Webhook delivery
- Given I have a webhook endpoint configured
- When an event occurs in the system
- Then a POST request should be sent to my webhook URL
- And the payload should contain event details
- And the webhook should include signature for verification
```

## Performance Testing

### Response Time

```markdown
## Scenario: API response time
- When I send a GET request to /users
- Then the response status should be 200
- And the response time should be less than 500ms
```

### Concurrent Requests

```markdown
## Scenario: Handle concurrent requests
- When I send 100 concurrent GET requests to /users
- Then all requests should return status 200
- And no requests should fail
```

## Best Practices

### 1. Store and Reuse Data

```markdown
<!-- Store created resource ID -->
- And I store the response.id as "userId"

<!-- Use stored ID in subsequent requests -->
- When I send a GET request to /users/{userId}
```

### 2. Test Error Responses

Always test both success and failure cases:

```markdown
## Scenario: Successful creation
<!-- ... happy path -->

## Scenario: Creation fails with invalid data
<!-- ... error case -->
```

### 3. Verify Response Structure

```markdown
- Then the response should have property "id"
- And the response should have property "name"
- And the response should have property "createdAt"
- And the createdAt should be a valid ISO date
```

### 4. Clean Up After Tests

```markdown
## Scenario: Cleanup test data
- Given I created a test user with ID {userId}
- When I send a DELETE request to /users/{userId}
- Then the response status should be 204
```

## Debugging API Tests

### View Request/Response

Enable debug mode to see full request and response:

```yaml
# copilot-test.config.yaml
debugMode: true
```

### Check AI Reasoning

Review the AI's reasoning in the HTML report to understand how it interpreted your steps.

### Use Verbose Assertions

```markdown
<!-- Good - specific assertion -->
- Then the response.user.email should be "alice@example.com"

<!-- Avoid - vague assertion -->
- Then the response should be correct
```

## Next Steps

- [Web Testing Guide](./web-testing.md) - Test web applications
- [Mobile Testing Guide](./mobile-testing.md) - Test mobile apps
- [Best Practices](./best-practices.md) - Write better tests
- [Custom Steps](../CUSTOM_STEPS.md) - Create reusable API steps
