# Assignment Engineering

Assignments make a task concrete before work starts.

An assignment binds:

- route
- workflow
- maker and verifier personas
- task type
- owner and reviewer
- autonomy level
- allowed and forbidden paths
- do-not-touch paths
- dependencies and blockers
- requested actions
- expected checks
- human approval state
- receipt requirement

Assignments do not grant authority. They must fit inside the selected route, persona, capability, policy, and risk profile. Unknown routes, unsafe paths, denied actions, or autonomy above the route ceiling fail closed.

## Default Assignment

`contracts/agent-governance/assignments/scoped-change.json` is the default template for one scoped local repository change.

Validate it with:

```bash
npm run validate:assignment
```

Validate a project-specific assignment with:

```bash
npm run validate:assignment -- path/to/assignment.json
```

Generate a scoped assignment from the default router and assignment template with:

```bash
npm run agent:assign -- --id my-task --type implementation --summary "One scoped local change"
```

By default, generated assignments are written under `.agent-runs/<id>/assignment.json`, with a matching `.agent-runs/<id>/assignment.md` for human review. Both are ignored local runtime state.

Task types are `implementation`, `docs`, `test`, and `refactor`. Risk markers default to `local-write`; markers such as `deploy`, `release`, `external-write`, or `secret-access` fail closed against the default route.

For a full local evidence bundle, prefer:

```bash
npm run agent:run-init -- --summary "One scoped local change"
```

## Copy-Forward Rule

Copied projects should customize assignments before enabling any automation. A valid assignment is the project-local proof that the work is scoped, bounded, and has explicit verification expectations.
