# Customer identity fallback revalidation

**Date:** 2026-09-08  
**Branch:** `fix/folder-sync-universal-persistence`

## Finding

The previous identity-hardening evidence stated that customer `name` was a fallback when `code` was absent, but the implementation still returned only the first available identity field. That meant an uncoded customer could fail to resolve by name.

A second contract mismatch was also found: an existing product with the same SKU and changed content is a `conflict`, not `candidate_duplicate`.

## Corrective implementation

- `d198570a861db7e972e4672dde9257c2ebe023b2` — customer identity fields now preserve ordered fallback semantics; `identityKey()` iterates fields and returns the first non-empty identity value.
- `d9d07859ea8ec060f8ce35dcccecee724c5d9fd7` — universal intelligence contract corrected and expanded.

## Contract coverage added

1. Existing product identity + changed content => `conflict`.
2. Customer with code + changed name/phone => same identity, `conflict`.
3. Customer without code + same name + changed content => name fallback, `conflict`.
4. Customer without code + exact matching name/content => `skip_exact`.
5. A coded customer does not silently match a different coded customer merely because the name is shared.
6. Canonical DB fields continue to resolve against source mapped fields.

## Security boundary

This correction is client/source intelligence only. It does not grant write authority. The server-side tenant-scoped resolution and governed commit boundaries remain authoritative.

## Verification boundary

The source and contract were corrected through GitHub commits. The contract has **not** been represented as runtime PASS here because the current GitHub Actions runner failure occurs before job steps execute. Authenticated browser E2E, live Tenant A/B isolation, production runtime, backup/restore, rollback, and Vercel deployment remain uncertified.
