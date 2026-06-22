import { runMemoryCheck } from "../packages/core/src/index.js";

const result = await runMemoryCheck(process.cwd());

if (result.warnings.length > 0) {
  console.warn("Memory check warnings:");
  for (const warning of result.warnings) {
    console.warn(`- ${warning}`);
  }
}

if (!result.ok) {
  console.error("Memory check failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Memory check passed: ${result.checked.files} files, ${result.checked.links} links, ${result.checked.commands} commands, ${result.checked.routes} routes, ${result.checked.skills} skills.`
);
