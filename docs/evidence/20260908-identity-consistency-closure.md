# Identity Consistency Closure — 2026-09-08

## Scope
Resolver → canonical writer → tenant-scoped existing-row lookup.

## Changes
- `src/lib/file-engine/universal-intelligence.ts` (`eb7111298e3645144a513afa2b6899b62cb9fb9a`): deterministic identity is authoritative. If an identity key exists but no matching existing row exists, resolution is `new`; it no longer falls through to fuzzy matching. Customer identity remains ordered `code → name`.
- `src/lib/import/canonical-commit.ts` (`0948e2d7a3ffee58d526c85ee33372541422c233`): customer existing-row lookup now queries both code and name independently and merges the results, so mixed batches cannot lose uncoded customer name-fallback candidates.
- `scripts/check-universal-intelligence-contract.mjs` (`5e29d5db323cabb06c497bd73b2c6da420423303`): regression coverage added for coded-customer same-name isolation and uncoded name fallback.

## Contract
- Products: `sku` is the deterministic identity.
- Customers: `code` is authoritative when present; `name` is fallback only when code is absent.
- Sales invoices: `invoice_number` is the deterministic identity.
- Deterministic identity mismatches do not become fuzzy duplicates/conflicts.
- Exact matches remain `skip_exact`; same identity with changed fields is `conflict`.

## Verification boundary
GitHub branch `fix/folder-sync-universal-persistence` currently points to `5e29d5db323cabb06c497bd73b2c6da420423303`.

Automated workflow discovery for this commit returned no workflow runs. Vercel currently reports a Team/Injaz configuration boundary rather than a code build result. Therefore this document does **not** claim authenticated E2E, live tenant isolation, or production certification.

Frozen RC / production aliases were not modified by this closure batch.
