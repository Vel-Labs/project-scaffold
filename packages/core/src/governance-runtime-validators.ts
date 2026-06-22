import {
  asRecord,
  autonomyRank,
  deniedPhaseOneActions,
  hasUnsafePathPattern,
  readArray,
  readString,
  readStringArray,
  requireKnown
} from "./governance-helpers.js";
import type { ContractJsonFile } from "./types.js";

export function validateAssignments(
  artifacts: ContractJsonFile[],
  routes: Map<string, Record<string, unknown>>,
  workflows: Map<string, ContractJsonFile>,
  personas: Map<string, ContractJsonFile>,
  errors: string[]
): void {
  for (const artifact of artifacts) {
    const value = asRecord(artifact.value);
    const id = readString(value, "id") ?? "<missing>";
    const routeId = readString(value, "routeId") ?? "<missing>";
    const route = routes.get(routeId);

    if (!route) {
      errors.push(`${artifact.file}: assignment "${id}" references unknown route "${routeId}"`);
    }
    requireKnown(workflows, value.workflowId, artifact.file, `assignment "${id}" workflow`, errors);
    requireKnown(personas, value.makerPersonaId, artifact.file, `assignment "${id}" maker persona`, errors);
    requireKnown(personas, value.verifierPersonaId, artifact.file, `assignment "${id}" verifier persona`, errors);

    if (route) {
      if (value.workflowId !== route.workflowId) {
        errors.push(`${artifact.file}: assignment "${id}" workflow does not match route "${routeId}"`);
      }
      if (value.makerPersonaId !== route.makerPersonaId || value.verifierPersonaId !== route.verifierPersonaId) {
        errors.push(`${artifact.file}: assignment "${id}" personas do not match route "${routeId}"`);
      }
      if (autonomyRank(readString(value, "autonomyLevel")) > autonomyRank(readString(route, "autonomyCeiling"))) {
        errors.push(`${artifact.file}: assignment "${id}" autonomy exceeds route ceiling`);
      }
    }
    for (const action of readStringArray(value, "requestedActions")) {
      if (route && !readStringArray(route, "requestedActions").includes(action)) {
        errors.push(`${artifact.file}: assignment "${id}" requests action "${action}" outside route authority`);
      }
      if (deniedPhaseOneActions.has(action)) {
        errors.push(`${artifact.file}: assignment "${id}" requests denied action "${action}"`);
      }
    }
    for (const pathValue of [
      ...readStringArray(value, "allowedPaths"),
      ...readStringArray(value, "forbiddenPaths")
    ]) {
      if (hasUnsafePathPattern(pathValue)) {
        errors.push(`${artifact.file}: assignment "${id}" contains unsafe path "${pathValue}"`);
      }
    }
    if (value.receiptRequired !== true) {
      errors.push(`${artifact.file}: assignment "${id}" must require a receipt`);
    }
  }
}

export function validateContextProfiles(
  artifacts: ContractJsonFile[],
  routes: Map<string, Record<string, unknown>>,
  errors: string[]
): void {
  for (const artifact of artifacts) {
    const value = asRecord(artifact.value);
    const id = readString(value, "id") ?? "<missing>";
    const routeId = readString(value, "routeId") ?? "<missing>";
    if (!routes.has(routeId)) {
      errors.push(`${artifact.file}: context profile "${id}" references unknown route "${routeId}"`);
    }
    const output = asRecord(value.output);
    if (readString(output, "directory") !== ".agent-context/") {
      errors.push(`${artifact.file}: context profile "${id}" must output to .agent-context/`);
    }
    if (output.includeSha256 !== true) {
      errors.push(`${artifact.file}: context profile "${id}" must include source hashes`);
    }
    if (typeof output.maxFiles !== "number" || output.maxFiles < 1) {
      errors.push(`${artifact.file}: context profile "${id}" must define output.maxFiles`);
    }
    const denied = readStringArray(value, "deniedPatterns");
    for (const required of [".env", "*.pem", "*.key", "node_modules", ".git"]) {
      if (!denied.some((pattern) => pattern.includes(required))) {
        errors.push(`${artifact.file}: context profile "${id}" missing denied pattern for ${required}`);
      }
    }
    for (const source of [
      ...readArray(value, "requiredSources").map(asRecord),
      ...readArray(value, "optionalSources").map(asRecord)
    ]) {
      const sourcePath = readString(source, "path") ?? "";
      const authority = readString(source, "authority") ?? "";
      if (hasUnsafePathPattern(sourcePath)) {
        errors.push(`${artifact.file}: context profile "${id}" contains unsafe source path "${sourcePath}"`);
      }
      if (authority === "transient") {
        errors.push(`${artifact.file}: context profile "${id}" uses transient source "${sourcePath}"`);
      }
    }
  }
}

export function validateReceiptPolicies(artifacts: ContractJsonFile[], errors: string[]): void {
  for (const artifact of artifacts) {
    const value = asRecord(artifact.value);
    const id = readString(value, "id") ?? "<missing>";
    const storage = asRecord(value.storage);
    if (readString(storage, "transientDirectory") !== ".agent-runs/") {
      errors.push(`${artifact.file}: receipt policy "${id}" must use .agent-runs/ for transient storage`);
    }
    if (readString(storage, "promotedDirectory") !== "docs/audits/") {
      errors.push(`${artifact.file}: receipt policy "${id}" must promote only to docs/audits/`);
    }
    const privacy = asRecord(value.privacy);
    for (const field of ["forbidSecrets", "forbidFullTranscripts", "forbidEnvironmentDumps"]) {
      if (privacy[field] !== true) {
        errors.push(`${artifact.file}: receipt policy "${id}" must set ${field}=true`);
      }
    }
    const requiredFields = readStringArray(value, "requiredFields");
    for (const field of ["request", "assignment", "route", "commands", "verificationEvidence", "changes", "final"]) {
      if (!requiredFields.includes(field)) {
        errors.push(`${artifact.file}: receipt policy "${id}" missing required field "${field}"`);
      }
    }
    const promotion = asRecord(value.promotion);
    if (promotion.requiresHumanReview !== true || promotion.requiresAuditReason !== true) {
      errors.push(`${artifact.file}: receipt policy "${id}" promotion must require human review and audit reason`);
    }
  }
}
