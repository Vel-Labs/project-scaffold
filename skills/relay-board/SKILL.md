---
name: relay-board
description: Use an optional project Relay board when project visibility is useful and authorized. Set up isolated project visibility, attach assigned sessions, publish progress, and route questions through the shared workspace dashboard.
license: Complete terms in LICENSE.txt
---

# Project dashboard

Use this optional capability when the task benefits from shared visibility.
It does not require a board for ordinary or long work. Read
[project.json](templates/project.json) when setting up a board.
The project initializer fills its title, objective, and unique instance ID.
Keep that ID stable across sessions and worktrees. A genuinely new project
copied from an already personalized repo must receive a new UUID; never reuse
the source project's board. Do not copy runtime history or sessions.

## Connect to shared Relay

Relay is a separate optional application. Clone its public repository when
available, or use an explicitly assigned existing Relay installation. Set
`RELAY_ROOT` to the directory containing its `app.py` and `RELAY_DB` to your
chosen database. Do not assume a particular workspace layout, use another
project's database, or start a service as part of scaffold creation.

Read the shared app's `README.md` and `skills/relay-board/SKILL.md`. Set
`RELAY_ROOT` to that absolute app directory and `RELAY_DB` to the exact serving
database path from its connection handoff. Python 3 is required. From the
project root, use:

```bash
python3 -B "$RELAY_ROOT/app.py" --db "$RELAY_DB" instances
python3 -B "$RELAY_ROOT/app.py" --db "$RELAY_DB" create --json skills/relay-board/templates/project.json
```

Board registration writes runtime state and requires task authorization.
Run `create` only if the configured instance does not exist. Reuse an existing
instance only after its project identity is verified. On an uncertain response,
inspect the exact ID. Never invent a replacement to bypass a conflict. If the
configuration still has an empty ID, initialize it before registration.

Open that instance in the shared local service. **Board settings** changes its
visible project label. Attach only assigned sessions. Use the exact instance
and session on every update. Attachment does not connect or launch a runtime.
If Relay is unavailable, report that limitation and continue authorized project
work; do not claim the dashboard is active.

## Operate the board

The Parent supplies objective, constraints, evidence paths, progress, blockers,
deliverables, and questions with proposed defaults. Update after meaningful
steps. Answers and delivery receipts stay scoped to their instance/session.
An unanswered question grants no approval. Use a default only when that action
already falls within the user's authority; continue independent work otherwise.

If a separate summary pass is useful and authorized, give it a bounded assignment
with an available capable model selected by the current task. No fixed model or
mandatory worker is required by project setup. Send only assigned project
context; a summary cannot accept work or control other agents. Runtime-specific
assignments can impose their own reviewed routes; this skill does not invoke them.

GoalBuddy owns accepted task state; WorkGraph owns dependencies. Relay shows
attributed reports and communication. Never infer runtime liveness, delivery,
or completion from a saved label. Prove any new runtime connection with a real
scoped update and reply. This skill does not install a scheduler or transport.
