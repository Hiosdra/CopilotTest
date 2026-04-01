---
platform: mobile
tags: [onboarding, mobile]
---

# Feature: App Onboarding

Tests for the initial app onboarding experience

## Scenario: Complete onboarding flow for a new user
@smoke
- Given the app is installed and launched for the first time
- And I am on the welcome screen
- When I tap the 'Get Started' button
- Then I should see the permissions screen
- When I grant notification permissions
- And I grant location permissions
- Then I should see the account creation screen
- When I enter my name 'Jane Smith'
- And I enter my email 'jane@example.com'
- And I tap the 'Create Account' button
- Then I should see the home screen
- And I should see a welcome message for 'Jane Smith'
- And the onboarding should be marked as complete
