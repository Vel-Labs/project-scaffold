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
npm run scaffold:memory-check -- --json
```

This check is deterministic and does not call an AI model.

It reports a drift score out of 100. Errors subtract 10 points, warnings subtract 3 points, and info items subtract 1 point.

Current checks include:

- missing read-first paths
- broken local markdown links
- referenced npm scripts that do not exist
- package scripts missing from `CLI_INDEX.md`
- routes missing from `docs/agents/ROUTING.md`
- governance-referenced skills missing from `skills/`
- scaffold files stale by git history
- dependency install claims that disagree with `package.json`

## Sync Rule

Fix drift surgically. Update the stale file or route; do not rewrite the entire scaffold.

If a new recurring task pattern appears, capture it as a skill only after it repeats or clearly applies across projects.

Use this command for a targeted prompt:

```bash
npm run scaffold:sync-plan
```

`sync-plan` only prints a prompt. It does not launch Codex, call another agent, or edit files.
