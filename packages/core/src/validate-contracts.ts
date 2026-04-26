import { Ajv2020, type AnySchema } from "ajv/dist/2020.js";
import path from "node:path";
import { readJsonFiles } from "./read-json-files.js";
import type { ContractJsonFile, ContractValidationResult } from "./types.js";

const schemaByName = new Map([["project-capability", "project-capability.schema.json"]]);

export async function validateContractCorpus(
  contractsDir: string
): Promise<ContractValidationResult> {
  const errors: string[] = [];
  const schemasDir = path.join(contractsDir, "schemas");
  const validExamplesDir = path.join(contractsDir, "examples", "valid");
  const invalidExamplesDir = path.join(contractsDir, "examples", "invalid");
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  let schemaFiles: ContractJsonFile[] = [];
  let validExamples: ContractJsonFile[] = [];
  let invalidExamples: ContractJsonFile[] = [];

  try {
    schemaFiles = await readJsonFiles(schemasDir);
    validExamples = await readJsonFiles(validExamplesDir);
    invalidExamples = await readJsonFiles(invalidExamplesDir);
  } catch (error) {
    return { ok: false, errors: [`failed to read contract corpus: ${formatError(error)}`] };
  }

  for (const schemaFile of schemaFiles) {
    try {
      ajv.addSchema(schemaFile.value as AnySchema);
    } catch (error) {
      errors.push(`${schemaFile.file}: failed to add schema: ${formatError(error)}`);
    }
  }

  for (const example of validExamples) {
    validateExample(ajv, example, true, errors);
  }

  for (const example of invalidExamples) {
    validateExample(ajv, example, false, errors);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    checked: {
      schemas: schemaFiles.length,
      validExamples: validExamples.length,
      invalidExamples: invalidExamples.length
    }
  };
}

function validateExample(
  ajv: InstanceType<typeof Ajv2020>,
  example: ContractJsonFile,
  shouldPass: boolean,
  errors: string[]
): void {
  const schemaName = readSchemaName(example);
  const schemaFile = schemaByName.get(schemaName);
  if (!schemaFile) {
    errors.push(`${example.file}: unknown schema "${schemaName}"`);
    return;
  }

  const validate = ajv.getSchema(
    `https://project-governance-scaffold.local/schemas/${schemaFile}`
  );
  if (!validate) {
    errors.push(`${example.file}: schema "${schemaFile}" is not registered`);
    return;
  }

  const passed = validate(example.value);
  if (shouldPass && !passed) {
    errors.push(`${example.file}: expected valid, got ${ajv.errorsText(validate.errors)}`);
  }
  if (!shouldPass && passed) {
    errors.push(`${example.file}: expected invalid, but validation passed`);
  }
}

function readSchemaName(example: ContractJsonFile): string {
  if (
    typeof example.value === "object" &&
    example.value !== null &&
    "schema" in example.value &&
    typeof example.value.schema === "string"
  ) {
    return example.value.schema;
  }

  return "<missing>";
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
