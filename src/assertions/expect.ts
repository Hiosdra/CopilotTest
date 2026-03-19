/**
 * Main expect() function for creating assertions.
 */

import type { Matchers, AsyncMatchers, WebMatchers, PageMatchers, Locator, Page } from "./types.js";
import { createMatchers } from "./matchers.js";
import { createAsyncMatchers } from "./async-matchers.js";
import { createWebMatchers, createPageMatchers } from "./web-matchers.js";

/**
 * Creates assertions for synchronous values
 */
export function expect<T>(actual: T): Matchers<T>;

/**
 * Creates assertions for promises
 */
export function expect<T>(actual: Promise<T>): AsyncMatchers<T>;

/**
 * Creates assertions for Playwright locators
 */
export function expect(actual: Locator): WebMatchers;

/**
 * Creates assertions for Playwright pages
 */
export function expect(actual: Page): PageMatchers;

/**
 * Implementation
 */
export function expect(actual: any): any {
  // Check if it's a Playwright-compatible Page
  if (actual && typeof actual === "object" && typeof actual.url === "function" && typeof actual.title === "function") {
    return createPageMatchers(actual);
  }

  // Check if it's a Playwright-compatible Locator
  if (actual && typeof actual === "object" && typeof actual.textContent === "function" && typeof actual.isVisible === "function") {
    return createWebMatchers(actual);
  }

  // Check if it's a Promise
  if (actual && typeof actual === "object" && typeof actual.then === "function") {
    return createAsyncMatchers(actual);
  }

  // Default to synchronous matchers
  return createMatchers(actual);
}
