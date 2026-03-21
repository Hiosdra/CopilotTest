/**
 * Mobile App Onboarding Tests
 * First-time user experience, app introduction, and setup.
 */

import { configure, feature, test } from '../../../src/index.js';
import { mobilePlatform } from '../../../src/platforms/mobile.js';
import { testAppPackage } from '../fixtures/app-data.js';

configure({
  model: 'gpt-4o',
  platforms: {
    mobile: mobilePlatform({
      device: 'emulator-5554',
      appPackage: testAppPackage,
    }),
  },
  stepTimeout: 30000,
  outputDir: 'copilot-test-results/mobile-app',
});

const onboardingFeature = feature('Mobile App Onboarding')
  .description('First-time user experience and app introduction')
  .tag('@mobile', '@onboarding')

  .scenario('First-time user views welcome screens')
  .tag('@smoke', '@welcome')
  .given('the app is launched for the first time')
  .then('I should see the welcome screen')
  .and('I should see app introduction slides')
  .when('I swipe through the introduction slides')
  .then('I should see multiple feature highlights')
  .and('I should see a "Get Started" button on the final slide')

  .scenario('User completes onboarding flow')
  .tag('@smoke', '@complete')
  .given('I am on the onboarding welcome screen')
  .when('I tap "Get Started"')
  .and('I select my preferences')
  .and('I grant necessary permissions')
  .and('I complete the setup steps')
  .then('I should be taken to the main app screen')
  .and('onboarding should not show again on next launch')

  .scenario('User skips onboarding')
  .tag('@skip')
  .given('I am viewing the onboarding slides')
  .when('I tap "Skip" button')
  .then('I should be taken directly to the main app')
  .and('I should be able to access basic features')

  .scenario('Onboarding requests app permissions')
  .tag('@permissions')
  .given('I am completing onboarding')
  .when('the app requests camera permission')
  .and('the app requests location permission')
  .then('I should see clear explanations for each permission')
  .and('I should be able to allow or deny each permission')

  .done()
  ._build();

test(onboardingFeature, 'mobile');
export { onboardingFeature };
