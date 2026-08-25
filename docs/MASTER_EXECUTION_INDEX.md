# Report Advisor — Master Execution & Truth Index

> المرجع التنفيذي المركزي. اقرأه قبل أي عمل جديد، ثم افحص المستودع الحالي. عند التعارض يكون الكود الحالي هو الحقيقة، وبعد كل دفعة مؤثرة يجب تحديث هذا الملف.

Snapshot: 2026-08-25
Source of truth: `main` / `Report-Engainall/Report-Advisor`

## 1. قواعد العمل

1. لا تبدأ من الذاكرة؛ ابدأ من هذا الملف ثم المستودع.
2. قبل إنشاء Gate/Workflow/Contract ابحث عن الموجود: reuse / fix / consolidate / create.
3. افصل بين implemented وgated وruntime-verified وproduction-certified.
4. وجود test أو workflow لا يعني نجاح runtime.
5. Quality هو مسار CI الأساسي؛ المتخصص المتكرر يكون manual-only أو يدمج.
6. لا تستبدل UI/query/import wholesale قبل إثبات التفوق والتكامل.
7. AI لا يكون مصدر الحقيقة الرقمية أو المالية.
8. لا تحول failure إلى warning للحصول على أخضر.
9. بعد كل دفعة: سجل commit، الملفات، الاكتشاف، السبب، الإصلاح، التحقق، المتبقي والخطوة التالية.

## 2. المراجع الأساسية

- `docs/MASTER_PRODUCT_REFERENCE.md` — المتطلبات والـguardrails والـopen-source/inspiration.
- `docs/IMPLEMENTATION_ROADMAP.md` — التسلسل المرحلي وحالة التنفيذ المعلنة.
- `docs/INSPIRATION_IMPLEMENTATION_AUDIT.md` — فجوات UX/capability.
- `docs/INTEGRATION_SOURCES_REGISTRY.md` — الفروع والمصادر المراجعة/المدمجة/المؤجلة.
- `docs/INTEGRATION_AUDIT_2026-08-21.md` — تدقيق المستودعات المرتبطة.
- `docs/DOCUMENT_INTELLIGENCE_ENGINE_REQUIREMENTS.md` — مواصفات محرك الوثائق والبيانات.
- `docs/CI_EXECUTION_MODE.md` — سياسة CI والـrunner/bootstrap.
- `docs/CI_FAILURE_HUNTING_LEDGER.md` — سجل failures التاريخية.
- `PROJECT_EXECUTION_INDEX.md` — فهرس تنفيذي سابق، يبقى مرجعًا تاريخيًا.
- هذا الملف — **الحالة التنفيذية الشاملة الحالية**.

## 3. تعريف الحالة

- COMPLETE: implementation + applicable evidence يحقق DoD.
- FOUNDATION: architecture/contracts موجودة لكن proof غير مكتمل.
- GATED: gates موجودة لكن runtime proof غير مكتمل.
- LIVE REQUIRED: يتطلب بيئة حقيقية.
- GAP: متطلب معروف ولم يكتمل.
- NOT STARTED: لا يوجد تنفيذ موثوق معروف.
- GUARDRAIL: متعمد عدم التنفيذ بسبب الأمن/التكرار/الترخيص/السياسة.

## 4. مصفوفة المراحل

