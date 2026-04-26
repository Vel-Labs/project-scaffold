# Repository Boundaries

## What this repo owns

- `<OWNED_BOUNDARY>`
- docs and governance
- core contracts or schemas
- reusable modules
- examples
- tests and audit artifacts

## What integrations own

- external API calls
- vendor-specific behavior
- authentication mechanics
- raw diagnostics

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
