# PROGRAMMER EXECUTION REPORT — Calculation Capability Closure
Date: 2026-10-06

## Exact state
- CURRENT MAIN HEAD at start: a6d034e05172189d278e689eb01a0c86454f529e
- FINAL BRANCH HEAD: 87816c13fbdb51dde06bfb0eb44755c54f272663
- BRANCH: feat/calculation-capability-engine-20261006
- PR: #850
- BASE HEAD: a6d034e05172189d278e689eb01a0c86454f529e
- Main unchanged by this execution.

## Root gap closed
The prior runtime had archetype intelligence wired around legacy findings while the requested calculation layer was not a single governed capability source. The execution added a unified registry and wired it into runReportArchetype() so multiple calculations can coexist instead of first-finding-only behavior.

## Files changed
- src/lib/report-intelligence/calculation-capability-registry.ts
- src/lib/report-intelligence/archetype-registry.ts
- src/lib/report-intelligence/calculation-persistence.ts
- src/lib/report-smart.ts
- supabase/migrations/20261006030000_report_intelligence_calculations.sql

## Calculations added
The registry currently governs row count, distinct entities, duplicate rate, completeness, numeric outlier rate, amount sum/average/median/min/max, first-vs-last change, acceleration, top-5/top-10 share, inventory stock/zero/negative/value/coverage, fulfillment, receivables outstanding, gross margin, and linear forecast.

Each result carries availability state, sample size, usable sample, source fields, evidence, confidence and limitation.

## Critical semantic repair
Inventory source fields such as صافي المبيعات / net_sales are treated as sales quantity in inventory context and are not silently mapped to monetary netAmount. For the real inventory report, monetary metrics therefore remain NOT_AVAILABLE.

## Real report used
- SOURCE: تقارير ادارية.xlsx
- REPORT JOB: 16709d80-e012-40ef-9c12-6fd8255897f8
- SOURCE HASH: sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313
- SOURCE ROWS: 332
- Evidence status from the report context: VERIFIED / READY
- Evidence Passport: 35f86b87-918e-4353-b0a8-6d8d003b04db

## Real calculation proof
The calculation engine reproduced:
- row count = 332
- distinct products = 332
- total stock = 23075
- zero stock rows = 128
- negative stock rows = 15
- stock-to-sales-quantity ratio = 0.0712

And correctly produced:
- amount.sum = NOT_AVAILABLE
- inventory.stock.value = NOT_AVAILABLE

No synthetic monetary field was introduced into the source proof.

## Persistence / readback
Added public.report_intelligence_calculations with:
- report job lineage
- source hash
- evidence snapshot/passport
- archetype/profile version
- formula and availability state
- nullable value
- sample/confidence/evidence/limitation
- tenant RLS
- unique lineage constraint

Real database readback proof for the exact job/source/archetype:
- 8 rows persisted
- 6 CALCULATED
- 2 NOT_AVAILABLE
- lineage_intact = true

The application path now calls calculate -> persist -> read back and downgrades to REVIEW_REQUIRED when persistence/readback is not verified.

## Verification
- TypeScript: PASS
- 48-archetype runtime contract: PASS
- Production build: PASS
- Build warnings remain for Browserslist freshness, Bluebird eval, and an existing CSS minifier warning; no build failure.
- git diff --check: PASS
- Browser business proof on this exact head: NOT_PROVEN
- Real-source 48/48 semantic matrix: NOT_PROVEN
- Final certification: NOT_COMPLETE
- SALE READY: NOT CLAIMED

## Current exact next action
Run the authenticated full-product browser flow against FINAL BRANCH HEAD 87816c13fbdb51dde06bfb0eb44755c54f272663 and verify that Smart Report reads the persisted calculation rows for the same reportJobId/sourceHash/evidence lineage. Close only the first terminal browser/runtime failure, then continue to the remaining capability gaps.