# Master Execution Index — Append-Only Cycle 015→017 Ledger

This file is an append-only extension to `docs/MASTER_EXECUTION_INDEX.md`. Historical index content is intentionally not rewritten.

## CYCLE-015
- Start HEAD: `9c449b548d3feedbe8f55d54d652cb73287b1abd`
- Workstream: decision/recommendation/alert lifecycle mutation boundary.
- Discovery: `src/lib/decision-automation/vertical-slice-runtime.ts` directly inserted into lifecycle-sensitive tables.
- Fix: tenant-authoritative RPCs; authenticated direct INSERT revoked; real consumer migrated; fail-closed regression guard added.
- Staging evidence: authenticated INSERT denied on recommendations, business_intelligence_decisions, alerts.
- Defect discovered during verification: SECURITY DEFINER RPCs initially retained default PUBLIC EXECUTE.
- Follow-up fix: public/anon EXECUTE revoked; authenticated-only grants restored.
- PR: #122
- Merge SHA: `775e1f81be6b3785e4c90ab1f3a30f10d6cd85d4`
- PR quality: SUCCESS run `2429` on PR head `5cdcb29a13ba45d3a4114d3942ce912705831205`.

## CYCLE-016
- Start HEAD: `775e1f81be6b3785e4c90ab1f3a30f10d6cd85d4`
- Workstream: recommendation outcome mutation boundary.
- Discovery: `src/lib/analytics/outcome-feedback.ts` directly upserted `recommendation_outcomes`.
- Fix: `record_recommendation_outcome` RPC; authenticated INSERT/UPDATE/DELETE/TRUNCATE revoked; consumer migrated; PR-gated regression guard added.
- Staging evidence: authenticated direct mutation denied; RPC EXECUTE granted; SECURITY DEFINER ACL has no PUBLIC/anon execution.
- PR: #123
- Merge SHA: `37e6e46f06ccea72bc6946c67d3162dbd4662e40`
- PR quality: SUCCESS run `2430` on PR head `ab0abf2dfe03f3edd21ac185e86abe364c8cab14`.
- Exact merged-head CI: not yet proven by the available commit-run query; do not promote PR evidence to merge-head certification.
- Deployment status: Vercel status failure is `build-rate-limit`; external blocker.

## CYCLE-017
- Start HEAD: `37e6e46f06ccea72bc6946c67d3162dbd4662e40`
- Workstream: recommendation outcome provenance/truth invariants.
- Discovery: CYCLE-016 RPC boundary preserved tenant authority but did not enforce application-level evidence provenance and known-outcome value completeness at the database boundary.
- Fix: `record_recommendation_outcome` now requires `evidence_snapshot_id`; positive/negative/neutral outcomes require expected and actual impact; decision reference remains same-tenant only.
- Regression: existing outcome DML boundary workflow extended with provenance guard.
- Staging evidence: hardened RPC applied; function ACL is `postgres`, `authenticated`, `service_role` only; no PUBLIC/anon execution.
- PR: #124 (open at ledger append time).

## Cross-cycle security evidence
- Staging `SECURITY DEFINER` inventory after CYCLE-016/017: no PUBLIC or anon ACLs on inspected SECURITY DEFINER functions.
- Staging lifecycle table mutation check: authenticated direct mutation is denied for recommendation outcomes and CYCLE-015 lifecycle tables.
- Storage/RealtIme live checks: no repository/runtime usage currently found; staging has no configured storage buckets/policies, so these remain unproven rather than falsely certified.

## Remaining work delta after CYCLE-017
- Closed: three client-side lifecycle DML bypass classes (recommendation/decision/alert creation; recommendation outcome persistence) plus outcome provenance gap.
- Closed: default PUBLIC/anon execution exposure introduced by CYCLE-015 was detected and corrected before production promotion.
- Still open: exact-head CI on merged HEADs; authenticated A/B runtime; live business corpus reconciliation; document corpus runtime; Windows watcher lifecycle; backup/restore; deployment binding; production certification.
