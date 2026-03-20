# Configuration Guide

Comprehensive reference for configuring CopilotTest for your testing needs.

## Configuration File

### Basic Structure

Create a `copilot-test.config.ts` file in your project root:

```typescript
import { configure, webPlatform, apiPlatform, mobilePlatform } from 'copilot-test';

configure({
  // AI Configuration
  model: 'gpt-4o',
  reasoningEffort: 'medium',

  // Platform Configuration
  platforms: {
    web: webPlatform({ browser: 'chromium' }),
    api: apiPlatform({ baseUrl: 'https://api.example.com' }),
    mobile: mobilePlatform({ device: 'emulator-5554' })
  },

  // Execution Configuration
  stepTimeout: 30000,
  screenshotOnFailure: true,
  outputDir: 'copilot-test-results',

  // Advanced Features
  parallel: true,
  maxWorkers: 4,
  retry: {
    enabled: true,
    stepRetries: 3
  }
});
```

## AI Model Configuration

### Model Selection

Choose the AI model that best fits your needs:

```typescript
configure({
  model: 'gpt-4o'           // Default: Fast, accurate, cost-effective
  // model: 'gpt-4o-mini'   // Faster, cheaper, good for simple tests
  // model: 'claude-sonnet' // Alternative model
});
```

### Model Comparison

| Model | Speed | Cost | Best For |
|-------|-------|------|----------|
| **gpt-4o** | Fast | Moderate | General testing, CI/CD |
| **gpt-4o-mini** | Very Fast | Low | Simple scenarios, development |
| **claude-sonnet** | Medium | Moderate | Complex validations, analysis |

### Reasoning Effort

Control how much the AI thinks before acting:

```typescript
configure({
  reasoningEffort: 'low'     // Fast, direct
  // reasoningEffort: 'medium'  // Balanced (default)
  // reasoningEffort: 'high'    // Thorough, slower
});
```

**When to use:**
- **Low**: Simple, straightforward tests
- **Medium**: Most tests (default)
- **High**: Complex scenarios, critical paths

## Platform Configuration

### Web Platform

```typescript
import { webPlatform } from 'copilot-test';

configure({
  platforms: {
    web: webPlatform({
      browser: 'chromium',      // 'chromium', 'firefox', 'webkit'
      headless: true,           // Run without UI
      baseUrl: 'https://example.com'  // Base URL for relative paths
    })
  }
});
```

### API Platform

```typescript
import { apiPlatform } from 'copilot-test';

configure({
  platforms: {
    api: apiPlatform({
      baseUrl: 'https://api.example.com',
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`
      }
    })
  }
});
```

### Mobile Platform

```typescript
import { mobilePlatform } from 'copilot-test';

configure({
  platforms: {
    mobile: mobilePlatform({
      device: 'emulator-5554',        // Device ID from 'adb devices'
      avd: 'Pixel_6_API_33',          // Or AVD name
      appPackage: 'com.example.app',  // App package
      appActivity: '.MainActivity'    // Main activity
    })
  }
});
```

### Multiple Platforms

Configure multiple platforms in one config:

```typescript
configure({
  model: 'gpt-4o',
  platforms: {
    web: webPlatform({
      browser: 'chromium',
      baseUrl: 'https://example.com'
    }),
    api: apiPlatform({
      baseUrl: 'https://api.example.com'
    }),
    mobile: mobilePlatform({
      device: 'emulator-5554',
      appPackage: 'com.example.app'
    })
  }
});
```

## Execution Configuration

### Timeouts

```typescript
configure({
  stepTimeout: 30000        // 30 seconds per step (default)
  // stepTimeout: 60000     // 60 seconds for slower operations
});
```

### Screenshots

```typescript
configure({
  screenshotOnFailure: true   // Capture on failure (default)
  // screenshotOnFailure: false  // Disable screenshots
});
```

### Output Directory

```typescript
configure({
  outputDir: 'copilot-test-results'    // Default
  // outputDir: 'test-reports'          // Custom directory
  // outputDir: `results-${Date.now()}` // Timestamped directories
});
```

### Base URL

```typescript
configure({
  baseUrl: 'https://example.com'  // Global base URL
});

