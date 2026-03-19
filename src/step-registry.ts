import type { StepDefinition, StepDefinitionHandler } from "./types.js";

/**
 * Global registry of custom step definitions.
 * Steps are matched in the order they are registered.
 */
const stepDefinitions: StepDefinition[] = [];

/**
 * Register a custom step definition.
 *
 * @param pattern - Regular expression to match step text (without the keyword).
 *                  Must not use global (/g) or sticky (/y) flags.
 * @param handler - Async function to execute when pattern matches
 *
 * @example
 * ```typescript
 * defineStep(/^I login as "(.+)" with password "(.+)"$/, async (context, username, password) => {
 *   const { session } = context;
 *   // Use session or other context properties to perform actions
 *   // Example: const page = await getPageFromSession(session);
 *   // await page.goto('/login');
 *   // await page.fill('#username', username);
 *   // await page.fill('#password', password);
 *   // await page.click('button[type="submit"]');
 * });
 * ```
 */
export function defineStep(
  pattern: RegExp,
  handler: StepDefinitionHandler
): void {
  if (pattern.global || pattern.sticky) {
    throw new Error(
      "Step definition patterns must not use global (/g) or sticky (/y) flags"
    );
  }
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
): { definition: StepDefinition; matches: Array<string | undefined> } | null {
  for (const definition of stepDefinitions) {
    // Reset lastIndex to ensure consistent matching
    definition.pattern.lastIndex = 0;

    // Use exec() instead of match() to reliably get capture groups
    const match = definition.pattern.exec(stepText);
    if (match) {
      // Extract captured groups (excluding the full match at index 0)
      // Note: Optional capture groups will be undefined
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
 * Returns a shallow copy to prevent external mutation of the registry.
 */
export function getStepDefinitions(): ReadonlyArray<StepDefinition> {
  return stepDefinitions.slice();
}
