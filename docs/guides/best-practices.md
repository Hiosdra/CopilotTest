# Best Practices

Learn how to write effective, maintainable, and reliable tests with CopilotTest.

## Writing Effective Test Steps

### Be Specific and Clear

The AI interprets your steps, so clarity is crucial.

✅ **Good Examples:**
```markdown
- Given I am on https://example.com/login
- When I enter "john@example.com" in the email field
- And I enter "password123" in the password field
- And I click the "Login" button
- Then I should see "Welcome, John" on the dashboard
- And the URL should be https://example.com/dashboard
```

❌ **Avoid:**
```markdown
- Given I navigate       <!-- Where to? -->
- When I login           <!-- How? With what credentials? -->
- Then it works          <!-- What does "works" mean? -->
```

### Use Active Voice

Write steps in first person, present tense:

✅ **Active voice:**
- "I click the Submit button"
- "I enter my email address"
- "I should see a success message"

❌ **Passive voice:**
- "The button is clicked"
- "Email is entered"
- "Success message is shown"

### Include Specific Values

When possible, use actual values rather than variables:

✅ **Specific:**
```markdown
- When I enter username "admin@example.com"
- And I enter password "SecurePass123"
```

❌ **Vague:**
```markdown
- When I enter my credentials
```

### Quote Text Literals

Use quotes for exact text matching:

```markdown
- When I click the "Submit" button
- Then I should see "Order confirmed"
- And the page title should be "Dashboard"
```

## Organizing Tests

### Feature Structure

Group related scenarios in features:

```markdown
<!-- tests/auth/login.feature.md -->
---
platform: web
---

# Feature: User Authentication

## Scenario: Successful login
## Scenario: Failed login - invalid password
## Scenario: Failed login - non-existent user
## Scenario: Logout
```

```markdown
<!-- tests/checkout/cart.feature.md -->
---
platform: web
---

# Feature: Shopping Cart

## Scenario: Add item to cart
## Scenario: Remove item from cart
## Scenario: Update item quantity
```

### File Organization

```
tests/
├── auth/
│   ├── login.feature.md
│   ├── registration.feature.md
│   └── password-reset.feature.md
├── checkout/
│   ├── cart.feature.md
│   ├── payment.feature.md
│   └── shipping.feature.md
└── admin/
    ├── users.feature.md
    └── products.feature.md
```

### Naming Conventions

**Files:**
- Use kebab-case: `user-management.feature.md`
- Suffix with `.feature.md`
- Be descriptive: `checkout-payment-flow.feature.md`

**Features:**
- Use title case: `"User Authentication"`
- Be concise but clear: `"Shopping Cart Management"`

**Scenarios:**
- Start with action or outcome: `"Successful login with valid credentials"`
- Be specific: `"Add multiple items to cart"`
- Include context: `"Checkout as guest user"`

## Using Tags Effectively

### Standard Tag Conventions

```markdown
---
platform: web
tags: [smoke, critical]
---

# Feature: Login

## Scenario: Admin login
@auth @slow
- Given I am on the login page
- When I enter admin credentials
- Then I should be logged in

## Scenario: Invalid password
@negative @validation
- Given I am on the login page
- When I enter wrong password
- Then I should see error message
```

### Tag Categories

**By Test Type:**
- `@smoke` - Critical path, run on every commit
- `@regression` - Full regression suite
- `@integration` - Integration tests
- `@e2e` - End-to-end tests

**By Priority:**
- `@critical` - Must-pass tests
- `@high` - High priority
- `@medium` - Medium priority
- `@low` - Nice-to-have tests

**By Feature:**
- `@auth` - Authentication
- `@cart` - Shopping cart
- `@payment` - Payment processing
- `@admin` - Admin features

**By Test Nature:**
- `@positive` - Happy path tests
- `@negative` - Error/failure scenarios
- `@boundary` - Edge cases
- `@performance` - Performance tests

**By Speed:**
- `@fast` - Quick tests (<5s)
- `@slow` - Slow tests (>30s)

**By Environment:**
- `@prod-safe` - Safe to run in production
- `@staging-only` - Staging environment only
- `@local-only` - Local development only

## Test Data Management

### Use Realistic Data

✅ **Good - realistic data:**
```markdown
- When I enter email "john.doe@example.com"
- And I enter phone "+1-555-123-4567"
```

