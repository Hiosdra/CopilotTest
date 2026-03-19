# Accessibility Testing Integration

CopilotTest now includes comprehensive accessibility testing capabilities powered by [axe-core](https://github.com/dequelabs/axe-core), the industry-standard accessibility testing engine.

## Features

- ✅ **WCAG 2.1 Compliance Scanning** (Levels A, AA, AAA)
- ⌨️ **Keyboard Navigation Testing**
- 🔊 **Screen Reader Compatibility Checks**
- 🎨 **Color Contrast Validation**
- 📑 **Semantic HTML Structure Analysis**
- 📝 **Form Accessibility Validation**
- 📊 **Detailed HTML Reports with Violation Details**
- 🤖 **AI-Powered Natural Language Testing**
- 📋 **Pre-defined Step Definitions for Common Checks**

## Installation

The accessibility testing dependencies are already included:

```bash
npm install copilot-test
```

## Quick Start

### Option 1: Direct API Usage

```typescript
import { feature, configure, run, webPlatform, createAccessibilityTester } from 'copilot-test';

configure({
  model: "gpt-4o",
  platforms: {
    web: webPlatform({ browser: "chromium" }),
  },
  accessibility: {
    enabled: true,
    standard: 'WCAG2AA',
    failOnViolations: false,
    includeInReport: true,
  },
});

feature("Login Page Accessibility")
  .scenario("WCAG compliance check")
    .given("I am on the login page")
    .then(async ({ page }) => {
      const a11y = createAccessibilityTester({
        enabled: true,
        standard: 'WCAG2AA',
        integrations: { axe: true },
      });

      const results = await a11y.scan(page);

      console.log(`Accessibility Score: ${results.score}/100`);
      console.log(`Violations: ${results.violations.length}`);

      // Fail on critical violations
      const critical = results.violations.filter(v => v.impact === 'critical');
      if (critical.length > 0) {
        throw new Error(`Found ${critical.length} critical violations`);
      }
    });

await run();
```

### Option 2: Natural Language Steps

```typescript
import { feature, configure, run, webPlatform, registerAccessibilitySteps } from 'copilot-test';

// Register pre-defined accessibility steps
registerAccessibilitySteps();

configure({
  model: "gpt-4o",
  platforms: {
    web: webPlatform({ browser: "chromium" }),
  },
  useCustomStepDefinitions: true,
});

feature("Login Page Accessibility")
  .scenario("Natural language accessibility test")
    .given("I am on the login page")
    .when("I check WCAG compliance")
    .then("the accessibility score should be at least 90")
    .and("there should be no critical violations")
    .and("I can navigate the page with keyboard")
    .and("all form fields should have labels");

await run();
```

## Configuration

### Global Configuration

Add accessibility configuration to your test setup:

```typescript
configure({
  // ... other config
  accessibility: {
    enabled: true,
    standard: 'WCAG2AA',  // 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA'

    // Rule-specific configurations
    rules: {
      'color-contrast': 'error',
      'image-alt': 'error',
      'label': 'warn',
    },

    // Reporting options
    failOnViolations: false,
    includeInReport: true,

    // Integration options
    integrations: {
      axe: true,
      lighthouse: false,
    },

    // Testing modes
    modes: {
      automated: true,
      keyboard: true,
      screenReader: false,
    },
  },
});
```

## API Reference

### `createAccessibilityTester(config)`

Create an accessibility tester instance.

```typescript
const a11y = createAccessibilityTester({
  enabled: true,
  standard: 'WCAG2AA',
  integrations: { axe: true },
});
```

### `scan(page, options?)`

Run a WCAG compliance scan on a page.

```typescript
const results = await a11y.scan(page, {
  rules: ['color-contrast', 'image-alt'],
  exclude: ['.third-party-widget'],
});

console.log(`Score: ${results.score}/100`);
console.log(`Violations: ${results.violations.length}`);
```

### `testKeyboardNavigation(page, selectors)`

Test keyboard navigation for specific elements.

```typescript
const result = await a11y.testKeyboardNavigation(page, [
  'input[name="username"]',
  'input[name="password"]',
  'button[type="submit"]',
]);

if (!result.passed) {
  console.log('Unreachable:', result.unreachable);
}
```

### `testTabOrder(page, regions)`

Verify logical tab order across page regions.

```typescript
const isValid = await a11y.testTabOrder(page, [
  'header nav',
  'main content',
  'footer',
]);
```

### `testScreenReader(page)`

Check screen reader compatibility.

```typescript
const result = await a11y.testScreenReader(page);

if (!result.passed) {
  console.log('Issues:', result.issues);
}
```

### `getHeadingStructure(page)`

Analyze heading hierarchy.

```typescript
const structure = await a11y.getHeadingStructure(page);

console.log('Levels:', structure.levels); // ['h1', 'h2', 'h2', 'h3']
console.log('Valid:', structure.valid);
```

### `checkFormLabels(page)`

Validate form label accessibility.

```typescript
const result = await a11y.checkFormLabels(page);

if (!result.passed) {
  console.log('Missing labels:', result.issues);
}
```

### `checkColorContrast(page, options?)`

Check color contrast ratios.

```typescript
const result = await a11y.checkColorContrast(page, {
  minRatio: 4.5, // WCAG AA
});

console.log('Issues:', result.issuesCount);
```

## Pre-defined Steps

When you call `registerAccessibilitySteps()`, the following natural language steps become available:

### WCAG Compliance

```gherkin
When I check WCAG compliance
When I check WCAG2AA compliance
When I verify WCAG2AAA compliance
```

### Assertions

```gherkin
Then there should be no accessibility violations
Then the accessibility score should be at least 90
Then there should be no critical violations
Then there should be no serious violations
```

### Keyboard Navigation

```gherkin
Then I can navigate the page with keyboard
Then the tab order should be correct
```

### Screen Reader

```gherkin
Then the page should be screen reader compatible
Then all images should have alt text
Then the page should have proper ARIA landmarks
```

### Content Structure

```gherkin
Then the heading structure should be valid
Then all form fields should have labels
Then the color contrast should meet WCAG AA standards
```

## HTML Reports

Accessibility results are automatically included in HTML test reports when `includeInReport: true` is set.

The report includes:

- 📊 Overall accessibility score (0-100)
- 📈 Violation breakdown by severity (critical, serious, moderate, minor)
- 📝 Detailed violation descriptions with:
  - WCAG guideline references
  - Affected HTML elements
  - How to fix instructions
  - Links to documentation

Example report structure:

```
♿ Accessibility Results                           Score: 92/100
├─ Passes: 48
├─ Critical: 0
├─ Serious: 2
├─ Moderate: 5
└─ Minor: 3

Violations:
┌─ SERIOUS: Images must have alternate text
│  Description: Ensures <img> elements have alternate text
│  WCAG 2.1 Level A (1.1.1)
│  Affected elements: 2
│  └─ <img src="logo.png">
└─ Learn more: https://dequeuniversity.com/rules/axe/4.4/image-alt
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:a11y
      - name: Check A11y Score
        run: |
          SCORE=$(node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync('copilot-test-results/report.json')); console.log(data.accessibilityScore || 100);")
          if [ "$SCORE" -lt 90 ]; then
            echo "Accessibility score $SCORE is below threshold 90"
            exit 1
          fi
```

### Fail on Violations

```typescript
configure({
  accessibility: {
    enabled: true,
    failOnViolations: true, // Fail tests on any violations
    standard: 'WCAG2AA',
  },
});
```

## Examples

See the `tests/` directory for complete examples:

- **tests/a11y.spec.ts** - Direct API usage examples
- **tests/a11y-steps-example.spec.ts** - Natural language step examples

Run examples:

```bash
# Direct API examples
COPILOT_A11Y_LIVE=1 npm run test:a11y

# Natural language steps
COPILOT_A11Y_STEPS_LIVE=1 tsx tests/a11y-steps-example.spec.ts
```

## Best Practices

1. **Run accessibility tests on every page/component**
   ```typescript
   feature("App Accessibility")
     .scenario("Homepage")
       .given("I am on the homepage")
       .when("I check WCAG compliance")
       .then("the accessibility score should be at least 90")
     .scenario("Login Page")
       .given("I am on the login page")
       .when("I check WCAG compliance")
       .then("the accessibility score should be at least 90");
   ```

2. **Test keyboard navigation for interactive elements**
   ```typescript
   .then(async ({ page }) => {
     const a11y = createAccessibilityTester({ ... });
     await a11y.testKeyboardNavigation(page, [
       'button', 'a[href]', 'input', 'select'
     ]);
   });
   ```

3. **Validate forms thoroughly**
   ```typescript
   .then(async ({ page }) => {
     const a11y = createAccessibilityTester({ ... });

     // Check labels
     await a11y.checkFormLabels(page);

     // Test error messages
     await page.fill('input[name="email"]', 'invalid');
     await page.click('button[type="submit"]');

     const errorMsg = page.locator('[role="alert"]');
     await expect(errorMsg).toBeVisible();
     await expect(errorMsg).toHaveAttribute('aria-live', 'polite');
   });
   ```

4. **Test dynamic content**
   ```typescript
   .when("I click the 'Load More' button")
   .then(async ({ page }) => {
     const a11y = createAccessibilityTester({ ... });

     // Re-scan after content loads
     const results = await a11y.scan(page);

     // Verify new content is accessible
     expect(results.violations.length).toBe(0);
   });
   ```

5. **Set appropriate thresholds**
   ```typescript
   const results = await a11y.scan(page);

   // Different thresholds for different severity levels
   const critical = results.violations.filter(v => v.impact === 'critical');
   const serious = results.violations.filter(v => v.impact === 'serious');

   expect(critical.length).toBe(0); // Zero tolerance for critical
   expect(serious.length).toBeLessThan(3); // Allow some serious issues
   ```

## WCAG Guidelines Reference

### WCAG 2.1 Levels

- **Level A**: Minimum accessibility requirements
- **Level AA**: Addresses major accessibility barriers (recommended)
- **Level AAA**: Highest level of accessibility

### Common Violations and Fixes

| Issue | Fix |
|-------|-----|
| Missing alt text | Add `alt` attribute to all images |
| Low color contrast | Use text/background colors with 4.5:1 ratio (AA) or 7:1 (AAA) |
| Missing form labels | Associate `<label>` with form inputs using `for` attribute |
| Invalid heading order | Use proper heading hierarchy (h1 → h2 → h3) |
| Missing ARIA landmarks | Add `<main>`, `<nav>`, `<header>`, `<footer>` elements |
| Non-keyboard accessible | Ensure all interactive elements are focusable with Tab key |

## Resources

- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project](https://www.a11yproject.com/)
- [Deque University](https://dequeuniversity.com/)

## License

This accessibility testing integration uses axe-core, which is licensed under MPL-2.0.
