# Current State and Next

## Current state

This scaffold template now has a contract/core stability baseline:

- `contracts/` owns canonical lifecycle, schema, examples, and fail-closed rules.
- `packages/core/` is the only reusable implementation boundary.
- `tests/` is the shared local quality gate and reads from `contracts/`.
- `REPO_PROFILE.json` owns the machine-readable repo taxonomy and command index.
- `contracts/schemas/llm-provider.schema.json` and `packages/core/src/llm-provider-readiness.ts` provide the baseline LLM provider contract/readiness layer without adding live adapter code.
- `contracts/agent-governance/`, `contracts/schemas/agent-*.schema.json`, `packages/core/src/validate-governance.ts`, `scripts/agent/validate-governance.ts`, and `scripts/agent/validate-assignment.ts` provide agent governance, assignment, context-profile, receipt-policy, hook, loop, and learning validation.
- `scripts/agent/generate-assignment.ts` creates task-type-aware, route-aligned local assignments from the canonical router and assignment template.
- `docs/agents/ROLE_CATALOG.md`, role-specific personas, and repo-local skills route code, docs, test, content, research, and quality-review work to the right agent behavior for non-expert users.
- `skills/desloppify-review/` creates `DESLOPPIFY.md` cleanup backlogs without starting fixes until the user selects a task.
- `scripts/agent/run-init.ts`, `scripts/agent/build-context-pack.ts`, `scripts/agent/check-context.ts`, `scripts/agent/receipt.ts`, and `scripts/agent/write-receipt.ts` provide local-only runtime evidence helpers that write ignored `.agent-context/` and `.agent-runs/` artifacts.
- `scripts/agent/preflight.ts`, `scripts/agent/stop-verify.ts`, and `scripts/agent/run-loop.ts` provide opt-in local checks and a manual-only bounded loop runner.
- `docs/governance/LEARNINGS.md` and `contracts/agent-governance/learnings/` provide advisory learning distillation without overriding canonical contracts.
- `docs/agents/START_HERE.md` and root `skills/` reduce fresh-agent orientation cost.
- `.github/` provides minimal issue, PR, and CI quality-gate hygiene.
- `docs/audits/2026-04-26-contract-core-stability-baseline.md` records closeout evidence.

## Immediate next action

Run the full scaffold check after each structural change, then keep local runtime artifacts ignored unless a receipt is explicitly promoted. After copying into a real project, use `docs/agents/ROLE_CATALOG.md` and `docs/project/NEW_PROJECT_CHECKLIST.md`, customize governance contracts, and initialize the first scoped run with `agent:run-init`.

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
npm run scaffold:adoption-check
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
- live agent hooks, scheduled loops, merge/release/deploy automation, and external-write connectors
