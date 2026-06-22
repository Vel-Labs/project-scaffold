import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

type RepoProfile = {
  rootPolicy: {
    keepAtRoot: string[];
    rootDocsAllowed: string[];
  };
  canonicalPaths: Record<string, string>;
  commands: Record<string, string>;
  readFirst: string[];
  governanceLocked: string[];
  forbiddenRootDirectoriesBeforeProjectAdoption: string[];
  allowedTemplatePlaceholders: string[];
};

const repoRoot = process.cwd();
const errors: string[] = [];
const ignoredRootEntries = new Set([".git", "node_modules", "gpt-pro-audit", ".DS_Store"]);
const profile = await readJson<RepoProfile>("REPO_PROFILE.json");
const packageJson = await readJson<{ scripts?: Record<string, string> }>("package.json");

await assertPathsExist([
  ...Object.values(profile.canonicalPaths),
  ...profile.readFirst,
  ...profile.governanceLocked
]);
await assertRootIsClean(profile.rootPolicy.keepAtRoot);
assertProfileCommandsExist(profile.commands, packageJson.scripts ?? {});
await assertForbiddenRootDirsAbsent(profile.forbiddenRootDirectoriesBeforeProjectAdoption);
await assertSkillFolders();
await assertFileTreeCurrent();
await assertOnlyAllowedPlaceholders(profile.allowedTemplatePlaceholders);

if (errors.length > 0) {
  console.error("Scaffold validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Scaffold validation passed.");

async function assertPathsExist(paths: string[]): Promise<void> {
  for (const target of paths) {
    try {
      await access(path.join(repoRoot, target));
    } catch {
      errors.push(`missing required path: ${target}`);
    }
  }
}

async function assertRootIsClean(allowedRootEntries: string[]): Promise<void> {
  const allowed = new Set(allowedRootEntries.map((entry) => entry.replace(/\/$/, "")));
  const entries = await readdir(repoRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoredRootEntries.has(entry.name)) {
      continue;
    }
    if (!allowed.has(entry.name)) {
      errors.push(`unexpected root entry: ${entry.name}`);
    }
  }
}

function assertProfileCommandsExist(
  commands: Record<string, string>,
  scripts: Record<string, string>
): void {
  for (const [name, command] of Object.entries(commands)) {
    const scriptName = command.match(/^npm (?:run )?([^ ]+)$/)?.[1];
    if (scriptName && scriptName !== "test" && !scripts[scriptName]) {
      errors.push(`REPO_PROFILE command "${name}" references missing package script "${scriptName}"`);
    }
    if (scriptName === "test" && !scripts.test) {
      errors.push(`REPO_PROFILE command "${name}" references missing package script "test"`);
    }
  }
}

async function assertForbiddenRootDirsAbsent(dirs: string[]): Promise<void> {
  for (const dir of dirs) {
    try {
      await access(path.join(repoRoot, dir));
      errors.push(`forbidden downstream root directory exists before project adoption: ${dir}`);
    } catch {
      // Missing is the expected template state.
    }
  }
}

async function assertFileTreeCurrent(): Promise<void> {
  const actual = await listRepoFiles();
  const expected = `# File Tree\n\n\`\`\`text\n${actual.join("\n")}\n\`\`\`\n`;
  const current = await readFile(path.join(repoRoot, "docs/FILE_TREE.md"), "utf8");
  if (current !== expected) {
    errors.push("docs/FILE_TREE.md is stale; regenerate it from current repo files");
  }
}

async function assertSkillFolders(): Promise<void> {
  const skillsDir = path.join(repoRoot, "skills");
  const entries = await readdir(skillsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const skillFile = path.join("skills", entry.name, "SKILL.md");
    try {
      const content = await readFile(path.join(repoRoot, skillFile), "utf8");
      if (!content.startsWith("---\n")) {
        errors.push(`${skillFile} is missing YAML frontmatter`);
        continue;
      }
      const frontmatter = content.split("---\n")[1] ?? "";
      for (const key of ["name", "description", "license"]) {
        if (!new RegExp(`^${key}:\\s+.+$`, "m").test(frontmatter)) {
          errors.push(`${skillFile} frontmatter is missing "${key}"`);
        }
      }
    } catch {
      errors.push(`missing skill file: ${skillFile}`);
    }
  }
}

async function assertOnlyAllowedPlaceholders(allowed: string[]): Promise<void> {
  const allowedSet = new Set(allowed);
  const files = await listRepoFiles();
  for (const file of files) {
    if (!/\.(md|json|yml|yaml)$/.test(file)) {
      continue;
    }
    const content = await readFile(path.join(repoRoot, file), "utf8");
    const placeholders = content.match(/<[A-Z0-9_ -]+>/g) ?? [];
    for (const placeholder of placeholders) {
      if (!allowedSet.has(placeholder) && !placeholder.startsWith("<x")) {
        errors.push(`${file} contains unregistered template placeholder ${placeholder}`);
      }
    }
  }
}

async function listRepoFiles(dir = repoRoot, prefix = ""): Promise<string[]> {
  const entries = await readdir(path.join(dir, prefix), { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (prefix === "" && ignoredRootEntries.has(entry.name)) {
      continue;
    }
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listRepoFiles(dir, relative)));
    } else {
      files.push(relative);
    }
  }

  return files.sort();
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(path.join(repoRoot, file), "utf8")) as T;
}
