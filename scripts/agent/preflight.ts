import { execFileSync } from "node:child_process";

for (const command of [
  ["npm", ["run", "validate:agents"]],
  ["npm", ["run", "validate:assignment"]]
] as const) {
  execFileSync(command[0], command[1], { stdio: "inherit" });
}

console.log("Agent preflight passed.");
