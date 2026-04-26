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
6. Put reusable enforcement in `packages/core/`.
7. Keep the shared local quality gate in `tests/`.
8. Fill in `docs/hackathon/` if the project is a hackathon build.
9. Assign work through `AGENTS.md` and `docs/governance/worktree-governance.md`.
10. Keep `docs/decisions/DECISIONS.md`, `CHANGELOG.md`, and audit docs current.

## Local quality gate

```bash
npm run install:local
npm run init:template
npm run validate:scaffold
npm run validate:contracts
npm run test:focused
npm test
npm run typecheck
npm run check
```

`contracts/` is the canonical source of truth. `packages/core/` is the only reusable implementation boundary in this baseline. `tests/` is the shared local gate and must consume `contracts/` directly instead of redefining contract truth.

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
