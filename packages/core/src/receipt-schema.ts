import { readFile } from "node:fs/promises";
import path from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";

export type ReceiptValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

export async function validateReceiptObject(
  repoRoot: string,
  receipt: unknown
): Promise<ReceiptValidationResult> {
  const schema = JSON.parse(
    await readFile(path.join(repoRoot, "contracts", "schemas", "agent-receipt.schema.json"), "utf8")
  ) as object;
  const ajv = new Ajv2020({ allErrors: true });
  const validate = ajv.compile(schema);
  if (validate(receipt)) {
    return { ok: true };
  }
  return {
    ok: false,
    errors: (validate.errors ?? []).map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`)
  };
}
