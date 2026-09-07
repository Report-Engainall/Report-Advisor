# Migration Provenance Repair — 2026-09-07

## Finding
Two source migrations previously shared the Supabase migration version prefix `20260819210000`:

- `20260819210000_executive_metrics.sql`
- `20260819210000_inventory_demand_liquidity.sql`

They contain distinct SQL and were introduced together by historical commit `387fb232f2b6eb831f0d7e07080d06ac1191b80a`.

## Live-history check
A direct read of Staging project `fnqbvfuwbdpwvhcgzksl` confirmed that no migration ledger entry exists in the range `20260819000000` through `20260820000000`. Therefore neither duplicate version was live-applied under `20260819210000`.

## Forward-only repair
The inventory/liquidity migration was moved out of the active migration namespace by creating the unique-version path:

`supabase/migrations/20260819210100_inventory_demand_liquidity.sql`

The new file has the **same blob SHA** as the former duplicate file:

`ecc234c8e08b737e9c6b99d591ef94b3547f15e0`

The old duplicate path was then removed from the active migration directory. This is a forward repair of an unreleased source collision; no historical Git commit was rewritten and no live migration ledger was repaired or mutated.

## Safety boundary
- The executable SQL content was not edited.
- No destructive database reset was used.
- No `supabase_migrations.schema_migrations` row was changed.
- The existing fail-closed duplicate-version audit remains in place.
- Fresh replay/schema-integrity verification is mandatory before claiming migration parity.

## Remaining closure
The duplicate-version blocker is resolved at the current source-tree boundary, but full source↔live parity across all 185 live migration records remains OPEN. Closure still requires authoritative comparison/replay provenance and fresh schema verification on the exact candidate.
