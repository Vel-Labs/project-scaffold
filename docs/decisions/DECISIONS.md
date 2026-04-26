# DECISIONS

Use this file to record durable architectural decisions.

## 2026-04-26: Template contract/core stability baseline

- Status: Accepted
- Context: Future humans and agents copying this scaffold need an unambiguous source of project truth, one reusable enforcement boundary, and a local quality gate that does not scatter tests throughout the project folder.
- Decision: Top-level `contracts/` owns canonical lifecycle, schemas, examples, and fail-closed rules. `packages/core/` is the only reusable implementation boundary and must consume `contracts/`. `tests/` owns the shared local quality gate and must read contract truth from disk.
- Consequences: This repo remains a template, not a product implementation. Adapters, demos, provider integrations, browser surfaces, product features, and deployment workflows are downstream in copied projects. Contract changes must update examples, validation, docs routing, audit evidence, `docs/decisions/DECISIONS.md` when architectural, and `CHANGELOG.md`.

## 2026-04-26: Repo profile as scaffold taxonomy

- Status: Accepted
- Context: Agents need a compact machine-readable index for paths, commands, locked governance areas, downstream scope, and read-first routing.
- Decision: `REPO_PROFILE.json` is the authoritative taxonomy and command index for this scaffold. Root docs remain where they are for GitHub and agent discoverability, while detailed operational material lives under `docs/`.
- Consequences: Any path, command, quality-gate, or taxonomy change should update `REPO_PROFILE.json` and `docs/FILE_TREE.md`.

## 2026-04-26: Root skills folder

- Status: Accepted
- Context: Skills are more discoverable and compatible with common agent skill layouts when they live at root under `skills/<skill-name>/SKILL.md`.
- Decision: Repo-local skills live under root `skills/`, use YAML frontmatter with `name`, `description`, and `license`, and may include per-skill `templates/` folders.
- Consequences: `REPO_PROFILE.json`, `docs/FILE_TREE.md`, and scaffold validation must treat root `skills/` as the canonical skill location.

## 2026-04-26: Clean root documentation layout

- Status: Accepted
- Context: The scaffold should copy into future projects with a clean root and without loose documentation files accumulating at the top level.
- Decision: Keep root limited to agent/project entrypoints, conventional GitHub-facing files, package/config files, and major directories. Move architecture, repo boundaries, roadmap, decisions, and AI usage docs under `docs/`.
- Consequences: `REPO_PROFILE.json` is the root taxonomy for finding those docs, and `npm run validate:scaffold` enforces the allowed root entries.

## YYYY-MM-DD: `<Decision title>`

- Status: Proposed | Accepted | Rejected | Superseded
- Context:
- Decision:
- Consequences:
