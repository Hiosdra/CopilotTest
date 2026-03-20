# Mobile App Test Suite Example

Comprehensive mobile application testing examples demonstrating Android/iOS testing patterns with Android Emulator MCP.

## Overview

This suite covers essential mobile app testing scenarios:

- **Onboarding**: First-time user experience, welcome screens
- **Navigation**: Bottom nav, drawer menus, deep linking, tabs
- **Permissions**: Runtime permissions, handling denials
- **Offline Mode**: Caching, sync, conflict resolution

## Structure

```
mobile-app/
├── features/
│   ├── onboarding.spec.ts        # First-time user experience
│   ├── navigation.spec.ts        # App navigation patterns
│   ├── permissions.spec.ts       # Runtime permissions
│   └── offline-mode.spec.ts      # Offline functionality
├── fixtures/
│   └── app-data.ts               # Test device and app config
└── README.md                     # This file
```

## Running Tests

```bash
# Ensure Android emulator is running
emulator -avd Pixel_5_API_33

# Run all mobile tests (explicit file list)
copilot-test run \
  examples/mobile-app/features/onboarding.spec.ts \
  examples/mobile-app/features/navigation.spec.ts \
  examples/mobile-app/features/permissions.spec.ts \
  examples/mobile-app/features/offline-mode.spec.ts

# Run specific feature
copilot-test run examples/mobile-app/features/onboarding.spec.ts

# Note: Each spec file includes configure() and can be run standalone
```

## Test Features

### 1. Onboarding (`onboarding.spec.ts`)

First-time user experience testing.

**Key Scenarios:**
- ✅ View welcome screens
- ✅ Complete onboarding flow
- ✅ Skip onboarding
- ✅ Permission requests during onboarding

**Example:**
```typescript
.scenario('User completes onboarding')
.given('app is launched for the first time')
.when('I tap "Get Started"')
.and('I complete setup steps')
.then('I should reach main app screen')
.and('onboarding should not show again')
```

### 2. Navigation (`navigation.spec.ts`)

Mobile navigation pattern testing.

**Key Scenarios:**
- ✅ Bottom navigation bar
- ✅ Drawer menu open/close
- ✅ Back button navigation
- ✅ Deep linking
- ✅ Tab navigation

**Example:**
```typescript
.scenario('Navigate using bottom navigation')
.when('I tap "Profile" icon in bottom nav')
.then('I should see profile screen')
.and('active tab should be highlighted')
```

### 3. Permissions (`permissions.spec.ts`)

Runtime permission handling.

**Key Scenarios:**
- ✅ Camera permission request
- ✅ Location permission request
- ✅ Permission denial handling
- ✅ Multiple permissions
- ✅ Permission changes in settings

**Example:**
```typescript
.scenario('App requests camera permission')
.when('I trigger feature requiring camera')
.then('I should see permission dialog')
.when('I tap "Allow"')
.then('camera should be accessible')
```

### 4. Offline Mode (`offline-mode.spec.ts`)

Offline functionality and sync testing.

**Key Scenarios:**
- ✅ Work with cached data
- ✅ Perform offline actions
- ✅ Auto-sync when online
- ✅ Handle sync conflicts
- ✅ Offline indicator
- ✅ Download for offline use

**Example:**
```typescript
.scenario('App syncs when connection restored')
.given('I have pending offline changes')
.when('network connectivity is restored')
.then('changes should sync automatically')
.and('I should see sync progress')
```

## Mobile Testing Patterns

### Touch Interactions

```typescript
// Tap
.when('I tap the "Submit" button')

// Long press
.when('I long press on the item')

// Swipe
.when('I swipe left on the notification')

// Scroll
.when('I scroll down to the bottom of the list')
```

### Screen Transitions

```typescript
.scenario('Navigate between screens')
.when('I tap "Next"')
.then('I should transition to the next screen')
.and('animation should complete')
.and('back button should be available')
```

### Permission Flow

```typescript
.scenario('Handle permission request')
.when('I trigger feature needing permission')
.then('permission dialog should appear')
.when('I grant/deny permission')
.then('app should handle response appropriately')
```

### Offline/Online States

```typescript
.scenario('Handle connectivity changes')
.when('I go offline')
.then('offline indicator should appear')
.when('network is restored')
.then('app should reconnect')
.and('queued actions should sync')
```

## Configuration

```typescript
configure({
  model: 'gpt-4o',
  platforms: {
    mobile: mobilePlatform({
      device: 'emulator-5554',        // Android emulator ID
      appPackage: 'com.example.app',  // Your app package
    }),
  },
  stepTimeout: 30000,
  outputDir: 'copilot-test-results/mobile-app',
});
```