| المرحلة | الحالة الحالية | ما هو مكتمل | ما هو ناقص |
|---|---|---|---|
| 1–21 | COMPLETE FOUNDATION | Foundation, tenant/RLS, import governance, ledgers, A0 foundations | إعادة تحقق عند تغير dependencies |
| 22 | IMPLEMENTED | file preview/reconciliation | runtime/E2E evidence |
| 23 A0.3 | IMPLEMENTED/GATED | schema intelligence/mapping hardening | golden/E2E depth |
| 24 A0.4 | IMPLEMENTED/GATED | entity resolution/idempotency | runtime reconciliation proof |
| 25 | IMPLEMENTED/GATED | review/quarantine/promotion guard | full user E2E |
| 26 | IMPLEMENTED/GATED | transactional routing/rollback | live transactional proof |
| 27 | IMPLEMENTED/GATED | Onyx canonical adapter | live adapter verification |
| 28 | IMPLEMENTED | golden dataset manifest | expand/execute corpus |
| 29 | IMPLEMENTED/GATED | unified quality gates | current CI runtime proof |
| 30–37 | IMPLEMENTED/GATED | demand/pack/decision/liquidity/production chain | runtime + golden decision E2E |
| A0 | FOUNDATION/GATED | deterministic document/data contracts | complete internal engine |
| A | FOUNDATION COMPLETE | queue/idempotency/lease/render/evidence/artifact integrity | live worker proof |
| B | DEEP FOUNDATION COMPLETE | entitlements/usage/provider-neutral lifecycle/webhook protection | live production evidence |
| C | DEEP FOUNDATION COMPLETE | governed evidence-bound actions/executor/receipts | full live action path |
| D | DEEP FOUNDATION COMPLETE | forecasting/backtesting/diagnostics/outcome feedback | production feedback proof |
| E | GATED/LIVE REQUIRED | tenant/RLS/readiness/certification foundations | adversarial tenant, storage, realtime, AI retrieval, backup, rollback, security |
| F | GATED/LIVE REQUIRED | resilience/trust/backup/RPO-RTO/SLO evidence foundations | live canaries, restore, worker recovery, rollback, stabilization |
| G | GATED/LIVE REQUIRED | manifests/evidence/fail-closed release verification | staging DB dry-run, parity, signed artifact, canary, stabilization |
| H | FOUNDATION/GATED | continuous trust/autonomous safety contracts | connected runtime canaries/remediation |
| I | FOUNDATION/GATED | governance/BI decisions/evidence/risk budgets | live graph/anomaly/outcome learning/cockpit |
| J | FOUNDATION/GATED | watched-folder, lineage, reconciliation, control-plane schema | live coordinator/business-state integration |
| J.1 | REQUIREMENT LOCK + FOUNDATION | text-first watched reports requirements/contracts | complete live continuous ingestion acceptance |
| K | FOUNDATION/GATED | durable jobs, lineage, canonical text, scenarios, ranking, calibration | real jobs/engines/outcomes/rollback |
| L | FOUNDATION/GATED | health/evidence graph/certification predicates | live telemetry/graph/UI action loop |
| M | NOT LIVE CERTIFIED | certification gates | all live certification bundle requirements |

## 5. Major product areas

### Ingestion / data truth
Foundation is broad: multi-format import, canonical mapping, deterministic normalization, business-key matching, preview/approval, reconciliation, quarantine, provenance, governed bulk writes and Onyx adapter protections.

Remaining proof: arbitrary/no-header/random schemas, page/table classification, extraction completeness, cell lineage, reconciliation accuracy, uncertain extraction UX, large/poor files and golden corpus execution.

### Document Intelligence Engine
Canonical pipeline:
`RAW → Security → Inspection → Classification → Router → Parser/OCR/Layout/Table → Intermediate Model → Extract Everything → Schema Discovery → Semantic Mapping → Normalization → Entity Resolution → Mathematical Validation → Reconciliation → Confidence → Review/Quarantine → Canonical DB → Routing`

The repository has provider-neutral scaffolding and contracts, but roadmap/audit explicitly keep this as a remaining major workstream. Do not mark complete because upload/PDF/OCR parsing works.

Remaining: intermediate representation, page/table classification, headerless/reverse schema discovery, extraction/provenance completeness, cell lineage, mapping confidence, entity precision/recall, reconciliation, quarantine/reprocessing UX, golden corpus and load/security evidence.

### Analytics / BI
Foundations exist for semantic metrics, consolidated intelligence, inventory/demand, decision dashboards, safe metrics, cache/concurrency and report truth.

Remaining: truth-state rendering across material UI, large-table proof, cross-filter/drill-down E2E, saved views, Command Palette, executive cockpit action loop, deterministic what-if/scenario engine.

### Forecasting
Foundation exists for backtesting and diagnostics. Remaining: production-like data, minimum-data behavior, baseline comparison evidence, closed-loop outcomes and safe UI exposure.

