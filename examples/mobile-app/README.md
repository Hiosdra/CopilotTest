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
│   ├── onboarding.feature.md        # First-time user experience
│   ├── navigation.feature.md        # App navigation patterns
│   ├── permissions.feature.md       # Runtime permissions
│   └── offline-mode.feature.md      # Offline functionality
├── fixtures/
│   └── app-data.ts                  # Test device and app config
└── README.md                        # This file
```

## Running Tests

```bash
# Ensure Android emulator is running
emulator -avd Pixel_5_API_33

# Run all mobile tests (explicit file list)
copilot-test run \
  examples/mobile-app/features/onboarding.feature.md \
  examples/mobile-app/features/navigation.feature.md \
  examples/mobile-app/features/permissions.feature.md \
  examples/mobile-app/features/offline-mode.feature.md

# Run specific feature
copilot-test run examples/mobile-app/features/onboarding.feature.md
```

## Test Features

### 1. Onboarding (`onboarding.feature.md`)

First-time user experience testing.

**Key Scenarios:**
- ✅ View welcome screens
- ✅ Complete onboarding flow
- ✅ Skip onboarding
- ✅ Permission requests during onboarding

**Example:**
```markdown
## Scenario: User completes onboarding
- Given app is launched for the first time
- When I tap "Get Started"
- And I complete setup steps
- Then I should reach main app screen
- And onboarding should not show again
```

### 2. Navigation (`navigation.feature.md`)

Mobile navigation pattern testing.

**Key Scenarios:**
- ✅ Bottom navigation bar
- ✅ Drawer menu open/close
- ✅ Back button navigation
- ✅ Deep linking
- ✅ Tab navigation

**Example:**
```markdown
## Scenario: Navigate using bottom navigation
- When I tap "Profile" icon in bottom nav
- Then I should see profile screen
- And active tab should be highlighted
```

### 3. Permissions (`permissions.feature.md`)

Runtime permission handling.

**Key Scenarios:**
- ✅ Camera permission request
- ✅ Location permission request
- ✅ Permission denial handling
- ✅ Multiple permissions
- ✅ Permission changes in settings

**Example:**
```markdown
## Scenario: App requests camera permission
- When I trigger feature requiring camera
- Then I should see permission dialog
- When I tap "Allow"
- Then camera should be accessible
```

### 4. Offline Mode (`offline-mode.feature.md`)

Offline functionality and sync testing.

**Key Scenarios:**
- ✅ Work with cached data
- ✅ Perform offline actions
- ✅ Auto-sync when online
- ✅ Handle sync conflicts
- ✅ Offline indicator
- ✅ Download for offline use

**Example:**
```markdown
## Scenario: App syncs when connection restored
- Given I have pending offline changes
- When network connectivity is restored
- Then changes should sync automatically
- And I should see sync progress
```

## Mobile Testing Patterns

### Touch Interactions

```markdown
- When I tap the "Submit" button
- When I long press on the item
- When I swipe left on the notification
- When I scroll down to the bottom of the list
```

### Screen Transitions

```markdown
## Scenario: Navigate between screens
- When I tap "Next"
- Then I should transition to the next screen
- And animation should complete
- And back button should be available
```

### Permission Flow

```markdown
## Scenario: Handle permission request
- When I trigger feature needing permission
- Then permission dialog should appear
- When I grant/deny permission
- Then app should handle response appropriately
```

### Offline/Online States

```markdown
## Scenario: Handle connectivity changes
- When I go offline
- Then offline indicator should appear
- When network is restored
- Then app should reconnect
- And queued actions should sync
```

## Configuration

```yaml
# copilot-test.config.yaml
model: gpt-5-mini
platforms:
  mobile:
    platform: mobile
    device: emulator-5554        # Android emulator ID
    appPackage: com.example.app  # Your app package
stepTimeout: 30000
outputDir: copilot-test-results/mobile-app
```

## Best Practices

### 1. Test Different Device States

```markdown
## Scenario: App works in portrait mode
## Scenario: App adapts to landscape
## Scenario: App conserves battery when low
## Scenario: App handles airplane mode
```

### 2. Handle Android/iOS Differences

```markdown
## Scenario: Android: Navigate back with system button
- When I press system back button

## Scenario: iOS: Swipe back gesture
- When I swipe from left edge
```

### 3. Test Permission States

```markdown
## Scenario: First permission request
## Scenario: Request after denial
## Scenario: Handle "Don't ask again"
```

### 4. Verify Offline Behavior

```markdown
## Scenario: Graceful offline degradation
- Given app is offline
- When I try to use online-only feature
- Then I should see appropriate offline message
- And app should suggest offline alternatives
```

## Common Mobile Patterns

### Form Input

```markdown
## Scenario: Fill mobile form
- When I tap on text field
- And keyboard should appear
- When I enter text "Test"
- And I tap "Done" on keyboard
- Then keyboard should dismiss
- And text should be entered
```

### Pull to Refresh

```markdown
## Scenario: Pull to refresh data
- When I pull down from top of list
- Then refresh indicator should appear
- And data should reload
- And I should see updated content
```

### Notifications

```markdown
## Scenario: Receive and handle notification
- When I receive a push notification
- And I tap on the notification
- Then app should open to relevant screen
```

### Biometric Authentication

```markdown
## Scenario: Login with fingerprint
- When I tap "Use Fingerprint"
- And I provide fingerprint
- Then I should be authenticated
- And I should access the app
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

# Increase timeouts in copilot-test.config.yaml:
# stepTimeout: 60000
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
```markdown
<!-- Be explicit about dialog interaction -->
- When I tap "Allow" button in permission dialog
- And I wait for dialog to dismiss
```

### Touch Events Not Working

**Problem**: Taps not registering

**Solution:**
```markdown
<!-- Be more specific about element -->
- When I tap the "Submit" button at bottom of screen

<!-- Or wait for element to be ready -->
- When I wait for button to be enabled
- And I tap the button
```

## Device-Specific Testing

### Test on Multiple Devices

```yaml
# copilot-test.config.yaml — for small phone
platforms:
  mobile:
    platform: mobile
    device: emulator-5554

# Or for tablet
# platforms:
#   mobile:
#     platform: mobile
#     device: emulator-5555
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
        run: copilot-test run examples/mobile-app/features/*.feature.md
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
