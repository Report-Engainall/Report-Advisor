# Report-Advisor implementation sequence

## Completed
1-21. Foundation, tenant/RLS security, import governance, report/decision ledgers, document intelligence A0.1-A0.5 foundations.
22. Operational file preview and reconciliation pipeline.
23. A0.3 evidence-fused schema intelligence and mapping hardening.
24. A0.4 deterministic entity resolution and idempotency primitives.
25. Review/quarantine lifecycle and promotion guard.
26. Governed transactional routing with commit/rollback guard.
27. Onyx Pro canonical adapter with unknown-field preservation and empty-cell protection.
28. A0.7 golden dataset manifest.
29. Unified authoritative quality gates.
30-37. Demand horizon, pack/weight normalization, decision policy, demand attribution, weighted substitution, liquidity-aware replenishment, production readiness and unified decision chain.

## Phase A0 — Document & Data Intelligence Engine — COMPLETED
Deterministic contracts and regression gates protect source fidelity, mapping confidence and evidence provenance.

## Phase A — Trusted Report Execution — FOUNDATION COMPLETE
Durable queue, tenant-scoped idempotency, worker lease/heartbeat/retry/dead-letter, renderers, immutable evidence/delivery persistence and artifact integrity verification are implemented and gated.

## Phase B — Usage & Entitlements — DEEP FOUNDATION COMPLETE
Tenant-scoped usage, server-side entitlement policy, persistent plans/capabilities/subscriptions, provider-neutral lifecycle and cryptographic webhook replay protection are implemented.

## Phase C — Decision Automation — DEEP FOUNDATION COMPLETE
Evidence-bound actions, approval-by-default, tenant/evidence/idempotency propagation, trusted executor, retry/dead-letter and immutable execution receipts are implemented.

## Phase D — Advanced Intelligence — DEEP FOUNDATION COMPLETE
Forecast backtesting, baseline comparison, MAE/RMSE/Bias/Coverage diagnostics, forecast improvement gate and tenant-scoped outcome feedback are implemented and persisted idempotently.

## Phase E — Production SaaS Certification — DEEP FOUNDATION IN PROGRESS
Implemented and gated: canonical tenant resolution, fail-closed ambiguous membership, RLS/WITH CHECK coverage, anonymous lockdown, production certification, production readiness and release blockers.

Remaining live certification: real Supabase adversarial tenant tests, storage/signed URL verification, realtime authorization, AI retrieval isolation, backup/restore drill, observability evidence, security/secret audit and rollback drill.

## Phase F — Operational Resilience & Continuous Trust — DEEP FOUNDATION IN PROGRESS
Implemented and gated: operational health evidence, backup/RPO/RTO evidence, SLO/error-budget evidence, incident ledger, expiring trust certification, migration-order checks and resilience manifest.

Remaining live resilience: tenant canary execution, storage/realtime/AI canaries, backup automation, stuck-worker/dead-letter remediation, intelligence degradation monitoring, billing liveness monitoring, SLO alerting and rollback/forward-fix drills.

## Phase G — Release Engineering & Continuous Verification — DEEP FOUNDATION IN PROGRESS
Implemented and gated: reproducible release manifests, deployment verification evidence, fail-closed release verification, migration hardening, release evidence contract, release-certification workflow and Quality integration.

Remaining live release work: real staging DB dry-run/schema drift, canary rollback, environment parity, secret/config validation, signed artifact verification, stabilization telemetry and final production certification bundle.

## Phase H — Continuous Trust & Autonomous Operations — DEEP FOUNDATION IN PROGRESS
Implemented and gated: tenant-isolation canary evidence, approval-bound remediation records, outcome-driven safety adjustment evidence, billing liveness/replay-safe probes, artifact SHA verification, incident-to-regression linkage, fail-closed continuous trust and Quality integration.

Important hardening completed: the Continuous Trust contract is tied to explicit runtime obligations rather than stale phase labels.

Remaining connected H work: runtime canary runner against isolated tenants, safe remediation executor, dynamic intelligence threshold controller using measured outcome drift, billing webhook liveness/replay canary runner, signed artifact verification at deployment boundary, automatic incident-to-regression proposal generation, SLO rollback recommendation and evidence-only executive trust dashboard.

## Phase I — Autonomous Governance & Business Intelligence — DEEP FOUNDATION IN PROGRESS
Implemented and gated:
1. Versioned evidence-backed governance policies.
2. Tenant-scoped BI decisions, KPI evidence and governance alerts.
3. Fail-closed decision execution requiring continuous trust and minimum confidence.
4. Business-risk budgets limiting automated decision consumption.
5. Explainable decision graph nodes and edges.
6. Multi-signal anomaly correlation evidence.
7. Human override feedback evidence for audit-safe learning.
8. Continuous data/model/evidence quality scores.
9. Governed bounded scenario simulation records.
10. Quality CI gate for the deep governance intelligence layer.