### AI / ChatBI
AI remains advisory/evidence-bound. Ollama is optional. Remaining: Ask→Inspect→Act E2E, provider failure/fallback, tenant retrieval isolation and live AI canary.

### Import / Onyx
Governed import and canonical Onyx adapter exist. Empty cells must never erase existing values. Remaining: arbitrary-file acceptance, business-key regressions, live Onyx sync evidence.

### Security / Tenant / RLS
Strong static foundation exists. Remaining live proof: adversarial Supabase tenant tests, storage/signed URLs, realtime auth, AI retrieval namespace isolation and secret audit.

### Recovery / resilience
Static contracts/evidence exist. Remaining live proof: actual restore drill, timing/count/integrity checks, tenant/storage/realtime/AI canaries, stuck-worker/dead-letter recovery, SLO alerts, rollback/forward-fix.

### Release / certification
Manifest, dependency/migration/artifact provenance, evidence freshness, drift, security provenance, rollback contract, recovery readiness and production gate chain exist. They prove wiring/readiness, not production certification. Live evidence is still required.

## 6. CI topology inventory

Primary path:
- `.github/workflows/quality.yml`

Specialized/diagnostic workflows observed in current recursive tree:
- autonomy-safety-wave.yml
- file-engine-header-contract.yml
- file-intelligence-security.yml
- j-k-l-runtime-wave.yml
- master-production-verification.yml
- phase-e-live-certification.yml
- phase-f-live-resilience.yml
- production-certification-boundary.yml
- production-chain-guard.yml
- production-closure.yml
- production-evidence-boundary.yml
- production-integrity-wave-v2.yml
- production-release-gate-chain.yml
- recovery-readiness.yml
- release-certification.yml
- release-decision-provenance.yml
- release-drift-guard.yml
- release-manifest-integrity.yml
- report-execution-gate.yml
- runner-diagnostic.yml
- runtime-closure-wave.yml
- security-provenance-certification.yml

Observed count: 23 workflow files.

Topology rule: do not add another push-triggered production workflow until Quality coverage is disproved. Specialized duplicates remain manual or are consolidated.

## 7. package.json execution registry

`package.json` is a major executable index covering build/lint/typecheck/performance; resilience/release/trust; F/G/K/L/M; K→S; master requirements; file/schema/entity contracts; production certification/readiness/blockers; report execution/automation/forecast/billing/SaaS; Onyx/import; document intelligence; tenant/RLS; report truth/navigation/import guards; scenario/inventory/demand/batch/safe metrics/scale; analysis cache/concurrency; and document resilience/golden/evidence/provenance/regression/performance.

Do not invent script names. Confirmed correction: the actual batch command is `test:batch-decision`, not `test:batch-decision-engine`.

## 8. Existing work that MUST NOT be duplicated

Before coding, inspect existing Phase A0–M contracts, production readiness/release blockers, unified production decision chain, release evidence/manifest, resilience probes, tenant/RLS/security, document intelligence, import governance, Onyx, report execution, analysis cache/concurrency, inventory/demand/decision intelligence and executive UI.

Integration registry explicitly says existing production implementations win and alternate UI/query/import implementations were not merged wholesale. `main` is the source of truth. The cross-repository audit found the other reviewed repositories empty, so no blind merge source exists.

## 9. Historical truth ledger

- Run `32648883941`: TypeScript failure in `src/lib/analytics/filter-context.ts`; later run `32654180460` passed Typecheck and subsequent quality gates; regression guard exists.
- Historical `steps: null`/no-log failures are treated as CI bootstrap/runner evidence until a diagnostic reaches its first step; do not blame app code without runtime evidence.
- Previous owner E2E `AUTH=signed_out` is a runtime evidence gap.
- Historical import preview incorrectly classified existing SKUs as new; keep matching/mapping regression coverage.
- Ollama is optional; do not resurrect removed `/api/chat` or paid/Lovable gateway paths.

## 10. Consolidated P0 backlog — must close before production certification

