# LLM Provider Contract

LLM integrations must start as local contracts before any provider adapter is implemented.

This scaffold does not ship live provider code. It ships the structure a copied project needs to add a provider quickly without hiding credentials, bypassing validation, or letting generated text become canonical truth.

## Required Shape

Every provider contract should define:

- `schema`: `llm-provider`
- `id`: stable kebab-case provider contract id
- `lifecycle`: explicit contract lifecycle state
- `provider`: human-readable provider name
- `mode`: compatibility mode such as `anthropic-compatible`, `openai-compatible`, `local`, or `fake`
- `ownedBy`: implementation boundary that will own the adapter
- `authority`: canonical contract source and implementation boundary
- `environmentVariables`: declared environment keys, with secret keys marked
- `modelDefaults`: model id plus output and optional context budgets
- `safety`: fail-closed rules for fake fallback, secret logging, and external actions
- `manualGates`: actions that require explicit human approval

## Boundary

Contracts may name providers and endpoints. They must not contain real API keys, personal account values, browser session details, or machine-specific credential paths.

Adapters are downstream. A copied project may add provider code after contract validation and local tests pass.

## Readiness Rule

A provider is not ready for live use unless:

- the provider contract validates
- required environment variables are present in the runtime environment
- secret environment values are non-empty and do not look like placeholders
- fake or dry-run fallback remains available
- generated artifacts have a deterministic local record to attach to
- external actions such as sending email, applying to jobs, publishing, or charging money remain manually gated
