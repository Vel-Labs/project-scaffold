# Compatibility

This scaffold is copied into other repositories, so its public surface should stay clear.

## Stable Surfaces

- root `AGENTS.md`
- `REPO_PROFILE.json`
- `contracts/`
- `contracts/agent-governance/`
- `packages/core/src/index.ts` exports
- package scripts listed in `REPO_PROFILE.json`
- repo-local skills under `skills/*/SKILL.md`
- docs named in `REPO_PROFILE.json.readFirst`

## Internal Surfaces

- individual helper modules under `packages/core/src/` that are not exported from `index.ts`
- ignored runtime artifacts under `.agent-context/` and `.agent-runs/`
- generated receipts before promotion
- test fixtures that exist only to prove validation behavior

## Breaking Changes

Treat these as breaking for copied projects:

- removing or renaming a package script in `REPO_PROFILE.json`
- removing a schema or changing required fields
- changing `packages/core/src/index.ts` exports
- changing generated repo `AGENTS.md` expectations
- moving canonical governance docs without updating `REPO_PROFILE.json`

## Extension Rule

Downstream projects may add project-specific folders after adoption. The scaffold should not prebuild app, adapter, provider, deployment, or UI folders before a copied project earns them.
