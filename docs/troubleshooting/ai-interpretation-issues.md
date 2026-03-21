# AI Interpretation Issues

Learn how to write test steps that the AI can accurately understand and execute.

## Understanding AI Step Interpretation

CopilotTest uses AI to interpret natural language test steps. The AI:
1. Reads your step text
2. Understands the intent
3. Determines which MCP tools to use
4. Executes the action
5. Verifies the result

## Writing Steps the AI Understands

### Be Specific

✅ **Good - Clear and specific:**
```typescript
.when('I click the "Submit Order" button')
.then('I should see "Order #12345 confirmed"')
.and('the total should be "$99.99"')
```

❌ **Avoid - Vague and unclear:**
```typescript
.when('I submit')
.then('it works')
.and('the price is right')
```

### Use Active Voice

✅ **Good - First person, active:**
```typescript
.given('I am on the login page')
.when('I enter my email address')
.then('I should see a confirmation')
```

❌ **Avoid - Passive voice:**
```typescript
.given('the login page is displayed')
.when('the email address is entered')
.then('a confirmation is shown')
```

### Include Exact Values

✅ **Good - Concrete values:**
```typescript
.when('I enter "john@example.com" in the email field')
.and('I enter "password123" in the password field')
```

❌ **Avoid - Abstract references:**
```typescript
.when('I enter my credentials')
.and('I log in')
```

### Quote UI Text

✅ **Good - Quoted text:**
```typescript
.when('I click the "Sign In" button')
.then('I should see "Welcome back, John"')
```

❌ **Avoid - Unquoted or paraphrased:**
```typescript
.when('I click the signin button')
.then('I should see a welcome message')
```

## Common Interpretation Problems

### Problem 1: AI Can't Find Element

**Symptoms:**
```
✗ When I click the button
Error: Multiple buttons found, unclear which to click
```

**Solutions:**

**A. Specify the button:**
```typescript
// Vague
.when('I click the button')

// Specific
.when('I click the "Submit" button')
.when('I click the blue "Continue" button')
.when('I click the button with text "Next Step"')
```

**B. Use element context:**
```typescript
.when('I click the "Delete" button in the user row')
.when('I click the "Save" button at the bottom of the form')
```

### Problem 2: Ambiguous Actions

**Symptoms:**
```
✗ When I select the option
Error: Unclear what to select or where
```

**Solutions:**

**A. Specify what and where:**
```typescript
// Vague
.when('I select the option')

// Specific
.when('I select "United States" from the country dropdown')
.when('I select the "Premium" pricing option')
```

**B. Break into steps:**
```typescript
// Combined - might confuse AI
.when('I select shipping and payment options')

// Separated - clear
.when('I select "Express Shipping"')
.and('I select "Credit Card" as payment method')
```

### Problem 3: Unclear Validation

**Symptoms:**
```
✗ Then the page should be correct
Error: Unclear what "correct" means
```

**Solutions:**

**A. Specify what to verify:**
```typescript
// Vague
.then('the page should be correct')

// Specific
.then('I should see the text "Order Confirmed"')
.and('the order number should be "12345"')
.and('the status should be "Processing"')
```

**B. Verify multiple aspects:**
```typescript
.then('the page title should be "Dashboard"')
.and('I should see "Welcome, John"')
.and('the navigation menu should be visible')
.and('the sidebar should show my profile picture')
```

### Problem 4: Complex Multi-Step Actions

**Symptoms:**
```
✗ When I complete the registration
Error: Too many steps combined, AI unsure how to proceed
```

**Solutions:**

**A. Break down complex actions:**
```typescript
// Too complex
.when('I complete the registration')

// Broken down
.when('I enter "John Doe" in the name field')
.and('I enter "john@example.com" in the email field')
.and('I enter "password123" in the password field')
.and('I check the "I agree to terms" checkbox')
.and('I click the "Register" button')
```

**B. Use background for setup:**
```typescript
.background()
  .given('I am on the registration page')
  .and('I have filled in my personal details')

.scenario('Complete registration')
  .when('I agree to the terms')
  .and('I click Register')
  .then('I should be registered')
  .done()
```

## Platform-Specific Tips

### Web Testing

**Element Selection:**
```typescript
// Clear element identification
.when('I click the "Login" button')              // ✓ Button with text
.when('I click the button with id "submit-btn"') // ✓ Specific ID
.when('I click the first "Add to Cart" button')  // ✓ Position specified

// Can be ambiguous
.when('I click submit')                          // ✗ No quotes, unclear
.when('I click the form button')                 // ✗ Which form button?
```

**Form Interactions:**
```typescript
// Clear form interactions
.when('I enter "john@example.com" in the email field')
.and('I select "United States" from the country dropdown')
.and('I check the "Remember me" checkbox')

// Unclear
.when('I fill the form')
.and('I select my country')
```

**Waiting:**
```typescript
// Explicit waits
.when('I wait for the loading spinner to disappear')
.and('I wait for the data table to appear')
.then('the table should have at least 1 row')

// Implicit - might fail
.then('the table should have rows')  // Might check before loading
```

