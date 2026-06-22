import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type ReceiptPolicy = {
  storage: {
    transientDirectory: string;
    maxReceiptBytes: number;
  };
  privacy: {
    redactPatterns: string[];
  };
};

export type ReceiptWriteResult =
  | { ok: true; file: string; receiptId: string }
  | { ok: false; errors: string[] };

export async function writeAgentReceipt(
  repoRoot: string,
  receiptInputPath: string,
  policyPath = "contracts/agent-governance/receipt-policy.json"
): Promise<ReceiptWriteResult> {
  const policy = JSON.parse(await readFile(path.join(repoRoot, policyPath), "utf8")) as ReceiptPolicy;
  const receipt = JSON.parse(await readFile(path.resolve(repoRoot, receiptInputPath), "utf8")) as Record<string, unknown>;
  const receiptId = typeof receipt.receiptId === "string" ? receipt.receiptId : "run-receipt";
  const redacted = redactValue(receipt, policy.privacy.redactPatterns);
  const serialized = `${JSON.stringify(redacted, null, 2)}\n`;

  if (Buffer.byteLength(serialized) > policy.storage.maxReceiptBytes) {
    return { ok: false, errors: [`receipt exceeds maxReceiptBytes: ${receiptId}`] };
  }

  const outputDir = path.join(repoRoot, policy.storage.transientDirectory, receiptId);
  await mkdir(outputDir, { recursive: true });
  const outputFile = path.join(outputDir, "receipt.json");
  await writeFile(outputFile, serialized);
  return { ok: true, file: outputFile, receiptId };
}

function redactValue(value: unknown, patterns: string[]): unknown {
  if (typeof value === "string") {
    return patterns.reduce((current, pattern) => {
      return current.replace(new RegExp(pattern, "gi"), "[REDACTED]");
    }, value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, patterns));
  }
  if (typeof value !== "object" || value === null) {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, redactValue(item, patterns)])
  );
}
