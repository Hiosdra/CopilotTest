/**
 * Webhook Integration Tests
 * Testing webhook delivery, retries, and payload validation.
 */

import { configure, feature, test } from '../../../src/index.js';
import { apiPlatform } from '../../../src/platforms/api.js';

const webhookFeature = feature('Webhook Integration')
  .description('Webhook delivery, retry logic, and payload handling')
  .tag('@api', '@webhooks', '@integration')

  .scenario('Register webhook endpoint')
  .tag('@smoke', '@setup')
  .when('I send a POST request to /webhooks')
  .withDocString(`{
  "url": "https://example.com/webhook",
  "events": ["user.created", "user.updated"],
  "secret": "webhook_secret_key"
}`)
  .then('the response status should be 201')
  .and('the webhook should be registered')
  .and('I should receive a webhook ID')

  .scenario('Webhook delivers event payload')
  .tag('@delivery', '@event')
  .given('I have a registered webhook for "user.created" events')
  .when('a user is created via API')
  .then('a webhook POST request should be sent to my endpoint')
  .and('the payload should include event type')
  .and('the payload should include event data')
  .and('the request should include X-Webhook-Signature header')

  .scenario('Verify webhook signature')
  .tag('@security', '@signature')
  .given('I receive a webhook request')
  .when('I compute HMAC signature using the secret')
  .and('I compare with X-Webhook-Signature header')
  .then('the signatures should match')
  .and('I can trust the webhook origin')

  .scenario('Webhook retries on failure')
  .tag('@retry', '@reliability')
  .given('my webhook endpoint returns 500 error')
  .when('an event is triggered')
  .then('the webhook should be retried multiple times')
  .and('each retry should have exponential backoff')
  .and('I should receive notification about failed webhook')

  .scenario('List all registered webhooks')
  .tag('@management')
  .when('I send a GET request to /webhooks')
  .then('I should see all my registered webhooks')
  .and('each webhook should show URL, events, and status')

  .scenario('Delete webhook endpoint')
  .tag('@cleanup')
  .given('I have a webhook with ID "webhook_123"')
  .when('I send a DELETE request to /webhooks/webhook_123')
  .then('the webhook should be removed')
  .and('I should not receive further webhook calls')

  .done()
  ._build();

test(webhookFeature, 'api');
export { webhookFeature };
