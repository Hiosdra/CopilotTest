# Watch Mode Documentation

## Overview

CopilotTest now supports **watch mode** for continuous test execution during development. Watch mode automatically detects file changes and re-runs your tests, providing instant feedback.

## Quick Start

```bash
# Start watch mode with your test configuration
npm run test:watch
```

## Configuration

Add watch configuration to your `copilot-test.config.ts`:

```typescript
import { configure } from "./src/index.js";
import { webPlatform } from "./src/platforms/web.js";

configure({
  model: "gpt-4o",
  platforms: {
    web: webPlatform({
      browser: "chromium",
      headless: true,
    }),
  },
  watch: {
    enabled: true,
    include: ["src/**/*.ts", "tests/**/*.spec.ts"],
    exclude: ["node_modules/**", "dist/**", "**/.*"],
    debounce: 300,           // Wait 300ms before re-running
    runMode: "all",          // 'all' | 'related' | 'changed-files'
    failedFirst: true,       // Run failed tests first
    clearConsole: false,     // Clear console before each run
    notifications: false,    // OS notifications (future feature)
    verbose: true,           // Verbose output
    maxWorkers: 2,           // Limit workers in watch mode
  },
});
```

## Watch Mode Options

### `enabled`
Enable or disable watch mode. Default: `false`

### `include`
Array of glob patterns for files to watch. Default: `["src/**/*.ts", "tests/**/*.ts", "**/*.spec.ts"]`

### `exclude`
Array of glob patterns to exclude from watching. Default: `["node_modules/**", "dist/**", "**/.*"]`

### `debounce`
Milliseconds to wait before re-running tests after a file change. Default: `300`

### `runMode`
Test execution strategy:
- `"all"`: Run all tests (default)
- `"related"`: Run tests related to changed files (future enhancement)
- `"changed-files"`: Run only tests in changed files (future enhancement)

### `failedFirst`
Run failed tests before passed tests. Default: `false`

### `clearConsole`
Clear the console before each test run. Default: `false`

### `notifications`
Show OS notifications on test completion. Default: `false` (future feature)

### `verbose`
Enable verbose output during watch mode. Default: `false`

### `maxWorkers`
Maximum number of parallel workers in watch mode. Default: CPU count - 1

## Interactive Controls

When running in a terminal (TTY), watch mode provides interactive keyboard controls:

```
Interactive Commands:
  a - Run all tests
  f - Run only failed tests
  q - Quit watch mode
  Enter - Re-run tests
```

### Examples

**Run all tests:**
Press `a` to execute all tests immediately.

**Re-run failed tests:**
Press `f` to quickly re-run only the tests that failed in the last run.

**Quit watch mode:**
Press `q` or `Ctrl+C` to exit watch mode.

**Re-run current tests:**
Press `Enter` to re-run the tests without waiting for file changes.

## Usage Examples

### Basic Watch Mode

```typescript
import { configure, test, feature, startWatchMode, TestRunner } from "copilot-test";
import { webPlatform } from "copilot-test";

configure({
  platforms: { web: webPlatform() },
  watch: { enabled: true },
});

test(
  feature("Login")
    .scenario("Successful login")
      .given("I am on the login page")
      .when("I enter valid credentials")
      .then("I see the dashboard")
      .done()
    ._build(),
  "web"
);

// Start watch mode
const runner = new TestRunner();
const config = runner.getConfig();
if (config) {
  await startWatchMode(config, runner);
}
```

### Watch Specific Patterns

Watch only specific file patterns:

```typescript
configure({
  platforms: { web: webPlatform() },
  watch: {
    enabled: true,
    include: ["src/components/**/*.ts", "tests/components/**/*.spec.ts"],
    exclude: ["**/*.test.ts"],
  },
});
```

### Watch with Parallel Execution

Combine watch mode with parallel test execution:

```typescript
configure({
  platforms: { web: webPlatform() },
  parallel: true,
  maxWorkers: 4,
  watch: {
    enabled: true,
    maxWorkers: 2,  // Use fewer workers in watch mode
    debounce: 500,
  },
});
```

## Watch Mode UI

Watch mode displays a clean, informative interface:

```
╔════════════════════════════════════════╗
║      COPILOT TEST - WATCH MODE         ║
╚════════════════════════════════════════╝

📁 Watching 42 files...

============================================================
🔄 Running tests... (10:30:45 AM)
============================================================

📝 Changed files:
  • src/login.ts
  • tests/login.spec.ts

[Test execution output...]

╔════════════════════════════════════════╗
║ Status: ✓ All tests passed            ║
║ Tests: 12 passed, 0 failed            ║
║ Pass rate: 100%                        ║
║ Duration: 2345ms                       ║
╚════════════════════════════════════════╝

────────────────────────────────────────────────────────────
Interactive Commands:
  a - Run all tests
  f - Run only failed tests
  q - Quit watch mode
  Enter - Re-run tests
────────────────────────────────────────────────────────────

👀 Watching for file changes...
```

## CI/CD Usage

Watch mode automatically detects non-TTY environments and disables interactive features, making it safe to use in CI/CD pipelines (though typically you'd use regular test execution in CI):

```bash
# In CI/CD, watch mode will run once and exit
npm run test:watch
```

## Programmatic API

You can also start watch mode programmatically:

```typescript
import { startWatchMode, TestRunner, configure } from "copilot-test";

configure({
  platforms: { web: webPlatform() },
  watch: { enabled: true },
});

const runner = new TestRunner();
const config = runner.getConfig();

if (config) {
  await startWatchMode(config, runner);
}
```

## Tips and Best Practices

1. **Use appropriate debounce values**: 300ms is usually good for most projects. Increase if you're making rapid changes.

2. **Exclude build artifacts**: Always exclude `node_modules`, `dist`, and other generated directories.

3. **Combine with parallel execution**: Use fewer workers in watch mode than in CI for better responsiveness.

4. **Use failedFirst for quick feedback**: Enable `failedFirst: true` to see failures immediately.

5. **Keep console output clean**: Set `clearConsole: true` for a cleaner experience when files change frequently.

## Troubleshooting

### Watch mode not detecting changes

- Ensure your file patterns in `include` match the files you're editing
- Check that files aren't excluded by `exclude` patterns
- Verify file permissions allow watching

### Performance issues

- Reduce the number of watched files using more specific `include` patterns
- Increase `debounce` delay to reduce rapid re-runs
- Reduce `maxWorkers` in watch mode
- Exclude unnecessary directories

### Interactive controls not working

- Ensure you're running in a TTY terminal (not a pipe or redirect)
- Check that your terminal supports raw mode
- Try a different terminal emulator

## Future Enhancements

Planned features for future releases:

- **Smart test selection**: Automatic detection of related tests based on file dependencies
- **Desktop notifications**: OS-level notifications on test completion
- **Pattern filtering**: Runtime filtering by test name or tag
- **Coverage tracking**: Watch mode integration with code coverage tools
- **Test impact analysis**: Show which tests are affected by code changes

## See Also

- [Configuration Guide](./configuration.md)
- [Parallel Execution](./parallel.md)
- [Debug Mode](./debug.md)
