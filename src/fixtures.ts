/**
 * Test data fixtures management module.
 * Provides utilities for defining, loading, and managing static test data.
 */

/**
 * Type for fixture data which can be any serializable value
 */
export type FixtureData = Record<string, unknown> | unknown[] | string | number | boolean | null;

/**
 * Registry for storing fixtures by category
 */
class FixtureRegistry {
  private fixtures = new Map<string, FixtureData>();

  /**
   * Register a fixture with a given name
   * @param name - Unique name for the fixture
   * @param data - The fixture data
   */
  register(name: string, data: FixtureData): void {
    this.fixtures.set(name, data);
  }

  /**
   * Get a fixture by name
   * @param name - The fixture name
   * @returns The fixture data or undefined if not found
   */
  get<T = FixtureData>(name: string): T | undefined {
    return this.fixtures.get(name) as T | undefined;
  }

  /**
   * Check if a fixture exists
   * @param name - The fixture name
   * @returns True if the fixture exists
   */
  has(name: string): boolean {
    return this.fixtures.has(name);
  }

  /**
   * Remove a fixture
   * @param name - The fixture name
   * @returns True if the fixture was removed
   */
  remove(name: string): boolean {
    return this.fixtures.delete(name);
  }

  /**
   * Clear all fixtures
   */
  clear(): void {
    this.fixtures.clear();
  }

  /**
   * Get all fixture names
   * @returns Array of fixture names
   */
  list(): string[] {
    return Array.from(this.fixtures.keys());
  }
}

/**
 * Global fixture registry instance
 */
const globalRegistry = new FixtureRegistry();

/**
 * Define a fixture and register it globally
 * @param name - Unique name for the fixture
 * @param data - The fixture data
 * @returns The fixture data for immediate use
 */
export function defineFixture<T extends FixtureData>(name: string, data: T): T {
  globalRegistry.register(name, data);
  return data;
}

/**
 * Get a fixture by name
 * @param name - The fixture name
 * @returns The fixture data or undefined if not found
 */
export function getFixture<T = FixtureData>(name: string): T | undefined {
  return globalRegistry.get<T>(name);
}

/**
 * Load fixtures from a module
 * @param fixtures - Object containing named fixtures
 */
export function loadFixtures(fixtures: Record<string, FixtureData>): void {
  for (const [name, data] of Object.entries(fixtures)) {
    globalRegistry.register(name, data);
  }
}

/**
 * Clear all registered fixtures
 */
export function clearFixtures(): void {
  globalRegistry.clear();
}

/**
 * List all registered fixture names
 * @returns Array of fixture names
 */
export function listFixtures(): string[] {
  return globalRegistry.list();
}

/**
 * Create a new isolated fixture registry
 * Useful for tests or isolated contexts
 * @returns A new FixtureRegistry instance
 */
export function createFixtureRegistry(): FixtureRegistry {
  return new FixtureRegistry();
}
