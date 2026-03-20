/**
 * Mobile App Offline Mode Tests
 * Network connectivity, offline functionality, and sync.
 */

import { configure, feature, test } from '../../../src/index.js';
import { mobilePlatform } from '../../../src/platforms/mobile.js';

const offlineFeature = feature('Mobile App Offline Mode')
  .description('Offline functionality, caching, and data synchronization')
  .tag('@mobile', '@offline', '@connectivity')

  .scenario('App works offline with cached data')
  .tag('@smoke', '@cache')
  .given('I have used the app with internet connection')
  .and('data has been cached')
  .when('I disable network connectivity')
  .and('I launch the app')
  .then('I should see cached content')
  .and('I should see an offline indicator')
  .and('I should be able to browse cached data')

  .scenario('User performs actions offline')
  .tag('@offline-actions', '@queue')
  .given('the app is offline')
  .when('I create a new item')
  .and('I edit existing items')
  .then('the changes should be saved locally')
  .and('I should see indication that changes are pending sync')

  .scenario('App syncs data when connection restored')
  .tag('@sync', '@online')
  .given('I have pending offline changes')
  .when('network connectivity is restored')
  .then('the app should detect connection')
  .and('pending changes should sync automatically')
  .and('I should see sync progress indicator')
  .and('all changes should be uploaded to server')

  .scenario('App handles sync conflicts')
  .tag('@conflict', '@sync')
  .given('I edited data offline')
  .and('the same data was modified on server')
  .when('sync occurs')
  .then('I should be notified of conflict')
  .and('I should see both versions')
  .and('I should be able to resolve the conflict')

  .scenario('Offline indicator shows network status')
  .tag('@ui', '@indicator')
  .when('I disable network')
  .then('I should see an offline banner or icon')
  .when('network is restored')
  .then('the offline indicator should disappear')
  .and('I should see a brief "Back online" notification')

  .scenario('App downloads for offline use')
  .tag('@download', '@offline-content')
  .given('I am online')
  .when('I select content to download for offline use')
  .and('I confirm the download')
  .then('content should download in background')
  .when('I go offline')
  .then('downloaded content should be fully accessible')

  .done()
  ._build();

test(offlineFeature, 'mobile');
export { offlineFeature };
