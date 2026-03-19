/**
 * Utility types for common patterns in the CopilotTest framework.
 * These types help with type-safe configuration and step definitions.
 */

import type { StepContext } from "./types.js";

/**
 * Helper type for asynchronous step functions.
 * @example
 * ```typescript
 * const myStep: AsyncStep = async (context) => {
 *   // Perform async operations
 *   await context.scenarioContext?.set('result', await fetchData());
 * };
 * ```
 */
export type AsyncStep = (context: StepContext) => Promise<void>;

/**
 * Helper type for synchronous step functions.
 * @example
 * ```typescript
 * const myStep: SyncStep = (context) => {
 *   // Perform sync operations
 *   console.log(context.step.text);
 * };
 * ```
 */
export type SyncStep = (context: StepContext) => void;

/**
 * Union type for both sync and async step functions.
 * Most step handlers should use this type.
 */
export type StepFunction = AsyncStep | SyncStep;

/**
 * Type for step text matchers (string literal or regex pattern).
 * Used in custom step definitions.
 */
export type StepMatcher = string | RegExp;

/**
 * Generic step handler that can return any value (or Promise of any value).
 * Useful for custom step implementations that need to return data.
 * @template T - The return type of the handler
 */
export type StepHandler<T = unknown> = (
  ...args: unknown[]
) => T | Promise<T>;

/**
 * Makes all properties in T optional recursively.
 * Useful for partial configuration objects.
 *
 * @example
 * ```typescript
 * const partialConfig: DeepPartial<CopilotTestConfig> = {
 *   platforms: {
 *     web: {
 *       mcpServer: { type: 'stdio' }
 *     }
 *   }
 * };
 * ```
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : DeepPartial<T[P]>
    : T[P];
};

/**
 * Requires at least one property from T to be present.
 * Useful for configuration objects where at least one option must be set.
 *
 * @example
 * ```typescript
 * type AuthConfig = RequireAtLeastOne<{
 *   username: string;
 *   apiKey: string;
 *   token: string;
 * }>;
 *
 * // Valid:
 * const config1: AuthConfig = { username: 'user' };
 * const config2: AuthConfig = { apiKey: 'key' };
 * const config3: AuthConfig = { username: 'user', apiKey: 'key' };
 *
 * // Invalid:
 * // const config4: AuthConfig = {}; // Error: at least one required
 * ```
 */
export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

/**
 * Makes specific keys K in T required while keeping others optional.
 *
 * @example
 * ```typescript
 * type User = {
 *   id?: string;
 *   name?: string;
 *   email?: string;
 * };
 *
 * // id and name are now required, email remains optional
 * type ValidUser = RequireKeys<User, 'id' | 'name'>;
 * ```
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Extracts the value type from a Promise.
 * Useful for working with async functions.
 *
 * @example
 * ```typescript
 * async function fetchUser() {
 *   return { id: 1, name: 'John' };
 * }
 *
 * type User = Awaited<ReturnType<typeof fetchUser>>;
 * // User is { id: number; name: string; }
 * ```
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Makes all properties in T mutable (removes readonly).
 *
 * @example
 * ```typescript
 * type ReadonlyUser = {
 *   readonly id: number;
 *   readonly name: string;
 * };
 *
 * type MutableUser = Mutable<ReadonlyUser>;
 * // Now properties can be modified
 * ```
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Excludes methods from type T, keeping only data properties.
 * Useful for serialization or data transfer objects.
 *
 * @example
 * ```typescript
 * class User {
 *   id: number = 1;
 *   name: string = 'John';
 *   getName() { return this.name; }
 * }
 *
 * type UserData = DataOnly<User>;
 * // UserData is { id: number; name: string; }
 * ```
 */
export type DataOnly<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

/**
 * Type-safe event emitter event map.
 * Useful for defining custom events with typed payloads.
 */
export type EventMap = {
  [event: string]: unknown;
};

/**
 * Type-safe keys of an event map.
 */
export type EventKey<T extends EventMap> = string & keyof T;

/**
 * Extract the payload type for a specific event.
 */
export type EventPayload<
  T extends EventMap,
  K extends EventKey<T>
> = T[K];
