---
platform: api
tags: [api, rest]
---

# Feature: REST API Integration

CRUD operations, authentication, and REST API best practices

## Scenario: GET request retrieves list of resources
@smoke @get
- Given the API is available
- When I send a GET request to /users
- Then the response status code should be 200
- And the response should be a JSON array
- And each item should have id, name, email fields
- And the response time should be less than 2000ms

## Scenario: GET request retrieves single resource by ID
@get @resource
- When I send a GET request to /users/1
- Then the response status should be 200
- And the response should contain user with id 1
- And the response should include all user fields

## Scenario: POST request creates new resource
@smoke @post @create
- Given I have new user data
- When I send a POST request to /users
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123"
  }
  ```
- Then the response status should be 201
- And the response should contain the created user
- And the response should include a generated ID
- And the Location header should point to the new resource

## Scenario: PUT request updates existing resource
@put @update
- Given a user with id 1 exists
- When I send a PUT request to /users/1
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123",
    "name": "Updated Name"
  }
  ```
- Then the response status should be 200
- And the response should reflect the updated data
- And the user name should be "Updated Name"

## Scenario: PATCH request partially updates resource
@patch @update
- When I send a PATCH request to /users/1
  ```json
  {
    "email": "newemail@example.com"
  }
  ```
- Then the response status should be 200
- And only the email field should be updated
- And other fields should remain unchanged

## Scenario: DELETE request removes resource
@delete
- Given a user with id 1 exists
- When I send a DELETE request to /users/1
- Then the response status should be 200 or 204
- When I try to GET /users/1
- Then the response status should be 404

## Scenario: GET request for non-existent resource returns 404
@negative @error-handling
- When I send a GET request to /users/99999
- Then the response status should be 404
- And the response should include error message

## Scenario: POST request with invalid data returns 400
@negative @validation
- When I send a POST request to /users with invalid data
  ```json
  {
    "invalid": "data"
  }
  ```
- Then the response status should be 400 or 422
- And the response should include validation errors

## Scenario: API request includes proper headers
@headers
- When I send a GET request to /users with Accept header "application/json"
- Then the response Content-Type should be "application/json"
- And the response should include proper CORS headers

## Scenario: API supports pagination
@pagination
- When I send a GET request to /posts?_page=1&_limit=10
- Then the response should contain 10 items
- And the response should include pagination metadata
- When I send request for page 2
- Then I should get the next set of results

## Scenario: API supports filtering
@filter @query
- When I send a GET request to /users?email=test@example.com
- Then the response should only include users matching the filter
- And all returned users should have the specified email

## Scenario: API supports sorting
@sort
- When I send a GET request to /users?_sort=name&_order=asc
- Then the users should be sorted by name in ascending order
- And the first user name should be alphabetically first
