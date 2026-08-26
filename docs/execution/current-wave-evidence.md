# Current Wave Evidence — PR #45

Snapshot: 2026-08-26
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`
Current exact code HEAD: `f2c417c701c029a3ee46f2f19714ce063abb849a`

## Batch: Canonical query + Inventory + Receivables truth

### FIND
- `@/lib/queries` still resolved to the removed compatibility module even though canonical exports were already present.
- `/inventory` had an unbounded query/browser aggregation consumer despite an existing server-side inventory snapshot contract.
- `/reports/receivables` used page-limited invoices for the detail surface while total outstanding/aging came from a separate query path, leaving cross-layer truth unproven.
- Quality topology previously certified PR merge refs rather than the branch code SHA.

### ROOT CAUSES
- Compatibility removal stopped at source migration but not TypeScript path-resolution topology.
- Inventory route migration had not crossed the UI route boundary.
- Receivables lacked a single server-side snapshot contract combining business metrics with display pagination.
- CI workflow topology did not provide an independently observable exact-head certification run for wave branches.

### FIXES
- `tsconfig.app.json` maps `@/lib/queries` directly to `src/lib/queries.ts`.
- `queries-compat.ts` remains absent; canonical query closure guard prevents resurrection.
- `/inventory` routes to `InventoryPageCanonical`, backed by `report_inventory_snapshot` server aggregation and bounded display pagination.
- Added `report_receivables_snapshot` with tenant authority from `current_company_id()`, cancelled/void exclusion, explicit `UNDATED`, server-side aging/total metrics, and bounded page output.
- Added `receivables-truth.ts` adapter and `ReceivablesReportPageCanonical`; `/reports/receivables` now uses the canonical snapshot route.
- Added `check-receivables-truth-contract.mjs` and wired it into quality CI.
- Quality workflow runs on `main` and `wave/**`; diagnostics require checkout SHA to equal `GITHUB_SHA`.
- CI topology guard was updated to permit `wave/**` exact-head certification while keeping `quality.yml` as the only canonical main push gate.

### REGRESSION
- Canonical query guard checks compatibility absence, canonical alias target, canonical exports, inventory route migration, receivables route migration, and required receivables migration/adapter presence.
- Receivables contract checks tenant authority, cancelled/void semantics, `UNDATED`, server aggregation, bounded pagination, and rejects missing financial inputs being coalesced to zero.

## Exact-head CI
- PR merge-ref run `32928998300` is **FAILURE** but is not exact-head evidence for the current code; it checked merge ref `0bf408645b52affaa0d44255db907497ffe158c8`, and failed its legacy topology assertion because the workflow had been expanded to `main + wave/**`. This was a real topology failure and was fixed.
- Current HEAD `f2c417c701c029a3ee46f2f19714ce063abb849a` currently has **no observable GitHub status/check run through the available status surface**. Therefore it is **NOT CI-CERTIFIED** and no PASS is claimed.

## Runtime / LIVE
- Inventory large-dataset pagination, Receivables large-dataset pagination, real tenant A/B isolation, worker crash/recovery, Storage/Realtime/AI/vector isolation, and production telemetry remain **LIVE REQUIRED** where applicable.
- No Runtime or Production certification is claimed from static code or CI contracts.

## Legacy remaining
- `EntityPages.InventoryPage` is still present as a legacy implementation candidate but is no longer the active `/inventory` route. It must be removed only after an explicit zero-consumer proof and regression confirmation.
- `ReportsPage.ReceivablesReportPage` remains a legacy implementation candidate but is no longer the active `/reports/receivables` route. It likewise requires zero-consumer proof before removal.

## Certification
- IMPLEMENTED: yes for the above code changes.
- REGRESSION-ENFORCED: yes for canonical-query and receivables contracts.
- CONSUMER-VERIFIED: route-level migration verified statically; legacy source candidates remain.
- EXACT-HEAD CI: **NOT VERIFIED / NOT OBSERVABLE** at current HEAD.
- RUNTIME-EVIDENCED: no.
- LIVE-VERIFIED: no.
- PRODUCTION-CERTIFIED: **NO**.
