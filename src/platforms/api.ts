import type { PlatformConfig } from "../types.js";

export interface ApiPlatformOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
}

export function apiPlatform(options: ApiPlatformOptions = {}): PlatformConfig {
  const systemContext = [
    "You are an API testing agent using curl MCP.",
    "You can make HTTP requests to test REST APIs and other web services.",
    "Use curl tools to send GET, POST, PUT, PATCH, DELETE requests.",
    "Verify response status codes, headers, and body content.",
    options.baseUrl ? `The API base URL is: ${options.baseUrl}` : "",
    options.defaultHeaders
      ? `Default headers: ${JSON.stringify(options.defaultHeaders)}`
      : "",
    "Report test outcomes as JSON: { status: 'passed'|'failed', reasoning: string, error?: string }",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    platform: "api",
    mcpServer: {
      type: "stdio",
      command: "npx",
      args: ["@copilot-test/curl-mcp"],
      env: options.defaultHeaders
        ? { DEFAULT_HEADERS: JSON.stringify(options.defaultHeaders) }
        : undefined,
    },
    systemContext,
  };
}
