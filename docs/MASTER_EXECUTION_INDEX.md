# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-11

> Authoritative execution manifest. This document never promotes historical evidence across an exact Git `HEAD` boundary. Pair every evidence batch with the exact Git `HEAD` of `main` and the exact environment/commit used.

### CURRENT EXACT HEAD
- Current code/test candidate: `0088fb5e8a0f3fb7cdb97fc3d3058bef1dd9946e`.
- This candidate is the exact PR #463 head containing the bounded sales source/snapshot runtime binding, the bounded `phase-kl-runtime.ts` autonomy-link micro-fix (`riskBudgetValid` / `trustHealthy`), the import source-field preservation/lineage closure, the latest integration-boundary adversarial assertion repair, and the deterministic statistics toolbox restoration required by `time-series`.
- Historical evidence from earlier SHAs remains historical and is not promoted automatically.
- This index update is governance-only; it does not certify runtime, browser, tenant A/B, import, OCR, recovery, backup/restore, performance, or LIVE state.

### BOUNDARY / GOVERNANCE
- No rebuild from scratch.
- No historical migration rewrite.
- No Production alias mutation or rollback action as part of source reconciliation.
- No Staging data fixture is treated as certification unless an actual lifecycle is observed.
- No HTTP 200, UI shell, CI-created run, fixture assertion, simulated JWT, historical deployment, or old SHA can certify the current candidate.
- Browser E2E must use real Chromium, real Supabase authentication, and browser-held sessions; service-role or mocked sessions are prohibited for certification.

## DEEP AUDIT — 2026-09-07

### Database / Security baseline
- Staging Supabase project `fnqbvfuwbdpwvhcgzksl` is ACTIVE_HEALTHY.
- Critical-table RLS verification: 9/9 checked tables protected.
- Critical-table anonymous-policy verification: 9/9 checked tables have no anon policies.
- Security-definer authenticated surface: 16/16 authenticated-executable SECURITY DEFINER functions are bound to `current_company_id()`; 13/16 also use `auth.uid()`; 16/16 pin `search_path`.
- Critical tenant FK audit: 16 tenant-bound FKs verified.
- Critical index audit: 48 relevant indexes verified.
- Worker RPC surface: exactly eight durable worker RPCs; all are SECURITY DEFINER but have authenticated EXECUTE=false and anon EXECUTE=false, leaving execution to service_role.
- Import RPC surface: canonical import RPCs exist with authenticated execution and anon execution denied.
- Current canonical invoice import signature is exactly `import_upsert_sales_invoice(uuid,text,date,uuid,text,numeric,numeric,numeric,numeric,text,text)`.
- `import_commit_batch(uuid,text,jsonb,text)` is invoker-bound, tenant-checked, authenticated-only, and passes `customer_name` to the canonical invoice RPC.
- No runtime fixture rows currently exist in `report_execution_jobs`, `watched_report_files`, or `import_jobs`; therefore lifecycle runtime PASS is not claimed from schema-only inspection.

### P0 — AUTHENTICATED E2E / TENANT A-B
- Dedicated Actor A/B authenticated users exist and are mapped one-to-one to Tenant A/B.
- Existing real business runner covers authenticated tenant resolution, customer/product/invoice import, DB read-back, UI read-back, refresh continuity, Tenant B isolation, cross-tenant REST denial, cross-tenant UI denial, and logout.
- Current browser certification remains NOT PROVEN because the current exact-head browser/device run has not produced the required operational evidence.
- Database-level tenant probes are a baseline only; they do not replace browser-held authenticated A/B evidence.
- Transactional customer/product “new” buttons remain presentation-only; no unsupported CRUD claim is made.
- There is no dedicated invoice-entry route; canonical import remains the supported invoice mutation surface.

### P1 — MIGRATION / SCHEMA PARITY
- Live Staging contains a later Worker/Import contract lineage than the current replayable main chain.
- Worker provenance was reconciled on PR #396 through a forward-only migration strategy, tenant-bound RPC signatures, lease-token fencing, schema parity checks, and replayable checkpoint logic.
- Import provenance was separately audited. A real live defect was found where `import_commit_batch` called the canonical invoice RPC using the legacy argument order; the wrapper was repaired to pass `customer_name`.
- A second live contract mismatch was found: Staging had only the older 10-argument invoice RPC. Staging was repaired forward-only to the canonical 11-argument tenant-bound contract.
- No historical migration record was rewritten.
- Fresh disposable replay parity is still required before certification; PR/branch evidence is not equivalent to a fresh replay PASS.

