/**
 * Database seeding utility for test data management.
 * Provides helpers for seeding databases with test data.
 */

/**
 * Seed data for a collection or table
 */
export type SeedData = Record<string, unknown>[] | Record<string, unknown>;

/**
 * Seed handler function type
 */
export type SeedHandler = (collection: string, data: SeedData) => Promise<void> | void;

/**
 * Global seed handler registry
 */
class SeedRegistry {
  private handlers = new Map<string, SeedHandler>();
  private defaultHandler?: SeedHandler;

  /**
   * Register a seed handler for a specific collection
   * @param collection - Collection/table name
   * @param handler - Seed handler function
   */
  registerHandler(collection: string, handler: SeedHandler): void {
    this.handlers.set(collection, handler);
  }

  /**
   * Register a default handler for all collections
   * @param handler - Default seed handler function
   */
  registerDefaultHandler(handler: SeedHandler): void {
    this.defaultHandler = handler;
  }

  /**
   * Get handler for a collection
   * @param collection - Collection/table name
   * @returns Handler function or undefined
   */
  getHandler(collection: string): SeedHandler | undefined {
    return this.handlers.get(collection) || this.defaultHandler;
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.defaultHandler = undefined;
  }
}

/**
 * Global seed registry instance
 */
const globalRegistry = new SeedRegistry();

/**
 * Seed a database collection/table with test data
 * @param collection - Collection or table name
 * @param data - Data to seed
 * @throws Error if no handler is registered
 */
export async function seed(collection: string, data: SeedData): Promise<void> {
  const handler = globalRegistry.getHandler(collection);
  if (!handler) {
    throw new Error(
      `No seed handler registered for collection "${collection}". ` +
      `Register a handler using registerSeedHandler() or registerDefaultSeedHandler().`
    );
  }
  await handler(collection, data);
}

/**
 * Register a seed handler for a specific collection
 * @param collection - Collection/table name
 * @param handler - Handler function that performs the seeding
 *
 * @example
 * ```typescript
 * registerSeedHandler('users', async (collection, data) => {
 *   await db.collection(collection).insertMany(data);
 * });
 * ```
 */
export function registerSeedHandler(collection: string, handler: SeedHandler): void {
  globalRegistry.registerHandler(collection, handler);
}

/**
 * Register a default seed handler for all collections
 * @param handler - Default handler function
 *
 * @example
 * ```typescript
 * registerDefaultSeedHandler(async (collection, data) => {
 *   await db.collection(collection).insertMany(Array.isArray(data) ? data : [data]);
 * });
 * ```
 */
export function registerDefaultSeedHandler(handler: SeedHandler): void {
  globalRegistry.registerDefaultHandler(handler);
}

/**
 * Clear all registered seed handlers
 */
export function clearSeedHandlers(): void {
  globalRegistry.clear();
}
