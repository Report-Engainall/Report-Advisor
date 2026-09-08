# UI Async State / Rejection Audit — 2026-09-08

## Scope

Static audit of `src/pages/*.tsx` for user-facing asynchronous operations that can fail without an explicit rejection path.

## Guard

`scripts/check-ui-async-state-contract.mjs`

The guard covers:

- fetch calls started from `useEffect` that use `.then(...)` without `.catch(...)` or an enclosing `try` path;
- direct async click handlers that await work without an explicit rejection path;
- async action functions that await work without an explicit rejection path.

## Confirmed source findings from current main

The current source contains at least these patterns requiring closure:

1. `src/pages/IntelligencePage.tsx` — `RecommendationsPage.handleAction` awaits `updateRecommendationStatus(...)` without a local failure state or catch. A failed accept/reject/complete action can therefore leave the UI unchanged while the user receives no actionable feedback.
2. `src/pages/IntelligencePage.tsx` — `ForecastsPage` loads forecasts with a promise chain that has no rejection path. A failed request can leave the screen in its loading state.
3. `src/pages/ReportsPage.tsx` — purchase/inventory report loaders use promise chains with catch, but their retry path falls back to `window.location.reload()` rather than the local loader. This is functional but unnecessarily destructive to UI state and session continuity.
4. `src/pages/ReportsPage.tsx` — report export actions are asynchronous and must continue to use the centralized visible export-error handling already introduced for currency/session failures; the durable worker must not be exposed to the browser.

## Policy

These are UX/runtime defects, not reasons to weaken backend financial or tenant guards. Error handling must preserve fail-closed behavior and must not convert unavailable financial truth into fabricated values.

## Boundary

This audit does not certify authenticated E2E, tenant isolation, production runtime, backup/restore, rollback, or durable worker consumption. Those remain separate certification gates.
