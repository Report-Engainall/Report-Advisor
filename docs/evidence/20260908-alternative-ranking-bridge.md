# Alternative ranking bridge — 2026-09-08

## Delivered

- Added a tenant-safe read boundary `get_alternative_item_groups(integer)` for authenticated callers.
- The RPC resolves the tenant from `current_company_id()` and returns only the current tenant's active/inactive alternative groups and members.
- Product metadata is joined by the same tenant and SKU; no cross-tenant product lookup is permitted by the query predicates.
- Added a deterministic ranking model in `src/lib/alternative-ranking.ts`.
- Ranking is based only on persisted facts: product active state and conversion-factor proximity to 1.0. No stock, price, availability, demand, or margin is invented.
- Governance-ready learning adjustment is bounded to ±0.15 and requires at least 3 observed outcomes. Without a qualifying signal the adjustment is exactly zero.
- Added `src/lib/alternative-queries.ts` to expose the ranked alternative read model to the application.

## Safety

- No alternative master data is mutated by this batch.
- No recommendation, decision, approval, task, or outcome is auto-created.
- No production alias or frozen release candidate was changed.
- Learning is not applied to an alternative merely because a recommendation has learning history; attribution must be explicit before a non-zero learning adjustment is allowed.

## Verification boundary

Staging migration application succeeded. The direct SQL session has no authenticated tenant context, so an authenticated browser E2E read is still required before declaring the runtime path PASS.

## Next bridge

Wire the ranked alternative read model into the Recommendation → Alternatives → Decision stage and carry the selected alternative as traceable decision evidence. Then bridge the resulting decision/outcome chain into the executive report read model without bypassing approval gates.
