/**
 * Example plugins demonstrating the plugin system capabilities.
 * These examples show how to create custom plugins for various use cases:
 * - Slack/Teams notifications
 * - Custom reporters (JUnit, HTML, JSON)
 * - Performance monitoring
 * - Step timing analysis
 */

import { definePlugin, type Plugin } from "../src/index.js";
import type {
  CopilotTestConfig,
  Feature,
  Scenario,
  Step,
  StepResult,
  ScenarioResult,
  FeatureResult,
  TestRun,
} from "../src/types.js";

/**
 * Example 1: Slack Notification Plugin
 * Sends notifications to Slack on test failures or completion.
 */
export function slackPlugin(options: {
  webhook: string;
  onlyFailures?: boolean;
  channel?: string;
}): Plugin {
  return definePlugin({
    name: "slack-notifier",

    async onStepEnd(step, result) {
      if (result.status === "failed" && options.onlyFailures) {
        // Send Slack notification for failed step
        const message = {
          channel: options.channel,
          text: `❌ Step Failed: ${step.keyword} ${step.text}`,
          attachments: [
            {
              color: "danger",
              fields: [
                {
                  title: "Error",
                  value: result.error || "Unknown error",
                  short: false,
                },
                {
                  title: "Duration",
                  value: `${result.duration}ms`,
                  short: true,
                },
              ],
            },
          ],
        };

        // In a real implementation, send to Slack webhook
        console.log(`[Slack Plugin] Would send to ${options.webhook}:`, message);
      }
    },

    async onTestRunEnd(results) {
      // Send summary notification
      const { summary } = results;
      const passRate = summary.total > 0
        ? Math.round((summary.passed / summary.total) * 100)
        : 0;

      const color = summary.failed > 0 ? "danger" : "good";
      const emoji = summary.failed > 0 ? "❌" : "✅";

      const message = {
        channel: options.channel,
        text: `${emoji} Test Run Complete`,
        attachments: [
          {
            color,
            fields: [
              { title: "Total", value: String(summary.total), short: true },
              { title: "Passed", value: String(summary.passed), short: true },
              { title: "Failed", value: String(summary.failed), short: true },
              { title: "Pass Rate", value: `${passRate}%`, short: true },
            ],
          },
        ],
      };

      console.log(`[Slack Plugin] Would send summary to ${options.webhook}:`, message);
    },
  });
}

/**
 * Example 2: JUnit XML Reporter Plugin
 * Generates JUnit-compatible XML reports for CI/CD integration.
 */
export function junitPlugin(options: { outputFile: string }): Plugin {
  const testSuites: Array<{
    name: string;
    tests: number;
    failures: number;
    time: number;
    testCases: Array<{
      name: string;
      time: number;
      failure?: { message: string; type: string };
    }>;
  }> = [];

  return definePlugin({
    name: "junit-reporter",

    onFeatureEnd(feature, result) {
      const testSuite = {
        name: feature.name,
        tests: result.scenarios.length,
        failures: result.scenarios.filter((s) => s.status === "failed").length,
        time: result.duration / 1000, // Convert to seconds
        testCases: result.scenarios.map((scenario) => ({
          name: scenario.scenario.name,
          time: scenario.duration / 1000,
          failure:
            scenario.status === "failed"
              ? {
                  message:
                    scenario.steps.find((s) => s.status === "failed")?.error ||
                    "Test failed",
                  type: "AssertionError",
                }
              : undefined,
        })),
      };

      testSuites.push(testSuite);
    },

    async onTestRunEnd(results) {
      // Generate JUnit XML
      const xml = generateJunitXml(testSuites);
      console.log(`[JUnit Plugin] Would write to ${options.outputFile}:`);
      console.log(xml.substring(0, 500) + "...");
    },
  });
}

function generateJunitXml(
  testSuites: Array<{
    name: string;
    tests: number;
    failures: number;
    time: number;
    testCases: Array<{
      name: string;
      time: number;
      failure?: { message: string; type: string };
    }>;
  }>
): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<testsuites>\n';

  for (const suite of testSuites) {
    xml += `  <testsuite name="${escapeXml(suite.name)}" tests="${suite.tests}" failures="${suite.failures}" time="${suite.time}">\n`;

    for (const testCase of suite.testCases) {
      xml += `    <testcase name="${escapeXml(testCase.name)}" time="${testCase.time}"`;

      if (testCase.failure) {
        xml += ">\n";
        xml += `      <failure message="${escapeXml(testCase.failure.message)}" type="${testCase.failure.type}"/>\n`;
        xml += "    </testcase>\n";
      } else {
        xml += " />\n";
      }
    }

    xml += "  </testsuite>\n";
  }

  xml += "</testsuites>";
  return xml;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Example 3: Performance Monitor Plugin
 * Tracks step performance and warns about slow steps.
 */
