/**
 * API Authentication Tests
 * JWT authentication, token refresh, OAuth, and API key authentication.
 */

import { configure, feature, test } from '../../../src/index.js';
import { apiPlatform } from '../../../src/platforms/api.js';
import { testUser } from '../fixtures/api-data.js';

configure({
  model: 'gpt-4o',
  platforms: { api: apiPlatform({ baseUrl: 'https://api.example.com' }) },
  stepTimeout: 15000,
  outputDir: 'copilot-test-results/api-testing',
});

const authFeature = feature('API Authentication')
  .description('JWT, OAuth, API keys, and authentication flows')
  .tag('@api', '@auth', '@security')

  .scenario('User authenticates with credentials and receives JWT')
  .tag('@smoke', '@jwt')
  .when('I send a POST request to /auth/login')
  .withDocString(JSON.stringify({
    username: testUser.username,
    password: testUser.password,
  }, null, 2))
  .then('the response status should be 200')
  .and('the response should include access_token')
  .and('the response should include refresh_token')
  .and('the response should include token expiry time')

  .scenario('Authenticated request with valid JWT token')
  .tag('@jwt', '@authorized')
  .given('I have a valid JWT token')
  .when('I send a GET request to /api/protected with Authorization header')
  .then('the response status should be 200')
  .and('I should have access to protected resource')

  .scenario('Request without token returns 401')
  .tag('@negative', '@unauthorized')
  .when('I send a GET request to /api/protected without Authorization header')
  .then('the response status should be 401')
  .and('the response should include WWW-Authenticate header')
  .and('the error message should indicate missing authentication')

  .scenario('Request with expired token returns 401')
  .tag('@negative', '@token-expiry')
  .given('I have an expired JWT token')
  .when('I send a GET request to /api/protected with expired token')
  .then('the response status should be 401')
  .and('the error should indicate token expired')

  .scenario('Refresh access token using refresh token')
  .tag('@token-refresh')
  .given('I have a valid refresh token')
  .when('I send a POST request to /auth/refresh')
  .withDocString(JSON.stringify({ refreshToken: 'refresh_token_here' }, null, 2))
  .then('the response status should be 200')
  .and('I should receive a new access token')
  .and('the new token should be valid')

  .scenario('API key authentication')
  .tag('@api-key')
  .given('I have a valid API key')
  .when('I send a GET request with X-API-Key header')
  .then('the request should be authenticated')
  .and('I should have access to the resource')

  .scenario('Invalid API key returns 403')
  .tag('@negative', '@api-key')
  .when('I send a GET request with invalid X-API-Key header')
  .then('the response status should be 403')
  .and('the error should indicate invalid API key')

  .scenario('OAuth 2.0 authorization code flow')
  .tag('@oauth', '@oauth2')
  .when('I initiate OAuth authorization')
  .and('I authorize the application')
  .and('I exchange authorization code for tokens')
  .then('I should receive access token and refresh token')
  .and('I should be able to access protected resources')

  .done()
  ._build();

test(authFeature, 'api');
export { authFeature };
