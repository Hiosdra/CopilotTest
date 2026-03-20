/**
 * Session management for handling platform-specific test sessions
 * Extracted from CopilotTestRuntime for better separation of concerns
 */

import type { PlatformConfig } from "./types.js";

/**
 * Session interface that all platform sessions should implement
 */
export interface Session {
  close(): Promise<void>;
}

/**
 * Mock session for testing without real platform connections
 */
export interface MockSession extends Session {
  _mock: true;
  platformType: string;
}

/**
 * Type guard to check if a session is a mock session
 */
export function isMockSession(session: unknown): session is MockSession {
  if (typeof session !== "object" || session === null || !("_mock" in session)) {
    return false;
  }
  const s = session as Record<string, unknown>;
  return s._mock === true;
}

/**
 * Type guard to check if a session has a close method
 */
export function isClosableSession(session: unknown): session is Session {
  return (
    typeof session === "object" &&
    session !== null &&
    "close" in session &&
    typeof (session as Record<string, unknown>).close === "function"
  );
}

/**
 * SessionManager handles creation, lifecycle, and cleanup of test sessions
 */
export class SessionManager {
  private activeSessions: Map<string, Session> = new Map();
  private mockMode: boolean;

  constructor(mockMode = false) {
    this.mockMode = mockMode;
  }

  /**
   * Create a session for the given platform
   */
  async createSession(platform: PlatformConfig): Promise<Session | MockSession> {
    // Mock mode for testing
    if (this.mockMode) {
      const mockSession: MockSession = {
        _mock: true,
        platformType: platform.platform,
        close: async () => {
          // Mock close does nothing
        },
      };
      return mockSession;
    }

    // Real session creation based on platform type
    switch (platform.platform) {
      case "web": {
        const playwright = await import("@playwright/mcp");
        const session = await playwright.createConnection();
        return session as Session;
      }
      case "api": {
        // API platform doesn't need a persistent session
        const mockSession: MockSession = {
          _mock: true,
          platformType: "api",
          close: async () => {},
        };
        return mockSession;
      }
      case "mobile": {
        const playwright = await import("@playwright/mcp");
        const session = await playwright.createConnection();
        return session as Session;
      }
      default:
        throw new Error(`Unsupported platform type: ${platform.platform}`);
    }
  }

  /**
   * Register a session for tracking
   */
  registerSession(id: string, session: Session): void {
    this.activeSessions.set(id, session);
  }

  /**
   * Close a specific session
   */
  async closeSession(session: unknown): Promise<void> {
    if (!session) {
      return;
    }

    try {
      if (isClosableSession(session)) {
        await session.close();
      }
    } catch (error) {
      // Log but don't throw - session cleanup errors shouldn't fail tests
      console.warn("Error closing session:", error);
    }
  }

  /**
   * Close all active sessions
   */
  async closeAllSessions(): Promise<void> {
    const closePromises = Array.from(this.activeSessions.values()).map((session) =>
      this.closeSession(session)
    );

    await Promise.allSettled(closePromises);
    this.activeSessions.clear();
  }

  /**
   * Get active session count (useful for monitoring/debugging)
   */
  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Check if running in mock mode
   */
  isMockMode(): boolean {
    return this.mockMode;
  }
}
