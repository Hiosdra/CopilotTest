/**
 * REST API Integration Tests
 * Comprehensive REST API testing with CRUD operations, authentication, and error handling.
 */

import { configure, feature, test } from '../../../src/index.js';
import { apiPlatform } from '../../../src/platforms/api.js';
import { apiEndpoints, testUser, testPost } from '../fixtures/api-data.js';

configure({
  model: 'gpt-4o',
  platforms: { api: apiPlatform({ baseUrl: 'https://jsonplaceholder.typicode.com' }) },
  stepTimeout: 15000,
  outputDir: 'copilot-test-results/api-testing',
});

const restApiFeature = feature('REST API Integration')
  .description('CRUD operations, authentication, and REST API best practices')
  .tag('@api', '@rest')

  .scenario('GET request retrieves list of resources')
  .tag('@smoke', '@get')
  .given('the API is available')
  .when(`I send a GET request to ${apiEndpoints.users}`)
  .then('the response status code should be 200')
  .and('the response should be a JSON array')
  .and('each item should have id, name, email fields')
  .and('the response time should be less than 2000ms')

  .scenario('GET request retrieves single resource by ID')
  .tag('@get', '@resource')
  .when('I send a GET request to /users/1')
  .then('the response status should be 200')
  .and('the response should contain user with id 1')
  .and('the response should include all user fields')

  .scenario('POST request creates new resource')
  .tag('@smoke', '@post', '@create')
  .given('I have new user data')
  .when('I send a POST request to /users')
  .withDocString(JSON.stringify(testUser, null, 2))
  .then('the response status should be 201')
  .and('the response should contain the created user')
  .and('the response should include a generated ID')
  .and('the Location header should point to the new resource')

  .scenario('PUT request updates existing resource')
  .tag('@put', '@update')
  .given('a user with id 1 exists')
  .when('I send a PUT request to /users/1')
  .withDocString(JSON.stringify({ ...testUser, name: 'Updated Name' }, null, 2))
  .then('the response status should be 200')
  .and('the response should reflect the updated data')
  .and('the user name should be "Updated Name"')

  .scenario('PATCH request partially updates resource')
  .tag('@patch', '@update')
  .when('I send a PATCH request to /users/1')
  .withDocString(JSON.stringify({ email: 'newemail@example.com' }, null, 2))
  .then('the response status should be 200')
  .and('only the email field should be updated')
  .and('other fields should remain unchanged')

  .scenario('DELETE request removes resource')
  .tag('@delete')
  .given('a user with id 1 exists')
  .when('I send a DELETE request to /users/1')
  .then('the response status should be 200 or 204')
  .when('I try to GET /users/1')
  .then('the response status should be 404')

  .scenario('GET request for non-existent resource returns 404')
  .tag('@negative', '@error-handling')
  .when('I send a GET request to /users/99999')
  .then('the response status should be 404')
  .and('the response should include error message')

  .scenario('POST request with invalid data returns 400')
  .tag('@negative', '@validation')
  .when('I send a POST request to /users with invalid data')
  .withDocString(JSON.stringify({ invalid: 'data' }, null, 2))
  .then('the response status should be 400 or 422')
  .and('the response should include validation errors')

  .scenario('API request includes proper headers')
  .tag('@headers')
  .when('I send a GET request to /users with Accept header "application/json"')
  .then('the response Content-Type should be "application/json"')
  .and('the response should include proper CORS headers')

  .scenario('API supports pagination')
  .tag('@pagination')
  .when('I send a GET request to /posts?_page=1&_limit=10')
  .then('the response should contain 10 items')
  .and('the response should include pagination metadata')
  .when('I send request for page 2')
  .then('I should get the next set of results')

  .scenario('API supports filtering')
  .tag('@filter', '@query')
  .when('I send a GET request to /users?email=test@example.com')
  .then('the response should only include users matching the filter')
  .and('all returned users should have the specified email')

  .scenario('API supports sorting')
  .tag('@sort')
  .when('I send a GET request to /users?_sort=name&_order=asc')
  .then('the users should be sorted by name in ascending order')
  .and('the first user name should be alphabetically first')

  .done()
  ._build();

test(restApiFeature, 'api');
export { restApiFeature };
