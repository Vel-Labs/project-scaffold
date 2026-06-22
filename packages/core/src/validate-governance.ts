import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { readJsonFilesRecursive } from "./read-json-files.js";
import {
  asRecord,
  countArrayItems,
  deniedPhaseOneActions,
  formatError,
  hasSecretLikeValue,
  idMap,
  knownGovernanceSchemas,
  lifecycleStates,
  readArray,
  readString,
  readStringArray,
  requireKnown,
  riskRank
} from "./governance-helpers.js";
import {
  validateAssignments,
  validateContextProfiles,
  validateReceiptPolicies
} from "./governance-runtime-validators.js";
import type {
  ContractJsonFile,
  GovernanceValidationResult
} from "./types.js";

export async function validateAgentGovernance(
  repoRoot: string
): Promise<GovernanceValidationResult> {
  try {
    const artifacts = await readJsonFilesRecursive(
      path.join(repoRoot, "contracts", "agent-governance")
    );
    const skillIds = await readSkillIds(path.join(repoRoot, "skills"));
    return validateGovernanceArtifacts(artifacts, skillIds);
  } catch (error) {
    return {
      ok: false,
      errors: [`failed to read agent governance contracts: ${formatError(error)}`]
    };
  }
}

export async function validateAgentAssignmentFile(
  repoRoot: string,
  assignmentFile: string
): Promise<GovernanceValidationResult> {
  try {
    const artifacts = await readJsonFilesRecursive(
      path.join(repoRoot, "contracts", "agent-governance")
    );
    const resolvedAssignment = path.resolve(repoRoot, assignmentFile);
    if (!artifacts.some((artifact) => path.resolve(artifact.file) === resolvedAssignment)) {
      const raw = await readFile(resolvedAssignment, "utf8");
      artifacts.push({
        file: resolvedAssignment,
        value: JSON.parse(raw) as unknown
      });
    }
    const skillIds = await readSkillIds(path.join(repoRoot, "skills"));
    return validateGovernanceArtifacts(artifacts, skillIds);
  } catch (error) {
    return {
      ok: false,
      errors: [`failed to validate assignment: ${formatError(error)}`]
    };
  }
}

export function validateGovernanceArtifacts(
  artifacts: ContractJsonFile[],
  skillIds: Set<string> = new Set()
): GovernanceValidationResult {
  const errors: string[] = [];
  const bySchema = groupBySchema(artifacts, errors);
  const personas = idMap(bySchema.get("agent-persona") ?? [], errors, "persona");
  const workflows = idMap(bySchema.get("agent-workflow") ?? [], errors, "workflow");
  const capabilities = idMap(bySchema.get("agent-capability") ?? [], errors, "capability");
  const routes = readRoutes(bySchema.get("agent-router") ?? []);

  validatePolicies(bySchema.get("agent-policy") ?? [], errors);
  validatePersonas(personas, capabilities, errors);
  validateRouters(bySchema.get("agent-router") ?? [], workflows, personas, skillIds, errors);
  validateAssignments(bySchema.get("agent-assignment") ?? [], routes, workflows, personas, errors);
  validateContextProfiles(bySchema.get("agent-context-profile") ?? [], routes, errors);
  validateWorkflows(bySchema.get("agent-workflow") ?? [], personas, skillIds, errors);
  validateLoops(bySchema.get("agent-loop") ?? [], workflows, personas, errors);
  validateHookPolicies(bySchema.get("agent-hook-policy") ?? [], errors);
  validateSourceAuthority(bySchema.get("agent-source-authority") ?? [], errors);
  validateReceipts(bySchema.get("agent-receipt") ?? [], errors);
  validateReceiptPolicies(bySchema.get("agent-receipt-policy") ?? [], errors);
  validateLearnings(bySchema.get("agent-learning") ?? [], errors);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    checked: {
      artifacts: artifacts.length,
      routes: countArrayItems(bySchema.get("agent-router") ?? [], "routes"),
      assignments: bySchema.get("agent-assignment")?.length ?? 0,
      contextProfiles: bySchema.get("agent-context-profile")?.length ?? 0,
      workflows: bySchema.get("agent-workflow")?.length ?? 0,
      loops: bySchema.get("agent-loop")?.length ?? 0,
      hooks: countArrayItems(bySchema.get("agent-hook-policy") ?? [], "hooks"),
      receipts: bySchema.get("agent-receipt")?.length ?? 0,
      receiptPolicies: bySchema.get("agent-receipt-policy")?.length ?? 0,
      learnings: bySchema.get("agent-learning")?.length ?? 0
    }
  };
}

