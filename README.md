# Project Scaffold

A good project should explain itself before you have to reconstruct it from chats.
Project Scaffold gives a new repository a clear starting point: what it is for,
where its source of truth lives, how to work on it, and how to check a change.
Humans and coding agents use the same files and commands.

Use it for a small tool, a plugin, a website, or an experiment that may grow into
something larger. Start with a small baseline. Add contracts, integrations and
shared project visibility when the project needs them. The scaffold supplies
structure and validation; your project supplies the product and its behavior.

The approach follows **Truth, Hardening, Clarity**: put important facts in owned
files, check meaningful boundaries, and make the result understandable to the next
person or agent. A passing repository check is useful evidence, not proof that a
product is shipped or useful.

## What you get

| Need | Where it lives |
| --- | --- |
| Explain the project to a person | `README.md`; optional `PROJECT_CONTEXT.md` for reviewed goals, research, topics and related projects. |
| Give an agent the right starting context | Short `AGENTS.md`, `REPO_PROFILE.json` and task-specific reading. |
| Keep identity and commands consistent | The project-owned profile and validator; preserve its ID across renames and worktrees. |
| Define behavior as complexity grows | `contracts/`, reusable enforcement in `packages/core/`, and checks that consume those contracts. |
| Remember why something changed | Project decision notes; full-copy projects also have roadmap and change-log entrypoints. |
| See reports and send messages across sessions | Optional shared Relay board, connected separately to the project's stable board ID. |
| Make a public project discoverable | Explicit publication metadata and a separately reviewed website-index update. |

## Choose a starting point

### Small project: generate only the baseline you need

The small factory needs Python 3.10+. Clone this repository and run:

```bash
git clone https://github.com/Vel-Labs/project-scaffold.git
cd project-scaffold
python3 scripts/create-project.py /absolute/new/orbit --name orbit --profile tool --dry-run
python3 scripts/create-project.py /absolute/new/orbit --name orbit --profile tool
python3 /absolute/new/orbit/scripts/validate_project.py /absolute/new/orbit
```

Choose `standard`, `tool`, `experimental`, `arcade` or `disposable`. The first
three establish a project structure, not a working app or CLI. The Arcade profile
also includes a static workshop game; browser testing and deployment remain
separate. Disposable projects stay local.

Select capabilities explicitly:

- `--with-project-context` adds the readable, evidence-backed Context format and
  its formatter. It starts empty and unreviewed.
- `--with-relay` adds a project identity and instructions for the shared board.
  It does not copy a server or register a board.
- `--with-ci` adds read-only metadata validation in GitHub Actions.
- `--adopt` fills missing files in an existing project while preserving authored
  content. It refuses an existing profile; review that profile through its owner.

Creation does not initialize Git, install packages, launch agents, start services
or publish anything. See [profiles and options](docs/project/PROJECT_PROFILES.md)
for the exact generated files and constraints.

### Full copy: use the contract and agent-governance baseline

For a project that needs the fuller contract/core boundary and local agent
helpers, copy the scaffold into a new repository. Keep the source checkout intact;
run personalization in the copy:

```bash
npm run install:local
npm run init:template:dry-run
npm run init:template
npm run validate:scaffold
```

Then describe the project in `docs/project/PROJECT_BRIEF.md`, define its first
real contract, and implement its behavior behind that boundary. Customize the
project mission and startup commands. Load additional governance or skills only
when the task calls for them. See [template usage](docs/project/TEMPLATE_USAGE.md)
and the [new-project checklist](docs/project/NEW_PROJECT_CHECKLIST.md).

## How it connects to the rest of a workspace

Each repository keeps its own identity, source, decisions and checks. Shared
systems consume selected records rather than becoming another copy of project
truth. This also applies when several tools or packages live beneath a parent
website or application: document each owned boundary and let the parent own its
integration and checks.

| Layer | Its job | What setup does not establish |
| --- | --- | --- |
| Your tool, plugin or website | Implement the actual product, its entrypoint, packaging and user experience. | The scaffold does not choose an application framework, plugin host or deployment. |
| Project Context | Explain purpose, findings and evidence-backed relationships in one readable page. | A related-project link recommends review; it does not update the other project. |
| Shared Relay dashboard | Show attributed project reports, questions, messages and receipts across attached sessions. | An attached session is not a launched or connected agent; reported completion is not acceptance. |
| Portfolio website, including Website2025 | Read approved public project metadata through its maintained README indexes. | A public Git repository or local profile alone does not enroll a project or publish private Context/history. |

