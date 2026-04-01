---
platform: api
tags: [api]
---

# Feature: User Management API

Tests for user CRUD operations with cross-step data sharing

## Scenario: Create and verify user with context
@context-demo @smoke
- Given I have a JSON API at https://jsonplaceholder.typicode.com
- When I create a new user with name 'Alice' and email 'alice@example.com'
- And I store the user ID in context for later use
- Then the response status should be 201
- And I should receive the created user data
- When I fetch the user using the ID from context
- Then the response status should be 200
- And the user details should match the expected data

## Scenario: Login and use auth token
@auth
- Given I have an authentication API
- When I login with username 'testuser' and password 'testpass'
- Then I receive an authentication token
- And the token is stored in context
- When I make an authenticated request using the token from context
- Then the request should succeed
- And I should see my user profile data

## Scenario: Add items and checkout
- Given I have an e-commerce API
- When I create a new cart
- Then I receive a cart ID
- When I add product with ID 'prod-1' to the cart
- Then the item is added successfully
- When I add product with ID 'prod-2' to the cart
- Then the second item is added successfully
- When I view my cart using the cart ID from context
- Then I should see 2 items in the cart
- When I proceed to checkout with the cart ID
- Then the order is created successfully
- And I receive an order confirmation with ID
