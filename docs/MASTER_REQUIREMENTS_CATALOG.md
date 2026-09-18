# Report-Advisor — Master Requirements Catalog
## Canonical unified requirements register — 2026-09-18

> الهدف: هذا الملف هو سجل المتطلبات الموحّد لمشروع Report-Advisor. يجمع متطلبات الجداول القديمة والحديثة، موجات التنفيذ، متطلبات المنتج والواجهة والتشغيل والاعتماد، مع طبقة منفصلة لإشارات السوق.
>
> القاعدة: تبقى الوثائق التاريخية محفوظة كأرشيف ومصدر تتبع. هذا الملف يزيل التكرار ويحتفظ بصف واحد مرجعي لكل متطلب. وجود المتطلب هنا لا يعني أنه Certified.
>
> Evidence rule: لا تنتقل الأدلة بين SHAs، ولا يرفع تحديث الوثيقة حالة إلى PASS.
>
> Scope rule: مواد Upwork والسوق محفوظة في طبقة MARKET SIGNAL فقط، ولا تصبح متطلبات منتج إلا بعد Product Value Gate.

---

## 1. Canonical status vocabulary

| Status | Meaning |
|---|---|
| DONE | مغلق على مستوى التنفيذ الموثق؛ المتطلبات runtime/certification تحتاج دائمًا دليل Exact-HEAD عند الاعتماد. |
| IN_PROGRESS | تنفيذ أو إغلاق جارٍ. |
| OPEN | متطلب موجود وما زال يحتاج تنفيذًا أو دليلًا. |
| CONDITIONAL | مطلوب فقط إذا بقي ضمن نطاق الإصدار أو البيئة المستهدفة. |
| BLOCKED_EXTERNAL | متوقف على prerequisite خارجي محدد. |
| GOVERNANCE | قاعدة تشغيل/قرار وليست ميزة. |
| MARKET_SIGNAL | إشارة سوقية خارجية وليست التزامًا برمجيًا. |
| ARCHIVE | سجل تاريخي تم توحيده في صف أحدث. |

---

## 2. Core product identity and truth model

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| CORE-001 | Report-Advisor هو Evidence-First Decision Operating System | الهوية متسقة في المنتج والديمو والمواد التجارية | GOVERNANCE | Owner/Product |
| CORE-002 | Truth chain: source → formula → period → tenant → as-of → freshness → evidence → result | كل KPI/نتيجة مادية قابلة للتتبع بهذه الأبعاد | IN_PROGRESS | Engineering + UI |
| CORE-003 | Document chain: Document → Extraction → Normalization → Validation → Evidence → Confidence → Canonical Data → DB → KPI → Report | لا فقدان للـlineage ولا fabricated data | IN_PROGRESS | Engineering |
| CORE-004 | Missing/invalid/unknown data fail closed | لا KPI أو state مصنوع من نقص البيانات | DONE / continuous guard | Engineering |
| CORE-005 | Tenant identity database-authoritative | current_company_id / canonical tenant resolver وRLS/RPC هي السلطة | DONE | Engineering |
| CORE-006 | لا client-selected tenant يصبح security authority | أي tenant hint من العميل defense-in-depth فقط | DONE | Engineering |
| CORE-007 | Exact-SHA evidence binding | المصدر والمرشح وعدد السيناريوهات والحالات والـhashes تطابق المرشح | DONE / certification fail-closed | Engineering |
| CORE-008 | لا نقل evidence تاريخية إلى SHA أحدث | الأدلة السابقة لا تصدّق المرشح الجديد | DONE / governance | Engineering |
| CORE-009 | Existing RPC/adapter paths preferred | لا Runner/RPC architecture موازية بلا موافقة | GOVERNANCE | Engineering |
| CORE-010 | Commit authority server-side/canonical | الواجهة لا تغلق أو تعتمد authoritative import/business state | DONE | Engineering |
| CORE-011 | Resource economy | إزالة build/assets/dependencies المكررة قبل إضافة الثقيلة | IN_PROGRESS | Both |
| CORE-012 | Narrow specialization over feature count | أي إضافة تمر عبر Proof / Differentiation / Revenue gate | GOVERNANCE | Owner/Product |

---