❌ **Avoid - test-looking data:**
```markdown
- When I enter email "test@test.com"
- And I enter phone "1234567890"
```

### Scenario Context for Data Sharing

Use ScenarioContext to share data between steps:

```typescript
import { defineStep } from 'copilot-test';

// Custom step to store user ID
defineStep(
  /^I create a user and store their ID$/,
  async (context) => {
    const userId = Math.floor(Math.random() * 10000);
    context.set('userId', userId);
    return `User created with ID: ${userId}`;
  }
);

// Use stored ID in later step
defineStep(
  /^I should see the user profile$/,
  async (context) => {
    const userId = context.get('userId');
    // Use userId to verify profile
    return `Verified profile for user ${userId}`;
  }
);
```

### Parameterized Tests with Scenario Outline

For data-driven testing:

```markdown
---
platform: web
---

# Feature: Login Validation

## Scenario Outline: Login with different credentials
- Given I am on the login page
- When I enter username "<username>"
- And I enter password "<password>"
- And I click Login
- Then I should see "<message>"

### Examples:
| username             | password | message             |
|----------------------|----------|---------------------|
| admin@example.com    | admin123 | Welcome Admin       |
| user@example.com     | user123  | Welcome User        |
| invalid@example.com  | wrong    | Invalid credentials |
|                      |          | Username is required |
```

## When to Use Custom Steps vs AI

### Use AI for:
- **Standard interactions**: Clicking, typing, navigating
- **Simple validations**: Text presence, URL checks
- **Exploratory scenarios**: One-off tests
- **Rapid prototyping**: Initial test development

### Use Custom Steps for:
- **Critical business logic**: Payment processing, order placement
- **Database operations**: Setup, teardown, data verification
- **Complex validations**: Multi-condition checks
- **Performance-critical operations**: Repeated operations
- **External integrations**: Third-party API calls
- **Test data generation**: Creating realistic test data

Example mix:

```typescript
defineStep(/^I have a product "(.+)" in the database$/, async (context, productName) => {
  // Custom step for database setup
  const productId = await database.insertProduct({ name: productName });
  context.set('productId', productId);
});

```

```markdown
## Scenario: View product details
- Given I have a product "Laptop" in the database
- When I navigate to the product listing page
- And I click on "Laptop"
- Then I should see the product details
- And the price should be "$999"
```

## Error Handling

### Retry Strategy

Configure retries for flaky steps:

```yaml
# copilot-test.config.yaml
retry:
  enabled: true
  stepRetries: 3
  strategy: exponential
  retryOn:
    - timeout
    - "network error"
    - "connection"
  skipRetryOn:
    - "assertion failed"
    - "validation error"
```

### Clear Error Messages

Write assertions that produce clear failures:

✅ **Clear:**
```markdown
- Then I should see "Order #12345 confirmed"
- And the total should be "$199.99"
- And the status should be "Processing"
```

❌ **Unclear:**
```markdown
- Then the order is correct
```

## Performance Optimization

### Use Headless Mode in CI

```yaml
platforms:
  web:
    platform: web
    headless: "${CI:-false}"
```

### Parallel Execution for Large Suites

```yaml
parallel: true
maxWorkers: auto
workerTimeout: 300000
```

### Tag Fast vs Slow Tests

```markdown
---
platform: web
tags: [fast, smoke]
---

# Feature: Quick Checks

## Scenario: Homepage loads
...
```

```markdown
---
platform: web
tags: [slow, e2e]
---

# Feature: Complete Checkout Flow

## Scenario: Full purchase journey
...
```

**Note:** The CLI currently parses the `--tag` flag but doesn't apply filtering during execution. For tag-based filtering, configure it programmatically or use multiple test files.

## Maintenance

### Keep Tests Independent

Each scenario should be completely independent:

✅ **Independent:**
```markdown
## Scenario: Add product to cart
- Given I am on the product page for "Laptop"
- When I click "Add to Cart"
- Then the cart count should be 1

## Scenario: Remove product from cart
- Given I have "Laptop" in my cart
- When I click "Remove"
- Then the cart should be empty
```

❌ **Dependent:**
```markdown
## Scenario: Add product to cart
<!-- ... adds product -->

## Scenario: Remove product from cart
- Given I am on the cart page    <!-- Assumes previous test ran! -->
<!-- ... -->
```

