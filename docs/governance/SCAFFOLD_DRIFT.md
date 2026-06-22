# Scaffold Drift

Scaffold drift is when repo memory no longer matches the real project.

## Drift Signals

- `REPO_PROFILE.json` points to missing files.
- Markdown links point to missing local files.
- Docs mention npm scripts that do not exist.
- Agent routes exist in contracts but are missing from `docs/agents/ROUTING.md`.
- Personas or routes reference missing skills.
- Governance docs keep unresolved placeholder task markers.

## Local Check

```bash
npm run scaffold:memory-check
```

This check is deterministic and does not call an AI model.

## Sync Rule

Fix drift surgically. Update the stale file or route; do not rewrite the entire scaffold.

If a new recurring task pattern appears, capture it as a skill only after it repeats or clearly applies across projects.
