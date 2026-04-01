# Your First Test

This guide walks you through creating your first CopilotTest from scratch, explaining each concept along the way.

## What We'll Build

We'll create a complete login test that:
1. Navigates to a login page
2. Enters credentials
3. Submits the form
4. Verifies successful authentication

## Prerequisites

- CopilotTest installed ([Installation Guide](./installation.md))
- GitHub token configured
- Basic understanding of BDD (Given/When/Then)

## Step 1: Create the Test File

Create a new file `tests/login.feature.md`:

```bash
mkdir -p tests
touch tests/login.feature.md
```

## Step 2: Set Up Configuration

Ensure your `copilot-test.config.yaml` in the project root has the web platform configured:

```yaml
model: gpt-4o
stepTimeout: 30000
screenshotOnFailure: true
outputDir: test-results

platforms:
  web:
    platform: web
    browser: chromium
    headless: false
    baseUrl: "https://demo.example.com"
```

## Step 3: Define the Feature

Open `tests/login.feature.md` and add the feature header with YAML frontmatter:

```markdown
---
platform: web
tags: [critical, smoke]
---

# Feature: User Authentication

Tests for user login functionality.
```

**Feature elements:**
- **Frontmatter** (`---`): YAML metadata — `platform` and `tags`
- **`# Feature: Name`**: H1 heading declares the feature
- Description text below the heading (optional)

## Step 4: Add Your First Scenario

Add a scenario for successful login:

```markdown
## Scenario: Successful admin login @auth
- Given I am on the login page
- When I enter username "admin@example.com"
- And I enter password "SecurePassword123"
- And I click the "Login" button
- Then I should see the dashboard
- And I should see a welcome message "Welcome, Admin"
```

**Scenario structure:**
- `## Scenario: Name`: H2 heading starts a new scenario
- `@tag` annotations can be added inline after the scenario name
- `- Given ...`: Setup/precondition steps
- `- When ...`: Action steps
- `- Then ...`: Assertion/verification steps
- `- And ...`: Additional steps of any type

## Step 5: Register the Test

No registration is needed! The CLI discovers `.feature.md` files automatically. The `platform: web` frontmatter tells CopilotTest which platform to use.

## Complete Test File

Here's the complete `tests/login.feature.md`:

```markdown
---
platform: web
tags: [critical, smoke]
---

# Feature: User Authentication

Tests for user login functionality.

## Scenario: Successful admin login @auth
- Given I am on the login page
- When I enter username "admin@example.com"
- And I enter password "SecurePassword123"
- And I click the "Login" button
- Then I should see the dashboard
- And I should see a welcome message "Welcome, Admin"
```

That's it — no imports, no build step, no boilerplate. Configuration is handled by `copilot-test.config.yaml`.

## Step 6: Run Your Test

Execute the test:

```bash
npx copilot-test run tests/login.feature.md
```

Expected output:

```
🧪 CopilotTest - Test Execution
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature: User Authentication [@critical, @smoke]
  Scenario: Successful admin login [@auth]
    ✓ Given I am on the login page (1.8s)
    ✓ When I enter username "admin@example.com" (0.5s)
    ✓ And I enter password "SecurePassword123" (0.4s)
    ✓ And I click the "Login" button (1.2s)
    ✓ Then I should see the dashboard (0.6s)
    ✓ And I should see a welcome message "Welcome, Admin" (0.3s)

✨ Results: 1 feature, 1 scenario, 6 steps
   ✓ Passed: 1 scenario (6 steps)
   Duration: 4.8s

📊 Report: test-results/report.html
```

## Step 7: Add More Scenarios

Expand your test by adding negative test cases to the same file:

```markdown
---
platform: web
tags: [critical, smoke]
---

# Feature: User Authentication

## Scenario: Successful admin login @auth
- Given I am on the login page
- When I enter username "admin@example.com"
- And I enter password "SecurePassword123"
- And I click the "Login" button
- Then I should see the dashboard

## Scenario: Login with invalid credentials @auth @negative
- Given I am on the login page
- When I enter username "admin@example.com"
- And I enter password "WrongPassword"
- And I click the "Login" button
- Then I should see an error message "Invalid credentials"
- And I should remain on the login page

## Scenario: Login with empty fields @auth @validation
- Given I am on the login page
- When I click the "Login" button
- Then I should see an error message "Username is required"
```

