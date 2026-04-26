# Roadmap

## Phase 0: Governance and scaffold

Goal: establish docs, boundaries, source-of-truth conventions, and phase templates.

Status: template baseline established.

Includes:

- canonical contract layer in `contracts/`
- reusable enforcement boundary in `packages/core/`
- shared local quality gate in `tests/`
- current-state, audit, decision, and changelog routing

## Phase 1: First project-specific core primitive

Goal: after this scaffold is copied into a real project, build the smallest reusable core primitive that future project features depend on.

Next implementation step after copying: replace the generic contract example with the project's first canonical contract, then expand `packages/core/` to enforce it.

## Phase 2: First integration

Goal: connect one real integration without breaking boundaries.

Status: downstream in future projects. Do not start until Phase 1 keeps the local quality gate green.

## Phase 3: Working example

Goal: prove the core primitive through a focused example.

Status: downstream in future projects. Do not start demos before the first integration boundary is accepted.

## Phase 4: Hardening

Goal: improve tests, docs, audits, and usability.

## Phase 5: Stretch features

Goal: add optional high-upside features only after the core works.

Detailed feature roadmaps should live under `docs/roadmaps/features/`.
