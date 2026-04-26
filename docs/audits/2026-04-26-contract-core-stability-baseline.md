# Contract/Core Stability Baseline Audit

Date: 2026-04-26

## Scope

Establish a clean template baseline that separates:

- `contracts/`: canonical project truth
- `packages/core/`: executable enforcement
- `tests/`: shared local quality gate
- `docs/`: current-state, decisions, audit, and handoff routing

Adapters, demos, provider integrations, auth, deployment, UI work, and product-specific features are explicitly downstream for copied projects.

## Files Changed

- `.gitignore`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/ISSUE_TEMPLATE/scaffold_change.yml`
- `.github/pull_request_template.md`
- `.github/workflows/quality-gate.yml`
- `AGENTS.md`
- `package.json`
- `tsconfig.json`
- `vitest.config.ts`
- `REPO_PROFILE.json`
- `template.vars.json`
- `contracts/README.md`
- `contracts/lifecycle.md`
- `contracts/fail-closed-rules.md`
- `contracts/schemas/project-capability.schema.json`
- `contracts/schemas/repo-profile.schema.json`
- `contracts/examples/valid/core-capability.json`
- `contracts/examples/invalid/missing-authority.json`
- `packages/core/README.md`
- `packages/core/src/index.ts`
- `packages/core/src/read-json-files.ts`
- `packages/core/src/types.ts`
- `packages/core/src/validate-contracts.ts`
- `scripts/validate-contracts.ts`
- `scripts/init-template.ts`
- `scripts/validate-scaffold.ts`
- `tests/README.md`
- `tests/contracts/contract-corpus.test.ts`
- `tests/core/core-boundary.test.ts`
- `README.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/README.md`
- `docs/architecture/REPO_BOUNDARIES.md`
- `docs/decisions/README.md`
- `docs/decisions/2026-04-26.md`
- `docs/governance/AI_USAGE.md`
- `ROADMAP.md`
- `docs/roadmaps/README.md`
- `docs/README.md`
- `docs/agents/START_HERE.md`
- `docs/project/TEMPLATE_USAGE.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- `docs/governance/code-quality-standards.md`
- `docs/governance/AI_USAGE.md`
- `docs/governance/README.md`
- `docs/governance/multi-agent-workflow.md`
- `docs/governance/worktree-governance.md`
- `docs/repo-truth/THC_IN_THIS_REPO.md`
- `docs/templates/CLOSEOUT_AUDIT_TEMPLATE.md`
- `docs/templates/FRESH_AGENT_HANDOFF_TEMPLATE.md`
- `docs/templates/REPO_PERSONALIZATION_CHECKLIST.md`
- `skills/README.md`
- `skills/agent-assignment-writer/SKILL.md`
- `skills/agent-assignment-writer/templates/agent-assignment.md`
- `skills/agent-assignment-writer/templates/fresh-agent-handoff.md`
- `skills/contract-steward/SKILL.md`
- `skills/core-enforcement/SKILL.md`
- `skills/phase-closeout-audit/SKILL.md`
- `skills/phase-closeout-audit/templates/closeout-audit.md`
- `skills/project-personalize/SKILL.md`
- `skills/project-personalize/templates/personalization-checklist.md`
- `DECISIONS.md`
- `CHANGELOG.md`

## Commands Run

```bash
npm install
npm run install:local
npm run init:template:dry-run
npm run validate:scaffold
npm run validate:contracts
npm run test:focused
npm test
npm run typecheck
npm run check
```

## Exact Results

- `npm install`: passed, added 61 packages.
- `npm run install:local`: passed, ran `npm install`.
- `npm run init:template:dry-run`: passed, reported 14 file(s) would change.
- `npm run validate:scaffold`: passed, including clean-root policy, required paths, profile commands, forbidden downstream roots, skill frontmatter, file tree, and placeholder registration checks.
- `npm run validate:contracts`: passed, `2 schema(s), 1 valid example(s), 1 invalid example(s)`.
- `npm run test:focused`: passed, 2 test files, 3 tests.
- `npm test`: passed, 2 test files, 3 tests.
- `npm run typecheck`: passed, `tsc --noEmit`.
- `npm run check`: passed after adding scaffold validation to the gate, contract validation, focused tests, all tests, and typecheck.

## Follow-Up

Next implementation step after copying this scaffold into a real project: replace the generic contract example with the project's first canonical contract and expand `packages/core/` to enforce it.

Do not start adapters, demos, provider integrations, or product features until the copied project's quality gate remains stable.

## Decision

Accepted for this template baseline: top-level `contracts/` owns canonical truth, `packages/core/` owns reusable enforcement, and `tests/` owns the repo-local quality gate.

Clean-root follow-up accepted: architecture, repo boundaries, roadmap, decisions, and AI usage docs live under `docs/`; root stays limited by `REPO_PROFILE.json` and `npm run validate:scaffold`.
