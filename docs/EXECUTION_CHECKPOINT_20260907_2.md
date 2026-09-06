# Execution Checkpoint — 2026-09-07 / Batch 2 — Correction

## Protocol
`1` resumed from the latest GitHub state. No closed work was restarted. This batch materially expanded the Worker/report-execution regression boundary and wired it into Quality.

## Changes pushed
1. `scripts/check-report-execution-security-definer-boundary.mjs`
   - audits Worker + Recovery migrations;
   - enumerates all six canonical Worker lifecycle RPCs;
   - requires explicit `p_company_id` and tenant predicates;
   - requires hardened `SECURITY DEFINER` + `search_path to 'pg_catalog'`;
   - checks attempt increment, fresh lease token, owner/token fencing, row locking, source-hash immutability, sequential checkpoints, rendered completion, dead-letter convergence, bounded retry;
   - checks explicit removal of legacy signatures;
   - checks end-user revocation and `service_role` execute grants.
2. `.github/workflows/quality.yml`
   - adds a dedicated `Report execution security and lease boundary` gate executing the two Worker regression contracts already registered in `package.json`.

## Source verification
The exact active Worker migration contains explicit `p_company_id` tenant predicates, `SECURITY DEFINER` with `search_path to 'pg_catalog'`, lease owner/token fencing, `FOR UPDATE` checkpoint admission, source-hash immutability, rendered-only completion, exhausted-attempt dead-lettering, bounded retry, legacy-signature drops, and service-role-only grants.

## CI evidence boundary
The immediately preceding HEAD `36b27eb657bcd8c6506ca1715ea57275fb1c9a73` produced a broad set of completed workflow failures. The available GitHub job payloads exposed no steps/logs (for example `ci-bootstrap-smoke` job `101576704062`), so the connector cannot establish a failing command or code defect from those runs. No PASS is inferred from missing logs, and no operational certification is claimed.

## Current exact state
- Branch: `fix/runtime-provenance-20260906`
- Current HEAD after this correction: `071782a2661f15d59f774d12be701c1c99e9ad02`
- PR #348 remains open and mergeable; not merged.
- Frozen RCs and Production aliases remain untouched.

## Open production gates
Authenticated current-head E2E; live Tenant A/B isolation; production runtime; backup/restore; rollback; OCR/document golden-corpus runtime; live worker crash/retry/DLQ/recovery.

## Next execution point
Resume from `071782a2661f15d59f774d12be701c1c99e9ad02`. Prefer the next independent high-value release boundary; do not repeat these Worker checks unless source or evidence changes.
