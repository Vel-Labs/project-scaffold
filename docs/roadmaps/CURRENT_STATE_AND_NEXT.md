# Current State and Next

## Current state

This scaffold template now has a contract/core stability baseline:

- `contracts/` owns canonical lifecycle, schema, examples, and fail-closed rules.
- `packages/core/` is the only reusable implementation boundary.
- `tests/` is the shared local quality gate and reads from `contracts/`.
- `REPO_PROFILE.json` owns the machine-readable repo taxonomy and command index.
- `contracts/schemas/llm-provider.schema.json` and `packages/core/src/llm-provider-readiness.ts` provide the baseline LLM provider contract/readiness layer without adding live adapter code.
- `contracts/agent-governance/`, `contracts/schemas/agent-*.schema.json`, `packages/core/src/validate-governance.ts`, `scripts/agent/validate-governance.ts`, and `scripts/agent/validate-assignment.ts` provide agent governance, assignment, context-profile, and receipt-policy validation without adding runtime automation.
- `scripts/agent/build-context-pack.ts` and `scripts/agent/write-receipt.ts` provide local-only runtime evidence helpers that write ignored `.agent-context/` and `.agent-runs/` artifacts.
- `docs/agents/START_HERE.md` and root `skills/` reduce fresh-agent orientation cost.
- `.github/` provides minimal issue, PR, and CI quality-gate hygiene.
- `docs/audits/2026-04-26-contract-core-stability-baseline.md` records closeout evidence.

## Immediate next action

Run the full agent governance and assignment validation path, then keep those contracts as the boundary for scoped local changes. After copying into a real project, replace or extend the generic contract examples with the project's first canonical domain contract. If the project needs an LLM, customize the provider contract and pass readiness checks before adding live adapter code.

## Recommended parallelization

- Contract steward: customize `contracts/` schemas/examples for the copied project.
- Core steward: extend `packages/core/` enforcement helpers against accepted project contracts.
- LLM steward: customize provider contract, environment declarations, fake fallback, and manual gates before any live provider calls.
- Agent governance steward: keep policy, source authority, router, assignments, context profiles, personas, workflow, loop, hook policy, receipt schema, receipt policy, fixtures, and validator tests aligned.
- Audit steward: keep `tests/`, `DECISIONS.md`, `docs/decisions/YYYY-MM-DD.md`, `CHANGELOG.md`, roadmap routing, and audit evidence synchronized.

## Validation before advancing

```bash
npm run validate:scaffold
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

## Do not start yet

- adapters
- demos
- provider integrations
- browser/operator surfaces
- deployment workflows
- live agent hooks, scheduled loops, generated context packs, receipt writers, learning distillers, merge/release/deploy automation, and external-write connectors
