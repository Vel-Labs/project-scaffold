import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkLlmProviderReadiness,
  validateContractCorpus,
  type LlmProviderContract
} from "../../packages/core/src/index.js";

describe("core enforcement boundary", () => {
  it("returns a fail-closed result when the canonical contract root is missing", async () => {
    const result = await validateContractCorpus(
      path.resolve(process.cwd(), "contracts-does-not-exist")
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]).toContain("failed to read contract corpus");
    }
  });

  it("exposes reusable contract validation without redefining contract truth", async () => {
    const result = await validateContractCorpus(path.resolve(process.cwd(), "contracts"));

    expect(result.ok).toBe(true);
  });

  it("fails closed when a provider contract is not ready for live calls", () => {
    const result = checkLlmProviderReadiness(makeProviderContract({ lifecycle: "proposed" }), {
      LLM_PROVIDER: "minimax",
      MINIMAX_API_KEY: "your-api-key",
      MINIMAX_BASE_URL: "https://api.minimax.io/anthropic",
      MINIMAX_MODEL: "MiniMax-M2.7"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('provider contract "minimax-m2-7" is not accepted or active');
      expect(result.errors).toContain(
        "secret environment variable is unset or placeholder-like: MINIMAX_API_KEY"
      );
    }
  });

  it("reports ready when required provider environment is present", () => {
    const result = checkLlmProviderReadiness(makeProviderContract({ lifecycle: "accepted" }), {
      LLM_PROVIDER: "minimax",
      MINIMAX_API_KEY: "local-test-secret",
      MINIMAX_BASE_URL: "https://api.minimax.io/anthropic",
      MINIMAX_MODEL: "MiniMax-M2.7"
    });

    expect(result).toEqual({
      ok: true,
      providerId: "minimax-m2-7",
      mode: "anthropic-compatible"
    });
  });
});

function makeProviderContract(
  overrides: Partial<LlmProviderContract> = {}
): LlmProviderContract {
  return {
    schema: "llm-provider",
    id: "minimax-m2-7",
    lifecycle: "accepted",
    provider: "MiniMax",
    mode: "anthropic-compatible",
    ownedBy: "packages/core/",
    authority: {
      canonicalSource: "contracts/",
      implementationBoundary: "packages/core/"
    },
    environmentVariables: [
      {
        name: "LLM_PROVIDER",
        required: true,
        secret: false,
        purpose: "Selects the active provider adapter."
      },
      {
        name: "MINIMAX_API_KEY",
        required: true,
        secret: true,
        purpose: "Authenticates requests to MiniMax."
      },
      {
        name: "MINIMAX_BASE_URL",
        required: true,
        secret: false,
        purpose: "Declares the provider endpoint root."
      },
      {
        name: "MINIMAX_MODEL",
        required: true,
        secret: false,
        purpose: "Declares the model id sent to the provider."
      }
    ],
    modelDefaults: {
      model: "MiniMax-M2.7",
      maxOutputTokens: 4000,
      contextWindowTokens: 204800
    },
    safety: {
      fakeFallbackRequired: true,
      forbidSecretLogging: true,
      forbidAutonomousExternalActions: true
    },
    manualGates: [
      "Sending email requires explicit human approval.",
      "Submitting applications requires explicit human approval."
    ],
    ...overrides
  };
}
