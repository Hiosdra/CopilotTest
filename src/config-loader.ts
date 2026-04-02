import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import * as yaml from "js-yaml";
import type {
  CopilotTestConfig,
  PlatformConfig,
  McpServerConfig,
  Platform,
  RetryConfig,
  WatchConfig,
  PerformanceConfig,
} from "./types.js";

// ---------------------------------------------------------------------------
// YAML shape — the raw structure before we expand it into CopilotTestConfig
// ---------------------------------------------------------------------------

interface YamlPlatformWeb {
  platform: "web";
  browser?: "chromium" | "firefox" | "webkit";
  headless?: boolean;
  baseUrl?: string;
}

interface YamlPlatformApi {
  platform: "api";
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
}

interface YamlPlatformMobile {
  platform: "mobile";
  device?: string;
  avd?: string;
  appPackage?: string;
  appActivity?: string;
}

type YamlPlatformShorthand = YamlPlatformWeb | YamlPlatformApi | YamlPlatformMobile;

interface YamlConfig {
  model?: string;
  platforms?: Record<string, YamlPlatformShorthand>;
  baseUrl?: string;
  stepTimeout?: number;
  retries?: number;
  screenshotOnFailure?: boolean;
  outputDir?: string;
  mcpServers?: Record<string, McpServerConfig>;
  reasoningEffort?: "low" | "medium" | "high";
  debugMode?: boolean;
  breakpoints?: string[];
  interactive?: boolean;
  useCustomStepDefinitions?: boolean;
  parallel?: boolean;
  maxWorkers?: number | "auto";
  workerTimeout?: number;
  failFast?: boolean;
  retry?: RetryConfig;
  watch?: WatchConfig;
  performance?: PerformanceConfig;
}

// ---------------------------------------------------------------------------
// Default config file names (searched in order)
// ---------------------------------------------------------------------------

const CONFIG_FILE_NAMES = [
  "copilot-test.config.yaml",
  "copilot-test.config.yml",
];

// ---------------------------------------------------------------------------
// Environment variable resolution
// ---------------------------------------------------------------------------

/**
 * Regex matching `${VAR}` and `${VAR:-default}` patterns inside strings.
 * Captures: group 1 = variable name, group 2 = optional default value.
 */
const ENV_VAR_PATTERN = /\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-(.*?))?\}/g;

/**
 * Replace `${VAR}` / `${VAR:-default}` tokens in a single string with the
 * corresponding environment variable value (or the default).
 */
function resolveEnvString(value: string): string {
  return value.replace(ENV_VAR_PATTERN, (_match, name: string, fallback?: string) => {
    const envValue = process.env[name];
    if (envValue !== undefined) {
      return envValue;
    }
    return fallback ?? "";
  });
}

/**
 * Recursively walk an arbitrary value and resolve every string leaf that
 * contains `${…}` references.  Arrays and plain objects are traversed; all
 * other types are returned as-is.
 */
function resolveEnvVars<T>(value: T): T {
  if (typeof value === "string") {
    return resolveEnvString(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveEnvVars(item)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const resolved: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      resolved[key] = resolveEnvVars(val);
    }
    return resolved as T;
  }
  return value;
}

// ---------------------------------------------------------------------------
// Platform shorthand → full PlatformConfig converters
// ---------------------------------------------------------------------------

/** Mirrors the logic in `src/platforms/web.ts` → `webPlatform()`. */
function buildWebPlatform(opts: YamlPlatformWeb): PlatformConfig {
  const browser = opts.browser ?? "chromium";
  const headless = opts.headless ?? true;
  const args: string[] = ["@playwright/mcp", "--browser", browser];

  if (headless) {
    args.push("--headless");
  }

  const systemContext = [
    "You are a web testing agent using Playwright MCP.",
    "You can interact with web browsers to test web applications.",
    "Use the Playwright tools to navigate, click, type, and verify page content.",
    opts.baseUrl ? `The application base URL is: ${opts.baseUrl}` : "",
    "Take screenshots when verifying visual states.",
    "Report test outcomes as JSON: { status: 'passed'|'failed', reasoning: string, error?: string }",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    platform: "web",
    mcpServer: {
      type: "stdio",
      command: "npx",
      args,
    },
    systemContext,
  };
}

/** Mirrors the logic in `src/platforms/api.ts` → `apiPlatform()`. */
function buildApiPlatform(opts: YamlPlatformApi): PlatformConfig {
  const systemContext = [
    "You are an API testing agent using curl MCP.",
    "You can make HTTP requests to test REST APIs and other web services.",
    "Use curl tools to send GET, POST, PUT, PATCH, DELETE requests.",
    "Verify response status codes, headers, and body content.",
    opts.baseUrl ? `The API base URL is: ${opts.baseUrl}` : "",
    opts.defaultHeaders
      ? `Default headers: ${JSON.stringify(opts.defaultHeaders)}`
      : "",
    "Report test outcomes as JSON: { status: 'passed'|'failed', reasoning: string, error?: string }",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    platform: "api",
    mcpServer: {
      type: "stdio",
      command: "npx",
      args: ["@copilot-test/curl-mcp"],
      env: opts.defaultHeaders
        ? { DEFAULT_HEADERS: JSON.stringify(opts.defaultHeaders) }
        : undefined,
    },
    systemContext,
  };
}

