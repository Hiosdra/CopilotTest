/**
 * Accessibility Testing Example
 *
 * This test demonstrates the accessibility testing capabilities of CopilotTest.
 * Run with COPILOT_A11Y_LIVE=1 environment variable to execute against a real web page.
 *
 * Example:
 *   COPILOT_A11Y_LIVE=1 tsx tests/a11y.spec.ts
 */

import { feature, configure, run, webPlatform, createAccessibilityTester } from "../src/index.js";
import type { Page } from '@playwright/test';

// Only run if explicitly enabled
if (!process.env.COPILOT_A11Y_LIVE) {
  console.log("⏭️  Skipping accessibility tests. Set COPILOT_A11Y_LIVE=1 to run.");
  process.exit(0);
}

// Configure the test framework with accessibility enabled
configure({
  model: "gpt-4o",
  platforms: {
    web: webPlatform({
      browser: "chromium",
      headless: false,
      baseUrl: "https://example.com",
    }),
  },
  accessibility: {
    enabled: true,
    standard: 'WCAG2AA',
    rules: {
      'color-contrast': 'error',
      'image-alt': 'error',
      'label': 'warn',
    },
    failOnViolations: false,
    includeInReport: true,
    integrations: {
      axe: true,
      lighthouse: false,
    },
    modes: {
      automated: true,
      keyboard: true,
      screenReader: false,
    },
  },
  outputDir: "copilot-test-results",
});

// Example 1: Basic accessibility scan
feature("Accessibility - Basic WCAG Scan")
  .scenario("Check WCAG 2.1 AA compliance")
    .given("I am on the example.com homepage")
    .then(async ({ page }) => {
      // This step will be executed by AI using Playwright MCP
      // The AI will navigate to the homepage
    })
    .and("I should see the page content")
    .then(async ({ page }) => {
      // Run accessibility scan
      const a11y = createAccessibilityTester({
        enabled: true,
        standard: 'WCAG2AA',
        integrations: { axe: true },
      });

      const results = await a11y.scan(page as Page);

      console.log(`\n🔍 Accessibility Scan Results:`);
      console.log(`   URL: ${results.url}`);
      console.log(`   Score: ${results.score}/100`);
      console.log(`   Violations: ${results.violations.length}`);
      console.log(`   Passes: ${results.passes}`);

      // Group violations by impact
      const critical = results.violations.filter(v => v.impact === 'critical');
      const serious = results.violations.filter(v => v.impact === 'serious');
      const moderate = results.violations.filter(v => v.impact === 'moderate');
      const minor = results.violations.filter(v => v.impact === 'minor');

      console.log(`\n   Impact Summary:`);
      console.log(`   - Critical: ${critical.length}`);
      console.log(`   - Serious: ${serious.length}`);
      console.log(`   - Moderate: ${moderate.length}`);
      console.log(`   - Minor: ${minor.length}`);

      // Display violations
      if (results.violations.length > 0) {
        console.log(`\n   📋 Violations:`);
        results.violations.slice(0, 5).forEach((violation, idx) => {
          console.log(`\n   ${idx + 1}. ${violation.help}`);
          console.log(`      Impact: ${violation.impact}`);
          console.log(`      Description: ${violation.description}`);
          console.log(`      Affected elements: ${violation.nodes.length}`);
          if (violation.nodes.length > 0) {
            console.log(`      Example: ${violation.nodes[0].html.substring(0, 80)}...`);
          }
        });
      }

      // For demo purposes, we won't fail on violations
      // In production, you might want to:
      // if (critical.length > 0 || serious.length > 0) {
      //   throw new Error(`Found ${critical.length} critical and ${serious.length} serious accessibility violations`);
      // }
    });

// Example 2: Keyboard navigation testing
feature("Accessibility - Keyboard Navigation")
  .scenario("Tab through interactive elements")
    .given("I am on the example.com homepage")
    .when("I test keyboard navigation")
    .then(async ({ page }) => {
      const a11y = createAccessibilityTester({
        enabled: true,
        standard: 'WCAG2AA',
        integrations: { axe: true },
      });

      // Test keyboard navigation
      const navResult = await a11y.testKeyboardNavigation(page as Page, [
        'h1',
        'a',
      ]);

      console.log(`\n⌨️  Keyboard Navigation Test:`);
      console.log(`   Passed: ${navResult.passed ? '✓' : '✗'}`);
      console.log(`   Navigated: ${navResult.navigated.length} elements`);
      console.log(`   Unreachable: ${navResult.unreachable.length} elements`);

      if (navResult.unreachable.length > 0) {
        console.log(`   ⚠️  Unreachable elements:`);
        navResult.unreachable.forEach(selector => {
          console.log(`      - ${selector}`);
        });
      }
    });

