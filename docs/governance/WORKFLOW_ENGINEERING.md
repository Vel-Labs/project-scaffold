# Workflow Engineering

Workflows are finite. They declare stages, stage personas, skills, allowed verdicts, outputs, transitions, terminal outcomes, and whether a receipt is required.

## Verdicts

- `pass`: evidence satisfies the stage contract.
- `revise`: fixable inside the active assignment.
- `under_served`: useful progress exists, but named non-critical context or evidence is missing.
- `human_review_required`: authority or judgment must transfer to a human.
- `blocked`: mandatory authority, safety, or verification is missing.

`blocked` terminates. `human_review_required` suspends automation. `under_served` can continue only when declared and cannot satisfy critical completion gates.

## Current Workflow

`contracts/agent-governance/workflows/scoped-change.json` defines the first accepted workflow:

```text
scope-and-plan -> implement -> verify -> closeout
```

It requires a receipt and independent verification before completion.
