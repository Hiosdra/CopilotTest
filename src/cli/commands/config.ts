import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

const CONFIG_DIR = path.join(os.homedir(), ".copilot-test");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

interface GlobalConfig {
  model?: string;
  headless?: boolean;
  parallel?: boolean;
  [key: string]: any;
}

export async function configCommand(args: string[]) {
  const subcommand = args[0];

  if (!subcommand) {
    console.error("❌ Missing subcommand");
    console.error("\nUsage:");
    console.error("  copilot-test config set <key> <value>");
    console.error("  copilot-test config get <key>");
    console.error("  copilot-test config list");
    console.error("  copilot-test config delete <key>");
    process.exit(1);
  }

  switch (subcommand) {
    case "set":
      await setConfig(args[1], args[2]);
      break;
    case "get":
      await getConfig(args[1]);
      break;
    case "list":
      await listConfig();
      break;
    case "delete":
      await deleteConfig(args[1]);
      break;
    default:
      console.error(`❌ Unknown subcommand: ${subcommand}`);
      process.exit(1);
  }
}

async function setConfig(key: string | undefined, value: string | undefined) {
  if (!key || !value) {
    console.error("❌ Missing key or value");
    console.error("\nUsage: copilot-test config set <key> <value>");
    process.exit(1);
  }

  const config = loadConfig();

  // Parse value (handle booleans and numbers)
  let parsedValue: any = value;
  if (value === "true") parsedValue = true;
  else if (value === "false") parsedValue = false;
  else if (!isNaN(Number(value))) parsedValue = Number(value);

  config[key] = parsedValue;
  saveConfig(config);

  console.log(`✅ Set ${key} = ${parsedValue}`);
}

async function getConfig(key: string | undefined) {
  if (!key) {
    console.error("❌ Missing key");
    console.error("\nUsage: copilot-test config get <key>");
    process.exit(1);
  }

  const config = loadConfig();

  if (key in config) {
    console.log(config[key]);
  } else {
    console.error(`❌ Config key not found: ${key}`);
    process.exit(1);
  }
}

async function listConfig() {
  const config = loadConfig();

  if (Object.keys(config).length === 0) {
    console.log("No configuration set");
    console.log("\nSet config with: copilot-test config set <key> <value>");
    return;
  }

  console.log("Global Configuration:\n");

  for (const [key, value] of Object.entries(config)) {
    console.log(`  ${key}: ${value}`);
  }
}

async function deleteConfig(key: string | undefined) {
  if (!key) {
    console.error("❌ Missing key");
    console.error("\nUsage: copilot-test config delete <key>");
    process.exit(1);
  }

  const config = loadConfig();

  if (!(key in config)) {
    console.error(`❌ Config key not found: ${key}`);
    process.exit(1);
  }

  delete config[key];
  saveConfig(config);

  console.log(`✅ Deleted ${key}`);
}

function loadConfig(): GlobalConfig {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {};
  }

  try {
    const content = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("⚠️  Warning: Could not read config file, using defaults");
    return {};
  }
}

function saveConfig(config: GlobalConfig) {
  // Ensure config directory exists
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}
