/**
 * Example demonstrating hybrid approach: mixing AI-driven steps with explicit assertions.
 * This test shows how to combine natural language BDD steps with type-safe assertions.
 */

import { feature, expect } from "../src/index.js";

// Example 1: API Testing with explicit assertions
const apiTest = feature("User API")
  .description("Test user creation and retrieval with explicit validations")
  .tag("@api")
  .scenario("Create and verify user")
    .given("the API is available")
    .when("I create a new user with email 'test@example.com'")
    // Explicit assertion for critical validation
    .then(async ({ api, context }) => {
      // These are explicit assertions - unambiguous and type-safe
      const userId = context?.get("userId");
      expect(userId).toBeDefined();
      expect(userId).toBeGreaterThan(0);

      const user = await api.get(`/users/${userId}`);
      expect(user.status).toBe(201);
      expect(user.data).toHaveProperty("email", "test@example.com");
      expect(user.data.id).toBe(userId);
    })
    .and("the user should be retrievable")
    .done()
  ._build();

// Example 2: Web Testing with hybrid approach
const webTest = feature("Login Flow")
  .description("Mix AI-driven navigation with explicit validations")
  .tag("@web")
  .scenario("Successful login with role verification")
    .given("I am on the login page") // AI-driven step
    .when("I login as 'admin'") // AI-driven step
    .then("I should see the dashboard") // AI-driven step
    // Explicit assertion for critical security check
    .and(async ({ page }) => {
      // Verify admin role is displayed correctly
      await expect(page.locator("[data-user-role]")).toHaveText("Administrator");
      await expect(page.locator(".user-email")).toContainText("admin@");
      await expect(page).toHaveURL(/\/dashboard/);
    })
    .done()
  .scenario("Failed login with error validation")
    .given("I am on the login page")
    .when("I enter invalid credentials")
    .then("I should see an error message") // AI-driven
    .and(async ({ page }) => {
      // Explicit check for specific error
      const errorMsg = page.locator(".error-message");
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText("Invalid username or password");
      await expect(page).toHaveURL(/\/login/); // Still on login page
    })
    .done()
  ._build();

// Example 3: Multiple validations in one step
const dataValidation = feature("Data Validation")
  .description("Explicit validations for complex data structures")
  .tag("@validation")
  .scenario("Verify API response structure")
    .when("I fetch the user profile")
    .then(async ({ api, context }) => {
      const response = await api.get("/profile");

      // Multiple explicit assertions
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        id: expect(response.data.id).toBeDefined(),
        email: expect(response.data.email).toMatch(/@/),
      });

      // Array validations
      expect(response.data.permissions).toHaveLength(5);
      expect(response.data.permissions).toContain("read");
      expect(response.data.permissions).toContain("write");

      // Nested object validation
      expect(response.data.profile).toHaveProperty("firstName");
      expect(response.data.profile).toHaveProperty("lastName");
      expect(response.data.profile.age).toBeGreaterThan(0);
      expect(response.data.profile.age).toBeLessThan(150);
    })
    .done()
  ._build();

// Example 4: Async assertions with promises
const asyncTest = feature("Async Operations")
  .description("Testing asynchronous operations with promise assertions")
  .tag("@async")
  .scenario("Verify async data loading")
    .given("the app is initialized")
    .when("I trigger data loading")
    .then(async ({ api }) => {
      // Test that promise resolves correctly
      const dataPromise = api.get("/data");
      await expect(dataPromise).resolves.toHaveProperty("status", 200);

      // Test rejection handling
      const failingPromise = api.get("/invalid-endpoint");
      await expect(failingPromise).rejects.toThrow();
      await expect(failingPromise).rejects.toThrow(/404/);
    })
    .done()
  ._build();

// Example 5: Pure explicit assertions (no AI)
const explicitOnly = feature("Pure Assertion Tests")
  .description("Tests with only explicit assertions, no AI interpretation")
  .tag("@explicit")
  .scenario("Unit-style validation")
    .then(async ({ context }) => {
      // Pure programmatic test - no AI needed
      const result = 2 + 2;
      expect(result).toBe(4);
      expect(result).toBeGreaterThan(3);
      expect(result).toBeLessThan(5);
    })
    .done()
  ._build();

console.log("✨ Hybrid approach examples created successfully!\n");
console.log("These examples demonstrate:");
console.log("  • Mixing AI-driven steps with explicit assertions");
console.log("  • Type-safe validations for critical checks");
console.log("  • Web-specific assertions with Playwright");
console.log("  • API response validations");
console.log("  • Async promise assertions");
console.log("  • Pure explicit assertion tests\n");
