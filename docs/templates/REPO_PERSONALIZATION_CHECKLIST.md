# Repo Personalization Checklist

Use this after copying the scaffold into a real project.

## Project Identity

- [ ] Run `npm run init:template`.
- [ ] Confirm `package.json` name.
- [ ] Confirm README title and project description.
- [ ] Fill `docs/project/PROJECT_BRIEF.md`.
- [ ] Replace project goal and thesis placeholders.

## Contract Baseline

- [ ] Replace the generic example contract with the first project-specific contract.
- [ ] Update valid examples.
- [ ] Update invalid examples.
- [ ] Run `npm run validate:contracts`.

## Core Baseline

- [ ] Keep reusable enforcement in `packages/core/`.
- [ ] Add focused tests under `tests/core/`.
- [ ] Run `npm run test:focused`.

## Governance

- [ ] Review `REPO_PROFILE.json`.
- [ ] Update `ROADMAP.md`.
- [ ] Update `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`.
- [ ] Update `DECISIONS.md` if authority changed.
- [ ] Update or create `docs/decisions/YYYY-MM-DD.md` if authority changed.
- [ ] Update `CHANGELOG.md`.
- [ ] Run `npm run check`.
