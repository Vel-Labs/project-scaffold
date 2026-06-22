# Agent Governance Foundation Audit

Date: 2026-06-22

## Working Implementation Plan

Current checkout:

- Branch: `main`
- Remote tracking: `origin/main`
- Starting commit: `6c734fcad87880cacaee6059a6b797d4be0f7226`
- Starting dirty state: only untracked audit input at `gpt-pro-audit/`
- External writes: none authorized

Audit-pack assumption:

- Audit input was found at `./gpt-pro-audit/`.
- `gpt-pro-audit/11_GPT_PRO_AUDIT_OUTPUT_TEMPLATE.md` is still `NOT YET RUN`.
- No independent GPT Pro findings were available; this implementation follows the packet defaults and repository truth.

Expected files to change:

- `contracts/agent-governance/**`
- `contracts/schemas/agent-*.schema.json`
- `contracts/examples/valid/agent-*.json`
- `contracts/examples/invalid/agent-*.json`
- `packages/core/src/read-json-files.ts`
- `packages/core/src/governance-helpers.ts`
- `packages/core/src/governance-runtime-validators.ts`
- `packages/core/src/validate-contracts.ts`
- `packages/core/src/validate-governance.ts`
- `packages/core/src/index.ts`
- `packages/core/src/types.ts`
- `scripts/agent/validate-governance.ts`
- `scripts/agent/validate-assignment.ts`
- `scripts/validate-scaffold.ts`
- `tests/governance/**`
- `tests/security/**`
- `tests/contracts/contract-corpus.test.ts`
- `package.json`
- `REPO_PROFILE.json`
- `AGENTS.md`
- `README.md`
- `docs/README.md`
- `docs/agents/ROUTING.md`
- `docs/governance/*.md`
- `.github/pull_request_template.md`
- `DECISIONS.md`
- `docs/decisions/2026-06-22.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- `docs/FILE_TREE.md`

Explicitly out of scope:

- any external repository
- `.agent-runs/`
- `.agent-context/`
- loop runner
- context-pack generator
- receipt writer
- live hook adapter
- learning distiller
- scheduled automation
- merge, release, deploy, connector, or other external-write automation

Contract and schema strategy:

- Keep `contracts/` canonical.
- Add strict JSON Schema 2020-12 files for policy, source authority, router, capability, persona, workflow, loop, hook policy, and receipt.
- Derive schema selection from schema `$id` instead of scattering a hard-coded schema map.
- Validate canonical governance contracts as a referenced set in `packages/core`.
- Keep semantic invariants in reusable core validation where JSON Schema cannot inspect cross-file references.

Test strategy:

- Extend the existing contract corpus test.
- Add `tests/governance` for schema/reference, route authority, workflow transitions, loop limits, source precedence, and receipt evidence.
- Add `tests/security` for self-approval, unsafe hooks, high-risk maker/verifier separation, receipt secret boundaries, and `under_served` critical-gate denial.
- Add `validate:agents`, `test:governance`, and `test:security` scripts.

Documentation and audit updates:

- Add governance docs for the operating model, autonomy, workflow engineering, loop engineering, security, and source authority.
- Add agent routing docs.
- Update entrypoints, profile commands, PR checklist, decisions, changelog, roadmap, and file tree.

Risks:

- The audit packet is a local untracked input and should not become committed scaffold source.
- GPT Pro findings were unavailable, so this slice may need later adjustment after independent review.
- Phase 1 reserves hooks, loops, receipts, and learning as contracts only; runtime execution is deferred.

## Audit Evidence

Commands run from `/Users/steven/Workspace/40_Code/packages/project-scaffold`:

- `npm run validate:agents`: passed; 15 artifacts, 1 route, 1 assignment, 1 context profile, 1 workflow, 1 loop, 1 hook, 1 receipt policy.
- `npm run validate:assignment`: passed for the default scoped-change assignment.
- `npm run validate:contracts`: passed; 15 schemas, 14 valid examples, 20 invalid examples.
- `npm run test:governance`: passed; 2 files, 12 tests.
- `npm run test:security`: passed; 1 file, 7 tests.
- `npm run test:focused`: passed; 5 files, 24 tests.
- `npm run validate:scaffold`: passed.
- `npm test`: passed; 5 files, 24 tests.
- `npm run typecheck`: passed.
- `npm run check`: passed; includes scaffold validation, contract validation, agent validation, focused tests, governance tests, security tests, all tests, and typecheck.

## Security Invariants Covered

- Unknown governance schema and unknown workflow, persona, or skill references fail closed.
- Persona self-approval at medium/high risk is denied.
- Route authority escalation to deploy is denied in Phase 1.
- Workflow transitions must use declared stage verdicts.
- `under_served` cannot satisfy critical completion gates.
- Loops require hard stop limits and objective verifier gates.
- High-risk loops require maker/verifier separation.
- Hook policy rejects absolute or external command paths and external hook actions.
- Reference-only sources cannot override canonical truth.
- Receipts cannot contain secret-like values and must include verification evidence.

## Audit Result

Pass for Phase 1 local implementation. Runtime automation, generated context, receipt writing, learning distillation, scheduled execution, and external actions remain deferred.

## Assignment And Runtime Evidence Update

Follow-on local layer:

- Added `agent-assignment`, `agent-context-profile`, and `agent-receipt-policy` schemas.
- Added canonical `contracts/agent-governance/assignments/scoped-change.json`.
- Added canonical `contracts/agent-governance/context-profiles/scoped-change.json`.
- Added canonical `contracts/agent-governance/receipt-policy.json`.
- Added `scripts/agent/validate-assignment.ts`.
- Added fixtures and tests for assignment escalation, unsafe assignment paths, transient context sources, missing sensitive deny patterns, and unsafe receipt policy storage/privacy.

Runtime generation and writing are still deferred. `.agent-context/` and `.agent-runs/` are named as policy-controlled transient destinations only; this change does not create them.