### API Testing

**HTTP Methods:**
```typescript
// Clear HTTP requests
.when('I send a GET request to /api/users')
.when('I send a POST request to /api/users')
.when('I send a DELETE request to /api/users/123')

// Unclear
.when('I request users')
.when('I create a user')  // POST? PUT?
```

**Request Bodies:**
```typescript
// Clear JSON structure
.when('I send a POST request to /api/users')
.withDocString(`{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}`)

// Unclear
.when('I send a POST request with user data')
```

**Response Validation:**
```typescript
// Specific assertions
.then('the response status should be 201')
.and('the response should have property "id"')
.and('the response.name should be "John Doe"')

// Vague
.then('the response should be correct')
.and('the user should be created')
```

### Mobile Testing

**Gestures:**
```typescript
// Clear gestures
.when('I swipe left on the screen')
.when('I swipe down from the top')
.when('I tap the "Settings" icon')
.when('I long press the message')

// Unclear
.when('I swipe')
.when('I press the icon')
```

**Element Location:**
```typescript
// Clear location
.when('I tap the "Login" button at the bottom of the screen')
.when('I tap the menu icon in the top right')
.when('I scroll down the news feed')

// Vague
.when('I tap the button')
.when('I scroll')
```

## Improving Step Clarity

### 1. Use Descriptive Names

```typescript
// Good
.scenario('Login with valid admin credentials')
.scenario('Submit contact form with missing required fields')

// Less clear
.scenario('Test login')
.scenario('Form validation')
```

### 2. Add Context

```typescript
// Good - provides context
.given('I am on the checkout page')
.and('I have 3 items in my cart')
.when('I proceed to payment')

// Less context
.when('I proceed to payment')
```

### 3. Be Consistent

```typescript
// Consistent terminology
.when('I click the "Submit" button')
.when('I click the "Cancel" button')
.when('I click the "Save" button')

// Inconsistent
.when('I click the "Submit" button')
.when('I press Cancel')
.when('I hit save')
```

### 4. Use Data Tables for Structured Data

```typescript
// Good - structured data
.scenario('Login with different users')
  .when('I login with credentials:')
  .withTable([
    ['Username', 'Password'],
    ['admin@example.com', 'admin123'],
    ['user@example.com', 'user123']
  ])

// Less structured
.when('I login as admin@example.com with admin123')
.and('I login as user@example.com with user123')
```

## Reviewing AI Reasoning

After a test runs, review the AI's reasoning in the HTML report:

```
✓ When I click the "Submit" button (1.2s)

AI Reasoning:
  1. Locating button element with text "Submit"
  2. Found button with selector: button.btn-primary
  3. Clicking button
  4. ✓ Click successful, waiting for navigation
  5. ✓ Navigation complete
```

If the reasoning shows confusion:
- The AI tried multiple approaches
- The AI made assumptions
- The AI couldn't find what you described

Refine your step to be clearer.

## Testing Your Steps

### 1. Run with headless: false

Watch the AI execute your steps:

```typescript
configure({
  platforms: {
    web: webPlatform({
      headless: false  // See what the AI does
    })
  }
});
```

### 2. Use Debug Mode

See detailed AI reasoning:

```typescript
configure({
  debugMode: true
});
```

### 3. Review Reports

Check the HTML report for:
- Step execution time
- AI reasoning
- Errors or warnings
- Screenshots

## When AI Still Struggles

If the AI consistently misinterprets a step:

### Option 1: Use Custom Steps

Define exact behavior:

```typescript
import { defineStep } from 'copilot-test';

defineStep(
  /^I complete the checkout process$/,
  async (context) => {
    // Precise implementation
    await fillShippingInfo();
    await selectPaymentMethod();
    await confirmOrder();
  }
);
```

### Option 2: Break Down Further

```typescript
// Instead of complex step
.when('I complete checkout')

// Break into granular steps
.when('I enter shipping address "123 Main St"')
.and('I select shipping method "Express"')
.and('I enter card number "4111111111111111"')
.and('I enter expiry "12/25"')
.and('I enter CVV "123"')
.and('I click "Place Order"')
```

### Option 3: Add Wait Steps

```typescript
.when('I click "Load Data"')
.and('I wait 2 seconds')  // Explicit wait
.and('I wait for the loading spinner to disappear')
.then('the data should be visible')
```

## Best Practices Summary

1. ✅ **Be specific**: Include exact text, values, and selectors
2. ✅ **Use active voice**: "I click" not "button is clicked"
3. ✅ **Quote UI text**: "Submit Order" not Submit Order
4. ✅ **One action per step**: Don't combine multiple actions
5. ✅ **Verify explicitly**: State exactly what to check
6. ✅ **Add context**: Provide background and state
7. ✅ **Be consistent**: Use same terminology throughout
8. ✅ **Review AI reasoning**: Learn how AI interprets your steps

## Next Steps

- [Common Errors](./common-errors.md)
- [Debugging Guide](../guides/debugging.md)
- [Best Practices](../guides/best-practices.md)
- [Custom Steps Guide](../CUSTOM_STEPS.md)
