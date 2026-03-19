#!/usr/bin/env node

import { TestRunner, getConfig } from "./runner.js";
import { startWatchMode } from "./watch.js";

/**
 * CLI entry point for watch mode
 */
async function main() {
  const config = getConfig();

  if (!config) {
    console.error("❌ Error: No configuration found. Please call configure() before starting watch mode.");
    process.exit(1);
  }

  // Create a new test runner for watch mode
  const runner = new TestRunner();
  runner.configure(config);

  // Start watch mode
  await startWatchMode(config, runner);
}

main().catch((err) => {
  console.error("❌ Fatal error in watch mode:", err);
  process.exit(1);
});
