# CopilotTest Documentation

Complete documentation for the AI-driven BDD testing framework.

## Quick Links

- [📚 Getting Started](#getting-started)
- [📖 Guides](#guides)
- [🚀 Advanced](#advanced)
- [📋 API Reference](#api-reference)
- [🔧 Troubleshooting](#troubleshooting)
- [💡 Examples](#examples)
- [🔄 Migration](#migration)

## Getting Started

New to CopilotTest? Start here:

1. **[Installation](./getting-started/installation.md)** - Install and set up CopilotTest
2. **[Quick Start](./getting-started/quick-start.md)** - Get running in 5 minutes
3. **[Your First Test](./getting-started/your-first-test.md)** - Write your first test step-by-step
4. **[Running Tests](./getting-started/running-tests.md)** - Execute and control test runs

## Guides

Comprehensive guides for using CopilotTest:

### Platform Testing
- **[Web Testing Guide](./guides/web-testing.md)** - Test web applications with Playwright
- **[API Testing Guide](./guides/api-testing.md)** - Test REST APIs with curl
- **[Mobile Testing Guide](./guides/mobile-testing.md)** - Test Android apps

### Best Practices & Configuration
- **[Best Practices](./guides/best-practices.md)** - Write effective, maintainable tests
- **[Configuration Guide](./guides/configuration.md)** - Complete configuration reference
- **[Debugging Guide](./guides/debugging.md)** - Debug and troubleshoot tests

### Advanced Features
- **[Custom Steps](./CUSTOM_STEPS.md)** - Create reusable custom step definitions
- **[Plugins](./PLUGINS.md)** - Extend with lifecycle hooks
- **[Context Management](./CONTEXT_MANAGEMENT.md)** - Share data between steps
- **[Scenario Outline](./scenario-outline.md)** - Data-driven testing
- **[Debug Mode](./DEBUG_MODE.md)** - Interactive debugging
- **[Watch Mode](./watch-mode.md)** - Continuous test execution
- **[Performance Monitoring](./performance-monitoring.md)** - Track test performance

## Advanced

Deep dives into advanced topics:

- **Parallel Execution** - Run tests concurrently for faster execution
- **Custom MCP Servers** - Integrate with custom tools and platforms
- **Performance Tuning** - Optimize test execution speed
- **CI/CD Integration** - Automate tests in your pipeline

## API Reference

Complete API documentation:

- **Parser API** - `parseFeatureFile`, `parseFeatureMarkdown`, `loadConfig`
- **Configuration API** - All configuration options (YAML)
- **Runtime API** - Programmatic test execution
- **Types** - TypeScript type definitions

## Troubleshooting

Common issues and solutions:

- **[Common Errors](./troubleshooting/common-errors.md)** - Solutions to frequent errors
- **[AI Interpretation Issues](./troubleshooting/ai-interpretation-issues.md)** - Writing steps AI understands
- **Debugging Failed Tests** - Investigate test failures
- **MCP Server Issues** - Fix platform connection problems

## Examples

Real-world test examples:

- **E-commerce Suite** - Complete shopping flow tests
- **Auth Flows** - Authentication and authorization
- **Form Validation** - Input validation patterns
- **API CRUD** - Create, Read, Update, Delete operations
- **Mobile Onboarding** - App onboarding flows

## Migration

Switching from another framework?

- **From Playwright** - Migrate Playwright tests
- **From Cypress** - Migrate Cypress tests
- **From Cucumber** - Migrate Cucumber/Gherkin tests

## Feature Overview

| Feature | Description | Documentation |
|---------|-------------|---------------|
| **Zero-Implementation BDD** | Write tests in natural language, AI executes | [Quick Start](./getting-started/quick-start.md) |
| **Multi-Platform** | Web, API, Mobile with same Markdown format | [Platform Guides](./guides/) |
| **Custom Steps** | Define reusable step implementations | [Custom Steps](./CUSTOM_STEPS.md) |
| **Plugins** | Extend with lifecycle hooks | [Plugins](./PLUGINS.md) |
| **Parallel Execution** | Run scenarios concurrently | [Configuration](./guides/configuration.md#parallel-execution) |
| **Watch Mode** | Continuous testing during development | [Watch Mode](./watch-mode.md) |
| **Retry Logic** | Automatic retry with backoff strategies | [Configuration](./guides/configuration.md#retry-configuration) |
| **Debug Mode** | Interactive debugging with breakpoints | [Debug Mode](./DEBUG_MODE.md) |
| **Performance Monitoring** | Track slow steps and trends | [Performance](./performance-monitoring.md) |
| **Scenario Outline** | Data-driven testing | [Scenario Outline](./scenario-outline.md) |
| **Context Management** | Share data between steps | [Context](./CONTEXT_MANAGEMENT.md) |
| **Rich Reports** | Interactive HTML reports with trends | [Running Tests](./getting-started/running-tests.md#output-and-reporting) |

## Quick Reference

### Basic Test Structure

Create a `.feature.md` file (e.g., `tests/example.feature.md`):

```markdown
---
platform: web
tags: [smoke]
---

# Feature: Feature Name

## Scenario: Scenario Name
- Given setup step
- When action step
- Then assertion step
```

### CLI Commands

```bash
copilot-test init              # Initialize project
copilot-test run               # Run all tests
copilot-test run --tag=@smoke  # Run specific tags
copilot-test list              # List tests
copilot-test report            # Open report
copilot-test validate          # Validate config
copilot-test doctor            # Health check
```

### Configuration Essentials

Configure in `copilot-test.config.yaml`:

```yaml
# AI
model: gpt-4o
reasoningEffort: medium

# Platforms
platforms:
  web:
    platform: web
    browser: chromium
    headless: true
    baseUrl: "https://example.com"
  api:
    platform: api
    baseUrl: "https://api.example.com"
    defaultHeaders:
      Content-Type: application/json
  mobile:
    platform: mobile
    device: "emulator-5554"

# Execution
stepTimeout: 30000
screenshotOnFailure: true

# Advanced
parallel: true
maxWorkers: 4
retry:
  enabled: true
  stepRetries: 3
```

## Need Help?

- 📖 [Troubleshooting](./troubleshooting/common-errors.md)
- 🐛 [Report Issues](https://github.com/Hiosdra/CopilotTest/issues)
- 💬 [Discussions](https://github.com/Hiosdra/CopilotTest/discussions)

## Contributing

We welcome contributions! See:
- [Contributing Guide](../CONTRIBUTING.md)
- [Plugin Development](./PLUGINS.md)
- [Custom Step Development](./CUSTOM_STEPS.md)

## License

MIT License - see [LICENSE](../LICENSE) for details.
