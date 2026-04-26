# Phase Cadence

`<PROJECT_NAME>` uses a lightweight `.1` through `.9` phase cadence.

## Pattern

```text
x.1 - phase setup and interface review
x.2 - first implementation slice
x.3 - fixtures and validation
x.4 - integration seam
x.5 - midpoint audit
x.6 - second implementation slice
x.7 - demo or DX surface
x.8 - docs, tests, and hardening
x.9 - closeout audit
```

## Rule

Do not skip the midpoint audit when a phase touches authority, signing, execution, identity, or policy.

## Closeout summary

Each closeout should include:

- what changed
- what is now proven
- what remains unproven
- commands run
- audit decision
- commit hash if pushed
- next recommended action