function readRoutes(artifacts: ContractJsonFile[]): Map<string, Record<string, unknown>> {
  const routes = new Map<string, Record<string, unknown>>();
  for (const artifact of artifacts) {
    for (const route of readArray(asRecord(artifact.value), "routes").map(asRecord)) {
      const id = readString(route, "id");
      if (id) {
        routes.set(id, route);
      }
    }
  }
  return routes;
}

function groupBySchema(
  artifacts: ContractJsonFile[],
  errors: string[]
): Map<string, ContractJsonFile[]> {
  const grouped = new Map<string, ContractJsonFile[]>();
  const seen = new Set<string>();

  for (const artifact of artifacts) {
    const schema = readString(artifact.value, "schema");
    const id = readString(artifact.value, "id") ?? readString(artifact.value, "receiptId");
    const lifecycle = readString(artifact.value, "lifecycle");

    if (!schema || !knownGovernanceSchemas.has(schema)) {
      errors.push(`${artifact.file}: unknown governance schema "${schema ?? "<missing>"}"`);
      continue;
    }
    if (!lifecycle || !lifecycleStates.has(lifecycle)) {
      errors.push(`${artifact.file}: unknown lifecycle state "${lifecycle ?? "<missing>"}"`);
    }
    if (id) {
      const key = `${schema}:${id}`;
      if (seen.has(key)) {
        errors.push(`${artifact.file}: duplicate ${schema} id "${id}"`);
      }
      seen.add(key);
    }
    const list = grouped.get(schema) ?? [];
    list.push(artifact);
    grouped.set(schema, list);
  }

  return grouped;
}

function validatePolicies(artifacts: ContractJsonFile[], errors: string[]): void {
  for (const artifact of artifacts) {
    const value = asRecord(artifact.value);
    const precedence = asRecord(value.precedence);
    if (precedence.denyOverridesPermit !== true) {
      errors.push(`${artifact.file}: policy must state denyOverridesPermit=true`);
    }
    if (precedence.effectiveAuthority !== "intersection") {
      errors.push(`${artifact.file}: policy effective authority must be intersection`);
    }
  }
}

function validatePersonas(
  personas: Map<string, ContractJsonFile>,
  capabilities: Map<string, ContractJsonFile>,
  errors: string[]
): void {
  for (const [id, artifact] of personas) {
    const value = asRecord(artifact.value);
    const capabilityId = readString(value, "capabilityId");
    const authority = asRecord(value.authority);
    const approval = asRecord(value.approval);

    if (capabilityId && !capabilities.has(capabilityId)) {
      errors.push(`${artifact.file}: persona "${id}" references unknown capability "${capabilityId}"`);
    }
    if (
      authority.mayAuthor === true &&
      authority.mayApprove === true &&
      riskRank(readString(approval, "approvalRiskCeiling")) >= riskRank("medium")
    ) {
      errors.push(`${artifact.file}: persona "${id}" may self-approve medium/high risk work`);
    }
  }
}

