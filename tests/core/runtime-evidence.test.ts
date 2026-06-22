import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  buildContextPack,
  checkContextStaleness,
  draftAgentReceipt,
  initializeAgentRun,
  runManualLoop,
  writeAgentReceipt
} from "../../packages/core/src/index.js";

describe("runtime evidence helpers", () => {
  it("builds bounded context packs with source hashes and denied path exclusions", async () => {
    const repo = await makeRepo();
    await writeFile(path.join(repo, "AGENTS.md"), "# Agents\n");
    await writeFile(path.join(repo, ".env"), "SECRET=value\n");
    await mkdir(path.join(repo, "contracts", "agent-governance", "context-profiles"), { recursive: true });
    await writeFile(
      path.join(repo, "contracts", "agent-governance", "context-profiles", "scoped-change.json"),
      JSON.stringify({
        id: "scoped-change",
        requiredSources: [{ path: "AGENTS.md", authority: "canonical" }],
        optionalSources: [{ path: ".env", authority: "supporting" }],
        deniedPatterns: [".env*", "**/*.pem", "**/*.key", "node_modules/**", ".git/**"],
        output: { directory: ".agent-context/", maxInlineBytes: 10000, maxFiles: 1, includeSha256: true }
      })
    );

    const result = await buildContextPack(repo);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.pack.sources[0]).toMatchObject({
      path: "AGENTS.md",
      authority: "canonical",
      content: "# Agents\n"
    });
    expect(result.pack.sources[0].sha256).toHaveLength(64);
    expect(result.pack.excluded).toContainEqual({
      path: ".env",
      reason: "denied by context profile"
    });
    expect(result.pack.sources).toHaveLength(1);
  });

  it("initializes a run with a manifest and detects stale context", async () => {
    const repo = await makeGovernedRepo();
    const result = await initializeAgentRun(repo, {
      id: "run-init-test",
      summary: "Initialize one local run with context evidence."
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const manifest = JSON.parse(await readFile(result.manifestFile, "utf8")) as Record<string, unknown>;
    expect(manifest).toMatchObject({
      schema: "agent-run-manifest",
      runId: "run-init-test",
      routeId: "scoped-local-change"
    });
    const fresh = await checkContextStaleness(repo, result.manifestFile);
    expect(fresh).toMatchObject({ ok: true, stale: false });

    await writeFile(path.join(repo, "AGENTS.md"), "# Agents changed\n");
    const stale = await checkContextStaleness(repo, result.manifestFile);
    expect(stale).toMatchObject({ ok: true, stale: true });
  });

  it("drafts and writes validated receipts to transient storage", async () => {
    const repo = await makeGovernedRepo();
    const run = await initializeAgentRun(repo, {
      id: "receipt-test",
      summary: "Draft a receipt for one local scaffold change."
    });
    expect(run.ok).toBe(true);
    if (!run.ok) return;
    await writeFile(
      path.join(repo, "contracts", "agent-governance", "receipt-policy.json"),
      JSON.stringify({
        schema: "agent-receipt-policy",
        id: "default-receipt-policy",
        lifecycle: "accepted",
        ownedBy: "contracts/agent-governance/",
        storage: { transientDirectory: ".agent-runs/", promotedDirectory: "docs/audits/", maxReceiptBytes: 50000 },
        privacy: {
          forbidSecrets: true,
          forbidFullTranscripts: true,
          forbidEnvironmentDumps: true,
          redactPatterns: ["sk-[A-Za-z0-9_-]+", "secret"]
        },
        requiredFields: ["request", "assignment", "route", "commands", "verificationEvidence", "changes", "final"],
        promotion: { requiresHumanReview: true, requiresAuditReason: true }
      })
    );
    const draft = await draftAgentReceipt(repo, {
      manifestPath: run.manifestFile,
      commandReceipts: [{ command: "npm run test:focused", exitCode: 0, output: "ok sk-testsecret123" }]
    });
    expect(draft.ok).toBe(true);
    if (!draft.ok) return;
    await writeFile(
      path.join(repo, "receipt-input.json"),
      JSON.stringify(draft.receipt)
    );

    const result = await writeAgentReceipt(repo, "receipt-input.json");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const written = await readFile(result.file, "utf8");
    expect(written).toContain("agent-receipt");
    expect(written).not.toContain("sk-testsecret123");
    const promoted = await writeAgentReceipt(repo, "receipt-input.json", undefined, { promote: true });
    expect(promoted.ok).toBe(false);
    const promotedWithReason = await writeAgentReceipt(repo, "receipt-input.json", undefined, {
      promote: true,
      auditReason: "verified by test"
    });
    expect(promotedWithReason.ok).toBe(true);
    if (!promotedWithReason.ok) return;
    const promotion = await readFile(
      path.join(path.dirname(promotedWithReason.file), `${promotedWithReason.receiptId}.promotion.json`),
      "utf8"
    );
    expect(promotion).toContain("verified by test");
  });

  it("runs a manual loop verifier and writes a stop receipt", async () => {
    const repo = await makeGovernedRepo();
    const run = await initializeAgentRun(repo, {
      id: "loop-test",
      summary: "Run one objective verifier command locally."
    });
    expect(run.ok).toBe(true);
    if (!run.ok) return;

    const result = await runManualLoop(repo, {
      manifestPath: run.manifestFile,
      verifyCommand: "node -e \"process.exit(0)\"",
      maxIterations: 1
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const stopReceipt = await readFile(result.stopReceiptFile, "utf8");
    expect(stopReceipt).toContain("agent-loop-stop-receipt");
  });
});

async function makeRepo(): Promise<string> {
  const repo = await mkdtemp(path.join(os.tmpdir(), "project-scaffold-runtime-"));
  execFileSync("git", ["init"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Test"], { cwd: repo });
  await writeFile(path.join(repo, "README.md"), "test\n");
  execFileSync("git", ["add", "README.md"], { cwd: repo });
  execFileSync("git", ["commit", "-m", "init"], { cwd: repo });
  return repo;
}

async function makeGovernedRepo(): Promise<string> {
  const repo = await makeRepo();
  await mkdir(path.join(repo, "contracts", "agent-governance"), { recursive: true });
  await mkdir(path.join(repo, "contracts", "schemas"), { recursive: true });
  await copyDir(
    path.join(process.cwd(), "contracts", "agent-governance"),
    path.join(repo, "contracts", "agent-governance")
  );
  await copyDir(
    path.join(process.cwd(), "contracts", "schemas"),
    path.join(repo, "contracts", "schemas")
  );
  await mkdir(path.join(repo, "skills"), { recursive: true });
  for (const skill of ["agent-assignment-writer", "contract-steward", "core-enforcement", "phase-closeout-audit"]) {
    await mkdir(path.join(repo, "skills", skill), { recursive: true });
  }
  await writeFile(path.join(repo, "AGENTS.md"), "# Agents\n");
  await writeFile(path.join(repo, "REPO_PROFILE.json"), "{}\n");
  await mkdir(path.join(repo, "docs", "governance"), { recursive: true });
  await writeFile(path.join(repo, "docs", "governance", "AGENT_OPERATING_MODEL.md"), "# Model\n");
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-m", "governed"], { cwd: repo });
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
