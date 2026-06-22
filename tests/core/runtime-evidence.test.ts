import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { buildContextPack, writeAgentReceipt } from "../../packages/core/src/index.js";

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
        output: { directory: ".agent-context/", maxInlineBytes: 10000, includeSha256: true }
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
  });

  it("writes redacted receipts to transient storage", async () => {
    const repo = await makeRepo();
    await mkdir(path.join(repo, "contracts", "agent-governance"), { recursive: true });
    await writeFile(
      path.join(repo, "contracts", "agent-governance", "receipt-policy.json"),
      JSON.stringify({
        storage: { transientDirectory: ".agent-runs/", maxReceiptBytes: 50000 },
        privacy: { redactPatterns: ["sk-[A-Za-z0-9_-]+", "secret"] }
      })
    );
    await writeFile(
      path.join(repo, "receipt-input.json"),
      JSON.stringify({
        receiptId: "run-example",
        verificationEvidence: ["token sk-testsecret123"]
      })
    );

    const result = await writeAgentReceipt(repo, "receipt-input.json");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const written = await readFile(result.file, "utf8");
    expect(written).toContain("[REDACTED]");
    expect(written).not.toContain("sk-testsecret123");
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
