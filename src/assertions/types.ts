/**
 * Type definitions for the assertion library.
 */

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}

/**
 * Matchers for synchronous value assertions
 */
export interface Matchers<T> {
  toBe(expected: T): void;
  toEqual(expected: T): void;
  toBeGreaterThan(expected: number): void;
  toBeLessThan(expected: number): void;
  toBeGreaterThanOrEqual(expected: number): void;
  toBeLessThanOrEqual(expected: number): void;
  toContain(item: any): void;
  toHaveProperty(key: string, value?: any): void;
  toHaveLength(length: number): void;
  toMatchObject(partial: Record<string, any>): void;
  toMatch(pattern: RegExp | string): void;
  toStartWith(prefix: string): void;
  toEndWith(suffix: string): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeDefined(): void;
  toBeNaN(): void;
  toBeInstanceOf(constructor: any): void;
}

/**
 * Matchers for asynchronous assertions (promises)
 */
export interface AsyncMatchers<T> {
  resolves: Matchers<T>;
  rejects: {
    toThrow(error?: string | RegExp | Error): Promise<void>;
    toBe(expected: any): Promise<void>;
  };
}

/**
 * Matchers for web-specific assertions (Playwright)
 */
export interface WebMatchers {
  toHaveText(text: string | RegExp): Promise<void>;
  toContainText(text: string | RegExp): Promise<void>;
  toHaveValue(value: string | RegExp): Promise<void>;
  toBeVisible(): Promise<void>;
  toBeHidden(): Promise<void>;
  toBeEnabled(): Promise<void>;
  toBeDisabled(): Promise<void>;
  toBeChecked(): Promise<void>;
  toHaveAttribute(name: string, value?: string | RegExp): Promise<void>;
  toHaveClass(className: string | RegExp): Promise<void>;
  toHaveCount(count: number): Promise<void>;
}

/**
 * Page-specific matchers
 */
export interface PageMatchers {
  toHaveURL(url: string | RegExp): Promise<void>;
  toHaveTitle(title: string | RegExp): Promise<void>;
}

/**
 * Locator type (compatible with Playwright)
 */
export interface Locator {
  textContent(): Promise<string | null>;
  inputValue(): Promise<string>;
  isVisible(): Promise<boolean>;
  isHidden(): Promise<boolean>;
  isEnabled(): Promise<boolean>;
  isDisabled(): Promise<boolean>;
  isChecked(): Promise<boolean>;
  getAttribute(name: string): Promise<string | null>;
  count(): Promise<number>;
}

/**
 * Page type (compatible with Playwright)
 */
export interface Page {
  url(): string;
  title(): Promise<string>;
  locator(selector: string): Locator;
}
