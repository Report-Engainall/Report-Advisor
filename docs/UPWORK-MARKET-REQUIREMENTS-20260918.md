# Upwork / Market Requirements — Aghbari Commercial Requirements
## 2026-09-18

هذه الوثيقة ليست قائمة features. إنها ترجمة لإشارات السوق إلى متطلبات قابلة للاختبار من داخل الأغبري.

## MKT-01 — Evidence-led proposals
كل عرض يجب أن يربط مطلب العميل بدليل من المنتج أو يصرح بأنه Proof Gap.

## MKT-02 — Multi-tenant security proof
المنتج يجب أن يملك مسار عرض واضح للعزل وRLS وRBAC وحالات الرفض.

## MKT-03 — SaaS takeover readiness
يجب أن نستطيع شرح البنية الحالية، الحدود، known risks، وخطة takeover بدون ادعاء ملكية كود أو بنية غير مثبتة.

## MKT-04 — Data import credibility
Excel/CSV/document workflows يجب أن تمر عبر source → validation → reconciliation → canonical truth.

## MKT-05 — Document intelligence credibility
OCR/extraction يجب أن يعرض confidence/review/reject states وليس نصًا خامًا فقط.

## MKT-06 — Production hardening
القدرة التجارية على التعامل مع retries، idempotency، observability، failure modes وrollback evidence.

## MKT-07 — Executive BI
KPI must connect to definition → source → report → decision.

## MKT-08 — Decision intelligence
لا يكفي "AI chat": recommendation must have scope, evidence, confidence, action and limitations.

## MKT-09 — Inventory and demand
من dashboard إلى reorder / coverage / stockout decision.

## MKT-10 — Receivables / cash
من amount إلى collection priority / due-date context / liquidity decision.

## MKT-11 — Low-bandwidth delivery
Mobile/responsive/compact payload and graceful degradation.

## MKT-12 — Arabic RTL
Arabic is a first-class experience, not post-processing.

## MKT-13 — Accessibility
Keyboard, focus, labels, contrast, semantic tables, reduced motion.

## MKT-14 — Exportability
Real business deliverables: PDF/XLSX/CSV/print where governed paths support them.

## MKT-15 — Auditability
Every material result must expose what supports it.

## MKT-16 — Data quality
Missing/invalid/duplicate/anomalous data must be visible and actionable.

## MKT-17 — Integration discipline
Existing adapters/RPCs preferred over duplicate architecture.

## MKT-18 — Performance
Route-level loading and controlled bundle size.

## MKT-19 — Reusable demo
Same product surface should demonstrate multiple job contexts.

## MKT-20 — Proposal-to-product traceability
Every proposal claim should map to a capability_id.

## MKT-21 — Proof strength labeling
PROVEN / DEMO / PARTIAL / BLOCKED must be explicit.

## MKT-22 — Scope honesty
Claims cannot exceed the latest verified evidence.

## MKT-23 — Vertical playbooks
Reusable discovery and delivery playbooks for high-fit categories.

## MKT-24 — Client discovery accelerator
Structured intake: problem, systems, inputs, risks, success criteria, acceptance.

## MKT-25 — Implementation plan
Every paid engagement should have a scoped implementation path.

## MKT-26 — Acceptance criteria
Deliverables must have testable acceptance criteria.

## MKT-27 — Handoff readiness
Documentation, training, export, ownership and support boundaries are explicit.

## MKT-28 — Case-study readiness
Completed work should become reusable proof only after customer-safe redaction/permission.

## MKT-29 — Outcome measurement
Baseline → action → observed result.

## MKT-30 — Reusable delivery assets
Templates, validators, UI patterns and test harnesses should reduce future delivery cost.

## MKT-31 — Change-safe product evolution
Market demands become backlog candidates, not uncontrolled feature forks.

## MKT-32 — Commercial security posture
No service-role keys, secrets, cross-tenant data or hidden test fixtures in demos.

## MKT-33 — Trust center
Potential clients need a concise place to understand data truth, security boundaries and evidence discipline.

## MKT-34 — Demonstrable failure handling
Show what happens when data is bad, stale, incomplete, unauthorized or offline.

## MKT-35 — Productized offers
Package repeatable outcomes, not a random list of technologies.

## MKT-36 — Fast fit assessment
A job must be classified quickly as high-fit, proof-gap, product-gap, delivery-gap, or low-fit.

## MKT-37 — Proposal feedback loop
Track proposal outcomes and feed patterns back into product/portfolio decisions.

## MKT-38 — Competitive differentiation
Every core sales story must answer: what is hard here, why are we credible, and what can the client see now?

## MKT-39 — No vanity AI
AI is commercial only when it improves a measurable workflow or decision.

## MKT-40 — Enterprise-readiness narrative
Security, resilience, auditability, deployability, maintenance and ownership must be discussable without pretending certification.

## MKT-41 — Repeatable demo sequences
Create 3–5 minute and 10–15 minute demo paths for distinct buyer problems.

## MKT-42 — Evidence-aware portfolio
Portfolio artifacts must show scope, result, limitations, evidence date and exact proof state.

## MKT-43 — Proposal variants
Proposal generator must support concise, technical, business-outcome and security-oriented narratives.

## MKT-44 — Opportunity economics
Track expected effort, delivery risk, proof coverage and commercial upside before spending excessive proposal effort.

## MKT-45 — Learning priority
A market signal only changes core roadmap after repeated evidence or strategic importance passes Product Value Gate.
