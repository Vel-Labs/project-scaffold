# Maintained project profiles

Use `scripts/create-project.py` for durable project creation. It selects a small
baseline from this maintained scaffold; it does not copy the full control plane.
The old full-copy `init:template` command remains supported for existing users.

```bash
python3 scripts/create-project.py /absolute/new/project --name orbit --profile standard
python3 scripts/create-project.py /absolute/new/game --name star-collector --profile arcade --dry-run
python3 scripts/create-project.py /absolute/existing/project --name existing --profile tool --adopt
```

Profiles: `standard`, `tool`, `experimental`, `arcade`, `disposable`.
All include README, short project AGENTS, ignore/attribute rules, source and
decision-documentation boundaries, REPO_PROFILE, its schema and a dependency-free
validator. Adoption preserves authored files and adds missing files. An existing
REPO_PROFILE is refused; use explicit enrollment rather than replace its identity.
Arcade adoption requires existing `index.html`, `game.js` and valid workshop
`arcade.json` without a playUrl; it preserves those files and requires independent
game review. Disposable experiments remain local.

Standard and Tool profiles supply structure, identity and metadata validation.
They do not generate application logic, a runnable CLI module or source tests;
project owners add those and their startup commands. The separate Python CLI
starter is also a skeleton whose placeholder entry point has no application
module yet.

No Git initialization, CODEOWNERS, graph, provider, credentials, service,
deployment or public write occurs. CI is absent by default; `--with-ci` copies
the read-only project-validation workflow. `--with-relay` copies only the inert portable
skill/config; it does not operate a board. The workspace `new_project.sh`
retains its existing category/name routes and delegates to this generator.

## Optional Project Context

```bash
python3 scripts/create-project.py /absolute/new/project --name orbit --with-project-context --dry-run
python3 scripts/create-project.py /absolute/new/project --name orbit --with-project-context
```

This capability is absent by default and works with every small-project profile.
It adds `PROJECT_CONTEXT.md` and `scripts/project_context.py`. Existing profile
fields point to the page (`canonicalPaths.projectContext`, `readFirst`) and the
explicit formatter command (`commands.formatProjectContext`). No new required
profile fields, services, classifiers or workspace registrations are introduced.

The human-readable tables and their one `project-context-v1` JSON block share
the same interpretation. The structured fields are:

| Field | Meaning |
| --- | --- |
| `identity` | `project:` followed by the existing profile UUID; preserve it across renames/worktrees. |
| `reviewed_on` | Date of the authored review, initially `null`; not current acceptance or live state. |
| `path_basis` | `repository`; evidence stays relative to this repo. The older Workspace pilot remains compatible with its Workspace-relative paths. |
| `topics` | Curated discovery slugs; initially empty, never inferred session classifications or dependencies. |
| `summary` | Reviewed question/answer rows with `evidence` references; initially empty. |
| `related_projects` | Explicit identity, relationship, description, `review_when` and evidence; initially empty. |
| `agent_generated`, `human_reviewed` | Optional pair: only `true`, `false` is admitted for generated Context pages. The formatter emits matching frontmatter and identifies the date as agent review. Absence keeps the existing format and makes no authorship claim. |

Each evidence reference has `path`, `sha256` and an exact whitespace-normalized
`excerpt`. Fill claims from existing source owners, preserve contrary evidence
and distinguish local implementation, acceptance and shipment. An empty starter
establishes no goals, findings, accepted outcomes or connections.

After editing the structured block, run
`python3 scripts/project_context.py PROJECT_CONTEXT.md`. Then run the existing
project validator. It checks identity, readable-table agreement and repository
source pins. Missing/changed sources fail that check; this is a request for
review, not permission to repair the source or update another project. Structural
validation does not independently verify scientific results, declared related
owners, runtime health or acceptance. Overview resolves relationships only
against its existing eligible owners; missing/ambiguous owners remain gaps.

Adoption preserves authored README/AGENTS files. Conflicting existing context
pages or formatter resources are refused before writes. An existing profile is
still refused unchanged, including when the option is requested: review any
existing-project addition manually instead of running a migration. No workspace
backfill or automatic downstream update is supplied. Private context has no
automatic Website2025/publication export; public sharing requires separate scope.

## Source-owned publication intent

The optional `project` and `publication` fields extend the existing REPO_PROFILE
schema. Old full-scaffold profiles continue to work without these fields.
`project.id` is a UUID created once; preserve it across worktrees and renames.
`publication.repository` is the explicit owner/repo identity, not an inferred folder
name. Publication validators separately verify public visibility, the default
branch, public metadata and website recognition.

| State | Meaning |
| --- | --- |
| `local` | Local/private intent; no website surfaces or metadata sync. |
| `public-unenrolled` | Public GitHub intent; website enrollment remains absent. |
| `enrolled` | Explicit selected website surfaces and bounded metadata sync intent. |

`consent.metadataSync` is explicit enrollment intent. It does not establish GitHub
credentials, external-write authority or public repository visibility. Public
creation requires an explicit summary. Titles and summaries are short, single-line
plain text; internal paths and URLs are refused. Any syntactically valid GitHub owner/repository can be recorded. Each website
bridge separately decides which owners it accepts; metadata grants no access
to another person's website. Internal plans, receipts and raw histories never belong
in public metadata. A local profile does not silently upgrade when Git is pushed.

Supported surfaces: `projects`, `case-study`, `tools`, `labs`, `arcade-workshop`,
`arcade-playable`. These are intent categories; `labs` does not assert that a public
`/labs` route exists. Curated case-study and tool/lab MDX remain optional editorial
drafts owned by the website publication workflow.

```bash
python3 scripts/create-project.py /absolute/new/game --name star-collector \
  --profile arcade --publication enrolled --repository velcrafting/star-collector \
  --surface arcade-workshop --title 'Star Collector' \
  --summary 'Collect stars with keyboard or touch.'
```

The Arcade profile writes only fields consumed by the current website contract.
It starts as `workshop`, with no playUrl, model attribution or invented release date.
The static game has explicit Start, Pause/Resume and Restart, keyboard/touch input,
pause on blur, a fixed 4:3 player layout and no external requests. See the
[maintained author contract](https://github.com/velcrafting/website2025/blob/main/src/app/arcade/AUTHOR_PROMPT.md).
Creation refuses `arcade-playable`. Promotion needs independent deployed HTTPS
browser evidence and the publication verifier. No deployment path is generated
until a separate static-host capability is selected.

## Checks and recovery

Run `python3 scripts/validate_project.py /absolute/generated/project`. This checks
identity, publication invariants and relative resources. The baseline Arcade
validator certifies workshop metadata only; it deliberately holds playable
promotion for the publication verifier. Schema validation and actual game/browser
acceptance are separate checks. Select further project-specific source checks as
implementation grows.

`--dry-run` performs planning and input checks without creating a directory. Writes
use exclusive creation; existing destinations require adoption. Adoption rejects
symlink/escaping paths before writing. To undo adoption, remove only files listed
in the generator's `created` result after confirming they have not been edited.
Preserved files and unrelated source must remain intact.

For later scaffold changes, retain the generated baseline and use
[reviewed manual maintenance](TEMPLATE_USAGE.md#reviewed-manual-maintenance).
The practical trial exercised generated validation and an authored Tool on macOS
with Python 3.14.5. It does not certify other platforms, Python versions, packaging
or deployment; run the project's own startup and checks on each supported target.
