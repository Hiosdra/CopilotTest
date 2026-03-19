#!/usr/bin/env node

import { compareTestRuns } from "./compare.js";

const args = process.argv.slice(2);

if (args.length < 4 || !args.includes("--baseline") || !args.includes("--current")) {
  console.error(`
Usage: copilot-test-compare --baseline <path> --current <path> [--output <path>]

Compare two test run JSON files and generate a comparison report.

Options:
  --baseline <path>  Path to baseline test run JSON file
  --current <path>   Path to current test run JSON file
  --output <path>    Optional path to output HTML comparison report

Example:
  copilot-test-compare \\
    --baseline copilot-test-results/runs/2024-01-15-10-30.json \\
    --current copilot-test-results/runs/2024-01-15-14-20.json \\
    --output comparison.html
`);
  process.exit(1);
}

const baselineIdx = args.indexOf("--baseline");
const currentIdx = args.indexOf("--current");
const outputIdx = args.indexOf("--output");

const baselinePath = args[baselineIdx + 1];
const currentPath = args[currentIdx + 1];
const outputPath = outputIdx >= 0 ? args[outputIdx + 1] : "comparison.html";

console.log("🔍 Comparing test runs...\n");
console.log(`  Baseline: ${baselinePath}`);
console.log(`  Current:  ${currentPath}`);
console.log(`  Output:   ${outputPath}\n`);

try {
  const result = await compareTestRuns(baselinePath, currentPath, outputPath);

  console.log("📊 Comparison Results:\n");
  console.log(`  Improvements:     ${result.changes.improved.length}`);
  console.log(`  Regressions:      ${result.changes.regressed.length}`);
  console.log(`  New Scenarios:    ${result.changes.newScenarios.length}`);
  console.log(`  Removed Scenarios: ${result.changes.removedScenarios.length}`);
  console.log(`  Duration Change:  ${result.performance.durationChange}\n`);

  if (result.changes.regressed.length > 0) {
    console.log("❌ Regressions detected:");
    result.changes.regressed.forEach(r => {
      console.log(`   - ${r.name}`);
    });
    console.log();
  }

  if (result.changes.improved.length > 0) {
    console.log("✅ Improvements:");
    result.changes.improved.forEach(i => {
      console.log(`   - ${i.name}`);
    });
    console.log();
  }

  console.log(`✓ Comparison report saved to: ${outputPath}\n`);

  // Exit with non-zero if there are regressions
  if (result.changes.regressed.length > 0) {
    process.exit(1);
  }
} catch (error) {
  console.error("Error comparing test runs:", error instanceof Error ? error.message : String(error));
  process.exit(1);
}
