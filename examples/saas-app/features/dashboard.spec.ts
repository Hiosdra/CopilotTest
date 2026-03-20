/**
 * SaaS Dashboard Tests
 * Main dashboard, widgets, data visualization, and analytics.
 */

import { configure, feature, test } from '../../../src/index.js';
import { webPlatform } from '../../../src/platforms/web.js';
import { professionalUser } from '../fixtures/users.js';

const dashboardFeature = feature('SaaS Application Dashboard')
  .description('Main dashboard functionality, widgets, and data visualization')
  .tag('@saas', '@dashboard')

  .background()
  .given('the SaaS application is available')
  .and(`I am logged in as "${professionalUser.email}"`)

  .scenario('User views main dashboard')
  .tag('@smoke')
  .when('I navigate to the dashboard')
  .then('I should see key metrics and statistics')
  .and('I should see data visualizations and charts')
  .and('I should see recent activity feed')
  .and('I should see quick action buttons')

  .scenario('User customizes dashboard widgets')
  .tag('@customization', '@widgets')
  .given('I am on the dashboard')
  .when('I click "Customize Dashboard"')
  .and('I drag and drop widgets to reorder them')
  .and('I remove a widget I don\'t need')
  .and('I add a new widget from available options')
  .and('I save my layout')
  .then('my dashboard should reflect the new layout')
  .and('the layout should persist on next login')

  .scenario('User filters dashboard data by date range')
  .tag('@filters', '@date-range')
  .given('I am viewing the dashboard')
  .when('I select date range "Last 7 days"')
  .then('all dashboard metrics should update for that period')
  .and('charts should show data for last 7 days')
  .when('I change to "Last 30 days"')
  .then('data should update accordingly')

  .scenario('User exports dashboard data')
  .tag('@export', '@reporting')
  .given('I am viewing dashboard with data')
  .when('I click "Export" button')
  .and('I select "Export as CSV"')
  .then('a CSV file should be downloaded')
  .and('the file should contain the dashboard data')

  .scenario('User views real-time updates')
  .tag('@real-time', '@websocket')
  .given('I am on the dashboard with real-time features enabled')
  .when('new data becomes available')
  .then('the dashboard should update automatically')
  .and('I should see a notification of new data')
  .and('metrics should refresh without page reload')

  .scenario('Dashboard shows usage limits')
  .tag('@usage', '@limits')
  .given('I am on a Professional plan with usage limits')
  .when('I view the dashboard')
  .then('I should see my current usage statistics')
  .and('I should see progress bars for limits')
  .and('I should see warnings if approaching limits')

  .done()
  ._build();

test(dashboardFeature, 'web');
export { dashboardFeature };
