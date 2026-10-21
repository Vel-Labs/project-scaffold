import { cpSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, test } from "vitest";

test("derived tree ignores runtime metadata but detects unlisted owned source", () => {
  const root = process.cwd();
  const scratch = path.join(root, ".agent-runs");
  mkdirSync(scratch, { recursive: true });
  const target = mkdtempSync(path.join(scratch, "file-tree-"));
  for (const file of readdirSync(root)) {
    if ([".git", "node_modules", ".agent-runs", ".agent-context", "gpt-pro-audit"].includes(file)) continue;
    cpSync(path.join(root, file), path.join(target, file), { recursive: true });
  }
  const check = () => execFileSync(process.execPath, [path.join(root, "node_modules/tsx/dist/cli.mjs"),
    path.join(target, "scripts/validate-scaffold.ts")], { cwd: target, encoding: "utf8", stdio: "pipe" });
  mkdirSync(path.join(target, "scripts/__pycache__"), { recursive: true });
  writeFileSync(path.join(target, "scripts/__pycache__/fixture.pyc"), "runtime cache");
  writeFileSync(path.join(target, "docs/.DS_Store"), "OS metadata");
  expect(check()).toContain("Scaffold validation passed");
  writeFileSync(path.join(target, "docs/unlisted-owned.md"), "# Must enter the owned file tree\n");
  expect(check).toThrow(/FILE_TREE.md is stale/);
});
