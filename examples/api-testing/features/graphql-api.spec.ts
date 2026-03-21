/**
 * GraphQL API Tests
 * GraphQL queries, mutations, subscriptions, and error handling.
 */

import { configure, feature, test } from '../../../src/index.js';
import { apiPlatform } from '../../../src/platforms/api.js';

configure({
  model: 'gpt-4o',
  platforms: { api: apiPlatform({ baseUrl: 'https://api.example.com' }) },
  stepTimeout: 15000,
  outputDir: 'copilot-test-results/api-testing',
});

const graphqlFeature = feature('GraphQL API')
  .description('GraphQL queries, mutations, and subscriptions')
  .tag('@api', '@graphql')

  .scenario('Execute GraphQL query')
  .tag('@smoke', '@query')
  .when('I send a POST request to /graphql')
  .withDocString(`{
  "query": "{ users { id name email } }"
}`)
  .then('the response status should be 200')
  .and('the response data should contain users array')
  .and('each user should have id, name, and email fields')

  .scenario('GraphQL query with variables')
  .tag('@query', '@variables')
  .when('I send a GraphQL query with variables')
  .withDocString(`{
  "query": "query GetUser($id: ID!) { user(id: $id) { id name email } }",
  "variables": { "id": "1" }
}`)
  .then('the response should contain the requested user')
  .and('the user data should match the queried fields')

  .scenario('GraphQL mutation creates resource')
  .tag('@mutation', '@create')
  .when('I send a GraphQL mutation')
  .withDocString(`{
  "query": "mutation CreateUser($input: UserInput!) { createUser(input: $input) { id name email } }",
  "variables": { "input": { "name": "New User", "email": "new@example.com" } }
}`)
  .then('the response should contain the created user')
  .and('the user should have a generated ID')

  .scenario('GraphQL query with nested fields')
  .tag('@query', '@nested')
  .when('I send a query requesting nested data')
  .withDocString(`{
  "query": "{ users { id name posts { id title comments { id text } } } }"
}`)
  .then('the response should include nested posts and comments')
  .and('the data structure should match the query')

  .scenario('GraphQL handles errors gracefully')
  .tag('@negative', '@errors')
  .when('I send an invalid GraphQL query')
  .withDocString(`{
  "query": "{ invalidField }"
}`)
  .then('the response should include errors array')
  .and('the error message should describe the issue')

  .done()
  ._build();

test(graphqlFeature, 'api');
export { graphqlFeature };
