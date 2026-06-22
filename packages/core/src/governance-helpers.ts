import type { ContractJsonFile } from "./types.js";

export const knownGovernanceSchemas = new Set([
  "agent-policy",
  "agent-capability",
  "agent-persona",
  "agent-router",
  "agent-assignment",
  "agent-context-profile",
  "agent-workflow",
  "agent-loop",
  "agent-hook-policy",
  "agent-source-authority",
  "agent-receipt",
  "agent-receipt-policy",
  "agent-learning"
]);

export const lifecycleStates = new Set([
  "draft",
  "proposed",
  "accepted",
  "active",
  "deprecated",
  "retired"
]);

export const deniedPhaseOneActions = new Set([
  "merge",
  "release",
  "deploy",
  "external-write",
  "secret-access"
]);

const riskOrder = ["low", "medium", "high", "critical"];

export function idMap(
  artifacts: ContractJsonFile[],
  errors: string[],
  label: string
): Map<string, ContractJsonFile> {
  const map = new Map<string, ContractJsonFile>();
  for (const artifact of artifacts) {
    const id = readString(artifact.value, "id");
    if (!id) {
      errors.push(`${artifact.file}: ${label} is missing id`);
      continue;
    }
    map.set(id, artifact);
  }
  return map;
}

export function requireKnown(
  map: Map<string, ContractJsonFile>,
  value: unknown,
  file: string,
  label: string,
  errors: string[]
): void {
  const id = typeof value === "string" ? value : "<missing>";
  if (!map.has(id)) {
    errors.push(`${file}: ${label} references unknown id "${id}"`);
  }
}

export function countArrayItems(artifacts: ContractJsonFile[], field: string): number {
  return artifacts.reduce((total, artifact) => total + readArray(asRecord(artifact.value), field).length, 0);
}

export function riskRank(risk: string | undefined): number {
  return risk ? riskOrder.indexOf(risk) : -1;
}

export function autonomyRank(level: string | undefined): number {
  return level ? ["A0", "A1", "A2", "A3", "A4"].indexOf(level) : -1;
}

export function hasUnsafePathPattern(pathValue: string): boolean {
  return (
    pathValue.startsWith("/") ||
    pathValue.startsWith("..") ||
    pathValue.includes("../") ||
    pathValue.includes("\\")
  );
}

export function readString(value: unknown, key: string): string | undefined {
  const record = asRecord(value);
  return typeof record[key] === "string" ? record[key] : undefined;
}

export function readStringArray(value: Record<string, unknown>, key: string): string[] {
  return readArray(value, key).filter((item): item is string => typeof item === "string");
}

export function readArray(value: Record<string, unknown>, key: string): unknown[] {
  return Array.isArray(value[key]) ? value[key] : [];
}

export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

export function hasSecretLikeValue(value: unknown): boolean {
  if (typeof value === "string") {
    return /(sk-[A-Za-z0-9_-]{8,}|api[_-]?key|secret|password|token)/i.test(value);
  }
  if (Array.isArray(value)) {
    return value.some(hasSecretLikeValue);
  }
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return Object.entries(value).some(([key, item]) => {
    if (/(api[_-]?key|secret|password|token)/i.test(key)) {
      return true;
    }
    return hasSecretLikeValue(item);
  });
}

export function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
