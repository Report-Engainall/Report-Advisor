# Gross Profit Truth Execution Ledger — 2026-08-26

Append-only record for the P0 Gross Profit closure. Historical findings are not rewritten or promoted by later green runs.

## GP-001 — Independent oracle fixture error
- HEAD: `3dd4c7ef938af678b90ba94f7f5e49791bafe793`
- FIND: Independent fixture expected cost 90 / GP 90 for a multi-line invoice set.
- ROOT CAUSE: Fixture arithmetic was wrong; A-1 cost is 80 and A-2 cost is 30.
- FIX: Oracle corrected to revenue 180, cost 110, quantity 6, GP 70.
- REGRESSION: Independent Gross Profit truth regression passed.
- CI: `32952831857` caught the prior failure; subsequent exact-head execution confirmed the corrected oracle.
- CLASSIFICATION: REGRESSION-PROVEN.

## GP-002 — Repository typecheck contract drift
- HEAD range: `5eb8395be4b57d0afc0eddc3a631fb9c5ad2287d` through `a91e68b01beab46017cab7f59084b01d85389849`
- FIND: Repository-wide typecheck exposed stale report-execution contracts, missing decision-score type, browser File System API typing drift, and test-runner files being compiled by the application tsconfig.
- ROOT CAUSE: Contract drift and incorrect app/test compilation boundary.
- FIX: Restored `DecisionScoreInput`; aligned checkpoint/runner/coordinator with current Phase-K/L APIs; scoped application typecheck to application sources and ES2023; corrected File System API narrowing and product/import type contracts; preserved NULL semantics in Executive UI.
- REGRESSION: Exact-head CI typecheck is rerun per resulting HEAD; no prior SHA is reused as evidence.
- CLASSIFICATION: FIXED LOCALLY; exact-head CI for the newest HEAD remains the governing certificate.

## GP-003 — Financial contract boundary
- HEAD: `bbd4363e9f0444ca3bd3555c82459a0b7d4bc11e`
- FIND: `sales_invoices` exposes subtotal/discount/tax/total but the inspected schema does not prove the arithmetic invariant that derives total.
- ROOT CAUSE: Missing database-level invoice arithmetic invariant.
- DECISION: Gross Profit revenue remains one `sales_invoices.total` per approved invoice; no second discount subtraction.
- TAX CLASSIFICATION: BUSINESS CONTRACT REQUIRED for accounting treatment beyond the product's stated total semantics. No tax semantic is invented.

## GP-004 — Currency comparability
- HEAD: `664b68a428e3c7858f62bfa68ba31403a11a0631`
- FIND: Gross Profit/export aggregation did not explicitly guard mixed invoice currencies.
- ROOT CAUSE: Currency was not propagated into the canonical truth contract or export artifact.
- FIX: Canonical truth and export now propagate invoice currency and return `INSUFFICIENT_DATA` for missing/mixed currency rather than summing incomparable monetary values.
- REGRESSION: Existing independent oracle remains separate from production code; a currency-specific regression extension remains to be added because the write operation was blocked by the tool safety gate and therefore no false PASS is claimed.
- CLASSIFICATION: IMPLEMENTED; REGRESSION-PROVEN = NOT PROVEN for the new currency branch.

## GP-005 — Runtime certification blocker
- REQUIRED external inputs: `CERT_SUPABASE_URL`, `CERT_SUPABASE_ANON_KEY`, `CERT_TENANT_A_ID`, `CERT_TENANT_B_ID`, `CERT_USER_A_JWT`, `CERT_USER_B_JWT`.
- FIND: Phase-E runtime receives these values empty.
- ROOT CAUSE: External GitHub Actions secret availability/configuration, not a repository query fallback.
- REQUIRED OWNER ACTION: populate the six repository Actions secrets without exposing their values.
- UNBLOCK CONDITION: Phase-E receives non-empty values and can execute authenticated tenant A/B certification.
- CLASSIFICATION: EXTERNAL BLOCKER.

## Current unproven items
- Authenticated Dashboard runtime.
- Independent Reports runtime (Reports currently shares the Dashboard KPI consumer).
- Executive runtime certification.
- Real XLSX artifact with 25 rows while presentation page is 20.
- Cross-surface numeric equivalence.
- Tenant A/B runtime isolation.
- Runtime date-boundary proof.
- Runtime NULL semantics proof.
- Regression for the newly added currency guard.

No item above is promoted to PASS by static implementation evidence.