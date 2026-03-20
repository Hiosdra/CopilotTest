import type { Feature, CopilotTestConfig, FeatureResult, TestRun, ScenarioResult } from "./types.js";
import { CopilotTestRuntime } from "./runtime.js";
import { generateReport } from "./reporter.js";
import { generatePerformanceReport } from "./performance.js";
import { cpus } from "os";

/**
 * Represents a feature queued for test execution along with its platform and optional tag filters.
 */
interface TestFeature {
  feature: Feature;
  platform: string;
  tags?: string[];
}

/**
 * Represents a scenario task for parallel execution in the worker pool.
 */
interface ParallelScenarioTask {
  feature: Feature;
  scenarioIndex: number;
  platform: string;
  workerId: number;
  queueIndex: number; // Track which queued feature this belongs to
}

/**
 * TestRunner manages test configuration and execution queue.
 * Replaces global state with instance state for better testability and concurrent usage.
 */
class TestRunner {
  private config: CopilotTestConfig | null = null;
  private queue: TestFeature[] = [];

  configure(config: CopilotTestConfig): void {
    this.config = config;
  }

  test(featureOrBuilder: Feature | { _build(): Feature }, platform: string): void {
    const feat =
      "_build" in featureOrBuilder
        ? featureOrBuilder._build()
        : featureOrBuilder;
    this.queue.push({ feature: feat, platform });
  }

  testOnly(
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

    this.queue.push({ feature: filtered, platform, tags });
  }

  getConfig(): CopilotTestConfig | null {
    return this.config;
  }

  getQueue(): TestFeature[] {
    return this.queue;
  }

  clearQueue(): void {
    this.queue.length = 0;
  }

