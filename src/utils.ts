/**
 * Utility functions used across the codebase.
 */

/**
 * Measures execution time of a function and returns the result with duration.
 */
export async function measureDuration<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();
  const result = await fn();
  const duration = Date.now() - startTime;
  return { result, duration };
}

/**
 * Measures execution time of a synchronous function and returns the result with duration.
 */
export function measureDurationSync<T>(
  fn: () => T
): { result: T; duration: number } {
  const startTime = Date.now();
  const result = fn();
  const duration = Date.now() - startTime;
  return { result, duration };
}

/**
 * Escapes regex special characters in a string to make it literal.
 * Useful for parameter substitution and text replacement.
 */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Safely converts an error to a string message.
 * Preserves Error instances and converts other types to strings.
 */
export function errorToString(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
}

/**
 * Safely converts an error to an Error object.
 * Returns existing Error instances or wraps other types.
 */
export function toError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }
  return new Error(String(err));
}

/**
 * Checks if a value is a plain object (not array, null, or other types).
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
