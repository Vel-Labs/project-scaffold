import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import { expect, test } from "vitest";

const root = process.cwd();
const scratch = path.join(root, ".agent-runs");
mkdirSync(scratch, { recursive: true });
const fixtures = mkdtempSync(path.join(scratch, "project-context-"));
const generator = path.join(root, "scripts/create-project.py");
const generate = (name: string, ...args: string[]) => execFileSync("python3", [generator, path.join(fixtures, name), "--name", name, ...args], { encoding: "utf8", stdio: "pipe" });
const read = (name: string, file: string) => readFileSync(path.join(fixtures, name, file), "utf8");
const profile = (name: string) => JSON.parse(read(name, "REPO_PROFILE.json"));
const validate = (name: string) => execFileSync("python3", [path.join(fixtures, name, "scripts/validate_project.py"), path.join(fixtures, name)], { encoding: "utf8", stdio: "pipe" });
const schema = new Ajv2020({ strict: false }).compile(JSON.parse(readFileSync(path.join(root, "contracts/schemas/repo-profile.schema.json"), "utf8")));
const snapshot = (directory: string, prefix = ""): Record<string, string> => Object.assign({}, ...readdirSync(path.join(directory, prefix), { withFileTypes: true }).map(entry => {
  const file = path.join(prefix, entry.name);
  return entry.isDirectory() ? snapshot(directory, file) : { [file]: readFileSync(path.join(directory, file)).toString("base64") };
}));

test("Project Context remains absent by default and opt-in dry run writes nothing", () => {
  generate("plain");
  expect(existsSync(path.join(fixtures, "plain/PROJECT_CONTEXT.md"))).toBe(false);
  expect(existsSync(path.join(fixtures, "plain/scripts/project_context.py"))).toBe(false);
  expect(profile("plain").canonicalPaths.projectContext).toBeUndefined();
  const preview = JSON.parse(generate("preview", "--with-project-context", "--dry-run"));
  expect(preview.created).toContain("PROJECT_CONTEXT.md");
  expect(preview.created).toContain("scripts/project_context.py");
  expect(existsSync(path.join(fixtures, "preview"))).toBe(false);
});

test.each(["standard", "tool", "experimental", "arcade", "disposable"])("%s opt-in creates an honest portable starter with no infrastructure", kind => {
  const name = "context-" + kind;
  generate(name, "--profile", kind, "--with-project-context");
  const value = profile(name);
  expect(schema(value), JSON.stringify(schema.errors)).toBe(true);
  expect(value.canonicalPaths.projectContext).toBe("PROJECT_CONTEXT.md");
  expect(value.readFirst).toContain("PROJECT_CONTEXT.md");
  expect(value.commands.formatProjectContext).toBe("python3 scripts/project_context.py PROJECT_CONTEXT.md");
  const page = read(name, "PROJECT_CONTEXT.md");
  const source = JSON.parse(page.match(/```json\n([\s\S]*?)\n```/)![1]);
  expect(source).toMatchObject({ identity: "project:" + value.project.id, reviewed_on: null, path_basis: "repository", topics: [], summary: [], related_projects: [] });
  expect(page).toContain("Not yet reviewed.");
  expect(page).toContain("No connection inferred");
  expect(page).not.toContain("/Users/");
  expect(read(name, "README.md")).toContain("[Project Context](PROJECT_CONTEXT.md)");
  expect(JSON.parse(validate(name)).ok).toBe(true);
  for (const excluded of [".git", ".github", ".claude", "package.json", "skills", ".data"]) expect(existsSync(path.join(fixtures, name, excluded))).toBe(false);
  const before = snapshot(path.join(fixtures, name));
  execFileSync("python3", ["scripts/project_context.py", "PROJECT_CONTEXT.md"], { cwd: path.join(fixtures, name) });
  expect(snapshot(path.join(fixtures, name))).toEqual(before);
});

test("reviewed context checks source pins and readable agreement without rewriting evidence", () => {
  const name = "reviewed";
  generate(name, "--with-project-context");
  execFileSync("python3", ["-B", "-c", `
import hashlib,sys
from pathlib import Path
root=Path(sys.argv[1]);sys.path.insert(0,str(root/'scripts'))
from project_context import parse,render_document
page=root/'PROJECT_CONTEXT.md';value=parse(page.read_bytes())
value['reviewed_on']='2026-10-12';value['topics']=['source-collaboration']
value['summary']=[dict(question='What is established?',answer='A local source baseline only; shipment unknown.',evidence=[dict(path='README.md',sha256=hashlib.sha256((root/'README.md').read_bytes()).hexdigest(),excerpt='Local project; public summary has not been selected.')])]
page.write_text(render_document(value))
`, path.join(fixtures, name)]);
  expect(JSON.parse(validate(name)).ok).toBe(true);
  const page = read(name, "PROJECT_CONTEXT.md");
  writeFileSync(path.join(fixtures, name, "PROJECT_CONTEXT.md"), page.replace("A local source baseline only; shipment unknown.", "Shipped everywhere."));
  expect(() => validate(name)).toThrow();
  writeFileSync(path.join(fixtures, name, "PROJECT_CONTEXT.md"), page);
  writeFileSync(path.join(fixtures, name, "README.md"), "Changed source.\n");
  const before = snapshot(path.join(fixtures, name));
  expect(() => validate(name)).toThrow();
  expect(snapshot(path.join(fixtures, name))).toEqual(before);
});

