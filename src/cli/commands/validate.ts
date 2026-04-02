import * as fs from "node:fs";
import { loadConfig } from "../../config-loader.js";

export async function validateCommand(args: string[]) {
  console.log("🔍 Validating configuration...\n");

  const issues: string[] = [];
  const warnings: string[] = [];

  // Check for config file
  const configFiles = ["copilot-test.config.yaml", "copilot-test.config.yml"];
  let configFile: string | null = null;

  for (const file of configFiles) {
    if (fs.existsSync(file)) {
      configFile = file;
      break;
    }
  }

  if (!configFile) {
    console.error("❌ Configuration file not found");
    console.error("\nExpected one of:");
    configFiles.forEach((f) => console.error(`  - ${f}`));
    console.error("\nRun 'copilot-test init' to create a new project");
    process.exit(1);
  }

  console.log(`✓ Configuration file found: ${configFile}`);

  // Try to load and parse the config
  try {
    await loadConfig(configFile);
    console.log("✓ Valid YAML configuration");
  } catch (error) {
    issues.push(`Configuration file has errors: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Check for tests directory
  if (!fs.existsSync("tests")) {
    warnings.push("No tests/ directory found");
  } else {
    const testFiles = fs.readdirSync("tests").filter((f) => f.endsWith(".feature.md"));
    if (testFiles.length === 0) {
      warnings.push("No test files found in tests/ directory");
    } else {
      console.log(`✓ Found ${testFiles.length} test file(s)`);
    }
  }

  // Check for package.json
  if (!fs.existsSync("package.json")) {
    warnings.push("No package.json found");
  } else {
    console.log("✓ Package.json found");

    try {
      const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));

      // Check for copilot-test dependency
      const hasDep = pkg.dependencies?.["copilot-test"] || pkg.devDependencies?.["copilot-test"];
      if (!hasDep) {
        warnings.push("copilot-test not found in dependencies");
      } else {
        console.log("✓ copilot-test dependency found");
      }
    } catch (error) {
      issues.push("package.json is not valid JSON");
    }
  }

  // Check for Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);
  if (majorVersion < 18) {
    issues.push(`Node.js version ${nodeVersion} is not supported (requires >= 18)`);
  } else {
    console.log(`✓ Node.js version: ${nodeVersion} (compatible)`);
  }

  // Check for environment variables
  const requiredEnvVars = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"];
  const hasApiKey = requiredEnvVars.some((key) => process.env[key]);

  if (!hasApiKey) {
    warnings.push("No API key environment variable set (OPENAI_API_KEY or ANTHROPIC_API_KEY)");
  }

  console.log();

  // Display warnings
  if (warnings.length > 0) {
    console.log("⚠️  Warnings:");
    warnings.forEach((w) => console.log(`   ${w}`));
    console.log();
  }

  // Display errors
  if (issues.length > 0) {
    console.log("❌ Errors:");
    issues.forEach((e) => console.log(`   ${e}`));
    console.log();
    console.log(`${issues.length} error(s) found`);
    process.exit(1);
  }

  console.log("✅ Configuration is valid!");
}
