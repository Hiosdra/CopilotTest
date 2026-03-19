/**
 * Error handling utilities for consistent error processing throughout the framework
 */

/**
 * Error categories for better error classification
 */
export enum ErrorCategory {
  NETWORK = "network",
  TIMEOUT = "timeout",
  ASSERTION = "assertion",
  CONFIGURATION = "configuration",
  PLATFORM = "platform",
  PARSING = "parsing",
  UNKNOWN = "unknown",
}

/**
 * Classified error with category and metadata
 */
export interface ClassifiedError {
  category: ErrorCategory;
  message: string;
  originalError?: unknown;
  isRetryable: boolean;
}

/**
 * Convert any error value to a string representation
 * Handles Error objects, strings, objects, and other types consistently
 */
export function errorToString(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
}

/**
 * Classify an error to determine its category and whether it's retryable
 */
export function classifyError(error: unknown): ClassifiedError {
  const message = errorToString(error);
  const messageLower = message.toLowerCase();

  // Network errors - typically retryable
  if (
    messageLower.includes("network") ||
    messageLower.includes("econnrefused") ||
    messageLower.includes("enotfound") ||
    messageLower.includes("etimedout") ||
    messageLower.includes("socket") ||
    messageLower.includes("fetch failed")
  ) {
    return {
      category: ErrorCategory.NETWORK,
      message,
      originalError: error,
      isRetryable: true,
    };
  }

  // Timeout errors - typically retryable
  if (
    messageLower.includes("timeout") ||
    messageLower.includes("timed out") ||
    messageLower.includes("deadline exceeded")
  ) {
    return {
      category: ErrorCategory.TIMEOUT,
      message,
      originalError: error,
      isRetryable: true,
    };
  }

  // Assertion errors - not retryable
  if (
    messageLower.includes("assertion") ||
    messageLower.includes("expected") ||
    messageLower.includes("should be") ||
    messageLower.includes("must be")
  ) {
    return {
      category: ErrorCategory.ASSERTION,
      message,
      originalError: error,
      isRetryable: false,
    };
  }

  // Configuration errors - not retryable
  if (
    messageLower.includes("configuration") ||
    messageLower.includes("invalid config") ||
    messageLower.includes("missing required")
  ) {
    return {
      category: ErrorCategory.CONFIGURATION,
      message,
      originalError: error,
      isRetryable: false,
    };
  }

  // Platform/browser errors - sometimes retryable
  if (
    messageLower.includes("browser") ||
    messageLower.includes("playwright") ||
    messageLower.includes("session") ||
    messageLower.includes("closed")
  ) {
    return {
      category: ErrorCategory.PLATFORM,
      message,
      originalError: error,
      isRetryable: true,
    };
  }

  // Parsing errors - not retryable
  if (
    messageLower.includes("parse") ||
    messageLower.includes("invalid json") ||
    messageLower.includes("syntax error")
  ) {
    return {
      category: ErrorCategory.PARSING,
      message,
      originalError: error,
      isRetryable: false,
    };
  }

  // Unknown errors - default to retryable to be safe
  return {
    category: ErrorCategory.UNKNOWN,
    message,
    originalError: error,
    isRetryable: true,
  };
}

/**
 * Check if an error should trigger a retry based on its classification
 */
export function shouldRetryError(error: unknown): boolean {
  const classified = classifyError(error);
  return classified.isRetryable;
}

/**
 * Create a user-friendly error message from an error object
 */
export function formatErrorMessage(error: unknown, context?: string): string {
  const classified = classifyError(error);
  const prefix = context ? `${context}: ` : "";
  const categoryLabel = classified.category !== ErrorCategory.UNKNOWN ? `[${classified.category}] ` : "";
  return `${prefix}${categoryLabel}${classified.message}`;
}
