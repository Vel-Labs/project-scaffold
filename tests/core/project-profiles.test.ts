import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import { expect, test } from "vitest";

const root = process.cwd();
const scratch = path.join(root, ".agent-runs");
mkdirSync(scratch, { recursive: true });
const evidence = mkdtempSync(path.join(scratch, "profiles-"));
const generator = path.join(root, "scripts/create-project.py");
const generate = (name: string, ...args: string[]) => execFileSync("python3", [generator, path.join(evidence, name), "--name", name, ...args], { encoding: "utf8", stdio: "pipe" });
const profile = (name: string) => JSON.parse(readFileSync(path.join(evidence, name, "REPO_PROFILE.json"), "utf8"));
const validate = (name: string) => execFileSync("python3", [path.join(evidence, name, "scripts/validate_project.py"), path.join(evidence, name)], { encoding: "utf8", stdio: "pipe" });
const schema = JSON.parse(readFileSync(path.join(root, "contracts/schemas/repo-profile.schema.json"), "utf8"));
const checkSchema = new Ajv2020({ strict: false }).compile(schema);

test.each(["standard", "tool", "experimental", "arcade", "disposable"])("%s creates a local maintained project without inherited infrastructure", (kind) => {
  generate(kind, "--profile", kind);
  const value = profile(kind);
  expect(checkSchema(value), JSON.stringify(checkSchema.errors)).toBe(true);
  expect(value.project.kind).toBe(kind);
  expect(value.publication).toMatchObject({ state: "local", repository: null, surfaces: [], consent: { metadataSync: false } });
  expect(JSON.parse(validate(kind)).ok).toBe(true);
  for (const excluded of [".git", ".github", ".claude", "package.json", "skills", "contracts/agent-governance"]) {
    expect(existsSync(path.join(evidence, kind, excluded))).toBe(false);
  }
  if (kind === "arcade") {
    const arcade = JSON.parse(readFileSync(path.join(evidence, kind, "arcade.json"), "utf8"));
    expect(arcade.status).toBe("workshop");
    expect(arcade.playUrl).toBeUndefined();
    expect(arcade.tags.some((tag: string) => tag.startsWith("model:"))).toBe(false);
    execFileSync(process.execPath, ["--check", path.join(evidence, kind, "game.js")]);
  }
});

test("dry run, invalid input and existing destination cause no project writes", () => {
  generate("preview", "--dry-run", "--profile", "arcade");
  expect(existsSync(path.join(evidence, "preview"))).toBe(false);
  for (const flags of [
    ["--publication", "enrolled", "--repository", "velcrafting/demo", "--surface", "projects"],
    ["--summary", "private /Users/steven/work"],
    ["--summary", "line\nbreak"],
    ["--repository", "invalid/../escape"],
    ["--profile", "arcade", "--surface", "arcade-playable"],
    ["--profile", "disposable", "--publication", "public-unenrolled", "--repository", "velcrafting/demo", "--summary", "Disposable draft."],
  ]) {
    expect(() => generate("invalid", ...flags)).toThrow();
    expect(existsSync(path.join(evidence, "invalid"))).toBe(false);
  }
  const before = readFileSync(path.join(evidence, "standard", "REPO_PROFILE.json"));
  expect(() => generate("standard")).toThrow();
  expect(readFileSync(path.join(evidence, "standard", "REPO_PROFILE.json"))).toEqual(before);
});

test("enrollment records exact source identity and bounded explicit metadata", () => {
  generate("enrolled", "--publication", "enrolled", "--repository", "Vel-Labs/enrolled", "--surface", "projects", "--surface", "projects", "--title", "Enrolled build", "--summary", "A reviewed source metadata example.");
  const value = profile("enrolled");
  expect(value.publication).toEqual({ state: "enrolled", repository: "Vel-Labs/enrolled", surfaces: ["projects"], title: "Enrolled build", summary: "A reviewed source metadata example.", consent: { metadataSync: true } });
  expect(checkSchema(value)).toBe(true);
  value.publication.consent.metadataSync = false;
  expect(checkSchema(value)).toBe(false);
});

test("adoption adds absent metadata and leaves authored files byte identical", () => {
  const dest = path.join(evidence, "adopted");
  mkdirSync(path.join(dest, ".github/workflows"), { recursive: true });
  const authored = { "README.md": "# My authored project\n", "AGENTS.md": "Keep my project rules.\n", ".github/workflows/existing.yml": "name: Existing\n", ".gitignore": "my-private-data/\n" };
  for (const [file, content] of Object.entries(authored)) writeFileSync(path.join(dest, file), content);
  generate("adopted", "--adopt", "--profile", "tool");
  for (const [file, content] of Object.entries(authored)) expect(readFileSync(path.join(dest, file), "utf8")).toBe(content);
  expect(JSON.parse(validate("adopted")).ok).toBe(true);
  const before = readFileSync(path.join(dest, "REPO_PROFILE.json"));
  expect(() => generate("adopted", "--adopt")).toThrow();
  expect(readFileSync(path.join(dest, "REPO_PROFILE.json"))).toEqual(before);
});

