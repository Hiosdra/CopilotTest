# Web Testing Guide

Comprehensive guide to web application testing with CopilotTest using the Playwright MCP server.

## Overview

CopilotTest uses the Playwright MCP server to automate browser interactions. The AI interprets your test steps and uses Playwright's capabilities to interact with web applications.

## Configuration

### Basic Setup

```typescript
import { configure, webPlatform } from 'copilot-test';

configure({
  model: 'gpt-4o',
  platforms: {
    web: webPlatform({
      browser: 'chromium',    // 'chromium', 'firefox', or 'webkit'
      headless: false,         // Show browser (false) or run headless (true)
      baseUrl: 'https://example.com'
    })
  }
});
```

### Browser Options

**Chromium** (recommended for most cases):
```typescript
web: webPlatform({
  browser: 'chromium',
  headless: true
})
```

**Firefox**:
```typescript
web: webPlatform({
  browser: 'firefox',
  headless: false
})
```

**WebKit** (Safari engine):
```typescript
web: webPlatform({
  browser: 'webkit',
  headless: true
})
```

### Base URL

Set a base URL to use relative paths in your tests:

```typescript
configure({
  platforms: {
    web: webPlatform({
      baseUrl: 'https://staging.example.com'
    })
  }
});

// Now you can use relative paths
test(
  feature('Navigation')
    .scenario('View about page')
      .given('I am on /home')           // Opens https://staging.example.com/home
      .when('I click "About"')
      .then('I should be on /about')    // Verifies https://staging.example.com/about
      .done()
    ._build(),
  'web'
);
```

## Common Web Testing Patterns

### Navigation

```typescript
.scenario('Navigate to page')
  .given('I am on https://example.com')
  .when('I click the "Products" link')
  .then('I should be on https://example.com/products')
  .and('the page title should be "Products"')
  .done()
```

### Form Interactions

#### Text Input

```typescript
.scenario('Fill login form')
  .given('I am on the login page')
  .when('I enter "john@example.com" in the email field')
  .and('I enter "password123" in the password field')
  .and('I click the "Sign In" button')
  .then('I should see "Welcome back"')
  .done()
```

#### Checkboxes and Radio Buttons

```typescript
.scenario('Select preferences')
  .given('I am on the settings page')
  .when('I check the "Enable notifications" checkbox')
  .and('I select the "Daily" radio button')
  .and('I click Save')
  .then('I should see "Settings saved"')
  .done()
```

#### Dropdowns

```typescript
.scenario('Select country')
  .given('I am on the registration page')
  .when('I select "United States" from the country dropdown')
  .and('I select "California" from the state dropdown')
  .then('the form should be valid')
  .done()
```

#### File Upload

```typescript
.scenario('Upload profile picture')
  .given('I am on my profile page')
  .when('I upload file "avatar.jpg"')
  .and('I click "Save"')
  .then('I should see my new profile picture')
  .done()
```

### Element Verification

#### Text Content

```typescript
.then('I should see "Welcome to our site"')
.and('the heading should contain "Dashboard"')
.and('the page should display "Order #12345"')
```

#### Element Visibility

```typescript
.then('the error message should be visible')
.and('the submit button should be disabled')
.and('the loading spinner should not be visible')
```

#### Attribute Verification

```typescript
.then('the "Submit" button should be disabled')
.and('the email field should have placeholder "Enter your email"')
.and('the link should have href "/contact"')
```

### Wait for Elements

```typescript
.scenario('Wait for dynamic content')
  .given('I am on the dashboard')
  .when('I click "Load Data"')
  .then('I should see a loading spinner')
  .and('I wait for the loading to complete')
  .and('I should see the data table')
  .and('the table should contain at least 10 rows')
  .done()
```

### Multi-Page Workflows

```typescript
.scenario('Complete checkout flow')
  .given('I am on the product page for "Laptop"')
  .when('I click "Add to Cart"')
  .and('I click the cart icon')
  .then('I should see "Laptop" in my cart')

  .when('I click "Proceed to Checkout"')
  .then('I should be on the checkout page')

  .when('I enter shipping address')
  .and('I click "Continue to Payment"')
  .then('I should see the payment form')

  .when('I enter payment details')
  .and('I click "Place Order"')
  .then('I should see "Order confirmed"')
  .and('I should receive an order number')
  .done()
```

## Advanced Patterns

### Modal Dialogs

```typescript
.scenario('Handle confirmation dialog')
  .given('I am viewing an order')
  .when('I click "Cancel Order"')
  .then('I should see a confirmation dialog')

  .when('I click "Confirm" in the dialog')
  .then('I should see "Order cancelled"')
  .and('the dialog should be closed')
  .done()
```

### Tabs and Windows

```typescript
.scenario('Open link in new tab')
  .given('I am on the home page')
  .when('I right-click the "Terms" link')
  .and('I select "Open in new tab"')
  .then('a new tab should open')
  .and('the new tab should show the terms page')
  .done()
```

### Drag and Drop

```typescript
.scenario('Reorder items')
  .given('I am on the task board')
  .when('I drag "Task 1" to the "In Progress" column')
  .then('the task should be in the "In Progress" column')
  .and('I should see a success notification')
  .done()
```

### Hover Actions

```typescript
.scenario('Show tooltip on hover')
  .given('I am on the dashboard')
  .when('I hover over the info icon')
  .then('I should see a tooltip with "Additional information"')
  .done()
```

### Keyboard Interactions

```typescript
.scenario('Use keyboard shortcuts')
  .given('I am on the editor page')
  .when('I press Ctrl+S')
  .then('I should see "Document saved"')

  .when('I press Escape')
  .then('the save dialog should close')
  .done()
```

