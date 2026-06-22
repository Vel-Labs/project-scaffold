# Agent Operating Model

The scaffold now has a runtime-neutral agent control plane rooted in `contracts/agent-governance/`.

## Canonical Chain

```text
policy -> source authority -> router -> assignment -> persona -> skill -> workflow -> optional loop -> gate -> receipt
```

`contracts/` is canonical. `packages/core/` validates and enforces. Runtime adapters, generated context, run state, receipts, and learning notes consume these contracts but do not override them.

## Primitive Distinctions

- Router: selects the route, workflow, personas, context profile, autonomy ceiling, and human gates.
- Assignment: binds one current task to allowed paths, requested actions, expected checks, human approvals, and receipt requirements.
- Persona: defines authority, risk ceiling, approval limits, and handoff targets.
- Skill: defines a reusable procedure. A skill never grants authority.
- Workflow: defines a finite sequence of stages and allowed verdict transitions.
- Loop: repeats an eligible workflow or stage under objective gates and hard limits.
- Hook: defines event-time checks for adapters. Hooks are defense in depth.
- Gate: evaluates objective evidence.
- Receipt: records route, sources, verdicts, commands, changes, final status, and unresolved risk.
- Learning: source-backed operating guidance deferred to Phase 3; it cannot override contracts.

## Effective Authority

Effective permission is the intersection of policy, persona, assignment, runtime capability, and risk profile. Any denial wins. Unknown authority fails closed.

## Phase 1 Boundary

The current scaffold adds contracts, schemas, fixtures, validation, tests, and documentation for governance, assignment, context-profile, and receipt-policy boundaries. It does not enable scheduled execution, live hooks, generated context packs, receipt writing, merge/release/deploy automation, external writes, or learning distillation.