test("symlinks and invalid resource boundaries fail before write or validation", () => {
  const dest = path.join(evidence, "symlinked");
  mkdirSync(dest);
  symlinkSync(path.join(evidence, "standard", "docs"), path.join(dest, "docs"));
  expect(() => generate("symlinked", "--adopt")).toThrow();
  expect(existsSync(path.join(dest, "REPO_PROFILE.json"))).toBe(false);
  const value = profile("enrolled");
  value.canonicalPaths.bad = "../standard/README.md";
  writeFileSync(path.join(evidence, "enrolled", "REPO_PROFILE.json"), JSON.stringify(value));
  expect(() => validate("enrolled")).toThrow();
});

test("adoption refuses conflicting validation resources before adding metadata", () => {
  const dest = path.join(evidence, "conflicting");
  mkdirSync(path.join(dest, "scripts"), { recursive: true });
  writeFileSync(path.join(dest, "scripts/validate_project.py"), "# Authored validator\n");
  expect(() => generate("conflicting", "--adopt")).toThrow();
  expect(existsSync(path.join(dest, "REPO_PROFILE.json"))).toBe(false);
  expect(existsSync(path.join(dest, "README.md"))).toBe(false);
  expect(readFileSync(path.join(dest, "scripts/validate_project.py"), "utf8")).toBe("# Authored validator\n");
});

test("existing Arcade adoption preserves game bytes and refuses unverified play URLs", () => {
  const dest = path.join(evidence, "existing-game");
  mkdirSync(dest);
  const authored = { "index.html": "<h1>Authored game</h1>\n", "game.js": "// Authored game implementation\n", "arcade.json": JSON.stringify({ summary: "An authored local workshop.", status: "workshop", tags: [] }) };
  for (const [file, content] of Object.entries(authored)) writeFileSync(path.join(dest, file), content);
  generate("existing-game", "--adopt", "--profile", "arcade");
  for (const [file, content] of Object.entries(authored)) expect(readFileSync(path.join(dest, file), "utf8")).toBe(content);
  expect(readFileSync(path.join(dest, "README.md"), "utf8")).not.toContain("makes no external requests");
  expect(JSON.parse(validate("existing-game")).ok).toBe(true);
  const rejected = path.join(evidence, "unverified-game");
  mkdirSync(rejected);
  for (const [file, content] of Object.entries(authored)) writeFileSync(path.join(rejected, file), content);
  writeFileSync(path.join(rejected, "arcade.json"), JSON.stringify({ summary: "Unverified deployed game.", status: "playable", playUrl: "https://example.com/game" }));
  expect(() => generate("unverified-game", "--adopt", "--profile", "arcade")).toThrow();
  expect(existsSync(path.join(rejected, "REPO_PROFILE.json"))).toBe(false);
});

console.log(`Retained generated profile evidence: ${evidence}`);


test("CI is opt-in, read-only, and uses the generated validator", () => {
  generate("selected-ci", "--with-ci");
  const workflow=readFileSync(path.join(evidence,"selected-ci/.github/workflows/validate-project.yml"),"utf8");
  expect(workflow).toContain("contents: read");
  expect(workflow).toContain("persist-credentials: false");
  expect(workflow).toContain("python3 scripts/validate_project.py .");
  expect(workflow).not.toContain("pull_request_target");
  expect(JSON.parse(validate("selected-ci")).ok).toBe(true);
});

test("Arcade includes the current offline author contract", () => {
  generate("offline-contract", "--profile", "arcade");
  expect(readFileSync(path.join(evidence,"offline-contract/docs/arcade-author-contract.md"),"utf8"))
    .toBe(readFileSync(path.join(root,"templates/arcade/AUTHOR_CONTRACT.md"),"utf8"));
  expect(JSON.parse(validate("offline-contract")).ok).toBe(true);
});


test("standalone owners can record publication intent without an account-specific bridge", () => {
  generate("independent", "--publication", "enrolled", "--repository", "ExampleOrg/own-tool",
    "--surface", "projects", "--summary", "An independent project using its own website.");
  expect(profile("independent").publication.repository).toBe("ExampleOrg/own-tool");
  expect(checkSchema(profile("independent"))).toBe(true);
  expect(JSON.parse(validate("independent")).ok).toBe(true);
});