  /**
   * Execute all queued tests with this runner's configuration.
   * Enables multiple concurrent test runners with independent state.
   * @returns Test run results
   */
  async run(): Promise<TestRun> {
    if (!this.config) {
      throw new Error("No config set. Call configure() before run().");
    }

    const runtime = new CopilotTestRuntime(this.config);
    await runtime.start();

    const startDate = new Date();
    const testRun: TestRun = {
      startedAt: startDate,
      features: [],
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
    };

    console.log("\n🧪 CopilotTest — AI-Driven BDD Testing Framework\n");
    console.log("=".repeat(60));

    // Trigger onTestRunStart hooks
    await runtime.triggerTestRunStart();

    try {
      // Use parallel execution if enabled
      if (this.config.parallel) {
        testRun.features = await runFeaturesInParallel(runtime, this.queue, this.config);
      } else {
        // Sequential execution (original behavior)
        for (const queued of this.queue) {
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

              // Add retry indicator if step was retried
              const retryInfo = stepResult.retryCount && stepResult.retryCount > 0
                ? ` ⚠️ (retried ${stepResult.retryCount}x)`
                : "";

              console.log(
                `    ${stepIcon} ${stepResult.step.keyword} ${stepResult.step.text} (${stepResult.duration}ms)${retryInfo}`
              );

              if (stepResult.error) {
                console.log(`       💬 ${stepResult.error}`);
              }

              // Show retry attempts only if retries actually occurred
              if (stepResult.retryCount && stepResult.retryCount > 0 && stepResult.retryAttempts) {
                for (const attempt of stepResult.retryAttempts) {
                  let attemptIcon: string;
                  switch (attempt.status) {
                    case "passed":
                      attemptIcon = "✓";
                      break;
                    case "failed":
                      attemptIcon = "✗";
                      break;
                    case "skipped":
                      attemptIcon = "⊘";
                      break;
                    case "pending":
                      attemptIcon = "…";
                      break;
                    default:
                      attemptIcon = "?";
                      break;
                  }
                  console.log(
                    `       ${attemptIcon} Attempt ${attempt.attemptNumber}: ${attempt.status} (${attempt.duration}ms)`
                  );
                }
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

    // Print performance report if enabled
    if (this.config.performance) {
      console.log(generatePerformanceReport(testRun));
    }

    const outputDir = this.config.outputDir ?? "copilot-test-results";
    await generateReport(testRun, outputDir);
    console.log(`📁 Report saved to: ${outputDir}/\n`);

    // Trigger onTestRunEnd hooks
    await runtime.triggerTestRunEnd(testRun);

    // Clear queue for next run
    this.clearQueue();

    return testRun;
  }
}

// Singleton instance for backwards compatibility with existing API
const defaultRunner = new TestRunner();

/**
 * Configure the test framework with platform settings, model configuration, and test options.
 *
 * This function sets up the global test configuration that will be used for all test runs.
 * It should be called before defining any tests with `test()` or `testOnly()`.
 *
 * @example
 * Basic configuration with web platform:
 * ```typescript
 * configure({
 *   model: 'gpt-4o',
 *   stepTimeout: 30000,
 *   platforms: {
 *     web: webPlatform({ headless: true }),
 *   },
 * });
 * ```
 *
 * @example
 * Multi-platform configuration:
 * ```typescript
 * configure({
 *   model: 'gpt-4o',
 *   platforms: {
 *     web: webPlatform({ headless: false }),
 *     api: apiPlatform({ baseUrl: 'https://api.example.com' }),
 *     mobile: mobilePlatform({ device: 'Pixel_5' }),
 *   },
 *   retries: 2,
 *   screenshotOnFailure: true,
 * });
 * ```
 *
 * @example
 * Parallel execution with debug mode:
 * ```typescript
 * configure({
 *   model: 'gpt-4o',
 *   platforms: { web: webPlatform() },
 *   parallel: true,
 *   maxWorkers: 4,
 *   debugMode: true,
 *   breakpoints: ['click the login button'],
 * });
 * ```
 *
 * @param config - Test configuration options
 * @param config.model - AI model to use (default: 'gpt-4o')
 * @param config.platforms - Platform configurations (web, api, mobile, desktop)
 * @param config.stepTimeout - Timeout per step in milliseconds (default: 30000)
 * @param config.retries - Number of retries for failed scenarios (default: 0)
 * @param config.parallel - Enable parallel scenario execution (default: false)
 * @param config.maxWorkers - Number of parallel workers or 'auto' for CPU-based (default: 'auto')
 * @param config.debugMode - Enable global debug mode (default: false)
 * @param config.breakpoints - Step text patterns to break on in debug mode
 */
export function configure(config: CopilotTestConfig): void {
  defaultRunner.configure(config);
}

export function test(
  featureOrBuilder: Feature | { _build(): Feature },
  platform: string
): void {
  defaultRunner.test(featureOrBuilder, platform);
}

export function testOnly(
  featureOrBuilder: Feature | { _build(): Feature },
  platform: string,
  tags: string[]
): void {
  defaultRunner.testOnly(featureOrBuilder, platform, tags);
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
  testFeatures: TestFeature[],
  config: CopilotTestConfig
): Promise<FeatureResult[]> {
  const maxWorkers = getMaxWorkers(config);

  // Pre-allocate results array for each queued feature to maintain order
  const scenarioResultsByQueue: ScenarioResult[][] = testFeatures.map(
    testFeature => new Array(testFeature.feature.scenarios.length)
  );

  // Create tasks for all scenarios across all features
  const tasks: ParallelScenarioTask[] = [];
  for (let queueIndex = 0; queueIndex < testFeatures.length; queueIndex++) {
    const testFeature = testFeatures[queueIndex];
    for (let scenarioIndex = 0; scenarioIndex < testFeature.feature.scenarios.length; scenarioIndex++) {
      tasks.push({
        feature: testFeature.feature,
        scenarioIndex,
        platform: testFeature.platform,
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
  for (let queueIndex = 0; queueIndex < testFeatures.length; queueIndex++) {
    const testFeature = testFeatures[queueIndex];
    const scenariosForQueue = scenarioResultsByQueue[queueIndex] || [];
    // Filter out undefined entries (can happen when failFast aborts remaining tasks)
    const scenarios = scenariosForQueue.filter(
      (s): s is ScenarioResult => s != null
    );
    const totalDuration = scenarios.reduce((sum, s) => sum + s.duration, 0);

    featureResults.push({
      feature: testFeature.feature,
      scenarios,
      duration: totalDuration,
    });
  }

  return featureResults;
}

export async function run(): Promise<TestRun> {
  return defaultRunner.run();
}

/**
 * Export TestRunner class for advanced use cases (testing, library usage, multiple concurrent runs)
 */
export { TestRunner };

/**
 * Get the current environment name from environment variables.
 * Used for reporting and configuration.
 */
export function getEnvironment(): string | undefined {
  return process.env.NODE_ENV || process.env.ENVIRONMENT;
}

/**
 * Get the current test runner configuration.
 * Useful for debugging and test introspection.
 */
export function getConfig(): CopilotTestConfig | null {
  return defaultRunner.getConfig();
}

/**
 * Get the default singleton TestRunner instance.
 * Useful for watch mode and other advanced use cases that need access to the runner's queue.
 */
export function getDefaultRunner(): TestRunner {
  return defaultRunner;
}
