# THC Methodology
Authored by Steven Pajewski, @velcrafting

## TL;DR

Build verifiable systems that do not require hidden trust.

THC stands for:

- Truth
- Hardening
- Clarity

It is a continuous methodology for building reliable systems by grounding work in reality, pressure-testing that reality until it survives failure and drift, and turning the result into clarity that others can inspect directly.

Its loop is:

Truth -> Hardening -> Clarity -> better Truth

## What THC Is

THC Methodology is a reliability methodology.

It is not a scheduling framework, a sprint ritual, or a team-ceremony replacement. It is a way to govern how truth moves through a system until that system becomes reliable, understandable, and worthy of trust.

The core claim is simple:

A system can be open and still be opaque. A system can ship quickly and still depend on undocumented assumptions. A system can appear polished while asking operators and contributors to trust invisible reasoning, fragile conventions, or personality-driven knowledge.

Visible code alone is not enough if the surrounding assumptions, boundaries, and operating reality remain implicit. THC exists to remove that gap.

## The Three Pillars

### Truth

Truth is reality anchored in evidence.

Truth includes:

- actual system behavior
- explicit contracts
- provenance
- known failures
- constraints
- observable outputs
- source-of-truth locations

The question of the truth phase is:

What can we prove right now?

### Hardening

Hardening is the process of pressure-testing truth until weak assumptions are exposed.

Hardening includes:

- validation
- audit
- adversarial review
- integrity checks
- compatibility checks
- deterministic workflows
- fail-closed boundaries

The question of the hardening phase is:

Does this truth survive contact with reality?

### Clarity

Clarity is the act of making hardened truth legible.

Clarity includes:

- concise documentation
- explicit contracts
- understandable operator surfaces
- deterministic artifacts
- clear explanations of behavior
- reproducible state

The question of the clarity phase is:

Can another person inspect this without relying on hidden trust?

## Doctrine

- Anchor to truth
  Prefer observable evidence, explicit contracts, and real system behavior over assumptions, folklore, or implied intent.

- Harden what is true
  Treat validation, audit, adversarial review, and fail-closed boundaries as core build work, not cleanup.

- Produce clarity from hardening
  A hardened system should become simpler to inspect, explain, and operate. If it remains opaque, the hardening is incomplete.

- Remove hidden trust
  Do not require operators or contributors to rely on undocumented state, invisible reasoning, or personality-driven system knowledge.

- Keep the loop alive
  Clarity must improve future truth capture. A system that becomes clearer should also become easier to verify, challenge, and extend safely.

- Reliability before rhetoric
  The methodology is proven by reproducible outcomes, not by process language alone.

## How The Loop Works

THC is continuous, not linear.

1. Truth
   Capture what is actually true about the system.
2. Hardening
   Stress that truth until contradictions, drift, and weak assumptions are exposed.
3. Clarity
   Turn hardened truth into contracts, docs, outputs, and explanations that others can inspect quickly.
4. Feedback
   Use the improved clarity to sharpen the next round of truth capture.

Each pillar corrects a failure mode:

- Truth without hardening becomes naive.
- Hardening without clarity becomes opaque.
- Clarity without truth becomes theater.

## THC Compared To Agile And Scrum

THC is complementary to Agile and Scrum, not a replacement for them.

- Agile helps teams adapt.
- Scrum helps teams organize work cadence.
- THC helps teams determine whether the system is grounded, hardened, and legible enough to deserve trust.

A simple way to describe the distinction is:

Agile and Scrum describe how work moves. THC describes how truth moves through a system until it becomes reliable and clear.

## Why THC Matters In Open Source

Open source does not automatically mean understandable.

Public codebases often still rely on:

- undocumented conventions
- unclear source-of-truth boundaries
- weakly verified claims
- fragile runtime assumptions
- contributor folklore

THC treats those as reliability failures, not communication accidents.

Its value in open source is that it pushes projects toward:

- explicit truth boundaries
- verifiable claims
- reproducible artifacts
- legible reasoning
- lower hidden-trust requirements for new contributors and operators

The first output is system reliability.
The visible consequence is user and operator trust.
Better collaboration quality follows downstream.

## Initial Evaluation Lens

Projects can be evaluated through a THC lens with questions like:

- Where is the durable source of truth?
- Which claims are directly verifiable?
- How is truth hardened against drift, misuse, and contradiction?
- Which boundaries fail closed instead of relying on best effort?
- How quickly can a new operator explain system behavior from artifacts alone?
- How much hidden trust is still required to operate or extend the system safely?

These questions are intentionally qualitative in the first pass. They are meant to expose posture before they are turned into a scoring system.

## Formal Definition

THC Methodology is a continuous engineering methodology for building systems that do not require hidden trust.

Its primary output is system reliability.
Its visible consequence is operator and user trust.
Its downstream effect is improved collaboration quality in open systems.
