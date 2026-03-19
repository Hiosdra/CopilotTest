import type { Feature, CopilotTestConfig, FeatureResult, TestRun } from "./types.js";
import { CopilotTestRuntime } from "./runtime.js";
import { generateReport } from "./reporter.js";

interface QueuedFeature {
  feature: Feature;
  platform: string;
  tags?: string[];
}

let globalConfig: CopilotTestConfig | null = null;
const queue: QueuedFeature[] = [];

export function configure(config: CopilotTestConfig): void {
  globalConfig = config;
}

export function test(
  featureOrBuilder: Feature | { _build(): Feature },
  platform: string
): void {
  const feat =
    "_build" in featureOrBuilder
      ? featureOrBuilder._build()
      : featureOrBuilder;
  queue.push({ feature: feat, platform });
}

export function testOnly(
  featureOrBuilder: Feature | { _build(): Feature },
  platform: string,
  tags: string[]
): void {
  const feat =
    "_build" in featureOrBuilder
      ? featureOrBuilder._build()
      : featureOrBuilder;

  const filtered = {
    ...feat,
    scenarios: feat.scenarios.filter((s) =>
      tags.some((tag) => s.tags.includes(tag) || feat.tags.includes(tag))
    ),
  };

  queue.push({ feature: filtered, platform, tags });
}

export async function run(): Promise<TestRun> {
  if (!globalConfig) {
    throw new Error("No config set. Call configure() before run().");
  }

  const config = globalConfig;
  const runtime = new CopilotTestRuntime(config);
  await runtime.start();

  const testRun: TestRun = {
    startedAt: new Date(),
    features: [],
    summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
  };

  console.log("\n🧪 CopilotTest — AI-Driven BDD Testing Framework\n");
  console.log("=".repeat(60));

  try {
    for (const queued of queue) {
      const { feature, platform } = queued;
      console.log(`\n📋 Feature: ${feature.name}`);

      let featureResult: FeatureResult;
      try {
        featureResult = await runtime.runFeature(feature, platform);
      } catch (err) {
        console.error(`  ❌ Feature failed: ${err instanceof Error ? err.message : String(err)}`);
        continue;
      }

      testRun.features.push(featureResult);

      for (const scenarioResult of featureResult.scenarios) {
        const icon = scenarioResult.status === "passed" ? "✅" : "❌";
        console.log(
          `  ${icon} Scenario: ${scenarioResult.scenario.name} (${scenarioResult.duration}ms)`
        );

        for (const stepResult of scenarioResult.steps) {
          const stepIcon =
            stepResult.status === "passed"
              ? "  ✔"
              : stepResult.status === "failed"
              ? "  ✘"
              : "  ⊘";
          console.log(
            `    ${stepIcon} ${stepResult.step.keyword} ${stepResult.step.text} (${stepResult.duration}ms)`
          );

          if (stepResult.error) {
            console.log(`       💬 ${stepResult.error}`);
          }
        }

        testRun.summary.total++;
        if (scenarioResult.status === "passed") {
          testRun.summary.passed++;
        } else if (scenarioResult.status === "failed") {
          testRun.summary.failed++;
        } else {
          testRun.summary.skipped++;
        }
      }
    }
  } finally {
    await runtime.stop();
  }

  testRun.finishedAt = new Date();
  const duration = testRun.finishedAt.getTime() - testRun.startedAt.getTime();

  console.log("\n" + "=".repeat(60));
  console.log(`\n📊 Results:`);
  console.log(`  Total:   ${testRun.summary.total}`);
  console.log(`  Passed:  ${testRun.summary.passed} ✅`);
  console.log(`  Failed:  ${testRun.summary.failed} ❌`);
  console.log(`  Skipped: ${testRun.summary.skipped} ⊘`);
  console.log(
    `  Pass rate: ${
      testRun.summary.total > 0
        ? Math.round((testRun.summary.passed / testRun.summary.total) * 100)
        : 0
    }%`
  );
  console.log(`  Duration: ${duration}ms\n`);

  const outputDir = config.outputDir ?? "copilot-test-results";
  await generateReport(testRun, outputDir);
  console.log(`📁 Report saved to: ${outputDir}/\n`);

  // Clear queue for next run
  queue.length = 0;

  return testRun;
}
