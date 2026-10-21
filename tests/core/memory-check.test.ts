import { cp, mkdir, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runMemoryCheck } from "../../packages/core/src/index.js";

describe("memory check", () => {
  afterEach(() => vi.restoreAllMocks());

  it("passes for the canonical scaffold memory surface", async () => {
    // Freeze file history too: a new HEAD does not make old documentation fresh.
    const repo = await mkdtemp(path.join(os.tmpdir(), "project-scaffold-canonical-"));
    const excluded = new Set([".git", "node_modules", ".agent-context", ".agent-runs", "gpt-pro-audit"]);
    await cp(process.cwd(), repo, { recursive: true,
      filter: (source) => !excluded.has(path.relative(process.cwd(), source).split(path.sep)[0]) });
    git(repo, "init", "--template=", "--initial-branch=main");
    git(repo, "add", ".");
    git(repo, "commit", "-m", "Canonical memory fixture");
    vi.spyOn(Date, "now").mockReturnValue(committedAt);
    const result = await runMemoryCheck(repo);

    expect(result.ok).toBe(true);
    expect(result.score).toBe(100);
    expect(result.checked.routes).toBeGreaterThan(0);
    expect(result.checked.skills).toBeGreaterThan(0);
  });

  const committedAt = Date.parse("2026-01-01T00:00:00Z");
  const day = 86400 * 1000;
  const gitEnv = { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_AUTHOR_DATE: "2026-01-01T00:00:00Z", GIT_COMMITTER_DATE: "2026-01-01T00:00:00Z" };
  const git = (repo: string, ...args: string[]) => execFileSync("git", ["-c", "core.hooksPath=/dev/null",
    "-c", "commit.gpgSign=false", "-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", ...args],
    { cwd: repo, env: gitEnv, stdio: "pipe" });

  async function freshnessFixture() {
    const repo = await mkdtemp(path.join(os.tmpdir(), "project-scaffold-freshness-"));
    await mkdir(path.join(repo, "docs", "agents"), { recursive: true });
    await mkdir(path.join(repo, "contracts", "agent-governance"), { recursive: true });
    for (const [file, content] of Object.entries({
      "package.json": JSON.stringify({ scripts: {} }),
      "REPO_PROFILE.json": JSON.stringify({ readFirst: ["README.md"] }),
      "contracts/agent-governance/router.json": JSON.stringify({ routes: [] }),
      "README.md": "# Freshness fixture\n",
      "CLI_INDEX.md": "", "SKILLS_INDEX.md": "", "docs/agents/ROUTING.md": ""
    })) await writeFile(path.join(repo, file), content);
    git(repo, "init", "--template=", "--initial-branch=main");
    git(repo, "add", "README.md");
    git(repo, "commit", "-m", "Document baseline");
    return repo;
  }

  it("preserves exact day-age boundaries and freshness penalties", async () => {
    const repo = await freshnessFixture();
    const clock = vi.spyOn(Date, "now");
    for (const [days, severity, score] of [
      [0, undefined, 100], [90, undefined, 100], [91, "warning", 97],
      [180, "warning", 97], [181, "error", 90]
    ] as const) {
      clock.mockReturnValue(committedAt + days * day);
      const result = await runMemoryCheck(repo);
      expect(result.ok).toBe(severity !== "error");
      expect(result.score).toBe(score);
      expect(result.checked.staleFiles).toBe(severity ? 1 : 0);
      expect(result.issues).toEqual(severity ? [{ severity, code: "stale-scaffold-file", file: "README.md",
        message: `README.md ${severity === "error" ? "is" : "may be"} stale: 0 commits and ${days} days since last update` }] : []);
    }
  });

  it("preserves exact commit-distance boundaries independently of age", async () => {
    const repo = await freshnessFixture();
    vi.spyOn(Date, "now").mockReturnValue(committedAt);
    let distance = 0;
    for (const [commits, severity, score] of [
      [50, undefined, 100], [51, "warning", 97], [200, "warning", 97], [201, "error", 90]
    ] as const) {
      while (distance < commits) git(repo, "commit", "--allow-empty", "-m", `Fixture change ${++distance}`);
      const result = await runMemoryCheck(repo);
      expect(result.ok).toBe(severity !== "error");
      expect(result.score).toBe(score);
      expect(result.checked.staleFiles).toBe(severity ? 1 : 0);
      expect(result.issues).toEqual(severity ? [{ severity, code: "stale-scaffold-file", file: "README.md",
        message: `README.md ${severity === "error" ? "is" : "may be"} stale: ${commits} commits and 0 days since last update` }] : []);
    }
  }, 30000);

  it("fails for broken links and missing npm scripts", async () => {
    const repo = await mkdtemp(path.join(os.tmpdir(), "project-scaffold-memory-"));
    await mkdir(path.join(repo, "docs", "agents"), { recursive: true });
    await mkdir(path.join(repo, "contracts", "agent-governance"), { recursive: true });
    await mkdir(path.join(repo, "contracts", "agent-governance", "personas"), { recursive: true });
    await mkdir(path.join(repo, "skills", "known-skill"), { recursive: true });
    await writeFile(path.join(repo, "skills", "known-skill", "SKILL.md"), "---\nname: known-skill\ndescription: test\nlicense: test\n---\n");
    await writeFile(path.join(repo, "package.json"), JSON.stringify({ scripts: { check: "echo ok" } }));
    await writeFile(path.join(repo, "REPO_PROFILE.json"), JSON.stringify({ readFirst: ["README.md"] }));
    await writeFile(path.join(repo, "CLI_INDEX.md"), "`npm run check`\n");
    await writeFile(path.join(repo, "SKILLS_INDEX.md"), "`known-skill`\n");
    await writeFile(path.join(repo, "README.md"), "[missing](docs/missing.md)\n\n```bash\nnpm run gone\n```\n");
    await writeFile(path.join(repo, "docs", "agents", "ROUTING.md"), "`known-route`\n");
    await writeFile(
      path.join(repo, "contracts", "agent-governance", "router.json"),
      JSON.stringify({ routes: [{ id: "known-route", requiredSkills: ["known-skill", "missing-skill"] }] })
    );

    const result = await runMemoryCheck(repo);

    expect(result.ok).toBe(false);
    expect(result.score).toBeLessThan(100);
    expect(result.errors.join("\n")).toContain("links to missing local path");
    expect(result.errors.join("\n")).toContain("references missing npm script: gone");
    expect(result.errors.join("\n")).toContain("governance references missing skill folder: missing-skill");
  });

  it("warns when CLI_INDEX omits package scripts", async () => {
    const repo = await mkdtemp(path.join(os.tmpdir(), "project-scaffold-cli-index-"));
    await mkdir(path.join(repo, "docs", "agents"), { recursive: true });
    await mkdir(path.join(repo, "contracts", "agent-governance"), { recursive: true });
    await writeFile(path.join(repo, "package.json"), JSON.stringify({ scripts: { check: "echo ok", lint: "echo lint" } }));
    await writeFile(path.join(repo, "REPO_PROFILE.json"), JSON.stringify({ readFirst: ["README.md"] }));
    await writeFile(path.join(repo, "README.md"), "npm run check\n");
    await writeFile(path.join(repo, "CLI_INDEX.md"), "`npm run check`\n");
    await writeFile(path.join(repo, "SKILLS_INDEX.md"), "");
    await writeFile(path.join(repo, "docs", "agents", "ROUTING.md"), "");
    await writeFile(path.join(repo, "contracts", "agent-governance", "router.json"), JSON.stringify({ routes: [] }));

    const result = await runMemoryCheck(repo);

    expect(result.ok).toBe(true);
    expect(result.score).toBe(97);
    expect(result.warnings).toContain("CLI_INDEX.md does not document package script: lint");
  });

  it("warns when SKILLS_INDEX omits repo-local skills", async () => {
    const repo = await mkdtemp(path.join(os.tmpdir(), "project-scaffold-skills-index-"));
    await mkdir(path.join(repo, "docs", "agents"), { recursive: true });
    await mkdir(path.join(repo, "contracts", "agent-governance"), { recursive: true });
    await mkdir(path.join(repo, "skills", "indexed-skill"), { recursive: true });
    await mkdir(path.join(repo, "skills", "missing-index-skill"), { recursive: true });
    await writeFile(path.join(repo, "skills", "indexed-skill", "SKILL.md"), "---\nname: indexed-skill\ndescription: test\nlicense: test\n---\n");
    await writeFile(path.join(repo, "skills", "missing-index-skill", "SKILL.md"), "---\nname: missing-index-skill\ndescription: test\nlicense: test\n---\n");
    await writeFile(path.join(repo, "package.json"), JSON.stringify({ scripts: {} }));
    await writeFile(path.join(repo, "REPO_PROFILE.json"), JSON.stringify({ readFirst: ["README.md"] }));
    await writeFile(path.join(repo, "README.md"), "");
    await writeFile(path.join(repo, "CLI_INDEX.md"), "");
    await writeFile(path.join(repo, "SKILLS_INDEX.md"), "`indexed-skill`\n");
    await writeFile(path.join(repo, "docs", "agents", "ROUTING.md"), "");
    await writeFile(path.join(repo, "contracts", "agent-governance", "router.json"), JSON.stringify({ routes: [] }));

    const result = await runMemoryCheck(repo);

    expect(result.ok).toBe(true);
    expect(result.score).toBe(97);
    expect(result.checked.skills).toBe(2);
    expect(result.warnings).toContain("SKILLS_INDEX.md does not document repo-local skill: missing-index-skill");
  });
});
