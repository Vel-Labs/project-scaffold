# Contract Lifecycle

Canonical project artifacts move through explicit states.

## States

```text
draft
  -> proposed
  -> accepted
  -> active
  -> deprecated
  -> retired
```

## State meaning

- `draft`: incomplete work that cannot be enforced.
- `proposed`: ready for review, not yet authoritative.
- `accepted`: approved as canonical truth, not yet required by runtime behavior.
- `active`: canonical truth that executable enforcement must honor.
- `deprecated`: still recognized, but should not be used for new work.
- `retired`: no longer valid for new work.

## Promotion rules

- `draft` may become `proposed` only when required fields and examples exist.
- `proposed` may become `accepted` only with a decision record or audit note.
- `accepted` may become `active` only after validation and focused tests pass.
- `active` may become `deprecated` only with a migration or follow-up note.
- `deprecated` may become `retired` only when downstream references have been removed or explicitly waived.

## Blocking rule

When lifecycle state is missing, unknown, or unsupported, consumers must fail closed.
