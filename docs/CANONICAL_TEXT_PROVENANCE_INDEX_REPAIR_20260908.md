# Canonical Text Provenance FK Index Repair — 2026-09-08

## Finding

The tenant-bound composite foreign keys on `canonical_text_provenance` were live in Staging without covering composite indexes. Performance Advisor reported both FK paths as unindexed.

## Repair

Added partial indexes covering `(company_id, file_id)` and `(company_id, folder_id)` for non-null provenance references.

The same forward-only migration is now recorded in repository history so fresh replay can reproduce the verified Staging shape.

## Verification boundary

Staging Performance Advisor was rechecked after the live repair and the two unindexed-FK findings disappeared. This does not certify fresh migration replay, Production Runtime, or Authenticated E2E.

No frozen release candidate or Production alias was mutated.
