import { mkdir, writeFile, readFile, readdir } from "fs/promises";
import { join } from "path";
import type { TestRun, FeatureResult, ScenarioResult, StepResult, TestRunMetadata } from "./types.js";

export async function generateReport(
  testRun: TestRun,
  outputDir: string
): Promise<void> {
  await mkdir(outputDir, { recursive: true });

  // Generate timestamped filename
  const timestamp = testRun.startedAt.toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const runDir = join(outputDir, "runs");
  await mkdir(runDir, { recursive: true });

  // Build HTML report once and reuse for all HTML outputs
  const htmlReport = buildHtmlReport(testRun);
  const jsonReport = JSON.stringify(testRun, null, 2);

  // Save JSON report with timestamp
  const jsonPath = join(runDir, `${timestamp}.json`);
  await writeFile(jsonPath, jsonReport, "utf-8");

  // Save HTML report with timestamp
  const htmlPath = join(runDir, `${timestamp}.html`);
  await writeFile(htmlPath, htmlReport, "utf-8");

  // Also save as report.json and report.html for backward compatibility
  await writeFile(join(outputDir, "report.json"), jsonReport, "utf-8");
  await writeFile(join(outputDir, "report.html"), htmlReport, "utf-8");

  // Update trends.json
  await updateTrends(outputDir, testRun);

  // Generate dashboard index.html
  await generateDashboard(outputDir);
}

