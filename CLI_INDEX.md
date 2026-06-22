# CLI Index

This file is the human-readable command reference for the scaffold. `package.json` remains the executable source of truth.

## Evergreen Scaffold Commands

These commands should exist in every copied repo unless the scaffold contract changes.

| Command | Purpose |
| --- | --- |
| `npm run install:local` | Install local dependencies. |
| `npm run validate:scaffold` | Validate scaffold structure, root policy, placeholders, skills, and file tree. |
| `npm run validate:contracts` | Validate contract schemas, examples, and governance artifacts. |
| `npm run validate:agents` | Validate agent governance contracts and cross-references. |
| `npm run validate:assignment` | Validate the default or provided assignment. |
| `npm run scaffold:adoption-check` | Check generated-repo adoption placeholders and governance entrypoints. |
| `npm run scaffold:memory-check` | Check routed memory drift, links, documented commands, routes, and skills. |
| `npm run test:focused` | Run focused contract, core, governance, and security tests. |
| `npm run test:governance` | Run governance invariant tests. |
| `npm run test:security` | Run security invariant tests. |
| `npm test` | Run all tests. |
| `npm run typecheck` | Run TypeScript type checking. |
| `npm run check` | Run the full local quality gate. |

## Agent Runtime Commands

These commands create or validate ignored local runtime evidence.

| Command | Purpose |
| --- | --- |
| `npm run agent:assign` | Generate a route-aligned assignment JSON and markdown file. |
| `npm run agent:run-init` | Create assignment, context pack, and manifest together. |
| `npm run agent:build-context` | Build a bounded context pack from the default context profile. |
| `npm run agent:check-context` | Detect stale context against a run manifest. |
| `npm run agent:receipt` | Draft, write, or promote receipts with guards. |
| `npm run agent:write-receipt` | Write a validated redacted receipt to transient storage. |
| `npm run agent:preflight` | Run local agent preflight validation. |
| `npm run agent:stop-verify` | Run the full stop-time verifier. |
| `npm run agent:run-loop` | Run a manual-only bounded loop with manifest, receipt, and verifier command. |

## Project-Specific Or Adoption Commands

These commands are expected to be customized or used mainly when converting the scaffold into a real project.

| Command | Purpose |
| --- | --- |
| `npm run init:template` | Personalize scaffold placeholders for a copied project. |
| `npm run init:template:dry-run` | Preview template personalization without writing changes. |

## Flag Notes

| Command | Useful Flags |
| --- | --- |
| `npm run init:template -- ...` | `--yes`, `--dry-run`, `--project-name=...`, `--package-name=...` |
| `npm run agent:assign -- ...` | `--id`, `--summary`, `--type`, `--risk`, `--risk-markers`, `--owner`, `--reviewer`, `--allowed-paths`, `--do-not-touch`, `--dependencies`, `--blocked-by`, `--output` |
| `npm run agent:run-init -- ...` | `--id`, `--summary`, `--type`, `--risk`, `--risk-markers`, `--owner`, `--reviewer`, `--allowed-paths`, `--do-not-touch` |
| `npm run agent:receipt -- ...` | `--draft`, `--manifest`, `--output`, `--input`, `--promote`, `--audit-reason` |
| `npm run agent:run-loop -- ...` | `--manifest`, `--receipt`, `--verify-command`, `--max-iterations` |

## Maintenance Rule

When `package.json` scripts change, update this file and run `npm run scaffold:memory-check`.