- [ ] Real Supabase adversarial tenant certification
- [ ] Storage/signed URL verification
- [ ] Realtime authorization verification
- [ ] AI retrieval tenant isolation verification
- [ ] Backup restore drill + RPO/RTO evidence
- [ ] Staging migration dry-run + schema drift
- [ ] Environment parity
- [ ] Signed artifact verification at deployment boundary
- [ ] Stuck-worker/dead-letter recovery drill
- [ ] Incident/SLO rollback + forward-fix drill
- [ ] Security/secret audit
- [ ] Stabilization telemetry
- [ ] Final production certification bundle

## 11. Consolidated P1 backlog — connected runtime

- [ ] Bind durable watched-folder jobs to live browser coordinator
- [ ] Persist extraction checkpoints at real boundaries
- [ ] Feed real domain outputs into business-state snapshots
- [ ] Populate executive evidence graph from live decisions/KPIs
- [ ] Execute bounded optimizer scenarios on production-like snapshots
- [ ] Close recommendation→observed-outcome feedback
- [ ] Connect portfolio/materiality routing to executive UI/approval
- [ ] Connect drift/health scoring to live telemetry/canaries
- [ ] Execute real rollback drills and certify only proven autonomy domains

## 12. Consolidated P1 document-engine backlog

- [ ] Provider-neutral intermediate representation completeness
- [ ] Page/table classification
- [ ] Headerless/reverse schema discovery
- [ ] Extraction/provenance completeness
- [ ] Cell-level lineage where available
- [ ] Entity-resolution precision/recall evidence
- [ ] Mathematical reconciliation coverage
- [ ] Confidence/quarantine/reprocessing UX
- [ ] Golden corpus across Arabic/English, scanned, random/no-header, merged/multi-table and poor-quality files

## 13. Consolidated P2 UX / predictive backlog

- [ ] Command Palette / keyboard-first workflows
- [ ] Saved views / filters / grouping / reset persistence
- [ ] Executive cockpit → drill-down → evidence → action E2E
- [ ] Deterministic what-if/scenario engine with evidence/inaction impact
- [ ] Cross-filter/drill-down production UI proof
- [ ] Connected knowledge/evidence workspace
- [ ] Low-bandwidth/mobile/throttled-network proof
- [ ] Forecasting production backtesting/minimum-data UX
- [ ] Closed-loop forecast quality
- [ ] Provider failure/fallback E2E
- [ ] Live AI retrieval isolation canary
- [ ] Evidence-grounded Ask→Inspect→Act E2E

## 14. Exact next execution sequence

### NOW-1 Inventory closure
Enumerate all workflows, triggers, package scripts, `scripts/check-*`, and Phase E–M dependencies; classify canonical/specialized/duplicate/obsolete.

### NOW-2 Deep runtime audit
For each critical contract: Contract → implementation → test → workflow → evidence → live dependency. Fix only real gaps.

### NOW-3 Document engine closure
Complete missing internal document/data intelligence pieces on the existing provider-neutral architecture.

### NOW-4 J/K/L connected runtime
Connect watched reports, checkpoints, business snapshots, evidence graph, optimizer, outcome feedback and UI action loop.

### NOW-5 E/F/H/I live certification
Execute tenant, storage, realtime, AI, backup, worker, SLO, rollback and governance canaries.

### NOW-6 Master production decision
Consolidate release evidence/manifest/recovery/certification into one authoritative chain without duplicate push CI.

### NOW-7 Real CI/runtime execution
Run Quality and required manual/live workflows. Diagnose actual failures only when steps/logs exist. Fix root causes and rerun.

### NOW-8 Final certification
Only after all P0 blockers are zero and current live evidence exists.

## 15. Mandatory progress record

