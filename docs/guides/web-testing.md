# Web Testing Guide

Comprehensive guide to web application testing with CopilotTest using the Playwright MCP server.

## Overview

CopilotTest uses the Playwright MCP server to automate browser interactions. The AI interprets your test steps and uses Playwright's capabilities to interact with web applications.

## Configuration

### Basic Setup

```yaml
# copilot-test.config.yaml
model: gpt-5-mini
platforms:
  web:
    platform: web
    browser: chromium      # 'chromium', 'firefox', or 'webkit'
    headless: false        # Show browser (false) or run headless (true)
    baseUrl: "https://example.com"
```

### Browser Options

**Chromium** (recommended for most cases):
```yaml
platforms:
  web:
    platform: web
    browser: chromium
    headless: true
```

**Firefox**:
```yaml
platforms:
  web:
    platform: web
    browser: firefox
    headless: false
```

**WebKit** (Safari engine):
```yaml
platforms:
  web:
    platform: web
    browser: webkit
    headless: true
```

### Base URL

Set a base URL to use relative paths in your tests:

```yaml
# copilot-test.config.yaml
platforms:
  web:
    platform: web
    baseUrl: "https://staging.example.com"
```

Now you can use relative paths in your tests:

```markdown
<!-- tests/navigation.feature.md -->
---
platform: web
---

# Feature: Navigation

## Scenario: View about page
- Given I am on /home
- When I click "About"
- Then I should be on /about
```

## Common Web Testing Patterns

### Navigation

```markdown
## Scenario: Navigate to page
- Given I am on https://example.com
- When I click the "Products" link
- Then I should be on https://example.com/products
- And the page title should be "Products"
```

### Form Interactions

#### Text Input

```markdown
## Scenario: Fill login form
- Given I am on the login page
- When I enter "john@example.com" in the email field
- And I enter "password123" in the password field
- And I click the "Sign In" button
- Then I should see "Welcome back"
```

#### Checkboxes and Radio Buttons

```markdown
## Scenario: Select preferences
- Given I am on the settings page
- When I check the "Enable notifications" checkbox
- And I select the "Daily" radio button
- And I click Save
- Then I should see "Settings saved"
```

#### Dropdowns

```markdown
## Scenario: Select country
- Given I am on the registration page
- When I select "United States" from the country dropdown
- And I select "California" from the state dropdown
- Then the form should be valid
```

#### File Upload

```markdown
## Scenario: Upload profile picture
- Given I am on my profile page
- When I upload file "avatar.jpg"
- And I click "Save"
- Then I should see my new profile picture
```

### Element Verification

#### Text Content

```markdown
- Then I should see "Welcome to our site"
- And the heading should contain "Dashboard"
- And the page should display "Order #12345"
```

#### Element Visibility

```markdown
- Then the error message should be visible
- And the submit button should be disabled
- And the loading spinner should not be visible
```

#### Attribute Verification

```markdown
- Then the "Submit" button should be disabled
- And the email field should have placeholder "Enter your email"
- And the link should have href "/contact"
```

### Wait for Elements

```markdown
## Scenario: Wait for dynamic content
- Given I am on the dashboard
- When I click "Load Data"
- Then I should see a loading spinner
- And I wait for the loading to complete
- And I should see the data table
- And the table should contain at least 10 rows
```

### Multi-Page Workflows

```markdown
## Scenario: Complete checkout flow
- Given I am on the product page for "Laptop"
- When I click "Add to Cart"
- And I click the cart icon
- Then I should see "Laptop" in my cart

- When I click "Proceed to Checkout"
- Then I should be on the checkout page

- When I enter shipping address
- And I click "Continue to Payment"
- Then I should see the payment form

- When I enter payment details
- And I click "Place Order"
- Then I should see "Order confirmed"
- And I should receive an order number
```

## Advanced Patterns

### Modal Dialogs

```markdown
## Scenario: Handle confirmation dialog
- Given I am viewing an order
- When I click "Cancel Order"
- Then I should see a confirmation dialog

- When I click "Confirm" in the dialog
- Then I should see "Order cancelled"
- And the dialog should be closed
```

### Tabs and Windows

```markdown
## Scenario: Open link in new tab
- Given I am on the home page
- When I right-click the "Terms" link
- And I select "Open in new tab"
- Then a new tab should open
- And the new tab should show the terms page
```

### Drag and Drop

```markdown
## Scenario: Reorder items
- Given I am on the task board
- When I drag "Task 1" to the "In Progress" column
- Then the task should be in the "In Progress" column
- And I should see a success notification
```

### Hover Actions

```markdown
## Scenario: Show tooltip on hover
- Given I am on the dashboard
- When I hover over the info icon
- Then I should see a tooltip with "Additional information"
```

### Keyboard Interactions

```markdown
## Scenario: Use keyboard shortcuts
- Given I am on the editor page
- When I press Ctrl+S
- Then I should see "Document saved"

- When I press Escape
- Then the save dialog should close
```

### Infinite Scroll

```markdown
## Scenario: Load more content by scrolling
- Given I am on the news feed
- When I scroll to the bottom of the page
- Then more articles should load
- And I should see at least 20 articles
```

