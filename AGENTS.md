# AGENTS

This file defines how humans and coding agents should operate in this repository.

## Mission

Build `<PROJECT_NAME>` in a way that is clear, auditable, readable, and safe to extend.

## Priority order

1. Preserve user or operator safety.
2. Preserve architectural clarity.
3. Preserve auditability.
4. Keep integrations behind explicit boundaries.
5. Prefer small, testable layers.
6. Keep documentation tied to reality.

## Required reading before structural changes

- `README.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/REPO_BOUNDARIES.md`
- `ROADMAP.md`
- `docs/README.md`
- `docs/repo-truth/THC_METHODOLOGY.md`
- `docs/repo-truth/THC_IN_THIS_REPO.md`
- `docs/governance/multi-agent-workflow.md`
- `docs/governance/worktree-governance.md`
- `docs/governance/code-quality-standards.md`
- `docs/governance/AGENT_OPERATING_MODEL.md`
- `docs/agents/ROUTING.md`

## Working rules

- Keep changes scoped.
- Do not hard-code values that should come from config, contracts, schemas, or source-of-truth records.
- Do not claim a feature works without evidence.
- Keep large files below 350 lines where practical.
- Files above 500 lines require extraction or written justification.
- Comments should feel human and explain why a boundary exists.
- Update docs when behavior changes.
- Record architectural decisions in `DECISIONS.md`.
- Record notable changes in `CHANGELOG.md`.

## Scaffold stewardship

This repository is the core project scaffold. Treat changes here as changes to the default operating system for future coding repos, not as one-off project cleanup.

- Keep scaffold guidance portable. Do not hard-code `/Users/steven/Workspace` paths into files meant to be copied into another repo.
- Keep placeholders explicit and searchable, such as `<PROJECT_NAME>` or `<STATE_PROJECT_GOAL>`.
- Keep generated-repo instructions short enough to be useful in active model context.
- Prefer local, inspectable repo contracts over hidden global tool configuration.
- Put reusable enforcement in scripts, schemas, contracts, tests, or repo-local skills rather than prose-only expectations when practical.
- When changing scaffold behavior, update the matching docs, templates, validation scripts, and tests together.
- After scaffold changes, run the narrowest relevant validation, usually `npm run validate:scaffold` first, then broader checks if scripts, contracts, or tests changed.
- Keep structure earned. Do not add new folders, artifact kinds, or skills for one-off work when an existing doc, skill, receipt, or backlog line is enough.
- Keep context routed. Prefer small anchor files and task-specific routing over giant always-read instruction files.
- Use `npm run scaffold:sync-plan` to print targeted drift-fix prompts only. Do not auto-run a coding agent or apply sync edits without explicit user instruction.
- Agent-control-plane changes must keep `contracts/agent-governance/`, schemas, fixtures, `packages/core` validation, tests, docs, decisions, changelog, and file tree synchronized.

## Generated repo AGENTS.md baseline

Every project created from this scaffold should include a repo-local `AGENTS.md` that captures only the repo-specific facts agents need after the global/workspace rules are known.

Include:

- project mission and priority order
- required reading before structural changes
- package manager and canonical commands from `REPO_PROFILE.json`
- architecture boundaries and generated folders
- public/private data and integration boundaries
- validation expectations and known skipped checks
- change-reporting expectations

Do not include:

- duplicated global safety rules unless the repo is expected to travel without workspace context
- secret values, private paths, real environment values, or personal machine assumptions
- long generic prompting advice that does not affect this repo's work
- tool-specific installation steps unless the repo directly owns that tool setup

## Context and command-output discipline

Agents should protect active model context, especially when working in generated repos with large logs, build output, dependency trees, or generated artifacts.

- Start with the exact question being answered before reading files or running broad searches.
- Use `rg`, file lists, imports, references, and focused file sections before broad exploration.
- For unknown or potentially large shell output, cap output by bytes rather than lines.
- Prefer focused diffs, targeted test output, and recent failure excerpts over full logs.
- Avoid dumping full generated files, minified JSON, dependency trees, recursive listings, or broad diffs unless the task requires it.
- If compact command-output tooling such as `rtk` is installed and verified, prefer it for noisy git, test, grep, read, and package-manager commands.
- Keep a short running summary for complex tasks: decisions, touched files, changed behavior, unresolved risks, and validation state.

## Multi-agent development rules

Use separate worktrees for parallel coding agents. No two agents should own the same files unless coordinated by a human.

Each agent must declare:

- workstream
- files it expects to touch
- files it must not touch
- dependencies
- validation plan
- docs to update

## Agent governance model

The repo-local governance contracts live in `contracts/agent-governance/`.

- A router selects a workflow, personas, skills, context profile, autonomy ceiling, and human gates.
- An assignment scopes the current task, expected checks, approvals, and receipt requirement but cannot grant more authority than policy or persona allow.
- A persona defines authority.
- A skill defines procedure and never grants authority.
- A workflow is finite and declares stage verdict transitions.
- A loop repeats only under objective gates and hard limits.
- A hook is adapter-facing defense in depth, not the sole security boundary.
- A gate evaluates evidence.
- A receipt records what happened.
- A context profile selects bounded source context and denied sensitive paths.
- A receipt policy controls transient receipt storage, promotion, and privacy.
- Learning is deferred guidance and cannot override canonical contracts.

Effective permission is the intersection of policy, persona, assignment, runtime capability, and risk profile. Any denial wins. Unknown authority fails closed.

## Definition of done

A change is not done unless:

- behavior is documented
- tests or deterministic checks exist where practical
- relevant risks are noted
- changelog is updated
- decisions are recorded when architecture changes
- no unrelated files are staged
## Knowledge Distillation And Review

- Human review should improve the system, not unblock the system. Normal ingestion, distillation, chunking, retrieval, and synthesis should continue unless review flags indicate malformed, unsupported, unsafe, sensitive, or materially ambiguous content.
- Treat workspace knowledge as a layered trust system: raw sources, distilled notes, wiki chunks/pages, and conversation or project synthesis. Preserve provenance, source paths, dates, URLs, and uncertainty at every layer.
- Prefer `review_flags` over blocking review states for raw sources and distilled notes. Use flags to route attention while keeping usable artifacts available with clear confidence and caveats.
- Use wiki chunks, Markdown section headings, or selected text ranges as the primary human feedback unit. Feedback may also target a full document, source note, raw source, or relationship edge.
- Positive feedback, negative feedback, and human notes should trigger AI re-review by default. Distill repeated feedback into durable `LEARNINGS.md` guidance with Do/Don't patterns and references to example artifacts.
- Conversation and project work are valid source material when captured into visible workspace artifacts. Do not let chat-only conclusions become canonical knowledge without a traceable report, note, decision record, or cited synthesis artifact.
