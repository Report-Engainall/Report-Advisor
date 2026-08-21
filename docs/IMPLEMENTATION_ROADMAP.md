# Report-Advisor implementation sequence

## Completed in current foundation branch
1. Tenant isolation primitives and RLS.
2. Membership privilege hardening.
3. Trial/entitlement model with direct client mutation locked.
4. Inventory liquidity/velocity engine.
5. Demand/reorder/stockout calculations.
6. Cash-flow/liquidity decision engine.
7. Decision/action ledger.
8. Report Studio persistence model.
9. Tenant-safe report execution ledger.
10. Usage metering ledger.
11. Tenant bootstrap before tenant-scoped queries.
12. Report Studio UI and Decision Automation UI.
13. Trial status UX.
14. Selective integration of the reviewed intelligence/production-hardening branches.
15. Cross-repository audit of all repositories currently visible in the linked account; no additional source code was available in the two empty repositories.
16. A0.1 provider-neutral document intelligence contracts and raw-data safety gates.
17. A0.2 structured intermediate document envelope with source/cell provenance, lifecycle states, and parser integration.
18. A0.3 schema discovery foundation: dynamic column profiling, statistical fingerprints, pattern recognition, Arabic/English semantic dictionary, and multi-evidence candidate scoring.
19. A0.3 normalization foundation: Arabic/English digits, Arabic text normalization, locale-aware numeric parsing, percentages, dates/booleans, and lossless original-value retention.
20. A0.4 validation foundation: weighted evidence confidence, line/invoice mathematical reconciliation, configurable tolerances, criticality-aware review/quarantine decisions.
21. A0.5 routing foundation: canonical-field-to-entity/destination routing without depending on external column names.
22. A0.3 hardening: column relationship graph, structural table classification, headerless reverse-schema inference, and deterministic evidence fusion primitives.
23. A0.4 hardening foundation: normalized entity resolution, deterministic idempotency envelope generation, and criticality-aware review decisions.
24. Deterministic document preflight pipeline combining profiling, schema inference, routing, reconciliation, and quarantine decisions before production routing.
25. Dedicated hardening contract gate registered in package scripts.

## Phase A0 — Document & Data Intelligence Engine foundation

The canonical requirements are recorded in `docs/DOCUMENT_INTELLIGENCE_ENGINE_REQUIREMENTS.md` and are based on the supplied engineering specification. The implementation is incremental, test-gated, provider-neutral, and must not replace working production UI/query/import surfaces blindly.

### A0.1 — Engine contracts and safety gates — COMPLETED
- Define provider-neutral interfaces for document parsing, OCR, table extraction, entity resolution, validation, and routing.
- Enforce the raw-data boundary: reports/analytics/forecasting/recommendations may consume only validated/approved canonical data.
- Add explicit processing states: raw, extracted, staging, validated, reconciled, approved, review, quarantined, production.
- Preserve source provenance and processing versions.
- Keep heavy/local AI and OCR engines optional.

### A0.2 — Structured intermediate document model — COMPLETED (foundation)
- Represent metadata, pages, blocks, tables, rows, cells, images, text, and provenance in one provider-neutral envelope.
- Preserve source identity, cell/source locations, source hashes, parser identity, and confidence fields.
- Support unknown fields without dropping source data.
- Route the existing optional Docling adapter through the canonical envelope without making Docling mandatory.
- Add lifecycle transition invariants and regression tests.

### A0.3 — Schema discovery and semantic mapping — HARDENING FOUNDATION COMPLETED
- Dynamic column profiling without fixed templates.
- Statistical fingerprints: null/non-empty ratio, uniqueness, numeric/date ratios, length, min/max and identifier-like patterns.
- Multi-evidence semantic candidates using header, content type, patterns and canonical Arabic/English synonyms.
- Preserve unknown columns; do not discard source data merely because mapping is unresolved.
- Relationship graph across columns.
- Structural page/table classification primitive.
- Headerless reverse-schema inference using content and relationship evidence.
- Deterministic evidence fusion exposed to the preflight pipeline.
- Remaining: richer OCR-error dictionary and evidence from existing company master data.

