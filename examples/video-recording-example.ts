import { configure, feature, run } from "../src/index.js";
import { webPlatform } from "../src/platforms/web.js";

/**
 * Example: Video Recording for Test Execution
 *
 * This example demonstrates how to configure video recording for your tests.
 * Videos can be recorded always, only on failures, or disabled entirely.
 */

// Example 1: Record videos only on failure (recommended for CI/CD)
configure({
  platforms: {
    web: webPlatform({
      browser: "chromium",
      headless: true,
      baseUrl: "https://example.com",
    }),
  },
  video: {
    enabled: true,
    mode: "on-failure", // Only save video if the scenario fails
    format: "webm", // WebM format (better compression)
    quality: "medium", // Balance between quality and file size
    fps: 25, // 25 frames per second
    outputDir: "copilot-test-results/videos", // Where to save videos
    retention: {
      maxDays: 7, // Delete videos older than 7 days
      maxSize: 500, // Delete oldest if total size > 500 MB
      keepFailures: true, // Always keep failure videos
    },
  },
  outputDir: "copilot-test-results",
});

// Example 2: Always record videos (for debugging or demonstration)
const alwaysRecordConfig = {
  platforms: {
    web: webPlatform(),
  },
  video: {
    enabled: true,
    mode: "always" as const, // Record all scenarios
    format: "webm" as const,
    quality: "high" as const, // High quality for demos
    outputDir: "videos",
  },
};

// Example 3: Disable video recording
const noVideoConfig = {
  platforms: {
    web: webPlatform(),
  },
  video: {
    enabled: false, // Explicitly disable
  },
};

// Example 4: MP4 format for better compatibility
const mp4Config = {
  platforms: {
    web: webPlatform(),
  },
  video: {
    enabled: true,
    mode: "on-failure" as const,
    format: "mp4" as const, // MP4 format (wider browser support)
    quality: "high" as const,
  },
};

// Define a test feature
feature("Login Flow with Video Recording")
  .tag("@video-demo")
  .scenario("Successful login")
  .tag("@smoke")
  .given("I am on the login page")
  .when("I enter valid credentials")
  .and('I click the "Login" button')
  .then("I should be redirected to the dashboard")
  .and("I should see my username displayed");

feature("Shopping Cart with Video")
  .tag("@video-demo")
  .scenario("Add item to cart")
  .given("I am on the products page")
  .when('I click "Add to Cart" for a product')
  .then("The cart count should increase")
  .and("The item should appear in the cart");

// Run tests only if COPILOT_VIDEO_EXAMPLE_LIVE=1 is set
if (process.env.COPILOT_VIDEO_EXAMPLE_LIVE === "1") {
  console.log("\n🎥 Running video recording example...\n");
  console.log("Configuration:");
  console.log("  - Video enabled: true");
  console.log("  - Mode: on-failure");
  console.log("  - Format: webm");
  console.log("  - Output: copilot-test-results/videos");
  console.log("\nNote: Videos will be saved in the HTML report when tests fail.\n");

  run().catch(console.error);
} else {
  console.log("\n🎥 Video Recording Example");
  console.log("\nTo run this example with live video recording:");
  console.log("  COPILOT_VIDEO_EXAMPLE_LIVE=1 tsx examples/video-recording-example.ts");
  console.log("\nThis will execute tests with video recording enabled.");
  console.log("Videos will be embedded in the HTML report at:");
  console.log("  copilot-test-results/report.html\n");
}
