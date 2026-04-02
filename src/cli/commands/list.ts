import * as fs from "node:fs";
import * as path from "node:path";
import { parseFeatureMarkdown } from "../../markdown-parser.js";

export async function listCommand(args: string[]) {
  console.log("📋 Listing tests...\n");

  // Find test files
  const testFiles = await findTestFiles();

  if (testFiles.length === 0) {
    console.log("No test files found in tests/ directory");
    console.log("\nRun 'copilot-test create test' to create a new test");
    return;
  }

  let totalFeatures = 0;
  let totalScenarios = 0;

  for (const file of testFiles) {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const parsed = parseFeatureMarkdown(content);
      const feature = parsed.feature;

      totalFeatures++;

      console.log(`Feature: ${feature.name} (${path.relative(process.cwd(), file)})`);

      if (feature.tags && feature.tags.length > 0) {
        console.log(`  Tags: ${feature.tags.join(", ")}`);
      }

      for (const scenario of feature.scenarios) {
        totalScenarios++;
        const scenarioTags = scenario.tags && scenario.tags.length > 0 ? ` [${scenario.tags.join(", ")}]` : "";
        console.log(`  ✓ Scenario: ${scenario.name}${scenarioTags}`);
      }

      console.log();
    } catch (error) {
      console.error(`Error parsing ${file}:`, error instanceof Error ? error.message : String(error));
    }
  }

  console.log(`Total: ${totalFeatures} feature(s), ${totalScenarios} scenario(s)`);
}

async function findTestFiles(): Promise<string[]> {
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
