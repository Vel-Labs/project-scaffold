# Agent Routing

The canonical router is `contracts/agent-governance/router.json`.

## Current Routes

The default router handles local, assignment-scoped work when the task does not request external writes, secret access, merge, release, or deploy actions.

| Route | Task types | Maker | Verifier | Ceiling |
| --- | --- | --- | --- | --- |
| `scoped-local-change` | `implementation`, `refactor`, `bugfix`, `contract` | `implementer` | `verifier` | `A2` |
| `scoped-docs-change` | `docs`, `documentation` | `docs-steward` | `verifier` | `A2` |
| `scoped-test-change` | `test` | `qa-reviewer` | `verifier` | `A2` |
| `scoped-content-change` | `content` | `copywriter` | `docs-steward` | `A2` |
| `scoped-research-change` | `research` | `researcher` | `verifier` | `A1` |

All default routes use workflow `scoped-change`, context profile `scoped-change`, and local validation only.

## Assignment Validation

The default assignment is `contracts/agent-governance/assignments/scoped-change.json`.

Use:

```bash
npm run validate:assignment
```

Assignments must match the selected route's workflow, personas, requested actions, and autonomy ceiling. They also carry allowed/forbidden paths and expected checks for the current task.

Generate a route-aligned assignment with:

```bash
npm run agent:assign -- --type docs --id my-task --summary "Clarify setup instructions"
```

See `docs/agents/ROLE_CATALOG.md` for beginner-friendly task type selection.

## Fail-Closed Cases

Routing fails closed for unknown task types, conflicting routes, unresolved high-risk markers, unknown workflow/persona/skill references, and requested authority denied by policy.
