import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { prompt } from "../utils/prompt.js";
import { spinner } from "../utils/spinner.js";

const CONFIG_TEMPLATE = `import { configure, webPlatform, apiPlatform } from "copilot-test";

configure({
  model: "<MODEL>",
  platforms: {<PLATFORMS>
  },
  stepTimeout: 30000,
  retries: 2,
  screenshotOnFailure: true,
  outputDir: "copilot-test-results",
  parallel: false,
});
`;

const WEB_PLATFORM_TEMPLATE = `
    web: webPlatform({
      browser: "chromium",
      headless: true,
      baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
    })`;

const API_PLATFORM_TEMPLATE = `
    api: apiPlatform({
      baseUrl: process.env.API_URL ?? "http://localhost:3000/api",
      defaultHeaders: { "Content-Type": "application/json" },
    })`;

const WEB_TEST_TEMPLATE = `import { feature, test } from "copilot-test";

test(
  feature("User Authentication")
    .tag("@web")
    .scenario("Successful login")
    .tag("@smoke")
    .given("I am on the login page")
    .when("I enter valid credentials")
    .and("I click the login button")
    .then("I should see the dashboard")
    .done()
    ._build(),
  "web"
);
`;

const API_TEST_TEMPLATE = `import { feature, test } from "copilot-test";

test(
  feature("User API")
    .tag("@api")
    .scenario("Create new user")
    .tag("@smoke")
    .given("I have valid user data")
    .when("I send a POST request to /users")
    .then("I should receive a 201 status code")
    .and("The response should contain the user ID")
    .done()
    ._build(),
  "api"
);
`;

const PACKAGE_JSON_TEMPLATE = {
  name: "<PROJECT_NAME>",
  version: "1.0.0",
  type: "module",
  scripts: {
    test: "copilot-test run",
    "test:web": "copilot-test run tests/*web*.spec.ts",
    "test:api": "copilot-test run tests/*api*.spec.ts",
  },
  dependencies: {
    "copilot-test": "^0.1.0",
  },
  devDependencies: {
    typescript: "^5.0.0",
    tsx: "^4.0.0",
    "@types/node": "^20.0.0",
  },
};

const TSCONFIG_TEMPLATE = {
  compilerOptions: {
    target: "ES2022",
    module: "NodeNext",
    moduleResolution: "NodeNext",
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    types: ["node"],
  },
  include: ["tests/**/*.ts", "copilot-test.config.ts"],
};

const README_TEMPLATE = `# <PROJECT_NAME>

AI-driven test suite powered by Copilot Test

## Getting Started

1. Set up your environment variables (optional):
   \`\`\`bash
   export BASE_URL=http://localhost:3000
   export API_URL=http://localhost:3000/api
   \`\`\`

2. Run tests:
   \`\`\`bash
   npm test
   \`\`\`

3. View reports:
   Open \`copilot-test-results/index.html\` in your browser

## Commands

- \`npm test\` - Run all tests
- \`npm run test:web\` - Run web tests only
- \`npm run test:api\` - Run API tests only
- \`copilot-test list\` - List all available tests
- \`copilot-test validate\` - Validate configuration

## Documentation

Visit [Copilot Test Documentation](https://github.com/copilot-test/copilot-test)
`;

