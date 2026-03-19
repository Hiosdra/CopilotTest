import { configure, feature, test, run } from "../src/index.js";
import { apiPlatform } from "../src/platforms/api.js";

configure({
  model: "gpt-4o",
  platforms: {
    api: apiPlatform({ baseUrl: "https://jsonplaceholder.typicode.com" }),
  },
  stepTimeout: 15000,
  outputDir: "copilot-test-results",
});

const usersApi = feature("Users API")
  .description("Tests for the Users REST API endpoints")
  .tag("@api", "@users")
  .scenario("List all users")
  .tag("@smoke")
  .given("the API is available at https://jsonplaceholder.typicode.com")
  .when("I send a GET request to /users")
  .then("the response status code should be 200")
  .and("the response body should be a JSON array")
  .and("the array should contain at least 1 user")
  .scenario("Create a new user")
  .tag("@create")
  .given("I have a new user payload")
  .when("I send a POST request to /users")
  .withDocString(
    JSON.stringify(
      {
        name: "John Doe",
        username: "johndoe",
        email: "john@example.com",
      },
      null,
      2
    )
  )
  .then("the response status code should be 201")
  .and("the response body should contain the created user's id")
  .and("the response body name should be 'John Doe'")
  .scenario("Get non-existent user returns 404")
  .tag("@negative")
  .given("a user with id 99999 does not exist")
  .when("I send a GET request to /users/99999")
  .then("the response status code should be 404")
  .done()
  ._build();

test(usersApi, "api");
await run();