/** Mirrors the logic in `src/platforms/mobile.ts` → `mobilePlatform()`. */
function buildMobilePlatform(opts: YamlPlatformMobile): PlatformConfig {
  const device = opts.device ?? "emulator-5554";
  const args: string[] = ["@copilot-test/android-mcp", "--device", device];

  if (opts.avd) {
    args.push("--avd", opts.avd);
  }
  if (opts.appPackage) {
    args.push("--app-package", opts.appPackage);
  }
  if (opts.appActivity) {
    args.push("--app-activity", opts.appActivity);
  }

  const systemContext = [
    "You are a mobile testing agent using Android Emulator MCP.",
    "You can interact with Android applications running in an emulator.",
    "Use the Android tools to tap, swipe, type, and verify UI elements.",
    `Target device: ${device}`,
    opts.appPackage ? `App package: ${opts.appPackage}` : "",
    "Take screenshots when verifying visual states.",
    "Report test outcomes as JSON: { status: 'passed'|'failed', reasoning: string, error?: string }",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    platform: "mobile",
    mcpServer: {
      type: "stdio",
      command: "npx",
      args,
    },
    systemContext,
  };
}

/**
 * Convert a YAML platform shorthand object into a full `PlatformConfig`.
 */
function buildPlatformConfig(entry: YamlPlatformShorthand): PlatformConfig {
  switch (entry.platform) {
    case "web":
      return buildWebPlatform(entry);
    case "api":
      return buildApiPlatform(entry);
    case "mobile":
      return buildMobilePlatform(entry);
    default: {
      const exhaustive: never = entry;
      throw new Error(`Unsupported platform type: ${(exhaustive as { platform: string }).platform}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load a YAML configuration file and return a fully resolved
 * `CopilotTestConfig`.
 *
 * @param configPath - Explicit path to the YAML file.  When omitted the
 *   loader searches the current working directory for
 *   `copilot-test.config.yaml` or `copilot-test.config.yml`.
 */
export async function loadConfig(configPath?: string): Promise<CopilotTestConfig> {
  const filePath = resolveConfigPath(configPath);
  const raw = await readFile(filePath, "utf-8");
  const parsed = yaml.load(raw) as YamlConfig;

  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Invalid YAML config at ${filePath}`);
  }

  // Resolve ${ENV_VAR} / ${ENV_VAR:-default} tokens throughout the config
  const resolved = resolveEnvVars(parsed);

  // Build full PlatformConfig objects from shorthand entries
  const platforms: Record<string, PlatformConfig> = {};
  if (resolved.platforms) {
    for (const [name, entry] of Object.entries(resolved.platforms)) {
      platforms[name] = buildPlatformConfig(entry);
    }
  }

  const config: CopilotTestConfig = {
    platforms,
    ...(resolved.model !== undefined && { model: resolved.model }),
    ...(resolved.baseUrl !== undefined && { baseUrl: resolved.baseUrl }),
    ...(resolved.stepTimeout !== undefined && { stepTimeout: resolved.stepTimeout }),
    ...(resolved.retries !== undefined && { retries: resolved.retries }),
    ...(resolved.screenshotOnFailure !== undefined && { screenshotOnFailure: resolved.screenshotOnFailure }),
    ...(resolved.outputDir !== undefined && { outputDir: resolved.outputDir }),
    ...(resolved.mcpServers !== undefined && { mcpServers: resolved.mcpServers }),
    ...(resolved.reasoningEffort !== undefined && { reasoningEffort: resolved.reasoningEffort }),
    ...(resolved.debugMode !== undefined && { debugMode: resolved.debugMode }),
    ...(resolved.breakpoints !== undefined && { breakpoints: resolved.breakpoints }),
    ...(resolved.interactive !== undefined && { interactive: resolved.interactive }),
    ...(resolved.useCustomStepDefinitions !== undefined && { useCustomStepDefinitions: resolved.useCustomStepDefinitions }),
    ...(resolved.parallel !== undefined && { parallel: resolved.parallel }),
    ...(resolved.maxWorkers !== undefined && { maxWorkers: resolved.maxWorkers }),
    ...(resolved.workerTimeout !== undefined && { workerTimeout: resolved.workerTimeout }),
    ...(resolved.failFast !== undefined && { failFast: resolved.failFast }),
    ...(resolved.retry !== undefined && { retry: resolved.retry }),
    ...(resolved.watch !== undefined && { watch: resolved.watch }),
    ...(resolved.performance !== undefined && { performance: resolved.performance }),
  };

  return config;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve the config file path — use the explicit `configPath` when provided,
 * otherwise probe the cwd for default file names.
 */
function resolveConfigPath(configPath?: string): string {
  if (configPath) {
    const full = resolve(configPath);
    if (!existsSync(full)) {
      throw new Error(`Config file not found: ${full}`);
    }
    return full;
  }

  for (const name of CONFIG_FILE_NAMES) {
    const candidate = resolve(process.cwd(), name);
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    "No config file found. Create copilot-test.config.yaml (or .yml) in your project root, " +
      "or pass an explicit path to loadConfig()."
  );
}
