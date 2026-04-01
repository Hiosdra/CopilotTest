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
```markdown
- When I click the "Submit Order" button
- Then I should see "Order #12345 confirmed"
- And the total should be "$99.99"
```

❌ **Avoid - Vague and unclear:**
```markdown
- When I submit
- Then it works
- And the price is right
```

### Use Active Voice

✅ **Good - First person, active:**
```markdown
- Given I am on the login page
- When I enter my email address
- Then I should see a confirmation
```

❌ **Avoid - Passive voice:**
```markdown
- Given the login page is displayed
- When the email address is entered
- Then a confirmation is shown
```

### Include Exact Values

✅ **Good - Concrete values:**
```markdown
- When I enter "john@example.com" in the email field
- And I enter "password123" in the password field
```

❌ **Avoid - Abstract references:**
```markdown
- When I enter my credentials
- And I log in
```

### Quote UI Text

✅ **Good - Quoted text:**
```markdown
- When I click the "Sign In" button
- Then I should see "Welcome back, John"
```

❌ **Avoid - Unquoted or paraphrased:**
```markdown
- When I click the signin button
- Then I should see a welcome message
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
```markdown
<!-- Vague -->
- When I click the button

<!-- Specific -->
- When I click the "Submit" button
- When I click the blue "Continue" button
- When I click the button with text "Next Step"
```

**B. Use element context:**
```markdown
- When I click the "Delete" button in the user row
- When I click the "Save" button at the bottom of the form
```

### Problem 2: Ambiguous Actions

**Symptoms:**
```
✗ When I select the option
Error: Unclear what to select or where
```

**Solutions:**

**A. Specify what and where:**
```markdown
<!-- Vague -->
- When I select the option

<!-- Specific -->
- When I select "United States" from the country dropdown
- When I select the "Premium" pricing option
```

**B. Break into steps:**
```markdown
<!-- Combined - might confuse AI -->
- When I select shipping and payment options

<!-- Separated - clear -->
- When I select "Express Shipping"
- And I select "Credit Card" as payment method
```

### Problem 3: Unclear Validation

**Symptoms:**
```
✗ Then the page should be correct
Error: Unclear what "correct" means
```

**Solutions:**

**A. Specify what to verify:**
```markdown
<!-- Vague -->
- Then the page should be correct

<!-- Specific -->
- Then I should see the text "Order Confirmed"
- And the order number should be "12345"
- And the status should be "Processing"
```

**B. Verify multiple aspects:**
```markdown
- Then the page title should be "Dashboard"
- And I should see "Welcome, John"
- And the navigation menu should be visible
- And the sidebar should show my profile picture
```

### Problem 4: Complex Multi-Step Actions

**Symptoms:**
```
✗ When I complete the registration
Error: Too many steps combined, AI unsure how to proceed
```

**Solutions:**

**A. Break down complex actions:**
```markdown
<!-- Too complex -->
- When I complete the registration

<!-- Broken down -->
- When I enter "John Doe" in the name field
- And I enter "john@example.com" in the email field
- And I enter "password123" in the password field
- And I check the "I agree to terms" checkbox
- And I click the "Register" button
```

**B. Use background for setup:**
```markdown
## Background:
- Given I am on the registration page
- And I have filled in my personal details

## Scenario: Complete registration
- When I agree to the terms
- And I click Register
- Then I should be registered
```

## Platform-Specific Tips

### Web Testing

**Element Selection:**
```markdown
<!-- Clear element identification -->
- When I click the "Login" button                <!-- ✓ Button with text -->
- When I click the button with id "submit-btn"   <!-- ✓ Specific ID -->
- When I click the first "Add to Cart" button    <!-- ✓ Position specified -->

<!-- Can be ambiguous -->
- When I click submit                            <!-- ✗ No quotes, unclear -->
- When I click the form button                   <!-- ✗ Which form button? -->
```

**Form Interactions:**
```markdown
<!-- Clear form interactions -->
- When I enter "john@example.com" in the email field
- And I select "United States" from the country dropdown
- And I check the "Remember me" checkbox

<!-- Unclear -->
- When I fill the form
- And I select my country
```

**Waiting:**
```markdown
<!-- Explicit waits -->
- When I wait for the loading spinner to disappear
- And I wait for the data table to appear
- Then the table should have at least 1 row

<!-- Implicit - might fail -->
- Then the table should have rows   <!-- Might check before loading -->
```

### API Testing

**HTTP Methods:**
```markdown
<!-- Clear HTTP requests -->
- When I send a GET request to /api/users
- When I send a POST request to /api/users
- When I send a DELETE request to /api/users/123

<!-- Unclear -->
- When I request users
- When I create a user   <!-- POST? PUT? -->
```

**Request Bodies:**
````markdown
<!-- Clear JSON structure -->
- When I send a POST request to /api/users
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
  ```

<!-- Unclear -->
- When I send a POST request with user data
````

**Response Validation:**
```markdown
<!-- Specific assertions -->
- Then the response status should be 201
- And the response should have property "id"
- And the response.name should be "John Doe"

<!-- Vague -->
- Then the response should be correct
- And the user should be created
```

### Mobile Testing

**Gestures:**
```markdown
<!-- Clear gestures -->
- When I swipe left on the screen
- When I swipe down from the top
- When I tap the "Settings" icon
- When I long press the message

<!-- Unclear -->
- When I swipe
- When I press the icon
```

**Element Location:**
```markdown
<!-- Clear location -->
- When I tap the "Login" button at the bottom of the screen
- When I tap the menu icon in the top right
- When I scroll down the news feed

<!-- Vague -->
- When I tap the button
- When I scroll
```

## Improving Step Clarity

### 1. Use Descriptive Names

```markdown
<!-- Good -->
## Scenario: Login with valid admin credentials
## Scenario: Submit contact form with missing required fields

<!-- Less clear -->
## Scenario: Test login
## Scenario: Form validation
```

### 2. Add Context

```markdown
<!-- Good - provides context -->
- Given I am on the checkout page
- And I have 3 items in my cart
- When I proceed to payment

<!-- Less context -->
- When I proceed to payment
```

### 3. Be Consistent

```markdown
<!-- Consistent terminology -->
- When I click the "Submit" button
- When I click the "Cancel" button
- When I click the "Save" button

<!-- Inconsistent -->
- When I click the "Submit" button
- When I press Cancel
- When I hit save
```

### 4. Use Data Tables for Structured Data

```markdown
<!-- Good - structured data -->
## Scenario: Login with different users
- When I login with credentials:

| Username | Password |
|----------|----------|
| admin@example.com | admin123 |
| user@example.com | user123 |

<!-- Less structured -->
- When I login as admin@example.com with admin123
- And I login as user@example.com with user123
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

```yaml
# copilot-test.config.yaml
platforms:
  web:
    type: web
    headless: false  # See what the AI does
```

### 2. Use Debug Mode

See detailed AI reasoning:

```yaml
# copilot-test.config.yaml
debugMode: true
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

```markdown
<!-- Instead of complex step -->
- When I complete checkout

<!-- Break into granular steps -->
- When I enter shipping address "123 Main St"
- And I select shipping method "Express"
- And I enter card number "4111111111111111"
- And I enter expiry "12/25"
- And I enter CVV "123"
- And I click "Place Order"
```

### Option 3: Add Wait Steps

```markdown
- When I click "Load Data"
- And I wait 2 seconds                              <!-- Explicit wait -->
- And I wait for the loading spinner to disappear
- Then the data should be visible
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
