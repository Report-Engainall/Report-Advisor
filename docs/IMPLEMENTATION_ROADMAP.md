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
A0.1-A0.7 are represented by deterministic contracts and regression gates. No raw field is silently discarded and no weak/ambiguous mapping is silently promoted.

## Phase A — Trusted Report Execution — FOUNDATION COMPLETE
Durable SQL queue, tenant-scoped idempotency, worker lease/heartbeat/retry/dead-letter, renderers, immutable evidence/delivery persistence, trusted worker adapter and artifact SHA-256 integrity verification are implemented and gated.

## Phase B — Usage & Entitlements — DEEP FOUNDATION COMPLETE
Tenant-scoped usage ledger, server-side entitlement policy, persistent plans/capabilities/subscriptions, provider-neutral lifecycle, cryptographic webhook boundary/replay protection and idempotent usage RPCs are implemented. Active plan/capability catalog reads are explicitly allowed while tenant billing data remains tenant-scoped and webhook events remain service-role-only.

## Phase C — Decision Automation — DEEP FOUNDATION COMPLETE
Evidence-bound action identity, approval-by-default for external side effects, tenant/decision/evidence/idempotency propagation, trusted executor boundary, retry/dead-letter semantics and immutable execution receipts are implemented. Execution receipts are now persisted tenant-scoped in the database.

## Phase D — Advanced Intelligence — DEEP FOUNDATION COMPLETE
Deterministic forecast backtesting, baseline comparison, MAE/RMSE/Bias/Coverage diagnostics, forecast improvement gate, tenant-scoped outcome feedback, outcome quality summary and unified intelligence gate are implemented. Observed decision outcomes are now persisted and idempotent.

## Phase E — Production SaaS Certification — DEEP FOUNDATION IN PROGRESS
Implemented and gated:
1. Canonical tenant resolver with fail-closed ambiguous membership behavior.
2. Tenant RLS + WITH CHECK coverage for core execution/import/billing/outcome data.
3. Anonymous access lockdown for sensitive production tables.
4. Production SaaS certification gate scanning required security, AI, execution, billing and intelligence contracts.
5. Authoritative Quality workflow now requires the SaaS certification gate before release-readiness progression.
6. Production readiness verifies that the certification gate and all required workflow scripts are actually present.

Remaining live certification work:
1. Cross-tenant adversarial runtime tests against a real Supabase environment.
2. Storage object-policy verification and signed URL expiry tests.
3. Realtime authorization tests.
4. AI retrieval namespace isolation tests.
5. Backup/restore drill with measured RPO/RTO evidence.
6. Observability/SLO/error-budget runtime evidence.
7. Dependency/security scan and secret-leak audit.
8. Release/rollback drill.

## Phase F — Operational Resilience & Continuous Trust — NEXT
1. Automated tenant-isolation canary suite on every release candidate.
2. Automated migration dry-run and schema drift detection.
3. Backup freshness/restore verification with evidence snapshots.
4. Queue health, stuck-worker and dead-letter alerting.
5. Artifact delivery integrity monitoring.
6. Forecast drift/outcome degradation monitoring and automatic intelligence-gate tightening.
7. Billing webhook lag/replay/failure monitoring.
8. SLO dashboards, error budgets and incident evidence ledger.
9. Safe rollback and forward-fix playbooks.
10. Periodic trust certification that expires unless all critical evidence remains fresh.

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
- Forecast below deterministic baseline.
- Observed outcome accuracy below configured safety threshold when enough feedback exists.
- Production SaaS certification blocker.
- Rendered artifact integrity/hash verification failure.
- Stale/failed backup verification.
- Unresolved critical security finding.