## Authentication Testing

### Login Flow

```markdown
<!-- tests/authentication.feature.md -->
---
platform: web
tags: [auth]
---

# Feature: Authentication

@smoke @auth
## Scenario: Successful login
- Given I am on https://example.com/login
- When I enter username "admin@example.com"
- And I enter password "SecurePass123"
- And I click "Sign In"
- Then I should be redirected to /dashboard
- And I should see "Welcome, Admin"

@negative @auth
## Scenario: Login with invalid credentials
- Given I am on the login page
- When I enter username "admin@example.com"
- And I enter password "WrongPassword"
- And I click "Sign In"
- Then I should see "Invalid credentials"
- And I should remain on the login page

@auth
## Scenario: Logout
- Given I am logged in as "admin@example.com"
- When I click the user menu
- And I click "Logout"
- Then I should be redirected to the login page
- And I should see "You have been logged out"
```

### Session Management

```markdown
## Scenario: Session persists on page reload
- Given I am logged in
- When I reload the page
- Then I should still be logged in
- And I should see my dashboard

## Scenario: Session expires after timeout
- Given I am logged in
- When I wait for 30 minutes
- And I navigate to a protected page
- Then I should be redirected to the login page
- And I should see "Session expired"
```

## Validation Testing

### Form Validation

```markdown
<!-- tests/contact-form-validation.feature.md -->
---
platform: web
---

# Feature: Contact Form Validation

## Scenario: Required fields
- Given I am on the contact form
- When I click Submit without filling anything
- Then I should see "Name is required"
- And I should see "Email is required"
- And I should see "Message is required"

## Scenario: Email format validation
- Given I am on the contact form
- When I enter "invalid-email" in the email field
- And I click Submit
- Then I should see "Please enter a valid email address"

## Scenario: Message length validation
- Given I am on the contact form
- When I enter "Hi" in the message field
- And I click Submit
- Then I should see "Message must be at least 10 characters"
```

## Responsive Design Testing

### Desktop vs Mobile

```markdown
## Scenario: Desktop navigation menu
- Given I am on the home page on desktop
- Then I should see the horizontal navigation menu
- And I should see all menu items

## Scenario: Mobile hamburger menu
- Given I am on the home page on mobile
- Then I should see the hamburger menu icon
- When I click the hamburger icon
- Then the mobile menu should slide in
- And I should see all menu items
```

## Performance Testing

### Page Load

```markdown
## Scenario: Homepage loads quickly
- Given I navigate to https://example.com
- Then the page should load in less than 3 seconds
- And all images should be visible
```

### Asset Loading

```markdown
## Scenario: Images load properly
- Given I am on the gallery page
- Then all images should be loaded
- And no broken image icons should be visible
```

## Error Handling

### Error Pages

```markdown
## Scenario: 404 page
- Given I navigate to https://example.com/nonexistent
- Then I should see "404 - Page Not Found"
- And I should see a link to return home

## Scenario: 500 error handling
- Given the server is experiencing errors
- When I navigate to the application
- Then I should see "Something went wrong"
- And I should see a "Try Again" button
```

## Cross-Browser Testing

Test the same scenarios across multiple browsers by changing the browser in your YAML config:

```yaml
# Run with different browsers by changing config:
platforms:
  web:
    platform: web
    browser: chromium    # Change to 'firefox' or 'webkit'
```

To test across multiple browsers, create separate config files or override the browser via CLI: `copilot-test run --browser firefox`

## Best Practices

### 1. Use Explicit Waits

```markdown
<!-- Good -->
- Then I wait for the data table to appear
- And the table should have at least 1 row

<!-- Avoid assuming immediate rendering -->
- Then the table should have at least 1 row  <!-- Might fail if slow -->
```

### 2. Verify State Changes

```markdown
<!-- Good - verify the state change -->
- When I click "Add to Cart"
- Then the cart count should increase to 1
- And I should see "Item added to cart"

<!-- Incomplete - no verification -->
- When I click "Add to Cart"
```

### 3. Test Error States

Always include negative test cases:

```markdown
## Scenario: Form submission with missing fields
## Scenario: API failure handling
## Scenario: Network timeout recovery
```

### 4. Clean Up After Tests

```markdown
## Scenario: Delete created user
- Given I created a test user "test@example.com"
- When I navigate to user management
- And I delete the user "test@example.com"
- Then the user should be removed
```

## Debugging Web Tests

### Enable Headless: false

See what the AI is doing:

```yaml
# copilot-test.config.yaml
platforms:
  web:
    platform: web
    headless: false  # Watch browser automation
```

### Use Debug Mode

```yaml
# copilot-test.config.yaml
debugMode: true
breakpoints:
  - "When I click submit"
```

### Check Screenshots

Screenshots are automatically captured on failure:

```
copilot-test-results/
└── screenshots/
    └── login-test-failed-step-3.png
```

## Next Steps

- [API Testing Guide](./api-testing.md) - Test REST APIs
- [Best Practices](./best-practices.md) - Write better tests
- [Debugging Guide](./debugging.md) - Debug failing tests
- [Custom Steps](../CUSTOM_STEPS.md) - Create reusable web steps
