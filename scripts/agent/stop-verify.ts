import { execFileSync } from "node:child_process";

execFileSync("npm", ["run", "check"], { stdio: "inherit" });
console.log("Agent stop verifier passed.");
