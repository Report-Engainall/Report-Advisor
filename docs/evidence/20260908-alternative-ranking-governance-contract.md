# Alternative ranking governance contract — 2026-09-08

## Scope

Locked the executable contract for the Alternative → Decision learning boundary.

## Contract coverage

- Fewer than 3 observed outcomes cannot activate a learning adjustment.
- A qualified positive signal applies at most +15%.
- A qualified negative signal applies at most -15%.
- A mixed signal applies no learning adjustment.
- The raw learning status remains visible for explainability even when governance prevents activation.
- Final score is deterministic: base score plus the governed adjustment.
- The ranking engine consumes persisted candidate attributes; it does not synthesize stock, demand, price, margin, or availability.

## Evidence

- Contract: `scripts/alternative-ranking-governance-contract.mjs`
- Implementation under test: `src/lib/alternative-ranking.ts`
- The contract is designed to run with the repository's explicit Node TypeScript-stripping CI pattern.

## Certification boundary

This is a source-level regression contract, not authenticated browser/E2E certification. Tenant A/B isolation, production runtime, backup/restore, rollback, and production alias binding remain independently un-certified until their operational evidence exists.

No frozen RC or production alias was mutated.
