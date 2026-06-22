import { initializeAgentRun, type RunInitOptions } from "../../packages/core/src/index.js";

const result = await initializeAgentRun(process.cwd(), parseArgs(process.argv.slice(2)));

if (!result.ok) {
  console.error("Run init failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Run initialized: ${result.runId}`);
console.log(`Manifest: ${result.manifestFile}`);
console.log(`Assignment: ${result.assignmentFile}`);
console.log(`Context pack: ${result.contextPackFile}`);

function parseArgs(args: string[]): RunInitOptions {
  const options: RunInitOptions = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];
    if (arg === "--id" && next) {
      options.id = next;
      index += 1;
    } else if (arg === "--summary" && next) {
      options.summary = next;
      index += 1;
    } else if (arg === "--type" && next) {
      options.taskType = next as RunInitOptions["taskType"];
      index += 1;
    } else if (arg === "--risk" && next) {
      options.risk = next as RunInitOptions["risk"];
      index += 1;
    } else if (arg === "--risk-markers" && next) {
      options.riskMarkers = csv(next);
      index += 1;
    } else if (arg === "--owner" && next) {
      options.owner = next;
      index += 1;
    } else if (arg === "--reviewer" && next) {
      options.reviewer = next;
      index += 1;
    } else if (arg === "--allowed-paths" && next) {
      options.allowedPaths = csv(next);
      index += 1;
    } else if (arg === "--do-not-touch" && next) {
      options.doNotTouchPaths = csv(next);
      index += 1;
    }
  }
  return options;
}

function csv(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}
