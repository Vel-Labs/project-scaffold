# LLM Provider Integration

This scaffold includes the contract and readiness layer for fast LLM adoption. It does not include a live provider adapter.

## Adoption Flow

1. Add or customize a provider contract under `contracts/examples/valid/`.
2. Validate the contract with `npm run validate:contracts`.
3. Add the copied project's adapter behind the implementation boundary named by the contract.
4. Check runtime readiness before making live calls.
5. Keep fake or dry-run behavior available for tests and demos.

## Contract First

Use `contracts/schemas/llm-provider.schema.json` for provider shape and `contracts/llm-provider-contract.md` for policy.

The contract should name environment variables and model defaults, but it must not contain real secrets. Real credentials belong in local environment files or a credential manager that is outside committed source.

## Readiness Helper

`packages/core/` exports `checkLlmProviderReadiness(contract, env)`.

The helper checks:

- lifecycle is usable for runtime readiness
- required environment variables are present
- secret values are not empty placeholders
- fake fallback is still required
- secret logging and autonomous external actions remain blocked

Provider-specific HTTP clients, SDKs, streaming, prompt caching, and artifact persistence are downstream implementation work for the copied project.

## MiniMax M2.7 Starting Point

The included MiniMax example uses an Anthropic-compatible mode:

```text
LLM_PROVIDER=minimax
MINIMAX_API_KEY=local secret value
MINIMAX_BASE_URL=https://api.minimax.io/anthropic
MINIMAX_MODEL=MiniMax-M2.7
```

Keep output budgets explicit. A model context window is not the same as the maximum generated tokens for an artifact.

## Manual Gates

Generated text may prepare work, but external actions remain gated by the owning project. Examples include sending email, submitting applications, publishing content, creating paid resources, or operating logged-in browser sessions.
