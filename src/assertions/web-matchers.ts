/**
 * Web-specific assertion matchers for Playwright-compatible locators and pages.
 */

import { AssertionError, type WebMatchers, type PageMatchers, type Locator, type Page } from "./types.js";

export function createWebMatchers(locator: Locator): WebMatchers {
  return {
    async toHaveText(text: string | RegExp): Promise<void> {
      const actual = await locator.textContent();
      if (actual === null) {
        throw new AssertionError("Expected element to have text content, but got null");
      }

      if (typeof text === "string") {
        if (actual !== text) {
          throw new AssertionError(
            `Expected element to have text "${text}", but got "${actual}"`
          );
        }
      } else {
        if (!text.test(actual)) {
          throw new AssertionError(
            `Expected element text to match ${text}, but got "${actual}"`
          );
        }
      }
    },

    async toContainText(text: string | RegExp): Promise<void> {
      const actual = await locator.textContent();
      if (actual === null) {
        throw new AssertionError("Expected element to have text content, but got null");
      }

      if (typeof text === "string") {
        if (!actual.includes(text)) {
          throw new AssertionError(
            `Expected element to contain text "${text}", but got "${actual}"`
          );
        }
      } else {
        if (!text.test(actual)) {
          throw new AssertionError(
            `Expected element text to match ${text}, but got "${actual}"`
          );
        }
      }
    },

    async toHaveValue(value: string | RegExp): Promise<void> {
      const actual = await locator.inputValue();

      if (typeof value === "string") {
        if (actual !== value) {
          throw new AssertionError(
            `Expected input to have value "${value}", but got "${actual}"`
          );
        }
      } else {
        if (!value.test(actual)) {
          throw new AssertionError(
            `Expected input value to match ${value}, but got "${actual}"`
          );
        }
      }
    },

    async toBeVisible(): Promise<void> {
      const visible = await locator.isVisible();
      if (!visible) {
        throw new AssertionError("Expected element to be visible");
      }
    },

    async toBeHidden(): Promise<void> {
      const hidden = await locator.isHidden();
      if (!hidden) {
        throw new AssertionError("Expected element to be hidden");
      }
    },

    async toBeEnabled(): Promise<void> {
      const enabled = await locator.isEnabled();
      if (!enabled) {
        throw new AssertionError("Expected element to be enabled");
      }
    },

    async toBeDisabled(): Promise<void> {
      const disabled = await locator.isDisabled();
      if (!disabled) {
        throw new AssertionError("Expected element to be disabled");
      }
    },

    async toBeChecked(): Promise<void> {
      const checked = await locator.isChecked();
      if (!checked) {
        throw new AssertionError("Expected element to be checked");
      }
    },

    async toHaveAttribute(name: string, value?: string | RegExp): Promise<void> {
      const actual = await locator.getAttribute(name);
      if (actual === null) {
        throw new AssertionError(
          `Expected element to have attribute "${name}"`
        );
      }

      if (value !== undefined) {
        if (typeof value === "string") {
          if (actual !== value) {
            throw new AssertionError(
              `Expected attribute "${name}" to be "${value}", but got "${actual}"`
            );
          }
        } else {
          if (!value.test(actual)) {
            throw new AssertionError(
              `Expected attribute "${name}" to match ${value}, but got "${actual}"`
            );
          }
        }
      }
    },

    async toHaveClass(className: string | RegExp): Promise<void> {
      const classAttr = await locator.getAttribute("class");
      if (classAttr === null) {
        throw new AssertionError("Expected element to have class attribute");
      }

      if (typeof className === "string") {
        const classes = classAttr.split(/\s+/);
        if (!classes.includes(className)) {
          throw new AssertionError(
            `Expected element to have class "${className}", but got "${classAttr}"`
          );
        }
      } else {
        if (!className.test(classAttr)) {
          throw new AssertionError(
            `Expected element class to match ${className}, but got "${classAttr}"`
          );
        }
      }
    },

    async toHaveCount(count: number): Promise<void> {
      const actual = await locator.count();
      if (actual !== count) {
        throw new AssertionError(
          `Expected locator to match ${count} elements, but got ${actual}`
        );
      }
    },
  };
}

export function createPageMatchers(page: Page): PageMatchers {
  return {
    async toHaveURL(url: string | RegExp): Promise<void> {
      const actual = page.url();

      if (typeof url === "string") {
        if (actual !== url) {
          throw new AssertionError(
            `Expected page URL to be "${url}", but got "${actual}"`
          );
        }
      } else {
        if (!url.test(actual)) {
          throw new AssertionError(
            `Expected page URL to match ${url}, but got "${actual}"`
          );
        }
      }
    },

    async toHaveTitle(title: string | RegExp): Promise<void> {
      const actual = await page.title();

      if (typeof title === "string") {
        if (actual !== title) {
          throw new AssertionError(
            `Expected page title to be "${title}", but got "${actual}"`
          );
        }
      } else {
        if (!title.test(actual)) {
          throw new AssertionError(
            `Expected page title to match ${title}, but got "${actual}"`
          );
        }
      }
    },
  };
}
