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

## Phase A0 — Document & Data Intelligence Engine foundation

The canonical requirements are recorded in `docs/DOCUMENT_INTELLIGENCE_ENGINE_REQUIREMENTS.md` and are based on the supplied engineering specification. The implementation must be incremental, test-gated, provider-neutral, and must not replace working production UI/query/import surfaces blindly.

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

### A0.3 — Schema discovery and semantic mapping — NEXT
- Dynamic column/table/page discovery without fixed templates.
- Column profiles, statistical fingerprints, pattern recognition, relationship graphs, and multi-evidence semantic mapping.
- Arabic/English synonyms, OCR variants, numeric/date/currency/unit normalization.

### A0.4 — Validation, reconciliation, confidence and quarantine
- Entity resolution and deduplication.
- Mathematical/business reconciliation with configurable tolerances.
- Field-level confidence and criticality.
- Focused human review and quarantine for uncertain or invalid records.

### A0.5 — Canonical routing and transactional import
- Map extracted fields to canonical entities and application destinations.
- Integrate with the existing governed import/upsert path.
- Ensure transactional commit/rollback and idempotency.

### A0.6 — Onyx adapter and extensibility
- Route Onyx Pro reports through the same canonical pipeline.
- Keep future ERP/POS/CSV/Excel adapters behind the same boundary.

### A0.7 — Golden datasets and quality gates
- Add representative Arabic/English, scanned, random-schema, no-header, complex-table, invoice, Onyx, and 30+ column fixtures.
- Add unit/integration/pipeline/OCR/mapping/business/security/load regression gates.
- Measure extraction, mapping, entity-resolution, and reconciliation accuracy.

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
