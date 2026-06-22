import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

type PackageJson = {
  scripts?: Record<string, string>;
};

type RepoProfile = {
  readFirst: string[];
};

type Router = {
  routes: Array<{ id: string; requiredSkills?: string[] }>;
};

type Persona = {
  id: string;
  requiredSkills?: string[];
};

export type MemoryCheckResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  checked: {
    files: number;
    links: number;
    commands: number;
    routes: number;
    skills: number;
  };
};

const ignoredRootEntries = new Set([
  ".git",
  "node_modules",
  "gpt-pro-audit",
  ".agent-context",
  ".agent-runs",
  ".DS_Store"
]);

export async function runMemoryCheck(repoRoot: string): Promise<MemoryCheckResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const files = await listRepoFiles(repoRoot);
  const markdownFiles = files.filter((file) => file.endsWith(".md"));
  const packageJson = await readJson<PackageJson>(repoRoot, "package.json");
  const repoProfile = await readJson<RepoProfile>(repoRoot, "REPO_PROFILE.json");
  const router = await readJson<Router>(repoRoot, "contracts/agent-governance/router.json");
  const scripts = packageJson.scripts ?? {};
  let links = 0;
  let commands = 0;

  for (const file of repoProfile.readFirst) {
    if (!files.includes(file.replace(/\/$/, "")) && !files.some((candidate) => candidate.startsWith(file))) {
      errors.push(`REPO_PROFILE readFirst points to missing path: ${file}`);
    }
  }

  for (const file of markdownFiles) {
    const content = await readFile(path.join(repoRoot, file), "utf8");
    for (const link of localMarkdownLinks(content)) {
      links += 1;
      const target = link.split("#")[0];
      if (!target) {
        continue;
      }
      const resolved = path.normalize(path.join(path.dirname(file), target));
      if (!files.includes(resolved) && !files.some((candidate) => candidate.startsWith(`${resolved}/`))) {
        errors.push(`${file} links to missing local path: ${link}`);
      }
    }
    for (const command of npmRunCommands(content)) {
      commands += 1;
      if (!scripts[command] && command !== "test") {
        errors.push(`${file} references missing npm script: ${command}`);
      }
    }
    if (/(TODO|FIXME)/i.test(content) && file.startsWith("docs/governance/")) {
      warnings.push(`${file} contains TODO/FIXME marker`);
    }
  }

  const routing = await readFile(path.join(repoRoot, "docs/agents/ROUTING.md"), "utf8");
  for (const route of router.routes) {
    if (!routing.includes(`\`${route.id}\``)) {
      errors.push(`docs/agents/ROUTING.md does not document route: ${route.id}`);
    }
  }

  const requiredSkills = new Set<string>();
  for (const route of router.routes) {
    for (const skill of route.requiredSkills ?? []) {
      requiredSkills.add(skill);
    }
  }
  const personaFiles = files.filter((file) => file.startsWith("contracts/agent-governance/personas/") && file.endsWith(".json"));
  for (const file of personaFiles) {
    const persona = await readJson<Persona>(repoRoot, file);
    for (const skill of persona.requiredSkills ?? []) {
      requiredSkills.add(skill);
    }
  }
  for (const skill of requiredSkills) {
    if (!files.includes(`skills/${skill}/SKILL.md`)) {
      errors.push(`governance references missing skill folder: ${skill}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    checked: {
      files: files.length,
      links,
      commands,
      routes: router.routes.length,
      skills: requiredSkills.size
    }
  };
}

function localMarkdownLinks(content: string): string[] {
  const links: string[] = [];
  const pattern = /!?\[[^\]]*]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const raw = match[1].trim().replace(/^<|>$/g, "");
    if (
      raw.startsWith("http://") ||
      raw.startsWith("https://") ||
      raw.startsWith("mailto:") ||
      raw.startsWith("#")
    ) {
      continue;
    }
    links.push(raw);
  }
  return links;
}

function npmRunCommands(content: string): string[] {
  return [...content.matchAll(/\bnpm run ([a-zA-Z0-9:_-]+)/g)].map((match) => match[1]);
}

async function listRepoFiles(repoRoot: string, prefix = ""): Promise<string[]> {
  const entries = await readdir(path.join(repoRoot, prefix), { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (prefix === "" && ignoredRootEntries.has(entry.name)) {
      continue;
    }
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listRepoFiles(repoRoot, relative)));
    } else {
      files.push(relative);
    }
  }

  return files.sort();
}

async function readJson<T>(repoRoot: string, file: string): Promise<T> {
  return JSON.parse(await readFile(path.join(repoRoot, file), "utf8")) as T;
}
