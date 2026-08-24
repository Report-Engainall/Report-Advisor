# Report-Advisor implementation sequence

## Completed
1-21. Foundation, tenant/RLS security, import governance, report/decision ledgers, document intelligence A0.1-A0.5 foundations.
22. Operational file preview and reconciliation pipeline: canonical business-key detection, Arabic/Latin key normalization, new/updated/unchanged/conflict/error classification and order-independent preview fingerprint.
23. A0.3 hardening: evidence-fused schema intelligence, preamble-aware header discovery, OCR header correction, deterministic mapping ambiguity protection, relationship graphs, headerless reverse-schema inference and dataset classification.
24. A0.4 hardening: deterministic entity resolution, duplicate target-key conflict detection, reconciliation results and stable import fingerprints for idempotency primitives.
25. A0.4 review/quarantine contract: tenant/source-scoped review records with deterministic identity, explicit OPEN/APPROVED/REJECTED lifecycle and promotion guard.
26. A0.5 governed transactional routing contract: canonical routing decisions, tenant/source scope, idempotency key, quarantine/review state and commit/rollback guard.
27. A0.6 Onyx Pro canonical adapter: existing Onyx header catalog and adapter route recognized fields through canonical headers while preserving unknown headers and preventing empty-cell overwrite.
28. A0.7 golden dataset manifest: Arabic/English, scanned, random-schema, no-header, complex-table, invoice, Onyx and 30+ column cases with explicit accuracy readiness threshold.
29. Unified quality gates: schema/entity reconciliation, A0 hardening and golden dataset gates are registered in the authoritative Quality workflow.
30-37. Configurable demand horizon, explicit pack/weight normalization, unified decision policy, customer/SKU demand attribution, weighted group substitution, liquidity-aware replenishment, production readiness and unified production decision chain.

## Phase A0 — Document & Data Intelligence Engine — COMPLETED
A0.1 engine contracts and raw-data safety, A0.2 structured intermediate model, A0.3 schema intelligence, A0.4 validation/entity/reconciliation/review-quarantine, A0.5 governed transactional routing, A0.6 Onyx extensibility, and A0.7 golden datasets/quality gates are now represented by deterministic contracts and regression gates. No raw field is silently discarded and no weak/ambiguous mapping is silently promoted.

## Phase A — Trusted Report Execution
1. Complete server-side worker adapter around the existing report execution contract.
2. Queue scheduled report runs with tenant context and idempotency.
3. Claim jobs with leases; reject stale/duplicate claims.
4. Render saved semantic definitions to PDF/Excel/web artifacts.
5. Verify artifact integrity before delivery.
6. Persist immutable execution evidence and delivery receipts.
7. Add retry/backoff/dead-letter policy and operational visibility.

## Phase B — Usage & Entitlements
1. Aggregate usage by tenant and billing period.
2. Enforce capabilities and quotas server-side before expensive report/AI work.
3. Make entitlement decisions auditable and idempotent.
4. Add provider-neutral billing adapter boundary.
5. Add invoice/subscription lifecycle state machine.
6. Verify billing webhooks cryptographically and idempotently.
7. Add operator plan/capability controls.

## Phase C — Decision Automation
1. Convert scored decisions into explainable automation actions.
2. Require explicit approval for external side effects by default.
3. Carry tenant, decision fingerprint, evidence snapshot and idempotency key into every action.
4. Execute through the trusted automation executor only.
5. Add retry/backoff/dead-letter handling and immutable execution receipts.
6. Block execution when production readiness, calibration, confidence, liquidity or evidence gates fail.

## Phase D — Advanced Intelligence
1. Forecast backtesting against deterministic baselines.
2. Confidence/coverage/bias diagnostics.
3. Scenario and sensitivity simulation.
4. Outcome calibration linked to decision fingerprints.
5. Semantic caching with deterministic invalidation.
6. Local/offline analytical acceleration where it improves performance without weakening truth/security boundaries.

## Phase E — Production SaaS Certification
1. Cross-tenant negative tests for reads, writes, search, export, storage and retrieval.
2. Storage/RLS policy audit.
3. Realtime authorization audit.
4. AI retrieval namespace audit.
5. Backup/restore drill with recovery-point and recovery-time evidence.
6. Observability, SLOs, error budgets and alert routing.
7. Security and dependency review.
8. Production release certification and rollback drill.

## Release blockers
- Any cross-tenant read/write/search/export/retrieval.
- Client-side-only paid-feature enforcement.
- Unverified or non-idempotent billing webhooks.
- Worker without explicit tenant context and lease.
- AI retrieval without tenant namespace.
- Trial expiry that destroys customer data.
- Raw-file access from analytics/forecast/recommendation layers.
- Dropped or silently ignored source fields.
- Failed typecheck/lint/build or required contract gate.
- Critical field auto-approved without sufficient evidence.
- Reconciliation mismatch silently committed.
- Review/quarantine bypass.
- Transaction commit without explicit approval and READY status.
- Automation executor bypassing the unified decision chain.
- Replenishment exceeding protected liquidity.
- Production readiness blocker at release time.
