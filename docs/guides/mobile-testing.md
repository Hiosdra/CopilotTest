# Mobile Testing Guide

Comprehensive guide to mobile application testing with CopilotTest using the Android Emulator MCP server.

## Overview

CopilotTest uses the Android Emulator MCP server to automate mobile app interactions. The AI interprets your test steps and uses ADB (Android Debug Bridge) to interact with Android applications.

## Prerequisites

- **Android SDK** installed
- **Android Emulator** or physical device
- **ADB** (Android Debug Bridge) in your PATH
- App APK installed on device/emulator

### Verify Setup

```bash
# Check ADB is available
adb devices

# Should show connected devices:
# List of devices attached
# emulator-5554   device
```

## Configuration

### Basic Setup

```yaml
# copilot-test.config.yaml
model: gpt-4o
platforms:
  mobile:
    platform: mobile
    device: emulator-5554              # Device ID from 'adb devices'
    appPackage: com.example.myapp      # App package name
    appActivity: .MainActivity         # Main activity
```

### Multiple Devices

```yaml
platforms:
  mobile_emulator:
    platform: mobile
    device: emulator-5554
    appPackage: com.example.myapp
  mobile_real_device:
    platform: mobile
    device: ABCD123456      # Physical device ID
    appPackage: com.example.myapp
```

### AVD (Android Virtual Device)

```yaml
platforms:
  mobile:
    platform: mobile
    avd: Pixel_6_API_33       # AVD name
    appPackage: com.example.myapp
    appActivity: .MainActivity
```

## Common Mobile Testing Patterns

### App Launch

```markdown
## Scenario: Launch app
- Given the app is installed
- When I launch the app
- Then I should see the home screen
- And the app title should be visible
```

### Tapping Elements

```markdown
## Scenario: Tap button
- Given the app is launched
- When I tap the "Login" button
- Then I should see the login screen

## Scenario: Tap by coordinates
- Given the app is launched
- When I tap at coordinates (500, 800)
- Then the action should be performed
```

### Text Input

```markdown
## Scenario: Enter text in field
- Given I am on the login screen
- When I tap the username field
- And I enter "john@example.com"
- And I tap the password field
- And I enter "password123"
- And I tap the "Sign In" button
- Then I should see the dashboard
```

### Swipe Gestures

```markdown
## Scenario: Swipe to refresh
- Given I am on the home screen
- When I swipe down from the top
- Then the content should refresh
- And I should see updated data

## Scenario: Swipe between tabs
- Given I am viewing tab 1
- When I swipe left
- Then I should see tab 2

## Scenario: Dismiss notification
- Given a notification is visible
- When I swipe right on the notification
- Then the notification should be dismissed
```

### Scrolling

```markdown
## Scenario: Scroll down list
- Given I am viewing a long list
- When I scroll down
- Then I should see more items
- And the "Load More" button should be visible

## Scenario: Scroll to element
- Given I am viewing a long list
- When I scroll until I see "Item 50"
- Then "Item 50" should be visible
```

### Long Press

```markdown
## Scenario: Long press for context menu
- Given I am viewing a message
- When I long press on the message
- Then a context menu should appear
- And I should see options "Copy", "Delete", "Forward"
```

## App Navigation

### Back Button

```markdown
## Scenario: Navigate back
- Given I am on the details screen
- When I press the back button
- Then I should return to the list screen
```

### Home Button

```markdown
## Scenario: Go to home screen
- Given the app is open
- When I press the home button
- Then I should see the device home screen
- And the app should be in the background
```

### Recent Apps

```markdown
## Scenario: Switch between apps
- Given multiple apps are running
- When I press the recent apps button
- Then I should see the list of recent apps
- When I tap on "Browser"
- Then the browser app should open
```

### Deep Links

```markdown
## Scenario: Open app with deep link
- Given the app supports deep links
- When I open the deep link "myapp://profile/123"
- Then the app should launch
- And I should see the profile page for user 123
```

## Authentication Testing

### Login Flow