### Worker / Reliability
- Durable worker contract has explicit tenant identity, lease ownership, lease-token fencing, checkpoint monotonicity, retry budget, dead-letter handling, source provenance, and service_role-only execution.
- Worker runtime crash/retry/recovery is UNPROVEN until an actual disposable job is executed through enqueue → claim → heartbeat/checkpoint → forced expiry → recovery → retry/DLQ.
- A new queue-boundary hardening PR #405 was opened after a deep source review found malformed scalar inputs could pass the in-memory queue boundary: whitespace worker/run IDs, non-finite lease durations, and non-integer/non-finite retry limits. Behavioral coverage was added; PR remains unmerged pending evidence.

### OCR / Document Intelligence
- A real OCR correctness defect was fixed on PR #397: PaddleOCR recognition scores were being discarded and every OCR block was emitted with confidence 0.0.
- The adapter now preserves recognition confidence using the minimum valid observed score, warns below the existing 0.7 usable threshold, and fails closed on malformed score metadata or unavailable/no-text OCR.
- Repository-native behavioral Python coverage now exercises valid confidence, low confidence, missing/boolean/non-finite/out-of-range scores, empty results, and OCR execution failure.
- Real Arabic golden-corpus runtime remains NOT PROVEN until an actual document passes through source → OCR → normalization → DB → reconciliation → analytics → evidence/decision → output.

### Import / Reconciliation
- Canonical import remains the supported business mutation path.
- Import RPC tenant context, direct-write guards, transaction lifecycle, state contracts, business-key behavior, and runtime governance are already represented by repository checks.
- Live invoice wrapper/signature mismatch was repaired as a concrete runtime contract defect.
- Current candidate additionally preserves complete source rows and provenance in tenant-bound `import_job_rows` through the transactional `import_commit_batch_with_lineage` wrapper when a real import job context is supplied; normalized business writes remain delegated to the canonical `import_commit_batch` path.
- Import runtime with real authenticated tenant data remains NOT PROVEN until current-head E2E evidence records upload/preview/commit/read-back and A/B denial.

### Watched Folder
- Native watched-folder contract exists and is covered by repository checks.
- End-to-end discovery, hash/fingerprint, duplicate handling, tenant binding, processing handoff, terminal state, and retry remain operationally UNPROVEN.
- Issue #400 is the active disposable lifecycle front.

### Decision / Evidence / Outcomes
- Decision SECURITY DEFINER functions were reviewed individually rather than blanket-revoked.
- Sensitive decision mutations use tenant context and user identity checks; anonymous execution is denied.
- Decision work-item RLS is tenant-scoped.
- Outcome/evidence paths enforce tenant/provenance/state boundaries.
- Authenticated browser decision/evidence lifecycle remains NOT PROVEN.
- The exact current candidate includes a bounded repair to `request_decision_approval`: the authoritative decision row is locked before approval-state lookup/check, preserving the fail-closed lock-order contract.
- The current candidate additionally guards the `ON CONFLICT ... DO UPDATE` path so terminal approval states cannot be reopened; a zero-row conflict update is converted into the same terminal-state failure.

### Observability / Failure Injection
- Structured error/evidence contracts exist across worker/import/document paths.
- Actual operator-facing failure/alert path is not certified.
- Issue #402 tracks disposable failure injection and observability proof without manufacturing telemetry.

### Performance / Scale
- Source-level performance budgets and bounded batch logic exist.
- Historical targets remain P95 read 300ms, write 800ms, preview 1500ms; dataset load bounded at 5000 rows and batch processing previously exercised up to 50k rows.
- Current exact-head environment measurements are not certified.
- Issue #403 tracks measurable current-candidate refresh with P95/P99, dataset/batch sizes and resource/error observations.

### Recovery / Backup / Restore / Rollback
- Recovery contracts and evidence-boundary checks exist.
- Actual backup creation, integrity validation, isolated restore, tenant-isolation verification after restore, authenticated smoke, measured RPO/RTO, and rollback drill remain UNPROVEN.
- This is an operational gate, not a reason to fabricate a PASS from source inspection.

### CI / Execution Infrastructure
- Historical CI infrastructure failures with `steps=[]`, `runner_id=0`, and empty runner identity are retained as historical evidence only; they are no longer the sole current CI state.
- On the merged candidate `9bcbff347bd141f62486802106306f8edddde126`, the Windows desktop workflow executed 23 real steps including checkout, Node setup, `npm ci`, web build, native watcher contract, native runtime smoke, Windows installer build, and installer upload.
- The latest exact-head Certification Gate on `0088fb5e...` did execute the real release-manifest build and checked out the exact candidate, then correctly failed closed at the certification boundary because the index still pointed to `cb0f7...`.
- That failure is an exact-head governance mismatch, not a product-test failure; downstream certification suites were correctly not executed.
- Workflows are not weakened with bypasses to turn infrastructure or boundary failure into PASS.

