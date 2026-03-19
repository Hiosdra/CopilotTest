import type { StepDefinition, StepDefinitionHandler } from "./types.js";

/**
 * Global registry of custom step definitions.
 * Steps are matched in the order they are registered.
 */
const stepDefinitions: StepDefinition[] = [];

/**
 * Register a custom step definition.
 *
 * @param pattern - Regular expression to match step text (without the keyword)
 * @param handler - Async function to execute when pattern matches
 *
 * @example
 * ```typescript
 * defineStep(/^I login as "(.+)" with password "(.+)"$/, async (context, username, password) => {
 *   const { page } = context;
 *   await page.goto('/login');
 *   await page.fill('#username', username);
 *   await page.fill('#password', password);
 *   await page.click('button[type="submit"]');
 * });
 * ```
 */
export function defineStep(
  pattern: RegExp,
  handler: StepDefinitionHandler
): void {
  stepDefinitions.push({ pattern, handler });
}

/**
 * Find a matching step definition for the given step text.
 *
 * @param stepText - The step text (without keyword)
 * @returns The matching definition and captures, or null if no match
 */
export function findStepDefinition(
  stepText: string
): { definition: StepDefinition; matches: string[] } | null {
  for (const definition of stepDefinitions) {
    const match = stepText.match(definition.pattern);
    if (match) {
      // Extract captured groups (excluding the full match at index 0)
      const matches = match.slice(1);
      return { definition, matches };
    }
  }
  return null;
}

/**
 * Clear all registered step definitions.
 * Useful for testing or resetting between test runs.
 */
export function clearStepDefinitions(): void {
  stepDefinitions.length = 0;
}

/**
 * Get all registered step definitions.
 * Useful for debugging or introspection.
 */
export function getStepDefinitions(): ReadonlyArray<StepDefinition> {
  return stepDefinitions;
}
