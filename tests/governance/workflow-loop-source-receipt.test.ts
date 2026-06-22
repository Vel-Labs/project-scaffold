import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateGovernanceArtifacts } from "../../packages/core/src/index.js";
import type { ContractJsonFile } from "../../packages/core/src/index.js";

const invalidDir = path.join(process.cwd(), "contracts", "examples", "invalid");
const skillIds = new Set(["core-enforcement", "phase-closeout-audit"]);

describe("workflow, loop, source, and receipt invariants", () => {
  it("rejects undeclared workflow verdict transitions", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-workflow-undeclared-verdict.json")
    ], skillIds);

    expect(errors(result)).toContain('transition uses undeclared verdict "revise"');
  });

  it("rejects under_served as a critical completion verdict", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-workflow-under-served-critical-gate.json")
    ], skillIds);

    expect(errors(result)).toContain("under_served satisfy a critical completion gate");
  });

  it("requires loop hard stops and objective verifier gates", async () => {
    const noStop = validateGovernanceArtifacts([
      await fixture("agent-loop-no-hard-stop.json")
    ], skillIds);
    const noVerifier = validateGovernanceArtifacts([
      await fixture("agent-loop-no-objective-verifier.json")
    ], skillIds);

    expect(errors(noStop)).toContain('missing hard stop limit "maxIterations"');
    expect(errors(noVerifier)).toContain("has no objective verifier gate");
  });

  it("rejects reference sources that override canonical truth", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-source-reference-overrides-canonical.json")
    ], skillIds);

    expect(errors(result)).toContain("reference source");
    expect(errors(result)).toContain("may override canonical truth");
  });

  it("requires compact receipts with verification evidence", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-receipt-missing-verification.json")
    ], skillIds);

    expect(errors(result)).toContain("receipt is missing verification evidence");
  });

  it("keeps context profiles bounded and non-transient", async () => {
    const transient = validateGovernanceArtifacts([
      await fixture("agent-context-profile-sensitive-source.json")
    ], skillIds);
    const missingDeny = validateGovernanceArtifacts([
      await fixture("agent-context-profile-missing-deny.json")
    ], skillIds);

    expect(errors(transient)).toContain('uses transient source ".agent-runs/"');
    expect(errors(missingDeny)).toContain("missing denied pattern for .env");
  });

  it("keeps receipt policy transient-first and privacy-preserving", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-receipt-policy-unsafe-storage.json")
    ], skillIds);

    expect(errors(result)).toContain("must use .agent-runs/ for transient storage");
    expect(errors(result)).toContain("must set forbidSecrets=true");
    expect(errors(result)).toContain("promotion must require human review and audit reason");
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
