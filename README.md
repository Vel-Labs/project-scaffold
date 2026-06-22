# Project Governance Scaffold Template

This is a reusable documentation and governance scaffold for fast-moving open-source projects, hackathons, and AI-assisted builds.

It is based on the Truth, Hardening, Clarity methodology and is designed to make a repo clear, orderly, auditable, and safe for parallel human plus coding-agent work.

This folder is meant to be copied into future projects. It is not a product implementation repo.

## How to use

1. Copy this folder into a new repo.
2. Replace placeholder project names.
3. Fill in `docs/project/PROJECT_BRIEF.md`.
4. Read `docs/project/TEMPLATE_USAGE.md`.
5. Define canonical project truth in `contracts/` before implementation.
6. For agent-governed work, start from `contracts/agent-governance/`, `docs/governance/AGENT_OPERATING_MODEL.md`, and `docs/agents/ROUTING.md`.
7. For LLM-backed projects, start from `docs/integrations/LLM_PROVIDER_INTEGRATION.md`.
8. Put reusable enforcement in `packages/core/`.
9. Keep the shared local quality gate in `tests/`.
10. Fill in `docs/hackathon/` if the project is a hackathon build.
11. Assign work through `AGENTS.md` and `docs/governance/worktree-governance.md`.
12. Keep `DECISIONS.md`, `CHANGELOG.md`, and audit docs current.

## Local quality gate

```bash
npm run install:local
npm run init:template
npm run validate:scaffold
npm run validate:contracts
npm run validate:agents
npm run validate:assignment
npm run test:focused
npm run test:governance
npm run test:security
npm test
npm run typecheck
npm run check
```

`contracts/` is the canonical source of truth. `packages/core/` is the reusable implementation boundary. `tests/` is the shared local gate and must consume `contracts/` directly instead of redefining contract truth.

Agent governance starts as contract-to-validation layers. The scaffold defines policy, source authority, router, assignment, context profile, capability, personas, workflow, loop, hook policy, receipt schema, receipt policy, fixtures, core validation, tests, and docs. It does not enable scheduled execution, live hooks, receipt writing, context-pack generation, merge/release/deploy automation, or external writes.

Runtime evidence helpers are local-only and contract-driven:

```bash
npm run agent:assign -- --id my-task --summary "One scoped local change"
npm run agent:build-context
npm run agent:write-receipt -- path/to/receipt.json
```

They write ignored artifacts under `.agent-context/` and `.agent-runs/`.

`REPO_PROFILE.json` is the machine-readable repo taxonomy and command index for humans and agents.

## Repository map

```text
AGENTS.md
CHANGELOG.md
CONTRIBUTING.md
REPO_PROFILE.json
.claude/
.github/
docs/
  README.md
  agents/
  architecture/
    ARCHITECTURE.md
    REPO_BOUNDARIES.md
  decisions/
    DECISIONS.md
  project/
    TEMPLATE_USAGE.md
  repo-truth/
  governance/
    AI_USAGE.md
  hackathon/
  roadmaps/
    ROADMAP.md
  templates/
  audits/
contracts/
  README.md
  lifecycle.md
  fail-closed-rules.md
  schemas/
  examples/
  agent-governance/
packages/
  core/
scripts/
skills/
tests/
  README.md
  contracts/
  core/
```

## Principle

Do not rely on hidden trust. Make system truth explicit, harden it, and turn it into clarity that other people can inspect.

Adapters, demos, and provider integrations are downstream of this baseline and should not start until contract validation and core enforcement remain stable.

LLM provider work starts with contracts, environment-key declarations, readiness checks, fake fallback, and manual gates. Live provider adapters belong to copied projects after those checks are in place.
