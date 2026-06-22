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
SKILLS_INDEX.md human-readable repo-local skill reference
```

## Reading paths

### New contributor

1. `../README.md`
2. `../AGENTS.md`
3. `../REPO_PROFILE.json`
4. `../CLI_INDEX.md`
5. `../SKILLS_INDEX.md`
6. `agents/START_HERE.md`
7. `project/TEMPLATE_USAGE.md`
8. `../contracts/README.md`
9. `governance/AGENT_OPERATING_MODEL.md`
10. `agents/ROLE_CATALOG.md`
11. `agents/CONTEXT_ROUTING.md`
12. `governance/ASSIGNMENT_ENGINEERING.md`
13. `governance/RUNTIME_EVIDENCE.md`
14. `agents/ROUTING.md`
15. `../packages/core/README.md`
16. `../tests/README.md`
17. `architecture/ARCHITECTURE.md`
18. `architecture/REPO_BOUNDARIES.md`
19. `architecture/COMPATIBILITY.md`
20. `../ROADMAP.md`
21. `../DECISIONS.md`
22. `roadmaps/CURRENT_STATE_AND_NEXT.md`
23. `repo-truth/THC_METHODOLOGY.md`
24. `governance/code-quality-standards.md`
25. `roadmaps/README.md`

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
