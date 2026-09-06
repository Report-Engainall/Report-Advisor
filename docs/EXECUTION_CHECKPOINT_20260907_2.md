# Execution Checkpoint — 2026-09-07 / Batch 2

## Protocol
`1` resumed from the prior GitHub checkpoint. No closed work was restarted. This batch expanded the Worker/report-execution regression boundary with multiple independent controls and registered them as executable package scripts.

## Changes pushed
1. `scripts/check-report-execution-security-definer-boundary.mjs`
   - audits Worker + Recovery migrations;
   - requires explicit `p_company_id`;
   - requires tenant predicate;
   - requires hardened `SECURITY DEFINER` search path.
2. `scripts/check-report-execution-lease-state-machine.mjs`
   - checks admission states and attempt increment;
   - lease-token creation and fencing;
   - row locking for checkpoint transition;
   - strict sequential checkpoint progression;
   - rendered prerequisite for completion;
   - dead-letter convergence at attempt exhaustion;
   - bounded retry state.
3. `package.json`
   - registers five executable report-execution regression commands: runtime admission, evidence boundary, tenant isolation, security-definer boundary, and lease/state-machine boundary.

## Source verification
The active Worker migration explicitly uses tenant-bound `p_company_id`, tenant predicates, `SECURITY DEFINER` with `search_path to 'pg_catalog'`, lease owner/token fencing, `FOR UPDATE` checkpoint admission, rendered completion, exhausted-attempt dead-lettering, and service-role-only execution. These facts were inspected at the exact active candidate. fileciteturn62file0

The runtime-admission and evidence-boundary regression files are present at the active candidate and contain the expected assertion sets. fileciteturn59file0 fileciteturn60file0

## Evidence boundary
- Static/source verification: PASS for the inspected contracts.
- Executable CI result for the newest post-change HEAD: **PENDING / not yet observed**.
- No operational certification claim is made from source inspection.

## Current branch
- Branch: `fix/runtime-provenance-20260906`
- Current HEAD after this checkpoint: `4e9d58ebd00c6d376f46dbb04bb39eb79d10006f`
- PR #348 remains open and mergeable; not merged.
- Frozen RC and Production aliases remain untouched.

## Next `1`
Resume from `4e9d58ebd00c6d376f46dbb04bb39eb79d10006f`. First obtain executable CI status for the exact HEAD; then move to the next independent high-value release gate (authenticated current-head E2E/A-B isolation, migration parity, OCR golden runtime, or import/reconciliation runtime) without repeating these Worker contract checks unless evidence changes.
