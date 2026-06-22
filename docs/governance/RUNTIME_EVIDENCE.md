# Runtime Evidence

Runtime evidence is the inspectable proof around an agent run. The scaffold writes local-only run artifacts so agents can prove what context, assignment, checks, and receipts supported a change.

## Context Profiles

Context profiles declare which source paths belong in a bounded task context and which paths must be denied.

The default profile is `contracts/agent-governance/context-profiles/scoped-change.json`.

Required controls:

- source paths carry authority class
- sensitive patterns are denied
- generated output is non-canonical
- context output is under `.agent-context/`
- context packs have max inline-byte and max file-count limits
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

## Local Helpers

```bash
npm run agent:run-init -- --summary "One scoped local change"
npm run agent:build-context
npm run agent:check-context -- .agent-runs/<run-id>/manifest.json
npm run agent:receipt -- --draft --manifest .agent-runs/<run-id>/manifest.json
npm run agent:write-receipt -- path/to/receipt.json
npm run agent:receipt -- --input path/to/receipt.json --promote --audit-reason "reviewed audit evidence"
npm run agent:run-loop -- --manifest .agent-runs/<run-id>/manifest.json --verify-command "npm run test:focused"
```

These helpers are local-only. They do not call external services, merge, release, deploy, or schedule work. Hooks remain opt-in and disabled by default.

`agent:run-init` writes:

- `.agent-runs/<run-id>/assignment.json`
- `.agent-runs/<run-id>/assignment.md`
- `.agent-runs/<run-id>/context-pack.json`
- `.agent-runs/<run-id>/manifest.json`

The manifest links assignment, context pack, route, branch, git revision, and source hashes. `agent:check-context` compares that manifest with current repository state and fails if the evidence is stale.

`agent:receipt --draft` creates a schema-valid draft from the run manifest and current git state. Promotion to `docs/audits/` requires an explicit audit reason and writes a small promotion sidecar next to the promoted receipt.

Generated files are ignored:

- `.agent-context/`
- `.agent-runs/`
