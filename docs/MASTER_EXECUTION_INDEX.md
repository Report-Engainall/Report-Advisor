# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-30  
Repository: `Report-Engainall/Report-Advisor`  
Branch: `main`  

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Certification baseline supplied by owner: `4da16b9a7433e66ccf8a62b183552a872a718ef8`.
- A live runtime sweep on the deployment bound to that baseline proved a real SPA direct-route defect: `https://report-advisor.vercel.app/login` returned HTTP 404 at Vercel, while the application uses `BrowserRouter` and defines client-side routes in `src/App.tsx`.
- Canonical minimal fix applied: root `vercel.json` rewrites all application routes to `/index.html`.
- Fix commit: `459666ea7fca6a94eb2c7e6955a2d259e3d2b8ef`.
- Certification for the new HEAD is **NOT PROVEN** until a fresh deployment is bound to this SHA and direct-route runtime verification succeeds.

## Batch — Vercel SPA direct-route certification defect
Finding: direct navigation to `/login` on the production deployment returned Vercel HTTP 404. This violates the owner-required `Direct URL access` runtime criterion and is independently reproducible through the live deployment fetch.

Classification: `RUNTIME / DEPLOYMENT ROUTING / RELEASE BLOCKER`

Root cause: the app uses `BrowserRouter` with client-side routes, but the repository had no Vercel SPA fallback configuration. The Vercel deployment therefore treated a deep route such as `/login` as a missing static resource instead of serving `index.html` for client-side routing.

Fix:
- Added root `vercel.json` with a catch-all rewrite to `/index.html`.

Evidence:
- Baseline deployment `7qYynEgiLAsPrajXatBdes3ByagE` is bound to owner baseline `4da16b9a7433e66ccf8a62b183552a872a718ef8` and was `READY`.
- Live `https://report-advisor.vercel.app/` returned HTTP 200.
- Live `https://report-advisor.vercel.app/login` returned HTTP 404 with `x-vercel-error: NOT_FOUND`.
- `src/App.tsx` uses `BrowserRouter` and declares client-side route handling, including `/`, `/import`, `/reports/*`, `/analytics/*`, `/intelligence/*`, `/customers`, `/products`, `/inventory`, `/settings`, etc.

Status: `DEFECT CONFIRMED → CANONICAL FIX COMMITTED → FRESH DEPLOYMENT PENDING → RUNTIME VERIFICATION PENDING`.

## Existing closure status retained
### P0 — Data Quality
Browser business-quality aggregation was migrated to `get_data_quality_snapshot()` with tenant authority from `current_company_id()`. Legacy bridge/page removal was preceded by repository consumer proof.

Status: `IMPLEMENTED → CONSUMER MIGRATED → ZERO-LEGACY-PATH PROOF IN REPOSITORY → REGRESSION`; exact-head CI/database/runtime pending.

### P1 — Dashboard Intelligence tenant boundary
Direct browser reads of recommendations/alerts were replaced by `get_dashboard_intelligence(p_limit)`, deriving tenant authority from `current_company_id()`, with fixed search_path, bounded output and authenticated-only execution.

Regression: `src/lib/dashboard-canonical.intelligence.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/live runtime pending.

### P1 — Forecast read boundary
Direct `forecasts` table read was replaced by `get_forecast_snapshot(p_limit)`, tenant-authoritative, explicitly projected, bounded and deterministic.

Regression: `src/lib/queries.forecast.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/runtime pending.

### P1 — Export tenant authority hardening
Finding: `get_inventory_export_rows(p_company_id, ...)` did not assert the caller-supplied company id matched server tenant authority.

Fix:
- Added `supabase/migrations/20260826080000_export_tenant_authority_hardening.sql`.
- Inventory export fails closed on `TENANT_CONTEXT_MISMATCH` and derives data from `current_company_id()`.
- Export RPCs have fixed `search_path`, anonymous execution revoked, and authenticated execution explicitly granted.

