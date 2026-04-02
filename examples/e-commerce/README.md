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
│   ├── authentication.feature.md      # User login, registration, password reset
│   ├── product-catalog.feature.md     # Product browsing, search, filters
│   ├── shopping-cart.feature.md       # Cart operations and management
│   ├── checkout.feature.md            # Complete checkout flow
│   └── order-history.feature.md       # Order tracking and management
├── fixtures/
│   ├── users.ts                       # Test user data
│   ├── products.ts                    # Product fixtures
│   └── orders.ts                      # Order and address fixtures
└── README.md                          # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- CopilotTest installed (`npm install copilot-test`)
- GitHub Copilot SDK access

### Running the Tests

```bash
# Run all e-commerce tests (explicit file list)
copilot-test run \
  examples/e-commerce/features/authentication.feature.md \
  examples/e-commerce/features/product-catalog.feature.md \
  examples/e-commerce/features/shopping-cart.feature.md \
  examples/e-commerce/features/checkout.feature.md \
  examples/e-commerce/features/order-history.feature.md

# Run a specific feature
copilot-test run examples/e-commerce/features/authentication.feature.md

# Run with a specific environment
copilot-test run --env=staging examples/e-commerce/features/authentication.feature.md
```

### Configuration

Each test file includes its own configuration via YAML frontmatter. You can also create a shared config:

```yaml
# copilot-test.config.yaml
model: gpt-5-mini
platforms:
  web:
    platform: web
    browser: chromium
    headless: true
baseUrl: https://demo.example-shop.com
stepTimeout: 30000
retry:
  maxRetries: 1
screenshotOnFailure: true
outputDir: copilot-test-results/e-commerce
```

## Test Features

### 1. Authentication Tests (`authentication.feature.md`)

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
```markdown
## Background
- Given the e-commerce website is available
- And I am not logged in

## Scenario: Customer logs in with valid credentials
<!-- ✓ Positive test -->
- Given I have valid credentials
- When I enter my username and password
- Then I should be logged in

## Scenario: Login fails with incorrect password
<!-- ✗ Negative test -->
- Given I have an incorrect password
- When I attempt to log in
- Then I should see an error message
```

### 2. Product Catalog Tests (`product-catalog.feature.md`)

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
```markdown
## Scenario: Customer filters products by multiple criteria
- When I select the "Electronics" category
- And I set price range to $100 - $1000
- And I select "4+ stars" rating filter
- Then I should see only electronics products between $100-$1000 with 4+ star ratings

## Scenario: Customer searches for non-existent product
- When I search for "xyznonexistent"
- Then I should see a "No results found" message
- And I should see suggestions or alternatives
```

### 3. Shopping Cart Tests (`shopping-cart.feature.md`)

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
```markdown
## Scenario: Cart calculates totals correctly
- When I add a laptop and a t-shirt to the cart
- Then the subtotal should reflect both item prices
- And tax should be calculated and displayed
- And the final total should include all charges

## Scenario: Logged-in customer cart persists across sessions
- Given I have items in my cart
- When I log out
- And I close the browser
- And I reopen the browser and log back in
- Then my cart should still contain the items I added previously
```

### 4. Checkout Tests (`checkout.feature.md`)

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
```markdown
## Scenario: Complete checkout as registered user
- When I enter shipping address
- And I continue to payment
- Then I should see the order summary
- When I enter payment details
- And I click "Place Order"
- Then I should see an order confirmation page

## Scenario: Product becomes unavailable during checkout
- Given I have items in my cart
- When a product becomes unavailable during checkout
- Then I should be notified that an item is no longer available
- And I should be returned to my cart
- And I should have options to remove it or continue with other items
```

### 5. Order History Tests (`order-history.feature.md`)

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
```markdown
## Scenario: Customer filters orders by status
- When I select "Delivered" from the status filter
- Then I should see only orders with "Delivered" status

## Scenario: Customer reorders items from previous order
- Given I am viewing a previous order
- When I click the "Reorder" button
- Then all items from that order should be added to my cart
```

## Using Fixtures

Fixtures provide reusable test data across scenarios. Reference fixture values directly in your Markdown step descriptions:

### User Fixtures

```markdown
## Scenario: Customer logs in
- Given I am logged in as "registeredCustomer"
- Given I am logged in as "premiumCustomer"
- Given I am logged in as "adminUser"
```

