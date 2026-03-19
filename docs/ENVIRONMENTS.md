# Environment Management

CopilotTest supports environment-based configuration profiles, allowing you to easily switch between different test environments without changing your code.

## Overview

Tests often need to run against different environments:
- **Local development** (localhost)
- **Staging** (staging.example.com)
- **Production** (example.com)
- Different API keys, credentials per environment

## Configuration

Define environment profiles in your `copilot-test.config.ts`:

```typescript
import { configure } from "copilot-test";
import { webPlatform } from "copilot-test/platforms/web";

configure({
  // Default configuration
  platforms: {
    web: webPlatform({ browser: "chromium" }),
  },
  baseUrl: "http://default.com",
  stepTimeout: 30000,

  // Environment-specific configurations
  environments: {
    local: {
      baseUrl: "http://localhost:3000",
      apiUrl: "http://localhost:8080",
      timeout: 60000,
      headless: false,
    },
    staging: {
      baseUrl: "https://staging.example.com",
      apiUrl: "https://api.staging.example.com",
      timeout: 30000,
      headless: true,
      apiKey: process.env.STAGING_API_KEY,
    },
    production: {
      baseUrl: "https://example.com",
      apiUrl: "https://api.example.com",
      timeout: 30000,
      headless: true,
      apiKey: process.env.PROD_API_KEY,
      screenshotOnFailure: true,
    },
  },
});
```

## Usage

### Environment Selection

Run tests against a specific environment using the `COPILOT_ENV` environment variable:

```bash
# Run tests against staging environment
COPILOT_ENV=staging npm run test

# Run tests against production environment
COPILOT_ENV=production npm run test

# Default to 'local' if not specified
npm run test
```

### NPM Scripts

Add convenient npm scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "tsx tests/your-test.spec.ts",
    "test:local": "COPILOT_ENV=local npm run test",
    "test:staging": "COPILOT_ENV=staging npm run test",
    "test:production": "COPILOT_ENV=production npm run test"
  }
}
```

### Accessing Environment in Code

You can access the current environment name and configuration in your test code:

```typescript
import { getEnvironment, getConfig } from "copilot-test";

// Get current environment name
const envName = getEnvironment();
console.log(`Running tests in: ${envName}`); // "local", "staging", or "production"

// Get current merged configuration
const config = getConfig();
console.log(`Base URL: ${config.baseUrl}`);
```

## Environment Configuration Properties

Environment configurations support the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `baseUrl` | `string` | Base URL for the application |
| `apiUrl` | `string` | API endpoint URL |
| `timeout` | `number` | Timeout in milliseconds (maps to `stepTimeout`) |
| `headless` | `boolean` | Run browser in headless mode |
| `apiKey` | `string` | API key for authentication |
| `screenshotOnFailure` | `boolean` | Take screenshots on test failures |
| `platforms` | `Record<string, Partial<PlatformConfig>>` | Platform-specific overrides |
| `mcpServers` | `Record<string, McpServerConfig>` | Environment-specific MCP servers |

You can also add custom properties as needed:

```typescript
environments: {
  staging: {
    baseUrl: "https://staging.example.com",
    customProperty: "custom-value",
    featureFlags: {
      newFeature: true,
      betaFeature: false,
    },
  },
}
```

## Configuration Merging

Environment configurations are merged with the base configuration:

1. **Base configuration** is applied first
2. **Environment-specific configuration** overrides base properties
3. Platform-specific overrides within environments are merged with platform configs

### Example

```typescript
configure({
  baseUrl: "http://default.com",
  stepTimeout: 10000,
  screenshotOnFailure: false,

  environments: {
    staging: {
      baseUrl: "https://staging.example.com",
      timeout: 30000,
      // screenshotOnFailure remains false
    },
  },
});
```

When `COPILOT_ENV=staging`:
- `baseUrl` → `"https://staging.example.com"` (overridden)
- `stepTimeout` → `30000` (overridden via `timeout`)
- `screenshotOnFailure` → `false` (inherited from base)

## Environment Variables

Use environment variables for sensitive data:

```typescript
environments: {
  production: {
    baseUrl: "https://example.com",
    apiKey: process.env.PROD_API_KEY,
    databaseUrl: process.env.PROD_DATABASE_URL,
  },
}
```

### .env File Support

Create environment-specific `.env` files:

```bash
# .env.local
BASE_URL=http://localhost:3000
API_URL=http://localhost:8080

# .env.staging
BASE_URL=https://staging.example.com
API_URL=https://api.staging.example.com
STAGING_API_KEY=your-staging-key

# .env.production
BASE_URL=https://example.com
API_URL=https://api.example.com
PROD_API_KEY=your-production-key
```

Load them using a package like `dotenv`:

```typescript
import dotenv from 'dotenv';

