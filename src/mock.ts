/**
 * API response mocking utility for test data management.
 * Provides helpers for mocking HTTP responses in tests.
 */

/**
 * HTTP method types
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

/**
 * Mock response configuration
 */
export interface MockResponse {
  /** HTTP status code */
  status: number;
  /** Response body (will be JSON stringified if object) */
  body?: unknown;
  /** Response headers */
  headers?: Record<string, string>;
  /** Delay in milliseconds before responding */
  delay?: number;
}

/**
 * Mock route configuration
 */
export interface MockRoute {
  /** HTTP method */
  method: HttpMethod;
  /** URL pattern (can include wildcards) */
  url: string | RegExp;
  /** Mock response configuration */
  response: MockResponse;
}

/**
 * Mock API registry for managing mock routes
 */
class MockApiRegistry {
  private routes: MockRoute[] = [];

  /**
   * Register a mock route
   * @param route - Mock route configuration
   */
  register(route: MockRoute): void {
    this.routes.push(route);
  }

  /**
   * Find a matching mock route
   * @param method - HTTP method
   * @param url - Request URL
   * @returns Matching route or undefined
   */
  findMatch(method: HttpMethod, url: string): MockRoute | undefined {
    return this.routes.find((route) => {
      if (route.method !== method) return false;

      if (typeof route.url === "string") {
        // Simple string matching with wildcard support
        const pattern = route.url
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escape special chars
          .replace(/\\\*/g, ".*"); // Convert * to .*
        return new RegExp(`^${pattern}$`).test(url);
      } else {
        // Regex matching
        return route.url.test(url);
      }
    });
  }

  /**
   * Clear all mock routes
   */
  clear(): void {
    this.routes = [];
  }

  /**
   * Get all registered routes
   * @returns Array of mock routes
   */
  list(): MockRoute[] {
    return [...this.routes];
  }
}

/**
 * Global mock API registry
 */
const globalRegistry = new MockApiRegistry();

/**
 * Mock API interface for registering mocks
 */
export const mockApi = {
  /**
   * Mock a GET request
   * @param url - URL pattern to mock
   * @param response - Mock response configuration
   */
  get(url: string | RegExp, response: MockResponse): void {
    globalRegistry.register({ method: "GET", url, response });
  },

  /**
   * Mock a POST request
   * @param url - URL pattern to mock
   * @param response - Mock response configuration
   */
  post(url: string | RegExp, response: MockResponse): void {
    globalRegistry.register({ method: "POST", url, response });
  },

  /**
   * Mock a PUT request
   * @param url - URL pattern to mock
   * @param response - Mock response configuration
   */
  put(url: string | RegExp, response: MockResponse): void {
    globalRegistry.register({ method: "PUT", url, response });
  },

  /**
   * Mock a PATCH request
   * @param url - URL pattern to mock
   * @param response - Mock response configuration
   */
  patch(url: string | RegExp, response: MockResponse): void {
    globalRegistry.register({ method: "PATCH", url, response });
  },

  /**
   * Mock a DELETE request
   * @param url - URL pattern to mock
   * @param response - Mock response configuration
   */
  delete(url: string | RegExp, response: MockResponse): void {
    globalRegistry.register({ method: "DELETE", url, response });
  },

  /**
   * Clear all registered mocks
   */
  clear(): void {
    globalRegistry.clear();
  },

  /**
   * List all registered mocks
   * @returns Array of mock routes
   */
  list(): MockRoute[] {
    return globalRegistry.list();
  },

  /**
   * Find a matching mock for a request
   * @param method - HTTP method
   * @param url - Request URL
   * @returns Mock response or undefined
   */
  findMock(method: HttpMethod, url: string): MockResponse | undefined {
    const route = globalRegistry.findMatch(method, url);
    return route?.response;
  },
};

/**
 * Create an isolated mock API registry
 * Useful for tests or isolated contexts
 * @returns A new mock API interface
 */
export function createMockApi(): typeof mockApi {
  const registry = new MockApiRegistry();

  return {
    get(url: string | RegExp, response: MockResponse): void {
      registry.register({ method: "GET", url, response });
    },
    post(url: string | RegExp, response: MockResponse): void {
      registry.register({ method: "POST", url, response });
    },
    put(url: string | RegExp, response: MockResponse): void {
      registry.register({ method: "PUT", url, response });
    },
    patch(url: string | RegExp, response: MockResponse): void {
      registry.register({ method: "PATCH", url, response });
    },
    delete(url: string | RegExp, response: MockResponse): void {
      registry.register({ method: "DELETE", url, response });
    },
    clear(): void {
      registry.clear();
    },
    list(): MockRoute[] {
      return registry.list();
    },
    findMock(method: HttpMethod, url: string): MockResponse | undefined {
      const route = registry.findMatch(method, url);
      return route?.response;
    },
  };
}
