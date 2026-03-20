/**
 * SaaS Subscription Management Tests
 * Plan upgrades, downgrades, billing, and cancellations.
 */

import { configure, feature, test } from '../../../src/index.js';
import { webPlatform } from '../../../src/platforms/web.js';
import { freeUser, professionalUser } from '../fixtures/users.js';
import { professionalPlan, enterprisePlan } from '../fixtures/plans.js';

configure({
  model: 'gpt-4o',
  platforms: { web: webPlatform({ browser: 'chromium', headless: true }) },
  baseUrl: 'https://app.example-saas.com',
  stepTimeout: 30000,
  outputDir: 'copilot-test-results/saas-app',
});

const subscriptionFeature = feature('SaaS Subscription Management')
  .description('Subscription plans, upgrades, billing, and cancellations')
  .tag('@saas', '@subscription', '@billing')

  .background()
  .given('the SaaS application is available')

  .scenario('Free user upgrades to Professional plan')
  .tag('@smoke', '@upgrade')
  .given(`I am logged in as free user "${freeUser.email}"`)
  .when('I navigate to subscription settings or pricing page')
  .and(`I select the "${professionalPlan.name}" plan`)
  .and('I click "Upgrade"')
  .then('I should see the payment form')
  .when('I enter payment information')
  .and('I confirm the upgrade')
  .then('my subscription should be upgraded to Professional')
  .and('I should have access to Professional features')
  .and('I should see updated usage limits')

  .scenario('User switches from monthly to yearly billing')
  .tag('@billing', '@plan-change')
  .given(`I am on the Professional monthly plan at $${professionalPlan.monthlyPrice}/month`)
  .when('I navigate to billing settings')
  .and('I select "Switch to Yearly"')
  .then(`I should see the yearly price $${professionalPlan.yearlyPrice}/year`)
  .and('I should see the savings amount')
  .when('I confirm the change')
  .then('my billing should be updated to yearly')
  .and('I should see the next billing date')

  .scenario('User downgrades from Professional to Free')
  .tag('@downgrade')
  .given(`I am on the Professional plan`)
  .when('I navigate to subscription settings')
  .and('I click "Downgrade to Free"')
  .then('I should see a confirmation dialog with warnings')
  .and('I should see what features I will lose')
  .when('I confirm the downgrade')
  .then('my plan should remain Professional until end of billing period')
  .and('I should see scheduled downgrade date')
  .and('I should not be charged for next period')

  .scenario('User views billing history and invoices')
  .tag('@invoices', '@billing-history')
  .given('I am logged in and have subscription history')
  .when('I navigate to billing history')
  .then('I should see list of all past invoices')
  .and('I should see payment dates and amounts')
  .when('I click on an invoice')
  .then('I should be able to download PDF')

  .scenario('User updates payment method')
  .tag('@payment', '@credit-card')
  .given('I have an active subscription with saved payment method')
  .when('I navigate to payment settings')
  .and('I click "Update Payment Method"')
  .and('I enter new credit card information')
  .and('I save the changes')
  .then('my payment method should be updated')
  .and('future charges should use the new method')

  .scenario('User cancels subscription')
  .tag('@cancel', '@churn')
  .given('I have an active paid subscription')
  .when('I navigate to subscription settings')
  .and('I click "Cancel Subscription"')
  .then('I should see a cancellation flow with retention offers')
  .when('I provide cancellation reason')
  .and('I confirm cancellation')
  .then('my subscription should be scheduled for cancellation')
  .and('I should have access until end of billing period')
  .and('I should receive a cancellation confirmation email')

  .scenario('Subscription auto-renews at end of period')
  .tag('@renewal', '@billing')
  .given('I have an active monthly subscription')
  .and('auto-renewal is enabled')
  .when('the billing period ends')
  .then('my subscription should automatically renew')
  .and('my payment method should be charged')
  .and('I should receive a receipt')

  .scenario('Payment fails at renewal')
  .tag('@negative', '@payment-failure')
  .given('my subscription is due for renewal')
  .and('my payment method is invalid or expired')
  .when('the system attempts to charge')
  .then('the payment should fail')
  .and('I should receive a payment failure notification')
  .and('I should have a grace period to update payment')
  .and('my account should show past due status')

  .done()
  ._build();

test(subscriptionFeature, 'web');
export { subscriptionFeature };