## 3. Authentication, tenancy, RBAC and security

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| SEC-001 | Supabase Auth + persistent session | AuthGate/session restoration تعمل | IN_PROGRESS | Engineering |
| SEC-002 | Fail-closed tenant resolution | لا business operation بدون tenant صالح | DONE / runtime proof required | Engineering |
| SEC-003 | Real Tenant A/B browser proof | كل Actor يرى tenant الخاص فقط | OPEN | Programmer |
| SEC-004 | Cross-tenant browser denial | real session لا يقرأ/يكتب tenant آخر | OPEN | Programmer |
| SEC-005 | RLS on relevant public tables | كل الجداول الحرجة tenant-scoped ومحمية | DONE / fresh current-head verification | Engineering |
| SEC-006 | No anonymous access to business data | anon select/mutate denied | DONE / continuous guard | Engineering |
| SEC-007 | Membership/active membership authority | العضوية الفعالة هي مصدر authority | IN_PROGRESS | Engineering |
| SEC-008 | RBAC/business-role authority | approval/mutation authority canonical and adversarially verified | OPEN | Programmer |
| SEC-009 | Self-approval forbidden | approver cannot approve own controlled action | DONE / runtime proof required | Engineering |
| SEC-010 | Assignee authority | assigned work item requires authenticated assignee when applicable | DONE / runtime proof required | Engineering |
| SEC-011 | SECURITY DEFINER pinned search_path | functions use explicit safe path | DONE | Engineering |
| SEC-012 | Least-privilege EXECUTE | privileged routines only callable by justified roles | IN_PROGRESS | Engineering |
| SEC-013 | Certification RPC protected | release decision helper unavailable to normal roles | DONE | Engineering |
| SEC-014 | Direct truth-writer bypass closed | decision outcomes/audit/certification evidence not forgeable by authenticated DML | DONE | Engineering |
| SEC-015 | Leaked-password protection | Auth control-plane protection enabled when required | OPEN / owner boundary | Programmer/Owner |
| SEC-016 | Secrets never enter browser/demo | no service-role key/private token/test secret fixture in demo | DONE / continuous | Engineering |

---

## 4. Canonical import, reconciliation and data quality

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| IMP-001 | Canonical import is the business mutation path | existing canonical contracts only | DONE | Engineering |
| IMP-002 | Import lifecycle checkpoints | queued → fingerprinted → extracted → canonicalized → validated → analyzed → decisioned → committed → rendered | DONE / runtime proof required | Engineering |
| IMP-003 | Transactional canonical commit | persistence + terminal lifecycle governed atomically | DONE / runtime proof required | Engineering |
| IMP-004 | Full-chunk validation before persistence | invalid chunk cannot partially commit | DONE | Engineering |
| IMP-005 | Commit count and IDs reconcile | returned IDs/counts match persisted state | DONE | Engineering |
| IMP-006 | Terminal state cannot resurrect | completed/failed cannot reopen normally | DONE | Engineering |
| IMP-007 | Terminal replay idempotency | repeat completion returns controlled terminal response | DONE / runtime proof required | Engineering |
| IMP-008 | Tenant-authoritative import | caller cannot choose foreign tenant | DONE | Engineering |
| IMP-009 | Duplicate file identity | normalized SHA-256 identity is tenant scoped and deterministic | DONE | Engineering |
| IMP-010 | Business-key normalization/order-independent fingerprint | equivalent source permutations resolve to stable identity | DONE / runtime proof required | Engineering |
| IMP-011 | Deleted-row reconciliation observational only | deleted/source-only keys reported, not implicitly deleted | DONE | Engineering |
| IMP-012 | NULL import truth preserved | unknown remains unknown; no zero fabrication | DONE | Engineering |
| IMP-013 | Quarantine is source-derived | no hard-coded quarantined count | DONE | Engineering |
| IMP-014 | Data-quality visibility | missing/invalid/duplicate/anomalous data visible and actionable | IN_PROGRESS | Engineering + UI |
| IMP-015 | Tenant-safe reconciliation evidence | no cross-tenant leakage | DONE / runtime proof required | Engineering |
| IMP-016 | Large-file/scale proof | representative large source succeeds within resource envelope | OPEN | Programmer |
| IMP-017 | Excel/Onyx authenticated E2E | representative governed corpus reaches report/readback | OPEN | Programmer |
| IMP-018 | Migration/source parity | current DB/source and repo lineage agree via forward-only reconciliation/replay | IN_PROGRESS | Programmer |

---

## 5. Document intelligence, PDF and OCR

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| DOC-001 | Structured PDF/document extraction | existing extraction path produces governed source envelope | DONE / runtime proof required | Engineering |
| DOC-002 | Arabic OCR runtime | Arabic corpus passes extraction/normalization/validation | OPEN | Programmer |
| DOC-003 | OCR confidence thresholds | <50 reject; 50–74 review; >=75 trusted | DONE | Engineering |
| DOC-004 | Document provenance/lineage | extracted values remain traceable to source | DONE / runtime proof required | Engineering |
| DOC-005 | Raw documents not sent to local AI | local AI assistive/bounded only | DONE / governance | Engineering |
| DOC-006 | PDF text positive commit | extraction → normalization → validation → canonical commit → render | OPEN | Programmer |
| DOC-007 | Arabic OCR positive commit | confidence-eligible OCR document reaches canonical commit | OPEN | Programmer |
| DOC-008 | Low-confidence/no-text fail closed | review/reject rather than fabricated data | DONE | Engineering |
| DOC-009 | Golden corpus runtime proof | real documents traverse full chain on Exact HEAD | OPEN | Programmer |
| DOC-010 | OCR/error state visible in UI | review/reject/insufficient-data states are explicit | IN_PROGRESS | UI + Engineering |

