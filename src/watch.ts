import type { CopilotTestConfig, TestRun, ScenarioResult } from "./types.js";
import { TestRunner } from "./runner.js";
import { watch as fsWatch, FSWatcher } from "fs";
import { readdir, stat } from "fs/promises";
import { join, relative, sep } from "path";
import { stdin as processStdin, stdout as processStdout } from "process";

/**
 * Represents the state of the watch mode session
 */
interface WatchState {
  lastTestRun?: TestRun;
  failedScenarios: Map<string, ScenarioResult>;
  isRunning: boolean;
  changedFiles: Set<string>;
  watchedFiles: Set<string>;
}

/**
 * Manages watch mode for continuous test execution
 */
export class WatchMode {
  private config: CopilotTestConfig;
  private runner: TestRunner;
  private watchers: FSWatcher[] = [];
  private state: WatchState;
  private debounceTimer: NodeJS.Timeout | null = null;
  private isInteractive: boolean = false;

  constructor(config: CopilotTestConfig, runner: TestRunner) {
    this.config = config;
    this.runner = runner;
    this.state = {
      failedScenarios: new Map(),
      isRunning: false,
      changedFiles: new Set(),
      watchedFiles: new Set(),
    };
  }

  /**
   * Start watch mode
   */
  async start(): Promise<void> {
    this.isInteractive = processStdin.isTTY ?? false;

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║      COPILOT TEST - WATCH MODE         ║");
    console.log("╚════════════════════════════════════════╝\n");

    // Setup file watching
    await this.setupFileWatchers();

    // Setup interactive mode if in TTY
    if (this.isInteractive) {
      this.setupInteractiveMode();
    }

    // Run tests initially
    await this.runTests();

    console.log("\n👀 Watching for file changes...");
    if (this.isInteractive) {
      this.displayMenu();
    }
  }

  /**
   * Stop watch mode and cleanup
   */
  stop(): void {
    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Close all file watchers
    for (const watcher of this.watchers) {
      watcher.close();
    }
    this.watchers = [];

    // Restore stdin if in interactive mode
    if (this.isInteractive && processStdin.isTTY) {
      processStdin.setRawMode(false);
      processStdin.pause();
    }

    console.log("\n\n✨ Watch mode stopped\n");
  }

  /**
   * Setup file watchers based on configuration
   */
  private async setupFileWatchers(): Promise<void> {
    const watchConfig = this.config.watch || {};
    const include = watchConfig.include || ["src/**/*.ts", "tests/**/*.ts", "**/*.spec.ts"];
    const exclude = watchConfig.exclude || ["node_modules/**", "dist/**", "**/.*"];

    // Get the current working directory
    const cwd = process.cwd();

    // Collect all files to watch
    const filesToWatch = new Set<string>();

    for (const pattern of include) {
      const files = await this.findFiles(cwd, pattern, exclude);
      files.forEach((file) => filesToWatch.add(file));
    }

    console.log(`📁 Watching ${filesToWatch.size} files...`);

    // Watch each file
    for (const file of filesToWatch) {
      try {
        const watcher = fsWatch(file, (eventType) => {
          if (eventType === "change") {
            this.onFileChange(file);
          }
        });
        this.watchers.push(watcher);
        this.state.watchedFiles.add(file);
      } catch (err) {
        // Silently ignore files that can't be watched
      }
    }
  }

  /**
   * Find files matching a glob-like pattern
   */
  private async findFiles(
    baseDir: string,
    pattern: string,
    exclude: string[]
  ): Promise<string[]> {
    const results: string[] = [];
    const patternRegex = this.globToRegex(pattern);
    const excludeRegexes = exclude.map((p) => this.globToRegex(p));

    const scanDir = async (dir: string): Promise<void> => {
      try {
        const entries = await readdir(dir);

        for (const entry of entries) {
          const fullPath = join(dir, entry);
          const relativePath = relative(baseDir, fullPath);

          // Check if excluded
          const isExcluded = excludeRegexes.some((regex) =>
            regex.test(relativePath.split(sep).join("/"))
          );
          if (isExcluded) continue;

          const stats = await stat(fullPath);

          if (stats.isDirectory()) {
            await scanDir(fullPath);
          } else if (stats.isFile()) {
            const normalizedPath = relativePath.split(sep).join("/");
            if (patternRegex.test(normalizedPath)) {
              results.push(fullPath);
            }
          }
        }
      } catch (err) {
        // Silently ignore directories we can't read
      }
    };

    await scanDir(baseDir);
    return results;
  }

  /**
   * Convert a glob pattern to regex
   */
  private globToRegex(pattern: string): RegExp {
    let regexStr = pattern
      .replace(/\./g, "\\.")
      .replace(/\*\*/g, "§DOUBLESTAR§")
      .replace(/\*/g, "[^/]*")
      .replace(/§DOUBLESTAR§/g, ".*")
      .replace(/\?/g, ".");

    return new RegExp(`^${regexStr}$`);
  }

