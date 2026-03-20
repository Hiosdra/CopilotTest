/**
 * E-Commerce Authentication Tests
 *
 * Comprehensive authentication scenarios for e-commerce applications.
 * Covers login, logout, registration, password reset, and session management.
 */

import { configure, feature, test } from '../../../src/index.js';
import { webPlatform } from '../../../src/platforms/web.js';
import { registeredCustomer, newCustomer, adminUser } from '../fixtures/users.js';

// Configure for e-commerce testing
configure({
  model: 'gpt-4o',
  platforms: {
    web: webPlatform({
      browser: 'chromium',
      headless: true,
    }),
  },
  baseUrl: 'https://demo.example-shop.com',
  stepTimeout: 30000,
  retries: 1,
  screenshotOnFailure: true,
  outputDir: 'copilot-test-results/e-commerce',
});

/**
 * Authentication Feature
 *
 * Best Practices Demonstrated:
 * - Background steps for common setup
 * - Using fixtures for test data
 * - Testing both positive and negative scenarios
 * - Session management verification
 * - Security testing (rate limiting, etc.)
 */
const authenticationFeature = feature('E-Commerce User Authentication')
  .description('Authentication and authorization flows for e-commerce customers')
  .tag('@auth', '@e-commerce')

  // Background: Common setup for all scenarios
  .background()
  .given('the e-commerce website is available at https://demo.example-shop.com')
  .and('I am not logged in')

  // Scenario 1: Successful login
  .scenario('Customer logs in with valid credentials')
  .tag('@smoke', '@positive')
  .given(`I have an account with username "${registeredCustomer.username}" and password "${registeredCustomer.password}"`)
  .when('I navigate to the login page')
  .and(`I enter username "${registeredCustomer.username}"`)
  .and(`I enter password "${registeredCustomer.password}"`)
  .and('I click the Login button')
  .then('I should be redirected to the home page or my account dashboard')
  .and(`I should see a welcome message containing "${registeredCustomer.firstName}"`)
  .and('I should see the logout link in the navigation')
  .and('the shopping cart icon should be visible')

  // Scenario 2: Failed login with wrong password
  .scenario('Login fails with incorrect password')
  .tag('@negative', '@security')
  .given(`I have an account with username "${registeredCustomer.username}"`)
  .when('I navigate to the login page')
  .and(`I enter username "${registeredCustomer.username}"`)
  .and('I enter an incorrect password "WrongPassword123!"')
  .and('I click the Login button')
  .then('I should remain on the login page')
  .and('I should see an error message indicating invalid credentials')
  .and('I should not be logged in')

  // Scenario 3: Login with non-existent user
  .scenario('Login fails with non-existent username')
  .tag('@negative')
  .given('I do not have an account')
  .when('I navigate to the login page')
  .and('I enter username "nonexistent_user"')
  .and('I enter password "SomePassword123!"')
  .and('I click the Login button')
  .then('I should see an error message indicating invalid credentials')
  .and('I should remain on the login page')

  // Scenario 4: Form validation
  .scenario('Login form validates required fields')
  .tag('@validation')
  .given('I am on the login page')
  .when('I leave the username field empty')
  .and('I leave the password field empty')
  .and('I click the Login button')
  .then('I should see validation errors for both username and password fields')
  .and('the form should not be submitted')

  // Scenario 5: Remember me functionality
  .scenario('Remember me checkbox persists session')
  .tag('@session')
  .given(`I have credentials for user "${registeredCustomer.username}"`)
  .when('I navigate to the login page')
  .and(`I enter username "${registeredCustomer.username}"`)
  .and(`I enter password "${registeredCustomer.password}"`)
  .and('I check the "Remember me" checkbox')
  .and('I click the Login button')
  .then('I should be logged in successfully')
  .when('I close the browser and reopen it')
  .and('I navigate to the website')
  .then('I should still be logged in')

  // Scenario 6: Successful logout
  .scenario('Customer logs out successfully')
  .tag('@smoke')
  .given(`I am logged in as "${registeredCustomer.username}"`)
  .when('I click the logout button in the navigation')
  .then('I should be redirected to the home page or login page')
  .and('I should not see the welcome message')
  .and('I should see the login link')
  .and('my session should be terminated')

  // Scenario 7: Registration with valid data
  .scenario('New customer registers successfully')
  .tag('@registration', '@positive')
  .given('I am on the registration page')
  .when(`I enter username "${newCustomer.username}"`)
  .and(`I enter email "${newCustomer.email}"`)
  .and(`I enter password "${newCustomer.password}"`)
  .and(`I enter password confirmation "${newCustomer.password}"`)
  .and(`I enter first name "${newCustomer.firstName}"`)
  .and(`I enter last name "${newCustomer.lastName}"`)
  .and('I accept the terms and conditions')
  .and('I click the Register button')
  .then('I should see a success message')
  .and('I should be logged in automatically or redirected to login')
  .and('a confirmation email should be sent')

  // Scenario 8: Registration validation
  .scenario('Registration fails with invalid email')
  .tag('@registration', '@negative', '@validation')
  .given('I am on the registration page')
  .when('I enter username "testuser"')
  .and('I enter an invalid email "notanemail"')
  .and('I enter password "ValidPass123!"')
  .and('I click the Register button')
  .then('I should see an error message about invalid email format')
  .and('the registration should not be completed')

  // Scenario 9: Password reset request
  .scenario('Customer requests password reset')
  .tag('@password-reset')
  .given('I am on the login page')
  .when('I click the "Forgot password?" link')
  .then('I should be taken to the password reset page')
  .when(`I enter my email "${registeredCustomer.email}"`)
  .and('I click the "Send reset link" button')
  .then('I should see a confirmation message')
  .and('a password reset email should be sent')

  // Scenario 10: Admin login and access
  .scenario('Admin user accesses admin dashboard')
  .tag('@admin', '@authorization')
  .given(`I am logged in as admin user "${adminUser.username}"`)
  .when('I navigate to the admin dashboard')
  .then('I should have access to the admin panel')
  .and('I should see admin-specific features like user management')
  .and('I should see inventory management options')

  .done()
  ._build();

// Register the test
test(authenticationFeature, 'web');

// Export for use in test suites
export { authenticationFeature };