```text
Date: 2026-08-25
Phase: Tenant / Import / Runtime integration hardening
Goal: Proactively close legacy tenant consumers and harden the File→Import→Tenant→Persistence chain without waiting for CI failures.
Status before: FOUNDATION/GATED
Files inspected: src/lib/tenantContext.ts; src/lib/import/canonical-commit.ts; scripts/check-tenant-legacy-consumers.mjs; scripts/check-import-transaction-contract.mjs; canonical tenant membership migration; current quality workflow.
Files changed: tenantContext.ts; canonical-commit.ts; check-tenant-legacy-consumers.mjs; check-import-transaction-contract.mjs; this index.
Tests/workflows inspected: quality.yml; tenant legacy consumer guard; import transaction contract.
Commit(s): 6731406e2b885d7c1a23396ca119728f742c1cbf plus follow-up tenant/import hardening commits on main.
Discovery: tenantContext contained a legacy tenant_memberships consumer and could select a tenant from client-side membership ordering; canonical invoice import accepted direct customer_id without proving tenant ownership.
Root cause: integration drift between the canonical company_memberships/current_company_id path and an older tenant context implementation; imported foreign keys were treated as trusted input.
Fix: tenant context now reads canonical company_memberships and binds UI context to resolveCurrentCompanyId; client-selected tenant mismatch fails closed. Canonical invoice customer_id is verified against company_id before RPC persistence. Legacy consumer guard now scans src and scripts for static/legacy tenant patterns. Import transaction guard now checks lifecycle/locking and direct customer tenant verification.
Verification: static contract guards added/strengthened; CI is expected to execute them through quality.yml. No runtime claim is made until the resulting CI run provides evidence.
Runtime evidence: LIVE REQUIRED for real Supabase adversarial tenant/storage/realtime/AI canaries.
Remaining gap: KPI end-to-end truth parity and live recovery/canary evidence remain to be audited next; no fabricated PASS.
Next exact action: continue proactive KPI Source→Formula→Query→Service→Dashboard→Report→Export audit, then Evidence→Quality→Confidence→Decision→Recommendation→Outcome and lease/recovery integration drift, while CI runs in parallel.
```

## 16. Definition of Done

A capability is FULLY IMPLEMENTED only when applicable UI, backend/service, database/migrations, security/RLS/tenant scope, audit/event/queue behavior, error/loading/offline behavior, deterministic truth/evidence, unit/contract/integration/regression tests, E2E/runtime evidence, performance/load evidence and documentation are present and compatible.

## 17. Golden rule

> افحص المرجع → افحص المستودع → افحص ما تم سابقًا → حدد الفجوة → أصلح الموجود → اختبر → سجل الدليل → حدّث هذا الملف → انتقل للخطوة التالية.

## 18. 2026-08-25 Proactive closure ledger

- **Tenant integration drift — CLOSED STATIC GAP:** `src/lib/tenantContext.ts` no longer consumes the legacy `tenant_memberships` relation or silently chooses a tenant by client array order. It is bound to canonical `company_memberships` plus `resolveCurrentCompanyId()`.
- **Client-selected tenant mismatch — FAIL CLOSED:** a preferred company id is accepted only when it equals the authoritative resolver result; otherwise tenant context is cleared rather than silently switching/falling back.
- **Imported foreign customer id — CLOSED STATIC GAP:** invoice import now verifies `customer_id + company_id` before committing. Name resolution remains company-scoped.
- **Legacy consumer discovery guard — HARDENED:** scans executable `src` and `scripts` surfaces for `COMPANY_ID`, `tenant_memberships`, static tenant ids, and known client-sourced company filters outside the canonical compatibility boundary.
- **Import transaction guard — HARDENED:** validates durable job/row lifecycle, terminal status handling, locking, failed/cancelled paths, governed bulk persistence, and direct customer tenant verification.
- **CI status:** latest observed quality run `32874659379` failed on the prior documentation commit; the follow-up `6731406e...` changed the roadmap contract, and subsequent tenant/import hardening commits intentionally trigger fresh Quality runs. No PASS is claimed until an actual run proves it.
- **Still LIVE REQUIRED:** adversarial Supabase tenant isolation, storage/signed URLs, realtime auth, AI retrieval isolation, backup restore, worker/dead-letter recovery, production rollback and canary evidence.

## 19. Mandatory parallel execution rule

CI is a verifier, not a scheduler. While Quality is running, continue proactive repository-wide audits of Tenant → Import → KPI/BI → Evidence/Decision → Lease/Recovery → Isolation/Resilience. Do not wait for one CI failure before inspecting independent surfaces. Every fix must have a root cause, bounded scope, reuse of existing architecture, and a corresponding guard/test before it is considered closed.
