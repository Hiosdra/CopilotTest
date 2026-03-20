/**
 * Visual regression testing support for CopilotTest.
 * Provides screenshot comparison capabilities for detecting visual changes.
 */

import { mkdir, access } from "fs/promises";
import { join } from "path";

/**
 * Configuration options for visual regression testing.
 */
export interface VisualRegressionConfig {
  /** Enable visual regression testing */
  enabled: boolean;
  /** Difference tolerance as a percentage (0-100) */
  threshold: number;
  /** Directory for storing baseline images */
  baselineDir: string;
  /** Directory for storing diff images */
  diffDir: string;
  /** Comparison algorithm to use */
  algorithm?: "pixel" | "perceptual" | "ssim";
}

/**
 * Options for comparing screenshots.
 */
export interface CompareScreenshotOptions {
  /** Take screenshot of full page */
  fullPage?: boolean;
  /** Difference tolerance for this comparison (overrides config) */
  threshold?: number;
  /** Elements to hide before taking screenshot */
  hideElements?: string[];
  /** Regions to ignore during comparison */
  ignoreRegions?: Array<{ x: number; y: number; width: number; height: number }>;
  /** Wait for animations to complete */
  waitForAnimations?: boolean;
  /** Wait for web fonts to load */
  waitForFonts?: boolean;
  /** Wait for page stability timeout in ms */
  stabilityTimeout?: number;
}

/**
 * Result of a visual comparison.
 */
export interface VisualComparisonResult {
  /** Whether the comparison passed */
  passed: boolean;
  /** Percentage difference between images */
  difference: number;
  /** Number of pixels that differ */
  diffPixels: number;
  /** Path to the baseline image */
  baselinePath: string;
  /** Path to the current image */
  currentPath: string;
  /** Path to the diff image (if created) */
  diffPath?: string;
  /** Error message if comparison failed */
  error?: string;
}

/**
 * Viewport size for responsive testing.
 */
export interface ViewportSize {
  width: number;
  height: number;
  name: string;
}

/**
 * Visual regression testing utility class.
 */
export class VisualRegression {
  private config: VisualRegressionConfig;
  private updateBaselines: boolean = false;

  constructor(config: VisualRegressionConfig) {
    this.config = config;
  }

  /**
   * Enable baseline update mode.
   * When enabled, current screenshots become the new baselines.
   */
  enableBaselineUpdate(): void {
    this.updateBaselines = true;
  }

  /**
   * Disable baseline update mode.
   */
  disableBaselineUpdate(): void {
    this.updateBaselines = false;
  }

  /**
   * Check if baseline update mode is enabled.
   */
  isBaselineUpdateEnabled(): boolean {
    return this.updateBaselines;
  }

  /**
   * Compare a screenshot with its baseline.
   * Uses Playwright MCP tools for screenshot capture and comparison.
   *
   * @param page - Playwright page object (from MCP context)
   * @param name - Name identifier for the screenshot
   * @param options - Comparison options
   * @returns Comparison result
   */
  async compareScreenshot(
    page: unknown,
    name: string,
    options: CompareScreenshotOptions = {}
  ): Promise<VisualComparisonResult> {
    if (!this.config.enabled) {
      throw new Error("Visual regression testing is not enabled in config");
    }

    // At this time, compareScreenshot is not wired up to any actual
    // screenshot capture implementation. Invoking it without such an
    // implementation would give a false sense of visual test coverage,
    // because no screenshots would be written to baselinePath/currentPath.
    //
    // To avoid this, we fail fast and surface a clear error instead of
    // silently pretending that a comparison has occurred.
    throw new Error(
      "compareScreenshot is not implemented: no screenshot capture is configured. " +
        "Wire this method to a real screenshot capture mechanism before using it."
    );
  }

  /**
   * Compare a specific element instead of the full page.
   *
   * @param element - Playwright locator for the element
   * @param name - Name identifier for the screenshot
   * @param options - Comparison options
   * @returns Comparison result
   */
  async compareElement(
    element: unknown,
    name: string,
    options: CompareScreenshotOptions = {}
  ): Promise<VisualComparisonResult> {
    // Element-only capture requires different handling than page screenshots.
    // This will need explicit element screenshot support once implemented.
    throw new Error(
      "compareElement is not implemented: element screenshot capture is not configured. " +
        "This requires different handling than page screenshots."
    );
  }

  /**
   * Compare screenshots across multiple viewports.
   *
   * @param page - Playwright page object
   * @param name - Base name for screenshots
   * @param options - Comparison options
   * @returns Array of comparison results for each viewport
   */
  async compareResponsive(
    page: unknown,
    name: string,
    options: CompareScreenshotOptions & { breakpoints?: string[] } = {}
  ): Promise<VisualComparisonResult[]> {
    // Responsive comparison requires viewport manipulation (setViewportSize)
    // which is not currently implemented. This method would take screenshots
    // at different names but not actually change viewport sizes.
    throw new Error(
      "compareResponsive is not implemented: viewport manipulation is not configured. " +
        "This requires setting viewport sizes before taking screenshots."
    );
  }

  /**
   * Ensure required directories exist.
   */
  private async ensureDirectories(): Promise<void> {
    await mkdir(this.config.baselineDir, { recursive: true });
    await mkdir(this.config.diffDir, { recursive: true });
  }

  /**
   * Check if a file exists.
   */
  private async fileExists(path: string): Promise<boolean> {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the visual regression configuration.
   */
  getConfig(): VisualRegressionConfig {
    return { ...this.config };
  }

  /**
   * Update the visual regression configuration.
   */
  updateConfig(updates: Partial<VisualRegressionConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

/**
 * Create a visual regression testing instance.
 *
 * @param config - Visual regression configuration
 * @returns VisualRegression instance
 */
export function createVisualRegression(
  config: VisualRegressionConfig
): VisualRegression {
  return new VisualRegression(config);
}

/**
 * Default visual regression configuration.
 */
export const defaultVisualConfig: VisualRegressionConfig = {
  enabled: false,
  threshold: 0.1, // 0.1% difference tolerance
  baselineDir: "tests/visual-baselines",
  diffDir: "copilot-test-results/visual-diffs",
  algorithm: "pixel",
};
