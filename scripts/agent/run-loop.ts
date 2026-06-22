import { runManualLoop } from "../../packages/core/src/index.js";

const args = parseArgs(process.argv.slice(2));
if (!args.manifest || !args.verify_command) {
  console.error("Usage: npm run agent:run-loop -- --manifest .agent-runs/<run-id>/manifest.json --verify-command \"npm run test:focused\"");
  process.exit(1);
}

const result = await runManualLoop(process.cwd(), {
  manifestPath: args.manifest,
  verifyCommand: args.verify_command,
  maxIterations: args.max_iterations ? Number(args.max_iterations) : undefined
});

if (!result.ok) {
  console.error("Manual loop failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Stop receipt written: ${result.stopReceiptFile}`);

function parseArgs(rawArgs: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    const next = rawArgs[index + 1];
    if (arg.startsWith("--") && next) {
      parsed[arg.slice(2).replaceAll("-", "_")] = next;
      index += 1;
    }
  }
  return parsed;
}
