import { configure, feature, test, run } from "../src/index.js";
import { mobilePlatform } from "../src/platforms/mobile.js";

configure({
  model: "gpt-4o",
  platforms: {
    mobile: mobilePlatform({
      device: "emulator-5554",
      avd: "Pixel_7_API_34",
      appPackage: "com.example.myapp",
      appActivity: "com.example.myapp.MainActivity",
    }),
  },
  stepTimeout: 60000,
  screenshotOnFailure: true,
  outputDir: "copilot-test-results",
});

const appOnboarding = feature("App Onboarding")
  .description("Tests for the initial app onboarding experience")
  .tag("@onboarding", "@mobile")
  .scenario("Complete onboarding flow for a new user")
  .tag("@smoke")
  .given("the app is installed and launched for the first time")
  .and("I am on the welcome screen")
  .when("I tap the 'Get Started' button")
  .then("I should see the permissions screen")
  .when("I grant notification permissions")
  .and("I grant location permissions")
  .then("I should see the account creation screen")
  .when("I enter my name 'Jane Smith'")
  .and("I enter my email 'jane@example.com'")
  .and("I tap the 'Create Account' button")
  .then("I should see the home screen")
  .and("I should see a welcome message for 'Jane Smith'")
  .and("the onboarding should be marked as complete")
  .done()
  ._build();

test(appOnboarding, "mobile");
await run();