---

## 6. Decision, evidence, recommendation and outcomes

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| DEC-001 | Decision work-item one-to-one linkage | controlled relation exists | DONE | Engineering |
| DEC-002 | Decision/recommendation provenance | evidence/decision provenance retained | DONE | Engineering |
| DEC-003 | Only actionable work items complete | OPEN/IN_PROGRESS allowed; BLOCKED/CANCELLED denied | DONE | Engineering |
| DEC-004 | Terminal approval consistency | terminal approvals cannot reopen improperly | DONE | Engineering |
| DEC-005 | Recommendation outcome linkage | linkage consistency and duplicate protection | DONE | Engineering |
| DEC-006 | Recommendation includes scope/evidence/confidence/action/limitations | no unsupported AI-chat-only recommendation | IN_PROGRESS | Engineering + UI |
| DEC-007 | Evidence-first recommendation UX | opens Decision Experience at Evidence stage | DONE | UI |
| DEC-008 | Outcome tracking | action → observed outcome through governed path | DONE / runtime proof required | Engineering |
| DEC-009 | Proof-state vocabulary | PROVEN / DEMO / PARTIAL / BLOCKED visible | DONE | UI + Governance |
| DEC-010 | Authenticated decision E2E | real decision→approval→work→outcome lifecycle | OPEN | Programmer |

---

## 7. Durable worker, queue and reliability

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| WRK-001 | Durable queue lifecycle | tenant identity + canonical states | DONE | Engineering |
| WRK-002 | Lease ownership/fencing | lease owner/token protects writes | DONE | Engineering |
| WRK-003 | Heartbeat/checkpoint | long-running progress preserved | DONE | Engineering |
| WRK-004 | Monotonic checkpoint | progress cannot regress | DONE | Engineering |
| WRK-005 | Retry budget | bounded positive retry values | DONE | Engineering |
| WRK-006 | Dead-letter terminal branch | rollback-safe dead_letter transition | DONE | Engineering |
| WRK-007 | Crash/expiry recovery | disposable job recovers after forced expiry | OPEN | Programmer |
| WRK-008 | Duplicate/stale worker fencing | stale worker cannot overwrite new owner | OPEN / runtime | Programmer |
| WRK-009 | Retry→DLQ live proof | actual runtime transition observed | OPEN | Programmer |
| WRK-010 | Worker service-role boundary | browser/authenticated role cannot invoke worker-only mutation | DONE | Engineering |

---

## 8. Watched folders / external ingestion

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| WATCH-001 | Watched-folder contract | stability wait, traversal defense, dedupe, rescan/delete logic | DONE | Engineering |
| WATCH-002 | Watcher tenant binding | file discovery remains tenant-safe | DONE / runtime proof required | Engineering |
| WATCH-003 | Watcher→ingestion E2E | event → canonical ingestion → terminal result | OPEN | Programmer |
| WATCH-004 | Windows native lifecycle | target OS exact-head proof | OPEN / CONDITIONAL | Programmer/Owner |
| WATCH-005 | Electron remediation | Electron path consumed only after exact-head evidence | OPEN | Programmer |

---

## 9. Storage, realtime and AI/vector

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| STR-001 | Private document bucket | bucket private | DONE | Engineering |
| STR-002 | Tenant/path/owner storage policies | read/write/delete tenant safe | DONE | Engineering |
| STR-003 | Signed URL runtime proof | governed signed URL works in real auth session | OPEN | Programmer |
| STR-004 | Storage CRUD runtime proof | upload/read/delete real path | OPEN | Programmer |
| STR-005 | Realtime scope decision | retain or remove from release scope explicitly | OPEN | Owner/Product |
| STR-006 | Realtime authorization proof | channels/tables safe if kept | OPEN / CONDITIONAL | Programmer |
| STR-007 | AI capability/routing architecture | optional and bounded | DONE | Engineering |
| STR-008 | Local Ollama optional capability | no mandatory paid base dependency | DONE | Engineering |
| STR-009 | Tenant-isolated retrieval | no cross-tenant vector/retrieval | OPEN / CONDITIONAL | Programmer |
| STR-010 | AI provenance | AI-derived claims trace to source/evidence | IN_PROGRESS | Engineering |

---

