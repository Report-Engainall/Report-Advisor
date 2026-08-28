# W2.1 Consumer Migration Plan — Semantic Metrics

Goal: prove migration by execution path, not by registry metadata alone.

| Consumer | Current Path | Target Path | Migration Required | Evidence | Test | Status |
|---|---|---|---|---|---|---|
| Dashboard | dashboard-canonical.ts snapshot/KPI queries | semantic metric registry → deterministic execution → dashboard projection | YES | trace each KPI to metricId/version | consumer runtime + metric regression | PARTIAL |
| Reports | ReportsPage.tsx + dashboard/report query boundaries | Report Intelligence Model fed by semantic metric outputs + evidence refs | YES | report snapshot contains metric versions/evidence | report projection + snapshot replay | PARTIAL |
| ChatBI | Intelligence/Chat surfaces + query layer | question → semantic metric resolution → deterministic query → validation → response | YES | request/metric/version/result provenance | ChatBI semantic execution | PARTIAL |
| Forecast | queries.ts forecast records / ForecastsPage.tsx | forecast consumes governed metric/time-series inputs and records model/version | YES | metric input versions + forecast model version | forecast reproducibility/backtest | PARTIAL |
| Recommendations | queries.ts recommendation records / RecommendationsPage | recommendation consumes semantic metrics + evidence + governed rule version | YES | recommendation dependency/evidence references | recommendation regression | PARTIAL |
| Decision Engine | Executive command center + decision/intelligence paths | decision consumes semantic metrics + evidence + policy/routing contracts | YES | decision → metric/evidence/rule provenance | decision evidence regression | PARTIAL |

## Non-acceptance rule

A registry consumers array is NOT proof of consumer migration.

A consumer becomes INTEGRATED only when its runtime path resolves canonical metric identity/version, executes through the canonical deterministic boundary, and preserves provenance into its output.

## Migration order

1. Dashboard KPIs
2. Reports / Report Intelligence projection
3. Recommendations
4. Decision Engine
5. Forecast
6. ChatBI

## Required evidence per consumer

consumer output → metricId/version → source/evidence → tenant scope → test result.

Until runtime evidence exists, status remains PARTIAL, never COMPLETE.

## Current finding

The registry declares the six consumers, but repository inspection shows active consumers still read established query/snapshot paths. Therefore W2.1 consumer acceptance remains HOLD pending runtime migration proof.
