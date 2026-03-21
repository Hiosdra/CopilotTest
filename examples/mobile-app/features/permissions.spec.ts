/**
 * Mobile App Permissions Tests
 * Runtime permissions, permission requests, and denied scenarios.
 */

import { configure, feature, test } from '../../../src/index.js';
import { mobilePlatform } from '../../../src/platforms/mobile.js';

configure({
  model: 'gpt-4o',
  platforms: {
    mobile: mobilePlatform({
      device: 'emulator-5554',
      appPackage: 'com.example.testapp',
    }),
  },
  stepTimeout: 30000,
  outputDir: 'copilot-test-results/mobile-app',
});

const permissionsFeature = feature('Mobile App Permissions')
  .description('Runtime permissions and permission handling')
  .tag('@mobile', '@permissions', '@android')

  .scenario('App requests camera permission')
  .tag('@smoke', '@camera')
  .given('the app needs camera access')
  .when('I trigger a feature requiring camera')
  .then('I should see a permission request dialog')
  .and('the dialog should explain why camera is needed')
  .when('I tap "Allow"')
  .then('the camera should be accessible')
  .and('the feature should work as expected')

  .scenario('User denies camera permission')
  .tag('@negative', '@denied')
  .given('a feature requires camera permission')
  .when('the permission dialog appears')
  .and('I tap "Deny"')
  .then('the app should handle denial gracefully')
  .and('I should see a message explaining the limitation')
  .and('I should see an option to enable it later in settings')

  .scenario('App requests location permission')
  .tag('@location')
  .when('I trigger a feature requiring location')
  .then('I should see location permission request')
  .when('I choose "Allow only while using the app"')
  .then('the app should have foreground location access')
  .and('location-based features should work')

  .scenario('Request multiple permissions sequentially')
  .tag('@multiple')
  .given('a feature needs camera and storage permissions')
  .when('I trigger the feature')
  .then('permissions should be requested one at a time')
  .and('I should be able to grant or deny each')
  .and('the app should work with granted permissions')

  .scenario('User changes permission in system settings')
  .tag('@settings', '@permission-change')
  .given('I previously denied camera permission')
  .when('I go to system settings')
  .and('I enable camera permission for the app')
  .and('I return to the app')
  .then('the app should detect the permission change')
  .and('camera features should now be available')

  .done()
  ._build();

test(permissionsFeature, 'mobile');
export { permissionsFeature };
