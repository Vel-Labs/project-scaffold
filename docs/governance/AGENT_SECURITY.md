# Agent Security

Agent governance is fail-closed.

## Enforced Invariants

- Unknown policy, schema, persona, route, workflow, stage, skill, loop, hook, gate, or lifecycle state fails closed.
- Denial overrides permission.
- A maker cannot approve its own medium or high risk work.
- Routes select authority but do not grant authority beyond policy or persona.
- Workflows must declare finite verdict transitions.
- `under_served` cannot pass critical completion gates.
- Loops require objective verifier gates and hard stops.
- High-risk loops require maker/verifier separation.
- Hook commands must be repo-local and must not enable external actions.
- Reference, generated, transient, and learned material cannot override canonical contracts.
- Receipts must be compact, secret-safe, and evidence-backed.

## Deferred Security Work

Phase 1 does not add live hook adapters, context-pack generation, receipt writing, connector permissions, scheduled runs, or network-dependent scanners.
