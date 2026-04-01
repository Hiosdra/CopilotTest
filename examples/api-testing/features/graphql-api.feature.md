---
platform: api
tags: [api, graphql]
---

# Feature: GraphQL API

GraphQL queries, mutations, and subscriptions

## Scenario: Execute GraphQL query
@smoke @query
- When I send a POST request to /graphql
  ```json
  {
    "query": "{ users { id name email } }"
  }
  ```
- Then the response status should be 200
- And the response data should contain users array
- And each user should have id, name, and email fields

## Scenario: GraphQL query with variables
@query @variables
- When I send a GraphQL query with variables
  ```json
  {
    "query": "query GetUser($id: ID!) { user(id: $id) { id name email } }",
    "variables": { "id": "1" }
  }
  ```
- Then the response should contain the requested user
- And the user data should match the queried fields

## Scenario: GraphQL mutation creates resource
@mutation @create
- When I send a GraphQL mutation
  ```json
  {
    "query": "mutation CreateUser($input: UserInput!) { createUser(input: $input) { id name email } }",
    "variables": { "input": { "name": "New User", "email": "new@example.com" } }
  }
  ```
- Then the response should contain the created user
- And the user should have a generated ID

## Scenario: GraphQL query with nested fields
@query @nested
- When I send a query requesting nested data
  ```json
  {
    "query": "{ users { id name posts { id title comments { id text } } } }"
  }
  ```
- Then the response should include nested posts and comments
- And the data structure should match the query

## Scenario: GraphQL handles errors gracefully
@negative @errors
- When I send an invalid GraphQL query
  ```json
  {
    "query": "{ invalidField }"
  }
  ```
- Then the response should include errors array
- And the error message should describe the issue
