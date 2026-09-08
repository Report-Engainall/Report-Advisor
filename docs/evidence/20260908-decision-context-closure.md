# Decision Context Closure — 2026-09-08

## Implemented

- Decision Experience now reads existing alternative groups through the tenant-safe `get_alternative_item_groups` read model.
- Existing `buildDecisionAlternatives` remains the single bridge for ranking and eligibility; no alternative master data is mutated.
- Decision Experience now reads persisted `source_analysis_snapshots` and offers only those saved snapshot IDs as execution/outcome evidence.
- Completing a work item is blocked in the UI when no persisted Evidence Snapshot is selected.
- Recording an outcome is likewise blocked when no persisted Evidence Snapshot is selected.
- Initial recommendation/proposal/decision selection is normalized against the freshly loaded datasets to reduce stale URL/state selection.

## Correction found during contract review

- `RuntimeDecision` now exposes the persisted `policy_key` that the Decision Experience renders, eliminating a TypeScript contract mismatch.
- Outcome attribution now sends the persisted `business_intelligence_decisions.id` as `decisionFingerprint`. This matches the canonical executive decision read model, which resolves `decision_outcomes` against `d.id::text`; the UI no longer writes a decision key that the executive read model would fail to attribute.

## Boundaries

- This is a source/UI implementation change; it is not authenticated browser E2E certification.
- No production runtime, Tenant A/B, backup/restore, rollback, or Vercel certification is claimed.
- No alternative is written, deleted, or silently promoted by the bridge.
- No evidence, impact, availability, demand, margin, or outcome values are invented.

## Exact implementation SHAs

- Decision context integration: `8cf449006c7dfa63f956cde69414678534fa6d6d`
- Runtime contract + attribution correction: `f020fab43e0133f47e7d38bcbfd4277779c30920`
- Decision Experience attribution fix: `1a4357822c3cf5a9d229383af45e107366d42a1f`
