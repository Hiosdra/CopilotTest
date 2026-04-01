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
│   ├── user-registration.feature.md       # Sign-up and onboarding
│   ├── subscription-management.feature.md # Plans and billing
│   ├── dashboard.feature.md               # Main dashboard features
│   └── settings.feature.md                # Account and team settings
├── fixtures/
│   ├── users.ts                           # Test users by tier
│   └── plans.ts                           # Subscription plans
└── README.md                              # This file
```

## Running Tests

```bash
# Run all SaaS tests (explicit file list)
copilot-test run \
  examples/saas-app/features/user-registration.feature.md \
  examples/saas-app/features/subscription-management.feature.md \
  examples/saas-app/features/dashboard.feature.md \
  examples/saas-app/features/settings.feature.md

# Run specific feature
copilot-test run examples/saas-app/features/subscription-management.feature.md
```

## Test Features

### 1. User Registration (`user-registration.feature.md`)

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

### 2. Subscription Management (`subscription-management.feature.md`)

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

### 3. Dashboard (`dashboard.feature.md`)

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

### 4. Settings (`settings.feature.md`)

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

Reference fixture values in your Markdown step descriptions:

```markdown
## Scenario: Free user hits feature limit
- Given I am logged in as free user "free@example.com"

## Scenario: Professional user accesses advanced features
- Given I am logged in as professional user "pro@example.com"
```

### Plan Fixtures

```markdown
## Scenario: User upgrades plan
- When I select the "Professional" plan
- Then I should see the price $29/month
```

## SaaS-Specific Patterns

### Subscription Upgrade Flow

```markdown
## Scenario: Free user upgrades to Professional
- Given I am on free plan
- When I navigate to pricing page
- And I select Professional plan
- And I enter payment information
- And I confirm upgrade
- Then my plan should be upgraded
- And I should have access to professional features
```

### Multi-Tenant Team Management

```markdown
## Scenario: Admin invites team member
- Given I am an admin
- When I navigate to team settings
- And I invite a new member with role "Editor"
- Then invitation should be sent
- And member should appear as pending
```

### Usage Limit Tracking

```markdown
## Scenario: Dashboard shows usage limits
- Given I am on a plan with limits
- When I view the dashboard
- Then I should see current usage vs limits
- And I should see warnings if approaching limits
```

## Configuration

```yaml
# copilot-test.config.yaml
model: gpt-4o
platforms:
  web:
    platform: web
    browser: chromium
    headless: true
baseUrl: https://app.example-saas.com
stepTimeout: 30000
outputDir: copilot-test-results/saas-app
```

## Best Practices

### 1. Test All Subscription Tiers

```markdown
## Scenario: Free user encounters feature limit
- Given I am on the free plan
- When I try to access a premium feature
- Then I should see upgrade prompt

## Scenario: Professional user accesses advanced features
- Given I am on the professional plan
- When I access advanced features
- Then I should have full access
```

### 2. Handle Billing Edge Cases

```markdown
## Scenario: Payment fails at renewal
- Given my payment method is expired
- When renewal is attempted
- Then I should receive notification
- And I should have grace period to update payment

## Scenario: Upgrade mid-billing cycle
- Given I am mid-billing cycle
- When I upgrade my plan
- Then I should see prorated charge
```

### 3. Test Team Collaboration

```markdown
## Scenario: Team member permissions
- Given I am a member with limited role
- When I try to access admin features
- Then I should see permission denied
```

## Troubleshooting

### Payment Gateway Issues

**Problem**: Cannot test real payment processing

**Solution**: Use test/sandbox payment credentials
```markdown
<!-- Use test card numbers in step descriptions -->
## Scenario: Complete payment with test card
- When I enter card number "4242424242424242"
```

### Email Verification Delays

**Problem**: Email verification tests are slow

**Solution**: Mock email service or use test APIs
```markdown
## Scenario: Verify email
- When I verify email using test token
```

### Multi-Tenant Data Isolation

**Problem**: Data from one test affects another

**Solution**: Use unique tenant IDs per test
```markdown
## Scenario: Create isolated tenant
- When I create company "TestCorp_unique_id"
```

## Customization

### Add Your Features

```markdown
## Scenario: Your SaaS-specific feature
- Given initial state
- When user action
- Then expected result
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

> **Note:** Fixture data files are still TypeScript. Only test specifications
> have migrated to Markdown (`.feature.md`) format.

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
      - run: copilot-test run examples/saas-app/features/*.feature.md
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Next Steps

- Explore [E-Commerce Examples](../e-commerce/README.md)
- Check [API Testing Examples](../api-testing/README.md)
- Review [Mobile App Examples](../mobile-app/README.md)
