import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateReceiptObject } from "./receipt-schema.js";

type ReceiptPolicy = {
  storage: {
    transientDirectory: string;
    promotedDirectory?: string;
    maxReceiptBytes: number;
  };
  privacy: {
    redactPatterns: string[];
  };
};

export type ReceiptWriteResult =
  | { ok: true; file: string; receiptId: string }
  | { ok: false; errors: string[] };

export type ReceiptWriteOptions = {
  promote?: boolean;
  auditReason?: string;
};

export async function writeAgentReceipt(
  repoRoot: string,
  receiptInputPath: string,
  policyPath = "contracts/agent-governance/receipt-policy.json",
  options: ReceiptWriteOptions = {}
): Promise<ReceiptWriteResult> {
  const policy = JSON.parse(await readFile(path.join(repoRoot, policyPath), "utf8")) as ReceiptPolicy;
  const receipt = JSON.parse(await readFile(path.resolve(repoRoot, receiptInputPath), "utf8")) as Record<string, unknown>;
  const receiptId = typeof receipt.receiptId === "string" ? receipt.receiptId : "run-receipt";
  const validation = await validateReceiptObject(repoRoot, receipt);
  if (!validation.ok) {
    return validation;
  }
  if (options.promote && !options.auditReason?.trim()) {
    return { ok: false, errors: ["promoted receipts require --audit-reason"] };
  }
  const redacted = redactValue(receipt, policy.privacy.redactPatterns);
  const serialized = `${JSON.stringify(redacted, null, 2)}\n`;

  if (Buffer.byteLength(serialized) > policy.storage.maxReceiptBytes) {
    return { ok: false, errors: [`receipt exceeds maxReceiptBytes: ${receiptId}`] };
  }

  const outputDir = options.promote
    ? path.join(repoRoot, policy.storage.promotedDirectory ?? "docs/audits/")
    : path.join(repoRoot, policy.storage.transientDirectory, receiptId);
  await mkdir(outputDir, { recursive: true });
  const outputFile = options.promote
    ? path.join(outputDir, `${receiptId}.receipt.json`)
    : path.join(outputDir, "receipt.json");
  await writeFile(outputFile, serialized);
  if (options.promote) {
    await writeFile(
      path.join(outputDir, `${receiptId}.promotion.json`),
      `${JSON.stringify({
        schema: "agent-receipt-promotion",
        receiptId,
        promotedAt: new Date().toISOString(),
        auditReason: options.auditReason
      }, null, 2)}\n`
    );
  }
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