### Product Fixtures

```markdown
## Scenario: Add product to cart
- When I add "Laptop Pro 15" to the cart
```

### Order Fixtures

```markdown
## Scenario: Complete checkout
- When I enter shipping address: 123 Main St, New York, NY 10001
```

> **Note:** Fixture data files (`fixtures/users.ts`, `fixtures/products.ts`, `fixtures/orders.ts`)
> are still used by the test runner. Reference fixture values by name in your step descriptions.

## Best Practices

### 1. Use Background Steps

```markdown
## Background
- Given the e-commerce website is available
- And I am not logged in
```

Background steps run before each scenario, reducing duplication.

### 2. Tag Your Scenarios

```markdown
---
tags: [smoke, critical, checkout]
---
```

Or use inline annotations:

```markdown
## Scenario: Critical checkout flow @smoke @critical @checkout
```

Tags help with selective test execution:
- `@smoke` - Critical happy path tests
- `@negative` - Error/edge case tests
- `@validation` - Form validation tests

### 3. Test Both Positive and Negative Cases

```markdown
## Scenario: Customer applies valid discount code
- When I apply discount code "SAVE10"
- Then I should see 10% discount applied

## Scenario: Customer enters invalid discount code
- When I apply discount code "INVALID"
- Then I should see an error message
```

### 4. Use Descriptive Step Names

```markdown
<!-- ✅ Good -->
- When I enter username "testuser" and password "Test@123"
- Then I should see a welcome message containing my username

<!-- ❌ Avoid -->
- When I submit the form
- Then It works
```

### 5. Verify Complete User Experience

```markdown
## Scenario: Order confirmation
- Then I should see an order confirmation page
- And I should see my order number
- And I should see order summary with items and total
- And I should receive a confirmation email
```

## Troubleshooting

### Tests Timing Out

**Problem**: Steps exceed the timeout duration

**Solutions**:
```yaml
# copilot-test.config.yaml — increase step timeout
stepTimeout: 60000  # 60 seconds

# Or use retry mechanism
retry:
  maxRetries: 2
  stepRetries: 3
```

### Element Not Found

**Problem**: AI cannot locate elements on the page

**Solutions**:
- Make step descriptions more specific
- Add intermediate waiting steps
- Verify the page URL/state before interacting

```markdown
<!-- ❌ Vague -->
- When I click the button

<!-- ✅ Specific -->
- When I click the "Add to Cart" button on the product page
```

### Cart Not Persisting

**Problem**: Cart items disappear between scenarios

**Solutions**:
- Clear cart in background step
- Use separate test users
- Test cart persistence as explicit scenario

```markdown
## Background
- Given the shopping cart is empty initially
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

```markdown
## Scenario: Proceed to checkout
- When I click "Proceed to Checkout"
- And I wait for the checkout page to load completely
- Then I should be on the checkout page
```

## Customization

### Adapting for Your Application

1. **Update base URL** in configuration
2. **Modify fixtures** to match your data model
3. **Adjust step descriptions** to match your UI
4. **Add/remove scenarios** based on your features
5. **Update tags** for your test organization

### Adding New Scenarios

```markdown
## Scenario: Your new scenario @custom-tag
- Given initial state
- When user action
- Then expected outcome
```

### Creating Additional Features

Follow the pattern:
1. Create `features/new-feature.feature.md`
2. Add YAML frontmatter with platform and tags
3. Define feature with background
4. Add scenarios with tags
5. Run with `copilot-test run`

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
      - run: copilot-test run examples/e-commerce/features/*.feature.md
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
# Run specific feature
copilot-test run examples/e-commerce/features/checkout.feature.md
```

## Next Steps

1. **Explore other examples**:
   - [SaaS Application](../saas-app/README.md)
   - [API Testing](../api-testing/README.md)
   - [Mobile App](../mobile-app/README.md)

2. **Learn advanced features**:
   - [Retry Mechanisms](../../examples/retry-example.feature.md)
   - [Performance Monitoring](../../examples/performance-monitoring.feature.md)
   - [Plugins](../../docs/PLUGINS.md)

3. **Customize for your application**

## Support

- [Documentation](../../README.md)
- [GitHub Issues](https://github.com/Hiosdra/CopilotTest/issues)
- [Contributing Guide](../../CONTRIBUTING.md)
