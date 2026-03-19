/**
 * Factory module for generating dynamic test data.
 * Provides integration with Faker.js for realistic data generation.
 */

import { faker } from "@faker-js/faker";

/**
 * Context provided to factory field functions
 */
export interface FactoryContext {
  /** Current sequence number for unique values */
  sequence: number;
  /** Faker instance for data generation */
  faker: typeof faker;
  /** Access to other built fields in this factory instance */
  data: Record<string, unknown>;
}

/**
 * Factory field definition - can be a static value or a function
 */
export type FactoryField<T = unknown> = T | ((context: FactoryContext) => T);

/**
 * Factory definition with field generators
 */
export type FactoryDefinition<T extends Record<string, unknown> = Record<string, unknown>> = {
  [K in keyof T]: FactoryField<T[K]>;
};

/**
 * Options for building factory data
 */
export interface BuildOptions<T> {
  /** Override specific fields */
  overrides?: Partial<T>;
  /** Sequence number to use (auto-increments by default) */
  sequence?: number;
}

/**
 * Factory class for building test data
 */
export class Factory<T extends Record<string, unknown>> {
  private definition: FactoryDefinition<T>;
  private sequenceCounter = 0;

  constructor(definition: FactoryDefinition<T>) {
    this.definition = definition;
  }

  /**
   * Build a single instance of the factory data
   * @param overrides - Optional field overrides
   * @returns Generated data object
   */
  build(overrides?: Partial<T>): T {
    return this.buildWithOptions({ overrides });
  }

  /**
   * Build a single instance with advanced options
   * @param options - Build options
   * @returns Generated data object
   */
  buildWithOptions(options: BuildOptions<T> = {}): T {
    const { overrides = {} as Partial<T>, sequence = this.sequenceCounter++ } = options;
    const result: Record<string, unknown> = {};

    const context: FactoryContext = {
      sequence,
      faker,
      data: result,
    };

    // Build each field
    for (const [key, fieldDef] of Object.entries(this.definition)) {
      if (overrides && key in overrides) {
        // Use override value
        result[key] = overrides[key as keyof T];
      } else if (typeof fieldDef === "function") {
        // Call the field function with context
        result[key] = (fieldDef as (ctx: FactoryContext) => unknown)(context);
      } else {
        // Use static value
        result[key] = fieldDef;
      }
    }

    return result as T;
  }

  /**
   * Build a list of instances
   * @param count - Number of instances to build
   * @param overrides - Optional field overrides (applied to all instances)
   * @returns Array of generated data objects
   */
  buildList(count: number, overrides?: Partial<T>): T[] {
    const results: T[] = [];
    for (let i = 0; i < count; i++) {
      results.push(this.build(overrides));
    }
    return results;
  }

  /**
   * Build a list of instances with different overrides for each
   * @param overridesList - Array of override objects
   * @returns Array of generated data objects
   */
  buildListWithOverrides(overridesList: Array<Partial<T>>): T[] {
    return overridesList.map((overrides) => this.build(overrides));
  }

  /**
   * Reset the sequence counter
   */
  resetSequence(): void {
    this.sequenceCounter = 0;
  }

  /**
   * Set the sequence counter to a specific value
   * @param value - The sequence value to set
   */
  setSequence(value: number): void {
    this.sequenceCounter = value;
  }

  /**
   * Get the current sequence value
   * @returns Current sequence counter
   */
  getSequence(): number {
    return this.sequenceCounter;
  }
}

/**
 * Define a factory for generating test data
 * @param definition - Factory field definitions
 * @returns Factory instance
 */
export function defineFactory<T extends Record<string, unknown>>(
  definition: FactoryDefinition<T>
): Factory<T> {
  return new Factory(definition);
}

/**
 * Re-export faker for convenience
 */
export { faker };
