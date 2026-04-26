# Current State and Next

## Current state

This scaffold template now has a contract/core stability baseline:

- `contracts/` owns canonical lifecycle, schema, examples, and fail-closed rules.
- `packages/core/` is the only reusable implementation boundary.
- `tests/` is the shared local quality gate and reads from `contracts/`.
- `REPO_PROFILE.json` owns the machine-readable repo taxonomy and command index.
- `docs/agents/START_HERE.md` and root `skills/` reduce fresh-agent orientation cost.
- `.github/` provides minimal issue, PR, and CI quality-gate hygiene.
- `docs/audits/2026-04-26-contract-core-stability-baseline.md` records closeout evidence.

## Immediate next action

After copying into a real project, replace the generic contract example with the project's first canonical contract and expand `packages/core/` to enforce it.

## Recommended parallelization

- Contract steward: customize `contracts/` schemas/examples for the copied project.
- Core steward: extend `packages/core/` enforcement helpers against accepted project contracts.
- Audit steward: keep `tests/`, `DECISIONS.md`, `docs/decisions/YYYY-MM-DD.md`, `CHANGELOG.md`, roadmap routing, and audit evidence synchronized.

## Validation before advancing

```bash
npm run validate:scaffold
npm run validate:contracts
npm run test:focused
npm test
npm run typecheck
npm run check
```

## Do not start yet

- adapters
- demos
- provider integrations
- browser/operator surfaces
- deployment workflows
