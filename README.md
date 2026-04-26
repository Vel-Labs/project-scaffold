# Project Governance Scaffold

This is a reusable documentation and governance scaffold for fast-moving open-source projects, hackathons, and AI-assisted builds.

It is based on the Truth, Hardening, Clarity methodology and is designed to make a repo clear, orderly, auditable, and safe for parallel human plus coding-agent work.

## How to use

1. Copy this folder into a new repo.
2. Replace placeholder project names.
3. Fill in `docs/project/PROJECT_BRIEF.md`.
4. Fill in `docs/hackathon/` if the project is a hackathon build.
5. Assign work through `AGENTS.md` and `docs/governance/worktree-governance.md`.
6. Keep `DECISIONS.md`, `CHANGELOG.md`, and audit docs current.

## Repository map

```text
AGENTS.md
ARCHITECTURE.md
ROADMAP.md
DECISIONS.md
CHANGELOG.md
CONTRIBUTING.md
AI_USAGE.md
.claude/
docs/
  README.md
  project/
  repo-truth/
  governance/
  hackathon/
  architecture/
  roadmaps/
  templates/
  audits/
```

## Principle

Do not rely on hidden trust. Make system truth explicit, harden it, and turn it into clarity that other people can inspect.
