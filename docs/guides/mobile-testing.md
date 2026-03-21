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

```typescript
import { configure, mobilePlatform } from 'copilot-test';

configure({
  model: 'gpt-4o',
  platforms: {
    mobile: mobilePlatform({
      device: 'emulator-5554',              // Device ID from 'adb devices'
      appPackage: 'com.example.myapp',      // App package name
      appActivity: '.MainActivity'          // Main activity
    })
  }
});
```

### Multiple Devices

```typescript
configure({
  platforms: {
    mobile_emulator: mobilePlatform({
      device: 'emulator-5554',
      appPackage: 'com.example.myapp'
    }),
    mobile_real_device: mobilePlatform({
      device: 'ABCD123456',  // Physical device ID
      appPackage: 'com.example.myapp'
    })
  }
});
```

### AVD (Android Virtual Device)

```typescript
configure({
  platforms: {
    mobile: mobilePlatform({
      avd: 'Pixel_6_API_33',  // AVD name
      appPackage: 'com.example.myapp',
      appActivity: '.MainActivity'
    })
  }
});
```

## Common Mobile Testing Patterns

### App Launch

```typescript
.scenario('Launch app')
  .given('the app is installed')
  .when('I launch the app')
  .then('I should see the home screen')
  .and('the app title should be visible')
  .done()
```

### Tapping Elements

```typescript
.scenario('Tap button')
  .given('the app is launched')
  .when('I tap the "Login" button')
  .then('I should see the login screen')
  .done()

.scenario('Tap by coordinates')
  .given('the app is launched')
  .when('I tap at coordinates (500, 800)')
  .then('the action should be performed')
  .done()
```

### Text Input

```typescript
.scenario('Enter text in field')
  .given('I am on the login screen')
  .when('I tap the username field')
  .and('I enter "john@example.com"')
  .and('I tap the password field')
  .and('I enter "password123"')
  .and('I tap the "Sign In" button')
  .then('I should see the dashboard')
  .done()
```

### Swipe Gestures

```typescript
.scenario('Swipe to refresh')
  .given('I am on the home screen')
  .when('I swipe down from the top')
  .then('the content should refresh')
  .and('I should see updated data')
  .done()

.scenario('Swipe between tabs')
  .given('I am viewing tab 1')
  .when('I swipe left')
  .then('I should see tab 2')
  .done()

.scenario('Dismiss notification')
  .given('a notification is visible')
  .when('I swipe right on the notification')
  .then('the notification should be dismissed')
  .done()
```

### Scrolling

```typescript
.scenario('Scroll down list')
  .given('I am viewing a long list')
  .when('I scroll down')
  .then('I should see more items')
  .and('the "Load More" button should be visible')
  .done()

.scenario('Scroll to element')
  .given('I am viewing a long list')
  .when('I scroll until I see "Item 50"')
  .then('"Item 50" should be visible')
  .done()
```

### Long Press

```typescript
.scenario('Long press for context menu')
  .given('I am viewing a message')
  .when('I long press on the message')
  .then('a context menu should appear')
  .and('I should see options "Copy", "Delete", "Forward"')
  .done()
```

## App Navigation

### Back Button

```typescript
.scenario('Navigate back')
  .given('I am on the details screen')
  .when('I press the back button')
  .then('I should return to the list screen')
  .done()
```

### Home Button

```typescript
.scenario('Go to home screen')
  .given('the app is open')
  .when('I press the home button')
  .then('I should see the device home screen')
  .and('the app should be in the background')
  .done()
```

### Recent Apps

```typescript
.scenario('Switch between apps')
  .given('multiple apps are running')
  .when('I press the recent apps button')
  .then('I should see the list of recent apps')
  .when('I tap on "Browser"')
  .then('the browser app should open')
  .done()
```

### Deep Links

```typescript
.scenario('Open app with deep link')
  .given('the app supports deep links')
  .when('I open the deep link "myapp://profile/123"')
  .then('the app should launch')
  .and('I should see the profile page for user 123')
  .done()
```

## Authentication Testing

### Login Flow

```typescript
feature('Authentication')
  .scenario('Successful login')
    .tag('@mobile', '@auth')
    .given('I have launched the app')
    .and('I am on the login screen')
    .when('I enter email "john@example.com"')
    .and('I enter password "SecurePass123"')
    .and('I tap "Sign In"')
    .then('I should see the home screen')
    .and('I should see "Welcome, John"')
    .done()

  .scenario('Login with invalid credentials')
    .tag('@mobile', '@auth', '@negative')
    .given('I am on the login screen')
    .when('I enter email "john@example.com"')
    .and('I enter password "WrongPassword"')
    .and('I tap "Sign In"')
    .then('I should see an error "Invalid credentials"')
    .and('I should remain on the login screen')
    .done()

  .scenario('Logout')
    .given('I am logged in')
    .when('I tap the menu icon')
    .and('I tap "Logout"')
    .then('I should see a confirmation dialog')
    .when('I tap "Confirm"')
    .then('I should be redirected to the login screen')
    .done()
  ._build();
```

