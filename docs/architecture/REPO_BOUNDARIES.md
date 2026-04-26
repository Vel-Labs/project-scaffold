# Repository Boundaries

## What this repo owns

- machine-readable scaffold taxonomy in `REPO_PROFILE.json`
- canonical project contracts in `contracts/`
- docs and governance
- core contracts or schemas
- reusable enforcement modules in `packages/core/`
- contract examples under `contracts/examples/`
- shared local tests and audit artifacts

## What integrations own

- external API calls
- vendor-specific behavior
- authentication mechanics
- raw diagnostics

Integrations are downstream of this baseline. Do not add adapter or provider code until `contracts/`, `packages/core/`, and `tests/` are stable.

## What user-facing surfaces own

- presentation
- user requests
- derived views

## What user-facing surfaces do not own

- canonical truth
- private authority
- hidden execution state

## Fold-in rule

Old or external code may be copied only when it lands behind a clear boundary.

Do not recreate an old monolith inside the new repo.

The first implementation boundary is `packages/core/`. New reusable behavior must either fit there cleanly or wait for an explicit decision.

## Governance lock

Governance doctrine, architecture layering, code-quality limits, fail-closed rules, and root taxonomy are not casual edit surfaces. Change them only with explicit human authorization and record the decision.