// Override per platform
configure({
  baseUrl: 'https://example.com',
  platforms: {
    web: webPlatform({
      baseUrl: 'https://staging.example.com'  // Platform-specific
    })
  }
});
```

## Parallel Execution

### Basic Parallel Configuration

```typescript
configure({
  parallel: true,           // Enable parallel execution
  maxWorkers: 4,            // Number of concurrent workers
  workerTimeout: 300000,    // 5 minutes per worker
  failFast: false           // Continue even if one fails
});
```

### Auto Worker Count

```typescript
configure({
  parallel: true,
  maxWorkers: 'auto'  // Automatically use (CPU cores - 1)
});
```

### Fail Fast

```typescript
configure({
  parallel: true,
  failFast: true  // Stop all workers on first failure
});
```

## Retry Configuration

### Basic Retry

```typescript
configure({
  retry: {
    enabled: true,
    stepRetries: 3,           // Retry up to 3 times
    stepRetryDelay: 1000      // Wait 1 second between retries
  }
});
```

### Exponential Backoff

```typescript
configure({
  retry: {
    enabled: true,
    stepRetries: 5,
    strategy: 'exponential',
    initialDelay: 1000,       // Start with 1 second
    maxDelay: 10000,          // Cap at 10 seconds
    backoffFactor: 2          // Double each time: 1s, 2s, 4s, 8s, 10s
  }
});
```

### Conditional Retry

```typescript
configure({
  retry: {
    enabled: true,
    stepRetries: 3,

    // Only retry these errors
    retryOn: [
      'timeout',
      'network error',
      /connection refused/i
    ],

    // Never retry these errors
    skipRetryOn: [
      'assertion failed',
      /validation error/i
    ]
  }
});
```

### Custom Retry Logic

```typescript
configure({
  retry: {
    enabled: true,

    // Custom decision function
    shouldRetry: (error, attempt) => {
      const msg = typeof error === 'string' ? error : error.message;

      // Retry rate limits up to 5 times
      if (msg.includes('rate limit')) {
        return attempt <= 5;
      }

      // Retry server errors up to 3 times
      if (msg.includes('server error')) {
        return attempt <= 3;
      }

      return false;
    },

    // Custom delay calculation
    delayFn: (attempt) => {
      return Math.min(1000 * Math.pow(2, attempt), 30000);
    }
  }
});
```

### Flaky Test Tracking

```typescript
configure({
  retry: {
    enabled: true,
    trackFlaky: true,
    flakyThreshold: 2,

    onFlakyDetected: (scenarioName, attempts) => {
      console.warn(`⚠️ Flaky: ${scenarioName} passed on attempt ${attempts}`);
      // Send to monitoring system, create issue, etc.
    }
  }
});
```

## Watch Mode

### Basic Watch Configuration

```typescript
configure({
  watch: {
    enabled: true,
    include: ['src/**/*.ts', 'tests/**/*.spec.ts'],
    exclude: ['node_modules/**', 'dist/**']
  }
});
```

### Watch Options

```typescript
configure({
  watch: {
    enabled: true,
    include: ['src/**/*.ts', 'tests/**/*.spec.ts'],
    exclude: ['node_modules/**', 'dist/**'],
    debounce: 300,            // Wait 300ms before re-running
    runMode: 'all',           // 'all' | 'related' | 'changed-files'
    failedFirst: true,        // Run failed tests first
    clearConsole: false,      // Don't clear console between runs
    verbose: true             // Show detailed output
  }
});
```

## Performance Monitoring

### Basic Performance Configuration

```typescript
configure({
  performance: {
    warnThreshold: 5000,      // Warn if step > 5 seconds
    failThreshold: 30000      // Fail if step > 30 seconds
  }
});
```

### Advanced Performance Monitoring

```typescript
configure({
  performance: {
    warnThreshold: 5000,
    failThreshold: 30000,
    trackTrends: true,        // Track performance over time
    reportSlowSteps: true     // Include slow steps in report
  }
});
```

## Debug Mode

### Basic Debug

```typescript
configure({
  debugMode: true
});
```

### Debug with Breakpoints

```typescript
configure({
  debugMode: true,
  breakpoints: [
    'When I click submit',
    'Then I should see'
  ]
});
```

### Interactive Step-Through

```typescript
configure({
  debugMode: true,
  interactive: true  // Step through each step manually
});
```

## Custom MCP Servers

### Add Custom MCP Server

```typescript
configure({
  mcpServers: {
    database: {
      type: 'stdio',
      command: 'npx',
      args: ['@copilot-test/postgres-mcp'],
      env: {
        DATABASE_URL: process.env.DATABASE_URL
      }
    },
    slack: {
      type: 'stdio',
      command: 'node',
      args: ['./mcp-servers/slack-server.js'],
      env: {
        SLACK_TOKEN: process.env.SLACK_TOKEN
      }
    }
  }
});
```

## Environment-Based Configuration

### Using Environment Variables

```typescript
configure({
  model: process.env.AI_MODEL || 'gpt-4o',

  platforms: {
    web: webPlatform({
      headless: process.env.CI === 'true',
      baseUrl: process.env.BASE_URL || 'https://staging.example.com'
    })
  },

  parallel: process.env.PARALLEL === 'true',
  maxWorkers: parseInt(process.env.MAX_WORKERS || '4'),

  outputDir: process.env.OUTPUT_DIR || 'copilot-test-results'
});
```

### Multiple Environment Configs

```typescript
// config/environments.ts
export const environments = {
  development: {
    baseUrl: 'http://localhost:3000',
    headless: false
  },
  staging: {
    baseUrl: 'https://staging.example.com',
    headless: true
  },
  production: {
    baseUrl: 'https://example.com',
    headless: true
  }
};

