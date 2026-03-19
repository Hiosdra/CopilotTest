/**
 * Example test demonstrating cross-step state management using ScenarioContext.
 *
 * This test shows how data can be shared between steps within a scenario:
 * 1. Create a user and store the user ID in context
 * 2. Fetch the user using the stored ID from context
 * 3. Update the user and verify the changes
 */

import { feature, configure, test, run, apiPlatform } from "../src/index.js";

// Configure the test framework
configure({
  outputDir: "./test-results",
  stepTimeout: 30000,
  model: "gpt-4o",
  platforms: {
    api: apiPlatform({
      baseUrl: "https://jsonplaceholder.typicode.com",
    }),
  },
});

// Example 1: API test with context management
const userManagement = feature("User Management API")
  .description("Tests for user CRUD operations with cross-step data sharing")
  .tag("@api")
  .tag("@context-demo")

  .scenario("Create and verify user with context")
    .tag("@smoke")
    .given("I have a JSON API at https://jsonplaceholder.typicode.com")
    .when("I create a new user with name 'Alice' and email 'alice@example.com'")
    // AI will extract the user ID from response and store it in context: {"userId": "123"}
    .and("I store the user ID in context for later use")
    .then("the response status should be 201")
    .and("I should receive the created user data")
    .when("I fetch the user using the ID from context")
    // AI will read context.userId and use it in the API call
    .then("the response status should be 200")
    .and("the user details should match the expected data")
    .done();

// Example 2: Multi-step workflow with intermediate data
const authWorkflow = feature("Authentication Workflow")
  .description("Tests authentication flow with token management")
  .tag("@api")
  .tag("@auth")

  .scenario("Login and use auth token")
    .given("I have an authentication API")
    .when("I login with username 'testuser' and password 'testpass'")
    // AI stores: {"authToken": "abc-xyz-123", "userId": "456"}
    .then("I receive an authentication token")
    .and("the token is stored in context")
    .when("I make an authenticated request using the token from context")
    // AI uses context.authToken for Authorization header
    .then("the request should succeed")
    .and("I should see my user profile data")
    .done();

// Example 3: Shopping cart scenario with item tracking
const shoppingCart = feature("Shopping Cart")
  .description("Tests shopping cart operations with item tracking")
  .tag("@api")

  .scenario("Add items and checkout")
    .given("I have an e-commerce API")
    .when("I create a new cart")
    // AI stores: {"cartId": "cart-123"}
    .then("I receive a cart ID")
    .when("I add product with ID 'prod-1' to the cart")
    // AI uses context.cartId and stores item: {"itemId": "item-456"}
    .then("the item is added successfully")
    .when("I add product with ID 'prod-2' to the cart")
    .then("the second item is added successfully")
    .when("I view my cart using the cart ID from context")
    // AI uses context.cartId
    .then("I should see 2 items in the cart")
    .when("I proceed to checkout with the cart ID")
    // AI uses context.cartId and stores: {"orderId": "order-789"}
    .then("the order is created successfully")
    .and("I receive an order confirmation with ID")
    .done();

// Queue the tests (demo scenarios; execution is guarded below)
test(userManagement, "api");
test(authWorkflow, "api");
test(shoppingCart, "api");

// Run all queued tests only when explicitly enabled to avoid unintended live calls
if (process.env.COPILOT_CONTEXT_EXAMPLE_LIVE === "1") {
  console.log("\n🚀 Running Context Management Demo Tests...\n");
  await run();
} else {
  console.log(
    "\nContext Management Demo Tests are defined but not executed by default.\n" +
      "Set COPILOT_CONTEXT_EXAMPLE_LIVE=1 to run them (this may call external services).\n"
  );
}
