---
platform: api
tags: [api, webhooks, integration]
---

# Feature: Webhook Integration

Webhook delivery, retry logic, and payload handling

## Scenario: Register webhook endpoint
@smoke @setup
- When I send a POST request to /webhooks
  ```json
  {
    "url": "https://example.com/webhook",
    "events": ["user.created", "user.updated"],
    "secret": "webhook_secret_key"
  }
  ```
- Then the response status should be 201
- And the webhook should be registered
- And I should receive a webhook ID

## Scenario: Webhook delivers event payload
@delivery @event
- Given I have a registered webhook for "user.created" events
- When a user is created via API
- Then a webhook POST request should be sent to my endpoint
- And the payload should include event type
- And the payload should include event data
- And the request should include X-Webhook-Signature header

## Scenario: Verify webhook signature
@security @signature
- Given I receive a webhook request
- When I compute HMAC signature using the secret
- And I compare with X-Webhook-Signature header
- Then the signatures should match
- And I can trust the webhook origin

## Scenario: Webhook retries on failure
@retry @reliability
- Given my webhook endpoint returns 500 error
- When an event is triggered
- Then the webhook should be retried multiple times
- And each retry should have exponential backoff
- And I should receive notification about failed webhook

## Scenario: List all registered webhooks
@management
- When I send a GET request to /webhooks
- Then I should see all my registered webhooks
- And each webhook should show URL, events, and status

## Scenario: Delete webhook endpoint
@cleanup
- Given I have a webhook with ID "webhook_123"
- When I send a DELETE request to /webhooks/webhook_123
- Then the webhook should be removed
- And I should not receive further webhook calls
