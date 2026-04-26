# Roadmap

This file is the high-level roadmap index for humans, reviewers, and agents.

Detailed roadmap plans live under `docs/roadmaps/`. Operational next-step routing lives in `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`.

## Ship Goal

Provide a reusable governance scaffold that future projects can copy to start with clear contract truth, core enforcement boundaries, local quality gates, agent onboarding, and audit/decision/change routing.

## Current Phase

Phase 0: Template governance and scaffold baseline.

Status: established and runnable.

## Immediate Next Action

After copying into a real project, replace the generic contract example with the project's first canonical contract and expand `packages/core/` to enforce it.

See `docs/roadmaps/CURRENT_STATE_AND_NEXT.md` for operational routing.

## Dependency Order

1. Governance and scaffold baseline.
2. Project-specific contract authority.
3. Core enforcement against accepted contracts.
4. First integration.
5. Working example or demo.
6. Hardening and polish.
7. Stretch features.

## Roadmap Docs

- `docs/roadmaps/README.md`: roadmap organization.
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`: current operational source of truth.
- `docs/roadmaps/features/`: detailed feature roadmap files.
- `docs/audits/`: phase and closeout evidence.

## Do Not Start Yet

- adapters
- demos
- provider integrations
- browser/operator surfaces
- deployment workflows
- project-specific features before copying the scaffold
