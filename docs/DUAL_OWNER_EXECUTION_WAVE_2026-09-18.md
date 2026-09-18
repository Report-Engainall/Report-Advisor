# الأغبري — Dual-Owner Execution Wave
## 2026-09-18

This document is the live ownership boundary for command `2`. It is intentionally separate from `docs/MASTER_EXECUTION_INDEX.md` so the execution index is not churned during active remediation.

## Owner 1 — ChatGPT / Product & UI Engineering

**Primary responsibility:** continue real product development in parallel with runtime certification work. Do not wait for programmer gates when an independent source/UI task is actionable.

### Latest completed development in this ownership wave
- `src/pages/ReportsPage.tsx`: Reports Center is now decision-output first and reads the canonical dashboard snapshot for current truth context.
- `src/pages/IntelligencePage.tsx`: Intelligence now exposes the shared truth context without making it a second source of truth.
- `src/pages/DecisionExperiencePage.tsx`: Decision Experience now carries the same evidence/time-bound context when the canonical snapshot is available.
- `src/pages/DemandVelocityPage.tsx`: demand rows are now investigation-first and open the existing lazy-loaded investigation drawer with explicit confirmed vs missing evidence.
- `src/components/CommandPalette.tsx`: recent command ordering now follows actual recency rather than alphabetical tie-breaking.
- `src/pages/InventoryIntelligencePage.tsx`: grouped inventory rows now open the existing investigation drawer with coverage, demand, missing-evidence and next-action context.
- `src/pages/DataQualitySnapshotPage.tsx`: quality entity cards now deep-link to the relevant business context while preserving explicit EMPTY/score semantics.
- Current code HEAD: `5151802350e8240379d0e5d8dfe414cb0c78b62f`.
- The shared development remains on the isolated integration branch; `main` is not mutated by this wave.

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

### Active runtime fronts (live boundary refreshed from the repository execution ledger)
1. Fresh exact-head authenticated business/browser E2E, including Actor A/B tenant isolation, persistence/read-back and logout/refresh continuity.
2. Re-prove the full runtime matrix on the final integrated SHA; do not transfer evidence from earlier SHAs.
3. Phase-F live resilience: configure/repair canonical live endpoint targets after the current 0/4 live probe failures (HTTP 404 / transport failure / HTTP 405), without synthetic endpoints.
4. Durable worker disposable lifecycle: enqueue → claim → heartbeat/checkpoint → expiry/recovery → retry/DLQ, only where fresh exact-head evidence is still absent.
5. Backup/restore verification with measured RPO/RTO; the current ledger reports no verification rows.
6. Exact deployed-SHA parity and release stabilization.
7. Final fail-closed certification bundle.

**Already closed in the current repository ledger and not to be reopened without a changed SHA/environment/contract:** security/source-parity closure, import-row integrity, service-role-only worker RPC authority/search_path hardening, and the immediately preceding Storage Tenant Runtime E2E PASS. PDF historical results are not certification evidence for a newer SHA; rerun only when the final integrated SHA is ready.

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
