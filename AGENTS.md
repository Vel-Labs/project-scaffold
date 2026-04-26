# AGENTS

This file defines how humans and coding agents should operate in this repository.

## Mission

Build `<PROJECT_NAME>` in a way that is clear, auditable, readable, and safe to extend.

## Priority order

1. Preserve user or operator safety.
2. Preserve architectural clarity.
3. Preserve auditability.
4. Keep integrations behind explicit boundaries.
5. Prefer small, testable layers.
6. Keep documentation tied to reality.

## Required reading before structural changes

- `README.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/REPO_BOUNDARIES.md`
- `docs/roadmaps/ROADMAP.md`
- `docs/README.md`
- `docs/repo-truth/THC_METHODOLOGY.md`
- `docs/repo-truth/THC_IN_THIS_REPO.md`
- `docs/governance/multi-agent-workflow.md`
- `docs/governance/worktree-governance.md`
- `docs/governance/code-quality-standards.md`

## Working rules

- Keep changes scoped.
- Do not hard-code values that should come from config, contracts, schemas, or source-of-truth records.
- Do not claim a feature works without evidence.
- Keep large files below 350 lines where practical.
- Files above 500 lines require extraction or written justification.
- Comments should feel human and explain why a boundary exists.
- Update docs when behavior changes.
- Record architectural decisions in `docs/decisions/DECISIONS.md`.
- Record notable changes in `CHANGELOG.md`.

## Multi-agent development rules

Use separate worktrees for parallel coding agents. No two agents should own the same files unless coordinated by a human.

Each agent must declare:

- workstream
- files it expects to touch
- files it must not touch
- dependencies
- validation plan
- docs to update

## Definition of done

A change is not done unless:

- behavior is documented
- tests or deterministic checks exist where practical
- relevant risks are noted
- changelog is updated
- decisions are recorded when architecture changes
- no unrelated files are staged
