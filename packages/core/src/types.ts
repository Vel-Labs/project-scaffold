export type ContractValidationFailure = {
  ok: false;
  errors: string[];
};

export type ContractValidationSuccess = {
  ok: true;
  checked: {
    schemas: number;
    validExamples: number;
    invalidExamples: number;
  };
};

export type ContractValidationResult =
  | ContractValidationFailure
  | ContractValidationSuccess;

export type ContractJsonFile = {
  file: string;
  value: unknown;
};

export type LlmProviderMode =
  | "fake"
  | "anthropic-compatible"
  | "openai-compatible"
  | "local";

export type LlmProviderContract = {
  schema: "llm-provider";
  id: string;
  lifecycle: string;
  provider: string;
  mode: LlmProviderMode;
  ownedBy: string;
  authority: {
    canonicalSource: "contracts/";
    implementationBoundary: string;
  };
  environmentVariables: Array<{
    name: string;
    required: boolean;
    secret: boolean;
    purpose: string;
  }>;
  modelDefaults: {
    model: string;
    maxOutputTokens: number;
    contextWindowTokens?: number;
  };
  safety: {
    fakeFallbackRequired: boolean;
    forbidSecretLogging: boolean;
    forbidAutonomousExternalActions: boolean;
  };
  manualGates: string[];
};

export type LlmProviderReadinessFailure = {
  ok: false;
  errors: string[];
};

export type LlmProviderReadinessSuccess = {
  ok: true;
  providerId: string;
  mode: LlmProviderMode;
};

export type LlmProviderReadinessResult =
  | LlmProviderReadinessFailure
  | LlmProviderReadinessSuccess;
