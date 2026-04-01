---
platform: web
tags: [auth]
---

# Feature: User Authentication

Tests for user authentication flows

## Background
- Given the application is running at https://example.com
- And I am on the login page

## Scenario: Successful login with valid credentials
@smoke
- Given I have a valid account with username 'testuser' and password 'Test@123'
- When I enter my username 'testuser'
- And I enter my password 'Test@123'
- And I click the login button
- Then I should be redirected to the dashboard
- And I should see a welcome message with my username

## Scenario: Failed login with invalid credentials
@negative
- Given I have an invalid password 'wrongpassword'
- When I enter my username 'testuser'
- And I enter my password 'wrongpassword'
- And I click the login button
- Then I should see an error message 'Invalid credentials'
- And I should remain on the login page

## Scenario: Login form validation
@validation
- Given I am on the login page with empty fields
- When I click the login button without entering any credentials
- Then I should see validation errors for required fields
- And the username field should be highlighted as required
- And the password field should be highlighted as required
