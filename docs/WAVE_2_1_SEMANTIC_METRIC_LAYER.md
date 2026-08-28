# Wave 2.1 — Semantic Metric Layer

## Purpose
Establish one governed semantic registry over the existing `BUSINESS_METRICS` calculation SSOT. This wave does not change production, database state, release certification, or PR #75.

## Contract
Each registry entry exposes:

- `metricId`, key, label, description
- deterministic formula and source lineage
- dimensions and dependencies
- version and owner
- certification status
- time semantic and freshness contract
- consumers: dashboard, reports, ChatBI, forecast, recommendations, decision engine
- tests and evidence references

The registry deliberately reuses `src/lib/semanticMetrics.ts` rather than duplicating metric formulas.

## Acceptance boundary
This wave is **foundation-level**, not end-to-end certification. Persistence, runtime consumer migration, report composition, evidence graph traversal, and production evidence remain subsequent acceptance stages.

## Verification
Run:

```bash
npm run test:semantic-metric-registry
```

Then the normal typecheck/build/CI gates. No database migration is introduced by this foundation wave.
