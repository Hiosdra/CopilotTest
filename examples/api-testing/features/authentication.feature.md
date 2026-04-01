---
platform: api
tags: [api, auth, security]
---

# Feature: API Authentication

JWT, OAuth, API keys, and authentication flows

## Scenario: User authenticates with credentials and receives JWT
@smoke @jwt
- When I send a POST request to /auth/login
  ```json
  {
    "username": "testuser",
    "password": "Test@123"
  }
  ```
- Then the response status should be 200
- And the response should include access_token
- And the response should include refresh_token
- And the response should include token expiry time

## Scenario: Authenticated request with valid JWT token
@jwt @authorized
- Given I have a valid JWT token
- When I send a GET request to /api/protected with Authorization header
- Then the response status should be 200
- And I should have access to protected resource

## Scenario: Request without token returns 401
@negative @unauthorized
- When I send a GET request to /api/protected without Authorization header
- Then the response status should be 401
- And the response should include WWW-Authenticate header
- And the error message should indicate missing authentication

## Scenario: Request with expired token returns 401
@negative @token-expiry
- Given I have an expired JWT token
- When I send a GET request to /api/protected with expired token
- Then the response status should be 401
- And the error should indicate token expired

## Scenario: Refresh access token using refresh token
@token-refresh
- Given I have a valid refresh token
- When I send a POST request to /auth/refresh
  ```json
  {
    "refreshToken": "refresh_token_here"
  }
  ```
- Then the response status should be 200
- And I should receive a new access token
- And the new token should be valid

## Scenario: API key authentication
@api-key
- Given I have a valid API key
- When I send a GET request with X-API-Key header
- Then the request should be authenticated
- And I should have access to the resource

## Scenario: Invalid API key returns 403
@negative @api-key
- When I send a GET request with invalid X-API-Key header
- Then the response status should be 403
- And the error should indicate invalid API key

## Scenario: OAuth 2.0 authorization code flow
@oauth @oauth2
- When I initiate OAuth authorization
- And I authorize the application
- And I exchange authorization code for tokens
- Then I should receive access token and refresh token
- And I should be able to access protected resources
