# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-10

> Authoritative execution manifest. This document never promotes historical evidence across an exact Git `HEAD` boundary. Pair every evidence batch with the exact Git `HEAD` of `main` and the exact environment/commit used.

### CURRENT EXACT HEAD
- Current code/test candidate: `bacd51c78a491d5fc0cdc24117ecec25c75cecad`.
- This candidate contains the bounded decision-approval lock-order repair, its corrected fail-closed Test-of-Test contracts, and the terminal-state conflict-path guard on the `ON CONFLICT ... DO UPDATE` path.
- Historical evidence from earlier SHAs remains historical and is not promoted automatically.
- This index update is governance-only; it does not certify runtime, browser, tenant A/B, import, OCR, recovery, backup/restore, performance, or LIVE state.

### BOUNDARY / GOVERNANCE
- No rebuild from scratch.
- No historical migration rewrite.
- No Production alias mutation or rollback action as part of source reconciliation.
- No Staging data fixture is treated as certification unless an actual lifecycle is observed.
- No HTTP 200, UI shell, CI-created run, fixture assertion, simulated JWT, historical deployment, or old SHA can certify the current candidate.
- External operational blockers do not justify idle work on source reconciliation, contract hardening, test design, or evidence preparation.
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
- Fresh exact-head workflow runs across the repository continue to fail at the execution layer with jobs reporting `steps=[]`, `runner_id=0`, and empty runner name.
- Example current PR #398 run `101824133529` for `Report Execution Input Contract` completed as failure with no executed steps and no runner identity.
- The same pattern is present across quality, OCR, security, import, certification, Windows, and other workflows.
- This is currently classified as CI execution infrastructure failure, not as evidence that the underlying product tests failed.
- Workflows are not weakened with bypasses to turn infrastructure failure into PASS.

## ACTIVE EXECUTION FRONTS
- #399 — fresh migration replay and schema parity certification.
- #400 — watched-folder lifecycle and duplicate-ingestion proof.
- #401 — worker crash/retry/dead-letter/recovery drill.
- #402 — observability failure-injection and alert-path proof.
- #403 — production-scale performance evidence refresh.
- #404 — P0 authenticated Tenant A/B adversarial runtime closure; currently browser/device constrained.
- PR #396 — tenant-bound durable worker provenance/replay contract.
- PR #397 — truthful Arabic OCR confidence.
- PR #398 — report execution input validation; one previously valid review finding has now been explicitly repaired by rejecting array-shaped requests.
- PR #405 — report execution queue scalar boundary hardening.

## CURRENT PR / REVIEW STATE
- PR #396: OPEN, mergeable, not merged.
- PR #397: OPEN, mergeable, not merged.
- PR #398: OPEN, mergeable, not merged; CodeRabbit's current array-shape finding was verified and repaired.
- PR #405: OPEN, currently non-mergeable until its fresh review/CI evidence is available.
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
9. CI execution infrastructure must produce actual steps/logs before CI gates can be called PASS.
10. Final exact-head certification after all above evidence is bound to the same candidate.

### HONEST COMPLETION SCORE
- **Engineering/source readiness: ~94%** — strong contracts, security, import/worker architecture, regression coverage and governance; remaining source-level defects are being closed through bounded PRs.
- **Operational/certification readiness: ~72%** — substantial DB and contract evidence exists, but several required live lifecycle proofs are still missing.
- **Overall product completion for first sale: ~86%**.

> The overall score is intentionally lower than source readiness because the release standard is not “the code looks complete”; it is “the exact candidate has been exercised and evidenced in the real runtime, tenant boundary, recovery, and production-readiness gates.”

### RELEASE DECISION
**NOT READY FOR FIRST SALE YET.**

This is not a rebuild situation. The remaining work is concentrated closure: execute the real operational proofs, repair only newly demonstrated defects, bind all evidence to one exact candidate, then run the final certification boundary. No known blocker justifies returning to the beginning.

## GOVERNANCE LOG — 2026-09-07
- Main baseline: `5b083100d463aae4a4cf22ebbbff7e1470749b1f`.
- `6a59b6a67e87620f35590a02828b6ffd5ec709ba`: execution checkpoint for import/RPC call-site audit.
- PR #396: worker provenance/replay contract reconciliation and import wrapper contract repair.
- PR #397: OCR truthful confidence repair and behavioral test coverage.
- PR #398: report execution input identity/shape hardening; latest explicit array-shape repair is commit `037aa4f1dcf7130643d96e34cc97a7a0e82abc84`.
- PR #405: queue scalar boundary hardening; latest head `7086e681654c9dead29934ba2e98b5c4bf2442f9`.
- Issues #399–#404 are confirmed open independent execution fronts.
- No Production/RC mutation was performed in this deep audit.

