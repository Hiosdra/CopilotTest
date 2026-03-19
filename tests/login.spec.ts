import { configure, feature, test, run } from "../src/index.js";
import { webPlatform } from "../src/platforms/web.js";

configure({
  model: "gpt-4o",
  platforms: {
    web: webPlatform({ browser: "chromium", headless: true }),
  },
  baseUrl: "https://example.com",
  stepTimeout: 30000,
  retries: 1,
  screenshotOnFailure: true,
  outputDir: "copilot-test-results",
});

const userAuth = feature("User Authentication")
  .description("Tests for user authentication flows")
  .tag("@auth")
  .background()
  .given("the application is running at https://example.com")
  .and("I am on the login page")
  .scenario("Successful login with valid credentials")
  .tag("@smoke")
  .given("I have a valid account with username 'testuser' and password 'Test@123'")
  .when("I enter my username 'testuser'")
  .and("I enter my password 'Test@123'")
  .and("I click the login button")
  .then("I should be redirected to the dashboard")
  .and("I should see a welcome message with my username")
  .scenario("Failed login with invalid credentials")
  .tag("@negative")
  .given("I have an invalid password 'wrongpassword'")
  .when("I enter my username 'testuser'")
  .and("I enter my password 'wrongpassword'")
  .and("I click the login button")
  .then("I should see an error message 'Invalid credentials'")
  .and("I should remain on the login page")
  .scenario("Login form validation")
  .tag("@validation")
  .given("I am on the login page with empty fields")
  .when("I click the login button without entering any credentials")
  .then("I should see validation errors for required fields")
  .and("the username field should be highlighted as required")
  .and("the password field should be highlighted as required")
  .done()
  ._build();

test(userAuth, "web");
await run();
