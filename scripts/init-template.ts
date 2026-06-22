import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

type TemplateVars = Record<string, string>;

const repoRoot = process.cwd();
const args = parseArgs(process.argv.slice(2));
const dryRun = args.dry_run === "true";

const defaults = await readJson<TemplateVars>("template.vars.json");
const replacements = await resolveTemplateVars(defaults, args);
const files = await listEditableFiles(repoRoot);
let changedFiles = 0;

for (const file of files) {
  const absolute = path.join(repoRoot, file);
  const original = await readFile(absolute, "utf8");
  let updated = original;

  for (const [key, value] of Object.entries(replacements)) {
    updated = updated.replaceAll(`<${key}>`, value);
  }

  if (file === "package.json") {
    const pkg = JSON.parse(updated) as { name?: string };
    pkg.name = replacements.PACKAGE_NAME;
    updated = `${JSON.stringify(pkg, null, 2)}\n`;
  }

  if (updated !== original) {
    changedFiles += 1;
    if (!dryRun) {
      await writeFile(absolute, updated);
    }
  }
}

if (!dryRun) {
  await writeFile("template.vars.json", `${JSON.stringify(replacements, null, 2)}\n`);
}

console.log(
  dryRun
    ? `Template dry run complete for ${replacements.PROJECT_NAME}: ${changedFiles} file(s) would change.`
    : `Template initialized for ${replacements.PROJECT_NAME}.`
);

async function resolveTemplateVars(
  defaults: TemplateVars,
  provided: TemplateVars
): Promise<TemplateVars> {
  if (provided.yes === "true") {
    const { yes: _yes, dry_run: _dryRun, ...providedVars } = provided;
    return { ...defaults, ...providedVars };
  }

  const rl = readline.createInterface({ input, output });
  const resolved: TemplateVars = {};
  for (const key of Object.keys(defaults)) {
    const answer = await rl.question(`${key} [${provided[key] ?? defaults[key]}]: `);
    resolved[key] = answer.trim() || provided[key] || defaults[key];
  }
  rl.close();
  return resolved;
}

function parseArgs(rawArgs: string[]): TemplateVars {
  const parsed: TemplateVars = {};
  for (const arg of rawArgs) {
    if (arg === "--yes" || arg === "-y") {
      parsed.yes = "true";
      continue;
    }
    if (arg === "--dry-run") {
      parsed.dry_run = "true";
      continue;
    }
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) {
      parsed[toVarName(match[1])] = match[2];
    }
  }
  return parsed;
}

function toVarName(value: string): string {
  return value.replaceAll("-", "_").toUpperCase();
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(path.join(repoRoot, file), "utf8")) as T;
}

async function listEditableFiles(dir: string, prefix = ""): Promise<string[]> {
  const ignored = new Set([".git", "node_modules", ".agent-context", ".agent-runs", "gpt-pro-audit"]);
  const entries = await readdir(path.join(dir, prefix), { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (ignored.has(entry.name)) {
      continue;
    }
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listEditableFiles(dir, relative)));
    } else if (/\.(md|json|ts|yml|yaml)$/.test(entry.name)) {
      files.push(relative);
    }
  }

  return files.sort();
}
