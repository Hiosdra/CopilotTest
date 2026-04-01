---
platform: web
tags: [auth, e-commerce]
---

# Feature: E-Commerce User Authentication

Authentication and authorization flows for e-commerce customers

## Background
- Given the e-commerce website is available at https://demo.example-shop.com
- And I am not logged in

## Scenario: Customer logs in with valid credentials
@smoke @positive
- Given I have an account with username "customer1" and password "Customer@123"
- When I navigate to the login page
- And I enter username "customer1"
- And I enter password "Customer@123"
- And I click the Login button
- Then I should be redirected to the home page or my account dashboard
- And I should see a welcome message containing "John"
- And I should see the logout link in the navigation
- And the shopping cart icon should be visible

## Scenario: Login fails with incorrect password
@negative @security
- Given I have an account with username "customer1"
- When I navigate to the login page
- And I enter username "customer1"
- And I enter an incorrect password "WrongPassword123!"
- And I click the Login button
- Then I should remain on the login page
- And I should see an error message indicating invalid credentials
- And I should not be logged in

## Scenario: Login fails with non-existent username
@negative
- Given I do not have an account
- When I navigate to the login page
- And I enter username "nonexistent_user"
- And I enter password "SomePassword123!"
- And I click the Login button
- Then I should see an error message indicating invalid credentials
- And I should remain on the login page

## Scenario: Login form validates required fields
@validation
- Given I am on the login page
- When I leave the username field empty
- And I leave the password field empty
- And I click the Login button
- Then I should see validation errors for both username and password fields
- And the form should not be submitted

## Scenario: Remember me checkbox persists session
@session
- Given I have credentials for user "customer1"
- When I navigate to the login page
- And I enter username "customer1"
- And I enter password "Customer@123"
- And I check the "Remember me" checkbox
- And I click the Login button
- Then I should be logged in successfully
- When I close the browser and reopen it
- And I navigate to the website
- Then I should still be logged in

## Scenario: Customer logs out successfully
@smoke
- Given I am logged in as "customer1"
- When I click the logout button in the navigation
- Then I should be redirected to the home page or login page
- And I should not see the welcome message
- And I should see the login link
- And my session should be terminated

## Scenario: New customer registers successfully
@registration @positive
- Given I am on the registration page
- When I enter username "newuser"
- And I enter email "newuser@example.com"
- And I enter password "NewUser@789"
- And I enter password confirmation "NewUser@789"
- And I enter first name "Mike"
- And I enter last name "Johnson"
- And I accept the terms and conditions
- And I click the Register button
- Then I should see a success message
- And I should be logged in automatically or redirected to login
- And a confirmation email should be sent

## Scenario: Registration fails with invalid email
@registration @negative @validation
- Given I am on the registration page
- When I enter username "testuser"
- And I enter an invalid email "notanemail"
- And I enter password "ValidPass123!"
- And I click the Register button
- Then I should see an error message about invalid email format
- And the registration should not be completed

## Scenario: Customer requests password reset
@password-reset
- Given I am on the login page
- When I click the "Forgot password?" link
- Then I should be taken to the password reset page
- When I enter my email "customer1@example.com"
- And I click the "Send reset link" button
- Then I should see a confirmation message
- And a password reset email should be sent

## Scenario: Admin user accesses admin dashboard
@admin @authorization
- Given I am logged in as admin user "admin"
- When I navigate to the admin dashboard
- Then I should have access to the admin panel
- And I should see admin-specific features like user management
- And I should see inventory management options
