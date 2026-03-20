/**
 * SaaS User Registration Tests
 * Comprehensive registration, onboarding, and email verification scenarios.
 */

import { configure, feature, test } from '../../../src/index.js';
import { webPlatform } from '../../../src/platforms/web.js';

configure({
  model: 'gpt-4o',
  platforms: { web: webPlatform({ browser: 'chromium', headless: true }) },
  baseUrl: 'https://app.example-saas.com',
  stepTimeout: 30000,
  outputDir: 'copilot-test-results/saas-app',
});

const registrationFeature = feature('SaaS User Registration')
  .description('User sign-up, onboarding, and account activation')
  .tag('@saas', '@registration')

  .background()
  .given('the SaaS application is available')

  .scenario('New user completes registration successfully')
  .tag('@smoke', '@happy-path')
  .when('I navigate to the sign-up page')
  .and('I enter email "newuser@example.com"')
  .and('I enter password "SecurePass@123"')
  .and('I enter company name "My Startup"')
  .and('I accept terms and conditions')
  .and('I click "Create Account"')
  .then('I should see a success message')
  .and('I should receive a verification email')
  .and('I should be on the email verification pending page')

  .scenario('User verifies email and completes onboarding')
  .tag('@onboarding', '@email-verification')
  .given('I have created an account but not verified email')
  .when('I click the verification link in the email')
  .then('my email should be verified')
  .and('I should be taken to the onboarding flow')
  .when('I complete the onboarding steps')
  .and('I set my preferences')
  .then('I should be redirected to the dashboard')

  .scenario('Registration fails with existing email')
  .tag('@negative', '@validation')
  .when('I try to register with email "existing@example.com"')
  .and('I enter password and other details')
  .and('I submit the form')
  .then('I should see an error "Email already exists"')
  .and('I should remain on the registration page')

  .scenario('Registration validates password strength')
  .tag('@security', '@validation')
  .when('I try to register with weak password "123"')
  .then('I should see password strength requirements')
  .and('registration should be prevented')
  .when('I enter a strong password meeting requirements')
  .then('the validation should pass')

  .scenario('Social sign-up with Google')
  .tag('@oauth', '@social-auth')
  .when('I click "Sign up with Google"')
  .and('I authenticate with Google')
  .then('my account should be created automatically')
  .and('I should be logged in')
  .and('I should skip email verification')

  .done()
  ._build();

test(registrationFeature, 'web');
export { registrationFeature };
