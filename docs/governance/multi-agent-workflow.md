# Multi-Agent Workflow

`<PROJECT_NAME>` is expected to be built with human contributors and AI coding agents working in parallel. Coordination must be explicit.

## Coordination model

Use one operator-owned main branch and separate worktrees for parallel workstreams.

```text
main
  <project>-core
  <project>-ens
  <project>-zerog
  <project>-keeperhub
  <project>-signer
  <project>-docs
```

Each workstream should have one owner at a time.

## Agent assignment format

Before an agent starts, give it a scoped assignment:

```md
Workstream: feature-03-ens-agent-identity
Branch/worktree: <project>-ens
Goal: implement <IDENTITY_INTEGRATION> identity resolver scaffold and fixtures
Allowed files:
- packages/ens-identity/**
- docs/roadmaps/features/feature-03-ens-agent-identity.md
- docs/architecture/ens-identity.md
Do not touch:
- packages/core/** except exported interface request notes
- packages/keeperhub-adapter/**
Dependencies:
- policy schema from feature-01
Verification:
- npm run validate:contracts
- npm run test:focused
- npm test
- npm run typecheck
- docs audit note
```

## Wave model

Use waves instead of all-at-once parallel chaos.

### Wave 1: Foundation

- `contracts/` lifecycle, schemas, examples, and fail-closed rules
- `packages/core/` executable enforcement
- `tests/` shared local quality gate
- docs, decisions, changelog, and audit updates

### Wave 2: Adapters

- <IDENTITY_INTEGRATION>
- <DATA_OR_COMPUTE_INTEGRATION>
- signer
- <EXECUTION_INTEGRATION>

Do not start Wave 2 until Wave 1 passes:

```bash
npm run check
```

### Wave 3: Example agent

- planner
- critic
- executor
- demo console

### Wave 4: Submission hardening

- README
- demo video script
- eligibility docs
- feedback docs
- audit closeout

## Merge rules

- Merge foundation before dependent adapters.
- Merge adapters before example-agent wiring.
- Resolve docs drift before final demo recording.
- Do not merge two branches that independently changed the same interface without a human review.

## Agent summary requirement

Every agent session should end with:

- files changed
- what now works
- what remains broken or unverified
- commands run
- decisions needed
- dependencies created for other agents
