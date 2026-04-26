# Audit Philosophy

Audits are part of the operating model, not cleanup.

`<PROJECT_NAME>` handles agent authority. A passing unit test is not enough if the repo still hides unclear signing behavior, unbounded execution, or unverifiable policy claims.

## Audit goals

### Architectural honesty

The repo must not claim maturity it does not have.

Examples:

- A signer adapter is not full Clear Signing.
- An <IDENTITY_INTEGRATION> display name is not <IDENTITY_INTEGRATION>-based identity.
- A local JSON file is not <DATA_OR_COMPUTE_INTEGRATION>-backed policy memory.
- A <EXECUTION_INTEGRATION> placeholder is not execution integration.
- A stretch standard interface is not a working implementation.

### Determinism

The same intent, policy, signer, nonce, and execution fixture should produce the same verification result.

### Contract coherence

Intent fields, policy hashes, signer addresses, <IDENTITY_INTEGRATION> nodes, executor addresses, and artifact URIs must mean the same thing everywhere.

### Authority preservation

Agent confidence cannot bypass policy, signature, nonce, deadline, or executor checks.

### Contributor trust

A new contributor should be able to inspect a run and understand what happened, why it was allowed, and where the evidence lives.

## Audit cadence

Use the default phase cadence:

- `.5` midpoint audit
- `.9` closeout audit

For security-sensitive changes, add boundary audits:

- signer audit
- execution audit
- identity audit
- policy audit
- demo honesty audit

## Audit outputs

A useful audit should produce:

- findings
- evidence inspected
- commands run
- validation results
- unresolved gaps
- explicit pass/block decision

Use `docs/templates/PHASE_AUDIT_TEMPLATE.md`.
