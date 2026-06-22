import { mkdir, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runMemoryCheck } from "../../packages/core/src/index.js";

describe("memory check", () => {
  it("passes for the canonical scaffold memory surface", async () => {
    const result = await runMemoryCheck(process.cwd());

    expect(result.ok).toBe(true);
    expect(result.checked.routes).toBeGreaterThan(0);
    expect(result.checked.skills).toBeGreaterThan(0);
  });

  it("fails for broken links and missing npm scripts", async () => {
    const repo = await mkdtemp(path.join(os.tmpdir(), "project-scaffold-memory-"));
    await mkdir(path.join(repo, "docs", "agents"), { recursive: true });
    await mkdir(path.join(repo, "contracts", "agent-governance"), { recursive: true });
    await mkdir(path.join(repo, "contracts", "agent-governance", "personas"), { recursive: true });
    await mkdir(path.join(repo, "skills", "known-skill"), { recursive: true });
    await writeFile(path.join(repo, "skills", "known-skill", "SKILL.md"), "---\nname: known-skill\ndescription: test\nlicense: test\n---\n");
    await writeFile(path.join(repo, "package.json"), JSON.stringify({ scripts: { check: "echo ok" } }));
    await writeFile(path.join(repo, "REPO_PROFILE.json"), JSON.stringify({ readFirst: ["README.md"] }));
    await writeFile(path.join(repo, "README.md"), "[missing](docs/missing.md)\n\n```bash\nnpm run gone\n```\n");
    await writeFile(path.join(repo, "docs", "agents", "ROUTING.md"), "`known-route`\n");
    await writeFile(
      path.join(repo, "contracts", "agent-governance", "router.json"),
      JSON.stringify({ routes: [{ id: "known-route", requiredSkills: ["known-skill", "missing-skill"] }] })
    );

    const result = await runMemoryCheck(repo);

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("links to missing local path");
    expect(result.errors.join("\n")).toContain("references missing npm script: gone");
    expect(result.errors.join("\n")).toContain("governance references missing skill folder: missing-skill");
  });
});
