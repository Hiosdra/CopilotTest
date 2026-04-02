#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { initCommand } from "./commands/init.js";
import { runCommand } from "./commands/run.js";
import { reportCommand } from "./commands/report.js";
import { listCommand } from "./commands/list.js";
import { validateCommand } from "./commands/validate.js";
import { createCommand } from "./commands/create.js";
import { doctorCommand } from "./commands/doctor.js";
import { configCommand } from "./commands/config.js";

// Read version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "../../../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
const VERSION = packageJson.version;

function showHelp() {
  console.log(`
Usage: copilot-test <command> [options]

Commands:
  init              Initialize new project
  run [files]       Run tests
  list              List all tests
  report [file]     Generate or view reports
  create <type>     Create new test file
  validate          Validate configuration
  doctor            System health check
  config            Manage configuration

Options:
  -v, --version     Show version
  -h, --help        Show help
  --env <name>      Environment to use
  --tag <tag>       Filter by tag
  --parallel        Run in parallel
  --headless        Run headless browser
  --watch           Watch for changes
  --debug           Enable debug output

Examples:
  copilot-test init
  copilot-test run tests/login.feature.md
  copilot-test run --tag=@smoke --parallel
  copilot-test run --env=staging --parallel
  copilot-test report compare --baseline run-1.json --current run-2.json

Documentation: https://github.com/copilot-test/copilot-test
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(0);
  }

  if (args.includes("--version") || args.includes("-v")) {
    console.log(`copilot-test v${VERSION}`);
    process.exit(0);
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  try {
    switch (command) {
      case "init":
        await initCommand(commandArgs);
        break;
      case "run":
        await runCommand(commandArgs);
        break;
      case "report":
        await reportCommand(commandArgs);
        break;
      case "list":
        await listCommand(commandArgs);
        break;
      case "validate":
        await validateCommand(commandArgs);
        break;
      case "create":
        await createCommand(commandArgs);
        break;
      case "doctor":
        await doctorCommand(commandArgs);
        break;
      case "config":
        await configCommand(commandArgs);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error("Run 'copilot-test --help' for usage information");
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
