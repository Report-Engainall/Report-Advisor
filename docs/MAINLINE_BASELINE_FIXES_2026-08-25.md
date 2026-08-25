# Mainline Baseline Fixes — 2026-08-25

## Scope

This change closes two concrete baseline defects identified by the Phase 8/9 CI run without creating parallel architecture or replacing existing sources of truth.

## Fixes

### 1. ESLint dependency declaration

`eslint.config.js` already depends on the `globals` package. The package was already represented in the lockfile, but was missing from the root `package.json` devDependencies. The manifest now declares `globals` using the existing locked range (`^15.9.0`) so clean CI installs remain deterministic.

### 2. Dashboard category breakdown export

`DashboardPage.tsx` and `ReportsPage.tsx` imported `fetchCategoryBreakdown` from `src/lib/queries.ts`, but the function was missing. The canonical query layer now exports `fetchCategoryBreakdown()` using the existing relational model:

`sale_items → products → categories`

The implementation aggregates sales, cost-derived profit, and quantity by category and keeps uncategorized products visible as `غير مصنف` rather than silently dropping them.

No new table, duplicate metric engine, or alternate data source was introduced.

## Safety

- No financial schema changes.
- No RLS changes.
- No tenant boundary changes.
- No import engine changes.
- No AI/provider changes.
- No paid provider introduced.
- Existing dashboard/report consumers remain the source of presentation truth.

## Verification policy

The changes are committed to `phase-8-9-completion`. Runtime CI must be used for final PASS/FAIL evidence; no local test result is claimed by this handoff.