function validateRouters(
  artifacts: ContractJsonFile[],
  workflows: Map<string, ContractJsonFile>,
  personas: Map<string, ContractJsonFile>,
  skillIds: Set<string>,
  errors: string[]
): void {
  for (const artifact of artifacts) {
    for (const route of readArray(asRecord(artifact.value), "routes")) {
      const record = asRecord(route);
      const id = readString(record, "id") ?? "<missing>";
      requireKnown(workflows, record.workflowId, artifact.file, `route "${id}" workflow`, errors);
      requireKnown(personas, record.makerPersonaId, artifact.file, `route "${id}" maker persona`, errors);
      requireKnown(personas, record.verifierPersonaId, artifact.file, `route "${id}" verifier persona`, errors);
      for (const skill of readStringArray(record, "requiredSkills")) {
        if (!skillIds.has(skill)) {
          errors.push(`${artifact.file}: route "${id}" references unknown skill "${skill}"`);
        }
      }
      for (const action of readStringArray(record, "requestedActions")) {
        if (deniedPhaseOneActions.has(action)) {
          errors.push(`${artifact.file}: route "${id}" requests denied phase-one action "${action}"`);
        }
      }
    }
  }
}

function validateWorkflows(
  artifacts: ContractJsonFile[],
  personas: Map<string, ContractJsonFile>,
  skillIds: Set<string>,
  errors: string[]
): void {
  for (const artifact of artifacts) {
    const value = asRecord(artifact.value);
    const workflowId = readString(value, "id") ?? "<missing>";
    const stages = readArray(value, "stages").map(asRecord);
    const stageIds = new Set(stages.map((stage) => readString(stage, "id") ?? ""));
    const verdictsByStage = new Map(
      stages.map((stage) => [
        readString(stage, "id") ?? "",
        new Set(readStringArray(stage, "allowedVerdicts"))
      ])
    );

    for (const stage of stages) {
      const stageId = readString(stage, "id") ?? "<missing>";
      requireKnown(personas, stage.personaId, artifact.file, `workflow "${workflowId}" stage "${stageId}" persona`, errors);
      for (const skill of readStringArray(stage, "skills")) {
        if (!skillIds.has(skill)) {
          errors.push(`${artifact.file}: workflow "${workflowId}" stage "${stageId}" references unknown skill "${skill}"`);
        }
      }
    }
    for (const transition of readArray(value, "transitions").map(asRecord)) {
      const from = readString(transition, "from") ?? "";
      const to = readString(transition, "to");
      const verdict = readString(transition, "on") ?? "";
      if (!stageIds.has(from)) {
        errors.push(`${artifact.file}: workflow "${workflowId}" transition references unknown from stage "${from}"`);
      }
      if (to && !stageIds.has(to)) {
        errors.push(`${artifact.file}: workflow "${workflowId}" transition references unknown to stage "${to}"`);
      }
      if (!(verdictsByStage.get(from)?.has(verdict) ?? false)) {
        errors.push(`${artifact.file}: workflow "${workflowId}" transition uses undeclared verdict "${verdict}" from "${from}"`);
      }
    }
    if (readStringArray(value, "criticalCompletionVerdicts").includes("under_served")) {
      errors.push(`${artifact.file}: workflow "${workflowId}" lets under_served satisfy a critical completion gate`);
    }
    if (value.receiptRequired !== true) {
      errors.push(`${artifact.file}: workflow "${workflowId}" must require a receipt`);
    }
  }
}

