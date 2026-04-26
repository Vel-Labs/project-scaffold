# <Feature Or Phase> Implementation Plan

## Purpose

State the concrete system-facing or developer-facing outcome.

## Why now

- why this phase is next
- what it unlocks
- what breaks or remains unclear if skipped
- what existing work it depends on

## Goals

- list concrete behaviors or artifacts to land

## Non-goals

- list adjacent work that must stay out of scope

## Current foundation entering this phase

- existing contracts or schemas
- existing adapter status
- current docs and tests
- current demo state

## Core intent

Say what this makes `<PROJECT_NAME>` more capable of doing, and what it must not pretend to do.

## Canonical distinctions

Define terms that must stay separate, such as:

- proposal vs intent
- intent vs execution
- policy check vs risk reflection
- app preview vs signer display
- local fixture vs deployed proof

## Expected outcome

Describe what is meaningfully usable when the phase is done.

## Milestone cadence

- `<x>.1` through `<x>.4`: build stops
- `<x>.5`: midpoint audit
- `<x>.6` through `<x>.8`: build stops
- `<x>.9`: closeout audit

## Planned artifacts

- implementation notes
- contracts, schemas, or interfaces
- tests or validation output
- midpoint audit at `<x>.5`
- closeout audit at `<x>.9`
- final phase closeout summary

## Recommended implementation shape

### Workstream `<x>.1`

**Files:**

- Create: `path/to/file`
- Modify: `path/to/file`

**Expected outcome:**

- describe what this stop lands

### Workstream `<x>.5`

**Audit artifact:**

- Create during implementation: `docs/audits/<phase>/<x>.5-midpoint-audit.md`

**Audit target:**

- describe what midpoint must prove

### Workstream `<x>.9`

**Audit artifact:**

- Create during implementation: `docs/audits/<phase>/<x>.9-closeout-audit.md`

**Audit target:**

- describe what closeout must prove
- include whether blocking findings remain before any commit or push

## Touchpoints

- docs to update
- contracts or schemas likely affected
- runtime modules likely affected
- demo surfaces likely affected
- audit artifacts likely affected