// Load environment-specific .env file
const env = process.env.COPILOT_ENV || 'local';
dotenv.config({ path: `.env.${env}` });

configure({
  // ... configuration using process.env values
});
```

## Platform-Specific Overrides

Override platform configurations per environment:

```typescript
configure({
  platforms: {
    web: webPlatform({ browser: "chromium", headless: true }),
  },

  environments: {
    local: {
      platforms: {
        web: {
          // Override web platform for local environment
          systemContext: "Use local development server settings",
        },
      },
    },
  },
});
```

## Environment-Specific MCP Servers

Configure different MCP servers for each environment:

```typescript
environments: {
  local: {
    mcpServers: {
      database: {
        type: "stdio",
        command: "npx",
        args: ["@copilot-test/postgres-mcp"],
        env: {
          DATABASE_URL: "postgresql://localhost:5432/testdb",
        },
      },
    },
  },
  production: {
    mcpServers: {
      database: {
        type: "stdio",
        command: "npx",
        args: ["@copilot-test/postgres-mcp"],
        env: {
          DATABASE_URL: process.env.PROD_DATABASE_URL,
        },
      },
    },
  },
}
```

## Best Practices

### 1. Use Environment Variables for Secrets

Never hardcode sensitive data. Always use environment variables:

```typescript
// ✅ Good
apiKey: process.env.PROD_API_KEY

// ❌ Bad
apiKey: "hardcoded-secret-key"
```

### 2. Set Sensible Defaults

Provide sensible defaults for local development:

```typescript
baseUrl: process.env.BASE_URL ?? "http://localhost:3000"
```

### 3. Document Required Environment Variables

Create a `.env.example` file documenting all required variables:

```bash
# .env.example
BASE_URL=http://localhost:3000
API_URL=http://localhost:8080
STAGING_API_KEY=your-staging-key-here
PROD_API_KEY=your-production-key-here
```

### 4. Use CI/CD Environment Variables

In your CI/CD pipeline, set environment variables:

```yaml
# GitHub Actions example
- name: Run tests on staging
  env:
    COPILOT_ENV: staging
    STAGING_API_KEY: ${{ secrets.STAGING_API_KEY }}
  run: npm test
```

### 5. Validate Required Configuration

Validate that required configuration is present for each environment:

```typescript
const envName = process.env.COPILOT_ENV || 'local';

if (envName === 'production' && !process.env.PROD_API_KEY) {
  throw new Error('PROD_API_KEY is required for production environment');
}
```

## Example: Complete Configuration

```typescript
import { configure } from "copilot-test";
import { webPlatform } from "copilot-test/platforms/web";
import { apiPlatform } from "copilot-test/platforms/api";

configure({
  model: "gpt-4o",
  reasoningEffort: "high",

  platforms: {
    web: webPlatform({ browser: "chromium", headless: true }),
    api: apiPlatform({ defaultHeaders: { "Content-Type": "application/json" } }),
  },

  baseUrl: "http://localhost:3000",
  stepTimeout: 30000,
  retries: 2,
  screenshotOnFailure: true,
  outputDir: "copilot-test-results",

  environments: {
    local: {
      baseUrl: "http://localhost:3000",
      apiUrl: "http://localhost:8080",
      timeout: 60000,
      headless: false,
    },

    staging: {
      baseUrl: "https://staging.example.com",
      apiUrl: "https://api.staging.example.com",
      timeout: 30000,
      headless: true,
      apiKey: process.env.STAGING_API_KEY,
      screenshotOnFailure: true,
    },

    production: {
      baseUrl: "https://example.com",
      apiUrl: "https://api.example.com",
      timeout: 30000,
      headless: true,
      apiKey: process.env.PROD_API_KEY,
      screenshotOnFailure: true,
      platforms: {
        web: {
          systemContext: "Production environment - be careful with destructive operations",
        },
      },
    },
  },
});
```

## Troubleshooting

### Environment not being applied

Check that:
1. The `COPILOT_ENV` environment variable is set correctly
2. The environment name matches exactly (case-sensitive)
3. The environment is defined in your configuration

### Configuration not merging correctly

Environment configurations are shallow merged at the top level. For nested objects like `platforms`, provide complete overrides or use the spread operator in your configuration logic.

### Getting "environment not found" warning

If an environment specified in `COPILOT_ENV` doesn't exist in your configuration, the base configuration will be used without any environment overrides. This is intentional to prevent test failures due to typos.

## Summary

Environment management in CopilotTest provides:

✅ Easy switching between environments via `COPILOT_ENV`
✅ Secure credential management through environment variables
✅ Environment-specific configurations for platforms and MCP servers
✅ Configuration merging with sensible defaults
✅ Standard pattern familiar to test frameworks

This makes CopilotTest ready for real-world usage across development, staging, and production environments.
