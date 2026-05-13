# CHANGELOG

All notable repo changes should be logged here.

## 2026-05-12

- Added an LLM provider contract/readiness baseline with MiniMax M2.7 example, provider schema, core readiness helper, tests, and integration docs.

## 2026-05-07

- Updated `AGENTS.md` with scaffold stewardship, generated-repo `AGENTS.md` baseline, and context/output-discipline guidance for future coding repos.

## YYYY-MM-DD

- Added initial governance scaffold.

## 2026-04-26

- Added `contracts/` as the canonical truth layer with lifecycle, fail-closed rules, schema, and valid/invalid examples.
- Added `packages/core/` as the reusable enforcement boundary for contract validation.
- Added repo-local commands for install, contract validation, focused tests, all tests, typecheck, and full checks.
- Added centralized `tests/` quality gate that consumes `contracts/` directly.
- Updated README, architecture, boundaries, roadmap/current-state, governance docs, decisions, changelog, and audit evidence routing.
- Clarified that this repository is a reusable template scaffold and that project-specific features start only after copying it into a real project.
- Added `REPO_PROFILE.json`, template initialization, scaffold validation, agent start guide, repo-local skill templates, handoff templates, and GitHub quality-gate hygiene.
- Moved repo skills to root `skills/`, converted them to frontmatter-based `SKILL.md` format, and added per-skill templates where useful.
- Moved architecture, boundaries, roadmap, decisions, and AI usage docs under `docs/`, and made scaffold validation enforce the clean root policy from `REPO_PROFILE.json`.
