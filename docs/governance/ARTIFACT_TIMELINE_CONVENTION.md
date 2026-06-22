# Artifact Timeline Convention

Durable artifacts may include a `## Timeline` section when visible history helps future work.

## Use It For

- decisions that evolved
- learnings with repeated evidence
- cleanup backlogs
- audit summaries
- recurring project state

## Format

```md
## Timeline

- YYYY-MM-DD - source - what changed or was learned
```

## Rules

- Keep the main body as what is true now.
- Keep `## Timeline` append-only unless correcting a factual error.
- Link to commits, receipts, audits, or source files when useful.
- Do not add timelines to every file by default. Earn them when history matters.