## 10. Reports, exports and financial truth

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| REP-001 | Canonical dashboard snapshot | dashboard uses canonical tenant-safe source | DONE | Engineering |
| REP-002 | Canonical dashboard intelligence | intelligence uses existing canonical sources | DONE | Engineering |
| REP-003 | Metric resolver governance | known aliases resolve; unknown metric fails closed | DONE | Engineering |
| REP-004 | Tenant currency truth | tenant currency consistent; no silent SAR/YER-style substitution | DONE | Engineering |
| REP-005 | KPI evidence snapshots | material KPI can resolve to evidence | DONE / runtime proof | Engineering |
| REP-006 | Canonical report sources | bounded report reads | DONE | Engineering |
| REP-007 | Export integrity/provenance | artifact traceable and integrity checked | DONE / runtime proof | Engineering |
| REP-008 | PDF/print RTL truth | rendered output preserves RTL/truth states | IN_PROGRESS | UI + Programmer |
| REP-009 | XLSX/CSV governed export | supported exports usable and bounded | DONE / runtime proof | UI + Engineering |
| REP-010 | Financial readback | DB→UI→refresh truth for sales/receivables/customers/products/invoices | OPEN | Programmer |
| REP-011 | Profitability truth | insufficient/invalid data fails closed | DONE / runtime proof | Engineering |
| REP-012 | Receivables/aging truth | tenant-safe and decision-ready | DONE / runtime proof | Engineering |
| REP-013 | Inventory intelligence truth | no invented criticality | DONE | Engineering |
| REP-014 | Demand velocity truth | no decisions from insufficient evidence | DONE | Engineering |

---

## 11. Performance, scale and resource economy

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| PERF-001 | Route-level lazy loading | heavy resources only on required routes | IN_PROGRESS | UI |
| PERF-002 | Bundle budget | critical/largest JS remain under budget | DONE at latest verified UI head | UI |
| PERF-003 | Query/read bounds | reports/lists/exports bounded | DONE | Engineering |
| PERF-004 | Large-tenant benchmark | representative scale measured | OPEN | Programmer |
| PERF-005 | Concurrency benchmark | concurrent workload measured | OPEN | Programmer |
| PERF-006 | EXPLAIN/DB evidence | critical SQL measured with representative data | OPEN | Programmer |
| PERF-007 | CI/deploy resource economy | duplicate builds/artifacts minimized | IN_PROGRESS | Programmer |
| PERF-008 | Git asset economy | no unnecessary large assets/dependencies | IN_PROGRESS | Both |
| PERF-009 | Low-bandwidth UX | compact payloads + graceful degradation | IN_PROGRESS | UI |
| PERF-010 | Mobile responsive UX | small-screen workflows usable | IN_PROGRESS | UI |

---

## 12. Backup, restore, rollback, resilience and observability

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| DR-001 | Backup target safeguards | non-prod, HTTPS, bounded timeout, private-target rejection | DONE | Engineering |
| DR-002 | Real backup verification | actual backup result | OPEN | Programmer/Owner |
| DR-003 | Isolated restore | restore to isolated non-production environment | OPEN | Programmer/Owner |
| DR-004 | Restore integrity | data integrity measured | OPEN | Programmer/Owner |
| DR-005 | RPO/RTO measured | actual timing evidence | OPEN | Programmer/Owner |
| DR-006 | Rollback safeguards | protected rollback contract | DONE | Engineering |
| DR-007 | Real rollback drill | rollback authorized and evidenced | OPEN | Programmer/Owner |
| DR-008 | Forward recovery | return to healthy intended state | OPEN | Programmer/Owner |
| DR-009 | Observability/SLO | failure modes and operational signals visible | IN_PROGRESS | Programmer |
| DR-010 | Phase F live resilience probes | actual live probe execution | BLOCKED_EXTERNAL | Owner/Programmer |
| DR-011 | Phase F live variables/targets provisioned | required environment secrets and URLs exist | BLOCKED_EXTERNAL | Owner |

---

## 13. UI/UX/accessibility/product experience

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| UI-001 | Arabic-first RTL shell | shell/navigation/header/sidebar native RTL | IN_PROGRESS | ChatGPT |
| UI-002 | Unified visual design system | typography/spacing/surfaces/buttons/forms/tables/states consistent | IN_PROGRESS | ChatGPT |
| UI-003 | TruthRail/evidence states | live/review/limited/blocked visually explicit | DONE / polish ongoing | ChatGPT |
| UI-004 | KPI drill-down | operational and evidence links separate | DONE | ChatGPT |
| UI-005 | Recommendation → Decision Experience | selected Evidence stage opens directly | DONE | ChatGPT |
| UI-006 | Command Palette | keyboard-first navigation on existing routes/actions | IN_PROGRESS | ChatGPT |
| UI-007 | Keyboard/focus semantics | focus, labels, activation without pointer | IN_PROGRESS | ChatGPT |
| UI-008 | Reduced motion/accessibility | reduced-motion/focus-visible/state communication | DONE / ongoing | ChatGPT |
| UI-009 | Responsive data tables | useful on mobile | IN_PROGRESS | ChatGPT |
| UI-010 | Responsive creation dialogs | safe viewport and scroll behavior | DONE | ChatGPT |
| UI-011 | Accessible file dropzones | keyboard file selection/drop behavior | DONE | ChatGPT |
| UI-012 | Saved views/filters/grouping | tenant-safe reuse without backend duplication | DONE / ongoing | ChatGPT |
| UI-013 | Onboarding state | user/company/membership/import/quality context | DONE / browser proof required | Both |
| UI-014 | Work Center | read-only import operational state; no duplicate job state | DONE / browser proof required | Both |
| UI-015 | Executive Command Center/Report | KPI→evidence→report narrative | IN_PROGRESS | ChatGPT |
| UI-016 | Data Quality UI | issue→evidence→remediation | IN_PROGRESS | ChatGPT |
| UI-017 | Intelligence/Analytics UI | evidence and decision context, not generic chat | IN_PROGRESS | ChatGPT |
| UI-018 | Inventory/Demand UI | signal→explanation→decision | IN_PROGRESS | ChatGPT |
| UI-019 | Receivables/Profitability/RFM/ABC/Aging UI | operational detail remains truth-aware | IN_PROGRESS | ChatGPT |
| UI-020 | Settings/profile/company UI | tenant-aware consistency | IN_PROGRESS | ChatGPT |
| UI-021 | Route/sidebar parity | app routes and sidebar entries aligned | DONE at latest verified head | ChatGPT |
| UI-022 | UI claim honesty | no PASS/healthy UI state without underlying evidence | DONE / governance | Both |
| UI-023 | Real browser visual/console proof | only claimed when real browser evidence exists | OPEN | Programmer |
| UI-024 | Competitive Track Lens | `/proposal-demo` exposes exactly five approved selective tracks and keeps proof/runtime gaps explicit | DONE | ChatGPT |

