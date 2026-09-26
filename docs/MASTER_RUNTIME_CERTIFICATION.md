# MASTER RUNTIME / CERTIFICATION REFERENCE — الأغبري
Status: CANONICAL DOMAIN REFERENCE

## 1. Certification philosophy
Certification is evidence, not intention.

Exact SHA + exact target + exact execution + observed output are required.

## 2. Evidence classes
Static, Build, API, Browser, Business Persistence, Production, Resilience.

These classes never silently upgrade.

## 3. Release states
PASS / FAIL / BLOCKED / NOT PROVEN

Any unresolved release-critical gate stays closed.

## 4. Phase-F
Phase-F must prove live resilience:
- runtime identity
- authenticated canary
- logical source configuration
- backup
- restore
- measured RPO
- measured RTO
- rollback
- artifact integrity

Missing/invalid credentials are BLOCKED. Do not invent substitutes.

## 5. Deployment identity
A runtime gate must bind to:
- deployment ID
- exact Git SHA
- environment
- intended project
- intended backend/data target where applicable

READY is not authenticated product certification.

## 6. Browser E2E
Browser proof should cover:
- authentication
- tenant/company context
- canonical navigation
- unified import
- real persistence
- readback
- critical business action
- evidence/trust state
- no cross-tenant leakage

## 7. Regression discipline
Do not rerun closed tests unless SHA, environment, contract, or reproducible regression requires it.

When a new SHA fails, repair the first reproducible current-head failure before speculative broad edits.

## 8. Recovery discipline
Any recovery mutation requires:
- target proof
- authorization proof
- auditability
- governed recovery contract
- preservation of evidence

Do not terminalize unresolved processing jobs merely to make dashboards green.

## 9. Certification completion
Final certification is complete only when all release-critical gates are current, exact, attributable, reproducible or artifact-backed, and consistent with current code/test lineage.


## Execution closure — 2026-09-27 / predecessor 2714f1b86220b5fc4066908e101477f73587b843

- Exact functional candidate before this governance sequence: 2714f1b86220b5fc4066908e101477f73587b843.
- Exact-head check-runs observed: 54 total; 46 queued, 5 in progress, 3 skipped, 0 failures, 0 completed successes. Therefore exact-head PASS remains NOT PROVEN.
- Netlify and Cloudflare checks were materializing for the same SHA; no browser or production acceptance was inferred from in-progress checks.


## Execution closure — 2026-09-27 / predecessor 2d20e2a191982abb33f50c3f0bf742ef3a05a99e

- Runtime retry scope was narrowed to transport/RPC failure for dashboard intelligence; malformed successful payloads are not retried as if they were transient transport events.
- Exact-head checks on this candidate: 49 total, counts {"completed/skipped":3,"queued/null":45,"in_progress/null":1}, with 0 known failures at checkpoint time. No PASS transfer.
