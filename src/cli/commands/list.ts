import * as fs from "node:fs";
import * as path from "node:path";

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
      // Parse the file to extract features
      const content = fs.readFileSync(file, "utf-8");
      const features = parseFeatures(content);

      if (features.length > 0) {
        totalFeatures += features.length;

        for (const feature of features) {
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
        }
      }
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
    if (file.endsWith(".spec.ts") || file.endsWith(".spec.js")) {
      testFiles.push(path.join(testsDir, file));
    }
  }

  return testFiles;
}

function parseFeatures(content: string): Array<{ name: string; tags: string[]; scenarios: Array<{ name: string; tags: string[] }> }> {
  const features: Array<{ name: string; tags: string[]; scenarios: Array<{ name: string; tags: string[] }> }> = [];

  let currentFeature: { name: string; tags: string[]; scenarios: Array<{ name: string; tags: string[] }> } | null = null;
  let currentScenario: { name: string; tags: string[] } | null = null;

  // Split into lines for simpler parsing
  const lines = content.split("\n");
  let inFeature = false;
  let inScenario = false;

  for (const line of lines) {
    // Check for feature declaration
    const featureMatch = line.match(/feature\(['"](.*?)['"]\)/);
    if (featureMatch) {
      if (currentFeature && currentScenario) {
        currentFeature.scenarios.push(currentScenario);
        currentScenario = null;
      }
      if (currentFeature) {
        features.push(currentFeature);
      }
      currentFeature = { name: featureMatch[1], tags: [], scenarios: [] };
      inFeature = true;
      inScenario = false;
    }

    // Check for scenario
    const scenarioMatch = line.match(/\.scenario\(['"](.*?)['"]\)/);
    if (scenarioMatch && currentFeature) {
      if (currentScenario) {
        currentFeature.scenarios.push(currentScenario);
      }
      currentScenario = { name: scenarioMatch[1], tags: [] };
      inScenario = true;
    }

    // Check for tags
    const tagMatch = line.match(/\.tag\(['"](.*?)['"]\)/);
    if (tagMatch) {
      if (inScenario && currentScenario) {
        currentScenario.tags.push(tagMatch[1]);
      } else if (inFeature && currentFeature && !inScenario) {
        currentFeature.tags.push(tagMatch[1]);
      }
    }

    // Check for done() - end of scenario
    if (line.includes(".done()") && currentFeature && currentScenario) {
      currentFeature.scenarios.push(currentScenario);
      currentScenario = null;
      inScenario = false;
    }
  }

  // Add last feature
  if (currentFeature) {
    if (currentScenario) {
      currentFeature.scenarios.push(currentScenario);
    }
    features.push(currentFeature);
  }

  return features;
}
