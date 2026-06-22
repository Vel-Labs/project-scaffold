# Tests

`tests/` is the shared local quality gate for humans and agents.

Tests should stay centralized here unless a future package has a strong reason to own package-private fixtures. Contract tests must read from `contracts/` instead of redefining canonical truth.

## Commands

```bash
npm run validate:contracts
npm run validate:agents
npm run validate:assignment
npm run test:focused
npm run test:governance
npm run test:security
npm test
npm run typecheck
npm run check
```

## Scope

- `tests/contracts/`: contract corpus validation.
- `tests/core/`: executable enforcement behavior from `packages/core/`.
- `tests/governance/`: agent-governance references, assignments, context profiles, authority composition, workflows, loops, sources, and receipts.
- `tests/security/`: self-approval, hook safety, secret boundaries, maker/verifier separation, and critical-gate denial.

Adapters, demos, provider integrations, and browser surfaces are intentionally out of scope for this baseline.
