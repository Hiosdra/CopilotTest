# E-Commerce Test Suite Example

Complete end-to-end test suite for e-commerce applications demonstrating real-world testing patterns, best practices, and common scenarios.

## Overview

This example suite covers the complete customer journey in an e-commerce application:

- **Authentication**: Login, registration, password reset
- **Product Catalog**: Browsing, searching, filtering products
- **Shopping Cart**: Adding, updating, removing items
- **Checkout**: Multi-step checkout flow with payment
- **Order History**: Viewing orders, tracking, returns

## Structure

```
e-commerce/
├── features/
│   ├── authentication.spec.ts      # User login, registration, password reset
│   ├── product-catalog.spec.ts     # Product browsing, search, filters
│   ├── shopping-cart.spec.ts       # Cart operations and management
│   ├── checkout.spec.ts            # Complete checkout flow
│   └── order-history.spec.ts       # Order tracking and management
├── fixtures/
│   ├── users.ts                    # Test user data
│   ├── products.ts                 # Product fixtures
│   └── orders.ts                   # Order and address fixtures
└── README.md                       # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- CopilotTest installed (`npm install copilot-test`)
- GitHub Copilot SDK access

### Running the Tests

```bash
# Run all e-commerce tests
npx tsx examples/e-commerce/features/*.spec.ts

# Run specific feature
npx tsx examples/e-commerce/features/authentication.spec.ts

# Run with specific configuration
copilot-test run examples/e-commerce/features/authentication.spec.ts --env=staging
```

### Configuration

Each test file includes its own configuration. You can also create a shared config:

```typescript
// copilot-test.config.ts
import { webPlatform } from 'copilot-test';

export default {
  model: 'gpt-4o',
  platforms: {
    web: webPlatform({
      browser: 'chromium',
      headless: true,
    }),
  },
  baseUrl: 'https://demo.example-shop.com',
  stepTimeout: 30000,
  retries: 1,
  screenshotOnFailure: true,
  outputDir: 'copilot-test-results/e-commerce',
};
```

## Test Features

### 1. Authentication Tests (`authentication.spec.ts`)

**Scenarios covered:**
- ✅ Successful login with valid credentials
- ✅ Failed login attempts (wrong password, non-existent user)
- ✅ Form validation
- ✅ Remember me functionality
- ✅ Logout flow
- ✅ User registration
- ✅ Registration validation
- ✅ Password reset
- ✅ Admin access

**Best practices demonstrated:**
- Using background steps for common setup
- Leveraging fixtures for test data
- Testing both positive and negative scenarios
- Security testing (rate limiting, session management)

**Key learning points:**
```typescript
// Use background for common setup
.background()
.given('the e-commerce website is available')
.and('I am not logged in')

// Import fixtures for reusable test data
import { registeredCustomer } from '../fixtures/users.js';

// Test both positive and negative cases
.scenario('Customer logs in with valid credentials')  // ✓ Positive
.scenario('Login fails with incorrect password')      // ✗ Negative
```

### 2. Product Catalog Tests (`product-catalog.spec.ts`)

**Scenarios covered:**
- ✅ Browse all products
- ✅ Search functionality
- ✅ Category filtering
- ✅ Price range filtering
- ✅ Product sorting
- ✅ Product detail pages
- ✅ Out-of-stock handling
- ✅ Quick view modals
- ✅ Multiple filters
- ✅ Empty search results
- ✅ Product comparison
- ✅ Reviews and ratings

**Best practices demonstrated:**
- Testing search and filter combinations
- Handling edge cases (empty results, out of stock)
- Modal/overlay interactions
- Dynamic content loading

**Key learning points:**
```typescript
// Test filter combinations
.when('I select the "Electronics" category')
.and('I set price range to $100 - $1000')
.and('I select "4+ stars" rating filter')
.then('I should see only electronics products between $100-$1000 with 4+ star ratings')

// Handle empty states gracefully
.scenario('Customer searches for non-existent product')
.then('I should see a "No results found" message')
.and('I should see suggestions or alternatives')
```

### 3. Shopping Cart Tests (`shopping-cart.spec.ts`)

**Scenarios covered:**
- ✅ Add products to cart
- ✅ Add multiple products
- ✅ Update quantities
- ✅ Remove items
- ✅ Clear cart
- ✅ Cart persistence across sessions
- ✅ Total calculations
- ✅ Quantity validation
- ✅ Stock validation
- ✅ Coupon codes (valid and invalid)
- ✅ Save for later
- ✅ Guest cart handling
- ✅ Availability checks

**Best practices demonstrated:**
- Testing CRUD operations
- Validating calculations
- Session persistence testing
- Guest vs. authenticated user flows

**Key learning points:**
```typescript
// Verify calculations
.then(`the subtotal should be $${laptop.price + tshirt.price}`)
.and('tax should be calculated and displayed')
.and('the final total should include all charges')

// Test persistence
.scenario('Logged-in customer cart persists across sessions')
.when('I log out')
.and('I close the browser')
.and('I reopen the browser and log back in')
.then('my cart should still contain the items I added previously')
```

### 4. Checkout Tests (`checkout.spec.ts`)

**Scenarios covered:**
- ✅ Complete checkout as registered user
- ✅ Guest checkout
- ✅ Multiple shipping addresses
- ✅ Shipping method selection
- ✅ Discount codes at checkout
- ✅ Form validation
- ✅ Invalid payment handling
- ✅ Saved address/payment usage
- ✅ Order review
- ✅ Out-of-stock during checkout
- ✅ Save payment methods
- ✅ Session timeout handling
- ✅ Gift messages
- ✅ Tax calculation
- ✅ Order confirmation

**Best practices demonstrated:**
- Multi-step form flows
- Payment processing validation
- Error handling and recovery
- Guest vs. registered user experiences

**Key learning points:**
```typescript
// Multi-step flow
.when('I enter shipping address')
.and('I continue to payment')
.then('I should see the order summary')
.when('I enter payment details')
.and('I click "Place Order"')
.then('I should see an order confirmation page')

// Error recovery
.scenario('Product becomes unavailable during checkout')
.then('I should be notified that an item is no longer available')
.and('I should be returned to my cart')
.and('I should have options to remove it or continue with other items')
```

### 5. Order History Tests (`order-history.spec.ts`)

**Scenarios covered:**
- ✅ View all orders
- ✅ View specific order details
- ✅ Track order status
- ✅ Filter by status
- ✅ Filter by date range
- ✅ Search orders
- ✅ Reorder functionality
- ✅ Download invoices
- ✅ Initiate returns
- ✅ Cancel orders
- ✅ View cancelled orders
- ✅ Write product reviews
- ✅ Empty order history
- ✅ Contact support
- ✅ Email order access

**Best practices demonstrated:**
- Testing historical data
- Filtering and search patterns
- Document generation
- Return/refund flows

**Key learning points:**
```typescript
// Test filtering
.when('I select "Delivered" from the status filter')
.then('I should see only orders with "Delivered" status')

// Reorder convenience feature
.scenario('Customer reorders items from previous order')
.when('I click the "Reorder" button')
.then('all items from that order should be added to my cart')
```

## Using Fixtures

Fixtures provide reusable test data across scenarios:

### User Fixtures

```typescript
import { registeredCustomer, premiumCustomer, adminUser } from '../fixtures/users.js';

// Use in tests
.given(`I am logged in as "${registeredCustomer.username}"`)
```

### Product Fixtures

```typescript
import { laptop, smartphone, outOfStockProduct } from '../fixtures/products.js';

// Use in tests
.when(`I add "${laptop.name}" to the cart`)
```

### Order Fixtures

```typescript
import { usShippingAddress, creditCardPayment } from '../fixtures/orders.js';

// Use in tests
.when(`I enter shipping address: ${usShippingAddress.street}...`)
```

## Best Practices

### 1. Use Background Steps

```typescript
.background()
.given('the e-commerce website is available')
.and('I am not logged in')
```

Background steps run before each scenario, reducing duplication.

### 2. Tag Your Scenarios

```typescript
.scenario('Critical checkout flow')
.tag('@smoke', '@critical', '@checkout')
```

Tags help with selective test execution:
- `@smoke` - Critical happy path tests
- `@negative` - Error/edge case tests
- `@validation` - Form validation tests

### 3. Test Both Positive and Negative Cases

```typescript
// Positive
.scenario('Customer applies valid discount code')

// Negative
.scenario('Customer enters invalid discount code')
```

### 4. Use Descriptive Step Names

```typescript
// ✅ Good
.when('I enter username "testuser" and password "Test@123"')
.then('I should see a welcome message containing my username')

// ❌ Avoid
.when('I submit the form')
.then('It works')
```

### 5. Verify Complete User Experience

```typescript
.then('I should see an order confirmation page')
.and('I should see my order number')
.and('I should see order summary with items and total')
.and('I should receive a confirmation email')
```

## Troubleshooting

### Tests Timing Out

**Problem**: Steps exceed the timeout duration

**Solutions**:
```typescript
// Increase step timeout
configure({
  stepTimeout: 60000, // 60 seconds
});

// Or use retry mechanism
configure({
  retries: 2,
  retry: {
    enabled: true,
    stepRetries: 3,
  },
});
```

### Element Not Found

**Problem**: AI cannot locate elements on the page

**Solutions**:
- Make step descriptions more specific
- Add intermediate waiting steps
- Verify the page URL/state before interacting

```typescript
// ❌ Vague
.when('I click the button')

// ✅ Specific
.when('I click the "Add to Cart" button on the product page')
```

### Cart Not Persisting

**Problem**: Cart items disappear between scenarios

**Solutions**:
- Clear cart in background step
- Use separate test users
- Test cart persistence as explicit scenario

```typescript
.background()
.given('the shopping cart is empty initially')
```

### Payment Test Limitations

**Note**: Real payment processing cannot be tested. Use test/sandbox payment gateways or mock payment endpoints.

### Flaky Tests

**Problem**: Tests pass/fail inconsistently

**Solutions**:
- Add explicit waiting steps
- Verify page state before actions
- Use retry mechanisms
- Check for loading indicators

```typescript
.when('I click "Proceed to Checkout"')
.and('I wait for the checkout page to load completely')
.then('I should be on the checkout page')
```

## Customization

### Adapting for Your Application

1. **Update base URL** in configuration
2. **Modify fixtures** to match your data model
3. **Adjust step descriptions** to match your UI
4. **Add/remove scenarios** based on your features
5. **Update tags** for your test organization

### Adding New Scenarios

```typescript
.scenario('Your new scenario')
.tag('@custom-tag')
.given('initial state')
.when('user action')
.then('expected outcome')
```

### Creating Additional Features

Follow the pattern:
1. Create `features/new-feature.spec.ts`
2. Import necessary fixtures
3. Define feature with background
4. Add scenarios with tags
5. Export for test suite

## CI/CD Integration

### GitHub Actions

```yaml
name: E-Commerce Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx tsx examples/e-commerce/features/*.spec.ts
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: e-commerce-reports
          path: copilot-test-results/
```

### Run Subsets

```bash
# Smoke tests only
copilot-test run examples/e-commerce --tag=@smoke

# Critical path
copilot-test run examples/e-commerce --tag=@critical

# Specific feature
copilot-test run examples/e-commerce/features/checkout.spec.ts
```

## Next Steps

1. **Explore other examples**:
   - [SaaS Application](../saas-app/README.md)
   - [API Testing](../api-testing/README.md)
   - [Mobile App](../mobile-app/README.md)

2. **Learn advanced features**:
   - [Retry Mechanisms](../../examples/retry-example.ts)
   - [Performance Monitoring](../../examples/performance-monitoring.ts)
   - [Plugins](../../examples/plugins.ts)

3. **Customize for your application**

## Support

- [Documentation](../../README.md)
- [GitHub Issues](https://github.com/Hiosdra/CopilotTest/issues)
- [Contributing Guide](../../CONTRIBUTING.md)