test("portable generated-context marking rejects false human review and mismatched frontmatter", () => {
  const name = "generated-marking";
  generate(name, "--with-project-context");
  execFileSync("python3", ["-B", "-c", `
import sys
from pathlib import Path
root=Path(sys.argv[1]);sys.path.insert(0,str(root/'scripts'))
from project_context import parse,render_document
page=root/'PROJECT_CONTEXT.md';value=parse(page.read_bytes())
value.update(agent_generated=True,human_reviewed=False)
page.write_text(render_document(value))
for flags in [dict(agent_generated=True),dict(human_reviewed=False),dict(agent_generated=True,human_reviewed=True),dict(agent_generated=1,human_reviewed=False)]:
    old={k:v for k,v in value.items() if k not in ('agent_generated','human_reviewed')}
    try: render_document({**old,**flags})
    except ValueError: pass
    else: raise AssertionError('Invalid marking admitted')
`, path.join(fixtures, name)]);
  expect(JSON.parse(validate(name)).ok).toBe(true);
  const page = read(name, "PROJECT_CONTEXT.md");
  expect(page.startsWith("---\nagent_generated: true\nhuman_reviewed: false\n---\n")).toBe(true);
  writeFileSync(path.join(fixtures, name, "PROJECT_CONTEXT.md"), page.replace("human_reviewed: false", "human_reviewed: true"));
  expect(() => validate(name)).toThrow();
});

test("adoption preserves authored entry docs and refuses existing context before any write", () => {
  mkdirSync(path.join(fixtures, "adopt"));
  writeFileSync(path.join(fixtures, "adopt/README.md"), "# Authored purpose\n");
  writeFileSync(path.join(fixtures, "adopt/AGENTS.md"), "Keep existing instructions.\n");
  generate("adopt", "--adopt", "--with-project-context");
  expect(read("adopt", "README.md")).toBe("# Authored purpose\n");
  expect(read("adopt", "AGENTS.md")).toBe("Keep existing instructions.\n");
  expect(JSON.parse(validate("adopt")).ok).toBe(true);
  const before = snapshot(path.join(fixtures, "adopt"));
  expect(() => generate("adopt", "--adopt", "--with-project-context")).toThrow();
  expect(snapshot(path.join(fixtures, "adopt"))).toEqual(before);
  mkdirSync(path.join(fixtures, "authored-context"));
  writeFileSync(path.join(fixtures, "authored-context/PROJECT_CONTEXT.md"), "Keep authored interpretations.\n");
  const authored = snapshot(path.join(fixtures, "authored-context"));
  expect(() => generate("authored-context", "--adopt", "--with-project-context")).toThrow();
  expect(snapshot(path.join(fixtures, "authored-context"))).toEqual(authored);
});

test("existing profiles remain byte-identical when optional capability adoption is refused", () => {
  const before = snapshot(path.join(fixtures, "plain"));
  expect(() => generate("plain", "--adopt", "--with-project-context")).toThrow();
  expect(snapshot(path.join(fixtures, "plain"))).toEqual(before);
  expect(JSON.parse(validate("plain")).ok).toBe(true);
});

test.skipIf(!existsSync(path.resolve(root, "../../scripts/workspace-maintenance/new_project.sh")))("existing workspace wrapper forwards the opt-in only to a fixture destination", () => {
  const wrapper = path.resolve(root, "../../scripts/workspace-maintenance/new_project.sh");
  const fixtureWorkspace = path.join(fixtures, "workspace");
  const env = { ...process.env, WORKSPACE_ROOT: fixtureWorkspace };
  execFileSync("bash", [wrapper, "--dry-run", "--with-project-context", "code-project", "wrapped"], { env });
  expect(existsSync(fixtureWorkspace)).toBe(false);
  execFileSync("bash", [wrapper, "--with-project-context", "code-project", "wrapped"], { env });
  const dest = path.join(fixtureWorkspace, "40_Code/projects/wrapped");
  expect(existsSync(path.join(dest, "PROJECT_CONTEXT.md"))).toBe(true);
  expect(JSON.parse(execFileSync("python3", [path.join(dest, "scripts/validate_project.py"), dest], { encoding: "utf8" })).ok).toBe(true);
});
