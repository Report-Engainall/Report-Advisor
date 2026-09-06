# Execution Checkpoint — 2026-09-07 / Batch 10

## Protocol
`1` continued from the exact authoritative HEAD without reopening closed Worker remediation. This batch expanded verification across GitHub CI, live Staging database security, migration ledger, and exact-head Vercel deployment.

## Exact-head continuity
- PR: #348
- Branch: `fix/runtime-provenance-20260906`
- HEAD: `10db174fea6d3956ca4c1bb28c3dd63d9d7891d2`
- PR state: OPEN, not merged, mergeable.
- PR delta from base: 81 commits, 52 changed files, +2212/-168.
- The base/head comparison reports the branch as `diverged` with `behind_by: 2`; therefore mergeability is not treated as certification evidence and no merge/rebase/reset was performed.

## CI forensic escalation
The current-head PR workflow fan-out was inspected again. Representative failed jobs continue to terminate with `conclusion=failure` while exposing `steps=[]`; log retrieval for affected jobs continues to return GitHub `BlobNotFound` where logs are requested.

Multiple independent reruns were issued across Quality, security, canonical truth, certification, import, enforcement, OCR, bootstrap, tenant, and related gates. The same non-diagnostic boundary persists: no executable failing command has been exposed, so no product-code change is justified from these CI records alone.

## Live Staging security verification
Supabase project `Report-Advisor-P0-2-Staging` (`fnqbvfuwbdpwvhcgzksl`) is `ACTIVE_HEALTHY`.

The security advisor currently reports two classes of findings:
1. Several `SECURITY DEFINER` functions are callable by `authenticated`. Source inspection confirms this is an intentional application boundary for decision/runtime operations; the corresponding live privilege check confirms the stronger boundary is real: `public_execute=false`, `anon_execute=false`, `authenticated_execute=true` for all 16 inspected functions.
2. `auth_leaked_password_protection` remains disabled. This is a real security finding and remains an external Supabase Auth control-plane gate; no unsupported in-database workaround was applied.

The live SQL privilege check covered:
- `complete_decision_work_item`
- `create_decision_work_item`
- `create_runtime_decision`
- `create_runtime_recommendation`
- `decide_approval`
- `finalize_runtime_decision`
- `get_receivables_report_page`
- `link_recommendation_to_decision`
- `mark_alert_read`
- `notify_decision_work_item`
- `record_decision_outcome`
- `record_recommendation_outcome`
- `record_watched_report_file`
- `request_decision_approval`
- `start_decision_work_item`
- `update_recommendation_status`

All 16 were verified as denied to PUBLIC and anon while executable by authenticated users. This confirms that the advisor warning is not a public/anonymous exposure for these functions.

## Migration ledger continuity
The live Staging migration ledger was queried and includes the report-execution worker hardening, tenant-context binding, recovery binding, checkpoint admission, import reconciliation, customer/invoice RPC hardening, financial tenant FKs, autonomy execute hardening, current-company execute hardening, and missing tenant-FK indexes. No destructive migration rewrite was performed.

## Exact-head Vercel deployment
Deployment `dpl_7yRzRiQiTaBM9aPKNGKABZPJuVbG` is `READY` and is bound only to the branch preview alias. Its Git metadata identifies the exact repository SHA `10db174fea6d3956ca4c1bb28c3dd63d9d7891d2`.

Build evidence:
- branch: `fix/runtime-provenance-20260906`
- exact SHA: `10db174fea6d3956ca4c1bb28c3dd63d9d7891d2`
- Vercel CLI 59.11.7
- dependency installation completed
- `npm run build`
- Vite 5.4.8
- 2781 modules transformed
- production build completed in 11.07s
- deployment completed
- build cache uploaded (93.08 MB)
- largest normal application JS chunk: `index-DwwYqOkB.js`, 495.64 KB
- no build failure was emitted in the successful build log

Non-fatal warnings remain for outdated Browserslist data, Bluebird `eval`, and pending npm install-script approvals for `esbuild` and `tesseract.js`. The PDF worker remains a large dedicated asset at 2,222.99 KB and is not counted as the application's largest normal JS chunk for the repository's 600 KB chunk guard.

## Certification boundary
No production certification is claimed. Frozen RCs and production aliases remain untouched. Authenticated browser E2E, Tenant A/B live isolation, production runtime, OCR golden corpus runtime, worker crash/retry/dead-letter recovery, backup/restore/RPO/RTO, rollback drill, and leaked-password protection remain open operational gates.

## Next execution point
Continue from `10db174fea6d3956ca4c1bb28c3dd63d9d7891d2`. Prioritize executable CI evidence when GitHub exposes steps/logs, and continue live operational verification in parallel. Do not convert the authenticated SECURITY DEFINER advisor warnings into false defects; the live ACL check proves PUBLIC/anon execution is already closed for the inspected set.