export async function initCommand(args: string[]) {
  console.log("🚀 Initialize Copilot Test Project\n");

  // Check if already initialized
  if (fs.existsSync("copilot-test.config.ts") || fs.existsSync("copilot-test.config.js")) {
    console.error("❌ Project already initialized (config file exists)");
    process.exit(1);
  }

  // Get project information
  const projectName = await prompt("Project name:", path.basename(process.cwd()));
  const platforms = await promptPlatforms();
  const model = await prompt("AI Model:", "gpt-4o");
  const language = await promptLanguage();
  const installDeps = await promptYesNo("Install dependencies now?", true);

  console.log();

  // Create configuration file
  const configContent = buildConfigContent(model, platforms);
  const configFile = language === "typescript" ? "copilot-test.config.ts" : "copilot-test.config.js";

  spinner.start("Creating configuration file");
  fs.writeFileSync(configFile, configContent);
  spinner.succeed(`Created ${configFile}`);

  // Create tests directory
  spinner.start("Creating tests directory");
  if (!fs.existsSync("tests")) {
    fs.mkdirSync("tests");
  }
  spinner.succeed("Created tests/ directory");

  // Create example test files
  if (platforms.includes("web")) {
    spinner.start("Creating web test example");
    fs.writeFileSync("tests/login.spec.ts", WEB_TEST_TEMPLATE);
    spinner.succeed("Created tests/login.spec.ts");
  }

  if (platforms.includes("api")) {
    spinner.start("Creating API test example");
    fs.writeFileSync("tests/api-users.spec.ts", API_TEST_TEMPLATE);
    spinner.succeed("Created tests/api-users.spec.ts");
  }

  // Create package.json if it doesn't exist
  if (!fs.existsSync("package.json")) {
    spinner.start("Creating package.json");
    const packageJson = JSON.stringify(
      { ...PACKAGE_JSON_TEMPLATE, name: projectName },
      null,
      2
    );
    fs.writeFileSync("package.json", packageJson);
    spinner.succeed("Created package.json");
  }

  // Create tsconfig.json for TypeScript projects
  if (language === "typescript" && !fs.existsSync("tsconfig.json")) {
    spinner.start("Creating tsconfig.json");
    fs.writeFileSync("tsconfig.json", JSON.stringify(TSCONFIG_TEMPLATE, null, 2));
    spinner.succeed("Created tsconfig.json");
  }

  // Create .gitignore
  if (!fs.existsSync(".gitignore")) {
    spinner.start("Creating .gitignore");
    fs.writeFileSync(
      ".gitignore",
      "node_modules/\ncopilot-test-results/\n.env\ndist/\n*.log\n"
    );
    spinner.succeed("Created .gitignore");
  }

  // Create README
  if (!fs.existsSync("README.md")) {
    spinner.start("Creating README.md");
    fs.writeFileSync("README.md", README_TEMPLATE.replace(/<PROJECT_NAME>/g, projectName));
    spinner.succeed("Created README.md");
  }

  // Install dependencies
  if (installDeps) {
    spinner.start("Installing dependencies (this may take a moment)");
    try {
      execSync("npm install", { stdio: "ignore" });
      spinner.succeed("Dependencies installed");
    } catch (error) {
      spinner.fail("Failed to install dependencies");
      console.log("You can install them manually by running: npm install");
    }
  }

  console.log("\n✅ Project initialized successfully!\n");
  console.log("Next steps:");
  console.log("  1. Review copilot-test.config.ts and adjust settings");
  console.log("  2. Set up environment variables (BASE_URL, API_URL, etc.)");
  console.log(`  3. Run tests: ${installDeps ? "npm test" : "npm install && npm test"}`);
  console.log();
}

function buildConfigContent(model: string, platforms: string[]): string {
  let platformsContent = "";

  if (platforms.includes("web")) {
    platformsContent += WEB_PLATFORM_TEMPLATE;
  }

  if (platforms.includes("api")) {
    if (platformsContent) platformsContent += ",";
    platformsContent += API_PLATFORM_TEMPLATE;
  }

  return CONFIG_TEMPLATE.replace("<MODEL>", model).replace("<PLATFORMS>", platformsContent);
}

async function promptPlatforms(): Promise<string[]> {
  console.log("Which platforms? (Enter comma-separated values: web, api)");
  const input = await prompt("Platforms:", "web,api");
  return input.split(",").map((p) => p.trim().toLowerCase()).filter(Boolean);
}

async function promptLanguage(): Promise<"typescript" | "javascript"> {
  const input = await prompt("TypeScript or JavaScript?", "TypeScript");
  return input.toLowerCase().startsWith("t") ? "typescript" : "javascript";
}

async function promptYesNo(question: string, defaultValue: boolean): Promise<boolean> {
  const input = await prompt(`${question}:`, defaultValue ? "yes" : "no");
  const normalized = input.toLowerCase();
  return normalized === "yes" || normalized === "y";
}
