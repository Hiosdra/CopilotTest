# Debugging Guide

Learn how to debug failing tests and troubleshoot issues in CopilotTest.

## Quick Debug Checklist

When a test fails, follow these steps:

1. ✅ **Check the AI reasoning** in the HTML report
2. ✅ **Review screenshots** (if captured)
3. ✅ **Run with headless: false** to watch execution
4. ✅ **Enable debug mode** for detailed logs
5. ✅ **Use breakpoints** to pause at specific steps
6. ✅ **Verify step clarity** - rephrase vague steps
7. ✅ **Check environment** - URLs, credentials, data

## Viewing Test Results

### HTML Report

After running tests, open the HTML report:

```bash
# Auto-open the latest report
copilot-test report

# Or manually open
open copilot-test-results/report.html
```

The report includes:
- Test summary and statistics
- Step-by-step execution details
- AI reasoning for each step
- Screenshots (on failure)
- Performance metrics
- Error messages and stack traces

### AI Reasoning

Each step in the report shows what the AI was thinking:

```
✓ When I click the "Submit" button (1.2s)

AI Reasoning:
  I need to locate and click the Submit button.
  1. Finding button with text "Submit"
  2. Located button at selector: button.submit-btn
  3. Clicking button
  4. ✓ Click successful
```

## Running in Non-Headless Mode

See what the browser is doing:

```yaml
# copilot-test.config.yaml
platforms:
  web:
    platform: web
    headless: false    # Show browser window
```

Watch the test execute in real-time to spot issues.

## Debug Mode

### Enable Debug Mode

```yaml
# copilot-test.config.yaml
debugMode: true
```

This provides:
- Detailed console output
- AI thinking process
- MCP tool calls
- Response data

### Interactive Debug Mode

Step through tests manually:

```yaml
# copilot-test.config.yaml
debugMode: true
interactive: true
```

Available commands during execution:
```
continue (c)    - Continue to next breakpoint
step (s)        - Execute next step
skip            - Skip current step
inspect context - Show scenario context
inspect results - Show step results
retry [input]   - Retry step with modified input
exit (q)        - Exit debug mode
```

### Breakpoints

Pause execution at specific steps:

```yaml
# copilot-test.config.yaml
debugMode: true
breakpoints:
  - "When I click submit"
  - "Then I should see"
  - "payment"    # Matches any step containing "payment"
```

### Scenario-Level Debug

Debug specific scenarios by adding `debug: true` to the frontmatter of a `.feature.md` file to enable debug mode for all scenarios in that file:

```markdown
---
platform: web
debug: true
---

# Feature: Login

## Scenario: Admin login
- Given I am on the login page
- When I enter credentials
- Then I should be logged in
```

## Common Failure Patterns

### 1. Element Not Found

**Symptoms:**
```
✗ When I click the "Submit" button
Error: Element not found: button with text "Submit"
```

**Solutions:**

**A. Check element selector:**
```markdown
<!-- Too specific - might fail -->
- When I click the "Submit Order" button

<!-- More flexible -->
- When I click the Submit button
- When I click the button containing "Submit"
```

**B. Wait for element:**
```markdown
- When I wait for the Submit button to appear
- And I click the Submit button
```

**C. Check exact text:**
```markdown
<!-- Wrong case -->
- When I click the "submit" button  <!-- ✗ -->

<!-- Correct case -->
- When I click the "Submit" button  <!-- ✓ -->
```

### 2. Timeout Errors

**Symptoms:**
```
✗ When I submit the form
Error: Step timed out after 30000ms
```

**Solutions:**

**A. Increase timeout:**
```yaml
# copilot-test.config.yaml
stepTimeout: 60000    # 60 seconds
```

**B. Add explicit waits:**
```markdown
- When I submit the form
- And I wait for the response
- Then I should see confirmation
```

**C. Check network/server:**
- Is the server running?
- Is the endpoint responding?
- Are there network issues?

### 3. Flaky Tests

**Symptoms:**
- Test passes sometimes, fails other times
- Different results on different runs

**Solutions:**

