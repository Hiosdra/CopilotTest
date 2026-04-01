---
platform: mobile
tags: [mobile, onboarding]
---

# Feature: Mobile App Onboarding

First-time user experience and app introduction

## Scenario: First-time user views welcome screens
@smoke @welcome
- Given the app is launched for the first time
- Then I should see the welcome screen
- And I should see app introduction slides
- When I swipe through the introduction slides
- Then I should see multiple feature highlights
- And I should see a "Get Started" button on the final slide

## Scenario: User completes onboarding flow
@smoke @complete
- Given I am on the onboarding welcome screen
- When I tap "Get Started"
- And I select my preferences
- And I grant necessary permissions
- And I complete the setup steps
- Then I should be taken to the main app screen
- And onboarding should not show again on next launch

## Scenario: User skips onboarding
@skip
- Given I am viewing the onboarding slides
- When I tap "Skip" button
- Then I should be taken directly to the main app
- And I should be able to access basic features

## Scenario: Onboarding requests app permissions
@permissions
- Given I am completing onboarding
- When the app requests camera permission
- And the app requests location permission
- Then I should see clear explanations for each permission
- And I should be able to allow or deny each permission
