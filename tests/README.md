# Tests

`tests/` is the shared local quality gate for humans and agents.

Tests should stay centralized here unless a future package has a strong reason to own package-private fixtures. Contract tests must read from `contracts/` instead of redefining canonical truth.

## Commands

```bash
npm run validate:contracts
npm run test:focused
npm test
npm run typecheck
npm run check
```

## Scope

- `tests/contracts/`: contract corpus validation.
- `tests/core/`: executable enforcement behavior from `packages/core/`.

Adapters, demos, provider integrations, and browser surfaces are intentionally out of scope for this baseline.
