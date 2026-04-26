---
name: agent-assignment-writer
description: Create bounded human or agent workstream prompts with clear file ownership, dependencies, validation, docs updates, and stop conditions. Use this when delegating work or preparing a fresh parallel-agent assignment.
license: Complete terms in LICENSE.txt
---

Agent assignment writing is the discipline of turning a project need into a bounded, auditable workstream that another human or agent can execute without widening scope or colliding with other work.

## Read First

- `REPO_PROFILE.json`
- `skills/agent-assignment-writer/templates/agent-assignment.md`
- `skills/agent-assignment-writer/templates/fresh-agent-handoff.md`
- `docs/governance/multi-agent-workflow.md`
- `docs/governance/worktree-governance.md`

## Workflow

1. Identify the smallest workstream that can be owned by one agent.
2. State the branch or worktree if one is required.
3. List allowed files and forbidden files.
4. Name dependencies and upstream contracts.
5. Include validation commands from `REPO_PROFILE.json`.
6. Include docs, decisions, changelog, and audit files to update.
7. Include stop conditions.
8. Require a final summary with exact commands and results.

## Assignment Quality Bar

Assignments should be narrow enough that two agents can work without touching the same files unless a human explicitly coordinates the overlap. If the assignment requires changing governance doctrine, architecture boundaries, or core contracts, call that out as a governance-locked change.

## Output

Use the templates in `templates/` as the starting point. Keep project-specific wording concise, but preserve explicit allowed files, forbidden files, validation, and stop conditions.
