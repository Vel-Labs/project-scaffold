import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  listFilesRecursive,
  matchesDeniedPattern,
  sha256File,
  sha256Text
} from "./file-utils.js";

type ContextSource = {
  path: string;
  authority: string;
};

type ContextProfile = {
  id: string;
  requiredSources: ContextSource[];
  optionalSources: ContextSource[];
  deniedPatterns: string[];
  output: {
    directory: string;
    maxInlineBytes: number;
    includeSha256: true;
  };
};

export type ContextPackResult =
  | { ok: true; file: string; pack: ContextPack }
  | { ok: false; errors: string[] };

export type ContextPack = {
  schema: "agent-context-pack";
  profileId: string;
  generatedAt: string;
  gitRevision: string;
  sources: Array<{
    path: string;
    authority: string;
    sha256: string;
    bytes: number;
    content?: string;
  }>;
  excluded: Array<{ path: string; reason: string }>;
  packSha256: string;
};

export async function buildContextPack(
  repoRoot: string,
  profilePath = "contracts/agent-governance/context-profiles/scoped-change.json"
): Promise<ContextPackResult> {
  const errors: string[] = [];
  const profile = JSON.parse(await readFile(path.join(repoRoot, profilePath), "utf8")) as ContextProfile;
  const sources: ContextPack["sources"] = [];
  const excluded: ContextPack["excluded"] = [];
  let inlineBytes = 0;

  for (const source of [...profile.requiredSources, ...profile.optionalSources]) {
    let files: string[];
    try {
      files = await listFilesRecursive(repoRoot, source.path);
    } catch {
      if (profile.requiredSources.includes(source)) {
        errors.push(`missing required source: ${source.path}`);
      }
      continue;
    }
    for (const file of files) {
      if (matchesDeniedPattern(file, profile.deniedPatterns)) {
        excluded.push({ path: file, reason: "denied by context profile" });
        continue;
      }
      const absolute = path.join(repoRoot, file);
      const content = await readFile(absolute, "utf8");
      const bytes = Buffer.byteLength(content);
      const entry: ContextPack["sources"][number] = {
        path: file,
        authority: source.authority,
        sha256: await sha256File(absolute),
        bytes
      };
      if (inlineBytes + bytes <= profile.output.maxInlineBytes) {
        entry.content = content;
        inlineBytes += bytes;
      } else {
        excluded.push({ path: file, reason: "max inline bytes reached" });
      }
      sources.push(entry);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const packWithoutHash = {
    schema: "agent-context-pack" as const,
    profileId: profile.id,
    generatedAt: new Date().toISOString(),
    gitRevision: readGitRevision(repoRoot),
    sources,
    excluded
  };
  const pack: ContextPack = {
    ...packWithoutHash,
    packSha256: sha256Text(JSON.stringify(packWithoutHash))
  };
  const outputDir = path.join(repoRoot, profile.output.directory);
  await mkdir(outputDir, { recursive: true });
  const outputFile = path.join(outputDir, `${profile.id}-context-pack.json`);
  await writeFile(outputFile, `${JSON.stringify(pack, null, 2)}\n`);

  return { ok: true, file: outputFile, pack };
}

function readGitRevision(repoRoot: string): string {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8"
  }).trim();
}
