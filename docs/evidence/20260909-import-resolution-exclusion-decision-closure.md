# Import Resolution — Explicit Exclusion Decision Closure

Date: 2026-09-09
Branch: `fix/folder-sync-universal-persistence`

## Closed in this batch

The canonical import flow no longer treats every non-`new` resolution as a reason to abandon the entire import. Instead, the review stage now records an explicit exclusion decision for each non-new row.

### UI decision boundary

`ImportResolutionReviewPanel` now:

- receives row-level decisions keyed by the deterministic resolution fingerprint;
- exposes an explicit `استبعاد الصف` action for `skip_exact`, `candidate_duplicate`, and `conflict` rows;
- never exposes a UI action that converts a blocked row into a write;
- keeps the server-side write gate authoritative.

### Canonical Import behavior

`CanonicalImportPage` now:

- persists row decisions in page state;
- refuses commit while any non-new resolution lacks an explicit exclusion decision;
- selects writable rows strictly by the ordered `resolveRows()` result, where only `outcome === 'new'` can enter the canonical writer;
- records excluded rows in the import result summary;
- supports an all-excluded import as a completed zero-write job;
- records `partial` when a later batch fails after at least one batch has already committed;
- continues to finalize jobs through the tenant-scoped `import_finish_job` lifecycle function.

## Security / authority invariant

The UI decision is an exclusion/selection intent only. It does not grant write authority. The canonical writer and database server-truth gate remain the final authority and continue to reject non-new/conflicting writes.

## Contract evidence

`scripts/import-resolution-exclusion-contract.mjs` checks the decision callback, explicit exclusion requirement, new-only write selection, server-authority boundary, zero-write completion, and partial-failure semantics.

The contract file is committed in this branch. A runtime execution of the script is **not claimed** in this evidence because no local shell/runtime execution was available in this turn.

## Nonclaims

- No authenticated browser E2E PASS is claimed.
- No live Tenant A/B adversarial isolation PASS is claimed.
- No Production Runtime certification is claimed.
- Frozen RC and Production aliases were not modified.
