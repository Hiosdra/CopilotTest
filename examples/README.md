# Environment Management Feature

This directory contains examples demonstrating the environment management feature in CopilotTest.

## Quick Start

Run the environment example with different configurations:

```bash
# Run with default 'local' environment
npm run test:env-example

# Run with staging environment
COPILOT_ENV=staging npm run test:env-example

# Run with production environment
COPILOT_ENV=production npm run test:env-example
```

## What You'll See

The example demonstrates:

1. **Environment-specific configuration** - Different base URLs, timeouts, and settings per environment
2. **Environment detection** - Using `getEnvironment()` to see which environment is active
3. **Configuration access** - Using `getConfig()` to access merged configuration values
4. **Automatic merging** - How environment configs override base configuration

## Files in This Directory

- `environment-example.spec.ts` - Complete example showing environment configuration and usage

## Learn More

For comprehensive documentation on environment management, see:

- [Environment Management Documentation](../docs/ENVIRONMENTS.md)
- [Configuration Reference](../docs/ENVIRONMENTS.md#configuration)
- [Best Practices](../docs/ENVIRONMENTS.md#best-practices)

## Key Features Demonstrated

### 1. Environment Definition

```typescript
environments: {
  local: {
    baseUrl: "http://localhost:3000",
    timeout: 60000,
    headless: false,
  },
  staging: {
    baseUrl: "https://staging.example.com",
    timeout: 30000,
    headless: true,
  },
  production: {
    baseUrl: "https://example.com",
    timeout: 30000,
    headless: true,
    screenshotOnFailure: true,
  },
}
```

### 2. Environment Access

```typescript
import { getEnvironment, getConfig } from "copilot-test";

const envName = getEnvironment();  // "local", "staging", or "production"
const config = getConfig();         // Merged configuration object
```

### 3. Environment Variables

```typescript
environments: {
  production: {
    apiKey: process.env.PROD_API_KEY,
    databaseUrl: process.env.PROD_DATABASE_URL,
  },
}
```

## Next Steps

1. **Try the example**: Run `npm run test:env-example` to see it in action
2. **Modify environments**: Edit the example to add your own environment configurations
3. **Add secrets**: Use `.env` files with environment variables for sensitive data
4. **Integrate with CI/CD**: Set `COPILOT_ENV` in your CI/CD pipeline

## Support

For questions or issues with environment management:
- Check the [full documentation](../docs/ENVIRONMENTS.md)
- Review the [main configuration file](../copilot-test.config.ts) for more examples
- See the [unit tests](../tests/unit.test.ts) for environment configuration testing patterns
