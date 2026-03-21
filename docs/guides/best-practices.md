# Best Practices

Learn how to write effective, maintainable, and reliable tests with CopilotTest.

## Writing Effective Test Steps

### Be Specific and Clear

The AI interprets your steps, so clarity is crucial.

✅ **Good Examples:**
```typescript
.given('I am on https://example.com/login')
.when('I enter "john@example.com" in the email field')
.and('I enter "password123" in the password field')
.and('I click the "Login" button')
.then('I should see "Welcome, John" on the dashboard')
.and('the URL should be https://example.com/dashboard')
```

❌ **Avoid:**
```typescript
.given('I navigate')  // Where to?
.when('I login')      // How? With what credentials?
.then('it works')     // What does "works" mean?
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
```typescript
.when('I enter username "admin@example.com"')
.and('I enter password "SecurePass123"')
```

❌ **Vague:**
```typescript
.when('I enter my credentials')
```

### Quote Text Literals

Use quotes for exact text matching:

```typescript
.when('I click the "Submit" button')          // Looks for button with text "Submit"
.then('I should see "Order confirmed"')        // Checks for exact text
.and('the page title should be "Dashboard"')  // Exact title match
```

## Organizing Tests

### Feature Structure

Group related scenarios in features:

```typescript
feature('User Authentication')
  .scenario('Successful login')
  .scenario('Failed login - invalid password')
  .scenario('Failed login - non-existent user')
  .scenario('Logout')
  ._build();

feature('Shopping Cart')
  .scenario('Add item to cart')
  .scenario('Remove item from cart')
  .scenario('Update item quantity')
  ._build();
```

### File Organization

```
tests/
├── auth/
│   ├── login.spec.ts
│   ├── registration.spec.ts
│   └── password-reset.spec.ts
├── checkout/
│   ├── cart.spec.ts
│   ├── payment.spec.ts
│   └── shipping.spec.ts
└── admin/
    ├── users.spec.ts
    └── products.spec.ts
```

### Naming Conventions

**Files:**
- Use kebab-case: `user-management.spec.ts`
- Suffix with `.spec.ts` or `.spec.js`
- Be descriptive: `checkout-payment-flow.spec.ts`

**Features:**
- Use title case: `"User Authentication"`
- Be concise but clear: `"Shopping Cart Management"`

**Scenarios:**
- Start with action or outcome: `"Successful login with valid credentials"`
- Be specific: `"Add multiple items to cart"`
- Include context: `"Checkout as guest user"`

## Using Tags Effectively

### Standard Tag Conventions

```typescript
feature('Login')
  .tag('@smoke')        // Quick smoke tests
  .tag('@critical')     // Critical business functionality

  .scenario('Admin login')
    .tag('@auth')       // Authentication-related
    .tag('@slow')       // Slow-running tests
    .done()

  .scenario('Invalid password')
    .tag('@negative')   // Negative test cases
    .tag('@validation') // Input validation tests
    .done()
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

```typescript
// Good - realistic data
.when('I enter email "john.doe@example.com"')
.and('I enter phone "+1-555-123-4567"')

// Avoid - test-looking data
.when('I enter email "test@test.com"')
.and('I enter phone "1234567890"')
```

### Scenario Context for Data Sharing

Use ScenarioContext to share data between steps:

```typescript
import { configure, feature, test, run } from 'copilot-test';
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

```typescript
feature('Login Validation')
  .scenarioOutline('Login with different credentials')
    .given('I am on the login page')
    .when('I enter username "<username>"')
    .and('I enter password "<password>"')
    .and('I click Login')
    .then('I should see "<message>"')
    .examples([
      { username: 'admin@example.com', password: 'admin123', message: 'Welcome Admin' },
      { username: 'user@example.com', password: 'user123', message: 'Welcome User' },
      { username: 'invalid@example.com', password: 'wrong', message: 'Invalid credentials' },
      { username: '', password: '', message: 'Username is required' }
    ])
    .done()
  ._build();
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

feature('Product Management')
  .scenario('View product details')
    .given('I have a product "Laptop" in the database')  // Custom step
    .when('I navigate to the product listing page')      // AI step
    .and('I click on "Laptop"')                          // AI step
    .then('I should see the product details')            // AI step
    .and('the price should be "$999"')                   // AI step
    .done()
  ._build();
```

## Error Handling

### Retry Strategy

Configure retries for flaky steps:

```typescript
configure({
  retry: {
    enabled: true,
    stepRetries: 3,
    strategy: 'exponential',

    // Only retry network errors
    retryOn: ['timeout', 'network error', /connection/i],

    // Don't retry assertion failures
    skipRetryOn: ['assertion failed', /validation error/i]
  }
});
```

### Clear Error Messages

Write assertions that produce clear failures:

✅ **Clear:**
```typescript
.then('I should see "Order #12345 confirmed"')
.and('the total should be "$199.99"')
.and('the status should be "Processing"')
```

❌ **Unclear:**
```typescript
.then('the order is correct')
```

## Performance Optimization

### Use Headless Mode in CI

```typescript
configure({
  platforms: {
    web: webPlatform({
      headless: process.env.CI === 'true'
    })
  }
});
```

### Parallel Execution for Large Suites

```typescript
configure({
  parallel: true,
  maxWorkers: 'auto',
  workerTimeout: 300000
});
```

### Tag Fast vs Slow Tests

```typescript
feature('Quick Checks')
  .tag('@fast', '@smoke')
  .scenario('Homepage loads')
    // ... quick test
    .done()
  ._build();

