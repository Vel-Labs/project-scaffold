# Code Quality Standards

## Primary rule

Readable code wins.

`<PROJECT_NAME>` is a security-adjacent authority system. A clever implementation that future contributors cannot inspect is a liability.

## File size guidance

- Under 300 lines: preferred.
- 300-400 lines: acceptable when cohesive.
- 400-500 lines: justify and consider extraction.
- Over 500 lines: treat as a hotspot requiring extraction or written justification.

This is guidance, not dogma. A schema file, generated file, or intentionally centralized registry may be larger when purpose-driven.

## Comments

Comments should feel human.

Good comments explain:

- why a boundary exists
- what can go wrong
- what is intentionally not supported
- what a future maintainer should not break

Bad comments merely repeat the line below them.

## Naming

Prefer names that reveal authority and state:

- `proposedIntent`
- `verifiedIntent`
- `policyHash`
- `resolvedAgentIdentity`
- `degradedSignerStatus`
- `executionReceipt`

Avoid names that hide authority:

- `data`
- `payload`
- `doIt`
- `magic`
- `handleEverything`

## Interfaces

Interfaces should be narrow:

```ts
resolveAgentIdentity(name): ResolvedAgentIdentity
loadPolicy(pointer): AgentPolicy
createIntent(goal, policy): ProposedIntent
signIntent(intent): SignedIntent
executeIntent(intent, signature): ExecutionReceipt
```

## Error handling

Fail closed when authority is unclear.

- unknown policy: block
- unknown signer: block
- unknown executor: block
- missing receipt: degraded
- signer display uncertainty: warn visibly

## Tests

Keep shared tests under `tests/` so the local quality gate is easy for humans and agents to run.

Contract tests must consume `contracts/` directly. They should not redefine schemas, examples, lifecycle states, or fail-closed rules inline.

Prefer deterministic tests for:

- intent hash stability
- policy hash stability
- nonce reuse rejection
- deadline expiry
- executor mismatch
- signer mismatch
- <IDENTITY_INTEGRATION> resolution fallback
- audit artifact shape

Baseline commands:

```bash
npm run validate:scaffold
npm run validate:contracts
npm run test:focused
npm test
npm run typecheck
npm run check
```
