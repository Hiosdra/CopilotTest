---
platform: web
tags: [saas, registration]
---

# Feature: SaaS User Registration

User sign-up, onboarding, and account activation

## Background
- Given the SaaS application is available

## Scenario: New user completes registration successfully
@smoke @happy-path
- When I navigate to the sign-up page
- And I enter email "newuser@example.com"
- And I enter password "SecurePass@123"
- And I enter company name "My Startup"
- And I accept terms and conditions
- And I click "Create Account"
- Then I should see a success message
- And I should receive a verification email
- And I should be on the email verification pending page

## Scenario: User verifies email and completes onboarding
@onboarding @email-verification
- Given I have created an account but not verified email
- When I click the verification link in the email
- Then my email should be verified
- And I should be taken to the onboarding flow
- When I complete the onboarding steps
- And I set my preferences
- Then I should be redirected to the dashboard

## Scenario: Registration fails with existing email
@negative @validation
- When I try to register with email "existing@example.com"
- And I enter password and other details
- And I submit the form
- Then I should see an error "Email already exists"
- And I should remain on the registration page

## Scenario: Registration validates password strength
@security @validation
- When I try to register with weak password "123"
- Then I should see password strength requirements
- And registration should be prevented
- When I enter a strong password meeting requirements
- Then the validation should pass

## Scenario: Social sign-up with Google
@oauth @social-auth
- When I click "Sign up with Google"
- And I authenticate with Google
- Then my account should be created automatically
- And I should be logged in
- And I should skip email verification
