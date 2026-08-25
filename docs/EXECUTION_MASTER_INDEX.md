# Report Advisor — Execution Master Index

> **Authoritative execution index.** This file incorporates the requirements in `وثيقة 01 — تقرير التنفيذ والتصحيح والتطوير المطلوب في Report-Advisor` and is the operational checklist for closing the product. It supplements `docs/MASTER_PRODUCT_REFERENCE.md`; it does not replace it.
>
> **Rule:** a file, contract, gate, migration, or UI is not evidence of completion. A workstream becomes `COMPLETE` only after an executable path, fixture/live evidence, security checks, regression coverage, and documented result exist.

## Status vocabulary

- **COMPLETE** — end-to-end proven with evidence.
- **FOUNDATION** — implementation exists, but the full path is not proven.
- **GATED** — protected by contracts/gates, but runtime evidence is incomplete.
- **LIVE REQUIRED** — requires a live environment, real tenant, external system, or operational drill.
- **GAP** — a material capability is missing.

## Non-negotiable engineering rules

1. Preserve working React/Vite/Supabase architecture unless an evidence-backed engineering reason requires change.
2. Inspect existing implementation before adding a new gate, workflow, contract, provider, framework, or service.
3. Deterministic engines own authoritative numbers; LLMs never calculate or write business truth.
4. Raw business rows are never sent to hosted AI; only approved minimum context is allowed.
5. No silent paid-AI fallback.
6. Missing information is `UNKNOWN` / `INSUFFICIENT_EVIDENCE`, never silently zero-filled.
7. Every tenant-scoped operation is authorized at the actual execution boundary.
8. Every important result must be traceable to source evidence and a versioned snapshot.
9. Empty imported fields do not clear existing values unless an explicit clear/overwrite policy was selected.
10. No production certification from TypeScript/build success alone.

## Master execution matrix

| ID | Workstream | Current target state | Evidence required to mark COMPLETE |
|---|---|---|---|
| 01 | Runtime E2E File→Outcome chain | GATED | one executable fixture through every stage with durable stage ledger |
| 02 | Metric Single Source of Truth | FOUNDATION | central metric registry + SQL/RPC + UI/Report/ChatBI parity fixture |
| 03 | Evidence Graph / cell lineage | FOUNDATION | source-addressable cell→entity→metric→decision chain |
| 04 | Evidence-backed decisions | GATED | blocked/allowed decisions with evidence and replay fixtures |
| 05 | Multi-dimensional confidence | FOUNDATION | component confidence + deterministic overall trust + tests |
| 06 | Freshness decision gate | FOUNDATION | Fresh/Warning/Stale/Critical behavior proven in decision path |
| 07 | UNKNOWN first-class semantics | GATED | missing-source fixtures prove no silent zero substitution |
| 08 | Import Engine | GATED | preview→map→normalize→resolve→commit→rollback/recovery E2E |
| 09 | Document Intelligence | GATED | Arabic/English golden corpus including hard tables and OCR |
| 10 | Onyx Adapter | FOUNDATION | import/map/reconcile/incremental sync/rollback fixtures |
| 11 | Tenant isolation / RLS | GATED | adversarial A/B API/RPC/storage/realtime/search/export tests |
| 12 | Storage / signed URLs | FOUNDATION | private-path, expiry, revocation, traversal and malware tests |
| 13 | Realtime authorization | GATED | cross-tenant channel/subscription isolation evidence |
| 14 | AI security | GATED | provider allowlist, context minimization, prompt injection and audit tests |
| 15 | AI Answer Reliability | FOUNDATION | question→plan→deterministic calculation→evidence→answer E2E |
| 16 | Forecasting | GATED | minimum history, backtest, version, freshness, actual-vs-forecast fixtures |
| 17 | Scenarios / What-if | FOUNDATION | immutable base snapshot and no-write-to-truth tests |
| 18 | Recommendation Engine | GATED | evidence/freshness/confidence/action-approval/outcome contract |
| 19 | Decision Replay | FOUNDATION | immutable snapshot replay reproduces the original decision |
| 20 | Decision Diff | FOUNDATION | two snapshots explain metric/evidence/confidence deltas |
| 21 | Outcome Feedback Loop | FOUNDATION | expected→action→actual→variance persisted and queryable |
| 22 | Report Snapshots / Diff | FOUNDATION | immutable snapshot + lineage + version + diff fixture |
| 23 | Business Control Plane | FOUNDATION | jobs/freshness/quality/AI/storage/RLS/backup/runtime health in one view |
| 24 | Durable Jobs | GATED | checkpoint/retry/idempotency/DLQ/stuck/replay recovery drill |
| 25 | Backup / Restore | LIVE REQUIRED | backup + restore + integrity + RPO/RTO drill evidence |
| 26 | Migration / Environment Parity | GATED | clean replay + schema drift + rollback + staging parity |
| 27 | CI/CD | GATED | merge-blocking security/RLS/evidence/migration/provenance gates |
| 28 | Observability / SLO | FOUNDATION | correlation-safe telemetry, latency/error/freshness/queue metrics |
| 29 | UX reliability | FOUNDATION | no fake success/numbers + loading/error/empty/unknown/offline states |
| 30 | Saved views / filtering / drill-through | FOUNDATION | UI E2E with state persistence and tenant scope |
| 31 | Ask→Inspect→Act | FOUNDATION | evidence/source inspection + approval + action + outcome E2E |
| 32 | Command Palette | FOUNDATION | search/inspect/run/compare/replay/navigation actions E2E |
| 33 | Golden Corpus + Test Matrix | GATED | unit/integration/E2E/security/OCR/RLS/recovery corpus results |
| 34 | Production Certification | LIVE REQUIRED | security/storage/realtime/AI/migration/DR/SLO/evidence/action certification |
| 35 | Anti-bloat governance | GATED | architecture review proves no unnecessary framework/provider/microservice growth |

