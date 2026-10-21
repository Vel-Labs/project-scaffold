# Template Usage

This repository is a reusable scaffold for future projects.

Its purpose is to provide a ready-to-copy governance, contract, core, test, audit, and handoff baseline before project-specific feature work begins.

## After Copying

1. Rename the project in:
   - `package.json`
   - `README.md`
   - `docs/architecture/ARCHITECTURE.md`
   - `docs/project/PROJECT_BRIEF.md`
   - `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
2. Replace placeholder values such as `<PROJECT_NAME>` and `<STATE_PROJECT_GOAL>`.
3. Run the initializer:

```bash
npm run init:template
```

For non-interactive use:

```bash
npm run init:template -- --project-name="My Project" --package-name="my-project" --yes
```

To verify what the initializer would touch without writing changes:

```bash
npm run init:template:dry-run
```

4. Review `REPO_PROFILE.json` as the repo taxonomy and command index.
5. Work through `docs/project/NEW_PROJECT_CHECKLIST.md`.
6. Customize `contracts/` for the project domain.
7. Keep reusable enforcement in `packages/core/`.
8. Keep shared local quality checks in `tests/`.
9. Run:

```bash
npm run install:local
npm run scaffold:adoption-check
npm run check
```

## Template Boundaries

This scaffold intentionally includes only:

- canonical contract structure
- reusable core enforcement structure
- shared local test structure
- governance docs
- `REPO_PROFILE.json` taxonomy and command routing
- repo-local agent start guide
- repo-local skills under `skills/`
- roadmap/current-state routing
- decision, changelog, and audit evidence patterns
- GitHub issue, PR, and quality-gate workflow hygiene

## Skills

Repo-specific skills live at `skills/<skill-name>/SKILL.md` and use a YAML frontmatter block with `name`, `description`, and `license`. Skill-specific reusable artifacts should live under `skills/<skill-name>/templates/`.

It intentionally does not include:

- adapters
- demos
- provider integrations
- deployment workflows
- product-specific features
- UI/operator surfaces

## First Project-Specific Step

After copying the scaffold into a real project, the first implementation step is to replace the generic contract example with the project's first canonical contract and then extend `packages/core/` to enforce that contract.

## Small-project creation

Use [project profiles](PROJECT_PROFILES.md) for the smaller Python generator.
Tool and Standard create structure and metadata, not runnable product logic.
Optional Context, CI and Relay setup are selected explicitly.

## Optional shared dashboard

Full-copy initialization gives the inert Relay configuration a unique stable
identity and preserves operator edits on later runs. Read
[the setup skill](../../skills/relay-board/SKILL.md) before separate board
registration. No server, database, agent or provider is started by initialization.

## Reviewed manual maintenance

Keep the generated baseline and its exact source revision. Compare later template
changes against that baseline and your authored files, apply a small reviewed
patch, then run your own checks. Reinitialization is not an upstream merge.

Full-copy initialization needs Node.js/npm and the declared dev dependencies.
Install with `npm ci` in your own copy. Initialization aligns the package and
npm v3 lock root names, preserves dependency metadata and validates malformed
Relay/lock input before writes. It does not install or execute integrations.