feature('Complete Checkout Flow')
  .tag('@slow', '@e2e')
  .scenario('Full purchase journey')
    // ... comprehensive test
    .done()
  ._build();
```

**Note:** The CLI currently parses the `--tag` flag but doesn't apply filtering during execution. For tag-based filtering, configure it programmatically or use multiple test files.

## Maintenance

### Keep Tests Independent

Each scenario should be completely independent:

✅ **Independent:**
```typescript
.scenario('Add product to cart')
  .given('I am on the product page for "Laptop"')  // Set up own state
  .when('I click "Add to Cart"')
  .then('the cart count should be 1')
  .done()

.scenario('Remove product from cart')
  .given('I have "Laptop" in my cart')            // Set up own state
  .when('I click "Remove"')
  .then('the cart should be empty')
  .done()
```

❌ **Dependent:**
```typescript
.scenario('Add product to cart')
  // ... adds product
  .done()

.scenario('Remove product from cart')
  .given('I am on the cart page')  // Assumes previous test ran!
  // ...
  .done()
```

### Use Background for Common Setup

```typescript
feature('Shopping Cart')
  .background()
    .given('I am logged in as "user@example.com"')
    .and('I have an empty cart')

  .scenario('Add product')
    .when('I add "Laptop" to cart')
    .then('the cart should contain 1 item')
    .done()

  .scenario('Apply coupon')
    .when('I apply coupon code "SAVE10"')
    .then('I should see a 10% discount')
    .done()
  ._build();
```

### Regular Review and Refactoring

- Remove obsolete tests
- Consolidate duplicate scenarios
- Update test data to match current app state
- Refactor complex tests into smaller scenarios

## Documentation

### Self-Documenting Tests

Write steps that explain what's being tested:

```typescript
feature('Password Reset Flow')
  .description('Ensures users can reset forgotten passwords via email')

  .scenario('Request password reset')
    .given('I am on the login page')
    .when('I click "Forgot Password?"')
    .and('I enter my email "user@example.com"')
    .and('I click "Send Reset Link"')
    .then('I should see "Check your email for reset instructions"')
    .done()

  .scenario('Reset password with valid token')
    .given('I have received a password reset email')
    .and('I click the reset link in the email')
    .when('I enter new password "NewSecure123"')
    .and('I confirm password "NewSecure123"')
    .and('I click "Reset Password"')
    .then('I should see "Password successfully reset"')
    .and('I should be redirected to the login page')
    .done()
  ._build();
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

```typescript
configure({
  failFast: process.env.CI === 'true',
  parallel: true,
  maxWorkers: 4
});
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

```typescript
feature('Dashboard Features')
  .background()
    .given('I am logged in as an admin')

  .scenario('View user list')
    .when('I navigate to Users')
    .then('I should see the user management page')
    .done()

  .scenario('View analytics')
    .when('I navigate to Analytics')
    .then('I should see the analytics dashboard')
    .done()
  ._build();
```

### Test Both Positive and Negative Cases

```typescript
feature('Form Validation')
  .scenario('Submit valid form')
    .tag('@positive')
    .given('I am on the contact form')
    .when('I enter valid data in all fields')
    .and('I submit the form')
    .then('I should see "Thank you for your message"')
    .done()

  .scenario('Submit with invalid email')
    .tag('@negative', '@validation')
    .given('I am on the contact form')
    .when('I enter "invalid-email" in the email field')
    .and('I submit the form')
    .then('I should see "Please enter a valid email address"')
    .done()
  ._build();
```

### Progressive Complexity

Start simple, add complexity:

```typescript
// Level 1: Basic happy path
.scenario('Basic login')
  .given('I am on the login page')
  .when('I enter valid credentials')
  .then('I should be logged in')
  .done()

// Level 2: Add specifics
.scenario('Admin user login')
  .given('I am on https://app.example.com/login')
  .when('I enter username "admin@example.com"')
  .and('I enter password "SecurePass123"')
  .and('I click the "Sign In" button')
  .then('I should see the admin dashboard')
  .and('I should see "Welcome, Admin"')
  .done()

// Level 3: Add edge cases
.scenario('Login with MFA enabled')
  .given('I am on the login page')
  .and('my account has MFA enabled')
  .when('I enter valid credentials')
  .and('I click Sign In')
  .then('I should see the MFA challenge page')
  .when('I enter my 6-digit MFA code')
  .then('I should be logged in')
  .and('I should see my dashboard')
  .done()
```

## Next Steps

- [Configuration Guide](./configuration.md) - Advanced configuration
- [Debugging Guide](./debugging.md) - Debug failing tests
- [Custom Steps Guide](../CUSTOM_STEPS.md) - Create reusable steps
