# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Repository: `Report-Engainall/Report-Advisor`
Branch: `data-quality-authoritative-snapshot`
PR: `#43`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Current code/test HEAD: `e32ee56fac01893777ea1e34b82f738aa53a5553`.
- Exact-head CI certification: **NOT CLAIMED** until a run/check is observed for this exact SHA.
- Runtime/LIVE/production certification: **NOT CLAIMED**.

## Batch — Export completeness / page-vs-dataset closure
Finding: report pages render bounded UI pages (sales/purchases 20 rows; inventory 25 rows) while export must represent the canonical dataset rather than the currently displayed page.

Root cause: export correctness depends on the canonical export-row RPC path and must be protected against regression to UI-row mapping.

Fix:
- Added `scripts/check-export-completeness-contract.mjs`.
- The guard proves the real report consumers call canonical export adapters rather than mapping UI page arrays directly.
- The guard proves all four canonical export RPCs have hard maximums and fail closed with `EXPORT_TOO_LARGE` instead of silently truncating.
- Wired the guard into `quality.yml`.
- Changed quality concurrency grouping to workflow/ref/event so stale runs can actually be cancelled.

Consumer state: `ReportsPage.tsx` sales, purchases, inventory, and receivables export handlers consume canonical export adapters.

Legacy state: no page-export implementation is removed because the current handlers already use canonical adapters; the regression prevents reintroduction of page-based export.

Regression: `scripts/check-export-completeness-contract.mjs` is now part of the quality chain.

Exact-head CI: pending/not observed for `e32ee56fac01893777ea1e34b82f738aa53a5553`; no PASS claimed.

Remaining LIVE evidence: authenticated export execution, tenant A/B isolation, large-corpus export, memory/payload behavior, and production download verification.

Certification state: `IMPLEMENTED → REGRESSION → GATED (pending exact-head evidence)`.

## Existing partial families
### Invoice page-read tenant/security closure
Tenant resolution, explicit company predicates, bounded page sizes and deterministic ordering implemented; adversarial regression exists. Exact-head/runtime/live pending.

### P0 Data Quality
Canonical tenant-authoritative snapshot implemented; legacy browser bridge removed after repository consumer proof. Exact-head/database/runtime pending.

### Dashboard Intelligence tenant boundary
Tenant-authoritative dashboard intelligence RPC and regression implemented; exact-head/live pending.

### Forecast read boundary
Bounded tenant-authoritative forecast snapshot implemented; exact-head/runtime pending.

### Export tenant authority hardening
All four canonical export RPCs have tenant authority checks, fixed search_path, anonymous execution revoked and authenticated execution granted; live A/B isolation pending.

### DB-only legacy candidate — get_sales_secondary_metrics
Still defined in migration; no repository consumer found, but external/database consumers cannot be excluded. Keep as `LEGACY CANDIDATE / EXTERNAL-CONSUMER RISK`; do not destructively drop yet.

## Parallel remaining fronts
- Canonical Data Truth: queries-compat consumer graph, NULL/UNKNOWN semantics, date/status/as-of consistency, remaining browser aggregation.
- Consumer/Legacy Closure: zero-consumer proof, duplicate engines, DB-only legacy risk.
- BI/Decision/Export: cross-surface equivalence and filter/date/as-of equivalence.
- Security/Tenant: RPC grants/search_path/RLS, Storage, Realtime, AI/vector, workers, notifications and generated files.
- Performance: unbounded reads, query plans/indexes, N+1 and payload bounds.
- Reliability: worker/watcher/queue/retry/idempotency/DLQ/recovery, backup/restore/RPO/RTO.
- Runtime/LIVE: authenticated E2E, Supabase A/B isolation, OCR corpus, native watcher, telemetry, load/canary/rollback.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- TESTED/REGRESSION: repository behavioral/contract evidence exists.
- GATED: no claim for current HEAD until exact-head CI evidence exists.
- CONSUMER VERIFIED: only where consumer evidence is explicit.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Continue independent fronts without waiting for CI: cross-surface BI/Decision/Export truth, NULL semantics, tenant/security sibling discovery, reliability drills, and performance bottleneck discovery. Exact-head CI is a certification barrier, not a reason to pause independent work.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