function validateLoops(
  artifacts: ContractJsonFile[],
  workflows: Map<string, ContractJsonFile>,
  personas: Map<string, ContractJsonFile>,
  errors: string[]
): void {
  for (const artifact of artifacts) {
    const value = asRecord(artifact.value);
    const id = readString(value, "id") ?? "<missing>";
    const risk = readString(value, "riskCeiling") ?? "low";
    requireKnown(workflows, value.workflowId, artifact.file, `loop "${id}" workflow`, errors);
    requireKnown(personas, value.makerPersonaId, artifact.file, `loop "${id}" maker persona`, errors);
    requireKnown(personas, value.verifierPersonaId, artifact.file, `loop "${id}" verifier persona`, errors);
    if (riskRank(risk) >= riskRank("high") && value.makerPersonaId === value.verifierPersonaId) {
      errors.push(`${artifact.file}: loop "${id}" uses the same maker and verifier at high risk`);
    }
    const limits = asRecord(value.limits);
    for (const field of ["maxIterations", "maxConsecutiveNoProgress", "maxChangedFiles", "maxWallClockMinutes"]) {
      if (typeof limits[field] !== "number" || limits[field] < 1) {
        errors.push(`${artifact.file}: loop "${id}" is missing hard stop limit "${field}"`);
      }
    }
    const gates = readArray(value, "gates").map(asRecord);
    if (!gates.some((gate) => gate.objectiveVerifier === true)) {
      errors.push(`${artifact.file}: loop "${id}" has no objective verifier gate`);
    }
    const stop = asRecord(value.stop);
    if (!readString(stop, "success") || readStringArray(stop, "failure").length === 0) {
      errors.push(`${artifact.file}: loop "${id}" is missing success or failure stop rules`);
    }
    if (value.executionMode === "scheduled") {
      errors.push(`${artifact.file}: loop "${id}" enables scheduled execution in phase one`);
    }
  }
}

function validateHookPolicies(artifacts: ContractJsonFile[], errors: string[]): void {
  for (const artifact of artifacts) {
    for (const hook of readArray(asRecord(artifact.value), "hooks")) {
      const record = asRecord(hook);
      const id = readString(record, "id") ?? "<missing>";
      const command = readString(record, "command") ?? "";
      if (
        command.startsWith("/") ||
        command.includes("://") ||
        command.startsWith("..") ||
        (!command.startsWith("scripts/") && command !== "npm" && !command.startsWith("npm run "))
      ) {
        errors.push(`${artifact.file}: hook "${id}" uses an unsafe command path "${command}"`);
      }
      if (record.enabled === true && record.externalAction === true) {
        errors.push(`${artifact.file}: hook "${id}" enables an external action`);
      }
    }
  }
}

function validateSourceAuthority(artifacts: ContractJsonFile[], errors: string[]): void {
  for (const artifact of artifacts) {
    for (const source of readArray(asRecord(artifact.value), "sources")) {
      const record = asRecord(source);
      const authority = readString(record, "authority") ?? "<missing>";
      const mayOverride = readStringArray(record, "mayOverride");
      if (["reference", "learned", "generated", "transient"].includes(authority) && mayOverride.includes("canonical")) {
        errors.push(`${artifact.file}: ${authority} source "${readString(record, "path")}" may override canonical truth`);
      }
      if (authority === "reference" && record.promotionRequired !== true) {
        errors.push(`${artifact.file}: reference source "${readString(record, "path")}" must require promotion`);
      }
    }
  }
}

function validateReceipts(artifacts: ContractJsonFile[], errors: string[]): void {
  for (const artifact of artifacts) {
    const value = asRecord(artifact.value);
    if (hasSecretLikeValue(value)) {
      errors.push(`${artifact.file}: receipt contains a secret-like value`);
    }
    if (readArray(value, "verificationEvidence").length === 0) {
      errors.push(`${artifact.file}: receipt is missing verification evidence`);
    }
  }
}

function validateLearnings(artifacts: ContractJsonFile[], errors: string[]): void {
  for (const artifact of artifacts) {
    const value = asRecord(artifact.value);
    const id = readString(value, "id") ?? "<missing>";
    const authority = asRecord(value.authority);
    if (authority.level !== "advisory") {
      errors.push(`${artifact.file}: learning "${id}" must remain advisory`);
    }
    if (authority.mayOverrideContracts !== false) {
      errors.push(`${artifact.file}: learning "${id}" cannot override contracts`);
    }
  }
}

async function readSkillIds(skillsDir: string): Promise<Set<string>> {
  const entries = await readdir(skillsDir, { withFileTypes: true });
  return new Set(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name));
}
