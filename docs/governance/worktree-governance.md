# Worktree Governance

Worktrees are the preferred way to let multiple people or coding agents work without clobbering each other.

## Recommended setup

```bash
git worktree add ../<project>-core -b feature/core-authority-kernel
git worktree add ../<project>-ens -b feature/ens-agent-identity
git worktree add ../<project>-zerog -b feature/zerog-policy-memory
git worktree add ../<project>-keeperhub -b feature/keeperhub-adapter
git worktree add ../<project>-signer -b feature/hardware-signer
git worktree add ../<project>-docs -b feature/docs-hardening
```

## Ownership rule

One worktree owns one workstream. Cross-cutting changes require a decision note or a short coordination note in the relevant roadmap file.

Baseline workstreams should keep ownership clear:

- contract workstream owns `contracts/**`
- core workstream owns `packages/core/**`
- quality-gate workstream owns `tests/**`
- docs/audit workstream owns `docs/**`, `DECISIONS.md`, `CHANGELOG.md`, and roadmap/decision routing

## File scope rule

Each worktree should declare:

- owned files
- shared files
- forbidden files
- expected integration points

Shared routing files such as `docs/architecture/ARCHITECTURE.md`, `ROADMAP.md`, `DECISIONS.md`, and `CHANGELOG.md` should be updated carefully and reviewed before merge.

No worktree should add adapters, demos, or provider integrations during the contract/core baseline unless a human explicitly changes the roadmap.

## Sync rule

Before starting a new session:

```bash
git fetch origin
git status
git log --oneline -5
```

Before merging:

```bash
git status
git diff --stat main...HEAD
npm run check
```

## Conflict posture

Conflicts in core schemas, architecture, or authority rules are not mechanical conflicts. They are design conflicts. Resolve them with a decision entry.
