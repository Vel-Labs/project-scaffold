import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { ContractJsonFile } from "./types.js";

export async function readJsonFiles(dir: string): Promise<ContractJsonFile[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const jsonFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();

  return Promise.all(
    jsonFiles.map(async (fileName) => {
      const file = path.join(dir, fileName);
      const raw = await readFile(file, "utf8");
      return { file, value: JSON.parse(raw) as unknown };
    })
  );
}

export async function readJsonFilesRecursive(dir: string): Promise<ContractJsonFile[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: ContractJsonFile[] = [];

  for (const entry of entries) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await readJsonFilesRecursive(target)));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".json")) {
      continue;
    }
    const raw = await readFile(target, "utf8");
    files.push({ file: target, value: JSON.parse(raw) as unknown });
  }

  return files.sort((left, right) => left.file.localeCompare(right.file));
}
