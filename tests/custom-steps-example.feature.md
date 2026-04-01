---
platform: web
tags: [example, custom-steps]
---

# Feature: Hybrid Testing

Demonstrates mixing custom step definitions with AI-driven steps

## Background
- Given the database is clean
- And I have a valid API token

## Scenario: Admin login with custom steps
@smoke
- Given I login as "admin" with password "admin123"
- When I click on the profile menu
- Then I should see my username

## Scenario: User registration with mixed steps
- Given I am on the registration page
- When I fill the form with the following data
  | field | value |
  |-------|-------|
  | username | newuser |
  | email | newuser@example.com |
  | password | securepass123 |
- And I click the Register button
- Then I should see a welcome message
- And I should receive a confirmation email

## Scenario: Dashboard access
- Given I login as "user" with password "user123"
- When I navigate to the dashboard
- Then I should see my recent activity
- And I should see the analytics widget