### Use Background for Common Setup

```markdown
---
platform: web
---

# Feature: Shopping Cart

## Background
- Given I am logged in as "user@example.com"
- And I have an empty cart

## Scenario: Add product
- When I add "Laptop" to cart
- Then the cart should contain 1 item

## Scenario: Apply coupon
- When I apply coupon code "SAVE10"
- Then I should see a 10% discount
```

### Regular Review and Refactoring

- Remove obsolete tests
- Consolidate duplicate scenarios
- Update test data to match current app state
- Refactor complex tests into smaller scenarios

## Documentation

### Self-Documenting Tests

Write steps that explain what's being tested:

```markdown
---
platform: web
---

# Feature: Password Reset Flow

Ensures users can reset forgotten passwords via email.

## Scenario: Request password reset
- Given I am on the login page
- When I click "Forgot Password?"
- And I enter my email "user@example.com"
- And I click "Send Reset Link"
- Then I should see "Check your email for reset instructions"

## Scenario: Reset password with valid token
- Given I have received a password reset email
- And I click the reset link in the email
- When I enter new password "NewSecure123"
- And I confirm password "NewSecure123"
- And I click "Reset Password"
- Then I should see "Password successfully reset"
- And I should be redirected to the login page
```

### Comment Complex Logic

For custom steps with complex logic:

```typescript
defineStep(
  /^I create (\d+) orders with "(.+)" status$/,
  async (context, count, status) => {
    /**
     * Creates multiple orders for testing bulk operations.
     * Orders are created with sequential IDs and stored in context
     * for later verification.
     */
    const orderIds = [];
    for (let i = 0; i < parseInt(count); i++) {
      const orderId = await createOrder({ status });
      orderIds.push(orderId);
    }
    context.set('orderIds', orderIds);
  }
);
```

## CI/CD Best Practices

### Separate Test Suites

```yaml
# .github/workflows/tests.yml
jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - run: npx copilot-test run tests/smoke/

  regression:
    runs-on: ubuntu-latest
    needs: smoke
    steps:
      - run: npx copilot-test run tests/regression/
```

### Fail Fast in CI

```yaml
# copilot-test.config.yaml
failFast: "${CI:-false}"
parallel: true
maxWorkers: 4
```

### Archive Test Artifacts

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-results
    path: |
      copilot-test-results/
      screenshots/
```

## Common Patterns

### Login Once, Test Many

Use background or fixtures for authentication:

```markdown
---
platform: web
---

# Feature: Dashboard Features

## Background
- Given I am logged in as an admin

## Scenario: View user list
- When I navigate to Users
- Then I should see the user management page

## Scenario: View analytics
- When I navigate to Analytics
- Then I should see the analytics dashboard
```

### Test Both Positive and Negative Cases

```markdown
---
platform: web
---

# Feature: Form Validation

## Scenario: Submit valid form
@positive
- Given I am on the contact form
- When I enter valid data in all fields
- And I submit the form
- Then I should see "Thank you for your message"

## Scenario: Submit with invalid email
@negative @validation
- Given I am on the contact form
- When I enter "invalid-email" in the email field
- And I submit the form
- Then I should see "Please enter a valid email address"
```

### Progressive Complexity

Start simple, add complexity:

```markdown
<!-- Level 1: Basic happy path -->
## Scenario: Basic login
- Given I am on the login page
- When I enter valid credentials
- Then I should be logged in

<!-- Level 2: Add specifics -->
## Scenario: Admin user login
- Given I am on https://app.example.com/login
- When I enter username "admin@example.com"
- And I enter password "SecurePass123"
- And I click the "Sign In" button
- Then I should see the admin dashboard
- And I should see "Welcome, Admin"

<!-- Level 3: Add edge cases -->
## Scenario: Login with MFA enabled
- Given I am on the login page
- And my account has MFA enabled
- When I enter valid credentials
- And I click Sign In
- Then I should see the MFA challenge page
- When I enter my 6-digit MFA code
- Then I should be logged in
- And I should see my dashboard
```

## Next Steps

- [Configuration Guide](./configuration.md) - Advanced configuration
- [Debugging Guide](./debugging.md) - Debug failing tests
- [Custom Steps Guide](../CUSTOM_STEPS.md) - Create reusable steps
