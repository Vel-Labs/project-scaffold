import { validateAgentAssignmentFile } from "../../packages/core/src/index.js";

const assignmentFile = process.argv[2] ?? "contracts/agent-governance/assignments/scoped-change.json";
const result = await validateAgentAssignmentFile(process.cwd(), assignmentFile);

if (!result.ok) {
  console.error(`Agent assignment validation failed for ${assignmentFile}:`);
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Agent assignment validation passed for ${assignmentFile}.`);