---

## 14. Workflow and route coverage

| ID | Workflow | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| FLOW-001 | Command Center | KPI → evidence → action | IN_PROGRESS | UI |
| FLOW-002 | Work Center | import records → filter/status → action | DONE | UI |
| FLOW-003 | Import/Analyze | upload → extraction → validation → commit | OPEN runtime | Engineering |
| FLOW-004 | Data Quality | issue → evidence → remediation | IN_PROGRESS | UI |
| FLOW-005 | Reports | report → evidence → export | IN_PROGRESS | UI + Engineering |
| FLOW-006 | Inventory | signal → explanation → decision | IN_PROGRESS | UI |
| FLOW-007 | Demand | velocity → coverage/stockout context | IN_PROGRESS | UI |
| FLOW-008 | Receivables | balance/due state → collection/liquidity context | IN_PROGRESS | UI |
| FLOW-009 | Profitability | canonical finance truth → report | IN_PROGRESS | UI |
| FLOW-010 | RFM/ABC/Aging | segmentation/classification → action context | IN_PROGRESS | UI |
| FLOW-011 | Recommendations | recommendation → evidence → decision → outcome | DONE / runtime proof required | Both |
| FLOW-012 | Forecasts/Scenarios | governed inputs → scenario → decision; insufficient data fail closed | IN_PROGRESS | Both |
| FLOW-013 | Metric Inspector | metric identity → formula/source/evidence | DONE / runtime proof | UI |
| FLOW-014 | Customers/Products | tenant-scoped create/readback | IN_PROGRESS / runtime proof | Engineering + UI |
| FLOW-015 | Alternative Groups | grouped product/alternative context | IN_PROGRESS | UI |
| FLOW-016 | External File Analysis | file → extraction/analysis → evidence-aware result | IN_PROGRESS | Both |
| FLOW-017 | Canonical Scenario/Truth Guard | scenario truth gate → decision state | IN_PROGRESS | Both |

---

## 15. Commercial product layer

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| COM-001 | Proof-to-Proposal workspace | capability → proof state → proposal claim mapping | DONE | UI + Product |
| COM-002 | Proposal Demo commercial-proof contract | executable check covers real capability inventory | DONE | Engineering |
| COM-003 | Claim-safe proposals | claims cannot exceed latest evidence | DONE / governance | Product |
| COM-004 | Evidence Passport | concise current proof/SHA/state for buyer-facing use | IN_PROGRESS | Product/UI |
| COM-005 | Client Proof Room | buyer sees relevant proof without secrets | IN_PROGRESS | Product/UI |
| COM-006 | Commercial Proof Packs | repeatable short/long demo sequences | IN_PROGRESS | Product |
| COM-007 | Vertical Playbooks | repeatable discovery/delivery for high-fit tracks | IN_PROGRESS | Product |
| COM-008 | Outcome Ledger | baseline → action → observed result | IN_PROGRESS | Product |
| COM-009 | Productized offers | bounded outcomes rather than technology list | GOVERNANCE | Owner/Product |
| COM-010 | Opportunity fit classes | PROVEN_MATCH / DEMO_MATCH / PROOF_GAP / PRODUCT_GAP / DELIVERY_GAP / LOW_FIT | GOVERNANCE | Product |
| COM-011 | Narrow competitive specialization | depth + current proof + fast demo + disciplined scope | GOVERNANCE | Owner/Product |
| COM-012 | Five selective competitive tracks only | Evidence BI; Supabase/RLS; governed Excel/CSV; Arabic RTL B2B UX; inventory/receivables decision workspace | GOVERNANCE | Owner/Product |
| COM-013 | Product Value Gate | market signal does not auto-promote to product | GOVERNANCE | Owner/Product |
| COM-014 | Anti-noise boundaries | no generic ERP/BI clone/ETL marketplace/security scanner/giant AI platform | GOVERNANCE | Owner/Product |
| COM-015 | Track-scoped Proposal Demo | selected competitive wedge drives scoped requirements and demo sequence without inventing capabilities | DONE | ChatGPT |

