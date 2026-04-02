# Watch Mode Documentation

## Overview

CopilotTest now supports **watch mode** for continuous test execution during development. Watch mode automatically detects file changes and re-runs your tests, providing instant feedback.

## Quick Start

```bash
# Start watch mode with your test configuration
npm run test:watch
```

## Configuration

Add watch configuration to your `copilot-test.config.yaml`:

```yaml
# copilot-test.config.yaml
model: gpt-5-mini
platforms:
  web:
    type: web
    browser: chromium
    headless: true
watch:
  enabled: true
  include:
    - "src/**/*.ts"
    - "tests/**/*.feature.md"
  exclude:
    - "node_modules/**"
    - "dist/**"
    - "**/.*"
  debounce: 300             # Wait 300ms before re-running
  runMode: all              # 'all' | 'related' | 'changed-files' (only 'all' currently implemented)
  failedFirst: true         # Run failed tests first (future enhancement)
  clearConsole: false       # Clear console before each run
  notifications: false      # OS notifications (future enhancement)
  verbose: true             # Verbose output
  maxWorkers: 2             # Limit workers in watch mode (uses global maxWorkers for now)
```

**Note**: Some configuration options like `runMode: "related"/"changed-files"`, `failedFirst`, `notifications`, and watch-specific `maxWorkers` are defined in the API but not fully implemented yet. They are reserved for future enhancements. Currently supported options are: `enabled`, `include`, `exclude`, `debounce`, and `clearConsole`.

## Watch Mode Options

### `enabled`
Enable or disable watch mode. Default: `false`

### `include`
Array of glob patterns for files to watch. Default: `["src/**/*.ts", "tests/**/*.ts", "**/*.feature.md"]`

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
Maximum number of parallel workers in watch mode.

**Note**: This option is currently reserved for future use. The current implementation uses the global `maxWorkers` configuration and does not apply watch-specific worker limits.

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

```yaml
# copilot-test.config.yaml
platforms:
  web:
    type: web
watch:
  enabled: true
```

```markdown
<!-- tests/login.feature.md -->
---
platform: web
---
# Feature: Login

## Scenario: Successful login
- Given I am on the login page
- When I enter valid credentials
- Then I see the dashboard
```

```bash
# Start watch mode via CLI
npm run test:watch
```

### Watch Specific Patterns

Watch only specific file patterns:

```yaml
# copilot-test.config.yaml
platforms:
  web:
    type: web
watch:
  enabled: true
  include:
    - "src/components/**/*.ts"
    - "tests/components/**/*.feature.md"
  exclude:
    - "**/*.test.ts"
```

### Watch with Parallel Execution

Combine watch mode with parallel test execution:

```yaml
# copilot-test.config.yaml
platforms:
  web:
    type: web
parallel: true
maxWorkers: 4
watch:
  enabled: true
  maxWorkers: 2    # Use fewer workers in watch mode
  debounce: 500
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
  • tests/login.feature.md

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

Watch mode automatically detects non-TTY environments and disables interactive keyboard controls. However, watch mode will continue watching for file changes indefinitely even in CI/non-interactive environments.

**For CI/CD pipelines, you should run tests once in non-watch mode instead:**

```bash
# In CI/CD, prefer running tests once without watch mode
npm test
# or for specific tests:
npm run test:web
```

If you accidentally run watch mode in CI, it will not hang on interactive prompts, but it will keep the process alive indefinitely watching for changes.

## Programmatic API

> **Note:** For most users, YAML configuration with `npm run test:watch` is recommended. The programmatic API is for advanced use cases that need custom integration.

For advanced use, you can also start watch mode programmatically:

```typescript
import { startWatchMode, getDefaultRunner, loadConfig } from "copilot-test";

const config = await loadConfig('./copilot-test.config.yaml');
const runner = getDefaultRunner();

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

**Note on file watchers**: The current implementation creates one file watcher per matched file. On very large projects (hundreds+ of files), this can hit OS file watcher limits (e.g., `EMFILE` or `ENOSPC` errors on Linux). If you encounter these issues:

1. Increase your system's file watcher limit:
   ```bash
   # Linux
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. Use more specific `include` patterns to watch fewer files

3. Watch only test files instead of source files if your tests are self-contained

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