  /**
   * Handle file change event
   */
  private onFileChange(file: string): void {
    this.state.changedFiles.add(file);

    // Debounce test execution
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    const debounceMs = this.config.watch?.debounce ?? 300;
    this.debounceTimer = setTimeout(() => {
      this.runTests();
    }, debounceMs);
  }

  /**
   * Run tests with current configuration
   */
  private async runTests(mode?: "all" | "failed"): Promise<void> {
    if (this.state.isRunning) return;

    this.state.isRunning = true;

    const clearConsole = this.config.watch?.clearConsole ?? false;
    if (clearConsole) {
      console.clear();
    }

    console.log("\n" + "=".repeat(60));
    console.log(`🔄 Running tests... (${new Date().toLocaleTimeString()})`);
    console.log("=".repeat(60));

    try {
      // If running failed tests only
      if (mode === "failed" && this.state.failedScenarios.size > 0) {
        console.log(`\n🔍 Re-running ${this.state.failedScenarios.size} failed tests...\n`);
      } else if (this.state.changedFiles.size > 0) {
        const changedFilesList = Array.from(this.state.changedFiles)
          .map((f) => relative(process.cwd(), f))
          .slice(0, 5);
        console.log(`\n📝 Changed files:`);
        changedFilesList.forEach((f) => console.log(`  • ${f}`));
        if (this.state.changedFiles.size > 5) {
          console.log(`  ... and ${this.state.changedFiles.size - 5} more`);
        }
        console.log();
        this.state.changedFiles.clear();
      }

      const testRun = await this.runner.run();
      this.state.lastTestRun = testRun;

      // Track failed scenarios
      this.state.failedScenarios.clear();
      for (const feature of testRun.features) {
        for (const scenario of feature.scenarios) {
          if (scenario.status === "failed") {
            const key = `${feature.feature.name}:${scenario.scenario.name}`;
            this.state.failedScenarios.set(key, scenario);
          }
        }
      }

      // Show summary
      this.displaySummary(testRun);
    } catch (err) {
      console.error(`\n❌ Error running tests: ${err instanceof Error ? err.message : String(err)}\n`);
    } finally {
      this.state.isRunning = false;

      if (this.isInteractive) {
        this.displayMenu();
      } else {
        console.log("\n👀 Watching for file changes...\n");
      }
    }
  }

  /**
   * Display test summary
   */
  private displaySummary(testRun: TestRun): void {
    const { summary } = testRun;
    const status = summary.failed === 0 ? "✓ All tests passed" : `✗ ${summary.failed} test(s) failed`;
    const passRate = summary.total > 0
      ? Math.round((summary.passed / summary.total) * 100)
      : 0;

    console.log("\n╔════════════════════════════════════════╗");
    console.log(`║ Status: ${status.padEnd(28)}║`);
    console.log(`║ Tests: ${summary.passed} passed, ${summary.failed} failed${" ".repeat(28 - (summary.passed.toString().length + summary.failed.toString().length + 16))}║`);
    console.log(`║ Pass rate: ${passRate}%${" ".repeat(28 - passRate.toString().length - 11)}║`);
    if (testRun.finishedAt && testRun.startedAt) {
      const duration = testRun.finishedAt.getTime() - testRun.startedAt.getTime();
      console.log(`║ Duration: ${duration}ms${" ".repeat(28 - duration.toString().length - 10)}║`);
    }
    console.log("╚════════════════════════════════════════╝");
  }

  /**
   * Display interactive menu
   */
  private displayMenu(): void {
    console.log("\n" + "─".repeat(60));
    console.log("Interactive Commands:");
    console.log("  a - Run all tests");
    console.log("  f - Run only failed tests");
    console.log("  q - Quit watch mode");
    console.log("  Enter - Re-run tests");
    console.log("─".repeat(60) + "\n");
  }

  /**
   * Setup interactive mode with keyboard controls
   */
  private setupInteractiveMode(): void {
    if (!processStdin.isTTY) return;

    processStdin.setRawMode(true);
    processStdin.setEncoding("utf8");
    processStdin.resume();

    processStdin.on("data", (key: string) => {
      // Ctrl+C
      if (key === "\u0003") {
        this.stop();
        process.exit(0);
      }

      // Handle commands
      switch (key.toLowerCase()) {
        case "q":
          this.stop();
          process.exit(0);
          break;
        case "a":
          console.log("\n🔄 Running all tests...\n");
          this.runTests("all");
          break;
        case "f":
          if (this.state.failedScenarios.size > 0) {
            this.runTests("failed");
          } else {
            console.log("\n✨ No failed tests to re-run!\n");
            this.displayMenu();
          }
          break;
        case "\r": // Enter
        case "\n":
          console.log("\n🔄 Re-running tests...\n");
          this.runTests();
          break;
      }
    });
  }
}

/**
 * Start watch mode with the given configuration and runner
 */
export async function startWatchMode(
  config: CopilotTestConfig,
  runner: TestRunner
): Promise<void> {
  const watchMode = new WatchMode(config, runner);

  // Handle graceful shutdown
  const cleanup = () => {
    watchMode.stop();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  await watchMode.start();

  // Keep the process alive
  return new Promise(() => {
    // Never resolves - watch mode runs until interrupted
  });
}
