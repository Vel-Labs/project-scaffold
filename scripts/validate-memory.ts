import { runMemoryCheck } from "../packages/core/src/index.js";

const json = process.argv.includes("--json");
const result = await runMemoryCheck(process.cwd());

if (json) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

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
  `Memory check passed: score ${result.score}/100, ${result.checked.files} files, ${result.checked.links} links, ${result.checked.commands} commands, ${result.checked.dependencies} dependency claims, ${result.checked.routes} routes, ${result.checked.skills} skills, ${result.checked.staleFiles} stale files.`
);
