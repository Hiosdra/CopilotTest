/**
 * This file demonstrates the improved TypeScript types and IDE support
 * provided by the enhanced type system.
 */

import {
  feature,
  webPlatform,
  // Type imports
  type CopilotTestConfig,
  type FeatureBuilder,
  type StepContext,
  type DeepPartial,
  type AsyncStep,
  type StepMatcher,
} from "../src/index.js";

// ============================================================================
// Example 1: Type-safe configuration with DeepPartial
// ============================================================================

const partialConfig: DeepPartial<CopilotTestConfig> = {
  model: "gpt-4o",
  platforms: {
    web: {
      platform: "web",
      mcpServer: {
        type: "stdio",
      },
    },
  },
};

// This demonstrates that partial configurations are properly typed
console.log("Partial config type check:", partialConfig.model);

// ============================================================================
// Example 2: Strongly typed feature builder
// ============================================================================

const myFeature: FeatureBuilder = feature("Type-safe Feature")
  .tag("@typescript", "@types")
  .description("Demonstrates improved TypeScript support");

// Complete the feature by adding a scenario
myFeature
  .scenario("Type inference example")
  .given("I have type-safe code")
  .when("I use the feature builder")
  .then("TypeScript provides autocompletion");

console.log("Feature builder type check:", typeof myFeature);

// ============================================================================
// Example 3: Custom step with proper typing
// ============================================================================

const customStep: AsyncStep = async (context: StepContext) => {
  // context is fully typed
  console.log("Step:", context.step.text);
  console.log("Keyword:", context.step.keyword);

  // Access scenario context with type safety
  if (context.scenarioContext) {
    context.scenarioContext.set("result", "success");
    const result = context.scenarioContext.get<string>("result");
    console.log("Result:", result);
  }
};

// ============================================================================
// Example 4: Step matchers with proper types
// ============================================================================

const stringMatcher: StepMatcher = "I click the button";
const regexMatcher: StepMatcher = /^I click the "(.+)" button$/;

console.log("String matcher:", stringMatcher);
console.log("Regex matcher:", regexMatcher);

// ============================================================================
// Example 5: Configuration with all strict type checking
// ============================================================================

// Full configuration demonstrating type safety
const fullConfig: CopilotTestConfig = {
  model: "gpt-4o",
  platforms: {
    web: webPlatform(),
  },
  stepTimeout: 30000,
  retries: 2,
  parallel: true,
  maxWorkers: 4,
  debugMode: false,
};

// This will show a type error if we try to set an invalid model
// fullConfig.model = "invalid-model"; // TypeScript will catch this

console.log("Configuration validated:", fullConfig.model);

// ============================================================================
// Example 6: Builder pattern with strong typing
// ============================================================================

function createTypedFeature(name: string): FeatureBuilder {
  return feature(name)
    .tag("@example")
    .description("This feature has full type checking");
}

const typedFeature = createTypedFeature("My Feature");
console.log("Typed feature created:", typeof typedFeature);

// ============================================================================
// Main execution
// ============================================================================

console.log("\n✅ All TypeScript type examples compiled successfully!");
console.log("This demonstrates:");
console.log("  - Enhanced type safety");
console.log("  - Better IDE autocomplete");
console.log("  - Strict type checking");
console.log("  - Comprehensive type exports");
