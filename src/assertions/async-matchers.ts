/**
 * Async assertion matchers implementation.
 */

import { AssertionError, type AsyncMatchers } from "./types.js";
import { createMatchers } from "./matchers.js";

export function createAsyncMatchers<T>(promise: Promise<T>): AsyncMatchers<T> {
  return {
    get resolves() {
      const matchers = {} as any;
      const matcherKeys = Object.keys(createMatchers(null as any));

      for (const key of matcherKeys) {
        matchers[key] = async (...args: any[]) => {
          try {
            const value = await promise;
            const syncMatchers = createMatchers(value);
            (syncMatchers as any)[key](...args);
          } catch (error) {
            if (error instanceof AssertionError) {
              throw error;
            }
            throw new AssertionError(
              `Promise rejected with: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        };
      }

      return matchers;
    },

    rejects: {
      async toThrow(error?: string | RegExp | Error): Promise<void> {
        try {
          await promise;
          throw new AssertionError("Expected promise to reject, but it resolved");
        } catch (e) {
          if (e instanceof AssertionError && e.message.includes("Expected promise to reject")) {
            throw e;
          }

          if (error === undefined) {
            return;
          }

          const actualError = e instanceof Error ? e : new Error(String(e));

          if (typeof error === "string") {
            if (!actualError.message.includes(error)) {
              throw new AssertionError(
                `Expected promise to reject with message containing "${error}", but got "${actualError.message}"`
              );
            }
          } else if (error instanceof RegExp) {
            if (!error.test(actualError.message)) {
              throw new AssertionError(
                `Expected promise to reject with message matching ${error}, but got "${actualError.message}"`
              );
            }
          } else if (error instanceof Error) {
            if (actualError.message !== error.message) {
              throw new AssertionError(
                `Expected promise to reject with "${error.message}", but got "${actualError.message}"`
              );
            }
          }
        }
      },

      async toBe(expected: any): Promise<void> {
        try {
          await promise;
          throw new AssertionError("Expected promise to reject, but it resolved");
        } catch (e) {
          if (e instanceof AssertionError && e.message.includes("Expected promise to reject")) {
            throw e;
          }

          if (e !== expected) {
            throw new AssertionError(
              `Expected promise to reject with ${JSON.stringify(expected)}, but got ${JSON.stringify(e)}`
            );
          }
        }
      },
    },
  };
}
