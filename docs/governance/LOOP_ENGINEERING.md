# Loop Engineering

A loop is not repeated prompting. A loop repeats an eligible workflow or stage toward objective gates under hard limits.

## Required Controls

Every loop contract requires:

- objective success gates
- compact-state intent
- iteration, no-progress, changed-file, and wall-clock limits
- success and failure stop rules
- maker/verifier separation when risk requires it
- a receipt requirement

The first loop, `change-hardening`, is accepted as a manual contract only. It does not create a runner, schedule, state directory, or adapter.

## Promotion

Scheduling is deferred. A loop can only move toward scheduled execution after accepted manual evidence, owner assignment, deterministic gates, safe failure behavior, and explicit human approval for external effects.
