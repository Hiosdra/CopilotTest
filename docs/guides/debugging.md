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

```typescript
configure({
  platforms: {
    web: webPlatform({
      headless: false  // Show browser window
    })
  }
});
```

Watch the test execute in real-time to spot issues.

## Debug Mode

### Enable Debug Mode

```typescript
configure({
  debugMode: true
});
```

This provides:
- Detailed console output
- AI thinking process
- MCP tool calls
- Response data

### Interactive Debug Mode

Step through tests manually:

```typescript
configure({
  debugMode: true,
  interactive: true
});
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

```typescript
configure({
  debugMode: true,
  breakpoints: [
    'When I click submit',
    'Then I should see',
    'payment'  // Matches any step containing "payment"
  ]
});
```

### Scenario-Level Debug

Debug specific scenarios:

```typescript
feature('Login')
  .scenario('Admin login')
    .debug()  // Enable debug for this scenario only
    .given('I am on the login page')
    .when('I enter credentials')
    .then('I should be logged in')
    .done()
  ._build();
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
```typescript
// Too specific - might fail
.when('I click the "Submit Order" button')

// More flexible
.when('I click the Submit button')
.when('I click the button containing "Submit"')
```

**B. Wait for element:**
```typescript
.when('I wait for the Submit button to appear')
.and('I click the Submit button')
```

**C. Check exact text:**
```typescript
// Wrong case
.when('I click the "submit" button')  // ✗

// Correct case
.when('I click the "Submit" button')  // ✓
```

### 2. Timeout Errors

**Symptoms:**
```
✗ When I submit the form
Error: Step timed out after 30000ms
```

**Solutions:**

**A. Increase timeout:**
```typescript
configure({
  stepTimeout: 60000  // 60 seconds
});
```

**B. Add explicit waits:**
```typescript
.when('I submit the form')
.and('I wait for the response')
.then('I should see confirmation')
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
```typescript
configure({
  retry: {
    enabled: true,
    stepRetries: 3,
    trackFlaky: true,
    flakyThreshold: 2,
    onFlakyDetected: (name, attempts) => {
      console.warn(`Flaky test: ${name} (${attempts} attempts)`);
    }
  }
});
```

**B. Add explicit waits:**
```typescript
// Bad - assumes immediate load
.when('I click "Load Data"')
.then('the table should have 10 rows')

// Good - wait for data
.when('I click "Load Data"')
.and('I wait for the loading to complete')
.then('the table should have 10 rows')
```

**C. Make tests independent:**
```typescript
// Bad - depends on previous test
.scenario('Delete user')
  .when('I delete the user')  // Which user?

// Good - sets up own state
.scenario('Delete user')
  .given('I have created a test user')
  .when('I delete the test user')
```

### 4. Assertion Failures

**Symptoms:**
```
✗ Then I should see "Welcome"
Error: Expected "Welcome" but found "Welcome!"
```

**Solutions:**

**A. Use partial matching:**
```typescript
// Strict - might fail
.then('I should see "Welcome, John Doe"')

// Flexible - more robust
.then('I should see text containing "Welcome"')
.and('I should see text containing "John"')
```

**B. Check actual vs expected:**
Review the AI reasoning to see what was actually found.

**C. Account for dynamic content:**
```typescript
// Bad - exact match on dynamic data
.then('the timestamp should be "2024-01-15 10:30:00"')

// Good - check format
.then('the timestamp should be in format YYYY-MM-DD HH:MM:SS')
```

### 5. Authentication Issues

**Symptoms:**
```
✗ When I navigate to the dashboard
Error: Redirected to login page (401 Unauthorized)
```

**Solutions:**

**A. Verify credentials:**
```typescript
// Check environment variables
console.log('Username:', process.env.TEST_USERNAME);
console.log('API Token:', process.env.API_TOKEN ? '✓ Set' : '✗ Missing');
```

**B. Add login step:**
```typescript
.scenario('View dashboard')
  .given('I am logged in as "admin@example.com"')
  .when('I navigate to the dashboard')
  .then('I should see the dashboard')
  .done()
```

**C. Check session persistence:**
```typescript
.given('I am logged in')
.when('I reload the page')
.then('I should still be logged in')  // Session should persist
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

```typescript
.scenario('Debug API calls')
  .given('I am on the page')
  .when('I perform an action')
  .then('I should see the network request to /api/users')
  .and('the request should return 200')
  .done()
```

**Inspect page source:**

Use headless: false and manually inspect the page when tests pause.

### API Testing

**Log request/response:**

```typescript
configure({
  debugMode: true  // Shows full request/response
});
```

**Verify API endpoint:**

```bash
# Test endpoint directly
curl -X GET https://api.example.com/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Check API status:**

```typescript
.scenario('Health check')
  .when('I send a GET request to /health')
  .then('the response status should be 200')
  .and('the response should contain "status: ok"')
  .done()
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

```typescript
configure({
  performance: {
    warnThreshold: 5000,   // Warn if step > 5s
    failThreshold: 30000   // Fail if step > 30s
  }
});
```

The report will highlight slow steps:

```
⚠️ When I load the dashboard (8.5s) [SLOW]
```

### Check Network Performance

For web tests:

```typescript
.scenario('Monitor page load')
  .when('I navigate to https://example.com')
  .then('the page should load in less than 3 seconds')
  .and('all resources should be loaded')
  .done()
```

## Screenshot Debugging

### Automatic Screenshots

Screenshots are captured on failure by default:

```typescript
configure({
  screenshotOnFailure: true
});
```

Find screenshots in:
```
copilot-test-results/screenshots/
└── scenario-name-step-3-failed.png
```

### Manual Screenshots

```typescript
.scenario('Debug visual issue')
  .given('I am on the page')
  .when('I perform an action')
  .and('I take a screenshot')  // Manual screenshot
  .then('I verify the result')
  .done()
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

configure({
  plugins: [debugPlugin]
});
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
      logs/
```

### Enable Verbose Logging

```bash
copilot-test run --verbose --debug
```

### Check Environment

```typescript
configure({
  debugMode: process.env.CI === 'true'
});

if (process.env.CI) {
  console.log('Running in CI environment');
  console.log('Node version:', process.version);
  console.log('Environment:', process.env.NODE_ENV);
}
```

## Getting Help

If you're still stuck:

1. **Check the documentation:**
   - [Troubleshooting Guide](../troubleshooting/common-errors.md)
   - [AI Interpretation Issues](../troubleshooting/ai-interpretation-issues.md)

2. **Review examples:**
   - [Example Tests](../examples/)

3. **Search existing issues:**
   - [GitHub Issues](https://github.com/Hiosdra/CopilotTest/issues)

4. **Create a minimal reproduction:**
   ```typescript
   // Simplify your test to the failing step
   test(
     feature('Debug')
       .scenario('Minimal reproduction')
         .given('setup')
         .when('failing step')
         .then('expected result')
         .done()
       ._build(),
     'web'
   );
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
