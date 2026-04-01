---
platform: mobile
tags: [mobile, permissions, android]
---

# Feature: Mobile App Permissions

Runtime permissions and permission handling

## Scenario: App requests camera permission
@smoke @camera
- Given the app needs camera access
- When I trigger a feature requiring camera
- Then I should see a permission request dialog
- And the dialog should explain why camera is needed
- When I tap "Allow"
- Then the camera should be accessible
- And the feature should work as expected

## Scenario: User denies camera permission
@negative @denied
- Given a feature requires camera permission
- When the permission dialog appears
- And I tap "Deny"
- Then the app should handle denial gracefully
- And I should see a message explaining the limitation
- And I should see an option to enable it later in settings

## Scenario: App requests location permission
@location
- When I trigger a feature requiring location
- Then I should see location permission request
- When I choose "Allow only while using the app"
- Then the app should have foreground location access
- And location-based features should work

## Scenario: Request multiple permissions sequentially
@multiple
- Given a feature needs camera and storage permissions
- When I trigger the feature
- Then permissions should be requested one at a time
- And I should be able to grant or deny each
- And the app should work with granted permissions

## Scenario: User changes permission in system settings
@settings @permission-change
- Given I previously denied camera permission
- When I go to system settings
- And I enable camera permission for the app
- And I return to the app
- Then the app should detect the permission change
- And camera features should now be available