### A0.4 — Validation, reconciliation, confidence and quarantine — HARDENING FOUNDATION COMPLETED
- Weighted evidence confidence and criticality-aware approval thresholds.
- Line-level quantity × unit-price reconciliation.
- Invoice subtotal/tax/discount/shipping/total reconciliation with absolute and relative tolerance.
- Explicit PASS/WARN/FAIL/UNKNOWN issues.
- Review/quarantine decisions for uncertain mappings.
- Normalized entity-resolution primitive with exact and conservative similarity matching.
- Deterministic idempotency envelope generation from tenant/entity/natural-key/source-hash.
- Preflight safety assertion that prevents quarantined entity resolutions from being routed onward.
- Remaining: accounting/inventory cross-record reconciliation, persistent field-level lineage, durable review queue, and human-review workflow integration.

### A0.5 — Canonical routing and transactional import — ROUTING FOUNDATION + PREFLIGHT COMPLETED
- Map canonical semantic fields to entities and destinations rather than matching external column names.
- Unknown/unmapped fields are routed to quarantine instead of silently ignored.
- Deterministic preflight now combines schema inference, route confidence, mathematical reconciliation, and review/quarantine status.
- Remaining hardening: connect preflight output to the existing governed import/upsert path, transactional commit/rollback, persistent idempotency keys, and production destination adapters.

### A0.6 — Onyx adapter and extensibility
- Route Onyx Pro reports through the same canonical pipeline.
- Keep future ERP/POS/CSV/Excel adapters behind the same boundary.

### A0.7 — Golden datasets and quality gates
- Add representative Arabic/English, scanned, random-schema, no-header, complex-table, invoice, Onyx, and 30+ column fixtures.
- Add unit/integration/pipeline/OCR/mapping/business/security/load regression gates.
- Measure extraction, mapping, entity-resolution, and reconciliation accuracy.

## Required next hardening sequence
1. Complete A0.3 richer OCR-error dictionary and existing-company-data evidence fusion.
2. Complete A0.4 accounting/inventory cross-record reconciliation, durable field-level lineage, persistent review/quarantine workflow, and deduplication across historical imports.
3. Complete A0.5 governed transactional routing into the existing import engine with rollback, persistent idempotency, and destination adapters.
4. Then implement A0.6 Onyx adapter and A0.7 golden datasets/quality gates.
5. Only after these gates pass, proceed with downstream report execution/automation work.

## Next implementation order
### Phase A — Report execution
- Build trusted worker adapter.
- Render saved semantic definitions to PDF/Excel/web outputs.
- Queue scheduled reports through `queue_report_run`.
- Claim jobs with `claim_report_run` using a trusted server credential.
- Persist immutable run evidence and delivery results.

### Phase B — Usage/entitlements
- Aggregate usage by billing period.
- Enforce limits at the server boundary before expensive jobs.
- Add billing provider adapter.
- Add invoices, subscription lifecycle and webhook verification.
- Add plan/capability management UI for the platform operator.

### Phase C — Decision automation
- Convert inventory/finance recommendations to explainable `automation_actions`.
- Require approval for external side effects by default.
- Add idempotency keys and execution receipts.
- Add retry/backoff/dead-letter handling.

### Phase D — Advanced intelligence
- Backtest forecasting models.
- Compare against deterministic baselines.
- Add confidence/coverage/accuracy diagnostics.
- Add scenario simulation and sensitivity analysis.
- Add semantic caching and local analytical acceleration where justified.

### Phase E — Production SaaS
- Cross-tenant negative test suite.
- Storage policy audit.
- Realtime authorization audit.
- AI retrieval namespace audit.
- Backup/restore drill.
- Observability and SLOs.
- Security review and production release checklist.

## Release blockers
- Any cross-tenant read/write/search/export/retrieval.
- Client-side-only paid feature enforcement.
- Unverified billing webhooks.
- Worker that can process a report without explicit tenant context.
- AI retrieval without tenant namespace.
- Trial expiry that destroys customer data.
- Raw-file access from report/analytics/forecast/recommendation services.
- Dropped or silently ignored source fields.
- Failed typecheck/build/lint.
- A critical field auto-approved without sufficient evidence.
- Reconciliation mismatch silently committed to production.