```markdown
---
platform: mobile
tags: [mobile, auth]
---

# Feature: Authentication

## Scenario: Successful login
@mobile @auth
- Given I have launched the app
- And I am on the login screen
- When I enter email "john@example.com"
- And I enter password "SecurePass123"
- And I tap "Sign In"
- Then I should see the home screen
- And I should see "Welcome, John"

## Scenario: Login with invalid credentials
@mobile @auth @negative
- Given I am on the login screen
- When I enter email "john@example.com"
- And I enter password "WrongPassword"
- And I tap "Sign In"
- Then I should see an error "Invalid credentials"
- And I should remain on the login screen

## Scenario: Logout
- Given I am logged in
- When I tap the menu icon
- And I tap "Logout"
- Then I should see a confirmation dialog
- When I tap "Confirm"
- Then I should be redirected to the login screen
```

### Biometric Authentication

```markdown
## Scenario: Login with fingerprint
- Given I am on the login screen
- And biometric authentication is enabled
- When I tap "Use Fingerprint"
- Then the fingerprint prompt should appear
- When I authenticate with fingerprint
- Then I should be logged in
- And I should see the home screen
```

## Form Testing

### Multi-Step Form

```markdown
## Scenario: Complete registration
- Given I am on the registration screen

<!-- Step 1: Personal Info -->
- When I enter name "John Doe"
- And I enter email "john@example.com"
- And I tap "Next"
- Then I should see the address form

<!-- Step 2: Address -->
- When I enter street "123 Main St"
- And I enter city "Springfield"
- And I enter zip "12345"
- And I tap "Next"
- Then I should see the confirmation screen

<!-- Step 3: Confirm -->
- When I tap "Register"
- Then I should see "Registration successful"
- And I should be redirected to the home screen
```

### Date/Time Picker

```markdown
## Scenario: Select date of birth
- Given I am on the profile form
- When I tap the "Date of Birth" field
- Then a date picker should appear
- When I select January 15, 1990
- And I tap "Done"
- Then the date field should show "01/15/1990"
```

### Dropdown/Spinner

```markdown
## Scenario: Select country
- Given I am on the registration form
- When I tap the country dropdown
- Then a list of countries should appear
- When I select "United States"
- Then the dropdown should show "United States"
```

## List and RecyclerView

### Infinite Scroll

```markdown
## Scenario: Load more items
- Given I am viewing a list of items
- When I scroll to the bottom
- Then more items should load
- And I should see a loading indicator
- And the new items should appear
```

### Pull to Refresh

```markdown
## Scenario: Refresh content
- Given I am on the home feed
- When I pull down from the top
- Then I should see a refresh indicator
- And the content should reload
- And I should see updated items
```

### Item Selection

```markdown
## Scenario: Select list item
- Given I am viewing a list of products
- When I tap on "Product ABC"
- Then I should see the product details
- And the product name should be "Product ABC"
- And I should see the price and description
```

## Permissions

### Request Permission

```markdown
## Scenario: Request location permission
- Given the app needs location access
- When I navigate to the map screen
- Then a permission dialog should appear
- And the dialog should request "Location access"
- When I tap "Allow"
- Then the map should show my location

## Scenario: Deny permission
- Given the app requests camera permission
- When the permission dialog appears
- And I tap "Deny"
- Then I should see a message "Camera access required"
- And the camera should not activate
```

## Notifications

### Local Notifications

```markdown
## Scenario: Receive local notification
- Given I have scheduled a reminder
- When the reminder time arrives
- Then I should see a notification
- And the notification should show "Time for your meeting"
- When I tap the notification
- Then the app should open to the meeting details
```

### Push Notifications

```markdown
## Scenario: Receive push notification
- Given the app is in the background
- When a push notification is sent
- Then the notification should appear in the status bar
- When I pull down the notification shade
- Then I should see the notification
- When I tap the notification
- Then the app should open to the relevant content
```

## Camera and Gallery

### Take Photo

```markdown
## Scenario: Capture profile picture
- Given I am on the profile edit screen
- When I tap "Change Photo"
- And I select "Take Photo"
- Then the camera should open
- When I take a photo
- And I tap "Use Photo"
- Then the profile picture should be updated
```

### Select from Gallery

```markdown
## Scenario: Select image from gallery
- Given I am creating a post
- When I tap "Add Image"
- And I select "Choose from Gallery"
- Then the gallery should open
- When I select an image
- Then the image should be added to the post
```

## Device Features

### Rotate Device

