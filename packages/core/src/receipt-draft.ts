import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { sha256Text } from "./file-utils.js";
import { validateReceiptObject } from "./receipt-schema.js";

type CommandReceipt = {
  command: string;
  exitCode: number;
  outputDigest?: string;
  output?: string;
};

export type DraftReceiptOptions = {
  manifestPath: string;
  commandReceipts?: CommandReceipt[];
};

export type DraftReceiptResult =
  | { ok: true; receipt: Record<string, unknown> }
  | { ok: false; errors: string[] };

export async function draftAgentReceipt(
  repoRoot: string,
  options: DraftReceiptOptions
): Promise<DraftReceiptResult> {
  const manifestFile = path.resolve(repoRoot, options.manifestPath);
  const manifest = JSON.parse(await readFile(manifestFile, "utf8")) as Record<string, unknown>;
  const assignmentPath = String(manifest.assignmentPath ?? "");
  const contextPackPath = String(manifest.contextPackPath ?? "");
  if (!assignmentPath || !contextPackPath) {
    return { ok: false, errors: ["manifest must include assignmentPath and contextPackPath"] };
  }

  const assignment = JSON.parse(await readFile(path.resolve(repoRoot, assignmentPath), "utf8")) as Record<string, unknown>;
  const contextPack = JSON.parse(await readFile(path.resolve(repoRoot, contextPackPath), "utf8")) as Record<string, unknown>;
  const sources = Array.isArray(contextPack.sources) ? contextPack.sources as Record<string, unknown>[] : [];
  const changedFiles = gitLines(repoRoot, ["diff", "--name-only"]);
  const untracked = gitLines(repoRoot, ["ls-files", "--others", "--exclude-standard"]);
  const commands = (options.commandReceipts ?? []).map((command) => ({
    command: command.command,
    exitCode: command.exitCode,
    outputDigest: command.outputDigest ?? sha256Text(command.output ?? `${command.command}:${command.exitCode}`)
  }));

  const receipt = {
    schema: "agent-receipt",
    receiptId: `receipt-${String(assignment.id ?? "run")}`,
    lifecycle: "draft",
    request: {
      summary: assignment.summary,
      risk: assignment.risk
    },
    assignment: {
      id: assignment.id,
      allowedPaths: assignment.allowedPaths,
      autonomyLevel: assignment.autonomyLevel
    },
    route: {
      routerId: "default-agent-router",
      routeId: assignment.routeId,
      workflowId: assignment.workflowId
    },
    authoritySources: sources.map((source) => ({
      path: source.path,
      authority: source.authority,
      sha256: source.sha256
    })),
    personas: {
      maker: assignment.makerPersonaId,
      verifier: assignment.verifierPersonaId
    },
    stageVerdicts: [
      {
        stageId: "scope",
        verdict: "under_served",
        evidence: [
          `manifest: ${path.relative(repoRoot, manifestFile)}`,
          `branch: ${git(repoRoot, ["branch", "--show-current"])}`,
          `head: ${git(repoRoot, ["rev-parse", "--short=12", "HEAD"])}`,
          `dirty: ${changedFiles.length + untracked.length > 0 ? "true" : "false"}`
        ]
      }
    ],
    commands,
    verificationEvidence: commands.length
      ? commands.map((command) => `${command.command} -> ${command.exitCode}`)
      : ["receipt drafted before verification commands were attached"],
    changes: {
      files: [...changedFiles, ...untracked].sort(),
      scopeViolations: []
    },
    humanReview: {
      required: false,
      approvals: []
    },
    final: {
      status: "under_served",
      unresolvedRisks: ["draft receipt requires verifier promotion before being treated as final evidence"]
    }
  };

  const validation = await validateReceiptObject(repoRoot, receipt);
  if (!validation.ok) {
    return validation;
  }
  return { ok: true, receipt };
}

function git(repoRoot: string, args: string[]): string {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();
}

function gitLines(repoRoot: string, args: string[]): string[] {
  return git(repoRoot, args).split("\n").map((line) => line.trim()).filter(Boolean);
}
