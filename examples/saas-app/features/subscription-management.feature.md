---
platform: web
tags: [saas, subscription, billing]
---

# Feature: SaaS Subscription Management

Subscription plans, upgrades, billing, and cancellations

## Background
- Given the SaaS application is available

## Scenario: Free user upgrades to Professional plan
@smoke @upgrade
- Given I am logged in as free user "free.user@example.com"
- When I navigate to subscription settings or pricing page
- And I select the "Professional" plan
- And I click "Upgrade"
- Then I should see the payment form
- When I enter payment information
- And I confirm the upgrade
- Then my subscription should be upgraded to Professional
- And I should have access to Professional features
- And I should see updated usage limits

## Scenario: User switches from monthly to yearly billing
@billing @plan-change
- Given I am on the Professional monthly plan at $49/month
- When I navigate to billing settings
- And I select "Switch to Yearly"
- Then I should see the yearly price $490/year
- And I should see the savings amount
- When I confirm the change
- Then my billing should be updated to yearly
- And I should see the next billing date

## Scenario: User downgrades from Professional to Free
@downgrade
- Given I am on the Professional plan
- When I navigate to subscription settings
- And I click "Downgrade to Free"
- Then I should see a confirmation dialog with warnings
- And I should see what features I will lose
- When I confirm the downgrade
- Then my plan should remain Professional until end of billing period
- And I should see scheduled downgrade date
- And I should not be charged for next period

## Scenario: User views billing history and invoices
@invoices @billing-history
- Given I am logged in and have subscription history
- When I navigate to billing history
- Then I should see list of all past invoices
- And I should see payment dates and amounts
- When I click on an invoice
- Then I should be able to download PDF

## Scenario: User updates payment method
@payment @credit-card
- Given I have an active subscription with saved payment method
- When I navigate to payment settings
- And I click "Update Payment Method"
- And I enter new credit card information
- And I save the changes
- Then my payment method should be updated
- And future charges should use the new method

## Scenario: User cancels subscription
@cancel @churn
- Given I have an active paid subscription
- When I navigate to subscription settings
- And I click "Cancel Subscription"
- Then I should see a cancellation flow with retention offers
- When I provide cancellation reason
- And I confirm cancellation
- Then my subscription should be scheduled for cancellation
- And I should have access until end of billing period
- And I should receive a cancellation confirmation email

## Scenario: Subscription auto-renews at end of period
@renewal @billing
- Given I have an active monthly subscription
- And auto-renewal is enabled
- When the billing period ends
- Then my subscription should automatically renew
- And my payment method should be charged
- And I should receive a receipt

## Scenario: Payment fails at renewal
@negative @payment-failure
- Given my subscription is due for renewal
- And my payment method is invalid or expired
- When the system attempts to charge
- Then the payment should fail
- And I should receive a payment failure notification
- And I should have a grace period to update payment
- And my account should show past due status
