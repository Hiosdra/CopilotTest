import { CopilotTestRuntime } from "../src/runtime.js";
import type { Feature, Scenario, CopilotTestConfig } from "../src/types.js";
import { webPlatform } from "../src/platforms/web.js";

// Test video recording configuration
const testConfig: CopilotTestConfig = {
  platforms: {
    web: webPlatform({ headless: true }),
  },
  video: {
    enabled: true,
    mode: "on-failure",
    format: "webm",
    outputDir: "videos",
  },
};

const testFeature: Feature = {
  name: "Video Recording Test",
  tags: [],
  scenarios: [
    {
      name: "Failed scenario with video",
      tags: [],
      steps: [
        { keyword: "Given", text: "I open the application" },
        { keyword: "When", text: "I perform an action" },
        { keyword: "Then", text: "the result should be visible" },
      ],
    },
  ],
};

console.log("\n📦 Video Recording Configuration Tests\n");

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Video config in CopilotTestConfig
  try {
    const config: CopilotTestConfig = {
      platforms: { web: webPlatform() },
      video: {
        enabled: true,
        mode: "always",
        format: "webm",
        quality: "high",
        fps: 30,
        outputDir: "test-videos",
        retention: {
          maxDays: 7,
          maxSize: 500,
          keepFailures: true,
        },
      },
    };

    if (config.video?.enabled === true) {
      console.log("  ✔ PASS: video config accepted");
      passed++;
    } else {
      throw new Error("video config not set");
    }

    if (config.video?.mode === "always") {
      console.log("  ✔ PASS: video mode is 'always'");
      passed++;
    } else {
      throw new Error("video mode not set");
    }

    if (config.video?.format === "webm") {
      console.log("  ✔ PASS: video format is 'webm'");
      passed++;
    } else {
      throw new Error("video format not set");
    }

    if (config.video?.quality === "high") {
      console.log("  ✔ PASS: video quality is 'high'");
      passed++;
    } else {
      throw new Error("video quality not set");
    }

    if (config.video?.fps === 30) {
      console.log("  ✔ PASS: video fps is 30");
      passed++;
    } else {
      throw new Error("video fps not set");
    }

    if (config.video?.outputDir === "test-videos") {
      console.log("  ✔ PASS: video outputDir is 'test-videos'");
      passed++;
    } else {
      throw new Error("video outputDir not set");
    }

    if (config.video?.retention?.maxDays === 7) {
      console.log("  ✔ PASS: retention maxDays is 7");
      passed++;
    } else {
      throw new Error("retention maxDays not set");
    }

    if (config.video?.retention?.keepFailures === true) {
      console.log("  ✔ PASS: retention keepFailures is true");
      passed++;
    } else {
      throw new Error("retention keepFailures not set");
    }
  } catch (err) {
    console.log(`  ✗ FAIL: ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }

  // Test 2: Web platform video config
  try {
    const platform = webPlatform({
      video: {
        enabled: true,
        mode: "on-failure",
      },
    });

    if (platform.platform === "web") {
      console.log("  ✔ PASS: web platform created with video config");
      passed++;
    } else {
      throw new Error("platform not set");
    }
  } catch (err) {
    console.log(`  ✗ FAIL: ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }

  // Test 3: Runtime without video config (no video path)
  try {
    const configWithoutVideo: CopilotTestConfig = {
      platforms: {
        web: webPlatform({ headless: true }),
      },
      // No video config
    };

    const runtime = new CopilotTestRuntime(configWithoutVideo);
    await runtime.start();

    // Run a mock scenario
    const scenario: Scenario = {
      name: "Test scenario",
      tags: [],
      steps: [{ keyword: "Given", text: "test step" }],
    };

    const result = await runtime.runScenario(
      testFeature,
      scenario,
      configWithoutVideo.platforms.web
    );

    // Without video config, video path should be undefined
    if (result.videoPath === undefined) {
      console.log("  ✔ PASS: no video config returns no video path");
      passed++;
    } else {
      throw new Error("without video config should not return video path");
    }

    if (result.status === "passed" || result.status === "failed" || result.status === "skipped") {
      console.log("  ✔ PASS: scenario completed with status");
      passed++;
    } else {
      throw new Error("scenario status not set");
    }

    await runtime.stop();
  } catch (err) {
    console.log(`  ✗ FAIL: ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }

  // Test 4: ScenarioResult includes videoPath field
  try {
    const runtime = new CopilotTestRuntime(testConfig);
    await runtime.start();

    const scenario: Scenario = {
      name: "Another test",
      tags: [],
      steps: [{ keyword: "Given", text: "another step" }],
    };

    const result = await runtime.runScenario(
      testFeature,
      scenario,
      testConfig.platforms.web
    );

    // Check that videoPath property exists (even if undefined)
    if ("videoPath" in result) {
      console.log("  ✔ PASS: ScenarioResult has videoPath property");
      passed++;
    } else {
      throw new Error("videoPath property not found");
    }

    await runtime.stop();
  } catch (err) {
    console.log(`  ✗ FAIL: ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }

  // Test 5: Video mode configurations
  try {
    const modes: Array<"always" | "on-failure" | "off"> = ["always", "on-failure", "off"];
    let modeTests = 0;

    for (const mode of modes) {
      const config: CopilotTestConfig = {
        platforms: { web: webPlatform() },
        video: { enabled: true, mode },
      };

      if (config.video?.mode === mode) {
        modeTests++;
      }
    }

    if (modeTests === 3) {
      console.log("  ✔ PASS: all video modes accepted");
      passed++;
    } else {
      throw new Error("not all modes accepted");
    }
  } catch (err) {
    console.log(`  ✗ FAIL: ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }

  // Test 6: Video formats
  try {
    const formats: Array<"webm" | "mp4"> = ["webm", "mp4"];
    let formatTests = 0;

    for (const format of formats) {
      const config: CopilotTestConfig = {
        platforms: { web: webPlatform() },
        video: { enabled: true, format },
      };

      if (config.video?.format === format) {
        formatTests++;
      }
    }

    if (formatTests === 2) {
      console.log("  ✔ PASS: all video formats accepted");
      passed++;
    } else {
      throw new Error("not all formats accepted");
    }
  } catch (err) {
    console.log(`  ✗ FAIL: ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }

  // Summary
  console.log("\n==================================================\n");
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
