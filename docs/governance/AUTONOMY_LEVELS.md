# Autonomy Levels

Autonomy is an upper bound, not a grant. The active policy, persona, assignment, runtime capability, and risk profile still intersect to determine effective authority.

| Level | Meaning |
| --- | --- |
| A0 | Advice only. No repo reads required. |
| A1 | Read, inspect, plan, and report. |
| A2 | Scoped local writes and deterministic local verification. |
| A3 | Branch or pull-request actions through approved connectors and human gates. |
| A4 | Deployments or external business actions through explicit policy and human approval. |

The scaffold default route for scoped local changes is capped at A2. Phase 1 does not implement A3 or A4 execution.

## Denials

- Secret access is denied by default.
- External writes require human approval.
- Merge, release, and deploy actions are not enabled by Phase 1.
- Model self-scoring is advisory only.
