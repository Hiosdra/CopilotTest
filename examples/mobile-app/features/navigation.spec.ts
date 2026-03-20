/**
 * Mobile App Navigation Tests
 * App navigation patterns, menus, and screen transitions.
 */

import { configure, feature, test } from '../../../src/index.js';
import { mobilePlatform } from '../../../src/platforms/mobile.js';

const navigationFeature = feature('Mobile App Navigation')
  .description('Navigation patterns, menus, and screen flows')
  .tag('@mobile', '@navigation')

  .scenario('User navigates using bottom navigation bar')
  .tag('@smoke', '@bottom-nav')
  .given('I am on the home screen')
  .when('I tap the "Profile" icon in bottom navigation')
  .then('I should be taken to the profile screen')
  .when('I tap the "Settings" icon')
  .then('I should be taken to the settings screen')
  .and('the active tab should be highlighted')

  .scenario('User opens and closes drawer menu')
  .tag('@drawer', '@menu')
  .given('I am on any screen')
  .when('I swipe from left edge or tap menu icon')
  .then('the drawer menu should open')
  .and('I should see all menu options')
  .when('I tap outside the drawer or swipe to close')
  .then('the drawer should close')

  .scenario('User navigates back using back button')
  .tag('@back-navigation')
  .given('I am on a detail screen')
  .when('I tap the back button')
  .then('I should return to the previous screen')
  .and('my previous scroll position should be preserved')

  .scenario('Deep linking opens specific screen')
  .tag('@deep-link')
  .given('the app is not running')
  .when('I open a deep link to a specific product')
  .then('the app should launch')
  .and('I should be taken directly to that product screen')

  .scenario('User navigates through tabs')
  .tag('@tabs')
  .given('I am viewing a screen with tabs')
  .when('I swipe left to next tab')
  .then('the next tab content should be displayed')
  .when('I tap on a specific tab')
  .then('that tab should become active')

  .done()
  ._build();

test(navigationFeature, 'mobile');
export { navigationFeature };