```markdown
## Scenario: Landscape orientation
- Given the app is in portrait mode
- When I rotate the device to landscape
- Then the app should adapt to landscape layout
- And all content should be visible
```

### Network Conditions

```markdown
## Scenario: Offline mode
- Given the app is connected
- When I disable network connectivity
- Then I should see "No internet connection"
- And cached content should still be available

## Scenario: Slow network
- Given the network is slow
- When I load content
- Then I should see a loading indicator
- And the content should eventually load
```

## Complete App Flow Examples

### Onboarding

```markdown
---
platform: mobile
tags: [mobile, onboarding]
---

# Feature: App Onboarding

## Scenario: First-time user onboarding
@mobile @onboarding
- Given I am launching the app for the first time
- Then I should see the welcome screen
- When I swipe left
- Then I should see the features screen
- When I swipe left
- Then I should see the permissions screen
- When I tap "Get Started"
- Then I should see the registration screen
```

### E-commerce Checkout

```markdown
---
platform: mobile
tags: [mobile, e2e]
---

# Feature: Shopping Cart

## Scenario: Complete purchase
@mobile @e2e
- Given I am logged in
- And I have added a product to my cart
- When I tap the cart icon
- Then I should see my cart with 1 item
- When I tap "Proceed to Checkout"
- Then I should see the checkout screen
- When I enter shipping address
- And I tap "Continue"
- Then I should see payment options
- When I select "Credit Card"
- And I enter card details
- And I tap "Place Order"
- Then I should see "Order placed successfully"
- And I should receive an order number
```

### Social Media Post

```markdown
---
platform: mobile
---

# Feature: Social Feed

## Scenario: Create post with image
- Given I am on the home feed
- When I tap the "Create Post" button
- Then I should see the post creation screen
- When I enter "Check out this view!" in the text field
- And I tap "Add Photo"
- And I select a photo from the gallery
- Then the photo should appear in the post preview
- When I tap "Post"
- Then I should see "Post created successfully"
- And I should return to the home feed
- And my post should appear at the top of the feed
```

## Testing Best Practices

### 1. Wait for Elements

Mobile apps often have animations and loading states:

```markdown
- When I tap "Load Data"
- Then I should see a loading spinner
- And I wait for the data to load
- And the list should contain items
```

### 2. Test Different Screen Sizes

```yaml
# Test on different devices by creating separate configs or platform entries:
platforms:
  pixel6:
    platform: mobile
    avd: Pixel_6_API_33
    appPackage: com.example.myapp
  tablet:
    platform: mobile
    avd: Pixel_Tablet_API_33
    appPackage: com.example.myapp
```

Run tests against specific platforms: `copilot-test run --platform pixel6`

### 3. Test Orientation Changes

```markdown
## Scenario: Support both orientations
- Given the app is in portrait mode
- And I am viewing content
- When I rotate to landscape
- Then the content should remain accessible
- And the layout should adapt
```

### 4. Handle System Interruptions

```markdown
## Scenario: Incoming call interruption
- Given the app is active
- When an incoming call arrives
- And I answer the call
- And I end the call
- Then the app should resume where I left off
```

## Debugging Mobile Tests

### Enable ADB Logging

```bash
# View device logs
adb logcat | grep MyApp

# View current screen hierarchy
adb shell uiautomator dump /sdcard/window_dump.xml
adb pull /sdcard/window_dump.xml
```

### Screenshot on Failure

```yaml
# copilot-test.config.yaml
screenshotOnFailure: true
```

### Slow Down Animations

```bash
# Disable animations for faster testing
adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global animator_duration_scale 0
```

## Performance Testing

### App Launch Time

```markdown
## Scenario: App launches quickly
- When I launch the app
- Then the app should launch in less than 3 seconds
- And the home screen should be visible
```

### Memory Usage

```markdown
## Scenario: App handles memory efficiently
- Given the app is running
- When I navigate through multiple screens
- Then memory usage should remain stable
- And no memory leaks should occur
```

## Next Steps

- [Web Testing Guide](./web-testing.md) - Test web applications
- [API Testing Guide](./api-testing.md) - Test REST APIs
- [Best Practices](./best-practices.md) - Write better tests
- [Custom Steps](../CUSTOM_STEPS.md) - Create reusable mobile steps