Publication intent lives in `REPO_PROFILE.json`. Local is the default. For an
existing public project, review an explicit `enrolled` publication object, publish
only the intended metadata, then review the website owner's index change. Your website owns its reader, cache, cards and rendering checks. Metadata accepts
your own GitHub owner/repository. The reference Website2025 bridge has its own
account allowlist and review process; it is not bundled into this scaffold and
does not enroll others into velcrafting.com. Build or configure your own adapter
for your website. No portfolio account or connection to our workspace is needed
to create and validate a project.


## Project dashboard: shared Relay, enabled separately

[Relay](https://github.com/Vel-Labs/relay) is an **optional shared application**, not a website bundled into
every generated repository. It provides a project-labelled board with session
reports, messages, evidence references and delivery receipts. The generated
`skills/relay-board/templates/project.json` supplies a unique stable board ID;
keep it across sessions and worktrees.

Read [the Relay setup skill](skills/relay-board/SKILL.md). Relay is a separate
local application; point the skill at your own Relay checkout and database to
register the generated configuration and open that instance in its UI. A full-copy project's initializer also prepares an inert board
identity. Initialization never starts the dashboard or launches agents.

Try the generated project validator first, then use a separate Relay test database
to check board creation, a browser message, the exact CLI inbox and explicit
receipts. These checks test communication; they do not prove live agent execution
or acceptance of product work.

## Local quality gate

```bash
npm run install:local
npm run init:template
npm run validate:scaffold
npm run validate:contracts
npm run validate:agents
npm run validate:assignment
npm run scaffold:memory-check
npm run test:focused
npm run test:governance
npm run test:security
npm test
npm run typecheck
npm run check
```

This is a command index, not a required sequence. Start with focused checks.
Use consumer checks for affected dependents. Use `npm run check` for material
integration, package, migration, or release-candidate validation.

`contracts/` is the canonical source of truth. `packages/core/` is the reusable implementation boundary. `tests/` is the shared local gate and must consume `contracts/` directly instead of redefining contract truth.

Agent governance starts as contract-to-validation layers with local-only runtime evidence helpers. The scaffold defines policy, source authority, router, assignment, context profile, capability, personas, role catalog, workflow, loop, hook policy, receipt schema, receipt policy, fixtures, core validation, tests, and docs. It does not enable scheduled execution, live hooks, merge/release/deploy automation, or external writes.

Runtime evidence helpers are local-only and contract-driven:

```bash
npm run agent:run-init -- --type implementation --summary "One scoped local change"
npm run agent:check-context -- .agent-runs/<run-id>/manifest.json
npm run agent:receipt -- --draft --manifest .agent-runs/<run-id>/manifest.json
npm run agent:build-context
npm run agent:write-receipt -- path/to/receipt.json
```

They write ignored artifacts under `.agent-context/` and `.agent-runs/`.

Routed memory keeps token use low: start from `AGENTS.md`, `REPO_PROFILE.json`, and `docs/agents/CONTEXT_ROUTING.md`, then load only the files relevant to the task.
`npm run scaffold:memory-check` reports a drift score, supports `--json`, and `npm run scaffold:sync-plan` prints a targeted prompt without running an agent.

`REPO_PROFILE.json` is the machine-readable repo taxonomy and command index for humans and agents.
`CLI_INDEX.md` is the human-readable command index.
`SKILLS_INDEX.md` is the human-readable repo-local skill index.

## Repository map

```text
AGENTS.md
CHANGELOG.md
CLI_INDEX.md
CONTRIBUTING.md
DECISIONS.md
REPO_PROFILE.json
SKILLS_INDEX.md
.claude/
.github/
docs/
  README.md
  agents/
  architecture/
    ARCHITECTURE.md
    REPO_BOUNDARIES.md
  decisions/
    DECISIONS.md
  project/
    TEMPLATE_USAGE.md
  repo-truth/
  governance/
    AI_USAGE.md
  hackathon/
  roadmaps/
    ROADMAP.md
  templates/
  audits/
contracts/
  README.md
  lifecycle.md
  fail-closed-rules.md
  schemas/
  examples/
  agent-governance/
packages/
  core/
scripts/
skills/
tests/
  README.md
  contracts/
  core/
```

## Principle

Do not rely on hidden trust. Make system truth explicit, harden it, and turn it into clarity that other people can inspect.

Adapters, demos, and provider integrations are downstream of this baseline and should not start until contract validation and core enforcement remain stable.

LLM provider work starts with contracts, environment-key declarations, readiness checks, fake fallback, and manual gates. Live provider adapters belong to copied projects after those checks are in place.

## License

License selection is pending. Public source visibility is not an open-source
license; an explicit license will be added before claiming an open-source release.
