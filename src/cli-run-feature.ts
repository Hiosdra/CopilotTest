/**
 * Simple script to load YAML config, parse .feature.md files from CLI args, and run them.
 * Usage: tsx src/cli-run-feature.ts tests/login.feature.md [more files...]
 */
import { loadConfig } from "./config-loader.js";
import { parseFeatureFile } from "./markdown-parser.js";
import { configure, test, run } from "./runner.js";

async function main() {
  const files = process.argv.slice(2).filter(f => f.endsWith(".feature.md"));

  if (files.length === 0) {
    console.error("Usage: tsx src/cli-run-feature.ts <file.feature.md> [more files...]");
    process.exit(1);
  }

  const config = await loadConfig();
  configure(config);

  for (const file of files) {
    const parsed = await parseFeatureFile(file);
    test(parsed.feature, parsed.platform);
  }

  await run();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
