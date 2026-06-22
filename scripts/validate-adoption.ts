import { readFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const errors: string[] = [];
const allowedTemplatePlaceholders = new Set(
  (await readJson<{ allowedTemplatePlaceholders: string[] }>("REPO_PROFILE.json")).allowedTemplatePlaceholders
);
const requiredGeneratedRepoFiles = [
  "AGENTS.md",
  "REPO_PROFILE.json",
  "contracts/agent-governance/policy.json",
  "contracts/agent-governance/router.json",
  "contracts/agent-governance/assignments/scoped-change.json",
  "contracts/agent-governance/context-profiles/scoped-change.json"
];

for (const file of requiredGeneratedRepoFiles) {
  await assertNoUnknownPlaceholders(file);
}

if (errors.length > 0) {
  console.error("Adoption validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Adoption validation passed.");

async function assertNoUnknownPlaceholders(file: string): Promise<void> {
  const content = await readFile(path.join(repoRoot, file), "utf8");
  const placeholders = content.match(/<[A-Z0-9_ -]+>/g) ?? [];
  for (const placeholder of placeholders) {
    if (!allowedTemplatePlaceholders.has(placeholder)) {
      errors.push(`${file} contains unregistered adoption placeholder ${placeholder}`);
    }
  }
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(path.join(repoRoot, file), "utf8")) as T;
}
