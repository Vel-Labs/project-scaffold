# Docs Index

## Directory structure

```text
docs/
  README.md
  agents/
  architecture/
  decisions/
  project/
    TEMPLATE_USAGE.md
  repo-truth/
  governance/
  hackathon/
  roadmaps/
  templates/
  audits/
```

Root-level implementation and quality directories:

```text
contracts/      canonical project truth
packages/core/  reusable executable enforcement
tests/          shared local quality gate
skills/         repo-local skills with SKILL.md and optional templates
REPO_PROFILE.json machine-readable taxonomy and command index
CLI_INDEX.md   human-readable command reference
```

## Reading paths

### New contributor

1. `../README.md`
2. `../AGENTS.md`
3. `../REPO_PROFILE.json`
4. `../CLI_INDEX.md`
5. `agents/START_HERE.md`
6. `project/TEMPLATE_USAGE.md`
7. `../contracts/README.md`
8. `governance/AGENT_OPERATING_MODEL.md`
9. `agents/ROLE_CATALOG.md`
10. `agents/CONTEXT_ROUTING.md`
11. `governance/ASSIGNMENT_ENGINEERING.md`
12. `governance/RUNTIME_EVIDENCE.md`
13. `agents/ROUTING.md`
14. `../packages/core/README.md`
15. `../tests/README.md`
16. `architecture/ARCHITECTURE.md`
17. `architecture/REPO_BOUNDARIES.md`
18. `architecture/COMPATIBILITY.md`
19. `../ROADMAP.md`
20. `../DECISIONS.md`
21. `roadmaps/CURRENT_STATE_AND_NEXT.md`
22. `repo-truth/THC_METHODOLOGY.md`
23. `governance/code-quality-standards.md`
24. `roadmaps/README.md`

### Baseline verification

```bash
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
```

### Hackathon project

1. `project/PROJECT_BRIEF.md`
2. `hackathon/README.md`
3. `hackathon/rules.md`
4. `hackathon/vendor-tracks.md`
5. `hackathon/submission-checklist.md`
