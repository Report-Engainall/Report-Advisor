# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main`

> نقطة الرجوع الإلزامية قبل كل دفعة. لا تُحسب الملفات/commits إنجازًا بحد ذاتها. نفصل implementation / gate / runtime / live certification.

## Mandatory execution rules
- افحص الفهرس والمستودع والعمل السابق قبل كل دفعة.
- Reuse/fix/consolidate قبل create؛ لا engines موازية.
- CI يعمل بالتوازي مع التدقيق والتنفيذ.
- لا نتبع ~2500 commit/failure واحدًا واحدًا؛ نستخدم **failure-family batching**: scan/search → cluster by root cause → fix all independent instances → regression guard → CI.
- Failure → root cause → batch fix → regression → rerun.
- لا mock business data ولا fake runtime evidence ولا defaults تخفي missing data/tenant/security constraints.
- AI ليس مصدر الحقيقة المالية/الرقمية.
- PASS لا يعني production-certified؛ LIVE evidence منفصل.

## Current truth
The quality workflow is operated as a batch-discovery loop rather than a serial first-failure loop. No CI PASS is claimed for commits whose complete workflow result is unavailable.

## Latest implementation batches
- `6e449c3efd9ec7c5dba8bd58ad8b68a36111b465`: improved tenant legacy guard recognition for canonical `requireTenant` helpers.
- `da0db827edf4a93791cf4310090c9dcda9c396ea`: removed a false-positive tenant rule that treated legitimate RPC payload keys such as `p_company_id:` as static tenant authority.
- `e48861bf5cef8fc44140b061fe9ed7615747e06a`: added a regression harness proving canonical tenant-authoritative RPC payloads pass while client-selected tenant filters fail.
- `ef9acfef1b6dc215ae27a220ca4ea5c2d97573b2`: fixed `buildAgingBuckets` so missing/invalid due dates land in explicit `UNDATED` evidence instead of `0-30`.
- `6ab241f308ea3b15f32bd7144797fa5d4df4daac`: added BI regressions for `UNDATED` aging and incomplete cash-conversion-cycle inputs.
- `634fc25eaf3c9cfaf1019064f09a74968e4eb8d7`: hardened canonical query import lifecycle terminal transitions and canonical aging projection; non-terminal status no longer reaches terminal RPC.
- `6d92f706ff70dab55c7bafd4c6ce004265947396`: made business decision creation fail closed when `evidenceIds` is empty and normalize/deduplicate evidence IDs.
- `25dfede65723e2dec2c5c8f5ba6956f531224185`: added decision-evidence regression coverage.
- `41fd31cf0b85e38287a8a93eaddd3a5df71afb33` / `37da590c6da619f01c4966c94ff13550406e453c` / `69143671a8c1cd383a71a659ce93e66f233546b6`: wired tenant, BI, and decision regressions into the canonical quality workflow.
- Existing P0/P1 family gates remain authoritative and fail-closed.

## Current CI truth
- Run `32821715254` on `f29b39b2d36d19990c1925e4b4fa3a12b6cca4c0` failed at **Tenant legacy consumer boundary**; that failure family has now been root-fixed and guarded.
- The post-fix commits above have been pushed to `main`, but complete push-triggered quality results for the latest head are **not yet available through the connected GitHub Actions status surface**. No PASS is claimed until the full run is observable.
- The last observed failure was a checker false positive in `src/pages/AlternativeGroupsPage.tsx`: legitimate `p_company_id: companyId` RPC payload syntax matched a generic `COMPANY_ID` assignment pattern.
- The guard was narrowed to declaration-level `const|let|var COMPANY_ID/TENANT_ID` assignments while preserving static-ID, environment, client-selected filter, legacy mutator, and unsafe tenant assignment detection.
- Runtime Supabase evidence remains separate and LIVE REQUIRED.

## Phase truth
| المسار | الحالة | المتبقي الحاسم |
|---|---|---|
| 1–21 | COMPLETE FOUNDATION | dependency/toolchain recheck |
| 22–29 | IMPLEMENTED/GATED | runtime/E2E/golden evidence |
| 30–37 | IMPLEMENTED/GATED | runtime + decision E2E |
| A0 | FOUNDATION/GATED | document engine depth |
| A–D | FOUNDATION/DEEP FOUNDATION COMPLETE | live worker/action/forecast feedback |
| E–G | GATED/LIVE REQUIRED | tenant/security/restore/rollback/release |
| H–I | FOUNDATION/GATED | live canaries/graph/outcomes/cockpit |
| J–J.1 | FOUNDATION/GATED | live watched-folder coordinator |
| K–L | FOUNDATION/GATED | real jobs/outcomes/telemetry/action loop |
| M | FOUNDATION/CONTRACT-GATED | final production bundle/live certification |
| N | INTEGRATION TARGET | runtime recovery + restore evidence |
| O | INTEGRATION TARGET | adversarial tenant/security runtime |
| P | INTEGRATION TARGET | document intelligence depth + golden corpus |
| Q | INTEGRATION TARGET | KPI/BI truth + cross-surface equivalence |
| R | INTEGRATION TARGET | decision→action→outcome loop |
| S | NOT LIVE CERTIFIED | final production certification |

## Tenant / Data / KPI truth
- Tenant legacy/static/client-selected consumer scan is now precise against canonical RPC payload syntax and has an executable regression harness.
- Canonical browser tenant resolver remains `resolveCurrentCompanyId()`.
- Import RPCs validate tenant context server-side and use tenant-owned row locks.
- Import lifecycle has idempotency, canonical tenant context and terminal-state hardening.
- Canonical query lifecycle no longer sends `processing` into terminal `import_finish_job`.
- Missing/invalid due dates are represented as `UNDATED`, not `0-30`.
- KPI presentation remains fail-closed for missing authoritative numeric values; no missing→zero coercion is accepted for required fields.

## Decision truth
- Business decision creation now requires at least one non-empty evidence ID.
- Evidence IDs are trimmed, deduplicated, and retained as the decision's evidence lineage.
- Report pipeline already filters actions to evidence-backed decisions before construction.
- Runtime outcome tracking remains LIVE REQUIRED.

## Watched-folder / cross-platform
Canonical existing watcher reused: directory selection/monitoring, SHA-256, incremental state, IndexedDB snapshots, queue/dead-letter and text-first fallback.

Single cross-platform contract: `src/lib/import-pipeline/folder-watch-contract.ts`.
- Web/PWA: active-session File System Access where supported; no false background promise after app close.
- Windows: persistent background watch requires native host adapter.
- Android: native directory permission/watcher required.
- iOS: capability-aware; arbitrary persistent background folder watching is not claimed.
- All adapters emit the same `WatchEvent` into the same queue/import pipeline.

## P0 / P1 truth
**P0:** Supabase adversarial runtime, Storage/signed URLs, Realtime authorization, AI tenant isolation, Backup Restore/RPO-RTO, migration parity, artifact verification, worker failure/dead-letter drills, security/secrets, SLO/rollback, production certification.

**P1:** Windows persistent watcher, Android native watcher, iOS capability integration, live folder coordinator, live Document Intelligence corpus, evidence graph, outcome feedback, executive action loop.

These remain LIVE REQUIRED wherever static contracts cannot establish real runtime behavior.

## Completion truth
**Engineering completion remains ~82% conservative.** No percentage increase is claimed for commits/guards alone. Production certification remains **NO** until LIVE runtime evidence closes the P0 matrix.