### Biometric Authentication

```typescript
.scenario('Login with fingerprint')
  .given('I am on the login screen')
  .and('biometric authentication is enabled')
  .when('I tap "Use Fingerprint"')
  .then('the fingerprint prompt should appear')
  .when('I authenticate with fingerprint')
  .then('I should be logged in')
  .and('I should see the home screen')
  .done()
```

## Form Testing

### Multi-Step Form

```typescript
.scenario('Complete registration')
  .given('I am on the registration screen')

  // Step 1: Personal Info
  .when('I enter name "John Doe"')
  .and('I enter email "john@example.com"')
  .and('I tap "Next"')
  .then('I should see the address form')

  // Step 2: Address
  .when('I enter street "123 Main St"')
  .and('I enter city "Springfield"')
  .and('I enter zip "12345"')
  .and('I tap "Next"')
  .then('I should see the confirmation screen')

  // Step 3: Confirm
  .when('I tap "Register"')
  .then('I should see "Registration successful"')
  .and('I should be redirected to the home screen')
  .done()
```

### Date/Time Picker

```typescript
.scenario('Select date of birth')
  .given('I am on the profile form')
  .when('I tap the "Date of Birth" field')
  .then('a date picker should appear')
  .when('I select January 15, 1990')
  .and('I tap "Done"')
  .then('the date field should show "01/15/1990"')
  .done()
```

### Dropdown/Spinner

```typescript
.scenario('Select country')
  .given('I am on the registration form')
  .when('I tap the country dropdown')
  .then('a list of countries should appear')
  .when('I select "United States"')
  .then('the dropdown should show "United States"')
  .done()
```

## List and RecyclerView

### Infinite Scroll

```typescript
.scenario('Load more items')
  .given('I am viewing a list of items')
  .when('I scroll to the bottom')
  .then('more items should load')
  .and('I should see a loading indicator')
  .and('the new items should appear')
  .done()
```

### Pull to Refresh

```typescript
.scenario('Refresh content')
  .given('I am on the home feed')
  .when('I pull down from the top')
  .then('I should see a refresh indicator')
  .and('the content should reload')
  .and('I should see updated items')
  .done()
```

### Item Selection

```typescript
.scenario('Select list item')
  .given('I am viewing a list of products')
  .when('I tap on "Product ABC"')
  .then('I should see the product details')
  .and('the product name should be "Product ABC"')
  .and('I should see the price and description')
  .done()
```

## Permissions

### Request Permission

```typescript
.scenario('Request location permission')
  .given('the app needs location access')
  .when('I navigate to the map screen')
  .then('a permission dialog should appear')
  .and('the dialog should request "Location access"')
  .when('I tap "Allow"')
  .then('the map should show my location')
  .done()

.scenario('Deny permission')
  .given('the app requests camera permission')
  .when('the permission dialog appears')
  .and('I tap "Deny"')
  .then('I should see a message "Camera access required"')
  .and('the camera should not activate')
  .done()
```

## Notifications

### Local Notifications

```typescript
.scenario('Receive local notification')
  .given('I have scheduled a reminder')
  .when('the reminder time arrives')
  .then('I should see a notification')
  .and('the notification should show "Time for your meeting"')
  .when('I tap the notification')
  .then('the app should open to the meeting details')
  .done()
```

### Push Notifications

```typescript
.scenario('Receive push notification')
  .given('the app is in the background')
  .when('a push notification is sent')
  .then('the notification should appear in the status bar')
  .when('I pull down the notification shade')
  .then('I should see the notification')
  .when('I tap the notification')
  .then('the app should open to the relevant content')
  .done()
```

## Camera and Gallery

### Take Photo

```typescript
.scenario('Capture profile picture')
  .given('I am on the profile edit screen')
  .when('I tap "Change Photo"')
  .and('I select "Take Photo"')
  .then('the camera should open')
  .when('I take a photo')
  .and('I tap "Use Photo"')
  .then('the profile picture should be updated')
  .done()
```

### Select from Gallery

```typescript
.scenario('Select image from gallery')
  .given('I am creating a post')
  .when('I tap "Add Image"')
  .and('I select "Choose from Gallery"')
  .then('the gallery should open')
  .when('I select an image')
  .then('the image should be added to the post')
  .done()
```

