import * as fs from "node:fs";
import * as path from "node:path";
import { loadConfig } from "../../config-loader.js";
import { parseFeatureFile } from "../../markdown-parser.js";
import { configure, test, run } from "../../runner.js";
import { spinner } from "../utils/spinner.js";

export async function runCommand(args: string[]) {
  const options = parseRunOptions(args);
  const files = args.filter((arg) => !arg.startsWith("--") && !arg.startsWith("-"));

  // Set environment if specified
  if (options.env) {
    process.env.ENVIRONMENT = options.env;
  }

  // Load YAML configuration
  spinner.start("Loading configuration");
  try {
    const config = await loadConfig(options.config);

    // Apply CLI overrides
    if (options.parallel) config.parallel = true;
    if (options.debug) config.debugMode = true;

    configure(config);
    spinner.succeed("Configuration loaded");
  } catch (error) {
    spinner.fail("Configuration file not found");
    console.error("\n" + (error instanceof Error ? error.message : String(error)));
    console.error("\nRun 'copilot-test init' to create a new project");
    process.exit(1);
  }

  // Find test files
  spinner.start("Finding test files");
  const testFiles = await findTestFiles(files);
  if (testFiles.length === 0) {
    spinner.fail("No test files found");
    process.exit(1);
  }
  spinner.succeed(`Found ${testFiles.length} test file(s)`);

  console.log();

  // Load and run tests
  const startTime = Date.now();

  try {
    // Parse and register each .feature.md file
    for (const file of testFiles) {
      const parsed = await parseFeatureFile(file);
      test(parsed.feature, parsed.platform);
    }

    // Run all registered tests
    await run();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Tests completed in ${duration}s`);
    console.log(`\nReports generated in: copilot-test-results/`);
  } catch (error) {
    console.error("\n❌ Test execution failed:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

interface RunOptions {
  tag?: string;
  filter?: string;
  env?: string;
  config?: string;
  headless?: boolean;
  parallel?: boolean;
  watch?: boolean;
  debug?: boolean;
}

function parseRunOptions(args: string[]): RunOptions {
  const options: RunOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--tag" && i + 1 < args.length) {
      options.tag = args[++i];
    } else if (arg === "--filter" && i + 1 < args.length) {
      options.filter = args[++i];
    } else if (arg === "--env" && i + 1 < args.length) {
      options.env = args[++i];
    } else if (arg === "--config" && i + 1 < args.length) {
      options.config = args[++i];
    } else if (arg === "--headless") {
      options.headless = true;
    } else if (arg === "--parallel") {
      options.parallel = true;
    } else if (arg === "--watch") {
      options.watch = true;
    } else if (arg === "--debug") {
      options.debug = true;
    }
  }

  return options;
}

async function findTestFiles(providedFiles: string[]): Promise<string[]> {
  if (providedFiles.length > 0) {
    return providedFiles.filter((file) => fs.existsSync(file));
  }

  // Find all .feature.md files in tests directory
  const testFiles: string[] = [];
  const testsDir = "tests";

  if (!fs.existsSync(testsDir)) {
    return testFiles;
  }

  const files = fs.readdirSync(testsDir);

  for (const file of files) {
    if (file.endsWith(".feature.md")) {
      testFiles.push(path.join(testsDir, file));
    }
  }

  return testFiles;
}