## Required canonical runtime chain

`Source → Upload → Security → Classification → Routing → Parsing/OCR → IR → Extraction → Schema → Mapping → Normalization → Entity Resolution → Mathematical Validation → Reconciliation → DQ → Confidence → Quarantine/Review → Approval → Canonical DB → Deterministic Metrics → Report → Evidence → Recommendation → Approval Gate → Action → Observed Outcome → Feedback/Learning`

Every stage must emit:
- execution/correlation ID
- tenant/company scope
- status
- started/finished timestamps
- input/output references
- version(s)
- error/review reason when applicable
- resumable checkpoint where applicable

## Metric contract

Every authoritative metric must have:
- `metric_id`
- name/label
- definition
- deterministic formula
- source tables/fields
- allowed dimensions
- time semantics
- freshness requirement
- confidence semantics
- version
- owner
- dependencies
- evidence references

Canonical metric families include revenue, cost, gross profit, margin, inventory value, receivables, payables, cash, DSO, DIO, DPO, CCC and approved operational metrics.

## Evidence Graph contract

`File → Page → Table → Row → Column → Cell → Extracted Value → Normalized Value → Entity → Canonical Record → Metric → Report → Recommendation → Action → Outcome`

A trace must retain source location where available, parser/OCR version, schema/mapping/rule versions, snapshot, transformation, actor/process, and decision/action correlation.

## Decision safety contract

A recommendation may become actionable only when:
- required metrics are available and trustworthy;
- freshness is not Stale/Critical;
- source evidence is sufficient;
- data/extraction/mapping/entity/validation/calculation/forecast confidence gates pass;
- expected impact and risk are represented;
- an explicit approval gate exists for consequential actions.

Otherwise status is `UNKNOWN`, `INSUFFICIENT_EVIDENCE`, or `BLOCKED` with a human-readable reason.

## Import contract

Import records must carry, as applicable:
`import_id`, `source_file_id`, `mapping_version`, `parser_version`, row status, rejection reason, confidence, duplicate status, reconciliation result, snapshot/version and recovery state.

Empty cells never clear an existing canonical value unless an explicit clear/overwrite policy was selected.

## AI contract

`Question → Intent → deterministic query plan → DQ/freshness → deterministic calculation → evidence retrieval → answer synthesis`

AI is an explanation/synthesis layer. It cannot author authoritative numeric facts or write business tables directly. OCR/document text and external content are untrusted input and must pass sanitization/injection controls.

## Certification rule

No final `PRODUCTION CERTIFIED` status is valid until workstreams 01–35 that are applicable to the deployed architecture have either reached COMPLETE or have a documented LIVE REQUIRED evidence plan executed before release. Remaining FOUNDATION/GATED/GAP items must be explicitly listed; none may be silently treated as complete.

## Execution protocol

For every workstream, record:
1. implementation change;
2. affected files/schema/workflows;
3. executable tests;
4. fixture/live evidence;
5. result;
6. limitation;
7. final status;
8. next dependency.

The next implementation priority is always the **highest-impact open runtime path**, not the easiest new file to create.