## Device Features

### Rotate Device

```typescript
.scenario('Landscape orientation')
  .given('the app is in portrait mode')
  .when('I rotate the device to landscape')
  .then('the app should adapt to landscape layout')
  .and('all content should be visible')
  .done()
```

### Network Conditions

```typescript
.scenario('Offline mode')
  .given('the app is connected')
  .when('I disable network connectivity')
  .then('I should see "No internet connection"')
  .and('cached content should still be available')
  .done()

.scenario('Slow network')
  .given('the network is slow')
  .when('I load content')
  .then('I should see a loading indicator')
  .and('the content should eventually load')
  .done()
```

## Complete App Flow Examples

### Onboarding

```typescript
feature('App Onboarding')
  .scenario('First-time user onboarding')
    .tag('@mobile', '@onboarding')
    .given('I am launching the app for the first time')
    .then('I should see the welcome screen')

    .when('I swipe left')
    .then('I should see the features screen')

    .when('I swipe left')
    .then('I should see the permissions screen')

    .when('I tap "Get Started"')
    .then('I should see the registration screen')
    .done()
  ._build();
```

### E-commerce Checkout

```typescript
feature('Shopping Cart')
  .scenario('Complete purchase')
    .tag('@mobile', '@e2e')
    .given('I am logged in')
    .and('I have added a product to my cart')

    .when('I tap the cart icon')
    .then('I should see my cart with 1 item')

    .when('I tap "Proceed to Checkout"')
    .then('I should see the checkout screen')

    .when('I enter shipping address')
    .and('I tap "Continue"')
    .then('I should see payment options')

    .when('I select "Credit Card"')
    .and('I enter card details')
    .and('I tap "Place Order"')
    .then('I should see "Order placed successfully"')
    .and('I should receive an order number')
    .done()
  ._build();
```

### Social Media Post

```typescript
feature('Social Feed')
  .scenario('Create post with image')
    .given('I am on the home feed')
    .when('I tap the "Create Post" button')
    .then('I should see the post creation screen')

    .when('I enter "Check out this view!" in the text field')
    .and('I tap "Add Photo"')
    .and('I select a photo from the gallery')
    .then('the photo should appear in the post preview')

    .when('I tap "Post"')
    .then('I should see "Post created successfully"')
    .and('I should return to the home feed')
    .and('my post should appear at the top of the feed')
    .done()
  ._build();
```

## Testing Best Practices

### 1. Wait for Elements

Mobile apps often have animations and loading states:

```typescript
.when('I tap "Load Data"')
.then('I should see a loading spinner')
.and('I wait for the data to load')
.and('the list should contain items')
```

### 2. Test Different Screen Sizes

```typescript
// Test on different device configurations
const devices = [
  { avd: 'Pixel_6_API_33', name: 'Pixel 6' },
  { avd: 'Pixel_Tablet_API_33', name: 'Tablet' }
];

devices.forEach(device => {
  configure({
    platforms: {
      mobile: mobilePlatform({ avd: device.avd })
    }
  });

  test(
    feature(`Login on ${device.name}`)
      // ... test scenarios
      ._build(),
    'mobile'
  );
});
```

### 3. Test Orientation Changes

```typescript
.scenario('Support both orientations')
  .given('the app is in portrait mode')
  .and('I am viewing content')
  .when('I rotate to landscape')
  .then('the content should remain accessible')
  .and('the layout should adapt')
  .done()
```

### 4. Handle System Interruptions

```typescript
.scenario('Incoming call interruption')
  .given('the app is active')
  .when('an incoming call arrives')
  .and('I answer the call')
  .and('I end the call')
  .then('the app should resume where I left off')
  .done()
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

```typescript
configure({
  screenshotOnFailure: true  // Captures screenshot when test fails
});
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

```typescript
.scenario('App launches quickly')
  .when('I launch the app')
  .then('the app should launch in less than 3 seconds')
  .and('the home screen should be visible')
  .done()
```

### Memory Usage

```typescript
.scenario('App handles memory efficiently')
  .given('the app is running')
  .when('I navigate through multiple screens')
  .then('memory usage should remain stable')
  .and('no memory leaks should occur')
  .done()
```

## Next Steps

- [Web Testing Guide](./web-testing.md) - Test web applications
- [API Testing Guide](./api-testing.md) - Test REST APIs
- [Best Practices](./best-practices.md) - Write better tests
- [Custom Steps](../CUSTOM_STEPS.md) - Create reusable mobile steps
