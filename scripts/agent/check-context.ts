import { checkContextStaleness } from "../../packages/core/src/index.js";

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error("Usage: npm run agent:check-context -- .agent-runs/<run-id>/manifest.json");
  process.exit(1);
}

const result = await checkContextStaleness(process.cwd(), manifestPath);

if (!result.ok) {
  console.error("Context check failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

if (result.stale) {
  console.error("Context pack is stale:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Context pack is current (${result.checked.length} check(s)).`);
