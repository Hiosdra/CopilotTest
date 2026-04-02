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
# Run all examples
copilot-test run examples/e-commerce/features/authentication.feature.md

# Run specific suite with explicit files
copilot-test run \
  examples/e-commerce/features/authentication.feature.md \
  examples/e-commerce/features/product-catalog.feature.md

# Each .feature.md file is self-contained and can be run individually
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
│   ├── feature1.feature.md
│   ├── feature2.feature.md
│   └── feature3.feature.md
├── fixtures/              # Test data and fixtures
│   ├── users.ts
│   ├── products.ts
│   └── config.ts
└── README.md             # Documentation and best practices
```

## 🎯 Best Practices Demonstrated

### 1. Background Steps
Reusable setup steps that run before each scenario:

```markdown
## Background
- Given the application is available
- And I am logged in as a test user
```

### 2. Fixtures for Test Data
Centralized, reusable test data. Reference fixture values in your step descriptions or configure them in `copilot-test.config.yaml`:

```markdown
## Scenario: Customer logs in
- Given I am logged in as "registeredCustomer"
```

### 3. Descriptive Tags
Organize tests with meaningful tags in YAML frontmatter and inline annotations:

```markdown
---
tags: [smoke, critical, checkout]
---
```

Tags help categorize and identify test scenarios for documentation and organization purposes.

### 4. Positive and Negative Testing
Test both success and failure cases:

```markdown
## Scenario: User logs in successfully
- Given I have valid credentials
- Then I should be logged in

## Scenario: Login fails with invalid password
- Given I have wrong password
- Then I should see an error
```

### 5. Comprehensive Assertions
Verify complete user experience:

```markdown
## Scenario: Order confirmation
- Then I should see order confirmation
- And I should see my order number
- And I should receive a confirmation email
- And the order should appear in my history
```

## 📝 Common Patterns

### Form Submission Pattern
```markdown
## Scenario: Submit contact form
- When I enter name "John Doe"
- And I enter email "john@example.com"
- And I enter message "Test message"
- And I click "Submit"
- Then I should see success confirmation
- And I should receive confirmation email
```

### Search and Filter Pattern
```markdown
## Scenario: Search and filter products
- When I search for "laptop"
- And I filter by category "Electronics"
- And I set price range "$500-$1500"
- Then I should see matching products
- And all results should be laptops in price range
```

### Multi-Step Wizard Pattern
```markdown
## Scenario: Complete checkout wizard
- When I enter shipping information
- And I continue to payment
- And I enter payment details
- And I review my order
- And I confirm purchase
- Then I should see order confirmation
```

### Error Handling Pattern
```markdown
## Scenario: Handle API timeout gracefully
- Given the API is slow to respond
- When I submit the form
- Then I should see a loading indicator
- And if timeout occurs, I should see retry option
- And my data should not be lost
```

## 🔧 Configuration Examples

### Basic Configuration
```yaml
# copilot-test.config.yaml
model: gpt-5-mini
platforms:
  web:
    platform: web
    browser: chromium
    headless: true
stepTimeout: 30000
outputDir: copilot-test-results
```

### With Retry Mechanism
```yaml
# copilot-test.config.yaml
model: gpt-5-mini
platforms:
  web:
    platform: web
retry:
  enabled: true
  stepRetries: 3
  stepRetryDelay: 1000
```

### With Parallel Execution
```yaml
# copilot-test.config.yaml
model: gpt-5-mini
platforms:
  web:
    platform: web
parallel: true
maxWorkers: 4
```

## 🐛 Troubleshooting

### Tests Timing Out
**Solution**: Increase timeout in `copilot-test.config.yaml` or add intermediate steps
```yaml
# copilot-test.config.yaml
stepTimeout: 60000
```

```markdown
## Scenario: Submit and wait
- When I click submit
- And I wait for the page to load
- Then I should see confirmation
```

### Elements Not Found
**Solution**: Be more specific in step descriptions
```markdown
<!-- ❌ Vague -->
- When I click the button

<!-- ✅ Specific -->
- When I click the "Submit Order" button in the checkout form
```

### Flaky Tests
**Solution**: Use retry mechanisms and explicit waits
```yaml
# copilot-test.config.yaml
retry:
  enabled: true
  stepRetries: 3
```

## 📦 Using with Different Platforms

### Web (Playwright)
```yaml
# copilot-test.config.yaml
platforms:
  web:
    platform: web
    browser: chromium
    headless: true
```

### API (curl MCP)
```yaml
# copilot-test.config.yaml
platforms:
  api:
    platform: api
    baseUrl: https://api.example.com
```

### Mobile (Android Emulator)
```yaml
# copilot-test.config.yaml
platforms:
  mobile:
    platform: mobile
    device: emulator-5554
    appPackage: com.example.app
```

## 🎓 Additional Resources

### In This Repository
- [Retry Examples](./retry-example.feature.md) - Retry mechanisms and error recovery
- [Performance Monitoring](./performance-monitoring.feature.md) - Track test performance
- [Plugin Examples](../docs/PLUGINS.md) - Custom plugins and lifecycle hooks

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
