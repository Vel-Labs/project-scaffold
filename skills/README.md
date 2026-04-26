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
