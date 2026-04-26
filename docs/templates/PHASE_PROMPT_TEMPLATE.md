# `<Roadmap Or Phase Name>` Execution Prompt Template

Use this when you want an agent to execute a complete `<PROJECT_NAME>` phase in one coordinated run.

```md
Start `<roadmap family or phase id>` and execute the entire phase in one coordinated run.

Repository:
- `<absolute repo path>`

Read first:
- `<absolute path to AGENTS.md>`
- `<absolute path to docs/README.md>`
- `<absolute path to ARCHITECTURE.md>`
- `<absolute path to REPO_BOUNDARIES.md>`
- `<absolute path to ROADMAP.md>`
- `<absolute path to DECISIONS.md>`
- `<absolute path to docs/repo-truth/THC_METHODOLOGY.md>`
- `<absolute path to docs/repo-truth/THC_IN_THIS_REPO.md>`
- `<absolute path to docs/governance/multi-agent-workflow.md>`
- `<absolute path to docs/governance/worktree-governance.md>`
- `<absolute path to docs/hackathon/vendor-tracks.md>`
- `<absolute path to relevant roadmap feature file>`

Goal:
Complete `<x.1>` through `<x.9>` of `<phase name>`.

Operating rules:
- Keep write scopes disjoint if using multiple agents.
- Complete waves sequentially.
- Preserve authority boundaries.
- Do not invent execution bypasses.
- Do not hard-code identity-critical values.
- Do not widen into unrelated roadmap work.
- Prefer fail-closed behavior when evidence is weak or declarations are invalid.
- Do not stage unrelated worktree changes.

Verification requirements:
- Run focused tests during each wave.
- Validate changed schemas.
- Validate fixtures.
- For security-sensitive or execution work, prove nonce, deadline, signer, and executor checks.
- Before finalizing, run the broadest responsible verification.
- Do not claim completion without concrete verification output.

Required final summary:
- what landed
- what audits found and how findings were closed
- what is now proven
- exact verification run
- commit hash, branch, and push target if pushed
- deferred gaps
- remaining tasks
```
