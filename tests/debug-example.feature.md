---
platform: web
---

# Feature: User Login

Test various login scenarios with debug capabilities

## Scenario: Successful admin login
- Given I am on the login page
- When I enter username 'admin' and password 'secret123'
- And I click the login button
- Then I should be redirected to the dashboard
- And I should see 'Welcome Admin' message

## Scenario: Failed login with invalid credentials
@debug
- Given I am on the login page
- When I enter username 'invalid' and password 'wrong'
- And I click the login button
- Then I should see an error message
- And I should remain on the login page

## Scenario: Complete purchase flow
- Given I have items in my cart
- When I proceed to checkout
- And I enter shipping information
- And I enter payment details
- And I click the submit button
- Then I should see a confirmation message
- And I should receive an order number
