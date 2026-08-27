# Deep Closure Wave — 2026-08-27

## Execution baseline
- Requested exact-head baseline: `407e6bb1e506a29ae35f741d5530400a3675b9a9` (PR #45).
- Exact-head quality Run `32928717071` failed at Typecheck; sibling workflows for that SHA succeeded. The failure was a real topology defect, not flaky CI.
- Root cause: PR #45 removed/invalidated the canonical `src/lib/queries.ts` surface while real consumers still imported it.
- Corrective PR #57: `fix/pr45-canonical-queries-restoration`, head `b3a8be73bfd11bdda8abd4d08c4094064543ab4b`. It restores the compatibility boundary without weakening tests.
- PR #57 currently has no associated workflow run observed yet; therefore its CI state is **PENDING**, not PASS.

## Active batch: Truth contracts
### Receivables
- Canonical server snapshot/RPC path exists and is tenant-scoped through `current_company_id()`.
- Cancelled/void invoices are excluded from the business truth.
- Missing total/paid values remain incomplete rather than being filtered into false zero.
- Missing due dates remain `UNDATED`.
- Display pagination is bounded; totals are server-derived.
- Status: **IMPLEMENTED / REGRESSION-GATED; EXACT-HEAD CI PENDING**.

### Profitability
- Canonical RPC `report_profitability_truth` derives tenant from `public.current_company_id()`.
- Cancelled/canceled/void invoices are excluded.
- Missing line_total, cost_price, or quantity marks the dataset `INSUFFICIENT_DATA`.
- Mixed currencies mark the result `INSUFFICIENT_DATA`.
- Missing revenue/cost cannot silently become financial zero.
- Canonical service `fetchProfitabilityTruth` consumes the RPC.
- Status: **IMPLEMENTED / REGRESSION-GATED; EXACT-HEAD CI PENDING**.

### Cross-surface truth
- Metric SSOT provides versioned metric contracts, dependency closure, and validation.
- Data lineage and export manifest are existing canonical anchors.
- A new gate scans major page surfaces for client-side business aggregation patterns.
- Status: **GATE ADDED; execution evidence pending**.

### Semantic NULL/UNKNOWN sweep
- A repository-wide static gate was added to detect likely missing/unknown→zero and financial/outcome missing→zero coercions.
- Known intentional dashboard compatibility behavior remains explicitly allowlisted pending semantic review.
- Status: **GATE ADDED; execution evidence pending**.

## New CI gate
`.github/workflows/deep-truth-closure.yml` runs on PRs to `main`, `wave/**` pushes, and manual dispatch. It enforces exact SHA identity before running Receivables, Profitability, financial-consumer, Dashboard, semantic-conversion, and cross-surface gates.

## Runtime / LIVE
- **NO RUNTIME EVIDENCE** for this wave yet.
- Authenticated tenant A/B drill, real Storage/Realtime/AI-vector isolation, real worker crash/restart, native watcher persistence, real document corpus, backup restore/RPO/RTO, production telemetry, production load/canary/rollback, and browser/native crypto matrix remain **LIVE REQUIRED**.

## Certification rule
No capability in this document is marked Runtime Verified, Live Verified, or Production Certified from static code/CI alone.
