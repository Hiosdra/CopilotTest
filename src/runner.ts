import type { Feature, CopilotTestConfig, FeatureResult, TestRun, ScenarioResult } from "./types.js";
import { CopilotTestRuntime } from "./runtime.js";
import { generateReport } from "./reporter.js";
import { cpus } from "os";

interface QueuedFeature {
  feature: Feature;
  platform: string;
  tags?: string[];
}

interface WorkerTask {
  feature: Feature;
  scenarioIndex: number;
  platform: string;
  workerId: number;
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

function getMaxWorkers(config: CopilotTestConfig): number {
  if (!config.parallel) {
    return 1;
  }

  if (config.maxWorkers === "auto" || config.maxWorkers === undefined) {
    // Default to CPU count - 1, minimum 1
    return Math.max(1, cpus().length - 1);
  }

  return Math.max(1, config.maxWorkers);
}

async function runScenarioInWorker(
  runtime: CopilotTestRuntime,
  feature: Feature,
  scenarioIndex: number,
  platform: string,
  workerId: number,
  config: CopilotTestConfig
): Promise<ScenarioResult> {
  const platformConfig = config.platforms[platform];
  const scenario = feature.scenarios[scenarioIndex];

  const timeout = config.workerTimeout ?? 300000; // Default 5 minutes

  return Promise.race([
    runtime.runScenario(feature, scenario, platformConfig),
    new Promise<ScenarioResult>((_, reject) =>
      setTimeout(() => reject(new Error(`Worker ${workerId} timeout after ${timeout}ms`)), timeout)
    ),
  ]);
}

async function runFeaturesInParallel(
  runtime: CopilotTestRuntime,
  queuedFeatures: QueuedFeature[],
  config: CopilotTestConfig
): Promise<FeatureResult[]> {
  const maxWorkers = getMaxWorkers(config);
  const featureResults: FeatureResult[] = [];

  // Create tasks for all scenarios across all features
  const tasks: WorkerTask[] = [];
  for (const queued of queuedFeatures) {
    for (let i = 0; i < queued.feature.scenarios.length; i++) {
      tasks.push({
        feature: queued.feature,
        scenarioIndex: i,
        platform: queued.platform,
        workerId: 0, // Will be assigned dynamically
      });
    }
  }

  const totalScenarios = tasks.length;
  let completedScenarios = 0;
  let failedScenarios = 0;

  // Track scenario results grouped by feature
  const scenarioResultsByFeature = new Map<string, ScenarioResult[]>();
  for (const queued of queuedFeatures) {
    scenarioResultsByFeature.set(queued.feature.name, []);
  }

  console.log(`\n⚡ Running ${totalScenarios} scenarios with ${maxWorkers} workers\n`);

  // Worker pool implementation
  const workers: Array<Promise<void>> = [];
  let taskIndex = 0;

  const processNextTask = async (workerId: number): Promise<void> => {
    while (taskIndex < tasks.length) {
      const currentIndex = taskIndex++;
      const task = tasks[currentIndex];
      task.workerId = workerId;

      const scenario = task.feature.scenarios[task.scenarioIndex];
      process.stdout.write(`[Worker ${workerId}] Starting scenario: ${scenario.name}\n`);

      try {
        const startTime = Date.now();
        const scenarioResult = await runScenarioInWorker(
          runtime,
          task.feature,
          task.scenarioIndex,
          task.platform,
          workerId,
          config
        );

        const duration = Date.now() - startTime;
        const icon = scenarioResult.status === "passed" ? "✅" : "❌";

        completedScenarios++;
        if (scenarioResult.status === "failed") {
          failedScenarios++;
        }

        console.log(
          `[Worker ${workerId}] ${icon} ${scenario.name} (${duration}ms) [${completedScenarios}/${totalScenarios}]`
        );

        // Store result
        scenarioResultsByFeature.get(task.feature.name)?.push(scenarioResult);

        // failFast: stop processing if a scenario fails
        if (config.failFast && scenarioResult.status === "failed") {
          taskIndex = tasks.length; // Stop all workers
          break;
        }
      } catch (err) {
        completedScenarios++;
        failedScenarios++;

        console.error(
          `[Worker ${workerId}] ❌ ${scenario.name} - Error: ${err instanceof Error ? err.message : String(err)}`
        );

        // Create a failed scenario result
        const failedResult: ScenarioResult = {
          scenario,
          status: "failed",
          steps: [],
          duration: 0,
        };

        scenarioResultsByFeature.get(task.feature.name)?.push(failedResult);

        if (config.failFast) {
          taskIndex = tasks.length;
          break;
        }
      }
    }
  };

  // Start workers
  for (let i = 0; i < maxWorkers; i++) {
    workers.push(processNextTask(i));
  }

  // Wait for all workers to complete
  await Promise.all(workers);

  console.log(`\n✨ Parallel execution complete: ${completedScenarios - failedScenarios} passed, ${failedScenarios} failed\n`);

  // Reconstruct feature results
  for (const queued of queuedFeatures) {
    const scenarios = scenarioResultsByFeature.get(queued.feature.name) ?? [];

    // Sort scenarios to maintain original order
    scenarios.sort((a, b) => {
      const aIndex = queued.feature.scenarios.findIndex(s => s.name === a.scenario.name);
      const bIndex = queued.feature.scenarios.findIndex(s => s.name === b.scenario.name);
      return aIndex - bIndex;
    });

    const totalDuration = scenarios.reduce((sum, s) => sum + s.duration, 0);

    featureResults.push({
      feature: queued.feature,
      scenarios,
      duration: totalDuration,
    });
  }

  return featureResults;
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
    // Use parallel execution if enabled
    if (config.parallel) {
      testRun.features = await runFeaturesInParallel(runtime, queue, config);
    } else {
      // Sequential execution (original behavior)
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
        }
      }
    }

    // Compute summary from all features
    for (const featureResult of testRun.features) {
      for (const scenarioResult of featureResult.scenarios) {
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