---

## 16. Release, CI, certification and governance

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| REL-001 | Fail-closed Quality workflow | decoy/test-of-test checks cannot pass by comment/fake path | DONE | Engineering |
| REL-002 | Exact certification checkout | exact SHA/full history verified | DONE | Engineering |
| REL-003 | Certification evidence boundary | proof writers protected | DONE | Engineering |
| REL-004 | Fresh current-head CI | rerun when SHA/environment/contract changes | OPEN | Programmer |
| REL-005 | Deployment SHA binding | deployed artifact exact candidate | OPEN | Programmer |
| REL-006 | Authenticated browser E2E | real Chromium + real Supabase auth + real business state | OPEN | Programmer |
| REL-007 | Persistence E2E | write/readback/refresh | OPEN | Programmer |
| REL-008 | Migration disposable replay | current source/DB parity proven without historical rewrite | OPEN | Programmer |
| REL-009 | Release manifest | candidate/environment/config/provenance recorded | IN_PROGRESS | Programmer |
| REL-010 | Staging dry-run | staging before protected production | IN_PROGRESS | Programmer |
| REL-011 | Production parity | config/artifact/source parity | OPEN | Programmer |
| REL-012 | Final certification gate | missing evidence keeps release CLOSED | OPEN | Programmer |
| REL-013 | Netlify public access | administrative protection does not block intended app access | DONE / verify latest deploy | Programmer |
| REL-014 | Vercel build-rate-limit honesty | external rate limit is blocker, never bypassed | DONE / governance | Programmer |
| REL-015 | No unnecessary closed-check rerun | re-audit only after trigger | GOVERNANCE | Both |

---

## 17. Billing and commercial runtime

| ID | Requirement | Acceptance / proof boundary | State | Owner |
|---|---|---|---|---|
| BILL-001 | Provider-neutral billing model | plans/capabilities/subscriptions/usage/events coherent | DONE | Engineering |
| BILL-002 | Billing tenant RLS | tenant-scoped billing records | DONE | Engineering |
| BILL-003 | Idempotent usage/provider events | duplicate event cannot double apply | DONE | Engineering |
| BILL-004 | Quota/entitlement fail closed | missing/invalid entitlement does not silently grant | DONE | Engineering |
| BILL-005 | Billing SECURITY DEFINER boundary | anon/public execution revoked | DONE | Engineering |
| BILL-006 | Real provider webhook/payment runtime | only claimed with live evidence | OPEN / CONDITIONAL | Programmer |

---

## 18. Historical high-value closures preserved

| ID | Canonical historical requirement | Source lineage | State |
|---|---|---|---|
| HIST-001 | Direct decision_outcomes authenticated INSERT blocked | 2026-08-30 security rotation | DONE |
| HIST-002 | Direct audit_logs authenticated INSERT blocked | 2026-08-30 security rotation | DONE |
| HIST-003 | Certification evidence writer tables protected | trust/autonomy/backup/rollback evidence boundary | DONE |
| HIST-004 | BLOCKED/CANCELLED work items cannot execute | decision lifecycle hardening | DONE |
| HIST-005 | Self-approval/assignee runtime guards | decision runtime authorization cycle | DONE / runtime proof required |
| HIST-006 | Import Finish terminal lifecycle | canonical Import Finish migration lineage | DONE |
| HIST-007 | NULL import truth / no fabricated zero | import truth cycle | DONE |
| HIST-008 | Tenant-authoritative duplicate identity | import hardening cycles | DONE |
| HIST-009 | Workflow batch integrity guard | batch-integrity cycle | DONE |
| HIST-010 | Import lifecycle contract guard | import lifecycle cycle | DONE |
| HIST-011 | Optional local Ollama | AI capability cycle | DONE |
| HIST-012 | Migration provenance reconciliation | migration lineage cycles | DONE |
| HIST-013 | Production certification fail closed | all certification waves | GOVERNANCE |

---

## 19. Canonical remaining ownership split

### ChatGPT — UI/Product Experience
- Complete remaining UI surfaces and visual system without inventing backend contracts.
- Preserve truth states, evidence visibility, RTL, accessibility, mobile and low-bandwidth behavior.
- Complete commercial proof presentation around the five approved selective tracks using existing product surfaces.
- Improve proposal/demo/portfolio presentation without turning market signals into broad product modules.
- Maintain performance and storage economy.