**A. Enable retry:**
```yaml
# copilot-test.config.yaml
retry:
  enabled: true
  stepRetries: 3
  trackFlaky: true
  flakyThreshold: 2
```

> **Note:** The `onFlakyDetected` callback requires a [plugin](../advanced/plugins.md).

**B. Add explicit waits:**
```markdown
<!-- Bad - assumes immediate load -->
- When I click "Load Data"
- Then the table should have 10 rows

<!-- Good - wait for data -->
- When I click "Load Data"
- And I wait for the loading to complete
- Then the table should have 10 rows
```

**C. Make tests independent:**
```markdown
<!-- Bad - depends on previous test -->
## Scenario: Delete user
- When I delete the user  <!-- Which user? -->

<!-- Good - sets up own state -->
## Scenario: Delete user
- Given I have created a test user
- When I delete the test user
```

### 4. Assertion Failures

**Symptoms:**
```
✗ Then I should see "Welcome"
Error: Expected "Welcome" but found "Welcome!"
```

**Solutions:**

**A. Use partial matching:**
```markdown
<!-- Strict - might fail -->
- Then I should see "Welcome, John Doe"

<!-- Flexible - more robust -->
- Then I should see text containing "Welcome"
- And I should see text containing "John"
```

**B. Check actual vs expected:**
Review the AI reasoning to see what was actually found.

**C. Account for dynamic content:**
```markdown
<!-- Bad - exact match on dynamic data -->
- Then the timestamp should be "2024-01-15 10:30:00"

<!-- Good - check format -->
- Then the timestamp should be in format YYYY-MM-DD HH:MM:SS
```

### 5. Authentication Issues

**Symptoms:**
```
✗ When I navigate to the dashboard
Error: Redirected to login page (401 Unauthorized)
```

**Solutions:**

**A. Verify credentials:**

Check that the required environment variables are set before running tests:

```bash
echo "Username: ${TEST_USERNAME}"
echo "API Token: ${API_TOKEN:+✓ Set}"
echo "API Token: ${API_TOKEN:-✗ Missing}"
```

**B. Add login step:**
```markdown
## Scenario: View dashboard
- Given I am logged in as "admin@example.com"
- When I navigate to the dashboard
- Then I should see the dashboard
```

**C. Check session persistence:**
```markdown
- Given I am logged in
- When I reload the page
- Then I should still be logged in
```

## Debugging by Platform

### Web Testing

**View browser console:**

```typescript
// Custom step to check console
defineStep(/^I check the browser console$/, async (context) => {
  // Implementation depends on your setup
  // Playwright MCP might capture console logs
});
```

**Check network requests:**

```markdown
## Scenario: Debug API calls
- Given I am on the page
- When I perform an action
- Then I should see the network request to /api/users
- And the request should return 200
```

**Inspect page source:**

Use headless: false and manually inspect the page when tests pause.

### API Testing

**Log request/response:**

```yaml
# copilot-test.config.yaml
debugMode: true    # Shows full request/response
```

**Verify API endpoint:**

```bash
# Test endpoint directly
curl -X GET https://api.example.com/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Check API status:**

```markdown
## Scenario: Health check
- When I send a GET request to /health
- Then the response status should be 200
- And the response should contain "status: ok"
```

### Mobile Testing

**Check device connection:**

```bash
# List connected devices
adb devices

# View device logs
adb logcat | grep MyApp
```

**Screenshot current screen:**

```bash
adb exec-out screencap -p > screen.png
```

**Verify app installation:**

```bash
adb shell pm list packages | grep com.example.app
```

## Using Scenario Context

Store and inspect data between steps:

```typescript
import { defineStep } from 'copilot-test';

defineStep(/^I store the user ID$/, async (context) => {
  const userId = 12345;  // Retrieved from somewhere
  context.set('userId', userId);
  console.log('Stored userId:', userId);
});

defineStep(/^I verify the stored user ID$/, async (context) => {
  const userId = context.get('userId');
  console.log('Retrieved userId:', userId);
  return `User ID is ${userId}`;
});

