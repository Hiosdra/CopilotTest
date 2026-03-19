/**
 * Core synchronous assertion matchers implementation.
 */

import { AssertionError, type Matchers } from "./types.js";

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

function matchesObject(actual: any, partial: Record<string, any>): boolean {
  if (actual == null || typeof actual !== "object") return false;

  for (const key in partial) {
    if (!(key in actual)) return false;
    if (!deepEqual(actual[key], partial[key])) return false;
  }

  return true;
}

export function createMatchers<T>(actual: T): Matchers<T> {
  return {
    toBe(expected: T): void {
      if (actual !== expected) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`
        );
      }
    },

    toEqual(expected: T): void {
      if (!deepEqual(actual, expected)) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`
        );
      }
    },

    toBeGreaterThan(expected: number): void {
      if (typeof actual !== "number") {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be a number`
        );
      }
      if (actual <= expected) {
        throw new AssertionError(
          `Expected ${actual} to be greater than ${expected}`
        );
      }
    },

    toBeLessThan(expected: number): void {
      if (typeof actual !== "number") {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be a number`
        );
      }
      if (actual >= expected) {
        throw new AssertionError(
          `Expected ${actual} to be less than ${expected}`
        );
      }
    },

    toBeGreaterThanOrEqual(expected: number): void {
      if (typeof actual !== "number") {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be a number`
        );
      }
      if (actual < expected) {
        throw new AssertionError(
          `Expected ${actual} to be greater than or equal to ${expected}`
        );
      }
    },

    toBeLessThanOrEqual(expected: number): void {
      if (typeof actual !== "number") {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be a number`
        );
      }
      if (actual > expected) {
        throw new AssertionError(
          `Expected ${actual} to be less than or equal to ${expected}`
        );
      }
    },

    toContain(item: any): void {
      if (typeof actual === "string") {
        if (!actual.includes(item)) {
          throw new AssertionError(
            `Expected "${actual}" to contain "${item}"`
          );
        }
      } else if (Array.isArray(actual)) {
        if (!actual.includes(item)) {
          throw new AssertionError(
            `Expected array to contain ${JSON.stringify(item)}`
          );
        }
      } else {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be a string or array`
        );
      }
    },

    toHaveProperty(key: string, value?: any): void {
      if (actual == null || typeof actual !== "object") {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be an object`
        );
      }
      if (!(key in (actual as any))) {
        throw new AssertionError(
          `Expected object to have property "${key}"`
        );
      }
      if (value !== undefined && (actual as any)[key] !== value) {
        throw new AssertionError(
          `Expected property "${key}" to be ${JSON.stringify(value)}, but got ${JSON.stringify((actual as any)[key])}`
        );
      }
    },

    toHaveLength(length: number): void {
      if (actual == null || typeof (actual as any).length !== "number") {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to have a length property`
        );
      }
      if ((actual as any).length !== length) {
        throw new AssertionError(
          `Expected length to be ${length}, but got ${(actual as any).length}`
        );
      }
    },

    toMatchObject(partial: Record<string, any>): void {
      if (!matchesObject(actual, partial)) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to match object ${JSON.stringify(partial)}`
        );
      }
    },

    toMatch(pattern: RegExp | string): void {
      if (typeof actual !== "string") {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be a string`
        );
      }
      const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
      if (!regex.test(actual)) {
        throw new AssertionError(
          `Expected "${actual}" to match ${pattern}`
        );
      }
    },

    toStartWith(prefix: string): void {
      if (typeof actual !== "string") {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be a string`
        );
      }
      if (!actual.startsWith(prefix)) {
        throw new AssertionError(
          `Expected "${actual}" to start with "${prefix}"`
        );
      }
    },

    toEndWith(suffix: string): void {
      if (typeof actual !== "string") {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be a string`
        );
      }
      if (!actual.endsWith(suffix)) {
        throw new AssertionError(
          `Expected "${actual}" to end with "${suffix}"`
        );
      }
    },

    toBeTruthy(): void {
      if (!actual) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be truthy`
        );
      }
    },

    toBeFalsy(): void {
      if (actual) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be falsy`
        );
      }
    },

    toBeNull(): void {
      if (actual !== null) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be null`
        );
      }
    },

    toBeUndefined(): void {
      if (actual !== undefined) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be undefined`
        );
      }
    },

    toBeDefined(): void {
      if (actual === undefined) {
        throw new AssertionError(
          `Expected value to be defined`
        );
      }
    },

    toBeNaN(): void {
      if (!Number.isNaN(actual)) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be NaN`
        );
      }
    },

    toBeInstanceOf(constructor: any): void {
      if (!(actual instanceof constructor)) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be instance of ${constructor.name}`
        );
      }
    },
  };
}
