import type { PlatformConfig } from "../types.js";

export interface WebPlatformOptions {
  browser?: "chromium" | "firefox" | "webkit";
  headless?: boolean;
  baseUrl?: string;
  visualRegression?: {
    enabled?: boolean;
    threshold?: number;
    baselineDir?: string;
    diffDir?: string;
  };
}

export function webPlatform(options: WebPlatformOptions = {}): PlatformConfig {
  const browser = options.browser ?? "chromium";
  const headless = options.headless ?? true;
  const args: string[] = ["@playwright/mcp", "--browser", browser];

  if (headless) {
    args.push("--headless");
  }

  const systemContext = [
    "You are a web testing agent using Playwright MCP.",
    "You can interact with web browsers to test web applications.",
    "Use the Playwright tools to navigate, click, type, and verify page content.",
    options.baseUrl ? `The application base URL is: ${options.baseUrl}` : "",
    "Take screenshots when verifying visual states.",
    options.visualRegression?.enabled
      ? `Visual regression testing is enabled. Use browser_take_screenshot to capture images for comparison.`
      : "",
    "Report test outcomes as JSON: { status: 'passed'|'failed', reasoning: string, error?: string }",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    platform: "web",
    mcpServer: {
      type: "stdio",
      command: "npx",
      args,
    },
    systemContext,
  };
}
