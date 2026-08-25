# Report Advisor — Execution Master Index

> **Authoritative execution index.** This file incorporates `وثيقة 01 — تقرير التنفيذ والتصحيح والتطوير المطلوب في Report-Advisor` and the subsequent product directive: **preserve all existing capabilities, improve rather than remove them, and keep the complete product free to operate with no mandatory paid provider, subscription, API, or external service.** It supplements `docs/MASTER_PRODUCT_REFERENCE.md`; it does not replace it.
>
> **Rule:** a file, contract, gate, migration, UI, or provider is not evidence of completion. A workstream becomes `COMPLETE` only after an executable path, fixture/live evidence, security checks, regression coverage, and documented result exist.

## Status vocabulary

- **COMPLETE** — end-to-end proven with evidence.
- **FOUNDATION** — implementation exists, but the full path is not proven.
- **GATED** — protected by contracts/gates, but runtime evidence is incomplete.
- **LIVE REQUIRED** — requires a live environment, real tenant, external system, or operational drill.
- **GAP** — a material capability is missing.

## Non-negotiable engineering rules

1. **Preserve before replacing:** do not delete or downgrade an existing feature that works. Improve, repair, optimize, and integrate it unless removal is required by a proven security/correctness issue and an equal-or-better replacement is implemented and regression-tested.
2. Preserve the working React/Vite/Supabase architecture unless an evidence-backed engineering reason requires change.
3. Inspect existing implementation before adding a new gate, workflow, contract, provider, framework, or service.
4. Deterministic engines own authoritative numbers; LLMs never calculate or write business truth.
5. Raw business rows are never sent to hosted AI; only approved minimum context is allowed.
6. No silent paid-AI fallback.
7. **Free-first / zero-mandatory-cost policy:** all core application capabilities must be runnable without paying any third party. No feature may require a paid AI API, paid SaaS, paid database tier, paid OCR/parser, paid storage, paid analytics, paid messaging provider, or paid automation service as a prerequisite for normal operation.
8. Prefer local, open-source, self-hosted, browser-native, or existing free-tier-compatible components for optional integrations. Paid providers may exist only as explicit optional adapters and must never be required, silently invoked, or used as the only path for a core feature.
9. The application must clearly expose provider mode/state and must fail safely to a free/local path or `UNAVAILABLE/INSUFFICIENT_EVIDENCE`; it must never trigger a charge or paid fallback silently.
10. No feature removal is an optimization strategy. Performance work must preserve existing behavior and user-facing capabilities, with regression tests proving parity or improvement.
11. Missing information is `UNKNOWN` / `INSUFFICIENT_EVIDENCE`, never silently zero-filled.
12. Every tenant-scoped operation is authorized at the actual execution boundary.
13. Every important result must be traceable to source evidence and a versioned snapshot.
14. Empty imported fields do not clear existing values unless an explicit clear/overwrite policy was selected.
15. No production certification from TypeScript/build success alone.
16. Performance optimization must be measured with before/after benchmarks; never claim a speed improvement without evidence.
17. Every newly proposed dependency must pass an **anti-cost and anti-bloat review**: necessity, license, offline/local alternative, operational cost, failure mode, and feature-preservation impact.

## Zero-cost product acceptance contract

The following are **core acceptance requirements**, not suggestions:

- Core import/export works without a paid provider.
- PDF/OCR/document intelligence has a free/local/browser-capable path.
- Analysis, metrics, reports, recommendations, and ChatBI have a free/local deterministic path.
- AI is optional for core correctness; if AI is unavailable, deterministic functionality remains usable.
- Local Ollama/open-source models may be used where appropriate; no hosted paid AI is mandatory.
- No API key is required for the core product unless the user explicitly chooses an optional external integration.
- No credit card is required to unlock core functionality.
- No paid fallback may be hidden in application code, CI, runtime configuration, or provider routing.
- Optional paid adapters must be visibly labeled **OPTIONAL / PAID**, disabled by default, and isolated behind a provider interface.
- The free/local path must be covered by the same regression and security tests as any optional provider.
- Documentation must state exactly which capabilities work offline/local and which optional external integrations need their own accounts.

## Feature preservation ledger

Before changing architecture or removing any existing capability, record:
- feature name;
- current implementation;
- reason for change;
- defect/performance/security evidence;
- replacement/improvement;
- migration path;
- regression test;
- user-visible parity checklist.

**Default decision = KEEP + IMPROVE.**

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
| 36 | Free/Local Core Certification | GATED | clean environment proves core product runs without paid third-party dependency |
| 37 | Feature Preservation / No-Regression | GATED | inventory of existing capabilities + parity/regression evidence after changes |
| 38 | Performance Engineering | FOUNDATION | before/after P50/P95/P99, CPU/memory/I/O/network and large-file benchmarks |

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

## Free/local AI contract

Core AI-assisted capabilities must remain functional with a local/free provider path. Provider selection must be explicit and auditable:

`LOCAL/FREE → optional external adapter`

Never:
`LOCAL unavailable → silently call paid API`

If no provider is available, the system must preserve deterministic analysis and clearly report AI unavailable rather than charging the user or fabricating an answer.

## Performance contract

Every meaningful performance change must report before/after evidence for applicable:
- P50/P95/P99 latency;
- CPU;
- memory/peak heap;
- database query count/time;
- disk I/O;
- network bytes;
- cache hit/miss;
- concurrency throughput;
- large-file processing time.

Performance improvements must not remove existing functionality or weaken evidence/security guarantees.

## Certification rule

No final `PRODUCTION CERTIFIED` status is valid until workstreams 01–38 that are applicable to the deployed architecture have either reached COMPLETE or have a documented LIVE REQUIRED evidence plan executed before release. Remaining FOUNDATION/GATED/GAP items must be explicitly listed; none may be silently treated as complete.

In addition, production certification requires:
- **no mandatory paid dependency for core operation**;
- **no silent paid fallback**;
- **no removed existing feature without approved replacement and regression evidence**;
- **free/local path verified in a clean environment**;
- performance benchmark evidence;
- security and tenant-isolation evidence;
- backup/restore and operational evidence where applicable.

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
