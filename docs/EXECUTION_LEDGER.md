# Report-Advisor — Execution Ledger

**Date:** 2026-09-08  
**Branch:** `fix/folder-sync-universal-persistence`

## Operating rule

This ledger and `docs/WORK_PLAN.md` are the durable execution memory for the active workstream. Every meaningful batch must:

1. build on the current branch state;
2. avoid reopening closed work;
3. preserve exact commit SHAs and evidence paths;
4. update the ledger and/or WORK_PLAN before moving to the next dependent batch;
5. never mutate the frozen release candidate or production aliases as part of ordinary feature work.

## Immutable release boundaries

- Protected Candidate: `14cc7cefc0fad622436b4845a0e4b46a8888e8a9`
- Exact Release Candidate: `d846821b8d969aaa384ab85487a0dcf264a65aca`
- Frozen candidate policy: no reset, rebase, merge, push, code mutation, CI configuration mutation, alias mutation, rollback, or other certification-boundary mutation without an explicit release operation.

## Confirmed implementation batches

| Batch | Area | Evidence / implementation | Exact SHA | Status |
|---|---|---|---|---|
| 01 | Universal external-file analysis | external analysis UI + security/fingerprint/format/schema/preview boundary | `3c2372b9d8ae4e5008c46641625fe05bdc56ee1` | Implemented; no DB write claim |
| 02 | Folder sync durability | folder session persistence + universal per-file inference + source-analysis snapshots | `7c15dbc07a8e142e31e049df806ea61c7e188fd7` | Implemented; operational E2E still blocked |
| 03 | Decision/task lifecycle | proposals + dedupe + approved conversion + start/complete/outcome gates | `3789430953c3ef6b5c8e4234a1c11d23dd4ce9f` | Implemented partially across lifecycle |
| 04 | Decision learning | learning read model + governed recommendation ranking | `f6b0317377b65b3207e20b9e54377cddb4322315` | Implemented; adaptive write-back intentionally not automatic |
| 05 | Alternative bridge | alternative read model + deterministic/learning-aware ranking + decision bridge | `9b68920515df72c8a2a27f838b3b6d0c67a463b2` | Implemented read-only bridge |
| 06 | Executive report | executive decision report library/UI + read model + freshness/quality contracts | `a1c499f432b69f2f97617b05cdcad07a692b9f3b` | Feature integration exists; branch verification continued |
| 07 | Global product chain | canonical chain + Sales/Inventory/Purchasing vertical slice | `dd62e197cca3d94484572c75cd170122a6627080` / `ea22a70995815fdb57326f7707db98780956efe5` | Architecture/evidence locked |
| 08 | Durable execution memory | `docs/EXECUTION_LEDGER.md` + WORK_PLAN rule | `2e4c1314736a662e7f5cc3f1e6faa0439f145d4a` | Implemented |
| 09 | Executive read-model persistence | canonical Staging migration for `get_executive_decision_report(integer)` | `2e4c1314736a662e7f5cc3f1e6faa0439f145d4a` | GitHub persisted; applied to Staging |
| 10 | Executive freshness/quality UX | generated/as-of timestamps + live/empty state + lifecycle completeness summary | `3d3445b1fb5629d67f2d6fa43adba89eff37f063` | Implemented; browser E2E not claimed |

## Staging evidence boundary

Staging Supabase project: `fnqbvfuwbdpwvhcgzksl`.

Known verified properties for `get_executive_decision_report(integer)` after migration application:

- `SECURITY INVOKER` / `prosecdef=false`;
- `anon_exec=false`;
- `authenticated_exec=true`;
- tenant-bound through `current_company_id()`;
- unauthenticated direct invocation returns `TENANT_REQUIRED`.

Canonical migration:
`supabase/migrations/20260908234000_executive_decision_report_read_model.sql`

## Non-claims / certification boundary

The following remain **not certified** unless fresh live evidence is produced:

- authenticated browser E2E;
- Tenant A/B adversarial isolation in a live browser session;
- Production runtime;
- backup/restore;
- rollback;
- Production alias binding;
- durable worker execution E2E.

A direct SQL call without an authenticated tenant is not an E2E failure; it is an expected `TENANT_REQUIRED` boundary.

## Current open fronts

1. Executive report: evidence/findings drilldown and richer source context.
2. Decision context: richer alternative/evidence selection without inventing data.
3. Outcome/learning: governed adaptive write-back design, with explicit thresholds and auditability.
4. Print/PDF: print-safe executive layout and verification; do not claim generated PDF unless an actual PDF artifact is produced.
5. Universal import: report-type semantics, duplicate/conflict policy, relations, quality workflow, and general-report closure.
6. Forecasting: confidence, horizon, uncertainty, provenance, and source read-model linkage.
7. Authenticated E2E / production evidence: operationally blocked until access is available.

## Next execution batches and acceptance criteria

### Batch N+1 — Executive evidence drilldown
- Use only existing decision/recommendation/work/outcome evidence fields.
- Surface source/evidence IDs and observed/as-of timestamps where present.
- No invented evidence, KPI, outcome, or provenance.
- Keep tenant boundary in the server read model.

### Batch N+2 — Decision alternatives + outcome closure
- Show ranked alternatives in decision context.
- Selection remains a decision operation, never a silent master-data mutation.
- Outcome capture retains expected/actual/impact/evidence when available.
- Learning remains bounded and auditable.

### Batch N+3 — Import intelligence closure
- Close report-type classification, duplicate/conflict policy, relation graph, and quality workflow for supported formats.
- Unknown fields remain preserved.
- No specialized write at low confidence.

### Batch N+4 — Forecast/read-model closure
- Forecasts expose horizon, uncertainty, confidence, and provenance.
- Dashboard/reports consume one canonical read model.
- No forecast number without source evidence.

## Evidence discipline

Every batch report must separate **implemented**, **verified**, **blocked**, and **not claimed**. Source code existence alone is never operational certification. Exact SHA references are preferred for every material change.
