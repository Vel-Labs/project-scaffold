# Runtime Evidence

Runtime evidence is the inspectable proof around an agent run. Phase 2 defines the contracts and validation boundaries but does not write runtime artifacts.

## Context Profiles

Context profiles declare which source paths belong in a bounded task context and which paths must be denied.

The default profile is `contracts/agent-governance/context-profiles/scoped-change.json`.

Required controls:

- source paths carry authority class
- sensitive patterns are denied
- generated output is non-canonical
- context output is under `.agent-context/`
- source hashes and git revision are required for stale detection

## Receipt Policy

Receipt policy declares where run receipts may live and what privacy controls apply.

The default policy is `contracts/agent-governance/receipt-policy.json`.

Required controls:

- transient receipts belong under `.agent-runs/`
- promoted receipts belong under `docs/audits/`
- secrets, full transcripts, and environment dumps are forbidden
- promotion requires human review and an audit reason

## Deferred Runtime Work

This scaffold does not yet generate context packs or write receipts. Later scripts must consume these contracts rather than creating their own policy.
