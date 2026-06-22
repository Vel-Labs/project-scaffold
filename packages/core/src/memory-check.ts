import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

type PackageJson = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
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
  issues: MemoryIssue[];
  score: number;
  checked: {
    files: number;
    links: number;
    commands: number;
    dependencies: number;
    routes: number;
    skills: number;
    staleFiles: number;
  };
};

export type MemoryIssue = {
  severity: "error" | "warning" | "info";
  code: string;
  file?: string;
  message: string;
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
  const issues: MemoryIssue[] = [];
  const files = await listRepoFiles(repoRoot);
  const markdownFiles = files.filter((file) => file.endsWith(".md"));
  const packageJson = await readJson<PackageJson>(repoRoot, "package.json");
  const repoProfile = await readJson<RepoProfile>(repoRoot, "REPO_PROFILE.json");
  const router = await readJson<Router>(repoRoot, "contracts/agent-governance/router.json");
  const cliIndex = await readFile(path.join(repoRoot, "CLI_INDEX.md"), "utf8");
  const skillsIndex = await readFile(path.join(repoRoot, "SKILLS_INDEX.md"), "utf8");
  const scripts = packageJson.scripts ?? {};
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  let links = 0;
  let commands = 0;
  let dependencyClaims = 0;
  let staleFiles = 0;

  for (const file of repoProfile.readFirst) {
    if (!files.includes(file.replace(/\/$/, "")) && !files.some((candidate) => candidate.startsWith(file))) {
      issues.push({
        severity: "error",
        code: "missing-readfirst-path",
        file: "REPO_PROFILE.json",
        message: `REPO_PROFILE readFirst points to missing path: ${file}`
      });
    }
  }

  for (const scriptName of Object.keys(scripts)) {
    const command = scriptName === "test" ? "npm test" : `npm run ${scriptName}`;
    if (!cliIndex.includes(`\`${command}\``)) {
      issues.push({
        severity: "warning",
        code: "undocumented-script",
        file: "CLI_INDEX.md",
        message: `CLI_INDEX.md does not document package script: ${scriptName}`
      });
    }
  }

  for (const file of markdownFiles) {
    const content = await readFile(path.join(repoRoot, file), "utf8");
    const staleness = gitStaleness(repoRoot, file);
    if (staleness) {
      staleFiles += 1;
      issues.push(staleness);
    }
    for (const link of localMarkdownLinks(content)) {
      links += 1;
      const target = link.split("#")[0];
      if (!target) {
        continue;
      }
      const resolved = path.normalize(path.join(path.dirname(file), target));
      if (!files.includes(resolved) && !files.some((candidate) => candidate.startsWith(`${resolved}/`))) {
        issues.push({
          severity: "error",
          code: "missing-local-link",
          file,
          message: `${file} links to missing local path: ${link}`
        });
      }
    }
    for (const command of npmRunCommands(content)) {
      commands += 1;
      if (!scripts[command] && command !== "test") {
        issues.push({
          severity: "error",
          code: "missing-npm-script",
          file,
          message: `${file} references missing npm script: ${command}`
        });
      }
    }
    for (const claim of dependencyVersionClaims(content)) {
      dependencyClaims += 1;
      const installed = dependencies[claim.name];
      if (!installed) {
        issues.push({
          severity: "warning",
          code: "missing-dependency",
          file,
          message: `${file} references dependency ${claim.name} but package.json does not list it`
        });
        continue;
      }
      if (claim.version && !installed.includes(claim.version)) {
        issues.push({
          severity: "warning",
          code: "dependency-version-mismatch",
          file,
          message: `${file} references ${claim.name}@${claim.version} but package.json has ${installed}`
        });
      }
    }
    if (/(TODO|FIXME)/i.test(content) && file.startsWith("docs/governance/")) {
      issues.push({
        severity: "warning",
        code: "governance-placeholder-marker",
        file,
        message: `${file} contains TODO/FIXME marker`
      });
    }
  }

  const routing = await readFile(path.join(repoRoot, "docs/agents/ROUTING.md"), "utf8");
  for (const route of router.routes) {
    if (!routing.includes(`\`${route.id}\``)) {
      issues.push({
        severity: "error",
        code: "undocumented-route",
        file: "docs/agents/ROUTING.md",
        message: `docs/agents/ROUTING.md does not document route: ${route.id}`
      });
    }
  }

  const requiredSkills = new Set<string>();
  const repoSkills = new Set(
    files
      .filter((file) => file.startsWith("skills/") && file.endsWith("/SKILL.md"))
      .map((file) => file.split("/")[1])
  );
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
      issues.push({
        severity: "error",
        code: "missing-skill",
        file: "contracts/agent-governance/",
        message: `governance references missing skill folder: ${skill}`
      });
    }
  }
  for (const skill of repoSkills) {
    if (!skillsIndex.includes(`\`${skill}\``)) {
      issues.push({
        severity: "warning",
        code: "undocumented-skill",
        file: "SKILLS_INDEX.md",
        message: `SKILLS_INDEX.md does not document repo-local skill: ${skill}`
      });
    }
  }
  const errors = issues.filter((issue) => issue.severity === "error").map((issue) => issue.message);
  const warnings = issues.filter((issue) => issue.severity === "warning").map((issue) => issue.message);
  const score = calculateScore(issues);

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    issues,
    score,
    checked: {
      files: files.length,
      links,
      commands,
      dependencies: dependencyClaims,
      routes: router.routes.length,
      skills: repoSkills.size,
      staleFiles
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

function dependencyVersionClaims(content: string): Array<{ name: string; version?: string }> {
  return [...content.matchAll(/\b(?:npm install|npm add|pnpm add|yarn add)[ \t]+(@?[a-zA-Z0-9._/-]+)(?:@([0-9][a-zA-Z0-9._-]*))?/g)]
    .map((match) => ({ name: match[1], version: match[2] }));
}

function gitStaleness(repoRoot: string, file: string): MemoryIssue | undefined {
  try {
    const lastCommit = execFileSync("git", ["log", "-1", "--format=%H", "--", file], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    if (!lastCommit) {
      return undefined;
    }
    const commitsSince = Number(execFileSync("git", ["rev-list", "--count", `${lastCommit}..HEAD`], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim());
    const timestamp = Number(execFileSync("git", ["log", "-1", "--format=%ct", "--", file], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim());
    const daysSince = Math.floor((Date.now() / 1000 - timestamp) / 86400);
    if (commitsSince > 200 || daysSince > 180) {
      return {
        severity: "error",
        code: "stale-scaffold-file",
        file,
        message: `${file} is stale: ${commitsSince} commits and ${daysSince} days since last update`
      };
    }
    if (commitsSince > 50 || daysSince > 90) {
      return {
        severity: "warning",
        code: "stale-scaffold-file",
        file,
        message: `${file} may be stale: ${commitsSince} commits and ${daysSince} days since last update`
      };
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function calculateScore(issues: MemoryIssue[]): number {
  const penalty = issues.reduce((total, issue) => {
    if (issue.severity === "error") {
      return total + 10;
    }
    if (issue.severity === "warning") {
      return total + 3;
    }
    return total + 1;
  }, 0);
  return Math.max(0, 100 - penalty);
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
