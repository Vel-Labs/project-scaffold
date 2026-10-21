import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { expect, test } from "vitest";

const root = process.cwd();
const config = "skills/relay-board/templates/project.json";
const readJson = (dir: string, file: string) => JSON.parse(readFileSync(path.join(dir, file), "utf8"));
const read = (dir: string) => readJson(dir, config);
const init = (target: string, ...flags: string[]) => execFileSync(process.execPath, [
  path.join(root, "node_modules/tsx/dist/cli.mjs"),
  path.join(target, "scripts/init-template.ts"), "--yes",
  '--project-name=Orbit "Research"', "--package-name=orbit", ...flags
], { cwd: target, encoding: "utf8", stdio: "pipe" });

function copyProject(target: string) {
  mkdirSync(target, { recursive: true });
  for (const entry of readdirSync(root)) {
    if ([".git", "node_modules", ".agent-runs", ".agent-context", "gpt-pro-audit"].includes(entry)) continue;
    cpSync(path.join(root, entry), path.join(target, entry), { recursive: true });
  }
}

function freshProject() {
  const scratch = path.join(root, ".agent-runs");
  mkdirSync(scratch, { recursive: true });
  const target = mkdtempSync(path.join(scratch, "relay-lock-"));
  copyProject(target);
  return target;
}

function snapshot(dir: string, prefix = ""): Record<string, Buffer> {
  const files: Record<string, Buffer> = {};
  for (const entry of readdirSync(path.join(dir, prefix), { withFileTypes: true })) {
    const file = path.join(prefix, entry.name);
    if (entry.isDirectory()) Object.assign(files, snapshot(dir, file));
    else files[file] = readFileSync(path.join(dir, file));
  }
  return files;
}

function nonIdentityLock(lock: ReturnType<typeof readJson>) {
  const { name: _name, ...rest } = lock;
  const { name: _rootName, ...rootPackage } = lock.packages[""];
  return { ...rest, packages: { ...lock.packages, "": rootPackage } };
}

test("copied projects get isolated, stable Relay identities without copying runtime state", () => {
  const scratch = path.join(root, ".agent-runs");
  mkdirSync(scratch, { recursive: true });
  const run = mkdtempSync(path.join(scratch, "relay-scaffold-"));
  const copies = [path.join(run, "alpha"), path.join(run, "beta")];
  for (const target of copies) copyProject(target);
  const lock = readJson(copies[0], "package-lock.json");
  lock.operatorMetadata = { label: "<PROJECT_NAME>", owner: "<OWNER>" };
  lock.packages[""].operatorMetadata = "<PROJECT_NAME>";
  writeFileSync(path.join(copies[0], "package-lock.json"), JSON.stringify(lock, null, 2));
  const beforeDryRun = snapshot(copies[0]);
  init(copies[0], "--dry-run");
  expect(snapshot(copies[0])).toEqual(beforeDryRun);
  expect(read(copies[0]).instance).toBe("");
  for (const target of copies) init(target);
  for (const target of copies) {
    expect(() => JSON.parse(readFileSync(path.join(target, "REPO_PROFILE.json"), "utf8"))).not.toThrow();
  }
  for (const target of copies) {
    expect(readJson(target, "package.json").name).toBe("orbit");
    expect(readJson(target, "package-lock.json").name).toBe("orbit");
    expect(readJson(target, "package-lock.json").packages[""].name).toBe("orbit");
  }
  expect(nonIdentityLock(readJson(copies[0], "package-lock.json"))).toEqual(nonIdentityLock(lock));
  const board = read(copies[0]);
  expect(board.instance).toMatch(/^project-[a-f0-9-]{36}$/);
  expect(board.title).toBe('Orbit "Research"');
  expect(board.sessions).toEqual([]);
  expect(board.instance).not.toBe(read(copies[1]).instance);
  board.title = "Operator title";
  board.objective = "Operator objective";
  board.sessions.push({ id: "operator-session", title: "Keep this session", notes: ["<PROJECT_NAME>"] });
  board.operatorMetadata = { owner: "Operator", nested: { keep: true } };
  writeFileSync(path.join(copies[0], config), JSON.stringify(board, null, 2));
  writeFileSync(path.join(copies[0], "operator-notes.md"), "Keep unrelated operator notes.\n");
  init(copies[0], "--project-name=Rename attempt");
  expect(read(copies[0])).toEqual(board);
  expect(nonIdentityLock(readJson(copies[0], "package-lock.json"))).toEqual(nonIdentityLock(lock));
  expect(readFileSync(path.join(copies[0], "operator-notes.md"), "utf8")).toBe("Keep unrelated operator notes.\n");
  expect(existsSync(path.join(copies[0], ".data"))).toBe(false);
  expect(readFileSync(path.join(copies[0], "AGENTS.md"), "utf8")).toContain("skills/relay-board/SKILL.md");
  console.log(`Retained generated-project evidence: ${run}`);
}, 20000);

test("initialization leaves an absent lockfile absent", () => {
  const target = freshProject();
  rmSync(path.join(target, "package-lock.json"));
  init(target);
  expect(existsSync(path.join(target, "package-lock.json"))).toBe(false);
  expect(readJson(target, "package.json").name).toBe("orbit");
});

