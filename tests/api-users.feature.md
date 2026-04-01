---
platform: api
tags: [api, users]
---

# Feature: Users API

Tests for the Users REST API endpoints

## Scenario: List all users
@smoke
- Given the API is available at https://jsonplaceholder.typicode.com
- When I send a GET request to /users
- Then the response status code should be 200
- And the response body should be a JSON array
- And the array should contain at least 1 user

## Scenario: Create a new user
@create
- Given I have a new user payload
- When I send a POST request to /users
  ```json
  {
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com"
  }
  ```
- Then the response status code should be 201
- And the response body should contain the created user's id
- And the response body name should be 'John Doe'

## Scenario: Get non-existent user returns 404
@negative
- Given a user with id 99999 does not exist
- When I send a GET request to /users/99999
- Then the response status code should be 404
