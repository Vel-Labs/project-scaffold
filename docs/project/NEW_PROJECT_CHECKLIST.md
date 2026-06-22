# New Project Checklist

Use this checklist after copying the scaffold into a new repository.

## Identity

- Replace `<PROJECT_NAME>` and other registered placeholders.
- Update `package.json` name and `REPO_PROFILE.json` purpose, traits, commands, and quality gate.
- Keep generated repo `AGENTS.md` short and specific to the project.
- Review `docs/agents/ROLE_CATALOG.md` so non-expert users can ask for code, docs, tests, copy, or research work by task type.

## Governance

- Review `contracts/agent-governance/policy.json`.
- Review `contracts/agent-governance/router.json`.
- Update `contracts/agent-governance/assignments/scoped-change.json` for first project work.
- Update `contracts/agent-governance/context-profiles/scoped-change.json` to include project-specific canonical docs.
- Keep denied patterns for secrets, keys, `.git/`, and dependencies.

## Evidence

- Run `npm run scaffold:adoption-check`.
- Run `npm run validate:scaffold`.
- Run `npm run validate:contracts`.
- Run `npm run validate:agents`.
- Initialize the first scoped run with `npm run agent:run-init -- --summary "..."`.
- Keep `.agent-context/` and `.agent-runs/` ignored unless a receipt is explicitly promoted to `docs/audits/`.

## Documentation

- Update `README.md`, `ROADMAP.md`, `DECISIONS.md`, and `CHANGELOG.md`.
- Keep `docs/FILE_TREE.md` current after structural changes.
- Record architecture changes in `DECISIONS.md` or `docs/decisions/`.
