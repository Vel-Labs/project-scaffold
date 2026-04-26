# Architecture

## System goal

`<PROJECT_NAME>` exists to `<STATE_PROJECT_GOAL>`.

## Core thesis

`<ONE_SENTENCE_THESIS>`

## Architecture planes

### 1. Contract or schema plane

Owns machine-readable truth.

### 2. Core runtime plane

Owns reusable business logic.

### 3. Integration plane

Owns vendor, protocol, service, or external-system adapters.

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