### Infinite Scroll

```typescript
.scenario('Load more content by scrolling')
  .given('I am on the news feed')
  .when('I scroll to the bottom of the page')
  .then('more articles should load')
  .and('I should see at least 20 articles')
  .done()
```

## Authentication Testing

### Login Flow

```typescript
feature('Authentication')
  .scenario('Successful login')
    .tag('@smoke', '@auth')
    .given('I am on https://example.com/login')
    .when('I enter username "admin@example.com"')
    .and('I enter password "SecurePass123"')
    .and('I click "Sign In"')
    .then('I should be redirected to /dashboard')
    .and('I should see "Welcome, Admin"')
    .done()

  .scenario('Login with invalid credentials')
    .tag('@negative', '@auth')
    .given('I am on the login page')
    .when('I enter username "admin@example.com"')
    .and('I enter password "WrongPassword"')
    .and('I click "Sign In"')
    .then('I should see "Invalid credentials"')
    .and('I should remain on the login page')
    .done()

  .scenario('Logout')
    .tag('@auth')
    .given('I am logged in as "admin@example.com"')
    .when('I click the user menu')
    .and('I click "Logout"')
    .then('I should be redirected to the login page')
    .and('I should see "You have been logged out"')
    .done()
  ._build();
```

### Session Management

```typescript
.scenario('Session persists on page reload')
  .given('I am logged in')
  .when('I reload the page')
  .then('I should still be logged in')
  .and('I should see my dashboard')
  .done()

.scenario('Session expires after timeout')
  .given('I am logged in')
  .when('I wait for 30 minutes')
  .and('I navigate to a protected page')
  .then('I should be redirected to the login page')
  .and('I should see "Session expired"')
  .done()
```

## Validation Testing

### Form Validation

```typescript
feature('Contact Form Validation')
  .scenario('Required fields')
    .given('I am on the contact form')
    .when('I click Submit without filling anything')
    .then('I should see "Name is required"')
    .and('I should see "Email is required"')
    .and('I should see "Message is required"')
    .done()

  .scenario('Email format validation')
    .given('I am on the contact form')
    .when('I enter "invalid-email" in the email field')
    .and('I click Submit')
    .then('I should see "Please enter a valid email address"')
    .done()

  .scenario('Message length validation')
    .given('I am on the contact form')
    .when('I enter "Hi" in the message field')
    .and('I click Submit')
    .then('I should see "Message must be at least 10 characters"')
    .done()
  ._build();
```

## Responsive Design Testing

### Desktop vs Mobile

```typescript
.scenario('Desktop navigation menu')
  .given('I am on the home page on desktop')
  .then('I should see the horizontal navigation menu')
  .and('I should see all menu items')
  .done()

.scenario('Mobile hamburger menu')
  .given('I am on the home page on mobile')
  .then('I should see the hamburger menu icon')
  .when('I click the hamburger icon')
  .then('the mobile menu should slide in')
  .and('I should see all menu items')
  .done()
```

## Performance Testing

### Page Load

```typescript
.scenario('Homepage loads quickly')
  .given('I navigate to https://example.com')
  .then('the page should load in less than 3 seconds')
  .and('all images should be visible')
  .done()
```

### Asset Loading

```typescript
.scenario('Images load properly')
  .given('I am on the gallery page')
  .then('all images should be loaded')
  .and('no broken image icons should be visible')
  .done()
```

## Error Handling

### Error Pages

```typescript
.scenario('404 page')
  .given('I navigate to https://example.com/nonexistent')
  .then('I should see "404 - Page Not Found"')
  .and('I should see a link to return home')
  .done()

.scenario('500 error handling')
  .given('the server is experiencing errors')
  .when('I navigate to the application')
  .then('I should see "Something went wrong"')
  .and('I should see a "Try Again" button')
  .done()
```

## Cross-Browser Testing

Test the same scenarios across multiple browsers:

```typescript
// config.ts
export const browsers = ['chromium', 'firefox', 'webkit'];

// test.spec.ts
import { browsers } from './config';

browsers.forEach(browser => {
  configure({
    platforms: {
      web: webPlatform({ browser })
    }
  });

  test(
    feature(`Login on ${browser}`)
      .scenario('Successful login')
        .given('I am on the login page')
        // ... test steps
        .done()
      ._build(),
    'web'
  );
});
```

## Best Practices

### 1. Use Explicit Waits

```typescript
// Good
.then('I wait for the data table to appear')
.and('the table should have at least 1 row')

// Avoid assuming immediate rendering
.then('the table should have at least 1 row')  // Might fail if slow
```

### 2. Verify State Changes

```typescript
// Good - verify the state change
.when('I click "Add to Cart"')
.then('the cart count should increase to 1')
.and('I should see "Item added to cart"')

// Incomplete - no verification
.when('I click "Add to Cart"')
```

### 3. Test Error States

Always include negative test cases:

```typescript
.scenario('Form submission with missing fields')
.scenario('API failure handling')
.scenario('Network timeout recovery')
```

### 4. Clean Up After Tests

```typescript
.scenario('Delete created user')
  .given('I created a test user "test@example.com"')
  .when('I navigate to user management')
  .and('I delete the user "test@example.com"')
  .then('the user should be removed')
  .done()
```

## Debugging Web Tests

### Enable Headless: false

See what the AI is doing:

```typescript
configure({
  platforms: {
    web: webPlatform({
      headless: false  // Watch browser automation
    })
  }
});
```

### Use Debug Mode

```typescript
configure({
  debugMode: true,
  breakpoints: ['When I click submit']
});
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
- [Custom Steps](./custom-steps.md) - Create reusable web steps
