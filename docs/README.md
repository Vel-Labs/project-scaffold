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
  architecture/
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
7. `../packages/core/README.md`
8. `../tests/README.md`
9. `architecture/ARCHITECTURE.md`
10. `architecture/REPO_BOUNDARIES.md`
11. `repo-truth/THC_METHODOLOGY.md`
12. `governance/code-quality-standards.md`
13. `roadmaps/README.md`

### Baseline verification

```bash
npm run validate:contracts
npm run test:focused
npm test
npm run typecheck
```

### Hackathon project

1. `project/PROJECT_BRIEF.md`
2. `hackathon/README.md`
3. `hackathon/rules.md`
4. `hackathon/vendor-tracks.md`
5. `hackathon/submission-checklist.md`
