import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

type TemplateVars = Record<string, string>;

const repoRoot = process.cwd();
const args = parseArgs(process.argv.slice(2));
const dryRun = args.dry_run === "true";

const defaults = await readJson<TemplateVars>("template.vars.json");
const replacements = await resolveTemplateVars(defaults, args);
const packageLock = await preparePackageLock(replacements.PACKAGE_NAME);
const files = await listEditableFiles(repoRoot);
// Validate copied Relay metadata before any initializer write.
if (files.includes("skills/relay-board/templates/project.json")) {
  const board = await readJson<unknown>("skills/relay-board/templates/project.json");
  if (!isObject(board)) throw new Error("Relay project.json must contain an object.");
}
let changedFiles = 0;

for (const file of files) {
  const absolute = path.join(repoRoot, file);
  const original = await readFile(absolute, "utf8");
  let updated = original;

  if (file === "package-lock.json") {
    updated = packageLock ?? original;
  } else if (file === "skills/relay-board/templates/project.json") {
    // Preserve board identity and operator edits on repeated initialization.
    const board = JSON.parse(original);
    if (!board.instance) {
      board.instance = `project-${randomUUID()}`;
      board.title = replacements.PROJECT_NAME;
      board.objective = replacements.STATE_PROJECT_GOAL;
      updated = `${JSON.stringify(board, null, 2)}\n`;
    }
  } else {
    for (const [key, value] of Object.entries(replacements)) {
      const replacement = file.endsWith(".json") ? JSON.stringify(value).slice(1, -1) : value;
      updated = updated.replaceAll(`<${key}>`, () => replacement);
    }
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

async function preparePackageLock(packageName: string): Promise<string | undefined> {
  let original: string;
  try {
    original = await readFile(path.join(repoRoot, "package-lock.json"), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }

  let lock: unknown;
  try {
    lock = JSON.parse(original);
  } catch {
    throw new Error("package-lock.json must contain valid JSON.");
  }
  if (!isObject(lock) || lock.lockfileVersion !== 3 ||
      !isObject(lock.packages) || !isObject(lock.packages[""])) {
    throw new Error('package-lock.json must be a v3 lockfile with object packages and packages[""] entries.');
  }

  // Lock metadata is opaque except for the two root identity names.
  lock.name = packageName;
  lock.packages[""].name = packageName;
  return `${JSON.stringify(lock, null, 2)}\n`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
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
