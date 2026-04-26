# Contracts

`contracts/` is the canonical project truth layer.

Anything that defines project meaning, lifecycle state, schema shape, example shape, or fail-closed behavior belongs here before implementation packages consume it.

## Contents

- `lifecycle.md`: lifecycle states and allowed movement.
- `fail-closed-rules.md`: conditions that must block promotion or execution.
- `schemas/`: JSON Schemas for canonical project artifacts.
- `examples/valid/`: examples that must pass contract validation.
- `examples/invalid/`: examples that must fail contract validation.

## Ownership

- Contracts may be read by tests, `packages/core/`, docs, future adapters, and future demos.
- Tests must consume these files directly instead of redefining schemas or examples.
- `packages/core/` may enforce contracts, but it must not become the source of truth.
- Adapters, demos, and provider integrations are downstream and out of scope for this baseline.

## Change rule

Any contract change must update:

- relevant valid and invalid examples
- contract validation tests
- current-state or roadmap routing
- `docs/decisions/DECISIONS.md` when the change affects architecture or authority
- `CHANGELOG.md`
