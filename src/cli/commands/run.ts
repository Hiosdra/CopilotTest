import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { TestRunner } from "../../runner.js";
import { spinner } from "../utils/spinner.js";

interface RunOptions {
  tag?: string;
  filter?: string;
  env?: string;
  headless?: boolean;
  parallel?: boolean;
  watch?: boolean;
  debug?: boolean;
}

export async function runCommand(args: string[]) {
  const options = parseRunOptions(args);
  const files = args.filter((arg) => !arg.startsWith("--") && !arg.startsWith("-"));

  // Load configuration
  spinner.start("Loading configuration");
  const configLoaded = await loadConfig();
  if (!configLoaded) {
    spinner.fail("Configuration file not found");
    console.error("\nRun 'copilot-test init' to create a new project");
    process.exit(1);
  }
  spinner.succeed("Configuration loaded");

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
    // Import test files
    for (const file of testFiles) {
      await import(pathToFileURL(path.resolve(file)).href);
    }

    // Run tests
    const runner = new TestRunner();
    await runner.run();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Tests completed in ${duration}s`);
    console.log(`\nReports generated in: copilot-test-results/`);

  } catch (error) {
    console.error("\n❌ Test execution failed:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
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
      process.env.ENVIRONMENT = options.env;
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

async function loadConfig(): Promise<boolean> {
  const configFiles = ["copilot-test.config.ts", "copilot-test.config.js"];

  for (const configFile of configFiles) {
    if (fs.existsSync(configFile)) {
      try {
        await import(pathToFileURL(path.resolve(configFile)).href);
        return true;
      } catch (error) {
        console.error(`Error loading ${configFile}:`, error);
        return false;
      }
    }
  }

  return false;
}

async function findTestFiles(providedFiles: string[]): Promise<string[]> {
  if (providedFiles.length > 0) {
    // Use provided files
    return providedFiles.filter((file) => fs.existsSync(file));
  }

  // Find all test files in tests directory
  const testFiles: string[] = [];
  const testsDir = "tests";

  if (!fs.existsSync(testsDir)) {
    return testFiles;
  }

  const files = fs.readdirSync(testsDir);

  for (const file of files) {
    if (file.endsWith(".spec.ts") || file.endsWith(".spec.js")) {
      testFiles.push(path.join(testsDir, file));
    }
  }

  return testFiles;
}
