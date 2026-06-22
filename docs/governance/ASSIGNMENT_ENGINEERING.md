# Assignment Engineering

Assignments make a task concrete before work starts.

An assignment binds:

- route
- workflow
- maker and verifier personas
- autonomy level
- allowed and forbidden paths
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

## Copy-Forward Rule

Copied projects should customize assignments before enabling any automation. A valid assignment is the project-local proof that the work is scoped, bounded, and has explicit verification expectations.
