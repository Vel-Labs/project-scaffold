# Core Package

`packages/core/` is the only reusable implementation boundary in this baseline.

Its job is to enforce canonical truth from `contracts/`. It does not own product features, adapters, demos, provider integrations, auth, deployment, or presentation.

## Owns

- contract schema loading
- contract example validation
- agent-governance reference and invariant validation
- assignment, context-profile, and receipt-policy boundary validation
- fail-closed result shapes
- reusable validation helpers for future packages

## Does not own

- canonical schema definitions
- provider-specific behavior
- demo workflows
- external service adapters
- project feature implementations

## Rule

When `packages/core/` and `contracts/` disagree, `contracts/` wins and core must be updated.

Agent governance validation belongs here only as reusable enforcement. The canonical policy, router, assignments, context profiles, personas, workflows, loops, hooks, source authority, receipt schema, and receipt policy remain under `contracts/`.
