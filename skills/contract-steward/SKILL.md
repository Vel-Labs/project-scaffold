---
name: contract-steward
description: Add or update canonical contracts, schemas, lifecycle rules, examples, and fail-closed validation without duplicating truth in tests or implementation packages.
license: Complete terms in LICENSE.txt
---

Contract stewardship keeps canonical project truth in `contracts/` and prevents drift into tests, docs, or implementation packages.

## Read First

- `REPO_PROFILE.json`
- `contracts/README.md`
- `contracts/lifecycle.md`
- `contracts/fail-closed-rules.md`
- `packages/core/README.md`
- `tests/README.md`

## Workflow

1. Identify the canonical truth change and decide whether it belongs in lifecycle docs, fail-closed rules, schemas, examples, or all of them.
2. Update `contracts/` first.
3. Add valid and invalid examples when behavior or shape changes.
4. Update `packages/core/` only as an enforcement consumer.
5. Add or update centralized tests under `tests/`.
6. Run `npm run validate:contracts`, `npm run test:focused`, and `npm run check` when practical.
7. Update docs, decisions, changelog, and audit evidence when contract meaning changes.

## Stop Conditions

Stop before changing governance doctrine, widening downstream implementation scope, or redefining canonical truth outside `contracts/`.

## Contract Law

When `contracts/`, `packages/core/`, and tests disagree, `contracts/` wins. The implementation and tests must be corrected to consume canonical truth.