export function buildHtmlReport(testRun: TestRun): string {
  const duration = testRun.finishedAt
    ? testRun.finishedAt.getTime() - testRun.startedAt.getTime()
    : 0;
  const passRate =
    testRun.summary.total > 0
      ? Math.round((testRun.summary.passed / testRun.summary.total) * 100)
      : 0;

  // Collect all unique tags from scenarios
  const allTags = new Set<string>();
  testRun.features.forEach(f => {
    f.feature.tags.forEach(t => allTags.add(t));
    f.scenarios.forEach(s => s.scenario.tags.forEach(t => allTags.add(t)));
  });

  const tagsHtml = Array.from(allTags).map(tag =>
    `<button class="tag-filter" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`
  ).join("");

  const featuresHtml = testRun.features.map(renderFeature).join("\n");

  // Serialize testRun data for JavaScript, escaping </script sequences
  const testRunJson = JSON.stringify({
    ...testRun,
    startedAt: testRun.startedAt.toISOString(),
    finishedAt: testRun.finishedAt?.toISOString(),
  }).replace(/<\/script/gi, '<\\/script');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CopilotTest Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fa; color: #333; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 2rem; }
    .header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .header p { color: #a0aec0; }
    .summary { display: flex; gap: 1rem; padding: 1.5rem 2rem; flex-wrap: wrap; }
    .card { background: white; border-radius: 8px; padding: 1.5rem; flex: 1; min-width: 140px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
    .card .value { font-size: 2.5rem; font-weight: bold; }
    .card .label { color: #718096; font-size: 0.875rem; margin-top: 0.25rem; }
    .card.passed .value { color: #38a169; }
    .card.failed .value { color: #e53e3e; }
    .card.rate .value { color: #3182ce; }
    .controls { padding: 1rem 2rem; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
    .filter-group { display: flex; gap: 0.5rem; align-items: center; }
    .filter-btn { padding: 0.5rem 1rem; border: 1px solid #cbd5e0; background: white; border-radius: 4px; cursor: pointer; font-size: 0.875rem; }
    .filter-btn:hover { background: #f7fafc; }
    .filter-btn.active { background: #3182ce; color: white; border-color: #3182ce; }
    .search-box { padding: 0.5rem 1rem; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 0.875rem; width: 300px; }
    .tag-filter { padding: 0.25rem 0.75rem; border: 1px solid #cbd5e0; background: white; border-radius: 9999px; cursor: pointer; font-size: 0.75rem; }
    .tag-filter:hover { background: #f7fafc; }
    .tag-filter.active { background: #805ad5; color: white; border-color: #805ad5; }
    .features { padding: 0 2rem 2rem; }
    .feature { background: white; border-radius: 8px; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .feature.hidden { display: none; }
    .feature-header { padding: 1rem 1.5rem; background: #2d3748; color: white; }
    .feature-header h2 { font-size: 1.1rem; }
    .scenario { border-bottom: 1px solid #e2e8f0; }
    .scenario:last-child { border-bottom: none; }
    .scenario.hidden { display: none; }
    .scenario-header { padding: 1rem 1.5rem; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
    .scenario-header:hover { background: #f7fafc; }
    .scenario-name { flex: 1; font-weight: 500; }
    .scenario-duration { color: #718096; font-size: 0.875rem; }
    .badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .badge-passed { background: #c6f6d5; color: #276749; }
    .badge-failed { background: #fed7d7; color: #9b2c2c; }
    .badge-skipped { background: #e2e8f0; color: #4a5568; }
    .steps { padding: 0 1.5rem 1rem; display: none; }
    .steps.open { display: block; }
    .step { padding: 0.5rem 0.75rem; display: flex; align-items: flex-start; gap: 0.75rem; border-radius: 4px; margin-bottom: 0.25rem; }
    .step-passed { background: #f0fff4; }
    .step-failed { background: #fff5f5; }
    .step-skipped { background: #f7fafc; }
    .step-icon { font-size: 1rem; flex-shrink: 0; }
    .step-content { flex: 1; }
    .step-text { font-size: 0.9rem; }
    .step-keyword { color: #6b46c1; font-weight: 600; }
    .step-duration { font-size: 0.75rem; color: #718096; }
    .step-error { margin-top: 0.25rem; font-size: 0.8rem; color: #e53e3e; font-family: monospace; }
    .reasoning { margin-top: 0.25rem; font-size: 0.8rem; color: #4a5568; }
    details { margin-top: 0.25rem; }
    details summary { cursor: pointer; color: #3182ce; font-size: 0.8rem; user-select: none; }
    details p { margin-top: 0.25rem; font-size: 0.8rem; color: #4a5568; padding: 0.5rem; background: #f7fafc; border-radius: 4px; }
    .meta { padding: 1rem 2rem; color: #718096; font-size: 0.875rem; }
    .metadata-section { padding: 1rem 2rem; background: white; margin-bottom: 1rem; }
    .metadata-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .metadata-item { font-size: 0.875rem; }
    .metadata-label { color: #718096; font-weight: 500; }
    .metadata-value { color: #2d3748; margin-top: 0.25rem; }
    .export-btn { padding: 0.5rem 1rem; background: #48bb78; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; }
    .export-btn:hover { background: #38a169; }
    .video-container { margin: 1rem 0; padding: 1rem; background: #f7fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
    .video-header { margin-bottom: 0.75rem; color: #2d3748; }
    .scenario-video { width: 100%; max-width: 800px; border-radius: 4px; background: #000; }
    .video-controls { margin-top: 0.75rem; display: flex; gap: 0.5rem; }
    .video-btn { padding: 0.5rem 1rem; background: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; text-decoration: none; display: inline-block; }
    .video-btn:hover { background: #2c5aa0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧪 CopilotTest Report</h1>
    <p>AI-Driven BDD Testing — ${testRun.startedAt.toISOString()} — ${duration}ms</p>
  </div>
  <div class="summary">
    <div class="card">
      <div class="value">${testRun.summary.total}</div>
      <div class="label">Total Scenarios</div>
    </div>
    <div class="card passed">
      <div class="value">${testRun.summary.passed}</div>
      <div class="label">Passed ✅</div>
    </div>
    <div class="card failed">
      <div class="value">${testRun.summary.failed}</div>
      <div class="label">Failed ❌</div>
    </div>
    <div class="card">
      <div class="value">${testRun.summary.skipped}</div>
      <div class="label">Skipped ⊘</div>
    </div>
    <div class="card rate">
      <div class="value">${passRate}%</div>
      <div class="label">Pass Rate</div>
    </div>
  </div>
  ${testRun.metadata ? renderMetadata(testRun.metadata) : ""}
  <div class="controls">
    <div class="filter-group">
      <label style="font-size: 0.875rem; font-weight: 500;">Filter:</label>
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="passed">✓ Passed</button>
      <button class="filter-btn" data-filter="failed">✗ Failed</button>
    </div>
    <input type="text" class="search-box" placeholder="Search scenarios..." />
    ${tagsHtml ? `<div class="filter-group"><label style="font-size: 0.875rem; font-weight: 500;">Tags:</label>${tagsHtml}</div>` : ""}
    <button class="export-btn" onclick="exportToJSON()">Export JSON</button>
  </div>
  <div class="features">
    ${featuresHtml}
  </div>
  <div class="meta">
    Generated by CopilotTest — AI-Driven BDD Testing Framework
  </div>
  <script>
    const testRunData = ${testRunJson};

    // Scenario click handlers
    document.querySelectorAll('.scenario-header').forEach(header => {
      header.addEventListener('click', () => {
        const steps = header.nextElementSibling;
        if (steps) steps.classList.toggle('open');
      });
    });

    // Filter handlers
    let currentFilter = 'all';
    let currentSearch = '';
    let activeTags = new Set();

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        applyFilters();
      });
    });

    // Search handler
    document.querySelector('.search-box').addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase();
      applyFilters();
    });

    // Tag filter handlers
    document.querySelectorAll('.tag-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        if (activeTags.has(tag)) {
          activeTags.delete(tag);
          btn.classList.remove('active');
        } else {
          activeTags.add(tag);
          btn.classList.add('active');
        }
        applyFilters();
      });
    });

    function applyFilters() {
      document.querySelectorAll('.feature').forEach(feature => {
        let hasVisibleScenario = false;
        feature.querySelectorAll('.scenario').forEach(scenario => {
          const status = scenario.querySelector('.badge').textContent.trim().toLowerCase();
          const name = scenario.querySelector('.scenario-name').textContent.toLowerCase();
          const scenarioTags = scenario.dataset.tags ? scenario.dataset.tags.split(',') : [];

          let visible = true;

          // Apply status filter
          if (currentFilter !== 'all' && !status.includes(currentFilter)) {
            visible = false;
          }

          // Apply search filter
          if (currentSearch && !name.includes(currentSearch)) {
            visible = false;
          }

          // Apply tag filter
          if (activeTags.size > 0) {
            const hasTag = scenarioTags.some(tag => activeTags.has(tag));
            if (!hasTag) {
              visible = false;
            }
          }

          if (visible) {
            scenario.classList.remove('hidden');
            hasVisibleScenario = true;
          } else {
            scenario.classList.add('hidden');
          }
        });

        if (hasVisibleScenario) {
          feature.classList.remove('hidden');
        } else {
          feature.classList.add('hidden');
        }
      });
    }

    function exportToJSON() {
      const blob = new Blob([JSON.stringify(testRunData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'copilot-test-report.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  </script>
</body>
</html>`;
}

function renderFeature(featureResult: FeatureResult): string {
  const scenariosHtml = featureResult.scenarios.map(s => renderScenario(s, featureResult.feature.tags)).join("\n");
  return `<div class="feature">
  <div class="feature-header">
    <h2>📋 ${escapeHtml(featureResult.feature.name)}</h2>
    ${featureResult.feature.description ? `<p style="color:#a0aec0;font-size:0.875rem;margin-top:0.25rem">${escapeHtml(featureResult.feature.description)}</p>` : ""}
  </div>
  ${scenariosHtml}
</div>`;
}

function renderScenario(scenarioResult: ScenarioResult, featureTags: string[] = []): string {
  const badgeClass = `badge-${scenarioResult.status}`;
  const stepsHtml = scenarioResult.steps.map(renderStep).join("\n");
  // Combine feature tags and scenario tags
  const allTags = [...featureTags, ...scenarioResult.scenario.tags];
  const tags = allTags.join(',');

  // Add video player if video path is available
  const videoHtml = scenarioResult.videoPath
    ? `<div class="video-container">
      <div class="video-header">
        <span style="font-weight: 600; font-size: 0.875rem;">📹 Recorded Video</span>
      </div>
      <video controls preload="metadata" class="scenario-video">
        <source src="${escapeHtml(scenarioResult.videoPath)}" type="video/webm">
        <source src="${escapeHtml(scenarioResult.videoPath)}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <div class="video-controls">
        <a href="${escapeHtml(scenarioResult.videoPath)}" download class="video-btn">Download</a>
      </div>
    </div>`
    : "";

  return `<div class="scenario" data-tags="${escapeHtml(tags)}">
  <div class="scenario-header">
    <span class="badge ${badgeClass}">${scenarioResult.status}</span>
    <span class="scenario-name">${escapeHtml(scenarioResult.scenario.name)}</span>
    <span class="scenario-duration">${scenarioResult.duration}ms</span>
  </div>
  <div class="steps">
    ${videoHtml}
    ${stepsHtml}
  </div>
</div>`;
}

function renderStep(stepResult: StepResult): string {
  const icon =
    stepResult.status === "passed"
      ? "✔️"
      : stepResult.status === "failed"
      ? "❌"
      : "⊘";
  const cssClass = `step step-${stepResult.status}`;

  return `<div class="${cssClass}">
  <span class="step-icon">${icon}</span>
  <div class="step-content">
    <div class="step-text">
      <span class="step-keyword">${escapeHtml(stepResult.step.keyword)}</span>
      ${escapeHtml(stepResult.step.text)}
    </div>
    <div class="step-duration">${stepResult.duration}ms</div>
    ${stepResult.error ? `<div class="step-error">Error: ${escapeHtml(stepResult.error)}</div>` : ""}
    ${
      stepResult.aiReasoning
        ? `<details>
      <summary>AI Reasoning</summary>
      <p>${escapeHtml(stepResult.aiReasoning)}</p>
    </details>`
        : ""
    }
  </div>
</div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMetadata(metadata: TestRunMetadata): string {
  const items: string[] = [];

  if (metadata.environment) {
    items.push(`<div class="metadata-item"><div class="metadata-label">Environment</div><div class="metadata-value">${escapeHtml(metadata.environment)}</div></div>`);
  }

  if (metadata.git?.branch) {
    items.push(`<div class="metadata-item"><div class="metadata-label">Branch</div><div class="metadata-value">${escapeHtml(metadata.git.branch)}</div></div>`);
  }

  if (metadata.git?.commit) {
    const shortCommit = metadata.git.commit.substring(0, 7);
    items.push(`<div class="metadata-item"><div class="metadata-label">Commit</div><div class="metadata-value">${escapeHtml(shortCommit)}</div></div>`);
  }

  if (metadata.git?.author) {
    items.push(`<div class="metadata-item"><div class="metadata-label">Author</div><div class="metadata-value">${escapeHtml(metadata.git.author)}</div></div>`);
  }

  if (metadata.ci?.buildNumber) {
    items.push(`<div class="metadata-item"><div class="metadata-label">Build</div><div class="metadata-value">#${escapeHtml(metadata.ci.buildNumber)}</div></div>`);
  }

  if (metadata.ci?.jobUrl) {
    items.push(`<div class="metadata-item"><div class="metadata-label">CI Job</div><div class="metadata-value"><a href="${escapeHtml(metadata.ci.jobUrl)}" target="_blank" rel="noopener noreferrer">View</a></div></div>`);
  }

  if (items.length === 0) return '';

  return `<div class="metadata-section">
    <div class="metadata-grid">
      ${items.join('')}
    </div>
  </div>`;
}

interface TrendData {
  runs: Array<{
    timestamp: string;
    duration: number;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: number;
  }>;
}

async function updateTrends(outputDir: string, testRun: TestRun): Promise<void> {
  const trendsPath = join(outputDir, "trends.json");
  let trends: TrendData = { runs: [] };

  try {
    const existing = await readFile(trendsPath, "utf-8");
    trends = JSON.parse(existing);
  } catch {
    // File doesn't exist yet, start fresh
  }

  const duration = testRun.finishedAt
    ? testRun.finishedAt.getTime() - testRun.startedAt.getTime()
    : 0;

  trends.runs.push({
    timestamp: testRun.startedAt.toISOString(),
    duration,
    total: testRun.summary.total,
    passed: testRun.summary.passed,
    failed: testRun.summary.failed,
    skipped: testRun.summary.skipped,
    passRate: testRun.summary.total > 0
      ? Math.round((testRun.summary.passed / testRun.summary.total) * 100)
      : 0,
  });

  // Keep only last 50 runs
  if (trends.runs.length > 50) {
    trends.runs = trends.runs.slice(-50);
  }

  await writeFile(trendsPath, JSON.stringify(trends, null, 2), "utf-8");
}

async function generateDashboard(outputDir: string): Promise<void> {
  const runDir = join(outputDir, "runs");
  let files: string[] = [];

  try {
    files = await readdir(runDir);
  } catch {
    // No runs directory yet
    return;
  }

  const htmlFiles = files.filter(f => f.endsWith(".html")).sort().reverse();

  // Read trends
  let trends: TrendData = { runs: [] };
  try {
    const trendsData = await readFile(join(outputDir, "trends.json"), "utf-8");
    trends = JSON.parse(trendsData);
  } catch {
    // No trends yet
  }

  // Build a lookup from timestamp to trend entry to avoid relying on index alignment
  const trendByTimestamp = new Map<string, any>();
  if (Array.isArray(trends.runs)) {
    for (const run of trends.runs as any[]) {
      if (run && typeof run.timestamp === "string") {
        trendByTimestamp.set(run.timestamp, run);
      }
    }
  }

  const runsHtml = htmlFiles.slice(0, 20).map((file) => {
    const jsonFile = file.replace(".html", ".json");
    const timestamp = file.replace(".html", "");
    const trend = trendByTimestamp.get(timestamp);

    if (!trend) return "";

    return `<tr>
      <td><a href="runs/${escapeHtml(file)}">${escapeHtml(timestamp)}</a></td>
      <td>${trend.total}</td>
      <td style="color: #38a169;">${trend.passed}</td>
      <td style="color: #e53e3e;">${trend.failed}</td>
      <td style="color: #718096;">${trend.skipped}</td>
      <td>${trend.passRate}%</td>
      <td>${trend.duration}ms</td>
      <td><a href="runs/${escapeHtml(jsonFile)}" download>JSON</a></td>
    </tr>`;
  }).join("");

  const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CopilotTest Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fa; color: #333; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 2rem; }
    .header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .header p { color: #a0aec0; }
    .container { padding: 2rem; }
    .card { background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
    .card h2 { font-size: 1.25rem; margin-bottom: 1rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f7fafc; font-weight: 600; font-size: 0.875rem; }
    tr:hover { background: #f7fafc; }
    a { color: #3182ce; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧪 CopilotTest Dashboard</h1>
    <p>Test Run History & Trends</p>
  </div>
  <div class="container">
    <div class="card">
      <h2>Recent Test Runs</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Total</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Skipped</th>
            <th>Pass Rate</th>
            <th>Duration</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          ${runsHtml || '<tr><td colspan="8" style="text-align: center; color: #718096;">No test runs yet</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

  await writeFile(join(outputDir, "index.html"), dashboardHtml, "utf-8");
}
