import { configure } from "../src/index.js";
import { feature, test, run } from "../src/index.js";
import { webPlatform } from "../src/platforms/web.js";
import { apiPlatform } from "../src/platforms/api.js";
import { startWatchMode } from "../src/index.js";
import { TestRunner } from "../src/index.js";

/**
 * Example test file for watch mode testing
 * This file demonstrates how to use watch mode
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

// Only run watch mode if explicitly requested
if (process.env.RUN_WATCH_MODE === "1") {
  const runner = new TestRunner();
  const config = runner.getConfig();
  if (config) {
    startWatchMode(config, runner).catch(console.error);
  }
} else {
  // Run tests normally for verification
  if (process.env.RUN_TESTS === "1") {
    run().catch(console.error);
  }
}
