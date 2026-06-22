---
name: worktree-shipping-checklist
description: Use when preparing scoped code work in an isolated branch or worktree before commit, push, PR, or handoff
license: Complete terms in LICENSE.txt
---

# Worktree Shipping Checklist

Use this for harness-neutral shipping hygiene.

## Read First

- `REPO_PROFILE.json`
- `docs/governance/worktree-governance.md`
- target repo `AGENTS.md`

## Checklist

1. Start from a clean base checkout.
2. Create or use an isolated branch or worktree.
3. Confirm the worktree path and branch before edits.
4. Keep changes inside assignment scope.
5. Run focused checks first, then broader checks when practical.
6. Review `git status` and `git diff --stat` before staging.
7. Commit only intended files.
8. Push only after validation passes or the user accepts the risk.
9. Remove temporary worktrees when the handoff is complete.

## Output

Return branch, changed files, commands run, validation result, commit or PR link, and any cleanup still needed.
