# Canonical Text Provenance FK Index Repair — 2026-09-07

## Finding

After the watched-report provenance hardening added tenant-bound composite foreign keys on `canonical_text_provenance`, Staging Performance Advisor identified both new composite FK paths as unindexed:

- `(company_id, file_id)`
- `(company_id, folder_id)`

These are real query-planning risks for tenant-bound provenance lookups and FK maintenance.

## Repair

Staging was repaired with two partial composite indexes:

- `canonical_text_provenance_company_file_idx`
- `canonical_text_provenance_company_folder_idx`

Both index only non-null provenance references.

The repository now carries the same forward-only migration so a future replay reproduces the live schema instead of silently reintroducing the drift.

## Verification

Post-repair Performance Advisor no longer reports the two unindexed canonical-provenance foreign keys. Remaining unused-index INFO findings are pre-existing/usage-dependent and were not removed blindly.

No production alias, frozen release candidate, or production data was mutated by this repair.