export function performancePlugin(options: {
  threshold: number;
  report?: string;
}): Plugin {
  const slowSteps: Array<{
    step: string;
    duration: number;
    scenario: string;
    feature: string;
  }> = [];

  let currentFeature = "";
  let currentScenario = "";

  return definePlugin({
    name: "performance-monitor",

    onFeatureStart(feature) {
      currentFeature = feature.name;
    },

    onScenarioStart(scenario) {
      currentScenario = scenario.name;
    },

    onStepEnd(step, result) {
      if (result.duration > options.threshold) {
        console.warn(
          `⚠️  [Performance] Slow step detected: ${step.keyword} ${step.text} (${result.duration}ms > ${options.threshold}ms)`
        );

        slowSteps.push({
          step: `${step.keyword} ${step.text}`,
          duration: result.duration,
          scenario: currentScenario,
          feature: currentFeature,
        });
      }
    },

    async onTestRunEnd(results) {
      if (slowSteps.length > 0) {
        console.log(`\n🐌 Performance Report: ${slowSteps.length} slow steps detected\n`);
        console.log("─".repeat(80));

        for (const slow of slowSteps) {
          console.log(`Feature: ${slow.feature}`);
          console.log(`Scenario: ${slow.scenario}`);
          console.log(`Step: ${slow.step}`);
          console.log(`Duration: ${slow.duration}ms (threshold: ${options.threshold}ms)`);
          console.log("─".repeat(80));
        }

        if (options.report) {
          const reportData = {
            threshold: options.threshold,
            slowSteps,
            totalSteps: results.features.reduce(
              (acc, f) =>
                acc +
                f.scenarios.reduce((acc2, s) => acc2 + s.steps.length, 0),
              0
            ),
          };
          console.log(`\n[Performance Plugin] Would write report to ${options.report}`);
          console.log(JSON.stringify(reportData, null, 2));
        }
      }
    },
  });
}

/**
 * Example 4: Console Logger Plugin
 * Logs detailed execution information to console.
 */
export const consoleLoggerPlugin = definePlugin({
  name: "console-logger",

  onTestRunStart(config) {
    console.log("\n🚀 [Logger] Test run starting...");
    console.log(`   Platforms: ${Object.keys(config.platforms).join(", ")}`);
  },

  onFeatureStart(feature) {
    console.log(`\n📋 [Logger] Feature: ${feature.name}`);
    if (feature.description) {
      console.log(`   ${feature.description}`);
    }
  },

  onScenarioStart(scenario) {
    console.log(`   🎬 [Logger] Scenario: ${scenario.name}`);
  },

  onStepStart(step) {
    console.log(`      ▶️  [Logger] ${step.keyword} ${step.text}`);
  },

  onStepEnd(step, result) {
    const icon = result.status === "passed" ? "✅" : result.status === "failed" ? "❌" : "⏭️";
    console.log(`      ${icon} [Logger] Completed in ${result.duration}ms`);
  },

  onScenarioEnd(scenario, result) {
    const icon = result.status === "passed" ? "✅" : "❌";
    console.log(`   ${icon} [Logger] Scenario ${result.status} (${result.duration}ms)`);
  },

  onFeatureEnd(feature, result) {
    const passed = result.scenarios.filter((s) => s.status === "passed").length;
    const failed = result.scenarios.filter((s) => s.status === "failed").length;
    console.log(`\n✨ [Logger] Feature complete: ${passed} passed, ${failed} failed`);
  },

  onTestRunEnd(results) {
    console.log("\n🏁 [Logger] Test run complete!");
    console.log(`   Summary: ${results.summary.passed}/${results.summary.total} passed`);
  },
});

/**
 * Example 5: Custom JSON Reporter Plugin
 * Generates a custom JSON report with detailed test results.
 */
export function jsonReporterPlugin(options: { outputFile: string }): Plugin {
  return definePlugin({
    name: "json-reporter",

    async onTestRunEnd(results) {
      const report = {
        timestamp: results.startedAt.toISOString(),
        duration: results.finishedAt
          ? results.finishedAt.getTime() - results.startedAt.getTime()
          : 0,
        summary: results.summary,
        features: results.features.map((feature) => ({
          name: feature.feature.name,
          tags: feature.feature.tags,
          scenarios: feature.scenarios.map((scenario) => ({
            name: scenario.scenario.name,
            status: scenario.status,
            duration: scenario.duration,
            steps: scenario.steps.map((step) => ({
              text: `${step.step.keyword} ${step.step.text}`,
              status: step.status,
              duration: step.duration,
              error: step.error,
            })),
          })),
        })),
      };

      console.log(`\n[JSON Reporter] Would write to ${options.outputFile}`);
      console.log(JSON.stringify(report, null, 2).substring(0, 500) + "...");
    },
  });
}
