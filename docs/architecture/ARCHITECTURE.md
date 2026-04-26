# Architecture

## System goal

`<PROJECT_NAME>` exists to `<STATE_PROJECT_GOAL>`.

## Core thesis

`<ONE_SENTENCE_THESIS>`

## Architecture planes

`REPO_PROFILE.json` is the machine-readable taxonomy for these planes, read-first routing, commands, and downstream scope boundaries.

### 1. Contract or schema plane

Owns machine-readable truth.

Current location: `contracts/`.

This plane owns lifecycle, schemas, examples, and fail-closed rules. It is canonical over implementation packages and tests.

### 2. Core runtime plane

Owns reusable business logic.

Current location: `packages/core/`.

This plane consumes `contracts/` and exposes executable enforcement helpers. It must not redefine canonical truth.

### 3. Integration plane

Owns vendor, protocol, service, or external-system adapters.

Status: downstream. Do not start adapters or provider integrations before the contract/core quality gate is stable.

### 4. User or operator surface

Owns presentation and user interaction.

### 5. Evidence and audit plane

Owns logs, receipts, test fixtures, audit outputs, and reproducible proof.

## Critical lifecycle

```text
input
  -> validation
  -> planning
  -> policy or rules check
  -> action preparation
  -> execution
  -> receipt
  -> audit
```

## Fail-closed laws

Define what must block execution or promotion when evidence is missing.

Baseline fail-closed laws live in `contracts/fail-closed-rules.md` and are enforced through `packages/core/` plus `tests/`.
