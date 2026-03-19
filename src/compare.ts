import { readFile, writeFile } from "fs/promises";
import type { TestRun, ScenarioResult } from "./types.js";

export interface ComparisonResult {
  baseline: TestRun;
  current: TestRun;
  changes: {
    newScenarios: string[];
    removedScenarios: string[];
    improved: Array<{ name: string; baselineStatus: string; currentStatus: string }>;
    regressed: Array<{ name: string; baselineStatus: string; currentStatus: string }>;
    flakyTests: string[];
  };
  performance: {
    durationDiff: number;
    durationChange: string;
    scenarioChanges: Array<{ name: string; baselineDuration: number; currentDuration: number; diff: number }>;
  };
}

export async function compareTestRuns(
  baselinePath: string,
  currentPath: string,
  outputPath?: string
): Promise<ComparisonResult> {
  // Read test runs
  const baselineData = await readFile(baselinePath, "utf-8");
  const currentData = await readFile(currentPath, "utf-8");

  const baseline: TestRun = JSON.parse(baselineData);
  const current: TestRun = JSON.parse(currentData);

  // Convert dates back from JSON strings
  baseline.startedAt = new Date(baseline.startedAt);
  if (baseline.finishedAt) baseline.finishedAt = new Date(baseline.finishedAt);
  current.startedAt = new Date(current.startedAt);
  if (current.finishedAt) current.finishedAt = new Date(current.finishedAt);

  // Build scenario maps
  const baselineScenarios = new Map<string, ScenarioResult>();
  const currentScenarios = new Map<string, ScenarioResult>();

  baseline.features.forEach(f => {
    f.scenarios.forEach(s => {
      const key = `${f.feature.name}::${s.scenario.name}`;
      baselineScenarios.set(key, s);
    });
  });

  current.features.forEach(f => {
    f.scenarios.forEach(s => {
      const key = `${f.feature.name}::${s.scenario.name}`;
      currentScenarios.set(key, s);
    });
  });

  // Analyze changes
  const newScenarios: string[] = [];
  const removedScenarios: string[] = [];
  const improved: Array<{ name: string; baselineStatus: string; currentStatus: string }> = [];
  const regressed: Array<{ name: string; baselineStatus: string; currentStatus: string }> = [];
  const scenarioChanges: Array<{ name: string; baselineDuration: number; currentDuration: number; diff: number }> = [];

  // Find new scenarios
  currentScenarios.forEach((scenario, key) => {
    if (!baselineScenarios.has(key)) {
      newScenarios.push(key);
    }
  });

  // Find removed scenarios and compare existing ones
  baselineScenarios.forEach((baselineScenario, key) => {
    const currentScenario = currentScenarios.get(key);

    if (!currentScenario) {
      removedScenarios.push(key);
      return;
    }

    // Check for status changes
    if (baselineScenario.status !== currentScenario.status) {
      if (baselineScenario.status === "failed" && currentScenario.status === "passed") {
        improved.push({
          name: key,
          baselineStatus: baselineScenario.status,
          currentStatus: currentScenario.status,
        });
      } else if (baselineScenario.status === "passed" && currentScenario.status === "failed") {
        regressed.push({
          name: key,
          baselineStatus: baselineScenario.status,
          currentStatus: currentScenario.status,
        });
      }
    }

    // Track performance changes
    const durationDiff = currentScenario.duration - baselineScenario.duration;
    if (Math.abs(durationDiff) > 100) { // Only track significant changes (>100ms)
      scenarioChanges.push({
        name: key,
        baselineDuration: baselineScenario.duration,
        currentDuration: currentScenario.duration,
        diff: durationDiff,
      });
    }
  });

  // Calculate overall duration change
  const baselineDuration = baseline.finishedAt && baseline.startedAt
    ? baseline.finishedAt.getTime() - baseline.startedAt.getTime()
    : 0;
  const currentDuration = current.finishedAt && current.startedAt
    ? current.finishedAt.getTime() - current.startedAt.getTime()
    : 0;
  const durationDiff = currentDuration - baselineDuration;
  const durationChange = durationDiff > 0
    ? `+${durationDiff}ms`
    : `${durationDiff}ms`;

  const result: ComparisonResult = {
    baseline,
    current,
    changes: {
      newScenarios,
      removedScenarios,
      improved,
      regressed,
      flakyTests: [], // Will be populated by flaky detection
    },
    performance: {
      durationDiff,
      durationChange,
      scenarioChanges: scenarioChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)),
    },
  };

  // Generate comparison HTML if output path provided
  if (outputPath) {
    const html = buildComparisonHtml(result);
    await writeFile(outputPath, html, "utf-8");
  }

  return result;
}

