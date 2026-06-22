import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateGovernanceArtifacts } from "../../packages/core/src/index.js";
import type { ContractJsonFile } from "../../packages/core/src/index.js";

const invalidDir = path.join(process.cwd(), "contracts", "examples", "invalid");
const skillIds = new Set(["core-enforcement"]);

describe("agent security invariants", () => {
  it("denies medium and high risk self-approval", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-persona-self-approval.json")
    ], skillIds);

    expect(errors(result)).toContain("may self-approve medium/high risk work");
  });

  it("denies unsafe hook command paths and external hook actions", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-hook-absolute-command.json")
    ], skillIds);

    expect(errors(result)).toContain('uses an unsafe command path "/usr/bin/curl"');
    expect(errors(result)).toContain("enables an external action");
  });

  it("denies high-risk loops where maker equals verifier", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-loop-maker-equals-verifier.json")
    ], skillIds);

    expect(errors(result)).toContain("same maker and verifier at high risk");
  });

  it("keeps receipts secret-safe", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-receipt-secret-like-value.json")
    ], skillIds);

    expect(errors(result)).toContain("receipt contains a secret-like value");
  });

  it("keeps under_served from satisfying critical gates", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-workflow-under-served-critical-gate.json")
    ], skillIds);

    expect(errors(result)).toContain("under_served satisfy a critical completion gate");
  });

  it("denies assignment-level deploy escalation", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-assignment-authority-escalation.json")
    ], skillIds);

    expect(errors(result)).toContain('requests denied action "deploy"');
  });

  it("denies transient context as a source of truth", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-context-profile-sensitive-source.json")
    ], skillIds);

    expect(errors(result)).toContain('uses transient source ".agent-runs/"');
  });
});

async function fixture(fileName: string): Promise<ContractJsonFile> {
  const file = path.join(invalidDir, fileName);
  return { file, value: JSON.parse(await readFile(file, "utf8")) as unknown };
}

function errors(result: ReturnType<typeof validateGovernanceArtifacts>): string {
  expect(result.ok).toBe(false);
  return result.ok ? "" : result.errors.join("\n");
}
