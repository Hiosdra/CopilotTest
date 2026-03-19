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
  queueIndex: number; // Track which queued feature this belongs to
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
  if (!platformConfig) {
    throw new Error(`Platform "${platform}" not found in config`);
  }

  const scenario = feature.scenarios[scenarioIndex];
  const timeout = config.workerTimeout ?? 300000; // Default 5 minutes

  let timeoutId: NodeJS.Timeout | null = null;
  let scenarioPromise: Promise<ScenarioResult> | null = null;

  try {
    scenarioPromise = runtime.runScenario(feature, scenario, platformConfig);

    const timeoutPromise = new Promise<ScenarioResult>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Worker ${workerId} timeout after ${timeout}ms`));
      }, timeout);
    });

    const result = await Promise.race([scenarioPromise, timeoutPromise]);

    // Clear timeout on success
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    return result;
  } catch (err) {
    // Clear timeout on error
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    throw err;
  }
}

async function runFeaturesInParallel(
  runtime: CopilotTestRuntime,
  queuedFeatures: QueuedFeature[],
  config: CopilotTestConfig
): Promise<FeatureResult[]> {
  const maxWorkers = getMaxWorkers(config);

  // Pre-allocate results array for each queued feature to maintain order
  const scenarioResultsByQueue: ScenarioResult[][] = queuedFeatures.map(
    queued => new Array(queued.feature.scenarios.length)
  );

  // Create tasks for all scenarios across all features
  const tasks: WorkerTask[] = [];
  for (let queueIndex = 0; queueIndex < queuedFeatures.length; queueIndex++) {
    const queued = queuedFeatures[queueIndex];
    for (let scenarioIndex = 0; scenarioIndex < queued.feature.scenarios.length; scenarioIndex++) {
      tasks.push({
        feature: queued.feature,
        scenarioIndex,
        platform: queued.platform,
        workerId: 0, // Will be assigned dynamically
        queueIndex,
      });
    }
  }

  const totalScenarios = tasks.length;
  let completedScenarios = 0;
  let failedScenarios = 0;

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

        // Store result at correct index to maintain order
        scenarioResultsByQueue[task.queueIndex][task.scenarioIndex] = scenarioResult;

        // failFast: stop processing if a scenario fails
        if (config.failFast && scenarioResult.status === "failed") {
          taskIndex = tasks.length; // Stop all workers
          break;
        }
      } catch (err) {
        completedScenarios++;
        failedScenarios++;

        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(
          `[Worker ${workerId}] ❌ ${scenario.name} - Error: ${errorMsg}`
        );

        // Create a failed scenario result with proper step information
        const allSteps = [
          ...(task.feature.background ?? []),
          ...scenario.steps,
        ];

        const failedSteps = allSteps.map((step, idx) => ({
          step,
          status: idx === 0 ? ("failed" as const) : ("skipped" as const),
          duration: idx === 0 ? 0 : 0,
          error: idx === 0 ? errorMsg : undefined,
        }));

        const failedResult: ScenarioResult = {
          scenario,
          status: "failed",
          steps: failedSteps,
          duration: 0,
        };

        scenarioResultsByQueue[task.queueIndex][task.scenarioIndex] = failedResult;

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

  // Construct feature results from pre-ordered arrays
  const featureResults: FeatureResult[] = [];
  for (let queueIndex = 0; queueIndex < queuedFeatures.length; queueIndex++) {
    const queued = queuedFeatures[queueIndex];
    const scenarios = scenarioResultsByQueue[queueIndex];
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

  const startDate = new Date();
  const testRun: TestRun = {
    startedAt: startDate,
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

  // Add metadata
  testRun.metadata = {
    timestamp: testRun.startedAt.toISOString(),
    duration,
    environment: process.env.NODE_ENV || process.env.ENVIRONMENT,
    git: {
      branch: process.env.GITHUB_REF_NAME || process.env.GIT_BRANCH,
      commit: process.env.GITHUB_SHA || process.env.GIT_COMMIT,
      author: process.env.GITHUB_ACTOR || process.env.GIT_AUTHOR,
    },
    ci: {
      buildNumber: process.env.GITHUB_RUN_NUMBER || process.env.BUILD_NUMBER,
      jobUrl: process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : process.env.BUILD_URL,
    },
  };

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
