# Governed Import Writer Gate — 2026-09-08

## Implemented

The canonical import path now has a dedicated tenant-safe database RPC `import_commit_batch_governed(...)` which validates resolution decisions before delegating to the existing transactional lineage-aware importer.

The gate requires:

1. authenticated tenant context matching `p_company_id`;
2. three JSON arrays with identical row counts;
3. every resolution outcome to be `new`;
4. every resolution to explicitly declare `action=write_new` and `allowedToWrite=true`.

Any `skip_exact`, `candidate_duplicate`, `conflict`, malformed payload, tenant mismatch, or count mismatch is rejected before the canonical write call.

## Staging verification

Applied to Staging project `fnqbvfuwbdpwvhcgzksl` as migration `import_resolution_governance`.

Verified function properties:
- `SECURITY INVOKER` (`prosecdef=false`)
- `anon` cannot execute
- `authenticated` can execute
- function definition contains explicit non-new and write-authorization gates.

## Boundaries

This closes the database gate, but does not claim that every existing frontend writer has already been migrated to call the new RPC. That downstream wiring and authenticated E2E are separate closure items.

Implementation migration SHA: `6e38fb34c65e2cdbbf0b703c312094e0705aa747`.
