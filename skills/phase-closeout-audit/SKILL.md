---
name: phase-closeout-audit
description: Close a scaffold or project phase with exact scope, files changed, verification evidence, findings, follow-up, decisions, changelog, and roadmap/current-state updates.
license: Complete terms in LICENSE.txt
---

Phase closeout is the evidence pass that turns completed work into inspectable project truth.

## Read First

- `skills/phase-closeout-audit/templates/closeout-audit.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- `docs/roadmaps/ROADMAP.md`
- `docs/decisions/DECISIONS.md`
- `CHANGELOG.md`

## Workflow

1. Inspect changed files and scope.
2. Run the broadest responsible verification, usually `npm run check`.
3. Create or update the closeout audit note.
4. Update roadmap/current-state routing.
5. Update `docs/decisions/DECISIONS.md` if authority or architecture changed.
6. Update `CHANGELOG.md`.
7. State follow-up clearly and keep downstream work deferred unless explicitly authorized.

## Required Evidence

Record exact commands and exact results. Do not mark work done from intent alone.

## Output

Use the template in `templates/` and keep the audit factual. Findings should be tied to files, commands, or explicit missing evidence.
