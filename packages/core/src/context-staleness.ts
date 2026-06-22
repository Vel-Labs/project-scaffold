import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { sha256File } from "./file-utils.js";

export type ContextStalenessResult =
  | { ok: true; stale: false; checked: string[] }
  | { ok: true; stale: true; errors: string[] }
  | { ok: false; errors: string[] };

export async function checkContextStaleness(
  repoRoot: string,
  manifestPath: string
): Promise<ContextStalenessResult> {
  const manifestFile = path.resolve(repoRoot, manifestPath);
  const manifest = JSON.parse(await readFile(manifestFile, "utf8")) as Record<string, unknown>;
  const errors: string[] = [];
  const checked: string[] = [];
  const expectedRevision = String(manifest.gitRevision ?? "");
  const currentRevision = git(repoRoot, ["rev-parse", "HEAD"]);

  if (!expectedRevision) {
    return { ok: false, errors: ["manifest missing gitRevision"] };
  }
  checked.push("gitRevision");
  if (expectedRevision !== currentRevision) {
    errors.push(`git revision changed: manifest=${expectedRevision} current=${currentRevision}`);
  }

  const sources = Array.isArray(manifest.sources) ? manifest.sources as Record<string, unknown>[] : [];
  for (const source of sources) {
    const sourcePath = String(source.path ?? "");
    const expectedHash = String(source.sha256 ?? "");
    if (!sourcePath || !expectedHash) {
      errors.push("manifest contains source without path or sha256");
      continue;
    }
    checked.push(sourcePath);
    try {
      const currentHash = await sha256File(path.join(repoRoot, sourcePath));
      if (currentHash !== expectedHash) {
        errors.push(`source changed: ${sourcePath}`);
      }
    } catch {
      errors.push(`source missing: ${sourcePath}`);
    }
  }

  if (errors.length > 0) {
    return { ok: true, stale: true, errors };
  }
  return { ok: true, stale: false, checked };
}

function git(repoRoot: string, args: string[]): string {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();
}
