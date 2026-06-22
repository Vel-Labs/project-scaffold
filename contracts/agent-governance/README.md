# Agent Governance Contracts

This directory is the canonical source for the scaffold's agent control-plane primitives.

The scaffold defines contracts, validation, and local-only runtime evidence helpers. It does not add a live hook adapter, scheduled automation, external connector, merge automation, release automation, or deployment automation.

## Primitive Boundaries

- Policy defines precedence, denial rules, autonomy levels, and global fail-closed behavior.
- Source authority defines which repo artifacts can override other artifacts.
- Router selects a workflow, personas, skills, autonomy ceiling, and human gates.
- Persona defines authority. It is not a writing style and it does not define procedure.
- Skill defines procedure. It never grants authority.
- Workflow defines a finite ordered set of stages and verdict transitions.
- Loop repeats an eligible workflow or stage under objective gates and hard limits.
- Hook policy defines event-time checks for adapters. Hooks are defense in depth, not the only security boundary.
- Gate evaluates evidence.
- Receipt records what happened and which evidence supports the final status.
- Learning records advisory patterns from repeated evidence and cannot override canonical contracts.

## Phase 1 Rule

When a governance reference is missing, unknown, ambiguous, or unsafe, validators fail closed.
