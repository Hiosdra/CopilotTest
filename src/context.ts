/**
 * ScenarioContext provides a key-value store for sharing data between test steps
 * Extracted from types.ts for better separation of concerns
 */

/**
 * ScenarioContext stores and retrieves data during test scenario execution.
 * It provides a simple key-value interface for sharing state between steps.
 */
export class ScenarioContext {
  private data: Map<string, unknown>;

  constructor() {
    this.data = new Map();
  }

  /**
   * Store a value in the context.
   * @param key - The key to store the value under
   * @param value - The value to store
   */
  set(key: string, value: unknown): void {
    this.data.set(key, value);
  }

  /**
   * Retrieve a value from the context.
   * @param key - The key to retrieve
   * @returns The stored value, or undefined if not found
   */
  get<T = unknown>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  /**
   * Check if a key exists in the context.
   * @param key - The key to check
   * @returns True if the key exists, false otherwise
   */
  has(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * Remove a key from the context.
   * @param key - The key to remove
   * @returns True if the key was removed, false if it didn't exist
   */
  delete(key: string): boolean {
    return this.data.delete(key);
  }

  /**
   * Clear all data from the context.
   */
  clear(): void {
    this.data.clear();
  }

  /**
   * Get all keys in the context.
   * @returns Array of all keys
   */
  keys(): string[] {
    return Array.from(this.data.keys());
  }

  /**
   * Get all data as a plain object.
   * @returns Plain object with all key-value pairs
   */
  getAll(): Record<string, unknown> {
    return Object.fromEntries(this.data.entries());
  }

  /**
   * Convert the context to a plain JSON object.
   * @returns Plain object representation of the context
   */
  toJSON(): Record<string, unknown> {
    return this.getAll();
  }

  /**
   * Load context data from a plain JSON object.
   * Clears existing data before loading.
   * @param json - Plain object to load into context
   */
  fromJSON(json: Record<string, unknown>): void {
    this.data.clear();
    for (const [key, value] of Object.entries(json)) {
      this.data.set(key, value);
    }
  }

  /**
   * Merge data from another context or object
   * @param source - Context or object to merge from
   */
  merge(source: ScenarioContext | Record<string, unknown>): void {
    const data = source instanceof ScenarioContext ? source.getAll() : source;
    for (const [key, value] of Object.entries(data)) {
      this.data.set(key, value);
    }
  }

  /**
   * Get the number of items in the context
   * @returns Number of stored items
   */
  size(): number {
    return this.data.size;
  }
}
