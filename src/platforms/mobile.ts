import type { PlatformConfig } from "../types.js";

export interface MobilePlatformOptions {
  device?: string;
  avd?: string;
  appPackage?: string;
  appActivity?: string;
}

export function mobilePlatform(
  options: MobilePlatformOptions = {}
): PlatformConfig {
  const device = options.device ?? "emulator-5554";
  const args: string[] = ["@copilot-test/android-mcp", "--device", device];

  if (options.avd) {
    args.push("--avd", options.avd);
  }

  if (options.appPackage) {
    args.push("--app-package", options.appPackage);
  }

  if (options.appActivity) {
    args.push("--app-activity", options.appActivity);
  }

  const systemContext = [
    "You are a mobile testing agent using Android Emulator MCP.",
    "You can interact with Android applications running in an emulator.",
    "Use the Android tools to tap, swipe, type, and verify UI elements.",
    `Target device: ${device}`,
    options.appPackage ? `App package: ${options.appPackage}` : "",
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
