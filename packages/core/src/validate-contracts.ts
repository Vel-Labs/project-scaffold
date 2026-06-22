import { Ajv2020, type AnySchema } from "ajv/dist/2020.js";
import path from "node:path";
import { readJsonFiles, readJsonFilesRecursive } from "./read-json-files.js";
import type { ContractJsonFile, ContractValidationResult } from "./types.js";
import { validateAgentGovernance, validateGovernanceArtifacts } from "./validate-governance.js";

export async function validateContractCorpus(
  contractsDir: string
): Promise<ContractValidationResult> {
  const errors: string[] = [];
  const schemasDir = path.join(contractsDir, "schemas");
  const validExamplesDir = path.join(contractsDir, "examples", "valid");
  const invalidExamplesDir = path.join(contractsDir, "examples", "invalid");
  const governanceDir = path.join(contractsDir, "agent-governance");
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const schemaIdByName = new Map<string, string>();
  let schemaFiles: ContractJsonFile[] = [];
  let validExamples: ContractJsonFile[] = [];
  let invalidExamples: ContractJsonFile[] = [];
  let contractArtifacts: ContractJsonFile[] = [];

  try {
    schemaFiles = await readJsonFiles(schemasDir);
    validExamples = await readJsonFiles(validExamplesDir);
    invalidExamples = await readJsonFiles(invalidExamplesDir);
    contractArtifacts = await readJsonFilesRecursive(governanceDir).catch(() => []);
  } catch (error) {
    return { ok: false, errors: [`failed to read contract corpus: ${formatError(error)}`] };
  }

  for (const schemaFile of schemaFiles) {
    try {
      ajv.addSchema(schemaFile.value as AnySchema);
      const schemaName = schemaNameFromId(schemaFile.value);
      const schemaId = schemaIdFromValue(schemaFile.value);
      if (schemaName && schemaId) {
        schemaIdByName.set(schemaName, schemaId);
      }
    } catch (error) {
      errors.push(`${schemaFile.file}: failed to add schema: ${formatError(error)}`);
    }
  }

  for (const example of validExamples) {
    validateArtifact(ajv, schemaIdByName, example, true, false, errors);
  }
  for (const example of invalidExamples) {
    validateArtifact(ajv, schemaIdByName, example, false, true, errors);
  }
  for (const artifact of contractArtifacts) {
    validateArtifact(ajv, schemaIdByName, artifact, true, false, errors);
  }
  if (contractArtifacts.length > 0) {
    const governance = await validateAgentGovernance(path.dirname(contractsDir));
    if (!governance.ok) {
      errors.push(...governance.errors);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    checked: {
      schemas: schemaFiles.length,
      validExamples: validExamples.length,
      invalidExamples: invalidExamples.length,
      contractArtifacts: contractArtifacts.length
    }
  };
}

function validateArtifact(
  ajv: InstanceType<typeof Ajv2020>,
  schemaIdByName: Map<string, string>,
  artifact: ContractJsonFile,
  shouldPass: boolean,
  applySemantic: boolean,
  errors: string[]
): void {
  const schemaName = readSchemaName(artifact);
  const schemaId = schemaIdByName.get(schemaName);
  if (!schemaId) {
    if (shouldPass) {
      errors.push(`${artifact.file}: unknown schema "${schemaName}"`);
    }
    return;
  }

  const validate = ajv.getSchema(schemaId);
  if (!validate) {
    errors.push(`${artifact.file}: schema "${schemaId}" is not registered`);
    return;
  }

  const passedSchema = validate(artifact.value);
  const semantic = applySemantic && schemaName.startsWith("agent-")
    ? validateGovernanceArtifacts([artifact])
    : { ok: true as const };
  const semanticErrors = semantic.ok ? [] : semantic.errors;
  const passed = passedSchema && semantic.ok;

  if (shouldPass && !passed) {
    errors.push(
      `${artifact.file}: expected valid, got ${ajv.errorsText(validate.errors)} ${semanticErrors.join("; ")}`.trim()
    );
  }
  if (!shouldPass && passed) {
    errors.push(`${artifact.file}: expected invalid, but validation passed`);
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

function schemaNameFromId(schema: unknown): string | undefined {
  const id = schemaIdFromValue(schema);
  if (!id) {
    return undefined;
  }
  const file = path.basename(id);
  return file.endsWith(".schema.json") ? file.slice(0, -".schema.json".length) : undefined;
}

function schemaIdFromValue(schema: unknown): string | undefined {
  if (
    typeof schema === "object" &&
    schema !== null &&
    "$id" in schema &&
    typeof schema.$id === "string"
  ) {
    return schema.$id;
  }
  return undefined;
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
