/**
 * Comprehensive example demonstrating test data management features:
 * - Fixtures for static test data
 * - Factories for dynamic data generation
 * - Lifecycle hooks (beforeAll, afterAll, beforeEach, afterEach)
 * - Database seeding
 * - API mocking
 * - Shared context
 */

import {
  feature,
  configure,
  test,
  run,
  apiPlatform,
  defineFixture,
  defineFactory,
  faker,
  seed,
  registerSeedHandler,
  mockApi,
} from "../src/index.js";

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

// ============================================================================
// 1. FIXTURES: Define static test data
// ============================================================================

const users = defineFixture("users", {
  admin: {
    username: "admin@example.com",
    password: "Admin123!",
    role: "administrator",
  },
  regularUser: {
    username: "user@example.com",
    password: "User123!",
    role: "user",
  },
  invalidUser: {
    username: "invalid@example.com",
    password: "wrong",
  },
});

const products = defineFixture("products", [
  { id: 1, name: "Laptop", price: 999.99, category: "electronics" },
  { id: 2, name: "Mouse", price: 29.99, category: "electronics" },
  { id: 3, name: "Desk", price: 299.99, category: "furniture" },
]);

// ============================================================================
// 2. FACTORIES: Define dynamic data generators
// ============================================================================

const userFactory = defineFactory({
  username: ({ sequence }) => `user${sequence}@example.com`,
  password: "Test123!",
  firstName: ({ faker }) => faker.person.firstName(),
  lastName: ({ faker }) => faker.person.lastName(),
  email: ({ faker }) => faker.internet.email(),
  phone: ({ faker }) => faker.phone.number(),
  createdAt: () => new Date().toISOString(),
});

const productFactory = defineFactory({
  id: ({ sequence }) => sequence,
  name: ({ faker }) => faker.commerce.productName(),
  price: ({ faker }) => parseFloat(faker.commerce.price()),
  category: ({ faker }) => faker.commerce.department(),
  description: ({ faker }) => faker.commerce.productDescription(),
  inStock: ({ faker }) => faker.datatype.boolean(),
});

// ============================================================================
// 3. SEED HANDLERS: Register database seeding handlers
// ============================================================================

// Mock database
const mockDatabase: Record<string, unknown[]> = {
  users: [],
  products: [],
};

registerSeedHandler("users", async (collection, data) => {
  mockDatabase[collection] = Array.isArray(data) ? data : [data];
  console.log(`  📦 Seeded ${mockDatabase[collection].length} ${collection}`);
});

registerSeedHandler("products", async (collection, data) => {
  mockDatabase[collection] = Array.isArray(data) ? data : [data];
  console.log(`  📦 Seeded ${mockDatabase[collection].length} ${collection}`);
});

// ============================================================================
// 4. API MOCKING: Configure mock API responses
// ============================================================================

// These would typically be set up in beforeEach hooks
function setupApiMocks() {
  mockApi.get("/api/products", {
    status: 200,
    body: products,
  });

  mockApi.post("/api/users", {
    status: 201,
    body: { id: 123, ...userFactory.build() },
  });
}

// ============================================================================
// 5. FEATURE WITH LIFECYCLE HOOKS
// ============================================================================

