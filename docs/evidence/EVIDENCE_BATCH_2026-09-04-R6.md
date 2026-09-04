# Evidence Batch R6 — 2026-09-04

## Exact-head binding
- Base boundary: `46156969f506d7fb6c3c75fde419c6de76f6e14d`
- Branch: `repair/currency-analytics-truth-46156969`
- **Exact HEAD for this batch: `eed54413cd511baef2f4495f4745e055f16518e0`**
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

The known `عميل جديد` / `منتج جديد` dead actions are no longer open findings. The UI now has real handlers, mutation functions, error surfacing and reload. Backend policies enforce tenant + active membership role. Legacy `wholesale` customer segment is preserved.

## Frontend action completeness
- Added `scripts/frontend-action-completeness-scan.mjs`.
- Added `frontend-action-completeness` PR workflow.
- Scanner checks empty handlers, unimplemented/mock markers and unwired button heuristics.
- The new exact-head workflow run was observed as queued before this evidence cut; therefore its result is **NOT PROVEN** until completed. No queued state is promoted to PASS.

## Business flow catalog
- **20 business flows BF-001..BF-020** are defined with complete oracle fields: input/action, expected UI, RPC/API, DB effect, business result, security, persistence, expected failure.
- Business E2E contract workflow is attached to the PR.
- Route opening is explicitly not treated as business-flow completion.

## Real report wrapper readiness
- Existing deterministic corpus: 7 production-shaped regression cases.
- New business wrapper manifest: **14 scenarios**.
- Required pipeline: `SOURCE -> UPLOAD -> PROCESS -> DB -> RECONCILIATION -> ANALYTICS -> UI -> EXPORT/EVIDENCE`.
- Required truth envelope: source, parsed, normalized, DB, RPC, analytics, UI, export, mismatches, security, persistence, evidence refs, exact HEAD.
- Automated truth comparator is ready; without a runtime evidence JSON input it reports READY rather than PASS.
- Therefore report runtime execution count remains **0 EXECUTED / 0 CERTIFIED PASS** in this batch.

## Currency / truth parity
- Financial source storage hardened: sales/purchase invoice currency is required, defaults to SAR, and must be normalized 3-letter uppercase.
- Live malformed/null storage probes rejected.
- Receivables RPC now fails closed on company/transaction currency mismatch.
- Existing analytics consumers remain fail-closed for mismatch: profitability, purchase summary, secondary sales metrics, RFM, ABC, aging, dashboard.
- ABC schema drift is repaired to derive tenant scope through sales invoices.
- Mismatch and positive-path tests were executed in rolled-back transactions; no test fixture mutation persisted.

## RPC / DB parity
- Static frontend→migration RPC parity gate remains active.
- Live public functions: **65**.
- Authenticated-executable public functions: **44**.
- Public anon EXECUTE: **0**.
- SECURITY DEFINER: **33 total**; **20** are authenticated-executable with structural auth/tenant identity + secure search-path evidence; **13** are not authenticated-executable; **0** have anon EXECUTE.
- This is DB/static evidence, not authenticated browser certification.

## RLS attack matrix
- RLS-enabled public base tables: **81**.
- RLS-enabled tables without policy: **0 / 81**.
- Tenant A → Tenant B product read: **0 visible rows**.
- Tenant A → Tenant B customer read: **0 visible rows**.
- Forged company_id on product insert: **REJECTED**.
- Viewer-role product mutation: **REJECTED**.
- Cross-tenant export invocation: **REJECTED with TENANT_CONTEXT_MISMATCH**.

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
- Outcome recording requires approved decision + completed work + tenant-owned evidence and rejects duplicate observation identity.
- Live staging integrity scan found **1 legacy seeded recommendation without evidence** and **1 legacy seeded orphan decision outcome**. These are retained as explicit fixture debt; they are not converted into a false production PASS.

## CI at the latest exact boundary
The latest code/test commit changed the exact HEAD to `eed54413cd511baef2f4495f4745e055f16518e0`. Prior fresh CI wave on `71f13e6151e36833694e606fd70aa527b7615846` had these observed states: contract workflows queued, Windows desktop in progress, some Windows/decision jobs pending. Those results do **not** certify the new exact HEAD.

Fresh CI for the final exact HEAD must be observed separately. PASS from an older SHA is invalidated by the later commits.

## Browser / deployment
- Authenticated browser remains **BLOCKED / NOT PROVEN** because the required A/B runtime credentials are unavailable to the workflow.
- Current-head Vercel remains blocked by deployment rate limiting.
- Backup/restore and rollback drills require external operational access.
- Native Windows certification is external/in progress and cannot be inferred from Linux CI.

## Definition-of-done boundary
**Internal executable work completed in this wave:** CRUD repair, domain/RLS hardening, frontend action scanner, business-flow oracle, report wrapper manifest, truth comparator, financial currency storage hardening, receivables currency gate, static RPC parity, import lock/retry readiness, recommendation/decision invariant review, and evidence integrity scan.

**Still not proven:** fresh CI on the final exact HEAD, real authenticated A/B browser execution, real report upload/OCR/import through the product UI, full evidence→decision→work→outcome runtime chain, realtime/recovery/logout-relogin browser evidence, current-head deployment, backup/restore/rollback drill, and native Windows certification.

## Certification impact
**NOT CERTIFIED.**

The project has moved from a known internal P1 dead-action gap to a substantially prebuilt business-E2E boundary. The next available runtime must start directly at real authenticated business execution; no new smoke-test design phase is required.
