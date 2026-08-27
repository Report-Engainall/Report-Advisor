# Parallel Closure Manifest

Baseline: `main` after PR #43.

## Active execution lanes

- canonical data-quality / tenant authority
- report metric truth / unknown-vs-zero semantics
- import / reconciliation reliability
- evidence / decision lineage
- worker / queue recovery
- watched-folder delivery
- backup / restore verification
- UI/runtime regression coverage

## Gate

No lane is considered complete from documentation alone. Each lane must leave an executable regression, pass exact-head CI, and obtain runtime evidence where the lane requires live behavior.

## Safety rule

Do not merge stale branches whose base predates the current `main`; rebase/rebuild the change on the current baseline first.
