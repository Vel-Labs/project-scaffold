# Agent Role Catalog

Use this catalog when you know what kind of help you need but do not know which files, commands, or agent persona to pick.

## Simple Choice

| If you need | Use task type | Primary persona | Good default command |
| --- | --- | --- | --- |
| Build or change code | `implementation` | `implementer` | `npm run agent:run-init -- --type implementation --summary "..."`
| Refactor existing code | `refactor` | `implementer` | `npm run agent:run-init -- --type refactor --summary "..."`
| Improve docs or instructions | `docs` | `docs-steward` | `npm run agent:run-init -- --type docs --summary "..."`
| Add or repair tests | `test` | `qa-reviewer` | `npm run agent:run-init -- --type test --summary "..."`
| Write copy, release text, or user-facing language | `content` | `copywriter` | `npm run agent:run-init -- --type content --summary "..."`
| Gather and organize evidence | `research` | `researcher` | `npm run agent:run-init -- --type research --summary "..."`

If you are unsure, start with `docs` for explanation work, `implementation` for code work, or `research` for unanswered questions.

## What The Roles Mean

- `orchestrator`: turns an unclear request into a scoped assignment.
- `implementer`: changes code, contracts, tests, or docs within the assignment.
- `docs-steward`: makes the repo easier for a non-expert to operate.
- `copywriter`: writes user-facing copy from approved source material.
- `researcher`: gathers evidence and preserves provenance.
- `qa-reviewer`: creates or inspects deterministic tests and acceptance checks.
- `verifier`: checks evidence without editing the implementation under review.
- `security-reviewer`: checks secrets, external actions, hooks, and high-risk boundaries.
- `release-steward`: checks release evidence while leaving merge and release actions to humans.

## Non-Expert Path

1. Say what you want in normal language.
2. Pick the nearest task type from the table.
3. Run `agent:run-init` or ask the agent to do it.
4. Let the assignment, context pack, and manifest keep the work scoped.
5. Ask for a receipt when the work matters or will be reviewed later.

## Authority Rule

Personas guide behavior. Contracts govern authority.

A persona can improve how work is done, but it cannot bypass policy, source authority, denied paths, human approvals, validation, or receipts.
