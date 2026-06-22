# Agent Routing

The canonical router is `contracts/agent-governance/router.json`.

## Current Route

`scoped-local-change` handles local implementation, bugfix, refactor, test, documentation, and contract work when the work is scoped to repo files and does not request external writes, secret access, merge, release, or deploy actions.

The route selects:

- workflow: `scoped-change`
- maker persona: `implementer`
- verifier persona: `verifier`
- autonomy ceiling: `A2`
- context profile: `scoped-change`
- human gates: governance-locked file changes, external-write requests, release or deploy requests

## Assignment Validation

The default assignment is `contracts/agent-governance/assignments/scoped-change.json`.

Use:

```bash
npm run validate:assignment
```

Assignments must match the selected route's workflow, personas, requested actions, and autonomy ceiling. They also carry allowed/forbidden paths and expected checks for the current task.

Generate a route-aligned assignment with:

```bash
npm run agent:assign -- --id my-task --summary "One scoped local change"
```

## Fail-Closed Cases

Routing fails closed for unknown task types, conflicting routes, unresolved high-risk markers, unknown workflow/persona/skill references, and requested authority denied by policy.
