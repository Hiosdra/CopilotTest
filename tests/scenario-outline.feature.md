---
platform: web
---

# Feature: Scenario Outline Examples

Demonstrates parameterized testing with scenario outlines

## Scenario Outline: Login with different credentials
@auth @parameterized
- Given I am on the login page
- When I enter username "<username>" and password "<password>"
- And I click the Login button
- Then I should see "<message>"

| username | password | message |
|----------|----------|---------|
| admin | admin123 | Welcome Admin |
| user | user123 | Welcome User |
| guest | guest123 | Welcome Guest |
| invalid | wrong | Invalid credentials |
| | | Please fill all fields |

## Scenario Outline: Search with different queries
@search
- Given I am on the search page
- When I search for "<query>"
- Then I should see "<expectedCount>" results
- And the results should contain "<keyword>"

| query | expectedCount | keyword |
|-------|---------------|---------|
| typescript | 10 | TypeScript |
| javascript | 15 | JavaScript |
| python | 8 | Python |

## Scenario Outline: Validate email field
- Given I am on the registration form
- When I enter email "<email>"
- And I submit the form
- Then I should see validation message "<validationMessage>"

| email | validationMessage |
|-------|-------------------|
| valid@example.com | Email is valid |
| invalid.email | Please enter a valid email |
| @example.com | Please enter a valid email |
| | Email is required |

## Scenario: Add single item to cart
- Given I am on the product page
- When I click Add to Cart
- Then I should see 1 item in cart

## Scenario Outline: Add multiple quantities
- Given I am on the product page
- When I select quantity "<quantity>"
- And I click Add to Cart
- Then I should see "<quantity>" items in cart

| quantity |
|----------|
| 2 |
| 5 |
| 10 |
