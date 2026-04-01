---
platform: mobile
tags: [mobile, navigation]
---

# Feature: Mobile App Navigation

Navigation patterns, menus, and screen flows

## Scenario: User navigates using bottom navigation bar
@smoke @bottom-nav
- Given I am on the home screen
- When I tap the "Profile" icon in bottom navigation
- Then I should be taken to the profile screen
- When I tap the "Settings" icon
- Then I should be taken to the settings screen
- And the active tab should be highlighted

## Scenario: User opens and closes drawer menu
@drawer @menu
- Given I am on any screen
- When I swipe from left edge or tap menu icon
- Then the drawer menu should open
- And I should see all menu options
- When I tap outside the drawer or swipe to close
- Then the drawer should close

## Scenario: User navigates back using back button
@back-navigation
- Given I am on a detail screen
- When I tap the back button
- Then I should return to the previous screen
- And my previous scroll position should be preserved

## Scenario: Deep linking opens specific screen
@deep-link
- Given the app is not running
- When I open a deep link to a specific product
- Then the app should launch
- And I should be taken directly to that product screen

## Scenario: User navigates through tabs
@tabs
- Given I am viewing a screen with tabs
- When I swipe left to next tab
- Then the next tab content should be displayed
- When I tap on a specific tab
- Then that tab should become active