// copilot-test.config.ts
import { environments } from './config/environments';

const env = process.env.NODE_ENV || 'development';
const config = environments[env];

configure({
  platforms: {
    web: webPlatform({
      baseUrl: config.baseUrl,
      headless: config.headless
    })
  }
});
```

## Plugin Configuration

### Register Plugins

```typescript
import { myPlugin } from './plugins/my-plugin';

configure({
  plugins: [
    myPlugin,
    slackNotifier({ webhook: process.env.SLACK_WEBHOOK }),
    junitReporter({ outputFile: 'junit-results.xml' })
  ]
});
```

## Custom Step Definitions

### Enable Custom Steps

```typescript
configure({
  useCustomStepDefinitions: true
});

// Then define custom steps
import { defineStep } from 'copilot-test';

defineStep(/^I login as "(.+)"$/, async (context, username) => {
  // Custom implementation
});
```

## Complete Configuration Example

```typescript
import { configure, webPlatform, apiPlatform } from 'copilot-test';

const isCI = process.env.CI === 'true';
const environment = process.env.NODE_ENV || 'development';

configure({
  // AI Configuration
  model: process.env.AI_MODEL || 'gpt-4o',
  reasoningEffort: 'medium',

  // Platforms
  platforms: {
    web: webPlatform({
      browser: 'chromium',
      headless: isCI,
      baseUrl: process.env.WEB_URL || 'https://staging.example.com'
    }),
    api: apiPlatform({
      baseUrl: process.env.API_URL || 'https://api-staging.example.com',
      defaultHeaders: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`
      }
    })
  },

  // Execution
  stepTimeout: 30000,
  screenshotOnFailure: true,
  outputDir: 'test-results',

  // Parallel Execution
  parallel: isCI,
  maxWorkers: isCI ? 'auto' : 2,
  workerTimeout: 300000,
  failFast: false,

  // Retry Strategy
  retry: {
    enabled: true,
    stepRetries: 3,
    strategy: 'exponential',
    initialDelay: 1000,
    maxDelay: 10000,
    retryOn: ['timeout', 'network error'],
    trackFlaky: true
  },

  // Performance Monitoring
  performance: {
    warnThreshold: 5000,
    failThreshold: 30000
  },

  // Watch Mode (development only)
  watch: environment === 'development' ? {
    enabled: true,
    include: ['src/**/*.ts', 'tests/**/*.spec.ts'],
    exclude: ['node_modules/**'],
    debounce: 300
  } : undefined,

  // Debug Mode
  debugMode: !isCI && process.env.DEBUG === 'true',

  // Custom Steps
  useCustomStepDefinitions: true,

  // Plugins
  plugins: [
    // Add your plugins here
  ]
});
```

## Next Steps

- [Best Practices](./best-practices.md) - Configuration best practices
- [Advanced Parallel Execution](../advanced/parallel-execution.md)
- [Custom MCP Servers](../advanced/custom-mcp-servers.md)
- [Plugins](../advanced/plugins.md)
