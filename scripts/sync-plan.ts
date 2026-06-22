import { readFile } from "node:fs/promises";
import path from "node:path";
import { runMemoryCheck } from "../packages/core/src/index.js";

const repoRoot = process.cwd();
const result = await runMemoryCheck(repoRoot);

if (result.issues.length === 0) {
  console.log(`Scaffold memory is in sync: score ${result.score}/100.`);
  process.exit(0);
}

const actionable = result.issues.filter((issue) => issue.severity !== "info");
const files = [...new Set(actionable.map((issue) => issue.file).filter((file): file is string => Boolean(file)))];

console.log(`# Scaffold Sync Plan\n`);
console.log(`Drift score: ${result.score}/100`);
console.log(`Errors: ${result.errors.length}`);
console.log(`Warnings: ${result.warnings.length}\n`);
console.log(`## Issues\n`);
for (const issue of actionable) {
  console.log(`- ${issue.severity.toUpperCase()} ${issue.code}${issue.file ? ` (${issue.file})` : ""}: ${issue.message}`);
}

console.log(`\n## Targeted Prompt\n`);
console.log(`Use this prompt with Codex or another coding agent. Do not run it automatically.\n`);
console.log("```text");
console.log("Fix scaffold memory drift only in the files listed below.");
console.log("Do not rewrite unrelated docs. Do not change implementation code unless the listed issue explicitly requires it.");
console.log("After edits, run `npm run scaffold:memory-check` and report the new score.");
console.log("");
console.log("Issues:");
for (const issue of actionable) {
  console.log(`- ${issue.severity.toUpperCase()} ${issue.code}${issue.file ? ` (${issue.file})` : ""}: ${issue.message}`);
}
console.log("");
console.log("Relevant file snippets:");
for (const file of files.slice(0, 8)) {
  console.log(`\n--- ${file} ---`);
  console.log(await snippet(file));
}
console.log("```");

async function snippet(file: string): Promise<string> {
  try {
    const content = await readFile(path.join(repoRoot, file), "utf8");
    const lines = content.split("\n").slice(0, 80).join("\n");
    return lines.length < content.length ? `${lines}\n[truncated]` : lines;
  } catch {
    return "[file could not be read]";
  }
}