### Programmer — Engineering/Runtime/Release
- Fresh exact-head authenticated browser E2E and Tenant A/B proof.
- Positive PDF/OCR commit path and real persistence/readback.
- Disposable migration/source replay parity.
- Worker crash/expiry/recovery/retry/DLQ proof.
- Storage signed URL/CRUD runtime proof.
- Realtime authorization if kept in scope.
- AI retrieval isolation if kept in scope.
- Backup/restore/RPO/RTO and rollback/forward recovery.
- Observability/SLO/security/secret audit.
- Production parity, artifact, staging dry-run, manifest, canary and final certification.

---

## 20. Consolidated 100% release definition

- [ ] Fresh required Quality/CI passes.
- [ ] Candidate/deployed SHA binding is exact.
- [ ] Real authenticated browser E2E passes.
- [ ] Tenant A/B isolation and cross-tenant denial are live-proven.
- [ ] Canonical authority/RBAC semantics are defined and proven.
- [ ] SECURITY DEFINER exposure is least privilege and justified.
- [ ] Import/create/readback/refresh works with real authenticated data.
- [ ] PDF/text and Arabic OCR positive paths are proven where in scope.
- [ ] Data-quality and reconciliation behavior is proven.
- [ ] Worker crash/recovery/retry/DLQ is proven.
- [ ] Watched-folder E2E is proven where in scope.
- [ ] Storage runtime proof exists where in scope.
- [ ] Realtime is proven or explicitly removed from release scope.
- [ ] AI/vector tenant isolation is proven where in scope.
- [ ] Reports/exports and financial readback are proven.
- [ ] Performance/scale evidence exists for representative data.
- [ ] Backup/restore/integrity/RPO/RTO evidence exists.
- [ ] Rollback/forward recovery evidence exists.
- [ ] Migration/source parity is replay-verified.
- [ ] Production configuration/artifact parity is exact.
- [ ] Final certification bundle is independently consumable.
- [ ] Actionable release debt = 0.

---

# 21. MARKET SIGNAL LIBRARY — retained in the same place, but NOT product backlog

> هذه البنود من جدول السوق الحالي، وتم تجميعها هنا حتى لا تضيع، مع الحفاظ على الفصل الصريح بينها وبين Core Product.

| ID | Market signal | Classification |
|---|---|---|
| MKT-01 | External market operating signal baseline | MARKET_SIGNAL |
| MKT-02 | Multi-tenant security proof | MARKET_SIGNAL |
| MKT-03 | SaaS takeover readiness | MARKET_SIGNAL |
| MKT-04 | Data import credibility | MARKET_SIGNAL |
| MKT-05 | Document intelligence credibility | MARKET_SIGNAL |
| MKT-06 | Production hardening | MARKET_SIGNAL |
| MKT-07 | Executive BI | MARKET_SIGNAL |
| MKT-08 | Decision intelligence | MARKET_SIGNAL |
| MKT-09 | Inventory and demand | MARKET_SIGNAL |
| MKT-10 | Receivables / cash | MARKET_SIGNAL |
| MKT-11 | Low-bandwidth delivery | MARKET_SIGNAL |
| MKT-12 | Arabic RTL | MARKET_SIGNAL |
| MKT-13 | Accessibility | MARKET_SIGNAL |
| MKT-14 | Exportability | MARKET_SIGNAL |
| MKT-15 | Auditability | MARKET_SIGNAL |
| MKT-16 | Data quality | MARKET_SIGNAL |
| MKT-17 | Integration discipline | MARKET_SIGNAL |
| MKT-18 | Performance | MARKET_SIGNAL |
| MKT-19 | Reusable demo | MARKET_SIGNAL |
| MKT-20 | Proposal-to-product traceability | MARKET_SIGNAL |
| MKT-21 | Proof strength labeling | MARKET_SIGNAL |
| MKT-22 | Scope honesty | MARKET_SIGNAL |
| MKT-23 | Vertical playbooks | MARKET_SIGNAL |
| MKT-24 | Client discovery accelerator | MARKET_SIGNAL |
| MKT-25 | Implementation plan | MARKET_SIGNAL |
| MKT-26 | Acceptance criteria | MARKET_SIGNAL |
| MKT-27 | Handoff readiness | MARKET_SIGNAL |
| MKT-28 | Case-study readiness | MARKET_SIGNAL |
| MKT-29 | Outcome measurement | MARKET_SIGNAL |
| MKT-30 | Reusable delivery assets | MARKET_SIGNAL |
| MKT-31 | Change-safe product evolution | MARKET_SIGNAL |
| MKT-32 | Commercial security posture | MARKET_SIGNAL |
| MKT-33 | Trust center | MARKET_SIGNAL |
| MKT-34 | Demonstrable failure handling | MARKET_SIGNAL |
| MKT-35 | Productized offers | MARKET_SIGNAL |
| MKT-36 | Fast fit assessment | MARKET_SIGNAL |
| MKT-37 | Proposal feedback loop | MARKET_SIGNAL |
| MKT-38 | Competitive differentiation | MARKET_SIGNAL |
| MKT-39 | No vanity AI | MARKET_SIGNAL |
| MKT-40 | Enterprise-readiness narrative | MARKET_SIGNAL |
| MKT-41 | Repeatable demo sequences | MARKET_SIGNAL |
| MKT-42 | Evidence-aware portfolio | MARKET_SIGNAL |
| MKT-43 | Proposal variants | MARKET_SIGNAL |
| MKT-44 | Opportunity economics | MARKET_SIGNAL |
| MKT-45 | Learning priority | MARKET_SIGNAL |

