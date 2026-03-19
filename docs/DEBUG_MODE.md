# Interactive Debug Mode

CopilotTest includes a powerful interactive debugging mode to help you develop and troubleshoot tests more efficiently.

## Features

### 1. **Breakpoints**
Pause execution at specific steps to inspect state and verify behavior.

```typescript
configure({
  debugMode: true,
  breakpoints: [
    'When I click the submit button',
    'Then I should see an error message'
  ]
});
```

### 2. **Step-through Execution**
Execute one step at a time with user confirmation.

```typescript
configure({
  debugMode: true,
  interactive: true  // Enables step-through mode
});
```

### 3. **Scenario-level Debug**
Enable debug mode for specific scenarios only.

```typescript
feature('Login')
  .scenario('Admin login')
    .debug()  // Debug this scenario only
    .given('I am on the login page')
    .when('I enter credentials')
    .then('I should be logged in')
```

### 4. **Interactive Console**
When execution pauses at a breakpoint, an interactive console provides commands to control execution:

```
copilot-debug> continue (c)     - Continue execution
copilot-debug> step (s)         - Execute next step
copilot-debug> skip             - Skip current step
copilot-debug> inspect context  - Show scenario details
copilot-debug> inspect results  - Show step results
copilot-debug> retry [input]    - Retry step with optional modifications
copilot-debug> exit (q)         - Exit debug mode
```

## Usage Examples

### Example 1: Global Debug Mode

```typescript
import { configure, feature, test, run, webPlatform } from 'copilot-test';

configure({
  debugMode: true,  // Enable debug for all tests
  platforms: {
    web: webPlatform({ browser: 'chromium' })
  }
});

const loginTest = feature('User Login')
  .scenario('Failed login')
    .given('I am on the login page')
    .when('I enter invalid credentials')
    .then('I should see an error')
    .done()
  ._build();

test(loginTest, 'web');
await run();
```

### Example 2: Breakpoints on Specific Steps

```typescript
configure({
  debugMode: true,
  breakpoints: [
    'When I click the submit button',
    'Then I should see a confirmation'
  ],
  platforms: {
    web: webPlatform({ browser: 'chromium' })
  }
});

const checkoutTest = feature('Checkout')
  .scenario('Complete purchase')
    .given('I have items in cart')
    .when('I proceed to checkout')
    .and('I click the submit button')  // Breakpoint here
    .then('I should see a confirmation')  // Breakpoint here
    .done()
  ._build();

test(checkoutTest, 'web');
await run();
```

### Example 3: Scenario-specific Debug

```typescript
configure({
  platforms: {
    web: webPlatform({ browser: 'chromium' })
  }
});

const tests = feature('User Management')
  .scenario('Create user')
    .given('I am logged in as admin')
    .when('I create a new user')
    .then('User should be created')
  .scenario('Delete user')
    .debug()  // Only debug this scenario
    .given('I am logged in as admin')
    .when('I delete a user')
    .then('User should be deleted')
    .done()
  ._build();

test(tests, 'web');
await run();
```

### Example 4: Step-through Mode

```typescript
configure({
  debugMode: true,
  interactive: true,  // Pause before each step
  platforms: {
    web: webPlatform({ browser: 'chromium' })
  }
});

// Every step will pause for confirmation
const test = feature('Registration')
  .scenario('New user signup')
    .given('I am on the signup page')
    .when('I fill in the registration form')
    .and('I submit the form')
    .then('I should see a success message')
    .done()
  ._build();

test(test, 'web');
await run();
```

## Interactive Console Commands

When execution pauses at a breakpoint, you'll see:

```
🔍 DEBUG MODE - Breakpoint reached
📍 Step: When I click the submit button
📊 Step 3/5
⏱️  Last step: passed (1234ms)
💭 Reasoning: Successfully filled in the form fields

Available commands:
  continue (c)    - Continue execution
  step (s)        - Execute next step
  skip            - Skip current step
  inspect context - Show scenario context
  inspect results - Show step results
  retry [input]   - Retry step with optional input
  exit (q)        - Exit debug mode

copilot-debug>
```

### Command Details

#### `continue` (or `c`)
Continues execution until the next breakpoint or end of scenario.

```
copilot-debug> continue
▶️  Continuing...
```

#### `step` (or `s`)
Executes the current step and pauses at the next one (enables step-through mode).

```
copilot-debug> step
▶️  Continuing...
```

#### `skip`
Skips the current step without executing it and moves to the next.

```
copilot-debug> skip
⏭️  Skipping step
```

#### `inspect context`
Shows detailed information about the current scenario.

```
copilot-debug> inspect context

📋 Scenario Context:
  Name: Failed login attempt
  Tags: @auth, @negative
  Total Steps: 5
  Current Step: 3

📝 All Steps:
   ✓ Given I am on the login page
   ✓ When I enter invalid credentials
 → · And I click the login button
   · Then I should see an error message
   · And I should remain on the login page
```

#### `inspect results`
Shows results of all executed steps so far.

```
copilot-debug> inspect results

📊 Step Results:
  ✓ Given I am on the login page
     Status: passed
     Duration: 856ms
     Reasoning: Navigated to login page successfully
  ✓ When I enter invalid credentials
     Status: passed
     Duration: 412ms
     Reasoning: Entered username and password
```

#### `retry [input]`
Retries the current step, optionally with modifications.

```
copilot-debug> retry
🔄 Retrying step...
```

#### `exit` (or `q`)
Exits debug mode and marks remaining steps as skipped.

```
copilot-debug> exit
🛑 Debug mode exited by user
```

## Configuration Reference

### CopilotTestConfig Debug Options

```typescript
interface CopilotTestConfig {
  // ... other options ...

  debugMode?: boolean;        // Enable debug features globally
  breakpoints?: string[];     // List of step texts to break on
  interactive?: boolean;      // Enable step-through mode
}
```

### Scenario Debug Method

```typescript
class ScenarioBuilder {
  debug(): this;  // Enable debug for this scenario only
}
```

## Use Cases

### 1. Developing New Tests
Enable step-through mode to verify each step executes correctly:

```typescript
configure({
  debugMode: true,
  interactive: true
});
```

### 2. Debugging Failures
Set breakpoints on failing steps to inspect state:

```typescript
configure({
  debugMode: true,
  breakpoints: ['Then I should see the dashboard']
});
```

### 3. Investigating Flaky Tests
Use inspect commands to understand timing and state issues:

```typescript
// At breakpoint:
copilot-debug> inspect results
copilot-debug> inspect context
```

### 4. Testing Specific Scenarios
Enable debug only for problematic scenarios:

```typescript
.scenario('Problematic test')
  .debug()
  .given(...)
```

## Tips

1. **Case-insensitive matching**: Breakpoints match step text case-insensitively
2. **Partial matching**: Breakpoints can match partial step text
3. **Cleanup on exit**: Debug controller automatically cleans up readline interface
4. **Non-interactive CI**: Debug mode is disabled in CI environments by default

## Limitations

- Debug mode requires an interactive terminal (TTY)
- Not suitable for automated CI/CD pipelines (disable in CI)
- Background steps are included in debug flow
- Session state is preserved between debugged steps

## Examples

See `tests/debug-example.spec.ts` for complete working examples.
