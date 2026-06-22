import { validateAgentGovernance } from "../../packages/core/src/index.js";

const result = await validateAgentGovernance(process.cwd());

if (!result.ok) {
  console.error("Agent governance validation failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Agent governance validation passed: ${result.checked.artifacts} artifacts, ` +
    `${result.checked.routes} routes, ${result.checked.assignments} assignments, ` +
    `${result.checked.contextProfiles} context profiles, ${result.checked.workflows} workflows, ` +
    `${result.checked.loops} loops, ${result.checked.hooks} hooks, ` +
    `${result.checked.receiptPolicies} receipt policies.`
);