## GOVERNANCE LOG — 2026-09-09 — CURRENT EXACT HEAD
- Current exact main HEAD after verified forward merges: `0eabfd739bc75fef2e51be1b051d9da95abde072`.
- PR #450 (executive dashboard UI) merged as `c6101b8c9dc2a201e1b4b1ac1567e15403a37546`.
- PR #452 (canonical Import Center productization) merged as `e69c48684481530115a2bb12dca53b77c4c73db7`.
- PR #451 (executive report) was re-integrated safely after its original merge conflict and merged through PR #458 as `0eabfd739bc75fef2e51be1b051d9da95abde072`.
- The unsafe whole-tree integration attempt PR #457 was detected from its unexpected 1,454-file / 58,496-deletion diff and was closed without merge. No destructive change was retained.
- Current live Staging function inventory confirms the real import/dashboard functions; no Edge Functions are currently deployed through the connected Supabase project.
- Live Staging row check at this boundary: `import_jobs=0`, `file_records=0`, `sales_invoices=3`, `inventory_movements=0`, `kpi_evidence_snapshots=0`, `executive_kpi_lineage=0`.
- Therefore no live import lifecycle, Arabic OCR corpus lifecycle, or KPI evidence-lineage runtime PASS is claimed from this inspection alone.
- CI remains an external billing/execution constraint and is not converted into a product PASS.
- Next mandatory evidence fronts remain authenticated A/B browser runtime, real import lifecycle, Arabic golden-corpus runtime, worker recovery, watched-folder lifecycle, backup/restore/rollback, performance, and final exact-head certification.

## GOVERNANCE LOG — 2026-09-10 — CANDIDATE #462 BOUNDARY
- Exact candidate under certification: `24fd23c832ad4ee87648ef3691c0f49e6bbb187b`.
- PR #462 bounded build/OCR test repairs are the only code changes being carried forward in this candidate closure.
- The previous Final Certification failure was a governance mismatch: the indexed candidate did not match this exact candidate.
- This governance update binds the Master Index to the exact stabilized PR #462 head; it does not promote historical runtime evidence.
- Required next proof remains: fresh exact-head certification, authenticated Actor A/B browser runtime, real import lifecycle, crash/resume/recovery, document/OCR corpus, KPI evidence lineage, backup/restore/rollback, and final LIVE certification.
- Release state: **NOT CERTIFIED** until fresh operational evidence is produced on the resulting exact candidate.

## GOVERNANCE LOG — 2026-09-10 — CANDIDATE #462 LOCK-ORDER REPAIR
- Exact candidate under the next certification boundary: `48e18f8f2f84fcc02ae38a26cc46d2cb9801b975`.
- This candidate contains one bounded production migration after `24fd23...`: `supabase/migrations/20260910020000_fix_decision_approval_lock_order.sql`, repairing `request_decision_approval` so the authoritative decision row is locked before approval lookup/check.
- On exact SHA `48e18f...`, the non-certification technical workflow set completed green; the two certification-layer failures stopped at the stale-index boundary and did not execute their underlying certification/enforcement contract suites.
- This governance update is the required clean source-of-truth rebind; it promotes no historical runtime evidence and does not weaken the certification boundary.
- A fresh exact-head Certification cycle is required on the resulting governance commit. Release remains **NOT CERTIFIED / NOT LIVE** until Final Certification itself passes and the separate required authenticated/runtime/operational evidence is complete.

## GOVERNANCE LOG — 2026-09-10 — CANDIDATE #462 TEST-OF-TEST REPAIR BOUNDARY
- Exact candidate under the next certification boundary: `bb35b68f10f2e60c106fde2268067e427a27d284`.
- This governance rebind records the bounded correction to `scripts/check-decision-approval-lock-order.mjs`; the negative fixture now fails closed when the approval `FOR UPDATE` lock is removed.
- No production SQL, Certification Boundary guard, or runtime implementation was changed by this repair.
- The preceding exact-head CI cycle produced broad technical green results but stopped the Final Certification and Execution Enforcement layers at the stale Master Index boundary, as designed.
- This update promotes no historical certification or runtime evidence. A fresh Certification cycle on the resulting governance commit is mandatory.
- Release remains **NOT CERTIFIED / NOT LIVE** until the fresh exact-head Final Certification Gate passes and all separate operational/runtime evidence requirements are satisfied.

## GOVERNANCE LOG — 2026-09-10 — CANDIDATE #462 TERMINAL CONFLICT GUARD
- Exact candidate under the next certification boundary: `ca584d05cedacc00fcaef38b926a1494f1e5a8e1`.
- This candidate contains one bounded production correction in `supabase/migrations/20260910020000_fix_decision_approval_lock_order.sql`: the `ON CONFLICT ... DO UPDATE` path now includes a terminal-state `WHERE` guard preventing `APPROVED`, `REJECTED`, or `CANCELLED` approvals from being reopened.
- If a terminal conflict is encountered, the zero-row `RETURNING` result is converted into the fail-closed `APPROVAL_TERMINAL_NOT_REOPENABLE` exception.
- No Certification Boundary guard or unrelated production surface was modified.
- A fresh exact-head Certification cycle is required after this governance rebind. Historical evidence is not promoted.
- Release remains **NOT CERTIFIED / NOT LIVE** until the fresh exact-head Final Certification Gate passes and all separate operational/runtime evidence requirements are satisfied.

## GOVERNANCE LOG — 2026-09-10 — CANDIDATE #462 TOCTOU TEST-OF-TEST REPAIR
- Exact candidate under the next certification boundary: `bacd51c78a491d5fc0cdc24117ecec25c75cecad`.
- This governance update binds the Master Index to the exact candidate containing the bounded TOCTOU Test-of-Test repair; the validator now binds the decision `FOR UPDATE` specifically to the authoritative decision query and includes adversarial removal/reordering checks.
- No production SQL or Certification Boundary guard was changed by this repair.
- The preceding exact-head cycle stopped at the stale-index Boundary by design; therefore no TOCTOU PASS is promoted by this governance update.
- Fresh exact-head Certification is mandatory to prove the TOCTOU contract itself and then the complete Certification chain.
- Release remains **NOT CERTIFIED / NOT LIVE** until the exact-head contract evidence and all separate operational/runtime evidence are satisfied.
