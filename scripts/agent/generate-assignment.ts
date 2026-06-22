import { generateAgentAssignment, type GenerateAssignmentOptions } from "../../packages/core/src/index.js";

const options = parseArgs(process.argv.slice(2));
const result = await generateAgentAssignment(process.cwd(), options);

if (!result.ok) {
  console.error("Assignment generation failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Assignment written: ${result.file}`);

function parseArgs(args: string[]): GenerateAssignmentOptions {
  const options: GenerateAssignmentOptions = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];
    if (arg === "--id" && next) {
      options.id = next;
      index += 1;
    } else if (arg === "--summary" && next) {
      options.summary = next;
      index += 1;
    } else if (arg === "--risk" && next) {
      options.risk = next as GenerateAssignmentOptions["risk"];
      index += 1;
    } else if (arg === "--route" && next) {
      options.routeId = next;
      index += 1;
    } else if (arg === "--allowed-paths" && next) {
      options.allowedPaths = next.split(",").map((item) => item.trim()).filter(Boolean);
      index += 1;
    } else if (arg === "--output" && next) {
      options.output = next;
      index += 1;
    }
  }
  return options;
}
