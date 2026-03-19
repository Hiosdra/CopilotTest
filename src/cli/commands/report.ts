import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { compareTestRuns } from "../../compare.js";

export async function reportCommand(args: string[]) {
  const subcommand = args[0];

  if (!subcommand || subcommand === "open") {
    await openReport(args);
  } else if (subcommand === "compare") {
    await compareReports(args.slice(1));
  } else if (subcommand.endsWith(".json")) {
    // Generate HTML report from JSON file
    await generateFromJson(subcommand);
  } else {
    console.error("Invalid report command");
    console.error("\nUsage:");
    console.error("  copilot-test report                  # Open latest report");
    console.error("  copilot-test report open             # Open latest report");
    console.error("  copilot-test report <file.json>      # Generate report from JSON");
    console.error("  copilot-test report compare --baseline <file> --current <file>");
    process.exit(1);
  }
}

async function openReport(args: string[]) {
  const outputDir = "copilot-test-results";

  if (!fs.existsSync(outputDir)) {
    console.error("❌ No reports found");
    console.error("Run 'copilot-test run' to generate reports");
    process.exit(1);
  }

  const reportPath = path.join(outputDir, "index.html");

  if (!fs.existsSync(reportPath)) {
    console.error("❌ No reports found");
    console.error("Run 'copilot-test run' to generate reports");
    process.exit(1);
  }

  console.log(`📊 Opening report: ${reportPath}`);

  // Try to open the report in the default browser
  try {
    let command: string;
    let args: string[];

    if (process.platform === "darwin") {
      command = "open";
      args = [reportPath];
    } else if (process.platform === "win32") {
      command = "cmd";
      args = ["/c", "start", "", reportPath];
    } else {
      command = "xdg-open";
      args = [reportPath];
    }

    execSync(`${command} ${args.map((a) => `"${a}"`).join(" ")}`, { stdio: "ignore" });
    console.log("✅ Report opened in browser");
  } catch (error) {
    console.log(`\nPlease open manually: ${path.resolve(reportPath)}`);
  }
}

async function generateFromJson(jsonFile: string) {
  if (!fs.existsSync(jsonFile)) {
    console.error(`❌ File not found: ${jsonFile}`);
    process.exit(1);
  }

  console.log("📄 Generating HTML report from JSON...");
  console.log(`  Input: ${jsonFile}`);

  // Read and parse JSON
  try {
    const jsonContent = fs.readFileSync(jsonFile, "utf-8");
    JSON.parse(jsonContent); // Validate JSON

    console.log("✅ JSON file is valid");
    console.log("\nNote: HTML report generation from standalone JSON");
    console.log("      is typically handled by the test runner.");
    console.log("\nYou can view the JSON file directly or run the tests again.");
  } catch (error) {
    console.error("❌ Invalid JSON file");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function compareReports(args: string[]) {
  const baselineIdx = args.indexOf("--baseline");
  const currentIdx = args.indexOf("--current");
  const outputIdx = args.indexOf("--output");

  if (baselineIdx === -1 || currentIdx === -1) {
    console.error("❌ Missing required arguments");
    console.error("\nUsage:");
    console.error("  copilot-test report compare \\");
    console.error("    --baseline <baseline.json> \\");
    console.error("    --current <current.json> \\");
    console.error("    [--output <comparison.html>]");
    process.exit(1);
  }

  const baselinePath = args[baselineIdx + 1];
  const currentPath = args[currentIdx + 1];
  const outputPath = outputIdx >= 0 ? args[outputIdx + 1] : "comparison.html";

  if (!baselinePath || baselinePath.startsWith("--")) {
    console.error("❌ --baseline requires a file path");
    process.exit(1);
  }

  if (!currentPath || currentPath.startsWith("--")) {
    console.error("❌ --current requires a file path");
    process.exit(1);
  }

  if (outputIdx >= 0 && (!outputPath || outputPath.startsWith("--"))) {
    console.error("❌ --output requires a file path");
    process.exit(1);
  }

  console.log("🔍 Comparing test runs...\n");
  console.log(`  Baseline: ${baselinePath}`);
  console.log(`  Current:  ${currentPath}`);
  console.log(`  Output:   ${outputPath}\n`);

  try {
    const result = await compareTestRuns(baselinePath, currentPath, outputPath);

    console.log("📊 Comparison Results:\n");
    console.log(`  Improvements:      ${result.changes.improved.length}`);
    console.log(`  Regressions:       ${result.changes.regressed.length}`);
    console.log(`  New Scenarios:     ${result.changes.newScenarios.length}`);
    console.log(`  Removed Scenarios: ${result.changes.removedScenarios.length}`);
    console.log(`  Duration Change:   ${result.performance.durationChange}\n`);

    if (result.changes.regressed.length > 0) {
      console.log("❌ Regressions detected:");
      result.changes.regressed.forEach((r) => {
        console.log(`   - ${r.name}`);
      });
      console.log();
    }

    if (result.changes.improved.length > 0) {
      console.log("✅ Improvements:");
      result.changes.improved.forEach((i) => {
        console.log(`   - ${i.name}`);
      });
      console.log();
    }

    console.log(`✅ Comparison report saved to: ${outputPath}\n`);

    // Exit with non-zero if there are regressions
    if (result.changes.regressed.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error comparing test runs:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