## Best Practices

### 1. Test Different Device States

```typescript
// Portrait orientation
.scenario('App works in portrait mode')

// Landscape orientation
.scenario('App adapts to landscape')

// Low battery
.scenario('App conserves battery when low')

// Airplane mode
.scenario('App handles airplane mode')
```

### 2. Handle Android/iOS Differences

```typescript
// Android back button
.scenario('Android: Navigate back with system button')
.when('I press system back button')

// iOS swipe back
.scenario('iOS: Swipe back gesture')
.when('I swipe from left edge')
```

### 3. Test Permission States

```typescript
// Never asked
.scenario('First permission request')

// Previously denied
.scenario('Request after denial')

// Permanently denied
.scenario('Handle "Don\'t ask again"')
```

### 4. Verify Offline Behavior

```typescript
.scenario('Graceful offline degradation')
.given('app is offline')
.when('I try to use online-only feature')
.then('I should see appropriate offline message')
.and('app should suggest offline alternatives')
```

## Common Mobile Patterns

### Form Input

```typescript
.scenario('Fill mobile form')
.when('I tap on text field')
.and('keyboard should appear')
.when('I enter text "Test"')
.and('I tap "Done" on keyboard')
.then('keyboard should dismiss')
.and('text should be entered')
```

### Pull to Refresh

```typescript
.scenario('Pull to refresh data')
.when('I pull down from top of list')
.then('refresh indicator should appear')
.and('data should reload')
.and('I should see updated content')
```

### Notifications

```typescript
.scenario('Receive and handle notification')
.when('I receive a push notification')
.and('I tap on the notification')
.then('app should open to relevant screen')
```

### Biometric Authentication

```typescript
.scenario('Login with fingerprint')
.when('I tap "Use Fingerprint"')
.and('I provide fingerprint')
.then('I should be authenticated')
.and('I should access the app')
```

## Troubleshooting

### Emulator Not Responding

**Problem**: Emulator is slow or unresponsive

**Solution:**
```bash
# Check emulator status
adb devices

# Restart emulator if needed
adb reboot

# Increase timeouts
configure({ stepTimeout: 60000 });
```

### App Not Installed

**Problem**: Test cannot find app

**Solution:**
```bash
# Install app manually
adb install path/to/app.apk

# Verify installation
adb shell pm list packages | grep your.package
```

### Permission Dialogs Stuck

**Problem**: Permission dialogs don't dismiss

**Solution:**
```typescript
// Be explicit about dialog interaction
.when('I tap "Allow" button in permission dialog')
.and('I wait for dialog to dismiss')
```

### Touch Events Not Working

**Problem**: Taps not registering

**Solution:**
```typescript
// Be more specific about element
.when('I tap the "Submit" button at bottom of screen')

// Or wait for element to be ready
.when('I wait for button to be enabled')
.and('I tap the button')
```

## Device-Specific Testing

### Test on Multiple Devices

```typescript
// Small phone
const smallDevice = { device: 'emulator-5554' };

// Tablet
const tabletDevice = { device: 'emulator-5555' };

// Configure for different devices
configure({
  platforms: {
    mobile: mobilePlatform(smallDevice) // or tabletDevice
  }
});
```

### Test Different Android Versions

```bash
# API 29 (Android 10)
emulator -avd Pixel_API_29

# API 33 (Android 13)
emulator -avd Pixel_API_33
```

## CI/CD Integration

```yaml
name: Mobile App Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: macos-latest  # macOS for Android emulator
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Setup Android SDK
        uses: android-actions/setup-android@v2

      - name: Create and start emulator
        run: |
          echo "no" | avdmanager create avd -n test -k "system-images;android-33;default;x86_64"
          emulator -avd test -no-window -no-audio &
          adb wait-for-device

      - name: Install app
        run: adb install app/build/outputs/apk/debug/app-debug.apk

      - name: Run tests
        run: npx tsx examples/mobile-app/features/*.spec.ts
```

## Tips for Mobile Testing

1. **Start emulator early** - Emulator startup takes time
2. **Use stable emulator images** - x86_64 images are faster
3. **Increase timeouts** - Mobile interactions can be slower
4. **Test orientation changes** - Portrait and landscape
5. **Handle system dialogs** - Permissions, battery, etc.
6. **Test interruptions** - Calls, notifications during use
7. **Verify keyboard behavior** - Show/hide, input types
8. **Test gestures** - Swipe, pinch, long press

## Next Steps

- Explore [E-Commerce Examples](../e-commerce/README.md)
- Check [SaaS App Examples](../saas-app/README.md)
- Review [API Testing Examples](../api-testing/README.md)
