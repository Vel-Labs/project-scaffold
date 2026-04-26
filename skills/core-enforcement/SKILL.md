---
name: core-enforcement
description: Implement reusable enforcement logic in packages/core against canonical contracts while keeping adapters, demos, providers, UI, and schema ownership out of core.
license: Complete terms in LICENSE.txt
---

Core enforcement is the executable layer that consumes canonical truth and makes it usable by future project code.

## Read First

- `REPO_PROFILE.json`
- `contracts/README.md`
- `packages/core/README.md`
- `tests/README.md`

## Workflow

1. Confirm the canonical contract already exists in `contracts/`.
2. Implement only reusable enforcement in `packages/core/`.
3. Keep modules small and extracted before they become broad orchestrators.
4. Return structured fail-closed results where practical.
5. Add focused tests in `tests/core/`.
6. Run `npm run test:focused`, `npm run typecheck`, and `npm run check`.

## Boundaries

`packages/core/` must not own adapters, demos, provider integrations, deployment, UI, or canonical schema definitions.

## Design Bias

Prefer small modules, explicit result types, deterministic file reads, and clear errors over clever abstractions. Core should be boring, inspectable, and easy for future packages to consume.
