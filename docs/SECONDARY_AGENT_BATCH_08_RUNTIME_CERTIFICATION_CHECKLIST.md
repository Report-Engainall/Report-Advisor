# Batch 08 — Runtime Certification Checklist

Date: 2026-08-25
Branch: `parallel/secondary-agent-evidence-ux`
Target: `phase-8-9-completion`

## Evidence vocabulary

`UNKNOWN → INVENTORIED → IMPLEMENTED → GATED → INTEGRATED → RUNTIME-EVIDENCED → PRODUCTION-CERTIFIED`

`BLOCKED` is reserved for an external prerequisite. `COMPLETE` is not used as a certification state.

## Critical capability matrix

| Capability | Contract | Implementation | Persistence | Security | Test | Workflow | Runtime Evidence | State |
|---|---|---|---|---|---|---|---|---|
| Evidence Workspace | existing evidence/presentation contracts | existing workspace + safe surfaces | Phase K/L evidence persistence | tenant/RLS owned by mainline | secondary regression | secondary workflow | persisted downstream graph IDs | LIVE REQUIRED |
| Decision Replay | existing decision/read models | existing replay presentation | decision persistence is mainline | approval/security mainline | regression | Quality/secondary | real snapshot + evidence + outcome | LIVE REQUIRED |
| Report Snapshot/Diff | existing report contracts | existing snapshot UI | report runtime mainline | tenant/RLS mainline | regression | Quality/secondary | persisted snapshot/version/evidence | LIVE REQUIRED |
| Data Quality | `fetchDataQualityDatasets()` | Data Quality UI | authoritative Supabase reads | canonical RLS | projection regression | Quality/secondary | live tenant-scoped scores + evidence | LIVE REQUIRED |
| Document Intelligence | `DocumentExtractionEnvelope` | gateway + document UI | document persistence mainline | file/security gates | document suites | Quality/specialized | real extraction + lineage | LIVE REQUIRED |
| Reconciliation | `ReconciliationResult` | reconciliation presentation | authoritative import/reconciliation persistence | tenant/import RLS | file/import regressions | Quality/specialized | persisted result + row evidence | LIVE REQUIRED |
| Business Control Plane | Phase K/L contracts | existing control-plane UI | Phase K/L runtime | tenant/security mainline | control-plane contract | Quality/secondary | real telemetry | GATED |
| Tenant/RLS | canonical tenant resolver | existing auth/query boundaries | Supabase migrations | RLS | static security contracts | security workflows | two-company adversarial DB proof | BLOCKED |

## Evidence chain

| Node | Current classification | Required proof |
|---|---|---|
| Source File | IMPLEMENTED/GATED | real uploaded source + stable reference |
| Page | UNKNOWN/LIVE REQUIRED | persisted page identifier |
| Table | UNKNOWN/LIVE REQUIRED | persisted table identifier |
| Row | UNKNOWN/LIVE REQUIRED | source row lineage |
| Column | UNKNOWN/LIVE REQUIRED | source column lineage |
| Cell | UNKNOWN/LIVE REQUIRED | cell-level lineage where available |
| Extracted Value | IMPLEMENTED/GATED | extraction runtime output with source reference |
| Normalized Value | IMPLEMENTED/GATED | deterministic normalization output + provenance |
| Entity | LIVE REQUIRED | authoritative entity-resolution identifier |
| Canonical Record | LIVE REQUIRED | canonical persistence identifier |
| Metric | LIVE REQUIRED / MAINLINE DEPENDENCY | authoritative metric snapshot/version |
| Report | LIVE REQUIRED / MAINLINE DEPENDENCY | persisted report snapshot |
| Decision | GATED/LIVE REQUIRED | persisted decision + evidence |
| Action | LIVE REQUIRED / MAINLINE DEPENDENCY | approved action/receipt |
| Outcome | LIVE REQUIRED / MAINLINE DEPENDENCY | observed outcome linked to decision/action |

## Tenant certification matrix

The following require a real isolated Supabase environment and must not be inferred from static code:

1. User in Company A cannot read Company B rows.
2. User in Company A cannot write Company B rows.
3. User without membership is fail-closed.
4. Inactive membership is denied.
5. Active default company resolves deterministically.
6. Client-supplied company identifiers cannot override canonical tenant context.
7. Cross-tenant Import RPC is rejected.
8. Storage/signed URLs respect tenant authorization.
9. Realtime subscriptions respect tenant authorization.
10. AI retrieval namespace respects tenant authorization.

## Document Intelligence lineage audit

Current envelope proves: plan, backend choices, stage, warnings, fact value, confidence, source and optional page.

Current envelope does **not** prove complete document/block/table/row/column/cell IR, coordinates, parser version, or source hash. These are not synthesized here; they remain mainline/runtime requirements.

## Reconciliation readiness

The authoritative `ReconciliationResult` exposes rows and summary states (`new`, `updated`, `unchanged`, `conflict`, `error`) and the stable import fingerprint helper. This is presentation/readiness evidence only. Persistence, source/canonical totals, row-level evidence and live import-to-reconciliation execution remain LIVE REQUIRED.

## Data Quality parity

`fetchDataQualityDatasets()` uses bounded projections for customers, products, sales invoices and inventory balances and delegates tenant scope to Supabase RLS/current_company_id(). No secondary aggregate or RPC is introduced. Live parity remains unproven until the authoritative runtime is executed against a real tenant dataset.

## CI certification rule

A static contract PASS is not runtime evidence. A workflow PASS proves only the executed checks. Runtime-EVIDENCED requires a reproducible live environment artifact containing the relevant authoritative identifiers and results.
