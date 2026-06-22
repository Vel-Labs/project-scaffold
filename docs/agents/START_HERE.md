# Agent Start Here

Use this file as the first operational read for a fresh agent session.

## Objective

This repository is a reusable scaffold template. The job is to keep it clean, copyable, and immediately useful for future project setup.

## Read First

1. `AGENTS.md`
2. `REPO_PROFILE.json`
3. `CLI_INDEX.md`
4. `SKILLS_INDEX.md`
5. `docs/project/TEMPLATE_USAGE.md`
6. `contracts/README.md`
7. `contracts/agent-governance/README.md`
8. `docs/governance/AGENT_OPERATING_MODEL.md`
9. `docs/agents/ROLE_CATALOG.md`
10. `docs/agents/CONTEXT_ROUTING.md`
11. `docs/governance/ASSIGNMENT_ENGINEERING.md`
12. `docs/governance/RUNTIME_EVIDENCE.md`
13. `docs/agents/ROUTING.md`
14. `docs/architecture/ARCHITECTURE.md`
15. `docs/architecture/REPO_BOUNDARIES.md`
16. `packages/core/README.md`
17. `tests/README.md`
18. `ROADMAP.md`
19. `DECISIONS.md`
20. `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`

## Default Commands

```bash
npm run install:local
npm run validate:scaffold
npm run validate:contracts
npm run validate:agents
npm run validate:assignment
npm run scaffold:memory-check
npm run test:focused
npm run test:governance
npm run test:security
npm test
npm run typecheck
npm run check
```

## Governance-Locked Areas

These areas define operating law and should not be changed without explicit human authorization:

- `AGENTS.md`
- `REPO_PROFILE.json`
- `docs/governance/`
- `docs/repo-truth/`
- `docs/architecture/REPO_BOUNDARIES.md`
- `DECISIONS.md`

## Allowed Template Work

- Improve scaffold clarity.
- Improve copy-forward project initialization.
- Improve contract/core/test baseline validation.
- Improve docs, templates, audits, and handoff routing.
- Add repo-local skills under `skills/`.

## Stop Conditions

Stop and ask before:

- changing governance doctrine
- moving governance-locked or architecture-locked files
- adding product-specific features
- adding adapters, demos, provider integrations, deployment workflows, or UI surfaces
- weakening fail-closed behavior
- removing validation or audit requirements

## Required Closeout

Every meaningful scaffold change should update:

- `REPO_PROFILE.json` when paths, commands, or taxonomy change
- `SKILLS_INDEX.md` when repo-local skills are added, removed, or renamed
- `docs/FILE_TREE.md`
- `DECISIONS.md` when authority or architecture changes
- `docs/decisions/YYYY-MM-DD.md` when detailed decision entries are needed
- `CHANGELOG.md`
- an audit note when verification evidence matters