test.each([
  { lockfileVersion: 3, packages: { "": {} } },
  { name: "stale", lockfileVersion: 3, packages: { "": { name: "other-stale" } } }
])("initialization repairs supported v3 identity names: %j", (lock) => {
  const target = freshProject();
  writeFileSync(path.join(target, "package-lock.json"), JSON.stringify(lock));
  init(target);
  expect(readJson(target, "package.json").name).toBe("orbit");
  expect(readJson(target, "package-lock.json").name).toBe("orbit");
  expect(readJson(target, "package-lock.json").packages[""].name).toBe("orbit");
  expect(nonIdentityLock(readJson(target, "package-lock.json"))).toEqual(nonIdentityLock(lock));
});

test.each([
  ["malformed JSON", "{"],
  ["nonobject lock", "[]"],
  ["wrong version", '{"lockfileVersion":2,"packages":{"":{}}}'],
  ["missing packages", '{"lockfileVersion":3}'],
  ["nonobject packages", '{"lockfileVersion":3,"packages":[]}'],
  ["missing root package", '{"lockfileVersion":3,"packages":{}}'],
  ["nonobject root package", '{"lockfileVersion":3,"packages":{"":null}}'],
  ["array root package", '{"lockfileVersion":3,"packages":{"":[]}}']
])("invalid lock rejects before any initializer write: %s", (_label, lock) => {
  const target = freshProject();
  writeFileSync(path.join(target, "package-lock.json"), lock);
  writeFileSync(path.join(target, "000-sentinel.md"), "Keep <PROJECT_NAME> and <OWNER>.\n");
  const before = snapshot(target);
  expect(() => init(target)).toThrow(/package-lock\.json must/);
  expect(snapshot(target)).toEqual(before);
});

const starter = path.resolve(root, "../../scripts/workspace-maintenance/new_project.sh");
test.skipIf(!existsSync(starter))("workspace starter keeps Relay opt-in, routes products, and preserves unrelated content", () => {
  const scratch = path.join(root, ".agent-runs");
  mkdirSync(scratch, { recursive: true });
  const workspace = mkdtempSync(path.join(scratch, "relay-starter-"));
  const env = { ...process.env, WORKSPACE_ROOT: workspace };
  const sentinel = path.join(workspace, "operator-notes.md");
  writeFileSync(sentinel, "Keep unrelated operator notes.\n");
  const categories = {
    "code-project": "40_Code/projects",
    "code-app": "40_Code/apps",
    "code-package": "40_Code/packages",
    "ai-experiment": "30_AI-Lab/10_Local-LLM-Lab",
    "work-prototype": "10_Work/prototypes",
    "agent-workspace": "50_Agents/10_Codex/worktrees"
  };
  const ids = new Set();
  for (const [category, parent] of Object.entries(categories)) {
    const plain = path.join(workspace, parent, "plain");
    const target = path.join(workspace, parent, "same-name");
    const beforeDryRun = snapshot(workspace);
    execFileSync("bash", [starter, "--dry-run", category, "plain"], { env });
    execFileSync("bash", [starter, "--dry-run", "--with-relay", category, "same-name"], { env });
    expect(snapshot(workspace)).toEqual(beforeDryRun);
    execFileSync("bash", [starter, category, "plain"], { env });
    expect(existsSync(path.join(plain, "skills"))).toBe(false);
    expect(readFileSync(path.join(plain, "AGENTS.md"), "utf8")).not.toContain("relay-board");
    execFileSync("bash", [starter, "--with-relay", category, "same-name"], { env });
    const before = snapshot(target);
    const board = read(target);
    expect(board.title).toBe("same-name");
    expect(board.sessions).toEqual([]);
    expect(board.instance).toMatch(/^project-[a-f0-9-]{36}$/);
    ids.add(board.instance);
    expect(readFileSync(path.join(target, "AGENTS.md"), "utf8")).toContain("Relay is optional");
    expect(existsSync(path.join(target, ".data"))).toBe(false);
    expect(() => execFileSync("bash", [starter, "--with-relay", category, "same-name"], { env, stdio: "pipe" })).toThrow();
    expect(snapshot(target)).toEqual(before);
  }
  for (const name of [".", "..", "../escape", "bad/name"]) {
    const before = snapshot(workspace);
    expect(() => execFileSync("bash", [starter, "code-project", name], { env, stdio: "pipe" })).toThrow();
    expect(snapshot(workspace)).toEqual(before);
  }
  expect(readFileSync(sentinel, "utf8")).toBe("Keep unrelated operator notes.\n");
  expect(ids.size).toBe(6);
  console.log(`Retained starter evidence: ${workspace}`);
});


test.each(["{", "null", "[]", '"board"'])("invalid Relay metadata rejects before initializer writes: %s", (metadata) => {
  const target = freshProject();
  writeFileSync(path.join(target, config), metadata);
  writeFileSync(path.join(target, "000-sentinel.md"), "Keep <PROJECT_NAME> and <OWNER>.\n");
  const before = snapshot(target);
  expect(() => init(target)).toThrow();
  expect(snapshot(target)).toEqual(before);
});

test("initialization keeps an absent optional Relay configuration absent", () => {
  const target = freshProject();
  rmSync(path.join(target, config));
  init(target);
  expect(existsSync(path.join(target, config))).toBe(false);
  expect(readJson(target, "package.json").name).toBe("orbit");
});
