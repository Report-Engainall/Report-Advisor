# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION TRUTH — 2026-09-01

This index is authoritative for execution state. Historical PASS is never promoted across SHAs. Certification requires exact-head evidence.

### Current candidate
- Repository: `Report-Engainall/Report-Advisor`
- PR: **#294 — OPEN / NOT MERGED**
- Base: `main`
- Current execution head: `0f0d8458ee35857961920e713312968ace9c9ff5`
- Exact-head CI is required after every source/workflow mutation; no final PASS is claimed until that exact SHA is verified.

### Completed worker lifecycle hardening
1. Added `check-worker-lifecycle-guards.mjs` covering heartbeat, checkpoint, completion, failure, and retry invariants.
2. Added `check-worker-lease-expiry.mjs` for expired-lease rejection.
3. Added `check-worker-service-role-boundary.mjs` for SECURITY DEFINER and execution grants.
4. Added `check-worker-tenant-isolation.mjs` for `current_company_id()` tenant scoping.
5. Added `check-worker-terminal-state-guards.mjs` for terminal-state and bounded-retry transitions.
6. Wired all five regression checks into `package.json`.
7. Recorded the exact execution head and evidence boundary in this index.

### Active closure tracks
- P0-A Authenticated Runtime
- P0-B Tenant A/B
- P1-C Production Runtime
- P1-D Recovery
- P1-E Documents/OCR
- P1-F Import/Reconciliation
- P1-G Workers
- P2-H Performance
- P2-I Operations/UX
- P2-J Acceptance

### Execution rule
Only committed, reproducible, repository-visible changes and exact-head evidence count as completed work. Inspection, analysis, queued CI, and historical PASS do not count as completion.
