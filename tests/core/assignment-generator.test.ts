import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  generateAgentAssignment,
  validateAgentAssignmentFile
} from "../../packages/core/src/index.js";

describe("assignment generator", () => {
  it("writes a route-aligned assignment that validates", async () => {
    const repo = await makeGovernedRepo();
    const result = await generateAgentAssignment(repo, {
      id: "generated-assignment",
      summary: "Generated assignment for one local scaffold change.",
      taskType: "refactor",
      owner: "test-owner",
      reviewer: "test-reviewer",
      allowedPaths: ["contracts/**", "tests/**"],
      doNotTouchPaths: [".env*"],
      dependencies: ["contract-schema"],
      blockedBy: []
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const generated = JSON.parse(await readFile(result.file, "utf8")) as Record<string, unknown>;
    expect(generated).toMatchObject({
      id: "generated-assignment",
      routeId: "scoped-local-change",
      workflowId: "scoped-change",
      makerPersonaId: "implementer",
      verifierPersonaId: "verifier",
      autonomyLevel: "A2",
      taskType: "refactor",
      owner: "test-owner",
      reviewer: "test-reviewer",
      doNotTouchPaths: [".env*"],
      dependencies: ["contract-schema"],
      receiptRequired: true
    });
    const markdown = await readFile(result.markdownFile, "utf8");
    expect(markdown).toContain("# Assignment: generated-assignment");
    expect(markdown).toContain("- Task type: refactor");

    const validation = await validateAgentAssignmentFile(repo, result.file);
    expect(validation.ok).toBe(true);
  });

  it("fails closed for unknown routes", async () => {
    const repo = await makeGovernedRepo();
    const result = await generateAgentAssignment(repo, {
      routeId: "missing-route"
    });

    expect(result).toEqual({
      ok: false,
      errors: ["unknown route: missing-route"]
    });
  });
});

async function makeGovernedRepo(): Promise<string> {
  const repo = await mkdtemp(path.join(os.tmpdir(), "project-scaffold-assignment-"));
  execFileSync("git", ["init"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Test"], { cwd: repo });
  await mkdir(path.join(repo, "contracts", "agent-governance"), { recursive: true });
  await copyDir(
    path.join(process.cwd(), "contracts", "agent-governance"),
    path.join(repo, "contracts", "agent-governance")
  );
  await mkdir(path.join(repo, "skills"), { recursive: true });
  for (const skill of ["agent-assignment-writer", "contract-steward", "core-enforcement", "phase-closeout-audit"]) {
    await mkdir(path.join(repo, "skills", skill), { recursive: true });
  }
  await writeFile(path.join(repo, "README.md"), "test\n");
  execFileSync("git", ["add", "README.md"], { cwd: repo });
  execFileSync("git", ["commit", "-m", "init"], { cwd: repo });
  return repo;
}

async function copyDir(source: string, target: string): Promise<void> {
  await mkdir(target, { recursive: true });
  const { readdir, stat, copyFile } = await import("node:fs/promises");
  for (const entry of await readdir(source)) {
    const sourcePath = path.join(source, entry);
    const targetPath = path.join(target, entry);
    const info = await stat(sourcePath);
    if (info.isDirectory()) {
      await copyDir(sourcePath, targetPath);
    } else {
      await copyFile(sourcePath, targetPath);
    }
  }
}
