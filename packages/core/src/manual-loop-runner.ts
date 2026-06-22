import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { sha256Text } from "./file-utils.js";

export type ManualLoopOptions = {
  manifestPath: string;
  verifyCommand: string;
  maxIterations?: number;
};

export type ManualLoopResult =
  | { ok: true; stopReceiptFile: string }
  | { ok: false; errors: string[] };

export async function runManualLoop(
  repoRoot: string,
  options: ManualLoopOptions
): Promise<ManualLoopResult> {
  const loop = JSON.parse(
    await readFile(path.join(repoRoot, "contracts", "agent-governance", "loops", "change-hardening.json"), "utf8")
  ) as Record<string, unknown>;
  if (loop.executionMode !== "manual") {
    return { ok: false, errors: ["loop runner only supports manual loops"] };
  }

  const limits = loop.limits as Record<string, number> | undefined;
  const maxAllowed = limits?.maxIterations ?? 1;
  const iterations = options.maxIterations ?? 1;
  if (iterations < 1 || iterations > maxAllowed) {
    return { ok: false, errors: [`max iterations must be between 1 and ${maxAllowed}`] };
  }
  if (!options.verifyCommand.trim()) {
    return { ok: false, errors: ["objective verifier command is required"] };
  }

  const manifest = JSON.parse(await readFile(path.resolve(repoRoot, options.manifestPath), "utf8")) as Record<string, unknown>;
  for (const required of ["assignmentPath", "contextPackPath"]) {
    if (typeof manifest[required] !== "string") {
      return { ok: false, errors: [`manifest missing ${required}`] };
    }
  }

  const changedFilesBefore = gitLines(repoRoot, ["diff", "--name-only"]).length;
  const maxChangedFiles = limits?.maxChangedFiles ?? 40;
  if (changedFilesBefore > maxChangedFiles) {
    return { ok: false, errors: [`changed file count exceeds loop limit: ${changedFilesBefore}/${maxChangedFiles}`] };
  }

  let exitCode = 0;
  let output = "";
  try {
    output = execFileSync(options.verifyCommand, {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch (error) {
    exitCode = typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : 1;
    output = String((error as { stdout?: unknown }).stdout ?? (error as { stderr?: unknown }).stderr ?? error);
  }

  const runId = String(manifest.runId ?? "manual-loop");
  const stopReceipt = {
    schema: "agent-loop-stop-receipt",
    runId,
    loopId: loop.id,
    stoppedAt: new Date().toISOString(),
    iterations,
    objectiveVerifier: options.verifyCommand,
    exitCode,
    outputDigest: sha256Text(output),
    status: exitCode === 0 ? "pass" : "blocked",
    changedFiles: gitLines(repoRoot, ["diff", "--name-only"])
  };
  const stopReceiptFile = path.join(repoRoot, ".agent-runs", runId, "stop-receipt.json");
  await mkdir(path.dirname(stopReceiptFile), { recursive: true });
  await writeFile(stopReceiptFile, `${JSON.stringify(stopReceipt, null, 2)}\n`);

  if (exitCode !== 0) {
    return { ok: false, errors: [`objective verifier failed; stop receipt written: ${stopReceiptFile}`] };
  }
  return { ok: true, stopReceiptFile };
}

function gitLines(repoRoot: string, args: string[]): string[] {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
