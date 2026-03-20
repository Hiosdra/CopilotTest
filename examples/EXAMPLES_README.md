# CopilotTest Example Test Suites

Comprehensive collection of real-world test suite examples demonstrating best practices, common patterns, and advanced features of CopilotTest.

## 📚 Available Example Suites

### 1. [E-Commerce Application](./e-commerce/)
Complete end-to-end testing for e-commerce platforms.

**Scenarios Covered:**
- 🔐 **Authentication** - Login, registration, password reset, session management
- 🛍️ **Product Catalog** - Search, filters, categories, product details
- 🛒 **Shopping Cart** - Add/remove items, quantity management, coupons
- 💳 **Checkout** - Multi-step checkout, payment processing, order confirmation
- 📦 **Order History** - View orders, tracking, returns, reviews

**Best For:** Learning complete user journeys, form handling, multi-step flows

[View E-Commerce Examples →](./e-commerce/README.md)

---

### 2. [SaaS Application](./saas-app/)
Testing patterns for Software-as-a-Service applications.

**Scenarios Covered:**
- 👤 **User Registration** - Sign-up, email verification, onboarding
- 💰 **Subscription Management** - Plan upgrades, billing, cancellations
- 📊 **Dashboard** - Data visualization, widgets, real-time updates
- ⚙️ **Settings** - Profile, team management, integrations, API keys

**Best For:** Subscription flows, multi-tenant features, account management

---

### 3. [API Integration](./api-testing/)
Comprehensive API testing examples for REST and GraphQL.

**Scenarios Covered:**
- 🌐 **REST API** - CRUD operations, pagination, filtering, sorting
- 🔐 **Authentication** - JWT tokens, OAuth, API keys, refresh tokens
- 📡 **GraphQL** - Queries, mutations, variables, nested data
- 🔔 **Webhooks** - Registration, delivery, retries, signature verification

**Best For:** API contract testing, authentication flows, webhook integration

---

### 4. [Mobile Application](./mobile-app/)
Mobile app testing patterns for Android/iOS.

**Scenarios Covered:**
- 👋 **Onboarding** - Welcome screens, first-time experience
- 🧭 **Navigation** - Bottom nav, drawer menus, deep linking
- 🔒 **Permissions** - Runtime permissions, handling denials
- 📴 **Offline Mode** - Caching, sync, conflict resolution

**Best For:** Mobile-specific interactions, permissions, offline functionality

---

## 🚀 Quick Start

### Running Examples

```bash
# Run all examples (requires config file)
copilot-test run examples/e-commerce/features/authentication.spec.ts

# Run specific suite with explicit files
copilot-test run \
  examples/e-commerce/features/authentication.spec.ts \
  examples/e-commerce/features/product-catalog.spec.ts

# Note: Each spec file is self-contained with configure() call
# They can be run individually without a separate config file
```

### Using as Templates

1. **Copy the example** that matches your use case
2. **Update fixtures** with your test data
3. **Modify step descriptions** to match your application
4. **Adjust configuration** (URLs, timeouts, etc.)
5. **Run and iterate**

## 📖 Learning Path

### Beginner
Start with these to learn fundamentals:
1. **E-Commerce Authentication** - Basic login/registration flows
2. **API REST Tests** - Simple CRUD operations
3. **Mobile Onboarding** - Basic mobile interactions

### Intermediate
Progress to more complex scenarios:
1. **E-Commerce Checkout** - Multi-step forms and validation
2. **SaaS Subscription Management** - Payment and billing flows
3. **API Authentication** - JWT and OAuth patterns

### Advanced
Master advanced patterns:
1. **E-Commerce Shopping Cart** - State management and calculations
2. **SaaS Dashboard** - Real-time updates and data visualization
3. **Mobile Offline Mode** - Sync and conflict resolution
4. **API Webhooks** - Event-driven integrations

## 🏗️ Example Structure

Each example suite follows a consistent structure:

```
example-suite/
├── features/              # Test specifications
│   ├── feature1.spec.ts
│   ├── feature2.spec.ts
│   └── feature3.spec.ts
├── fixtures/              # Test data and fixtures
│   ├── users.ts
│   ├── products.ts
│   └── config.ts
└── README.md             # Documentation and best practices
```

## 🎯 Best Practices Demonstrated

### 1. Background Steps
Reusable setup steps that run before each scenario:

```typescript
.background()
.given('the application is available')
.and('I am logged in as a test user')
```

### 2. Fixtures for Test Data
Centralized, reusable test data:

```typescript
import { registeredCustomer } from '../fixtures/users.js';

.given(`I am logged in as "${registeredCustomer.username}"`)
```

### 3. Descriptive Tags
Organize and filter tests:

```typescript
.scenario('Critical checkout flow')
.tag('@smoke', '@critical', '@checkout')
```

Run specific tags:
```bash
copilot-test run --tag=@smoke
```

### 4. Positive and Negative Testing
Test both success and failure cases:

```typescript
// Positive case
.scenario('User logs in successfully')
  .given('I have valid credentials')
  .then('I should be logged in')

// Negative case
.scenario('Login fails with invalid password')
  .given('I have wrong password')
  .then('I should see an error')
```