## ACTIVE EXECUTION FRONTS
- PR #463 — durable sales source/snapshot binding and exact-head certification closure.
- #399 — fresh migration replay and schema parity certification.
- #400 — watched-folder lifecycle and duplicate-ingestion proof.
- #401 — worker crash/retry/dead-letter/recovery drill.
- #402 — observability failure-injection and alert-path proof.
- #403 — production-scale performance evidence refresh.
- #404 — P0 authenticated Tenant A/B adversarial runtime closure.
- PR #396 — tenant-bound durable worker provenance/replay contract.
- PR #397 — truthful Arabic OCR confidence.
- PR #398 — report execution input validation.
- PR #405 — report execution queue scalar boundary hardening.

## CURRENT PR / REVIEW STATE
- PR #396: OPEN, mergeable, not merged.
- PR #397: OPEN, mergeable, not merged.
- PR #398: OPEN, mergeable, not merged.
- PR #405: OPEN, currently non-mergeable until its fresh review/CI evidence is available.
- PR #463: OPEN, draft, unmerged; exact operational HEAD `0088fb5e8a0f3fb7cdb97fc3d3058bef1dd9946e`.
- Main remains protected at `999f93e91f657357d849f15a87a001cb389d8ff9` and is not touched by this governance rebind.
- No PR is treated as merged merely because a connector exposes a `merge_commit_sha`; explicit `merged=false` is authoritative.

## REAL RELEASE ASSESSMENT — 2026-09-07

### What is genuinely strong
- Tenant/RLS/security architecture: STRONG by source and live DB inspection.
- Import contract integrity: STRONG after closing the live invoice signature/wrapper mismatch.
- Durable worker contract: STRONG structurally; runtime lifecycle still unproven.
- OCR confidence truthfulness: IMPROVED and behaviorally covered; real corpus runtime still unproven.
- Report execution input/queue boundaries: materially hardened.
- Certification governance: FAIL-CLOSED and appropriately refuses to promote unobserved runtime evidence.

### What prevents declaring the app complete/sellable today
1. Current-head authenticated browser E2E with real Actor A/B sessions.
2. Current-head adversarial Tenant A/B browser proof including reads, writes, import, report/evidence, REST/RPC/storage denial and zero leakage.
3. Fresh migration replay/schema parity proof.
4. Real watched-folder lifecycle proof.
5. Real worker crash/recovery/retry/DLQ lifecycle proof.
6. Real Arabic document/OCR golden-corpus runtime proof.
7. Real backup/restore/rollback operational drill.
8. Current-head measurable performance evidence.
9. Fresh exact-head CI/certification must execute the actual certification suites and finish green before CI gates can be called PASS.
10. Final exact-head certification after all above evidence is bound to the same candidate.

### HONEST COMPLETION SCORE
- **Engineering/source readiness: ~95%** — strong contracts, security, import/worker architecture, regression coverage and governance; the current-head build/OCR blockers are merged, while several runtime proofs remain open.
- **Operational/certification readiness: ~75%** — DB and contract evidence is substantial and CI execution mechanics are now partly proven, but required live lifecycle proofs are still missing.
- **Overall product completion for first sale: ~87–88%**.

> The overall score is intentionally lower than source readiness because the release standard is not “the code looks complete”; it is “the exact candidate has been exercised and evidenced in the real runtime, tenant boundary, recovery, and production-readiness gates.”

### RELEASE DECISION
**NOT CERTIFIED / NOT READY FOR FIRST SALE YET.**

This is not a rebuild situation. The remaining work is concentrated closure: execute the real operational proofs, repair only newly demonstrated defects, bind all evidence to one exact candidate, then run the final certification boundary. No known blocker justifies returning to the beginning.

## GOVERNANCE LOG — 2026-09-11 — PR #463 EXACT-HEAD REPAIR REBIND
- Exact PR #463 code/test HEAD before this governance commit: `0088fb5e8a0f3fb7cdb97fc3d3058bef1dd9946e`.
- Fresh Certification Gate run `2999` and Execution Enforcement run `2631` both checked out `0088fb5e...` exactly and built the release manifest successfully.
- Both correctly failed at the certification-boundary integrity check because the Master Index still indexed `cb0f7ece...`; no downstream certification suite was executed or falsely promoted.
- The candidate `0088fb5e...` is the bounded deterministic statistics restoration required by `time-series`; no certification guard was weakened.
- This governance-only update now binds the Master Index to `0088fb5e...` on PR #463 only. Main remains untouched at `999f93e91f657357d849f15a87a001cb389d8ff9`.
- Required next action: fresh exact-head Certification/Execution Enforcement cycle; Boundary PASS must precede downstream certification evidence.
- Release remains **NOT CERTIFIED / NOT LIVE**.
