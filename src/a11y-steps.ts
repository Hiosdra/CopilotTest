/**
 * Pre-defined accessibility step definitions for common testing scenarios.
 * These can be registered to enable natural language accessibility testing.
 */

import { defineStep } from "./step-registry.js";
import { createAccessibilityTester } from "./a11y.js";
import type { Page } from '@playwright/test';

/**
 * Register all built-in accessibility step definitions.
 * Call this function to enable accessibility testing via natural language steps.
 */
export function registerAccessibilitySteps(): void {
  // WCAG compliance scanning
  defineStep(
    /^(?:I |the page should )?(?:check|verify|scan|test) (?:WCAG|accessibility|a11y)(?: compliance)?$/i,
    async ({ session, scenarioContext }) => {
      const page = (session as any)?.page as Page;
      if (!page) {
        throw new Error('No page available. This step requires a web platform.');
      }

      const a11y = createAccessibilityTester({
        enabled: true,
        standard: 'WCAG2AA',
        integrations: { axe: true },
      });

      const results = await a11y.scan(page);

      // Store results in scenario context
      scenarioContext?.set('a11yResults', results);
      scenarioContext?.set('a11yScore', results.score);
      scenarioContext?.set('a11yViolations', results.violations);

      console.log(`Accessibility scan complete: ${results.score}/100, ${results.violations.length} violations`);

      // Only fail on critical violations by default
      const criticalViolations = results.violations.filter(v => v.impact === 'critical');
      if (criticalViolations.length > 0) {
        throw new Error(`Found ${criticalViolations.length} critical accessibility violations`);
      }
    }
  );

  // WCAG compliance with specific standard
  defineStep(
    /^(?:I |the page should )?(?:check|verify|scan|test) (WCAG2A|WCAG2AA|WCAG2AAA) compliance$/i,
    async ({ session, scenarioContext }, standard) => {
      const page = (session as any)?.page as Page;
      if (!page) {
        throw new Error('No page available. This step requires a web platform.');
      }

      const a11y = createAccessibilityTester({
        enabled: true,
        standard: standard as 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA',
        integrations: { axe: true },
      });

      const results = await a11y.scan(page);

      scenarioContext?.set('a11yResults', results);
      scenarioContext?.set('a11yScore', results.score);

      console.log(`${standard} compliance: ${results.score}/100`);
    }
  );

  // Check for no violations
  defineStep(
    /^(?:there should be|I should see) no accessibility violations$/i,
    async ({ scenarioContext }) => {
      const violations = scenarioContext?.get<any[]>('a11yViolations') || [];

      if (violations.length > 0) {
        const summary = violations.map(v => `${v.impact}: ${v.help}`).join('\n');
        throw new Error(`Found ${violations.length} accessibility violations:\n${summary}`);
      }

      console.log('✓ No accessibility violations found');
    }
  );

  // Check minimum accessibility score
  defineStep(
    /^(?:the )?accessibility score should be (?:at least |above |greater than )?(\d+)$/i,
    async ({ scenarioContext }, minScore) => {
      const score = scenarioContext?.get<number>('a11yScore');
      const threshold = parseInt(minScore || '90', 10);

      if (score === undefined) {
        throw new Error('No accessibility scan has been performed yet');
      }

      if (score < threshold) {
        throw new Error(`Accessibility score ${score} is below threshold ${threshold}`);
      }

      console.log(`✓ Accessibility score ${score} meets threshold ${threshold}`);
    }
  );

  // Keyboard navigation testing
  defineStep(
    /^I (?:should be able to|can) navigate (?:the page )?(?:with|using) (?:the )?keyboard$/i,
    async ({ session }) => {
      const page = (session as any)?.page as Page;
      if (!page) {
        throw new Error('No page available. This step requires a web platform.');
      }

      const a11y = createAccessibilityTester({
        enabled: true,
        standard: 'WCAG2AA',
        integrations: { axe: true },
      });

      // Test common interactive elements
      const result = await a11y.testKeyboardNavigation(page, [
        'a', 'button', 'input', 'select', 'textarea'
      ]);

      if (!result.passed) {
        throw new Error(`Keyboard navigation failed. Unreachable: ${result.unreachable.join(', ')}`);
      }

      console.log('✓ Keyboard navigation successful');
    }
  );

  // Tab order testing
  defineStep(
    /^(?:the )?tab order should be (?:correct|logical)$/i,
    async ({ session }) => {
      const page = (session as any)?.page as Page;
      if (!page) {
        throw new Error('No page available. This step requires a web platform.');
      }

      const a11y = createAccessibilityTester({
        enabled: true,
        standard: 'WCAG2AA',
        integrations: { axe: true },
      });

      const result = await a11y.testTabOrder(page, ['header nav', 'main', 'footer']);

      if (!result) {
        throw new Error('Tab order validation failed');
      }

      console.log('✓ Tab order is correct');
    }
  );

  // Screen reader compatibility
  defineStep(
    /^(?:the page should be|I should verify) screen reader (?:compatible|accessible)$/i,
    async ({ session }) => {
      const page = (session as any)?.page as Page;
      if (!page) {
        throw new Error('No page available. This step requires a web platform.');
      }

      const a11y = createAccessibilityTester({
        enabled: true,
        standard: 'WCAG2AA',
        integrations: { axe: true },
      });

      const result = await a11y.testScreenReader(page);

      if (!result.passed) {
        throw new Error(`Screen reader compatibility issues: ${result.issues.join(', ')}`);
      }

      console.log('✓ Page is screen reader compatible');
    }
  );

  // Heading structure validation
  defineStep(
    /^(?:the )?heading (?:structure|hierarchy) should be (?:valid|correct|proper)$/i,
    async ({ session }) => {
      const page = (session as any)?.page as Page;
      if (!page) {
        throw new Error('No page available. This step requires a web platform.');
      }

      const a11y = createAccessibilityTester({
        enabled: true,
        standard: 'WCAG2AA',
        integrations: { axe: true },
      });

      const result = await a11y.getHeadingStructure(page);

      if (!result.valid) {
        throw new Error(`Heading structure issues: ${result.issues.join(', ')}`);
      }

      console.log(`✓ Heading structure is valid: ${result.levels.join(' → ')}`);
    }
  );

  // Form labels validation
  defineStep(
    /^(?:all )?form (?:elements|fields|inputs) should have (?:proper |valid )?labels$/i,
    async ({ session }) => {
      const page = (session as any)?.page as Page;
      if (!page) {
        throw new Error('No page available. This step requires a web platform.');
      }

      const a11y = createAccessibilityTester({
        enabled: true,
        standard: 'WCAG2AA',
        integrations: { axe: true },
      });

      const result = await a11y.checkFormLabels(page);

      if (!result.passed) {
        throw new Error(`Form label issues: ${result.issues.join(', ')}`);
      }

      console.log('✓ All form elements have proper labels');
    }
  );

  // Color contrast validation
  defineStep(
    /^(?:the )?color contrast should (?:meet|pass) (?:WCAG )?(?:AA|AAA)? (?:standards|requirements)?$/i,
    async ({ session }) => {
      const page = (session as any)?.page as Page;
      if (!page) {
        throw new Error('No page available. This step requires a web platform.');
      }

      const a11y = createAccessibilityTester({
        enabled: true,
        standard: 'WCAG2AA',
        integrations: { axe: true },
      });

      const result = await a11y.checkColorContrast(page, { minRatio: 4.5 });

      if (result.issuesCount > 0) {
        throw new Error(`Found ${result.issuesCount} color contrast issues`);
      }

      console.log('✓ Color contrast meets WCAG standards');
    }
  );

  // Check for specific violation types
  defineStep(
    /^(?:there should be|I should see) no (critical|serious|moderate|minor) (?:accessibility )?violations$/i,
    async ({ scenarioContext }, impactLevel) => {
      const violations = scenarioContext?.get<any[]>('a11yViolations') || [];
      const level = (impactLevel || 'critical').toLowerCase();
      const filtered = violations.filter(v => v.impact === level);

      if (filtered.length > 0) {
        const summary = filtered.map(v => v.help).join('\n');
        throw new Error(`Found ${filtered.length} ${level} violations:\n${summary}`);
      }

      console.log(`✓ No ${level} violations found`);
    }
  );

  // Check images have alt text
  defineStep(
    /^(?:all )?images should have (?:alt text|alternative text|alt attributes)$/i,
    async ({ session }) => {
      const page = (session as any)?.page as Page;
      if (!page) {
        throw new Error('No page available. This step requires a web platform.');
      }

      const imagesWithoutAlt = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        const missing: string[] = [];

        images.forEach((img) => {
          if (!img.hasAttribute('alt') && !img.hasAttribute('aria-label')) {
            missing.push(img.src || img.outerHTML.substring(0, 50));
          }
        });

        return missing;
      });

      if (imagesWithoutAlt.length > 0) {
        throw new Error(`Found ${imagesWithoutAlt.length} images without alt text`);
      }

      console.log('✓ All images have alt text');
    }
  );

  // Check ARIA landmarks exist
  defineStep(
    /^(?:the page should have|I should see) (?:proper |required )?ARIA landmarks$/i,
    async ({ session }) => {
      const page = (session as any)?.page as Page;
      if (!page) {
        throw new Error('No page available. This step requires a web platform.');
      }

      const landmarks = await page.evaluate(() => {
        const required = ['main', 'navigation'];
        const missing: string[] = [];

        required.forEach((landmark) => {
          const element = document.querySelector(`[role="${landmark}"], ${landmark}`);
          if (!element) {
            missing.push(landmark);
          }
        });

        return missing;
      });

      if (landmarks.length > 0) {
        throw new Error(`Missing ARIA landmarks: ${landmarks.join(', ')}`);
      }

      console.log('✓ All required ARIA landmarks are present');
    }
  );
}

/**
 * Clear all registered accessibility step definitions.
 */
export function clearAccessibilitySteps(): void {
  // This would need to be implemented in step-registry.ts to clear specific patterns
  // For now, users can use clearStepDefinitions() to clear all steps
}