Remaining I work: runtime anomaly correlation, graph population from real decision pipelines, outcome-driven override learning, dynamic quality scoring, bounded scenario computation, executive trust cockpit and automated governance re-certification.

## Phase J — Autonomous Business Control Plane — DEEP FOUNDATION IN PROGRESS
Implemented now:
1. Watched-folder report ingestion foundation using the browser File System Access API.
2. Recursive folder scanning with configurable extensions, polling and bounded concurrency policy.
3. SHA-256 content fingerprinting per report.
4. Persistent IndexedDB file fingerprint store so monitoring survives page refreshes.
5. Persistent local folder-handle storage for permission recovery across sessions.
6. Tenant-scoped server persistence for watched folders and file lineage.
7. Incremental file detection: new / changed / unchanged.
8. Incremental row reconciliation now detects changed, unchanged AND deleted rows.
9. Canonical-text-first extraction orchestration with SHA-256 text provenance.
10. Extraction failure no longer becomes a global pipeline stop: structured-source fallback is explicitly allowed and evidenced.
11. Recursive batch-folder processing is connected to the existing central import commit path.
12. Automatic watched-folder UI mode is connected to scan/process cycles.
13. Unified business-state snapshot schema across sales, demand, inventory, liquidity and operations.
14. Constraint-aware optimization run schema with protected liquidity/service-level fields and fail-closed execution predicate.
15. Recommendation outcome feedback schema.
16. Executive KPI causal/evidence lineage schema.
17. Control-plane drift event schema and critical-drift execution blocker.
18. Business control-plane Quality gate is release-blocking.

Remaining J work:
1. Connect watched-folder discoveries to the existing durable import job coordinator and resumable checkpoints.
2. Persist per-file extraction checkpoints and canonical text artifacts into the existing evidence/delivery ledger.
3. Add stable path/rename detection and tombstone handling.
4. Add parse-once cache and report-version lineage so an appended/revised report processes only new/changed content at row level across devices.
5. Add canonical ordering/layout normalization for tables, headings, totals and repeated headers before schema inference.
6. Add extraction quality scoring and automatic fallback selection (PDF text layer → table extraction → OCR → structured parser) without stopping downstream analytics.
7. Add multi-report chronological consolidation with deduplication and source precedence.
8. Populate business-state snapshots from real domain engines.
9. Add constraint-aware optimizer computation and bounded what-if simulation.
10. Add closed-loop recommendation evaluation against observed outcomes.
11. Add portfolio-level decision prioritization under risk budgets.
12. Add materiality-based escalation and human-in-the-loop routing.
13. Add causal/evidence lineage population for every executive KPI.
14. Add bounded what-if planning with rollback-safe recommendations.
15. Add business control-plane health/trust score computation.
16. Add automatic drift detection across data, policies, forecasts and outcomes.
17. Enable production autonomy only for domains whose evidence, trust and risk budgets remain valid.

## Cross-cutting requirements restored to the master plan
- Automatic watched-folder synchronization: a user selects a local folder in the app; new reports are discovered automatically without repeated manual upload.
- Revised reports are fingerprinted and only changed files/rows are processed; unchanged rows are skipped and deleted rows are explicitly reconciled.
- First-stage text-first extraction/reconstruction is mandatory when technically possible because canonical text improves deterministic mapping, semantic analysis and evidence traceability.
- Extraction is a quality layer, not a single point of failure: if extraction fails, the system records the failure and continues through the best safe structured-source path.
- Canonical report reconstruction must preserve row/column meaning, repeated headers, page/table boundaries, totals, dates and source order before analytics.
- Every source version must have source hash, extraction hash, processing version and evidence lineage.
- No silent source loss; unsupported/failed fields become explicit warnings or quarantine evidence.
- Offline-first/local processing remains the preferred path for large files and sensitive source data.
- AI is advisory and evidence-bound; deterministic data engines remain authoritative for numeric truth.
- Arabic/English digits, headers, units, currencies, dates and whitespace/presentation noise must normalize deterministically.
- Product families and pack/weight variants must be inferred from normalized names/units where business-key evidence permits.
- Demand horizon remains configurable; sample values such as 30 days are examples, never hard-coded business rules.
- Alternative-item groups must be weighted by real substitution behavior, availability, price/margin and pack equivalence.
- Inventory recommendations must protect liquidity and service-level constraints.
- Reports, recommendations and decisions must preserve tenant isolation, provenance and idempotency.

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
- Artifact integrity/hash verification failure.
- Stale/failed backup verification.
- Unresolved critical security finding.
- Expired or blocked trust certificate.
- Migration drift or non-reproducible release manifest.
- Failed release preflight/canary/stabilization verification.
- Failed tenant-isolation, billing-liveness or artifact-verification canary.
- Exhausted or invalid business-risk budget.
- Missing decision lineage or insufficient evidence quality.
- Watched-folder source version collision without explicit reconciliation.
- Canonical-text provenance missing for successful extraction.
- Extraction failure incorrectly suppressing all downstream analysis.
