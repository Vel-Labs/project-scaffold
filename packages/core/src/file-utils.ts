import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

export async function listFilesRecursive(root: string, relativePath: string): Promise<string[]> {
  const target = path.join(root, relativePath);
  const info = await stat(target);
  if (info.isFile()) {
    return [relativePath];
  }
  if (!info.isDirectory()) {
    return [];
  }
  const entries = await readdir(target, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursive(root, child)));
    } else if (entry.isFile()) {
      files.push(child);
    }
  }
  return files.sort();
}

export async function sha256File(file: string): Promise<string> {
  const content = await readFile(file);
  return createHash("sha256").update(content).digest("hex");
}

export function sha256Text(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export function matchesDeniedPattern(relativePath: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const normalized = pattern.replace(/^\*\*\//, "");
    if (normalized.endsWith("/**")) {
      return relativePath.startsWith(normalized.slice(0, -3));
    }
    if (normalized.endsWith("*")) {
      return relativePath.startsWith(normalized.slice(0, -1));
    }
    if (normalized.startsWith("*")) {
      return relativePath.includes(normalized.slice(1));
    }
    return relativePath === normalized || relativePath.includes(normalized);
  });
}
