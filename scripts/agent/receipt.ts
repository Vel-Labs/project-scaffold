import { writeFile } from "node:fs/promises";
import path from "node:path";
import { draftAgentReceipt, writeAgentReceipt } from "../../packages/core/src/index.js";

const args = parseArgs(process.argv.slice(2));

if (args.draft === "true") {
  if (!args.manifest) {
    console.error("Usage: npm run agent:receipt -- --draft --manifest .agent-runs/<run-id>/manifest.json");
    process.exit(1);
  }
  const result = await draftAgentReceipt(process.cwd(), { manifestPath: args.manifest });
  if (!result.ok) {
    console.error("Receipt draft failed:");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }
  const output = args.output ?? path.join(path.dirname(args.manifest), "receipt-draft.json");
  await writeFile(path.resolve(process.cwd(), output), `${JSON.stringify(result.receipt, null, 2)}\n`);
  console.log(`Receipt draft written: ${output}`);
  process.exit(0);
}

if (!args.input) {
  console.error("Usage: npm run agent:receipt -- --input path/to/receipt.json [--promote --audit-reason \"...\"]");
  process.exit(1);
}

const result = await writeAgentReceipt(process.cwd(), args.input, undefined, {
  promote: args.promote === "true",
  auditReason: args.audit_reason
});

if (!result.ok) {
  console.error("Receipt write failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Receipt written: ${result.file}`);

function parseArgs(rawArgs: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    const next = rawArgs[index + 1];
    if (arg === "--draft") {
      parsed.draft = "true";
    } else if (arg === "--promote") {
      parsed.promote = "true";
    } else if (arg.startsWith("--") && next) {
      parsed[arg.slice(2).replaceAll("-", "_")] = next;
      index += 1;
    }
  }
  return parsed;
}
