import * as fs from "node:fs";
import { execSync } from "node:child_process";

export async function doctorCommand(args: string[]) {
  console.log("🏥 Copilot Test Health Check\n");
  console.log("=".repeat(50));
  console.log();

  const issues: string[] = [];
  const warnings: string[] = [];

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

  if (majorVersion >= 18) {
    console.log(`✓ Node.js version: ${nodeVersion} (compatible)`);
  } else {
    issues.push(`Node.js version ${nodeVersion} is not supported`);
    console.log(`✗ Node.js version: ${nodeVersion} (requires >= 18)`);
  }

  // Check TypeScript
  try {
    const tsVersion = execSync("npx tsc --version", { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
    console.log(`✓ TypeScript installed: ${tsVersion}`);
  } catch (error) {
    warnings.push("TypeScript not found");
    console.log("⚠ TypeScript not found");
  }

  // Check package.json
  if (fs.existsSync("package.json")) {
    console.log("✓ Package.json found");

    try {
      const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));

      // Check for copilot-test
      const hasCopilotTest = pkg.dependencies?.["copilot-test"] || pkg.devDependencies?.["copilot-test"];
      if (hasCopilotTest) {
        console.log("✓ copilot-test dependency found");
      } else {
        warnings.push("copilot-test not found in dependencies");
        console.log("⚠ copilot-test not in dependencies");
        console.log("  Run: npm install copilot-test");
      }

      // Check for Playwright
      const hasPlaywright = pkg.dependencies?.["@playwright/mcp"] || pkg.devDependencies?.["@playwright/mcp"];
      if (hasPlaywright) {
        console.log("✓ @playwright/mcp found");
      } else {
        warnings.push("@playwright/mcp not installed");
        console.log("⚠ @playwright/mcp not installed");
        console.log("  Run: npm install @playwright/mcp");
      }

      // Check for Copilot SDK
      const hasCopilotSdk = pkg.dependencies?.["@github/copilot-sdk"] || pkg.devDependencies?.["@github/copilot-sdk"];
      if (hasCopilotSdk) {
        console.log("✓ @github/copilot-sdk found");
      } else {
        warnings.push("@github/copilot-sdk not installed");
        console.log("⚠ @github/copilot-sdk not installed");
        console.log("  Run: npm install @github/copilot-sdk");
      }
    } catch (error) {
      issues.push("package.json is not valid JSON");
      console.log("✗ package.json is not valid JSON");
    }
  } else {
    warnings.push("package.json not found");
    console.log("⚠ package.json not found");
  }

  // Check config file
  const configFiles = ["copilot-test.config.ts", "copilot-test.config.js"];
  let configFound = false;

  for (const configFile of configFiles) {
    if (fs.existsSync(configFile)) {
      console.log(`✓ Config file found: ${configFile}`);
      configFound = true;
      break;
    }
  }

  if (!configFound) {
    warnings.push("Config file not found");
    console.log("⚠ Config file not found");
    console.log("  Run: copilot-test init");
  }

  // Check for tests directory
  if (fs.existsSync("tests")) {
    const testFiles = fs.readdirSync("tests").filter((f) => f.endsWith(".spec.ts") || f.endsWith(".spec.js"));
    if (testFiles.length > 0) {
      console.log(`✓ Found ${testFiles.length} test file(s)`);
    } else {
      warnings.push("No test files found");
      console.log("⚠ No test files in tests/ directory");
    }
  } else {
    warnings.push("tests/ directory not found");
    console.log("⚠ tests/ directory not found");
  }

  // Check API keys
  const apiKeys = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "AZURE_OPENAI_API_KEY"];
  const foundKeys = apiKeys.filter((key) => process.env[key]);

  if (foundKeys.length > 0) {
    console.log(`✓ API key(s) found: ${foundKeys.join(", ")}`);
  } else {
    issues.push("No API key environment variable set");
    console.log("✗ No API key set");
    console.log("  Set one of: OPENAI_API_KEY, ANTHROPIC_API_KEY, AZURE_OPENAI_API_KEY");
  }

  // Summary
  console.log();
  console.log("=".repeat(50));
  console.log();

  const totalIssues = issues.length + warnings.length;

  if (totalIssues === 0) {
    console.log("✅ All checks passed! Your environment is ready.");
  } else {
    console.log(`${totalIssues} issue(s) found (${issues.length} error(s), ${warnings.length} warning(s))`);

    if (issues.length > 0) {
      console.log("\n❌ Errors:");
      issues.forEach((issue) => console.log(`   - ${issue}`));
    }

    if (warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      warnings.forEach((warning) => console.log(`   - ${warning}`));
    }

    if (issues.length > 0) {
      process.exit(1);
    }
  }
}
