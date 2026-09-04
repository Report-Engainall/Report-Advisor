# Evidence Batch R6 — 2026-09-04

## Exact-head binding
- Base boundary: `46156969f506d7fb6c3c75fde419c6de76f6e14d`
- Branch: `repair/currency-analytics-truth-46156969`
- Exact candidate HEAD is the Git HEAD of this branch; this file deliberately does not embed its own commit SHA.
- PR #316: OPEN / DRAFT / NOT MERGED
- Certification: **NOT CERTIFIED**

## P1 internal closure
| Area | Result | Evidence status |
|---|---|---|
| Customer CRUD | create/edit/delete wired to tenant-scoped persistence | SOURCE READY + LIVE DB ADVERSARIAL |
| Product CRUD | create/edit/delete wired to tenant-scoped persistence | SOURCE READY + LIVE DB ADVERSARIAL |
| Duplicate customer code | normalized unique index | LIVE DB REJECTED |
| Invalid entity values | DB domain constraints | LIVE DB REJECTED |
| Wrong tenant entity mutation | RLS company guard | LIVE DB REJECTED |
| Viewer-role entity mutation | role-aware RLS | LIVE DB REJECTED |
| Refresh persistence | reload-after-save implemented | RUNTIME E2E REQUIRED |
| Recommendation outcome bypass | legacy writer could reach outcome before approved/completed work | **FIXED IN SOURCE + LIVE FUNCTION REPLACED; runtime positive chain still NOT PROVEN** |

The known `عميل جديد` / `منتج جديد` dead actions are no longer open findings. The UI now has real handlers, mutation functions, error surfacing and reload. Backend policies enforce tenant + active membership role. Legacy `wholesale` customer segment is preserved.

## Frontend action completeness
- Added `scripts/frontend-action-completeness-scan.mjs`.
- Added `frontend-action-completeness` PR workflow.
- Scanner checks empty handlers, unimplemented/mock markers and unwired button heuristics.
- Exact-head workflow result is not promoted until completion; queued/pending is never PASS.

## Business flow catalog
- **20 business flows BF-001..BF-020** are defined with complete oracle fields: input/action, expected UI, RPC/API, DB effect, business result, security, persistence, expected failure.
- Business E2E contract workflow is attached to the PR.
- Route opening is explicitly not treated as business-flow completion.

## Real report wrapper readiness
- Existing deterministic corpus: 7 production-shaped regression cases.
- New business wrapper manifest: **14 scenarios**.
- Required pipeline: `SOURCE -> UPLOAD -> PROCESS -> DB -> RECONCILIATION -> ANALYTICS -> UI -> EXPORT/EVIDENCE`.
- Required truth envelope: source, parsed, normalized, DB, RPC, analytics, UI, export, mismatches, security, persistence, evidence refs, exact HEAD.
- Automated truth comparator is ready; without runtime evidence JSON it reports READY rather than PASS.
- Runtime report execution remains **0 EXECUTED / 0 CERTIFIED PASS**.

## Currency / truth parity
- Financial source storage hardened: sales/purchase invoice currency is required, defaults to SAR, and must be normalized 3-letter uppercase.
- Live malformed/null storage probes rejected.
- Receivables RPC now fails closed on company/transaction currency mismatch.
- Analytics consumers fail closed for mismatch: profitability, purchase summary, secondary sales metrics, RFM, ABC, aging, dashboard.
- ABC schema drift is repaired to derive tenant scope through sales invoices.
- Mismatch and positive-path tests were executed in rolled-back transactions; no test fixture mutation persisted.

## RPC / DB parity
- Static frontend→migration RPC parity gate remains active.
- Live public functions: **65**.
- Authenticated-executable public functions: **44**.
- Public anon EXECUTE: **0**.
- SECURITY DEFINER: **33 total**; **20** authenticated-executable; **13** not authenticated-executable; **0** anon-executable.
- Live signatures and grants were re-audited; critical authenticated callable helpers inspected for auth/tenant/search-path/state guards.
- This is DB/static evidence, not authenticated browser certification.

## RLS attack matrix
- RLS-enabled public base tables: **81**.
- RLS-enabled tables without policy: **0 / 81**.
- Tenant A → Tenant B product read: **0 visible rows**.
- Tenant A → Tenant B customer read: **0 visible rows**.
- Forged company_id on product insert: **REJECTED**.
- Viewer-role product mutation: **REJECTED**.
- Cross-tenant export invocation: **REJECTED with TENANT_CONTEXT_MISMATCH**.
- `anon` SELECT privilege over public base tables: **0 / 81**.

