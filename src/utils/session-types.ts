/**
 * Type definitions for AI client and session interfaces
 */

/**
 * Response from AI step execution
 */
export interface AIResponse {
  data: {
    content: string;
  };
  text: string;
}

/**
 * AI session interface for executing steps
 */
export interface AISession {
  sendAndWait(
    opts: { prompt: string },
    timeout?: number
  ): Promise<AIResponse>;
  close?(): Promise<void>;
}

/**
 * Mock session for testing/development
 */
export interface MockSession {
  _mock: true;
}

/**
 * Union type for all session types
 */
export type Session = AISession | MockSession;

/**
 * Type guard to check if a session is a mock session
 */
export function isMockSession(session: unknown): session is MockSession {
  return (
    typeof session === "object" &&
    session !== null &&
    "_mock" in session &&
    session._mock === true
  );
}

/**
 * Type guard to check if a session is an AI session
 */
export function isAISession(session: unknown): session is AISession {
  return (
    typeof session === "object" &&
    session !== null &&
    "sendAndWait" in session &&
    typeof (session as AISession).sendAndWait === "function"
  );
}
