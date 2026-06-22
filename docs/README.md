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
```

## Reading paths

### New contributor

1. `../README.md`
2. `../AGENTS.md`
3. `../REPO_PROFILE.json`
4. `agents/START_HERE.md`
5. `project/TEMPLATE_USAGE.md`
6. `../contracts/README.md`
7. `governance/AGENT_OPERATING_MODEL.md`
8. `agents/ROLE_CATALOG.md`
9. `governance/ASSIGNMENT_ENGINEERING.md`
10. `governance/RUNTIME_EVIDENCE.md`
11. `agents/ROUTING.md`
12. `../packages/core/README.md`
13. `../tests/README.md`
14. `architecture/ARCHITECTURE.md`
15. `architecture/REPO_BOUNDARIES.md`
16. `../ROADMAP.md`
17. `../DECISIONS.md`
18. `roadmaps/CURRENT_STATE_AND_NEXT.md`
19. `repo-truth/THC_METHODOLOGY.md`
20. `governance/code-quality-standards.md`
21. `roadmaps/README.md`

### Baseline verification

```bash
npm run validate:scaffold
npm run validate:contracts
npm run validate:agents
npm run validate:assignment
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
