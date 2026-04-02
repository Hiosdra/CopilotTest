#!/usr/bin/env node

import { pathToFileURL } from "url";
import { resolve } from "path";

/**
 * CLI entry point for watch mode
 * Usage: tsx src/cli-watch.ts <test-file>
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(`
Usage: npm run test:watch <test-file>

Start watch mode to continuously run tests on file changes.

Example:
  npm run test:watch tests/login.feature.md
  npm run test:watch tests/watch-example.feature.md

The test file should:
  1. Call configure() to set up the test configuration
  2. Call test() to register test features
  3. NOT call run() - watch mode handles test execution
`);
    process.exit(1);
  }

  const testFile = args[0];
  const testFilePath = resolve(process.cwd(), testFile);

  console.log(`📦 Loading test file: ${testFile}\n`);

  try {
    // Import the test file to execute configure() and test() calls
    await import(pathToFileURL(testFilePath).href);

    // After importing, get the configured singleton runner
    const { getConfig, getDefaultRunner } = await import("./runner.js");
    const { startWatchMode } = await import("./watch.js");

    const config = getConfig();

    if (!config) {
      console.error("❌ Error: No configuration found. The test file must call configure() before starting watch mode.");
      process.exit(1);
    }

    const runner = getDefaultRunner();

    console.log("🚀 Starting watch mode...\n");

    await startWatchMode(config, runner);
  } catch (err) {
    console.error("❌ Error loading test file:", err instanceof Error ? err.message : String(err));
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Fatal error in watch mode:", err);
  process.exit(1);
});
