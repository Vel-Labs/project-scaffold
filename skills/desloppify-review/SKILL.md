---
name: desloppify-review
description: Use when a project needs a cleanup, maintainability, code quality, UX, security, or architecture rough-edge review before selecting fixes
license: Complete terms in LICENSE.txt
---

# Desloppify Review

Use this skill to create a cleanup backlog, not to fix items immediately.

## Read First

- `REPO_PROFILE.json`
- `docs/agents/ROLE_CATALOG.md`
- `skills/desloppify-review/templates/DESLOPPIFY.md`
- task-specific docs named in the assignment

## Scan For

Rushed implementation, duplication, inconsistent naming, fragile assumptions, missing errors, UI/UX rough edges, security or validation gaps, dead code, confusing architecture, and maintainability pain.

## Output Rules

1. Do not change implementation files during the scan.
2. Create or update `DESLOPPIFY.md`.
3. Organize findings as Critical, Medium, and Nice-to-have.
4. For each item include location, why it matters, recommendation, and whether to fix now or wait.
5. Display the backlog and ask the user to select the next task.
6. After a selected task is completed, display the remaining backlog again.

## Quality Bar

Prefer concrete file-backed findings over broad taste comments. Mark uncertainty instead of guessing.
