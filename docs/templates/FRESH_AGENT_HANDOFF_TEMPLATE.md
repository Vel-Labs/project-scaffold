# Fresh Agent Handoff Template

Use this when starting a new agent session.

```md
Repository:
- `<absolute repo path>`

Objective:
- `<specific objective>`

Read first:
- `AGENTS.md`
- `REPO_PROFILE.json`
- `docs/agents/START_HERE.md`
- `<task-specific docs>`

Scope:
- Allowed files:
  -
- Do not touch:
  -

Known state:
- Current branch:
- Current roadmap/current-state pointer:
- Relevant audit evidence:

Commands:
- `npm run validate:scaffold`
- `npm run validate:contracts`
- `npm run test:focused`
- `npm test`
- `npm run typecheck`
- `npm run check`

Closeout requirements:
- Summarize files changed.
- Record exact commands and results.
- Update `DECISIONS.md` if authority or architecture changed.
- Add or update `docs/decisions/YYYY-MM-DD.md` for detailed decision entries.
- Update `CHANGELOG.md`.
- Update audit evidence when verification matters.
```
