# Report-Advisor — Execution Ledger

**Date:** 2026-09-08  
**Integration branch:** `fix/folder-sync-universal-persistence`

## Operating rule
Every meaningful batch builds on the current integration state, avoids reopening closed work, preserves exact SHAs/evidence, and is recorded before dependent work. Frozen RC and production aliases are never mutated by ordinary feature work.

## Immutable release boundaries
- Protected Candidate: `14cc7cefc0fad622436b4845a0e4b46a8888e8a9`
- Exact Release Candidate: `d846821b8d969aaa384ab85487a0dcf264a65aca`

## Confirmed implementation batches
| Batch | Area | Exact SHA | Status |
|---|---|---|---|
| 01 | Universal external-file analysis | `3c2372b9d8ae4e5008c46641625fe05bdc56ee1` | Implemented; no DB write claim |
| 02 | Folder sync durability | `7c15dbc07a8e142e31e049df806ea61c7e188fd7` | Implemented; E2E blocked |
| 03 | Decision/task lifecycle | `3789430953c3ef6b5c8e4234a1c11d23dd4ce9f` | Partial lifecycle closure |
| 04 | Decision learning/governed ranking | `f6b0317377b65b3207e20b9e54377cddb4322315` | Implemented; adaptive write-back not automatic |
| 05 | Alternative bridge | `9b68920515df72c8a2a27f838b3b6d0c67a463b2` | Read-only bridge implemented |
| 06 | Executive report integration | `a1c499f432b69f2f97617b05cdcad07a692b9f3b` | Feature exists; verification continued |
| 07 | Global product chain | `dd62e197cca3d94484572c75cd170122a6627080` / `ea22a70995815fdb57326f7707db98780956efe5` | Architecture/evidence locked |
| 08 | Durable execution memory | `2e4c1314736a662e7f5cc3f1e6faa0439f145d4a` | Implemented |
| 09 | Executive read-model persistence | `2e4c1314736a662e7f5cc3f1e6faa0439f145d4a` | Persisted/applied to Staging |
| 10 | Executive freshness/quality UX | `3d3445b1fb5629d67f2d6fa43adba89eff37f063` | Implemented; browser E2E not claimed |
| 11 | Executive evidence references | `bb9b29fe88dd073dd5143ccb18f5979c27161ed0` | Implemented on dedicated front |
| 12 | Executive freshness timestamp hardening | `7cd486b84eac123bf931bf565ebe1862d482e7f1` | Implemented on dedicated front |

## 20-front parallel matrix
Dedicated branches were opened from the integration branch to enable independent closure without touching the frozen RC:
1 executive-evidence; 2 executive-freshness; 3 decision-alternatives; 4 outcome-learning; 5 import-quality; 6 forecasting; 7 ops-observability; 8 security-tenant; 9 pdf-release; 10 ai-grounding; 11 ux-accessibility; 12 performance; 13 reconciliation; 14 relations; 15 schema-intelligence; 16 ocr-visual; 17 dedupe-conflict; 18 general-report; 19 import-lineage; 20 task/runtime/E2E/governance/CI/backup-rollback/Onyx/billing/dashboard/data-quality.

Matrix evidence: `docs/evidence/20260908-parallel-20-fronts.md`.

## Staging evidence boundary
Staging Supabase: `fnqbvfuwbdpwvhcgzksl`.
Known verified for `get_executive_decision_report(integer)`: SECURITY INVOKER (`prosecdef=false`), anon execution disabled, authenticated execution enabled, tenant-bound through `current_company_id()`, unauthenticated invocation returns expected `TENANT_REQUIRED`.

## Certification non-claims
Not certified without fresh live evidence: authenticated browser E2E, Tenant A/B live isolation, Production runtime, backup/restore, rollback, Production alias binding, durable worker execution E2E.

## Current execution rule
Work fronts in parallel; integrate only after evidence review. No source-code existence is treated as runtime certification. No invented KPI, evidence, outcome, provenance, forecast, availability, or tenant context.
