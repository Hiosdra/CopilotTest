import { configure } from "./src/index.js";
import { webPlatform } from "./src/platforms/web.js";
import { apiPlatform } from "./src/platforms/api.js";
import { mobilePlatform } from "./src/platforms/mobile.js";
import type { McpServerConfig } from "./src/types.js";

const databaseMcp: McpServerConfig = {
  type: "stdio",
  command: "npx",
  args: ["@copilot-test/postgres-mcp"],
  env: {
    DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://localhost:5432/testdb",
  },
};

configure({
  model: "gpt-4o",
  reasoningEffort: "high",
  platforms: {
    web: webPlatform({
      browser: "chromium",
      headless: true,
      baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
    }),
    api: apiPlatform({
      baseUrl: process.env.API_URL ?? "http://localhost:3000/api",
      defaultHeaders: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    }),
    mobile: mobilePlatform({
      device: "emulator-5554",
      avd: "Pixel_7_API_34",
    }),
  },
  mcpServers: {
    database: databaseMcp,
  },
  stepTimeout: 30000,
  retries: 2,
  screenshotOnFailure: true,
  outputDir: "copilot-test-results",
  environments: {
    local: {
      baseUrl: "http://localhost:3000",
      apiUrl: "http://localhost:3000/api",
      timeout: 60000,
      headless: false,
    },
    staging: {
      baseUrl: "https://staging.example.com",
      apiUrl: "https://api.staging.example.com",
      timeout: 30000,
      headless: true,
      apiKey: process.env.STAGING_API_KEY,
    },
    production: {
      baseUrl: "https://example.com",
      apiUrl: "https://api.example.com",
      timeout: 30000,
      headless: true,
      apiKey: process.env.PROD_API_KEY,
      screenshotOnFailure: true,
    },
  },
});