### 5. Comprehensive Assertions
Verify complete user experience:

```typescript
.then('I should see order confirmation')
.and('I should see my order number')
.and('I should receive a confirmation email')
.and('the order should appear in my history')
```

## 📝 Common Patterns

### Form Submission Pattern
```typescript
.scenario('Submit contact form')
.when('I enter name "John Doe"')
.and('I enter email "john@example.com"')
.and('I enter message "Test message"')
.and('I click "Submit"')
.then('I should see success confirmation')
.and('I should receive confirmation email')
```

### Search and Filter Pattern
```typescript
.scenario('Search and filter products')
.when('I search for "laptop"')
.and('I filter by category "Electronics"')
.and('I set price range "$500-$1500"')
.then('I should see matching products')
.and('all results should be laptops in price range')
```

### Multi-Step Wizard Pattern
```typescript
.scenario('Complete checkout wizard')
.when('I enter shipping information')
.and('I continue to payment')
.and('I enter payment details')
.and('I review my order')
.and('I confirm purchase')
.then('I should see order confirmation')
```

### Error Handling Pattern
```typescript
.scenario('Handle API timeout gracefully')
.given('the API is slow to respond')
.when('I submit the form')
.then('I should see a loading indicator')
.and('if timeout occurs, I should see retry option')
.and('my data should not be lost')
```

## 🔧 Configuration Examples

### Basic Configuration
```typescript
configure({
  model: 'gpt-4o',
  platforms: { web: webPlatform({ browser: 'chromium', headless: true }) },
  stepTimeout: 30000,
  outputDir: 'copilot-test-results',
});
```

### With Retry Mechanism
```typescript
configure({
  model: 'gpt-4o',
  platforms: { web: webPlatform() },
  retry: {
    enabled: true,
    stepRetries: 3,
    stepRetryDelay: 1000,
  },
});
```

### With Parallel Execution
```typescript
configure({
  model: 'gpt-4o',
  platforms: { web: webPlatform() },
  parallel: true,
  maxWorkers: 4,
});
```

## 🐛 Troubleshooting

### Tests Timing Out
**Solution**: Increase timeout or add intermediate steps
```typescript
configure({ stepTimeout: 60000 });

// Or add waiting step
.when('I click submit')
.and('I wait for the page to load')
.then('I should see confirmation')
```

### Elements Not Found
**Solution**: Be more specific in step descriptions
```typescript
// ❌ Vague
.when('I click the button')

// ✅ Specific
.when('I click the "Submit Order" button in the checkout form')
```

### Flaky Tests
**Solution**: Use retry mechanisms and explicit waits
```typescript
configure({
  retry: {
    enabled: true,
    stepRetries: 3,
  },
});
```

## 📦 Using with Different Platforms

### Web (Playwright)
```typescript
import { webPlatform } from 'copilot-test';

configure({
  platforms: {
    web: webPlatform({ browser: 'chromium', headless: true })
  },
});
```

### API (curl MCP)
```typescript
import { apiPlatform } from 'copilot-test';

configure({
  platforms: {
    api: apiPlatform({ baseUrl: 'https://api.example.com' })
  },
});
```

### Mobile (Android Emulator)
```typescript
import { mobilePlatform } from 'copilot-test';

configure({
  platforms: {
    mobile: mobilePlatform({
      device: 'emulator-5554',
      appPackage: 'com.example.app'
    })
  },
});
```

## 🎓 Additional Resources

### In This Repository
- [Retry Examples](./retry-example.ts) - Retry mechanisms and error recovery
- [Performance Monitoring](./performance-monitoring.ts) - Track test performance
- [Plugin Examples](./plugins.ts) - Custom plugins and lifecycle hooks

### Documentation
- [Main README](../README.md) - Framework overview
- [Custom Steps Guide](../docs/CUSTOM_STEPS.md) - Creating reusable step definitions
- [Plugins Guide](../docs/PLUGINS.md) - Extending with plugins

### External Resources
- [GitHub Copilot SDK](https://github.com/github/copilot-sdk)
- [MCP Servers](https://github.com/github/copilot-sdk#mcp-servers)
- [Playwright Documentation](https://playwright.dev/)

## 🤝 Contributing

Have a great example to share? Contributions are welcome!

1. Create a new example suite following the established structure
2. Include comprehensive test scenarios
3. Add fixtures and documentation
4. Submit a pull request

## 💡 Tips for Success

1. **Start Small** - Begin with simple scenarios and build up complexity
2. **Be Specific** - Clear, detailed step descriptions work best
3. **Use Fixtures** - Centralize test data for reusability
4. **Tag Everything** - Tags make test organization and execution easier
5. **Test Negatives** - Don't forget error cases and edge cases
6. **Verify Completely** - Check the full user experience, not just happy path
7. **Keep It DRY** - Use background steps for common setup
8. **Document Well** - Future you (and your team) will thank you

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Hiosdra/CopilotTest/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Hiosdra/CopilotTest/discussions)
- **Documentation**: [Full Docs](../README.md)

---

**Happy Testing!** 🧪✨
