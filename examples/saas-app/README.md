# SaaS Application Test Suite Example

Comprehensive test suite for Software-as-a-Service applications demonstrating subscription management, multi-tenant features, and account administration patterns.

## Overview

This example suite covers core SaaS application functionality:

- **User Registration**: Sign-up, email verification, onboarding
- **Subscription Management**: Plans, upgrades, billing, cancellations
- **Dashboard**: Data visualization, widgets, analytics
- **Settings**: Profile, team management, integrations

## Structure

```
saas-app/
├── features/
│   ├── user-registration.spec.ts       # Sign-up and onboarding
│   ├── subscription-management.spec.ts # Plans and billing
│   ├── dashboard.spec.ts               # Main dashboard features
│   └── settings.spec.ts                # Account and team settings
├── fixtures/
│   ├── users.ts                        # Test users by tier
│   └── plans.ts                        # Subscription plans
└── README.md                           # This file
```

## Running Tests

```bash
# Run all SaaS tests (explicit file list)
copilot-test run \
  examples/saas-app/features/user-registration.spec.ts \
  examples/saas-app/features/subscription-management.spec.ts \
  examples/saas-app/features/dashboard.spec.ts \
  examples/saas-app/features/settings.spec.ts

# Run specific feature
copilot-test run examples/saas-app/features/subscription-management.spec.ts

# Note: Each spec file includes configure() and can be run standalone
```

## Test Features

### 1. User Registration (`user-registration.spec.ts`)

Tests the complete user onboarding experience from sign-up to first login.

**Key Scenarios:**
- ✅ New user completes registration
- ✅ Email verification and onboarding
- ✅ Registration with existing email (negative)
- ✅ Password strength validation
- ✅ Social sign-up (OAuth)

**Best Practices Shown:**
- Multi-step onboarding flows
- Email verification patterns
- OAuth integration testing
- Form validation

### 2. Subscription Management (`subscription-management.spec.ts`)

Covers subscription lifecycle from free trial to enterprise plans.

**Key Scenarios:**
- ✅ Upgrade from free to paid plan
- ✅ Switch billing cycle (monthly ↔ yearly)
- ✅ Downgrade with grace period
- ✅ View billing history and invoices
- ✅ Update payment method
- ✅ Cancel subscription
- ✅ Auto-renewal handling
- ✅ Payment failure recovery

**Best Practices Shown:**
- Payment processing flows
- Subscription state management
- Billing cycle handling
- Grace period testing

### 3. Dashboard (`dashboard.spec.ts`)

Tests main application dashboard with data visualization and customization.

**Key Scenarios:**
- ✅ View dashboard with metrics
- ✅ Customize widgets
- ✅ Filter by date range
- ✅ Export data
- ✅ Real-time updates
- ✅ Usage limit indicators

**Best Practices Shown:**
- Data visualization testing
- Customization and persistence
- Real-time feature testing
- Export functionality

### 4. Settings (`settings.spec.ts`)

Account, security, team, and integration settings.

**Key Scenarios:**
- ✅ Update profile information
- ✅ Change password
- ✅ Enable 2FA
- ✅ Team member management
- ✅ Notification preferences
- ✅ Third-party integrations
- ✅ API key generation
- ✅ Account deletion

**Best Practices Shown:**
- Security feature testing (2FA, password changes)
- Team collaboration features
- Integration testing
- Dangerous action confirmation flows

## Using Fixtures

### User Fixtures

```typescript
import { freeUser, professionalUser, enterpriseUser } from '../fixtures/users.js';

// Test with different subscription tiers
.given(`I am logged in as free user "${freeUser.email}"`)
.given(`I am logged in as professional user "${professionalUser.email}"`)
```

### Plan Fixtures

```typescript
import { freePlan, professionalPlan, enterprisePlan } from '../fixtures/plans.js';

// Reference plan details
.when(`I select the "${professionalPlan.name}" plan`)
.then(`I should see the price $${professionalPlan.monthlyPrice}/month`)
```

## SaaS-Specific Patterns

### Subscription Upgrade Flow

```typescript
.scenario('Free user upgrades to Professional')
.given('I am on free plan')
.when('I navigate to pricing page')
.and('I select Professional plan')
.and('I enter payment information')
.and('I confirm upgrade')
.then('my plan should be upgraded')
.and('I should have access to professional features')
```

### Multi-Tenant Team Management

```typescript
.scenario('Admin invites team member')
.given('I am an admin')
.when('I navigate to team settings')
.and('I invite a new member with role "Editor"')
.then('invitation should be sent')
.and('member should appear as pending')
```

### Usage Limit Tracking

```typescript
.scenario('Dashboard shows usage limits')
.given('I am on a plan with limits')
.when('I view the dashboard')
.then('I should see current usage vs limits')
.and('I should see warnings if approaching limits')
```

## Configuration

```typescript
configure({
  model: 'gpt-4o',
  platforms: {
    web: webPlatform({
      browser: 'chromium',
      headless: true,
    }),
  },
  baseUrl: 'https://app.example-saas.com',
  stepTimeout: 30000,
  outputDir: 'copilot-test-results/saas-app',
});
```

## Best Practices

### 1. Test All Subscription Tiers

```typescript
// Free tier limitations
.scenario('Free user encounters feature limit')
.then('I should see upgrade prompt')

// Professional tier features
.scenario('Professional user accesses advanced features')
.then('I should have full access')
```

### 2. Handle Billing Edge Cases

```typescript
// Payment failure
.scenario('Payment fails at renewal')
.then('I should receive notification')
.and('I should have grace period to update payment')

// Proration
.scenario('Upgrade mid-billing cycle')
.then('I should see prorated charge')
```

### 3. Test Team Collaboration

```typescript
.scenario('Team member permissions')
.given('I am a member with limited role')
.when('I try to access admin features')
.then('I should see permission denied')
```

## Troubleshooting

### Payment Gateway Issues

**Problem**: Cannot test real payment processing

**Solution**: Use test/sandbox payment credentials
```typescript
// Use test card numbers
const testCard = '4242424242424242'; // Stripe test card
```

### Email Verification Delays

**Problem**: Email verification tests are slow

**Solution**: Mock email service or use test APIs
```typescript
// Skip email verification in test environment
.when('I verify email using test token')
```

### Multi-Tenant Data Isolation

**Problem**: Data from one test affects another

**Solution**: Use unique tenant IDs per test
```typescript
const testCompany = `TestCorp_${Date.now()}`;
.when(`I create company "${testCompany}"`)
```

## Customization

### Add Your Features

```typescript
.scenario('Your SaaS-specific feature')
.given('initial state')
.when('user action')
.then('expected result')
```

### Extend Fixtures

```typescript
// fixtures/plans.ts
export const customPlan: SubscriptionPlan = {
  name: 'Custom Enterprise',
  tier: 'enterprise', // Use existing tier value
  monthlyPrice: 299,
  yearlyPrice: 2990,
  // ... your plan details
};
```

## CI/CD Integration

```yaml
name: SaaS App Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx tsx examples/saas-app/features/*.spec.ts
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Next Steps

- Explore [E-Commerce Examples](../e-commerce/README.md)
- Check [API Testing Examples](../api-testing/README.md)
- Review [Mobile App Examples](../mobile-app/README.md)
