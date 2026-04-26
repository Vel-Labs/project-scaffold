# Fail-Closed Rules

These rules define baseline safety behavior for this scaffold.

## Required blocks

Validation or promotion must fail when:

- a contract file references an unknown schema
- an artifact has an unknown lifecycle state
- a required schema field is missing
- an example in `contracts/examples/valid/` fails validation
- an example in `contracts/examples/invalid/` passes validation
- an implementation package redefines canonical contract truth instead of consuming `contracts/`
- tests require hidden local state outside the repo
- adapters, demos, or provider integrations are introduced before the core boundary is stable

## Required warnings

Audits should call out:

- docs that describe behavior without validation evidence
- tests that duplicate contract shapes inline
- large files that should be split before more behavior is added
- downstream work that depends on contract changes not yet accepted

## Downstream boundary

Adapters, demos, provider integrations, browser surfaces, and deployment workflows are downstream of this baseline. They may be planned, but they must not be implemented until contract validation and core enforcement are stable.