const testDataDemo = feature("Test Data Management Demo")
  .description("Demonstrates fixtures, factories, hooks, seeding, and mocking")
  .tag("@demo")
  .tag("@data-management")

  // beforeAll: Runs once before all scenarios
  .beforeAll(async ({ context }) => {
    console.log("  🚀 beforeAll: Setting up test data...");

    // Seed database with initial data
    await seed("users", [
      { id: 1, username: "admin", role: "admin" },
      { id: 2, username: "user", role: "user" },
    ]);

    await seed("products", [
      { id: 1, name: "Test Product 1", price: 100 },
      { id: 2, name: "Test Product 2", price: 200 },
    ]);

    // Store shared data in context
    context.set("testStartTime", new Date().toISOString());
    context.set("testEnvironment", "demo");
  })

  // afterAll: Runs once after all scenarios
  .afterAll(async ({ context }) => {
    console.log("  🏁 afterAll: Cleaning up test data...");

    // Clean up database
    mockDatabase.users = [];
    mockDatabase.products = [];

    const startTime = context.get<string>("testStartTime");
    console.log(`  📊 Test suite started at: ${startTime}`);
  })

  // beforeEach: Runs before each scenario
  .beforeEach(async ({ context, scenario }) => {
    console.log(`  ⚙️  beforeEach: Preparing for "${scenario?.name}"...`);

    // Set up API mocks for each scenario
    setupApiMocks();

    // Generate fresh test user for this scenario
    const testUser = userFactory.build();
    context.set("testUser", testUser);

    // Track scenario execution
    context.set("scenarioStartTime", Date.now());
  })

  // afterEach: Runs after each scenario
  .afterEach(async ({ context, scenario }) => {
    console.log(`  🧹 afterEach: Cleaning up after "${scenario?.name}"...`);

    // Calculate scenario duration
    const startTime = context.get<number>("scenarioStartTime");
    const duration = Date.now() - (startTime || 0);
    console.log(`  ⏱️  Scenario took ${duration}ms`);

    // Clear API mocks
    mockApi.clear();

    // Clean up any resources created during the scenario
    const userId = context.get("createdUserId");
    if (userId) {
      console.log(`  🗑️  Cleaning up user ID: ${userId}`);
      context.delete("createdUserId");
    }
  })

  .scenario("Using fixtures for static test data")
    .tag("@fixtures")
    .given(`I have predefined user credentials for "${users.admin.username}"`)
    .when("I attempt to login with these credentials")
    .then("I should be authenticated as an administrator")

  .scenario("Using factories for dynamic test data")
    .tag("@factories")
    .given("I need to create multiple unique test users")
    .when("I generate 5 users using the factory")
    .then("each user should have unique credentials")
    .and("all users should have valid email addresses")

  .scenario("Using context from beforeEach hook")
    .tag("@hooks")
    .given("I have a test user prepared in the beforeEach hook")
    .when("I access the test user from context")
    .then("I should see the generated user data")
    .and("the user should have a valid email address")

  .scenario("Using seeded database data")
    .tag("@seeding")
    .given("the database has been seeded with test products")
    .when("I query the products collection")
    .then("I should find 2 products")
    .and("the first product should be 'Test Product 1'")

  .scenario("Using mocked API responses")
    .tag("@mocking")
    .given("I have mocked the GET /api/products endpoint")
    .when("I make a request to /api/products")
    .then("I should receive the mocked product list")
    .and("the response status should be 200")

  .done();

// ============================================================================
// 6. ADDITIONAL EXAMPLES
// ============================================================================

// Example: Factory with custom overrides
const customUserFeature = feature("Factory Customization")
  .tag("@factories")

  .scenario("Create users with custom attributes")
    .given("I want to create a user with a specific email")
    .when("I use the factory with overrides")
    .then("the user should have the custom email")
    .and("other fields should be auto-generated")

  .done();

// Example: Batch data generation
const batchDataFeature = feature("Batch Data Generation")
  .tag("@factories")

  .scenario("Generate multiple test records")
    .given("I need 10 test products for load testing")
    .when("I use buildList to generate 10 products")
    .then("I should receive 10 unique products")
    .and("each product should have realistic data")

  .done();

// Queue the tests
test(testDataDemo, "api");
test(customUserFeature, "api");
test(batchDataFeature, "api");

// Run all queued tests only when explicitly enabled
if (process.env.COPILOT_DATA_DEMO_LIVE === "1") {
  console.log("\n🚀 Running Test Data Management Demo...\n");

  // Demonstrate factory usage before running tests
  console.log("=".repeat(60));
  console.log("📋 Factory Examples:");
  console.log("=".repeat(60));

  const sampleUser = userFactory.build();
  console.log("\n🧑 Single user from factory:");
  console.log(JSON.stringify(sampleUser, null, 2));

  const customUser = userFactory.build({ username: "custom@test.com" });
  console.log("\n🧑 User with custom username:");
  console.log(JSON.stringify(customUser, null, 2));

  const userList = userFactory.buildList(3);
  console.log("\n👥 List of 3 users:");
  userList.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.username} (${u.firstName} ${u.lastName})`);
  });

  const sampleProduct = productFactory.build();
  console.log("\n📦 Single product from factory:");
  console.log(JSON.stringify(sampleProduct, null, 2));

  console.log("\n" + "=".repeat(60) + "\n");

  await run();
} else {
  console.log(
    "\n📚 Test Data Management Demo is defined but not executed by default.\n" +
      "Set COPILOT_DATA_DEMO_LIVE=1 to run the tests (this may call external services).\n"
  );

  console.log("Available features:");
  console.log("  ✓ Fixtures for static test data");
  console.log("  ✓ Factories for dynamic data generation (with Faker.js)");
  console.log("  ✓ Lifecycle hooks (beforeAll, afterAll, beforeEach, afterEach)");
  console.log("  ✓ Database seeding utilities");
  console.log("  ✓ API response mocking");
  console.log("  ✓ Shared context between hooks and scenarios\n");

  console.log("Example usage:");
  console.log("  const user = userFactory.build();");
  console.log("  const users = userFactory.buildList(5);");
  console.log("  const admin = defineFixture('admin', { role: 'admin' });");
  console.log("  await seed('users', [{ id: 1, name: 'Test' }]);");
  console.log("  mockApi.get('/api/users', { status: 200, body: [] });\n");
}
