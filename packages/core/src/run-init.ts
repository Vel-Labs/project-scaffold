import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateAgentAssignment, type GenerateAssignmentOptions } from "./assignment-generator.js";
import { buildContextPack } from "./context-pack.js";
import { sha256File, sha256Text } from "./file-utils.js";

export type RunInitOptions = GenerateAssignmentOptions & {
  profilePath?: string;
};

export type RunInitResult =
  | { ok: true; runId: string; manifestFile: string; assignmentFile: string; contextPackFile: string }
  | { ok: false; errors: string[] };

export async function initializeAgentRun(
  repoRoot: string,
  options: RunInitOptions = {}
): Promise<RunInitResult> {
  const assignmentResult = await generateAgentAssignment(repoRoot, options);
  if (!assignmentResult.ok) {
    return assignmentResult;
  }
  const runId = assignmentResult.assignment.id;
  const runDir = path.join(".agent-runs", runId);
  const contextPackOutput = path.join(runDir, "context-pack.json");
  const contextResult = await buildContextPack(repoRoot, options.profilePath, contextPackOutput);
  if (!contextResult.ok) {
    return contextResult;
  }

  const manifestFile = path.join(repoRoot, runDir, "manifest.json");
  const manifestWithoutHash = {
    schema: "agent-run-manifest",
    runId,
    generatedAt: new Date().toISOString(),
    gitRevision: git(repoRoot, ["rev-parse", "HEAD"]),
    branch: git(repoRoot, ["branch", "--show-current"]),
    routeId: assignmentResult.assignment.routeId,
    assignmentPath: path.relative(repoRoot, assignmentResult.file),
    assignmentMarkdownPath: path.relative(repoRoot, assignmentResult.markdownFile),
    assignmentSha256: await sha256File(assignmentResult.file),
    contextPackPath: path.relative(repoRoot, contextResult.file),
    contextPackSha256: contextResult.pack.packSha256,
    contextProfileId: contextResult.pack.profileId,
    sources: contextResult.pack.sources.map((source) => ({
      path: source.path,
      sha256: source.sha256,
      authority: source.authority
    }))
  };
  const manifest = {
    ...manifestWithoutHash,
    manifestSha256: sha256Text(JSON.stringify(manifestWithoutHash))
  };
  await mkdir(path.dirname(manifestFile), { recursive: true });
  await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);

  return {
    ok: true,
    runId,
    manifestFile,
    assignmentFile: assignmentResult.file,
    contextPackFile: contextResult.file
  };
}

function git(repoRoot: string, args: string[]): string {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();
}
