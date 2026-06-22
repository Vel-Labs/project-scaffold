# Context Routing

Use routed context so agents load only the files needed for the current task.

## Default Flow

1. Read `AGENTS.md`.
2. Read `REPO_PROFILE.json`.
3. Pick the task type from `docs/agents/ROLE_CATALOG.md`.
4. Load the matching files below.
5. Use `agent:run-init` when the work needs an assignment, context pack, and manifest.

## Task Routes

| Task | Load |
| --- | --- |
| Code or refactor | `docs/governance/ASSIGNMENT_ENGINEERING.md`, `docs/governance/RUNTIME_EVIDENCE.md`, `packages/core/README.md`, `tests/README.md` |
| Docs or copy | `docs/agents/ROLE_CATALOG.md`, `docs/project/TEMPLATE_USAGE.md`, `docs/governance/ARTIFACT_TIMELINE_CONVENTION.md` |
| Research | `docs/repo-truth/THC_METHODOLOGY.md`, `docs/governance/LEARNINGS.md`, source files named in the assignment |
| Quality review | `skills/desloppify-review/SKILL.md`, `docs/governance/SCAFFOLD_DRIFT.md`, `docs/architecture/ARCHITECTURE.md` |
| Architecture or governance | `docs/architecture/ARCHITECTURE.md`, `docs/architecture/REPO_BOUNDARIES.md`, `DECISIONS.md`, `docs/decisions/` |
| Shipping or handoff | `docs/governance/worktree-governance.md`, `docs/architecture/COMPATIBILITY.md`, `LOG.md` |

## Rule

Do not turn every session into a full repo reread. If the task route is unclear, ask or use `research` first.
