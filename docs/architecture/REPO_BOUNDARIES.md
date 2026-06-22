# Repository Boundaries

## What this repo owns

- machine-readable scaffold taxonomy in `REPO_PROFILE.json`
- canonical project contracts in `contracts/`
- runtime-neutral agent governance contracts in `contracts/agent-governance/`
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
- live LLM SDK or HTTP adapter code

Integrations are downstream of this baseline. Do not add adapter or provider code until `contracts/`, `packages/core/`, and `tests/` are stable.

The scaffold may include LLM provider schemas, examples, and readiness helpers so copied projects can add providers quickly. It must not include real credentials or live provider calls.

The scaffold may include agent-governance schemas, contracts, assignments, context profiles, receipt policy, fixtures, and validators. It must not include live hook adapters, unattended loop runners, external-write connectors, merge/release/deploy automation, context-pack generation, receipt writing, or generated run state in this layer.

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