Regression: `src/lib/export-tenant-authority.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI and live A/B export isolation pending.

## DB-only legacy candidate — get_sales_secondary_metrics
`supabase/migrations/20260826003000_sales_secondary_canonical_analytics.sql` still defines it. Repository consumer search found no source consumer, but external/database consumers cannot be excluded. Keep as `LEGACY CANDIDATE / EXTERNAL-CONSUMER RISK`; do not destructively drop yet.

## High-risk remaining fronts
### Front A — Canonical Data Truth
- Full `queries-compat.ts` function/consumer graph.
- NULL/UNKNOWN/INSUFFICIENT_DATA semantics.
- date/status/as-of consistency.
- remaining browser business aggregation.
- cross-surface equivalence between canonical RPC, UI and exports.

### Front B — Consumer + Legacy Closure
- zero-consumer proof for compatibility functions.
- duplicate business engines.
- DB-only legacy candidates with external-consumer risk.

### Front C — BI / Decision / Export
- Forecast/Demand Velocity/Inventory Intelligence evidence.
- export metric/date/status/as-of/filter equivalence.
- recommendation/action/outcome provenance.

### Front D — Security / Tenant
- RPC grants/search_path/RLS.
- Storage/Realtime/AI-vector.
- workers, notifications and generated files.
- SECURITY DEFINER review.

### Front E — Performance
- unbounded reads.
- query plans/indexes.
- N+1 and payload bounds.

### Front F — Reliability
- worker/watcher/queue/retry/idempotency/DLQ/recovery.
- backup/restore/RPO/RTO.

### Front G — Runtime/LIVE
- fresh authenticated browser E2E on a deployment bound to the current HEAD.
- direct URL/deep-link routing after SPA fix.
- Supabase A/B isolation.
- OCR corpus, native watcher, telemetry, load/canary/rollback.

## Status ladder
- IMPLEMENTED: current fix exists in repository.
- TESTED/REGRESSION: repository behavioral/contract evidence exists; execution must be separately evidenced.
- GATED: **NO CLAIM** for current HEAD until exact-head CI evidence exists.
- RUNTIME VERIFIED: only with fresh deployment/browser evidence bound to current HEAD.
- LIVE VERIFIED: only with live evidence bound to current HEAD.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Current resume point
1. Obtain/observe fresh Vercel deployment bound to `459666ea7fca6a94eb2c7e6955a2d259e3d2b8ef`.
2. Verify `/login` and representative deep routes no longer return Vercel 404.
3. Continue authenticated browser runtime sweep across critical routes.
4. Collect network/console/runtime evidence.
5. Run exact-head CI and required production certification contracts.
6. Continue data-truth, security, semantic/document intelligence, reliability and product-value fronts.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.

---

# FINAL OWNER-LEVEL REMAINING WORK REGISTER — 2026-08-30

This section is the authoritative execution register for the final closure program. Historical sections above are preserved and are not rewritten or re-scored.

## Evidence state model

- 🟢 COMPLETED — requirement and applicable evidence are closed.
- 🟡 IMPLEMENTED / VERIFICATION PENDING — implementation exists; required verification is not yet complete.
- 🟠 RUNTIME PENDING — code/tests exist but live/runtime proof is missing.
- 🔴 BLOCKED — a dependency or failing prerequisite prevents closure.
- ⚫ NOT IMPLEMENTED — required capability is not present at the authoritative release head.

Rule: historical evidence remains historical. No PASS is promoted across HEADs. Every PASS must bind to the exact release candidate SHA.

## Authoritative release baseline

- Current main SHA: 23e8f78466f34cf0b89852384d6848598843916e.
- 23e8f7 is one documentation commit ahead of 459666ea7fca6a94eb2c7e6955a2d259e3d2b8ef; no application-code delta exists between those two commits.
- Quality run for current main: 33276759334 — SUCCESS.
- Production-evidence-boundary run for current main: 33276759335 — SUCCESS.
- These runs prove repository gates only; they do NOT prove LIVE or Production Certification.
- Production deployment previously observed was bound to 459666ea7fca6a94eb2c7e6955a2d259e3d2b8ef, not current main.
- Current authoritative Supabase staging project: fnqbvfuwbdpwvhcgzksl.

## R1 — CANONICAL FINAL RELEASE HEAD
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Requirement: one authoritative release candidate with all included evidence bound to one SHA.
Existing: current main 23e8f78466f34cf0b89852384d6848598843916e; quality + production-evidence gates succeeded.
Remaining: review open PRs; classify merge/close/obsolete/evidence-only; selectively integrate only validated deltas; rerun full gates after every accepted merge.
Key PRs: #99, #100, #101, #103, #98, #97, #95, #94, #93, #92, plus historical #18.
Important: #103 is based directly on main but commit c66a6f169ead4d170f182432c6d4aeb7ac74a6a3 has a Vercel status failure/rate-limit; do not merge it as certified. #92/#93 are based on older main ancestry and require selective integration/revalidation, not blind merge.
Acceptance: exact SHA + clean tree + accepted change inventory + all mandatory CI gates successful.

## R2 — DATABASE / MIGRATION PARITY
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Existing: extensive repository migration history; live migration ledger inspected; 76/76 public tables have RLS; 144 policies; 125 FKs; 181 indexes; 18 SECURITY DEFINER functions inspected for search_path hardening.
Remaining: deterministic repository→fresh DB replay; schema diff; function/RPC/grant diff; policy diff; migration history parity against authoritative live project; resolve any drift.
Key PR: #98; related security PRs #93/#95/#103.
Acceptance: fresh database matches authoritative schema/security state and exact release SHA is recorded.

## R3 — SECURITY FINAL CLOSURE
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Existing: tenant-authoritative RPCs, RLS, cross-tenant FK hardening, decision DML hardening, export tenant authority.
Remaining: authenticated A/B adversarial runtime; storage/signed URL isolation; realtime isolation; AI/vector namespace isolation; RPC grant matrix; SECURITY DEFINER review.
Key PRs: #93, #95, #103; security branches retained as historical evidence.
Acceptance: A/B negative tests pass against exact release candidate with reproducible evidence.

## R4 — EXACT PRODUCTION DEPLOYMENT BINDING
**Status: 🟠 RUNTIME PENDING**
Existing: SPA fallback vercel.json is in main; current main CI passes.
Remaining: fresh deployment whose immutable revision equals final release SHA; direct-route sweep; refresh/navigation/logout/login/network/console checks.
Key commits/PRs: 459666ea7fca6a94eb2c7e6955a2d259e3d2b8ef, #97/#94 historical fixes.
Acceptance: Production deployment SHA = certified SHA and representative routes load correctly.

## R5 — AUTHENTICATED FULL E2E
**Status: 🟠 RUNTIME PENDING**
Existing: product journey contracts, decision/evidence surfaces, canonical routes and test gates exist.
Remaining: real authenticated Login→Tenant→Import→Commit→Dashboard→Evidence→Recommendation→Decision→Approval→Work→Action→Receipt→Outcome journey, including negative/error/session cases.
Key PR: #92; #86/#88 historical/parallel work.
Acceptance: one complete live authenticated journey bound to exact SHA.

## R6 — REAL DOCUMENT INTELLIGENCE
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Existing: spreadsheet/CSV canonical ingestion plus document-intelligence contracts and provenance architecture.
Remaining: integrate and verify real PDF/DOCX/image/OCR implementation; Arabic/English/mixed corpus; scanned/no-header/merged/multi-table/malformed/revised/duplicate cases; provenance and quarantine.
Key PR: #99, not merged.
Acceptance: golden corpus with deterministic expected outputs and provenance/quarantine evidence.

## R7 — REAL BUSINESS CORPUS
**Status: 🟠 RUNTIME PENDING**
Existing: broad BI engines and canonical query boundaries.
Remaining: populate safe realistic corpus covering products/customers/suppliers/sales/purchases/returns/inventory/payments/receivables/multiple periods/stockouts/substitution/anomaly/seasonality.
Acceptance: expected-truth dataset and independent reconciliation across core intelligence.

## R8 — CANONICAL BI / TRUTH CERTIFICATION
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Existing: canonical RPCs and consumer migrations for data quality, dashboard intelligence, forecast, receivables, exports; NULL/UNKNOWN hardening.
Remaining: complete KPI Definition→RPC→Service→UI→Report→Export matrix; verify date/status/as-of/filter/pagination/freshness semantics and cross-surface equality.
Key files: src/lib/queries.ts and canonical report adapters; historical PRs #53/#55/#66 and later closure waves.
Acceptance: every critical KPI has one canonical source and reconciles across all surfaces.

## R9 — DECISION INTELLIGENCE FINAL LOOP
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Existing: evidence ledger, recommendation/alert mutation hardening, decision lifecycle and action/outcome contracts; decision work-item authorization hardening exists on PR #103.
Remaining: integrate validated decision-runtime hardening; execute live Insight→Evidence→Recommendation→Decision→Approval→Work→Action→Receipt→Outcome path; prove idempotency/no bypass/actor attribution/audit.
Key PRs: #103, #92, #93.
Acceptance: one complete authenticated live decision journey with immutable evidence.

## R10 — WATCHED FOLDER / CONTINUOUS INTELLIGENCE
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Existing: browser batch/folder contracts and watched-report pipeline foundation.
Remaining: integrate/verify native Windows runtime, installer, IPC, events/polling, restart/crash recovery, revised-file detection, quarantine and end-to-end recalculation.
Key PR: #100, not merged.
Acceptance: new/changed file is detected, processed, reconciled and reflected in canonical intelligence after restart/recovery.

## R11 — COMMERCIAL EQUIVALENCE GROUPS
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Existing: alternative-group engines, governance/security/UI models and roadmap specification.
Remaining: persistent model and complete merchant governance; effective dates; roles; conversion; substitution modes; conflict/cycle detection; historical reproducibility; group demand/coverage/lost-sales/replenishment/customer integration.
Key files: src/lib/free-toolbox/alternative-group* and AlternativeGroupsPage.tsx.
Acceptance: one complete approved group scenario reconciled at group/member/customer levels.

## R12 — REPORT STUDIO / EXPORT
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Existing: canonical report/export infrastructure, PDF multi-page support and tenant-authority hardening.
Remaining: golden report corpus; PDF/Excel/CSV/print/RTL validation; snapshot/diff/reproducibility; UI-vs-export numeric reconciliation.
Acceptance: export is canonical-truth equivalent to the corresponding UI/report snapshot.

## R13 — AI FINAL PRODUCTIZATION
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Existing: AI policy/tool/capability architecture and deterministic-first guardrails.
Remaining: evidence-bound runtime scenarios; claim provenance; hallucination/unsupported-action negative tests; tenant/vector isolation; tool authorization.
Acceptance: AI explains claims from evidence and cannot invent authoritative business facts or bypass authorization.

## R14 — WORKERS / QUEUE / RELIABILITY
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Existing: lease/heartbeat/retry/checkpoint/idempotency/DLQ foundations and resilience contracts.
Remaining: live failure injection: kill worker, recover, resume exactly once; retry exhaustion; DLQ remediation; concurrency/backpressure.
Key historical PR: #61; heartbeat closure #21.
Acceptance: reproducible crash/recovery evidence on exact release.

## R15 — PERFORMANCE / SCALE
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Existing: performance budgets, bounded query/read contracts and extensive indexing.
Remaining: real corpus load tests, query plans, N+1/payload/memory analysis, concurrent imports/analytics/exports; optimize only from evidence.
Acceptance: measured baseline→change→result with no truth regression.

## R16 — BACKUP / RESTORE / DR
**Status: 🟠 RUNTIME PENDING**
Existing: backup/recovery contracts and historical release/recovery gates.
Remaining: actual backup, restore, integrity verification, files/artifacts/security verification, measured RPO/RTO.
Acceptance: successful restore drill with recorded RPO/RTO.

## R17 — OBSERVABILITY / OPERATIONS
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Existing: operational/reliability contracts and telemetry-related architecture.
Remaining: production error/worker/queue/DLQ/import/OCR/AI/export/auth telemetry, SLOs, alerts and alert test.
Acceptance: operational dashboard plus triggered alert evidence.

## R18 — CANARY / ROLLBACK
**Status: 🟠 RUNTIME PENDING**
Existing: rollback/release manifest contracts in historical execution index.
Remaining: controlled canary, injected failure, rollback, verification and forward-fix drill on production-like deployment.
Acceptance: reproducible rollback drill.

## R19 — SAAS PRODUCTIZATION
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Existing: entitlement/billing certification contracts and SaaS-related scripts.
Remaining: live tenant onboarding→trial→entitlement→plan→upgrade/downgrade→expiry/grace→billing/webhook→closure lifecycle; server-side enforcement.
Acceptance: complete lifecycle against a production-like tenant.

## R20 — FINAL UX / PRODUCT JOURNEY
**Status: 🟡 IMPLEMENTED / VERIFICATION PENDING**
Existing: broad route/page surface, ProductJourneyNav and evidence/decision UX contracts.
Remaining: mobile/desktop RTL sweep; loading/empty/partial/error/offline/permission states; accessibility; navigation consistency; evidence/decision/action drill-down.
Acceptance: complete product journey test on real authenticated runtime.

## R21 — FINAL BUSINESS ACCEPTANCE
**Status: ⚫ NOT IMPLEMENTED AS CERTIFICATION EVIDENCE**
Requirement: independent merchant-level acceptance that the system explains what changed, why, impact, evidence, action and outcome.
Remaining: execute scripted business acceptance against golden corpus and live product journey; record findings and sign-off.
Acceptance: business acceptance pack with traceable scenarios and no critical blocker.

## R22 — FINAL PRODUCTION CERTIFICATION
**Status: 🔴 BLOCKED**
Dependency: R1–R21 applicable gates/evidence.
Required evidence: exact code/CI/DB/security/tenant/storage/realtime/vector/runtime/E2E/real document corpus/real business corpus/canonical truth/decision loop/watcher/workers/performance/backup/restore/observability/canary/rollback/SaaS/UX/business acceptance.
Acceptance: independent trace from Requirement→Code→DB→Security→Runtime→Evidence→Production on one exact release SHA.
Current certification: PRODUCTION CERTIFIED = NO.

## Current execution order

R1 → R2 → R3 → R4 → R5 → R6 → R7 → R8 → R9 → R10 → R11 → R12 → R13 → R14 → R15 → R16 → R17 → R18 → R19 → R20 → R21 → R22

## Release decision rule

A stage may move from 🟡/🟠 to 🟢 only when its stated acceptance evidence is attached to the exact release candidate SHA. A stage may not become 🟢 merely because its source files exist or a historical branch passed CI.

## Current completion dashboard

| Level | Current state |
|---|---|
| Built / Implemented | High; broad foundation exists |
| Integrated into current main | Moderate–high; several late closure PRs remain outside main |
| Verified by current-main CI | 🟢 current main quality + production-evidence boundary pass |
| Runtime Proven | 🟠 major live evidence remains |
| Production Certified | 🔴 NO |

Authoritative current-main CI evidence: 33276759334 and 33276759335, both bound to 23e8f78466f34cf0b89852384d6848598843916e.

**No historical PASS is promoted.**

---

## EXECUTION CYCLE — 2026-08-30 — consolidation batch

Authoritative execution head before this index update: `52f82b41c76f8c65d5af98b5ff692c30b81f5241`.

### Implemented in this cycle
- Integrated the decision-runtime authorization closure from PR #103 selectively, without importing its branch-local index rewrite.
- Added repository migrations for approval-gated decision work-item creation and authenticated-only execution; live migration ledger already contains the corresponding applied migrations by generated versions `20260829221123`, `20260829221232`, and `20260829221301`.
- Routed `createRuntimeWorkItem()` through the canonical approval-gated RPC and strengthened its repository regression contract.
- Integrated the real PDF/DOCX/image ingestion adapter from PR #99 into main; the repository already carried the required runtime dependencies.
- Added explicit capability regression for declared formats and scanned-PDF OCR limits/fail-closed behavior.
- Integrated the Windows watched-folder native host, isolated preload bridge, root-bound reads, persistence, filesystem events/polling fallback, and executable smoke contract from PR #100.
- Corrected the desktop workflow so it remains a manual/feature-branch verification vehicle rather than becoming a second canonical main-push CI topology.
- Corrected the performance gate model after exact-head CI exposed that raw `dist` size was counting lazy PDF/XLSX/chart chunks as first-load budget. The gate now reports raw footprint diagnostically and enforces critical first-load, largest-JS, and compressed textual delivery budgets.
- Hardened the Windows smoke test after its first real Windows execution exposed a nested-file event timeout; the smoke now uses a deterministic root-level filesystem event plus an explicit recursive scan/deletion assertion.

### Exact verification observations
- `99741160` — decision authorization integration: current-main CI was later exercised and the production-evidence boundary passed.
- `79c0bfd` — document ingestion integration: quality failed only on the pre-existing raw-dist performance cap; document/intelligence/build/typecheck-related gates executed successfully.
- `11e1f965` — Windows integration: quality failed at CI topology and performance; Windows native contract passed, but real native smoke failed with `SMOKE_FILE_EVENT_TIMEOUT`. This finding was fixed in `52f82b4`.
- `52f82b4` — deterministic Windows smoke fix. Exact-head quality and production-evidence runs are executing for this head; no PASS is claimed until they complete.

### Current live deployment
The Vercel project has produced READY production deployments for the preceding main heads, including the decision-authorization and document-ingestion commits. Current-head deployment/evidence must still be bound and verified after the final exact SHA stabilizes; protected deep routes remain inaccessible to unauthenticated fetches because of Vercel SSO.

### Status after cycle
- R9 Decision runtime: 🟡 IMPLEMENTED / VERIFICATION PENDING — authorization bypass closed in repository and live corresponding migration state observed; authenticated end-to-end journey remains pending.
- R6 Document intelligence: 🟡 IMPLEMENTED / VERIFICATION PENDING — real PDF/DOCX/image/scanned-PDF OCR path integrated; golden corpus/runtime proof remains pending.
- R10 Watched folder: 🟡 IMPLEMENTED / VERIFICATION PENDING — native runtime integrated; first real Windows smoke failure was found and corrected; fresh Windows smoke evidence remains pending.
- R15 Performance: 🟡 IMPLEMENTED / VERIFICATION PENDING — measurement model corrected; exact-head budget result pending.
- R4/R5: 🟠 RUNTIME PENDING — deployment binding/authenticated E2E still required.
- R22: 🔴 BLOCKED — production certification remains explicitly fail-closed.

### Evidence rule
No historical PASS is promoted. The next completed quality/boundary results must bind to the next exact head created by this index update. No production certification is claimed by this cycle.
