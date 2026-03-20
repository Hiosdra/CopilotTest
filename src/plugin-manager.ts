import type {
  Plugin,
  CopilotTestConfig,
  Feature,
  Scenario,
  Step,
  StepResult,
  ScenarioResult,
  FeatureResult,
  TestRun,
} from "./types.js";

/**
 * Manages plugin registration and lifecycle hook execution.
 * Provides a centralized system for plugin coordination.
 */
export class PluginManager {
  private plugins: Plugin[] = [];

  /**
   * Register a plugin with the manager.
   * @param plugin - The plugin to register
   */
  register(plugin: Plugin): void {
    // Check for duplicate plugin names
    if (this.plugins.some((p) => p.name === plugin.name)) {
      throw new Error(`Plugin with name "${plugin.name}" is already registered`);
    }
    this.plugins.push(plugin);
  }

  /**
   * Register multiple plugins at once.
   * @param plugins - Array of plugins to register
   */
  registerAll(plugins: Plugin[]): void {
    for (const plugin of plugins) {
      this.register(plugin);
    }
  }

  /**
   * Get all registered plugins.
   * @returns Array of registered plugins
   */
  getPlugins(): Plugin[] {
    return [...this.plugins];
  }

  /**
   * Clear all registered plugins.
   */
  clear(): void {
    this.plugins = [];
  }

  /**
   * Execute onTestRunStart hooks for all plugins.
   * @param config - Test configuration
   */
  async onTestRunStart(config: CopilotTestConfig): Promise<void> {
    await this.executeHooks("onTestRunStart", config);
  }

  /**
   * Execute onFeatureStart hooks for all plugins.
   * @param feature - Feature being executed
   */
  async onFeatureStart(feature: Feature): Promise<void> {
    await this.executeHooks("onFeatureStart", feature);
  }

  /**
   * Execute onScenarioStart hooks for all plugins.
   * @param scenario - Scenario being executed
   */
  async onScenarioStart(scenario: Scenario): Promise<void> {
    await this.executeHooks("onScenarioStart", scenario);
  }

  /**
   * Execute onStepStart hooks for all plugins.
   * @param step - Step being executed
   */
  async onStepStart(step: Step): Promise<void> {
    await this.executeHooks("onStepStart", step);
  }

  /**
   * Execute onStepEnd hooks for all plugins.
   * @param step - Step that was executed
   * @param result - Result of step execution
   */
  async onStepEnd(step: Step, result: StepResult): Promise<void> {
    await this.executeHooks("onStepEnd", step, result);
  }

  /**
   * Execute onScenarioEnd hooks for all plugins.
   * @param scenario - Scenario that was executed
   * @param result - Result of scenario execution
   */
  async onScenarioEnd(scenario: Scenario, result: ScenarioResult): Promise<void> {
    await this.executeHooks("onScenarioEnd", scenario, result);
  }

  /**
   * Execute onFeatureEnd hooks for all plugins.
   * @param feature - Feature that was executed
   * @param result - Result of feature execution
   */
  async onFeatureEnd(feature: Feature, result: FeatureResult): Promise<void> {
    await this.executeHooks("onFeatureEnd", feature, result);
  }

  /**
   * Execute onTestRunEnd hooks for all plugins.
   * @param results - Complete test run results
   */
  async onTestRunEnd(results: TestRun): Promise<void> {
    await this.executeHooks("onTestRunEnd", results);
  }

  /**
   * Execute a specific hook for all plugins that implement it.
   * Errors in plugin hooks are caught and logged to prevent disrupting test execution.
   * @param hookName - Name of the hook to execute
   * @param args - Arguments to pass to the hook
   */
  private async executeHooks(hookName: keyof Plugin, ...args: unknown[]): Promise<void> {
    for (const plugin of this.plugins) {
      const hook = plugin[hookName];
      if (typeof hook === "function") {
        try {
          // Call hook with proper context binding
          await (hook as (...args: unknown[]) => void | Promise<void>).apply(plugin, args);
        } catch (error) {
          // Log error but don't disrupt test execution
          console.error(
            `Error in plugin "${plugin.name}" hook "${hookName}":`,
            error instanceof Error ? error.message : String(error)
          );
        }
      }
    }
  }
}

/**
 * Helper function to create a plugin with type safety.
 * @param plugin - Plugin configuration
 * @returns The plugin object
 */
export function definePlugin(plugin: Plugin): Plugin {
  return plugin;
}