// In debug mode, inspect context
// > inspect context
// { userId: 12345 }
```

## Performance Debugging

### Identify Slow Steps

Enable performance monitoring:

```yaml
# copilot-test.config.yaml
performance:
  warnThreshold: 5000     # Warn if step > 5s
  failThreshold: 30000    # Fail if step > 30s
```

The report will highlight slow steps:

```
⚠️ When I load the dashboard (8.5s) [SLOW]
```

### Check Network Performance

For web tests:

```markdown
## Scenario: Monitor page load
- When I navigate to https://example.com
- Then the page should load in less than 3 seconds
- And all resources should be loaded
```

## Screenshot Debugging

### Automatic Screenshots

Screenshots are captured on failure by default:

```yaml
# copilot-test.config.yaml
screenshotOnFailure: true
```

Find screenshots in:
```
copilot-test-results/screenshots/
└── scenario-name-step-3-failed.png
```

### Manual Screenshots

```markdown
## Scenario: Debug visual issue
- Given I am on the page
- When I perform an action
- And I take a screenshot
- Then I verify the result
```

## Error Messages

### Understanding Error Types

**Timeout Error:**
```
Error: Step timed out after 30000ms
```
→ Increase timeout or add waits

**Element Not Found:**
```
Error: Element not found: button with text "Submit"
```
→ Check selector, wait for element, verify page loaded

**Assertion Error:**
```
Error: Expected "Hello" but found "Hi"
```
→ Check exact text, use partial matching

**Network Error:**
```
Error: Failed to fetch: Network request failed
```
→ Check server, connectivity, CORS

**Authentication Error:**
```
Error: 401 Unauthorized
```
→ Verify credentials, check token expiry

## Debugging Custom Steps

Add logging to custom steps:

```typescript
defineStep(/^I perform complex action$/, async (context) => {
  console.log('Starting complex action');

  try {
    // Your implementation
    const result = await doSomething();
    console.log('Action successful:', result);
    return `Completed with result: ${result}`;
  } catch (error) {
    console.error('Action failed:', error);
    throw error;
  }
});
```

## Using Plugins for Debugging

Create a debug plugin:

```typescript
import { definePlugin } from 'copilot-test';

const debugPlugin = definePlugin({
  name: 'debug-plugin',

  onStepStart(step) {
    console.log(`→ Starting: ${step.keyword} ${step.text}`);
  },

  onStepEnd(step, result) {
    if (result.status === 'passed') {
      console.log(`✓ Passed: ${step.keyword} ${step.text} (${result.duration}ms)`);
    } else {
      console.error(`✗ Failed: ${step.keyword} ${step.text}`);
      console.error(`Error: ${result.error}`);
    }
  }
});

```

Then reference the plugin in your config:

```yaml
# copilot-test.config.yaml
plugins:
  - "./plugins/debug-plugin.ts"
```

## CI/CD Debugging

### Capture Artifacts

```yaml
# GitHub Actions
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-results
    path: |
      copilot-test-results/
      screenshots/
```

### Check Environment

```yaml
# copilot-test.config.yaml
debugMode: "${CI:-false}"
```

> **Tip:** In CI environments, set the `CI` environment variable to `true` to automatically enable debug mode and capture additional diagnostic output.

## Getting Help

If you're still stuck:

1. **Check the documentation:**
   - [Troubleshooting Guide](../troubleshooting/common-errors.md)
   - [AI Interpretation Issues](../troubleshooting/ai-interpretation-issues.md)

2. **Search existing issues:**
   - [GitHub Issues](https://github.com/Hiosdra/CopilotTest/issues)

3. **Create a minimal reproduction:**
   ```markdown
   ---
   platform: web
   debug: true
   ---

   # Feature: Debug

   ## Scenario: Minimal reproduction
   - Given setup
   - When failing step
   - Then expected result
   ```

5. **Report the issue:**
   - Include full error message
   - Attach screenshots/logs
   - Share minimal reproduction
   - Mention CopilotTest version

## Next Steps

- [Troubleshooting Guide](../troubleshooting/common-errors.md)
- [Best Practices](./best-practices.md)
- [Performance Tuning](../advanced/performance-tuning.md)
