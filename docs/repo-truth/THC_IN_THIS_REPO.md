# THC In This Repo

## Purpose

Map Truth, Hardening, and Clarity onto this project.

## Truth

Truth lives in explicit artifacts:

- docs
- canonical contracts or schemas in `contracts/`
- tests that consume `contracts/`
- configs
- deployed addresses
- receipts
- audit outputs
- decision records

## Hardening

Hardening lives in:

- validation
- repo-local tests under `tests/`
- audits
- fail-closed behavior
- integration checks
- adversarial review

The baseline local hardening gate is:

```bash
npm run validate:contracts
npm run test:focused
npm test
npm run typecheck
```

## Clarity

Clarity lives in:

- concise docs
- readable code
- diagrams
- setup instructions
- audit summaries
- reproducible examples

## Rule

Every major feature should answer:

1. What is true?
2. How was it hardened?
3. How can someone else inspect it?

For this repo, the default answer starts with `contracts/`, `packages/core/`, `tests/`, and the relevant audit note.