// Example 3: Screen reader compatibility
feature("Accessibility - Screen Reader")
  .scenario("Check ARIA landmarks and labels")
    .given("I am on the example.com homepage")
    .when("I check screen reader compatibility")
    .then(async ({ page }) => {
      const a11y = createAccessibilityTester({
        enabled: true,
        standard: 'WCAG2AA',
        integrations: { axe: true },
      });

      const screenReaderResult = await a11y.testScreenReader(page as Page);

      console.log(`\n🔊 Screen Reader Compatibility:`);
      console.log(`   Passed: ${screenReaderResult.passed ? '✓' : '✗'}`);

      if (screenReaderResult.issues.length > 0) {
        console.log(`   Issues:`);
        screenReaderResult.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
    });

// Example 4: Heading structure
feature("Accessibility - Heading Structure")
  .scenario("Verify proper heading hierarchy")
    .given("I am on the example.com homepage")
    .when("I check the heading structure")
    .then(async ({ page }) => {
      const a11y = createAccessibilityTester({
        enabled: true,
        standard: 'WCAG2AA',
        integrations: { axe: true },
      });

      const headingStructure = await a11y.getHeadingStructure(page as Page);

      console.log(`\n📑 Heading Structure:`);
      console.log(`   Valid: ${headingStructure.valid ? '✓' : '✗'}`);
      console.log(`   Levels: ${headingStructure.levels.join(' → ')}`);

      if (headingStructure.issues.length > 0) {
        console.log(`   Issues:`);
        headingStructure.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
    });

// Example 5: Form accessibility
feature("Accessibility - Form Labels")
  .scenario("Check form labels and ARIA attributes")
    .given("I navigate to a page with forms")
    .when("I check form accessibility")
    .then(async ({ page }) => {
      const a11y = createAccessibilityTester({
        enabled: true,
        standard: 'WCAG2AA',
        integrations: { axe: true },
      });

      const formResult = await a11y.checkFormLabels(page as Page);

      console.log(`\n📝 Form Accessibility:`);
      console.log(`   Passed: ${formResult.passed ? '✓' : '✗'}`);

      if (formResult.issues.length > 0) {
        console.log(`   Issues:`);
        formResult.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
    });

// Example 6: Comprehensive accessibility test with multiple checks
feature("Accessibility - Comprehensive Test")
  .scenario("Run all accessibility checks")
    .given("I am on the example.com homepage")
    .when("I run a comprehensive accessibility audit")
    .then(async ({ page }) => {
      const a11y = createAccessibilityTester({
        enabled: true,
        standard: 'WCAG2AA',
        integrations: { axe: true },
      });

      console.log(`\n🔬 Running Comprehensive Accessibility Audit...`);

      // 1. WCAG Scan
      const scanResults = await a11y.scan(page as Page);
      console.log(`\n1. WCAG Scan: ${scanResults.score}/100`);

      // 2. Keyboard Navigation
      const keyboardResult = await a11y.testKeyboardNavigation(page as Page, ['h1', 'a']);
      console.log(`2. Keyboard Navigation: ${keyboardResult.passed ? 'PASS' : 'FAIL'}`);

      // 3. Screen Reader
      const screenReaderResult = await a11y.testScreenReader(page as Page);
      console.log(`3. Screen Reader: ${screenReaderResult.passed ? 'PASS' : 'FAIL'}`);

      // 4. Heading Structure
      const headingStructure = await a11y.getHeadingStructure(page as Page);
      console.log(`4. Heading Structure: ${headingStructure.valid ? 'PASS' : 'FAIL'}`);

      // 5. Form Labels
      const formResult = await a11y.checkFormLabels(page as Page);
      console.log(`5. Form Labels: ${formResult.passed ? 'PASS' : 'FAIL'}`);

      // Calculate overall status
      const allPassed =
        scanResults.score >= 90 &&
        keyboardResult.passed &&
        screenReaderResult.passed &&
        headingStructure.valid &&
        formResult.passed;

      console.log(`\n✨ Overall Result: ${allPassed ? '✓ PASS' : '✗ FAIL'}`);
    });

// Run all tests
await run();