function buildComparisonHtml(comparison: ComparisonResult): string {
  const { baseline, current, changes, performance } = comparison;

  const passRateChange = current.summary.total > 0 && baseline.summary.total > 0
    ? Math.round((current.summary.passed / current.summary.total) * 100) -
      Math.round((baseline.summary.passed / baseline.summary.total) * 100)
    : 0;

  const improvementsHtml = changes.improved.map(item =>
    `<tr><td>${escapeHtml(item.name)}</td><td style="color: #e53e3e;">❌ ${item.baselineStatus}</td><td style="color: #38a169;">✅ ${item.currentStatus}</td></tr>`
  ).join("");

  const regressionsHtml = changes.regressed.map(item =>
    `<tr><td>${escapeHtml(item.name)}</td><td style="color: #38a169;">✅ ${item.baselineStatus}</td><td style="color: #e53e3e;">❌ ${item.currentStatus}</td></tr>`
  ).join("");

  const performanceHtml = performance.scenarioChanges.slice(0, 10).map(item => {
    const color = item.diff > 0 ? "#e53e3e" : "#38a169";
    const sign = item.diff > 0 ? "+" : "";
    return `<tr><td>${escapeHtml(item.name)}</td><td>${item.baselineDuration}ms</td><td>${item.currentDuration}ms</td><td style="color: ${color};">${sign}${item.diff}ms</td></tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Test Run Comparison</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fa; color: #333; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 2rem; }
    .header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .header p { color: #a0aec0; }
    .container { padding: 2rem; }
    .summary { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .card { background: white; border-radius: 8px; padding: 1.5rem; flex: 1; min-width: 200px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card h3 { font-size: 0.875rem; color: #718096; margin-bottom: 0.5rem; }
    .card .value { font-size: 2rem; font-weight: bold; }
    .card .change { font-size: 0.875rem; margin-top: 0.25rem; }
    .card.positive .value { color: #38a169; }
    .card.negative .value { color: #e53e3e; }
    .card.neutral .value { color: #3182ce; }
    .section { background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
    .section h2 { font-size: 1.25rem; margin-bottom: 1rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f7fafc; font-weight: 600; font-size: 0.875rem; }
    tr:hover { background: #f7fafc; }
    .badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .badge-new { background: #c6f6d5; color: #276749; }
    .badge-removed { background: #fed7d7; color: #9b2c2c; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 Test Run Comparison</h1>
    <p>Baseline: ${baseline.startedAt.toISOString()} → Current: ${current.startedAt.toISOString()}</p>
  </div>
  <div class="container">
    <div class="summary">
      <div class="card ${passRateChange >= 0 ? 'positive' : 'negative'}">
        <h3>Pass Rate Change</h3>
        <div class="value">${passRateChange > 0 ? '+' : ''}${passRateChange}%</div>
        <div class="change">${baseline.summary.total > 0 ? Math.round((baseline.summary.passed / baseline.summary.total) * 100) : 0}% → ${current.summary.total > 0 ? Math.round((current.summary.passed / current.summary.total) * 100) : 0}%</div>
      </div>
      <div class="card ${performance.durationDiff <= 0 ? 'positive' : 'negative'}">
        <h3>Duration Change</h3>
        <div class="value">${performance.durationChange}</div>
        <div class="change">${baseline.finishedAt && baseline.startedAt ? baseline.finishedAt.getTime() - baseline.startedAt.getTime() : 0}ms → ${current.finishedAt && current.startedAt ? current.finishedAt.getTime() - current.startedAt.getTime() : 0}ms</div>
      </div>
      <div class="card ${changes.improved.length > 0 ? 'positive' : 'neutral'}">
        <h3>Improvements</h3>
        <div class="value">${changes.improved.length}</div>
        <div class="change">Tests fixed</div>
      </div>
      <div class="card ${changes.regressed.length > 0 ? 'negative' : 'positive'}">
        <h3>Regressions</h3>
        <div class="value">${changes.regressed.length}</div>
        <div class="change">New failures</div>
      </div>
    </div>

    ${changes.improved.length > 0 ? `
    <div class="section">
      <h2>✅ Improvements (${changes.improved.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Baseline</th>
            <th>Current</th>
          </tr>
        </thead>
        <tbody>
          ${improvementsHtml}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${changes.regressed.length > 0 ? `
    <div class="section">
      <h2>❌ Regressions (${changes.regressed.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Baseline</th>
            <th>Current</th>
          </tr>
        </thead>
        <tbody>
          ${regressionsHtml}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${changes.newScenarios.length > 0 ? `
    <div class="section">
      <h2>🆕 New Scenarios (${changes.newScenarios.length})</h2>
      <ul>
        ${changes.newScenarios.map(s => `<li><span class="badge badge-new">NEW</span> ${escapeHtml(s)}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${changes.removedScenarios.length > 0 ? `
    <div class="section">
      <h2>🗑️ Removed Scenarios (${changes.removedScenarios.length})</h2>
      <ul>
        ${changes.removedScenarios.map(s => `<li><span class="badge badge-removed">REMOVED</span> ${escapeHtml(s)}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${performance.scenarioChanges.length > 0 ? `
    <div class="section">
      <h2>⚡ Performance Changes (Top 10)</h2>
      <table>
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Baseline Duration</th>
            <th>Current Duration</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          ${performanceHtml}
        </tbody>
      </table>
    </div>
    ` : ''}
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
