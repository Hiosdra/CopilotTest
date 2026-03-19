/**
 * Main entry point for the assertions library.
 *
 * @example
 * import { expect } from '@copilot-test/assertions';
 *
 * // Synchronous assertions
 * expect(value).toBe(42);
 * expect(obj).toHaveProperty('name', 'John');
 *
 * // Async assertions
 * await expect(promise).resolves.toBe(value);
 * await expect(promise).rejects.toThrow();
 *
 * // Web assertions (Playwright)
 * await expect(page.locator('h1')).toHaveText('Welcome');
 * await expect(page).toHaveURL(/dashboard/);
 */

export { expect } from "./expect.js";
export { AssertionError } from "./types.js";
export type {
  Matchers,
  AsyncMatchers,
  WebMatchers,
  PageMatchers,
  Locator,
  Page,
} from "./types.js";
