# Skills Index

This file is the human-readable index of repo-local skills. Each skill's `SKILL.md` remains the executable instruction source for agent harnesses.

## Core Governance Skills

| Skill | Use When | Reads First |
| --- | --- | --- |
| `agent-assignment-writer` | Scoping or handing off work | `REPO_PROFILE.json`, assignment templates |
| `contract-steward` | Updating canonical contracts or schemas | `contracts/README.md`, `contracts/lifecycle.md` |
| `core-enforcement` | Implementing reusable validation or enforcement | `contracts/README.md`, `packages/core/README.md` |
| `phase-closeout-audit` | Closing work with evidence and updates | `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`, `CHANGELOG.md` |

## Role Skills

| Skill | Use When | Related Persona |
| --- | --- | --- |
| `copywriter` | Drafting source-backed user-facing copy | `copywriter` |
| `human-copy-review` | Making copy sound natural without adding unsupported claims | `copywriter` |
| `docs-steward` | Improving docs for non-expert users | `docs-steward` |
| `researcher` | Gathering evidence with provenance and uncertainty | `researcher` |
| `qa-reviewer` | Creating or inspecting deterministic checks | `qa-reviewer` |
| `desloppify-review` | Producing a cleanup backlog before fixes start | `quality-reviewer` |

## Scaffold Operations Skills

| Skill | Use When | Output |
| --- | --- | --- |
| `project-personalize` | Converting the scaffold into a real project | personalization checklist |
| `pattern-capture` | Turning repeated work into reusable guidance | new or updated skill/pattern |
| `worktree-shipping-checklist` | Preparing isolated branch or worktree work for handoff | branch, checks, commit or PR evidence |

## Maintenance Rule

When adding, removing, or renaming a skill, update this file and run `npm run scaffold:memory-check`.
