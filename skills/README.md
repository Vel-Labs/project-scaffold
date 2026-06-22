# Skills

This folder contains repo-local skills in the Claude-style skill layout:

```text
skills/
  skill-name/
    SKILL.md
    templates/
```

Each `SKILL.md` starts with YAML frontmatter:

```yaml
---
name: skill-name
description: When and why to use the skill.
license: Complete terms in LICENSE.txt
---
```

These skills are scaffold assets. To activate one in an agent runtime, copy or symlink the desired skill folder into that runtime's configured skills directory.

The purpose is to reduce token use by giving agents narrow, reusable instructions for common scaffold tasks.

## Default Role Skills

- `agent-assignment-writer`: scope and hand off work.
- `core-enforcement`: implement reusable contract enforcement.
- `contract-steward`: maintain canonical contracts and schemas.
- `docs-steward`: write operational docs for non-expert users.
- `copywriter`: draft user-facing copy from approved sources.
- `researcher`: gather evidence with provenance and uncertainty.
- `qa-reviewer`: create and inspect deterministic quality checks.
- `phase-closeout-audit`: close work with exact evidence.
- `project-personalize`: convert the scaffold into a real project.

Personas in `contracts/agent-governance/personas/` reference these skills. A harness may activate them differently, but the repo-local source stays portable.
