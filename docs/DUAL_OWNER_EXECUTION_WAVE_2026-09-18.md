# الأغبري — Dual-Owner Execution Wave
## 2026-09-18

This document is the live ownership boundary for command `2`. It is intentionally separate from `docs/MASTER_EXECUTION_INDEX.md` so the execution index is not churned during active remediation.

## Owner 1 — ChatGPT / Product & UI Engineering

**Primary responsibility:** continue real product development in parallel with runtime certification work. Do not wait for programmer gates when an independent source/UI task is actionable.

### Active development fronts
1. **Business Command System completion**
   - Preserve the operating model: Today → Operations → Money → Intelligence & Decisions → Outputs → Reference → Administration.
   - Every important business signal remains an investigation entry point.
   - Avoid reverting to CRUD-first/report-catalogue navigation.

2. **Evidence / Trust UX**
   - Make source, tenant, period, as-of, freshness, currency and evidence state visible on decision-critical surfaces.
   - Keep missing evidence explicit: INSUFFICIENT_DATA / REVIEW / BLOCKED / UNAVAILABLE.
   - Never infer certainty from a visual state.

3. **Intelligence & Decision Experience**
   - Strengthen recommendation, forecast and scenario surfaces around evidence → decision → action → outcome.
   - Keep deterministic metric truth separate from AI-assisted explanation.

4. **Work Center / operational UX**
   - Surface exceptions, import lifecycle, review state and next valid action using existing canonical read paths.
   - No parallel job/write state.

5. **Reports / executive outputs**
   - Reports are decision outputs, not a CRUD catalogue.
   - Improve executive framing, evidence context, print/export treatment and investigation entry points using existing adapters.

6. **Shared design system**
   - Arabic RTL, consistent hierarchy/density, reusable states, tables, cards, drawers, focus states and mobile behavior.
   - Reduce visual duplication and avoid unnecessary dependencies/assets.

7. **Mobile / PWA / low-bandwidth**
   - Route-level lazy loading, progressive disclosure, lightweight initial shell, usable tables/forms at mobile widths, offline shell continuity.

8. **Commercial / Proposal Demo**
   - Keep Proposal Demo Mode aligned with real product capabilities; no invented evidence.
   - Prepare the product for job-specific demonstrations after Core/RC gates remain healthy.

### Rules
- Reuse existing RPCs, adapters and runners.
- No fake business data, fixture evidence, synthetic PASS, direct terminal writer, or certification bypass.
- Validate each changed surface with typecheck/build/route and targeted UI contracts where available.
- Do not rerun closed checks unless SHA/environment/contract changed.

## Owner 2 — Programmer / Runtime, DB, CI & Release

**Primary responsibility:** close everything requiring governed runtime credentials, DB mutation, GitHub Actions secrets, storage configuration, production parity or certification authority.

### Active runtime fronts
1. Fresh exact-head authenticated business/browser E2E, including Actor A/B tenant isolation.
2. Persistence/read-back root-cause closure.
3. Positive PDF text + Arabic OCR commit path.
4. Worker enqueue → claim → heartbeat/checkpoint → expiry/recovery → retry/DLQ.
5. Storage signed-URL tenant runtime.
6. Phase-F operational resilience and measured backup/restore/RPO/RTO.
7. Exact deployed-SHA parity.
8. Final fail-closed certification bundle.

### Required external inputs
- Real GitHub Actions runtime secrets/targets where absent.
- Real storage bucket configuration where absent.
- Provider quota/production deployment access where the provider itself blocks execution.

### Rules
- Staging first for mutable DB changes.
- No historical evidence transfer to a new Exact HEAD.
- No fabricated sessions/JWTs/fixtures/PASS.
- No new runner/RPC when an existing canonical path works.
- Report the exact human action immediately when an external blocker cannot be changed by the programmer.

## Parallel execution rule

The two owners work concurrently. A runtime blocker must not stop independent product development, and a UI change must not be presented as certification evidence.

## Completion rule

The project is not marked DONE until:
- product development fronts are materially complete;
- fresh exact-head runtime evidence is complete;
- all required terminal scenarios are real and traceable;
- certification is PASS on the governed Exact HEAD;
- no prohibited historical/synthetic evidence is used.
