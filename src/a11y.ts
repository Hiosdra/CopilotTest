import type { Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import type { AxeResults, Result as AxeViolation } from 'axe-core';

/**
 * WCAG compliance standards supported by the accessibility engine.
 */
export type WCAGStandard = 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA';

/**
 * Severity levels for accessibility violations.
 */
export type ViolationLevel = 'error' | 'warn' | 'info';

/**
 * Configuration for accessibility testing.
 */
export interface AccessibilityConfig {
  /** Enable accessibility testing */
  enabled: boolean;
  /** WCAG compliance standard to test against */
  standard: WCAGStandard;
  /** Rule-specific configurations */
  rules?: Record<string, ViolationLevel | AccessibilityRuleConfig>;
  /** Fail build on violations */
  failOnViolations?: boolean;
  /** Include accessibility results in report */
  includeInReport?: boolean;
  /** Integration configurations */
  integrations?: {
    /** Use axe-core engine */
    axe?: boolean;
    /** Use Lighthouse audits */
    lighthouse?: boolean;
  };
  /** Testing mode configurations */
  modes?: {
    /** Run automated scans */
    automated?: boolean;
    /** Test keyboard navigation */
    keyboard?: boolean;
    /** Simulate screen reader (experimental) */
    screenReader?: boolean;
  };
}

/**
 * Detailed rule configuration with additional options.
 */
export interface AccessibilityRuleConfig {
  /** Severity level for this rule */
  level: ViolationLevel;
  /** Minimum contrast ratio (for color-contrast rule) */
  minRatio?: number;
}

/**
 * Options for running an accessibility scan.
 */
export interface ScanOptions {
  /** Specific WCAG rules to test */
  rules?: string[];
  /** CSS selectors to exclude from scan */
  exclude?: string[];
  /** Run only specific rules instead of all */
  runOnly?: string[];
  /** Additional axe-core configuration */
  axeOptions?: Record<string, unknown>;
}

/**
 * Result of an accessibility scan.
 */
export interface AccessibilityScanResult {
  /** URL that was scanned */
  url: string;
  /** Timestamp of the scan */
  timestamp: string;
  /** Violations found during scan */
  violations: AccessibilityViolation[];
  /** Number of passes */
  passes: number;
  /** Accessibility score (0-100) */
  score: number;
  /** WCAG standard used */
  standard: WCAGStandard;
}

/**
 * Individual accessibility violation.
 */
export interface AccessibilityViolation {
  /** Unique identifier for the rule */
  id: string;
  /** Impact level: critical, serious, moderate, minor */
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  /** Human-readable description */
  description: string;
  /** Help text explaining how to fix */
  help: string;
  /** URL to detailed documentation */
  helpUrl: string;
  /** WCAG tags this violation relates to */
  tags: string[];
  /** HTML elements that have this violation */
  nodes: AccessibilityNode[];
}

/**
 * Node (element) with an accessibility violation.
 */
export interface AccessibilityNode {
  /** HTML snippet of the element */
  html: string;
  /** CSS selector to find the element */
  target: string[];
  /** Failure summary */
  failureSummary: string;
}

/**
 * Result of keyboard navigation testing.
 */
export interface KeyboardNavigationResult {
  /** Whether keyboard navigation passed */
  passed: boolean;
  /** Elements that were successfully navigated */
  navigated: string[];
  /** Elements that couldn't be reached */
  unreachable: string[];
  /** Focus order validation results */
  focusOrder: {
    expected: string[];
    actual: string[];
    correct: boolean;
  };
}

/**
 * Color contrast check result.
 */
export interface ColorContrastResult {
  /** Number of contrast issues found */
  issuesCount: number;
  /** Details of each contrast issue */
  issues: Array<{
    selector: string;
    foreground: string;
    background: string;
    ratio: number;
    minRatio: number;
  }>;
}

/**
 * Heading structure analysis result.
 */
export interface HeadingStructure {
  /** Ordered list of heading levels */
  levels: string[];
  /** Whether heading order is correct */
  valid: boolean;
  /** Issues with heading structure */
  issues: string[];
}

/**
 * Main accessibility testing class.
 */
export class AccessibilityTester {
  private config: AccessibilityConfig;

  constructor(config: AccessibilityConfig) {
    this.config = config;
  }

  /**
   * Run an accessibility scan on a page using axe-core.
   * @param page - Playwright page instance
   * @param options - Scan options
   * @returns Scan results with violations
   */
  async scan(page: Page, options: ScanOptions = {}): Promise<AccessibilityScanResult> {
    if (!this.config.integrations?.axe) {
      throw new Error('Axe integration is not enabled');
    }

    // Create AxeBuilder
    const builder = new AxeBuilder({ page });

    // Configure based on WCAG standard
    const tags = this.getTagsForStandard(this.config.standard);

    if (options.runOnly) {
      builder.withRules(options.runOnly);
    } else if (options.rules) {
      builder.withRules(options.rules);
    } else {
      builder.withTags(tags);
    }

    // Add exclude selectors
    if (options.exclude && options.exclude.length > 0) {
      options.exclude.forEach((selector) => builder.exclude(selector));
    }

    // Run axe scan
    const results: AxeResults = await builder.analyze();

    // Transform results
    const violations = this.transformViolations(results.violations || []);
    const score = this.calculateAccessibilityScore(violations, results.passes?.length || 0);

    return {
      url: page.url(),
      timestamp: new Date().toISOString(),
      violations,
      passes: results.passes?.length || 0,
      score,
      standard: this.config.standard,
    };
  }

  /**
   * Test keyboard navigation on a page.
   * @param page - Playwright page instance
   * @param expectedOrder - Expected tab order of selectors
   * @returns Keyboard navigation test results
   */
  async testKeyboardNavigation(
    page: Page,
    expectedOrder: string[]
  ): Promise<KeyboardNavigationResult> {
    const navigated: string[] = [];
    const unreachable: string[] = [];
    const actualOrder: string[] = [];

    for (const selector of expectedOrder) {
      try {
        // Try to focus the element
        await page.keyboard.press('Tab');

        // Get currently focused element
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return null;

          // Try to generate a selector
          if (el.id) return `#${el.id}`;
          if (el.className) return `.${el.className.split(' ')[0]}`;
          return el.tagName.toLowerCase();
        });

        if (focusedElement) {
          actualOrder.push(focusedElement);

          // Check if this matches expected selector
          const element = await page.locator(selector).first();
          const isFocused = await element.evaluate((el: Element) => el === document.activeElement);

          if (isFocused) {
            navigated.push(selector);
          } else {
            unreachable.push(selector);
          }
        }
      } catch (error) {
        unreachable.push(selector);
      }
    }

    return {
      passed: unreachable.length === 0,
      navigated,
      unreachable,
      focusOrder: {
        expected: expectedOrder,
        actual: actualOrder,
        correct: JSON.stringify(expectedOrder) === JSON.stringify(actualOrder),
      },
    };
  }

  /**
   * Test tab order on a page.
   * @param page - Playwright page instance
   * @param expectedRegions - Expected regions in tab order
   * @returns Whether tab order is correct
   */
  async testTabOrder(page: Page, expectedRegions: string[]): Promise<boolean> {
    const actualRegions: string[] = [];

    for (const region of expectedRegions) {
      const element = page.locator(region).first();
      const isVisible = await element.isVisible().catch(() => false);

      if (isVisible) {
        // Check if region contains focusable elements
        const hasFocusable = await element.evaluate((el: Element) => {
          const focusable = el.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          return focusable.length > 0;
        });

        if (hasFocusable) {
          actualRegions.push(region);
        }
      }
    }

    return JSON.stringify(expectedRegions) === JSON.stringify(actualRegions);
  }

  /**
   * Check color contrast on a page.
   * @param page - Playwright page instance
   * @param options - Contrast check options
   * @returns Color contrast issues
   */
  async checkColorContrast(
    page: Page,
    options: { minRatio?: number } = {}
  ): Promise<ColorContrastResult> {
    const minRatio = options.minRatio || 4.5;

    const issues = await page.evaluate((min: number) => {
      const results: Array<{
        selector: string;
        foreground: string;
        background: string;
        ratio: number;
        minRatio: number;
      }> = [];

      // Helper to get contrast ratio
      function getContrastRatio(fg: string, bg: string): number {
        // Simplified contrast calculation
        // In production, use proper color parsing and luminance calculation
        return 4.5; // Placeholder
      }

      // Check all text elements
      const textElements = document.querySelectorAll('*');
      textElements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const fg = computed.color;
        const bg = computed.backgroundColor;

        if (fg && bg && bg !== 'rgba(0, 0, 0, 0)') {
          const ratio = getContrastRatio(fg, bg);

          if (ratio < min) {
            results.push({
              selector: el.tagName.toLowerCase(),
              foreground: fg,
              background: bg,
              ratio,
              minRatio: min,
            });
          }
        }
      });

      return results;
    }, minRatio);

    return {
      issuesCount: issues.length,
      issues,
    };
  }

  /**
   * Get the heading structure of a page.
   * @param page - Playwright page instance
   * @returns Heading structure analysis
   */
  async getHeadingStructure(page: Page): Promise<HeadingStructure> {
    const headings = await page.evaluate(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headingElements).map((el) => el.tagName.toLowerCase());
    });

    const issues: string[] = [];

    // Check for h1
    if (!headings.includes('h1')) {
      issues.push('Missing h1 heading');
    }

    // Check for multiple h1s
    const h1Count = headings.filter((h: string) => h === 'h1').length;
    if (h1Count > 1) {
      issues.push(`Multiple h1 headings found (${h1Count})`);
    }

    // Check for proper nesting
    let currentLevel = 0;
    for (const heading of headings) {
      const level = parseInt(heading.charAt(1));
      if (currentLevel > 0 && level > currentLevel + 1) {
        issues.push(`Heading level skipped: ${heading} after h${currentLevel}`);
      }
      currentLevel = level;
    }

    return {
      levels: headings,
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Check form labels and accessibility.
   * @param page - Playwright page instance
   * @returns Whether all form elements have proper labels
   */
  async checkFormLabels(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues = await page.evaluate(() => {
      const problems: string[] = [];

      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach((input) => {
        const element = input as HTMLInputElement;

        // Skip hidden inputs
        if (element.type === 'hidden') return;

        // Check for label
        const id = element.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = element.hasAttribute('aria-label');
        const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');

        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
          problems.push(`Form element without label: ${element.tagName.toLowerCase()}[name="${element.name || 'unknown'}"]`);
        }
      });

      return problems;
    });

    return {
      passed: issues.length === 0,
      issues,
    };
  }

  /**
   * Test screen reader compatibility.
   * @param page - Playwright page instance
   * @returns Screen reader test results
   */
  async testScreenReader(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check for ARIA landmarks
    const landmarks = await page.evaluate(() => {
      const requiredLandmarks = ['main', 'navigation', 'banner'];
      const found: string[] = [];

      requiredLandmarks.forEach((landmark) => {
        const element = document.querySelector(`[role="${landmark}"], ${landmark}`);
        if (element) found.push(landmark);
      });

      return { required: requiredLandmarks, found };
    });

    const missingLandmarks = landmarks.required.filter((l: string) => !landmarks.found.includes(l));
    if (missingLandmarks.length > 0) {
      issues.push(`Missing ARIA landmarks: ${missingLandmarks.join(', ')}`);
    }

    // Check for alt text on images
    const imagesWithoutAlt = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let count = 0;
      images.forEach((img) => {
        if (!img.hasAttribute('alt') && !img.hasAttribute('aria-label')) {
          count++;
        }
      });
      return count;
    });

    if (imagesWithoutAlt > 0) {
      issues.push(`${imagesWithoutAlt} images without alt text`);
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  }

  /**
   * Get WCAG tags for a given standard.
   */
  private getTagsForStandard(standard: WCAGStandard): string[] {
    switch (standard) {
      case 'WCAG2A':
        return ['wcag2a'];
      case 'WCAG2AA':
        return ['wcag2a', 'wcag2aa'];
      case 'WCAG2AAA':
        return ['wcag2a', 'wcag2aa', 'wcag2aaa'];
      default:
        return ['wcag2aa'];
    }
  }

  /**
   * Transform axe violations to our format.
   */
  private transformViolations(axeViolations: AxeViolation[]): AccessibilityViolation[] {
    return axeViolations.map((violation) => ({
      id: violation.id,
      impact: violation.impact as 'critical' | 'serious' | 'moderate' | 'minor',
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      tags: violation.tags,
      nodes: violation.nodes.map((node: any) => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary || '',
      })),
    }));
  }

  /**
   * Calculate accessibility score based on violations.
   */
  private calculateAccessibilityScore(violations: AccessibilityViolation[], passes: number): number {
    if (violations.length === 0 && passes === 0) return 100;

    const weights = {
      critical: 10,
      serious: 5,
      moderate: 2,
      minor: 1,
    };

    const totalPenalty = violations.reduce((sum, v) => {
      return sum + (weights[v.impact] || 1) * v.nodes.length;
    }, 0);

    const total = passes + totalPenalty;
    const score = Math.round((passes / total) * 100);

    return Math.max(0, Math.min(100, score));
  }
}

/**
 * Factory function to create an accessibility tester instance.
 * @param config - Accessibility configuration
 * @returns AccessibilityTester instance
 */
export function createAccessibilityTester(config: AccessibilityConfig): AccessibilityTester {
  return new AccessibilityTester(config);
}

/**
 * Default accessibility configuration.
 */
export const defaultAccessibilityConfig: AccessibilityConfig = {
  enabled: false,
  standard: 'WCAG2AA',
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
};