## Import concurrency / retry readiness
- Progress counters reject null/negative/out-of-range values.
- Terminal completion requires `processed_rows == total_rows`.
- Import job progress/finish use row locks (`FOR UPDATE`).
- Product upsert locks normalized SKU identity and handles concurrent unique races.
- Full two-browser interruption/retry/crash drill remains runtime work; static/DB semantics are READY, not PASS.

## Recommendation / Decision / Evidence integrity
- Recommendation aliases `accepted -> approved`, `done -> completed`; authenticated EXECUTE only; tenant-scoped.
- Approval rejects self-approval and locks decision/approval state.
- Work creation requires an APPROVED decision and active tenant assignee.
- Work completion requires IN_PROGRESS, correct assignee and tenant-owned evidence.
- A deeper audit found the legacy `record_recommendation_outcome` writer could record an outcome based on provenance/evidence without enforcing APPROVED decision + COMPLETED work. This was an internal integrity bypass.
- **Repair:** `20260904210000_harden_recommendation_outcome_lifecycle.sql` now requires tenant/auth context, an APPROVED decision, a COMPLETED work item, and tenant-owned evidence before writing a recommendation outcome; anon EXECUTE is revoked and authenticated EXECUTE retained.
- Added `scripts/recommendation-outcome-lifecycle-contract.test.mjs` and attached it to `business-e2e-contract` CI.
- Live function replacement was applied successfully.
- Attempted simulated-auth direct invocation could not establish `auth.uid()`/tenant context through the SQL execution channel and therefore returned `TENANT_CONTEXT_REQUIRED`; this is classified **NOT PROVEN**, not PASS. The actual runtime chain remains blocked on authenticated browser credentials.
- Live staging integrity scan still has **1 legacy seeded recommendation without evidence** and **1 legacy seeded orphan decision outcome**. These remain explicit fixture debt and are not converted into a false production PASS.

## Security-definer audit
- 33 SECURITY DEFINER functions inventoried.
- 20 authenticated-executable; 13 not authenticated-executable; 0 anon-executable.
- All authenticated-callable functions have `search_path=pg_catalog` in the current inventory.
- Critical decision/recommendation/work/outcome writers reviewed for auth/tenant/state/evidence constraints.
- No cross-tenant exploit was proven; browser adversarial proof remains pending.

## Current CI boundary
- Exact candidate changed after the original R6 cut because the Master Index, recommendation-outcome migration, contract test, and workflow enforcement were committed.
- Therefore all prior CI PASS results are historical to their recorded SHAs.
- Current candidate CI must be observed independently. At the last poll immediately after the index commit, the new commit had not yet acquired PR workflow runs; the preceding exact head had a broad wave of queued/pending workflows. No queued/pending result is promoted.

## Browser / deployment
- Authenticated browser remains **BLOCKED / NOT PROVEN** because the required A/B runtime credentials are unavailable to the workflow.
- Current-head Vercel remains blocked by deployment rate limiting.
- Backup/restore and rollback drills require external operational access.
- Native Windows certification cannot be inferred from Linux CI.

## Internal exhaustion boundary
**Completed/repairable work executed in this wave:** customer/product CRUD wiring, domain/RLS hardening, frontend action scan, 20-flow business oracle, 14-scenario report wrappers, truth comparator, financial currency hardening, analytics fail-closed semantics, static RPC parity, import lifecycle guards, recommendation status contract, recommendation/decision/evidence state-machine hardening, SECURITY DEFINER review, RLS adversarial probes, and Master Index lineage reconciliation.

**Still NOT PROVEN internally or requiring runtime/ops evidence:** full frontend action runtime persistence, full RPC live signature parity against every frontend call, complete critical-resource browser attack matrix, two-worker import crash/retry/idempotency drill, realtime event-loss/reconnect drill, full report upload/OCR/import journey, evidence→decision→work→outcome runtime chain, current-head Vercel runtime, backup/restore/rollback, and Windows-native certification.

## External blockers
- GitHub Actions A/B runtime credentials: the workflow requires `REPORT_ADVISOR_SUPABASE_URL`, `REPORT_ADVISOR_SUPABASE_ANON_KEY`, `REPORT_ADVISOR_E2E_USER_A_EMAIL`, `REPORT_ADVISOR_E2E_USER_A_PASSWORD`, `REPORT_ADVISOR_E2E_USER_B_EMAIL`, and `REPORT_ADVISOR_E2E_USER_B_PASSWORD`; secret values are not written to source/evidence.
- Current-head Vercel deployment rate limit.
- Auth control-plane leaked-password protection.
- Backup/restore and rollback operational access.
- Native Windows runtime/certification environment.

## Certification impact
**NOT CERTIFIED.**

The internal P1 surface has been pushed further: a genuine legacy outcome-integrity bypass was found and hardened. No PASS is claimed for the full runtime chain until real authenticated execution supplies browser, DB, network, persistence, and exact-head evidence.
