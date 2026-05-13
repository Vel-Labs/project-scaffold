# LLM Provider Scaffold Baseline

Date: 2026-05-12

## Task Summary

Added a wiki page for the hAIre-me MiniMax M2.7 implementation guide and updated the project scaffold so copied projects have contract-first infrastructure for quickly adding LLM providers.

The scaffold change intentionally stops before live provider adapters. It provides schema, examples, docs, and readiness checks so adapters can be added in copied projects after local validation.

## Files Changed

Wiki:

- `70_Knowledge/llm-wiki/wiki/models/minimax-m2-7-implementation.md`

Project scaffold:

- `contracts/llm-provider-contract.md`
- `contracts/schemas/llm-provider.schema.json`
- `contracts/examples/valid/minimax-llm-provider.json`
- `contracts/examples/invalid/llm-provider-missing-secret-boundary.json`
- `docs/integrations/LLM_PROVIDER_INTEGRATION.md`
- `packages/core/src/llm-provider-readiness.ts`
- `packages/core/src/types.ts`
- `packages/core/src/index.ts`
- `packages/core/src/validate-contracts.ts`
- `tests/contracts/contract-corpus.test.ts`
- `tests/core/core-boundary.test.ts`
- `contracts/README.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/REPO_BOUNDARIES.md`
- `README.md`
- `ROADMAP.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- `DECISIONS.md`
- `docs/decisions/2026-05-12.md`
- `CHANGELOG.md`
- `docs/FILE_TREE.md`
- `docs/audits/2026-05-12-llm-provider-scaffold-baseline.md`

## Commands Run

```bash
npm run validate:contracts
npm run test:focused
npm run typecheck
npm run validate:scaffold
npm test
npm run check
```

## Validation Results

- `npm run validate:contracts`: passed with 3 schemas, 2 valid examples, and 2 invalid examples.
- `npm run test:focused`: passed with 2 files and 5 tests.
- `npm run typecheck`: passed.
- `npm run validate:scaffold`: passed after regenerating `docs/FILE_TREE.md`.
- `npm test`: passed with 2 files and 5 tests.
- `npm run check`: passed end-to-end.

## Assumptions

- "Add this to the wiki" means create a durable wiki page that cites the hAIre-me guide rather than copying the full source guide into raw intake.
- "Infrastructure in place" means scaffold-level contracts, examples, readiness helpers, tests, and docs, not a live MiniMax adapter.

## Remaining Risks

- The MiniMax wiki page is sourced from the local hAIre-me guide and was not refreshed against live MiniMax docs in this pass.
- The scaffold readiness helper checks local contract/runtime readiness only; provider-specific request signing, streaming, prompt caching, and artifact persistence remain downstream implementation work.
- Existing uncommitted scaffold edits to `AGENTS.md` and earlier `CHANGELOG.md` content were present before this pass and were preserved.
