---
name: project-personalize
description: Convert the scaffold into a real project by running the initializer, replacing placeholders, updating project contracts, and preserving contract/core/test governance boundaries.
license: Complete terms in LICENSE.txt
---

Project personalization turns this template into a project-specific repo without losing the governance, contract, core, test, and audit baseline.

## Read First

- `REPO_PROFILE.json`
- `docs/project/TEMPLATE_USAGE.md`
- `docs/agents/START_HERE.md`
- `skills/project-personalize/templates/personalization-checklist.md`

## Workflow

1. Run `npm run init:template:dry-run` to preview changes.
2. Run `npm run init:template` with project-specific values.
3. Replace remaining project-specific placeholders intentionally.
4. Update `contracts/` with the first project-specific canonical contract.
5. Keep reusable enforcement in `packages/core/`.
6. Run `npm run check`.
7. Update `DECISIONS.md`, `CHANGELOG.md`, and audit evidence if authority changed.

## Boundaries

Do not add adapters, demos, providers, deployment, or UI during personalization unless the human explicitly expands scope.

## Output

Use the checklist in `templates/` to make the personalization pass auditable.