## Understanding What Happens

When you run the test:

1. **CopilotTest starts** with your configuration
2. **For each scenario:**
   - Creates a GitHub Copilot SDK session
   - Connects to the Playwright MCP server
3. **For each step:**
   - Sends the step text to the AI
   - AI interprets the intent
   - AI uses MCP tools (browser automation) to execute
   - Captures the result
4. **After execution:**
   - Generates HTML and JSON reports
   - Saves screenshots (if failures occurred)
   - Displays summary

## Key Concepts Explained

### Given/When/Then

- **Given**: Setup the initial state
  - Navigate to pages
  - Set up test data
  - Configure application state

- **When**: Perform actions
  - Click buttons
  - Fill forms
  - Make API calls

- **Then**: Verify outcomes
  - Check text content
  - Verify URLs
  - Validate data

### Step Clarity

Write steps as if instructing a person:

✅ **Clear and specific:**
```markdown
- Given I am on https://example.com/login
- When I enter "john@example.com" in the email field
- And I enter "password123" in the password field
- And I click the "Sign In" button
- Then I should be redirected to https://example.com/dashboard
```

❌ **Vague and unclear:**
```markdown
- Given I navigate
- When I login
- Then it works
```

### Tags for Organization

Use tags in the frontmatter or inline with scenario headings:

```markdown
---
tags: [smoke, regression]    # Feature-level tags in frontmatter
---

# Feature: User Management

## Scenario: Create user @critical
- Given ...

## Scenario: Delete user @slow @cleanup
- Given ...
```

Common tag conventions:
- `smoke` — Quick smoke tests
- `regression` — Full regression suite
- `critical` — Critical path tests
- `slow` — Slow-running tests
- `api` — API tests
- `ui` — UI tests

Run specific tags:

```bash
npx copilot-test run --tag=@smoke
npx copilot-test run --tag=@critical
```

## Next Steps

Now that you've created your first test:

1. [Running Tests](./running-tests.md) - Learn CLI options
2. [Best Practices](../guides/best-practices.md) - Write better tests
3. [Web Testing Guide](../guides/web-testing.md) - Advanced web testing
4. [Debugging](../guides/debugging.md) - Debug failing tests

## Common Patterns

### Testing Forms

```markdown
## Scenario: Submit contact form
- Given I am on the contact page
- When I enter "John Doe" in the name field
- And I enter "john@example.com" in the email field
- And I enter "Hello!" in the message field
- And I click the "Send" button
- Then I should see "Message sent successfully"
```

### Testing Navigation

```markdown
## Scenario: Navigate to product page
- Given I am on the home page
- When I click the "Products" link
- And I click on "Product ABC"
- Then I should see "Product ABC" in the heading
- And I should see the price "$99.99"
```

### Testing Authentication

```markdown
## Scenario: Logout
- Given I am logged in as "admin@example.com"
- When I click the user menu
- And I click "Logout"
- Then I should be redirected to the login page
- And I should see "You have been logged out"
```

## Troubleshooting

### Test Times Out

If steps timeout, increase the timeout in `copilot-test.config.yaml`:

```yaml
stepTimeout: 60000  # 60 seconds
```

### AI Misunderstands Step

Rephrase the step to be more specific:

```markdown
# Instead of:
- When I submit the form

# Use:
- When I click the "Submit" button
```

### Browser Not Found

Ensure Playwright browsers are installed:

```bash
npx playwright install chromium
```

## Practice Exercise

Try creating a test for an e-commerce checkout flow:

1. Add products to cart
2. Proceed to checkout
3. Enter shipping information
4. Select payment method
5. Place order
6. Verify order confirmation

Use the patterns you learned in this guide!
