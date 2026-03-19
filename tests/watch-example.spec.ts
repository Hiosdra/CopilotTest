import { configure } from "../src/index.js";
import { feature, test } from "../src/index.js";
import { webPlatform } from "../src/platforms/web.js";
import { apiPlatform } from "../src/platforms/api.js";

/**
 * Example test file for watch mode testing
 * This file demonstrates how to use watch mode
 *
 * To run in watch mode: npm run test:watch tests/watch-example.spec.ts
 */

configure({
  model: "gpt-4o",
  reasoningEffort: "high",
  platforms: {
    web: webPlatform({
      browser: "chromium",
      headless: true,
      baseUrl: "http://localhost:3000",
    }),
    api: apiPlatform({
      baseUrl: "http://localhost:3000/api",
    }),
  },
  stepTimeout: 30000,
  outputDir: "copilot-test-results",
  watch: {
    enabled: true,
    include: ["src/**/*.ts", "tests/**/*.ts"],
    exclude: ["node_modules/**", "dist/**"],
    debounce: 300,
    runMode: "all",
    clearConsole: false,
    notifications: false,
    verbose: true,
  },
});

test(
  feature("Sample Feature for Watch Mode")
    .tag("@watch")
    .scenario("Simple test scenario")
      .given("I have a simple test")
      .when("I run it in watch mode")
      .then("It should execute successfully")
      .done()
    ._build(),
  "api"
);

// Note: This file should NOT call run() when used with watch mode CLI.
// The watch mode CLI will handle test execution.
//
// For manual testing without watch mode:
// import { run } from "../src/index.js";
// await run();