Promotion rule: MARKET SIGNAL → Candidate → Product Value Gate → approved scoped product work → implementation → Exact Evidence → commercial proof.

---

## 22. Historical source inventory

هذا السجل يوحد، ولا يحذف، الوثائق التالية:

- docs/MASTER_EXECUTION_INDEX.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_TABLE.md
- docs/MASTER_EXECUTION_INDEX_LATEST_STATUS_2026-08-25.md
- docs/MASTER_EXECUTION_INDEX_LATEST_STATUS_2026-08-25_BATCH-18.md
- docs/MASTER_EXECUTION_INDEX_ADDENDUM_2026-09-02-DASHBOARD-RUNTIME.md
- docs/MASTER_EXECUTION_INDEX_ADDENDUM_2026-09-02-PRODUCTION-TARGET-FORENSICS.md
- docs/MASTER_EXECUTION_INDEX_ADDENDUM_2026-09-18-DUAL-OWNER-WAVE.md
- docs/MASTER_EXECUTION_INDEX_APPEND_20260830.md
- docs/MASTER_EXECUTION_INDEX_APPEND_20260830_PHASE2.md
- docs/MASTER_EXECUTION_INDEX_APPEND_20260830_CYCLE004.md
- docs/MASTER_EXECUTION_INDEX_APPEND_20260830_CYCLE007.md
- docs/MASTER_EXECUTION_INDEX_APPEND_20260830_CYCLE008.md
- docs/MASTER_EXECUTION_INDEX_APPEND_20260830_CYCLE009.md
- docs/MASTER_EXECUTION_INDEX_APPEND_20260830_CYCLE010.md
- docs/MASTER_EXECUTION_INDEX_APPEND_20260830_CYCLE011.md
- docs/MASTER_EXECUTION_INDEX_APPEND_20260830_CYCLE013.md
- docs/MASTER_EXECUTION_INDEX_APPEND_20260830_CYCLE015.md
- docs/MASTER_EXECUTION_INDEX_APPEND_20260830_CYCLE015_CORRECTION.md
- docs/MASTER_EXECUTION_INDEX_APPEND_20260830_CYCLE017.md
- docs/MASTER_EXECUTION_INDEX_APPEND_20260830_CYCLE025_026.md
- docs/MASTER_EXECUTION_INDEX_APPEND_20260831_FINAL.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-7.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-8.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-9.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-10.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-11.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-12.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-13.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-14.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-15.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-16.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-18.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-19.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-26.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-27.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-28.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-29.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-30.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-26_BATCH-29.md
- docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-26_PR47.md
- docs/UPWORK-MARKET-REQUIREMENTS-20260918.md
- docs/SELECTIVE-COMPETITIVE-TRACKS-20260918.md
- docs/COMPETITIVE-ADVANTAGE-OPERATING-SYSTEM-20260918.md
- docs/UPWORK-BID-ENGINE-20260918.md

---

## 23. Canonical operating rule from now on

1. This file is the single requirements view used to plan remaining work.
2. Historical sources remain preserved for provenance.
3. New items must be classified as PRODUCT, RUNTIME/CERTIFICATION, UI/UX, GOVERNANCE, or MARKET_SIGNAL.
4. Duplicate requirements are merged into one canonical row.
5. Market signals cannot bypass Product Value Gate.
6. A documentation row saying DONE does not create runtime certification evidence.
7. Actual code, executable tests, live evidence and protected release gates remain authoritative for factual certification state.

Current posture: product scope is commercially focused around five selective wedges; final release/certification remains FAIL-CLOSED until the exact runtime/operational evidence is complete.

## 24. Latest exact-head UI binding — 2026-09-18
- Code/test SHA: `449e81d5`.
- Typecheck: PASS.
- Proposal commercial-proof contract: PASS; 16 capabilities and exactly five selective competitive tracks.
- Production build: PASS; 2802 modules transformed.
- Performance budget: PASS; critical 891.1KB/900KB and largest JS 488.0KB/600KB.
- Lint: 0 errors / 61 warnings; warnings are pre-existing project warnings except the removed unused ProposalDemo import.
- This wave changed UI/product-experience and its executable UI contract only; no DB/RPC/Runner/runtime authority was modified.
- Certification remains FAIL-CLOSED until programmer-owned Exact-HEAD runtime evidence closes the remaining release requirements.
