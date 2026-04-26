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
