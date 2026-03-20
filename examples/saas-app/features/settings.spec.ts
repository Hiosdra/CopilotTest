/**
 * SaaS Settings Tests
 * User profile, account settings, team management, and integrations.
 */

import { configure, feature, test } from '../../../src/index.js';
import { webPlatform } from '../../../src/platforms/web.js';
import { professionalUser, enterpriseUser } from '../fixtures/users.js';

configure({
  model: 'gpt-4o',
  platforms: { web: webPlatform({ browser: 'chromium', headless: true }) },
  baseUrl: 'https://app.example-saas.com',
  stepTimeout: 30000,
  outputDir: 'copilot-test-results/saas-app',
});

const settingsFeature = feature('SaaS Application Settings')
  .description('User settings, profile, team management, and integrations')
  .tag('@saas', '@settings')

  .background()
  .given('the SaaS application is available')

  .scenario('User updates profile information')
  .tag('@smoke', '@profile')
  .given(`I am logged in as "${professionalUser.email}"`)
  .when('I navigate to profile settings')
  .and('I update my first name to "NewFirstName"')
  .and('I update my company name')
  .and('I save changes')
  .then('I should see a success message')
  .and('my profile should be updated')
  .and('the new name should appear in the navigation')

  .scenario('User changes password')
  .tag('@security', '@password')
  .given('I am logged in')
  .when('I navigate to security settings')
  .and('I click "Change Password"')
  .and('I enter current password')
  .and('I enter new password "NewSecure@456"')
  .and('I confirm new password')
  .and('I save changes')
  .then('my password should be updated')
  .and('I should receive a password change confirmation email')

  .scenario('User enables two-factor authentication')
  .tag('@security', '@2fa')
  .given('I am in security settings')
  .and('2FA is not enabled')
  .when('I click "Enable Two-Factor Authentication"')
  .and('I scan the QR code with authenticator app')
  .and('I enter the verification code')
  .and('I save backup codes')
  .then('2FA should be enabled on my account')
  .and('I should need 2FA for next login')

  .scenario('Enterprise user invites team member')
  .tag('@team', '@collaboration')
  .given(`I am logged in as enterprise user "${enterpriseUser.email}"`)
  .when('I navigate to team settings')
  .and('I click "Invite Team Member"')
  .and('I enter email "newmember@example.com"')
  .and('I select role "Member"')
  .and('I send invitation')
  .then('an invitation email should be sent')
  .and('the user should appear as pending in team list')

  .scenario('User removes team member')
  .tag('@team', '@user-management')
  .given('I am an admin with team members')
  .when('I navigate to team settings')
  .and('I click "Remove" for a team member')
  .and('I confirm the removal')
  .then('the member should be removed from the team')
  .and('they should lose access to the account')

  .scenario('User configures notification preferences')
  .tag('@notifications', '@preferences')
  .given('I am in settings')
  .when('I navigate to notification preferences')
  .and('I disable email notifications for "Weekly Reports"')
  .and('I enable notifications for "Security Alerts"')
  .and('I save preferences')
  .then('my notification settings should be updated')
  .and('I should only receive configured notifications')

  .scenario('User connects third-party integration')
  .tag('@integrations', '@api')
  .given('I am in integrations settings')
  .when('I click "Connect" for Slack integration')
  .and('I authorize the integration')
  .and('I select which notifications to send to Slack')
  .and('I save integration settings')
  .then('Slack should be connected')
  .and('notifications should be sent to Slack')

  .scenario('User generates API key')
  .tag('@api', '@developer')
  .given('I am in API settings')
  .when('I click "Generate New API Key"')
  .and('I enter a name for the key')
  .and('I select permissions')
  .and('I create the key')
  .then('I should see the new API key')
  .and('I should be able to copy it')
  .and('I should see a warning to save it securely')

  .scenario('User deletes account')
  .tag('@account-deletion', '@danger')
  .given('I am in account settings')
  .when('I click "Delete Account"')
  .then('I should see a confirmation dialog with warnings')
  .when('I confirm I want to delete')
  .and('I enter my password to confirm')
  .and('I click final confirmation')
  .then('my account should be scheduled for deletion')
  .and('I should receive a confirmation email')
  .and('I should be logged out')

  .done()
  ._build();

test(settingsFeature, 'web');
export { settingsFeature };
