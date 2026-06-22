# Decisions

This file is the high-signal decision index. Detailed decision entries live in dated files under `docs/decisions/`.

Use decisions for durable architecture, product, governance, source-of-truth, and scope-boundary choices. Routine implementation notes belong in `CHANGELOG.md`, audits, or handoff notes.

## Current Decision Summary

- `contracts/` is the canonical authority layer for lifecycle, schemas, examples, and fail-closed rules.
- `packages/core/` is the only reusable enforcement boundary in the template baseline.
- `tests/` is the shared local quality gate and must consume `contracts/` instead of redefining truth.
- `REPO_PROFILE.json` is the machine-readable taxonomy, command index, read-first map, and clean-root policy source.
- LLM integrations start with provider contracts, environment-key declarations, fake fallback, readiness checks, and manual gates before live adapters.
- Agent governance starts as contract-first policy, source authority, router, assignment, context profile, persona, workflow, loop, hook-policy, receipt schema, and receipt-policy validation before any runtime automation.
- Root `skills/` is the canonical repo-local skills location.
- Root stays intentionally clean: root files are entrypoints, high-visibility indexes, conventional project files, package/config files, and major directories.
- Root `ROADMAP.md` and `DECISIONS.md` are indexes; detailed roadmap and decision truth lives under `docs/`.
- Adapters, demos, provider integrations, deployment workflows, UI/operator surfaces, and product-specific features are downstream for copied projects.

## Latest Accepted Decisions

- 2026-04-26: Template contract/core stability baseline. See `docs/decisions/2026-04-26.md`.
- 2026-04-26: Repo profile as scaffold taxonomy. See `docs/decisions/2026-04-26.md`.
- 2026-04-26: Root skills folder. See `docs/decisions/2026-04-26.md`.
- 2026-04-26: Clean root documentation layout. See `docs/decisions/2026-04-26.md`.
- 2026-04-26: Roadmap and decisions index/detail split. See `docs/decisions/2026-04-26.md`.
- 2026-05-12: LLM provider contract/readiness baseline. See `docs/decisions/2026-05-12.md`.
- 2026-06-22: Agent governance foundation. See `docs/decisions/2026-06-22.md`.

## Decision Logs

- `docs/decisions/2026-04-26.md`
- `docs/decisions/2026-05-12.md`
- `docs/decisions/2026-06-22.md`

## Active Unresolved Decision Questions

- None.

## Rules

- Never duplicate full decision entries between this index and dated files.
- Root `DECISIONS.md` summarizes and links; dated files hold details.
- During fast hackathon work, use daily decision files.
- During slower long-lived projects, monthly or topic-based files may be acceptable after an explicit decision.
