import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  validateAgentGovernance,
  validateGovernanceArtifacts
} from "../../packages/core/src/index.js";
import type { ContractJsonFile } from "../../packages/core/src/index.js";

const repoRoot = process.cwd();
const invalidDir = path.join(repoRoot, "contracts", "examples", "invalid");
const skillIds = new Set([
  "agent-assignment-writer",
  "copywriter",
  "contract-steward",
  "core-enforcement",
  "docs-steward",
  "qa-reviewer",
  "researcher",
  "phase-closeout-audit"
]);

describe("agent governance validation", () => {
  it("validates the canonical governance control-plane contracts", async () => {
    const result = await validateAgentGovernance(repoRoot);

    expect(result).toEqual({
      ok: true,
      checked: {
        artifacts: 21,
        routes: 5,
        assignments: 1,
        contextProfiles: 1,
        workflows: 2,
        loops: 1,
        hooks: 2,
        receipts: 0,
        receiptPolicies: 1,
        learnings: 1
      }
    });
  });

  it("fails closed for unknown governance schemas and references", async () => {
    const unknownSchema = validateGovernanceArtifacts([
      await fixture("agent-unknown-schema.json")
    ], skillIds);
    const unknownRefs = validateGovernanceArtifacts([
      await fixture("agent-router-unknown-reference.json")
    ], skillIds);

    expect(errors(unknownSchema)).toContain('unknown governance schema "agent-unknown"');
    expect(errors(unknownRefs)).toContain('workflow references unknown id "missing-workflow"');
    expect(errors(unknownRefs)).toContain('maker persona references unknown id "missing-persona"');
    expect(errors(unknownRefs)).toContain('references unknown skill "missing-skill"');
  });

  it("blocks route authority escalation beyond phase-one policy", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-router-authority-escalation.json")
    ], skillIds);

    expect(errors(result)).toContain('requests denied phase-one action "deploy"');
  });

  it("blocks assignment escalation beyond the selected route", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-assignment-authority-escalation.json")
    ], skillIds);

    expect(errors(result)).toContain('requests denied action "deploy"');
  });

  it("blocks unsafe assignment paths", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-assignment-unsafe-path.json")
    ], skillIds);

    expect(errors(result)).toContain('contains unsafe path "/tmp/outside-repo"');
  });

  it("blocks learned guidance from overriding contracts", async () => {
    const result = validateGovernanceArtifacts([
      await fixture("agent-learning-overrides-contracts.json")
    ], skillIds);

    expect(errors(result)).toContain('learning "override-contracts" cannot override contracts');
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
