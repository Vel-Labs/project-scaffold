import type { LlmProviderContract, LlmProviderReadinessResult } from "./types.js";

const readyLifecycleStates = new Set(["accepted", "active"]);
const placeholderValues = new Set([
  "",
  "changeme",
  "change-me",
  "placeholder",
  "todo",
  "replace-me",
  "your-api-key"
]);

export function checkLlmProviderReadiness(
  contract: LlmProviderContract,
  env: Record<string, string | undefined>
): LlmProviderReadinessResult {
  const errors: string[] = [];

  if (!readyLifecycleStates.has(contract.lifecycle)) {
    errors.push(`provider contract "${contract.id}" is not accepted or active`);
  }

  if (!contract.safety.fakeFallbackRequired) {
    errors.push("fake fallback must remain available before live provider calls");
  }
  if (!contract.safety.forbidSecretLogging) {
    errors.push("secret logging must be forbidden");
  }
  if (!contract.safety.forbidAutonomousExternalActions) {
    errors.push("autonomous external actions must be forbidden");
  }

  for (const variable of contract.environmentVariables) {
    if (!variable.required) {
      continue;
    }

    const value = env[variable.name]?.trim() ?? "";
    if (!value) {
      errors.push(`missing required environment variable: ${variable.name}`);
      continue;
    }

    if (variable.secret && looksLikePlaceholder(value)) {
      errors.push(`secret environment variable is unset or placeholder-like: ${variable.name}`);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, providerId: contract.id, mode: contract.mode };
}

function looksLikePlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return placeholderValues.has(normalized) || normalized.includes("api-key-here");
}
