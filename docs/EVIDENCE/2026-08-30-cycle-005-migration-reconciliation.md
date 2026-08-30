# CYCLE-005 — live migration reconciliation

Start main SHA: `20f352bf8291653ab21f8325b98a3d6e328a9acc`
Branch: `cycle-005/migration-reconciliation`

## Finding
PR #98's forensic matrix identified 21 production-applied migration versions after the 2026-08-29 baseline. Seven were recovered/reconstructed into CYCLE-003; fourteen remained unrecovered.

## Action taken
Instead of copying an unverifiable historical SQL body, CYCLE-005 reconstructs the observed live financial/decision invariants from the current Supabase catalog in `20260830040000_reconcile_live_financial_decision_invariants.sql`.

The reconstruction covers:
- sales and purchase invoice nonnegative/currency invariants;
- sales and purchase item nonnegative amount/quantity invariants;
- payment positivity, currency, date, and direction invariants;
- inventory movement/balance quantity, cost, and temporal invariants;
- decision confidence/evidence/approval/execution invariants;
- approval/work-item/outcome temporal and evidence invariants;
- recommendation outcome/evidence invariant.

A second migration, `20260830040001_verify_reconstructed_invariants.sql`, fails closed if the expected target tables or constraints are absent. This prevents a fresh replay from silently skipping the reconstructed coverage.

## Provenance rule
These migrations are explicitly **RECONSTRUCTED FROM LIVE STATE**, not claimed to be byte-for-byte historical recovery. The distinction remains permanent in the evidence ledger.

## Remaining unrecovered work
The exact historical source for the remaining migration family is still not claimed. Fresh-environment equivalence remains un-certified until the full migration chain is replayed and independently verified.
