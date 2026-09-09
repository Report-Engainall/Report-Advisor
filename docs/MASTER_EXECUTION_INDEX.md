# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-09

> Authoritative execution manifest. This document never promotes historical evidence across an exact-HEAD boundary. Pair every evidence batch with the exact Git `HEAD` of `main` and the exact environment/commit used.

### CURRENT PROJECT STATE
- Current code/test candidate entering this certification sweep: `00d2f1e9fc571641ee96e3485eaa43d7c2729c38`.
- This candidate is the exact code/test head of PR #461 (`fix/final-certification-boundary-20260909`) and is the candidate under fresh exact-head CI certification.
- Certification remains fail-closed: no historical evidence, UI shell, simulated session, old SHA, or CI run on another SHA can certify this candidate.

### CURRENT EXACT HEAD
- Current candidate: `00d2f1e9fc571641ee96e3485eaa43d7c2729c38`.
- Previous main baseline before this bounded certification repair: `4db373e61e03c030bab1628864c647b2d5bb97f6`.
- Documentation refreshes create a new exact-head boundary and do not promote runtime evidence from a previous SHA.
- Frozen release candidates remain untouched: protected candidate `14cc7cefc0fad622436b4845a0e4b46a8888e8a`, exact RC reference `d846821b8d969aaa384ab85487a0dcf264a65aca`.

### BOUNDARY / GOVERNANCE
- No rebuild from scratch.
- No historical migration rewrite.
- No Production alias mutation or rollback action as part of source reconciliation.
- No Staging data fixture is treated as certification unless an actual lifecycle is observed.
- No HTTP 200, UI shell, simulated session, CI-created run, fixture assertion, simulated JWT, historical deployment, or old SHA can certify the current candidate.
- External operational blockers do not justify idle work on source reconciliation, contract hardening, test design, or evidence preparation.
- Browser E2E must use real Chromium, real Supabase authentication, and browser-held sessions; service-role or mocked sessions are prohibited for certification.
- Certification checkout must retain full Git history (`fetch-depth: 0`) so ancestry and merge-base checks are meaningful.

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

### Remaining-work register
- backup/restore: NOT PROVEN until an actual isolated backup/restore drill is executed and evidenced.
- rollback: NOT PROVEN until an actual rollback drill is executed and evidenced.
- recovery: NOT PROVEN until worker/import recovery lifecycle is executed and evidenced.
- authenticated browser runtime: NOT PROVEN at the current exact head.

### CI / Execution Infrastructure
- Fresh exact-head workflow execution must produce real steps, runner identity, logs, and green checks before CI gates can be called PASS.
- PR #461 is the current bounded certification-repair candidate; exact candidate binding is now `00d2f1e9fc571641ee96e3485eaa43d7c2729c38` after a surgical repair to the decision TOCTOU adversarial gate-before-lock mutation.
- Certification remains fail-closed if any required indicator is red, skipped, missing, or bound to a different SHA.

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
- PR #461 — bounded final certification boundary repair; current exact candidate binding is `00d2f1e9fc571641ee96e3485eaa43d7c2729c38`.

### LATEST CERTIFICATION SWEEP UPDATE
- Previous exact candidate `2143d6a809c9dbbc187ba4ba3238a11374164c4a` produced green Truth/Data, Intelligence/OCR, Quality and most security/contract checks, but `Execution Enforcement Contract` and `Final Certification Gate` failed because the synthetic PR merge exposed a candidate-side boundary condition.
- `d0339f030b807481fe13817201cc192bd7ebb66f` contained the minimal boundary correction: a synthetic PR candidate side is evaluated against the indexed candidate lineage while still enforcing ancestry and rejecting non-governance changes where applicable.
- `43f670c9fbba85f57953c835ccaa40942190436` then bound `d0339f...` in the index and triggered the exact-head sweep.
- The exact-head `43f670c9...` Final Certification Gate was stopped by a precise regression in the latest `request_decision_approval` definition from `20260909220000_block_terminal_approval_reopen.sql`: it redefined the RPC with an approval-row lock but without first locking/revalidating the decision, reversing the canonical decision → approval lock order. The failing log was `Final Certification Gate` run `34403144811`, job `102639642147`; the same contract was also executed by the certification contract sweep.
- Surgical correction applied in `40fd3910db7df72d52ff93a92bb4acf17dd0af4a`: the latest `request_decision_approval` definition now locks the tenant-scoped decision `FOR UPDATE`, validates `PROPOSED`, then locks/checks the approval row before mutation. No unrelated product surface was changed.
- On exact-head `c96e8f0cc0e9fd88f67b75a65e0d13c8fc1c4a44`, the `Final Certification Gate` again failed inside `scripts/check-decision-approval-lock-order.mjs`: the weakened-approval test removed the approval lock but then searched for any later `FOR UPDATE`, incorrectly finding the required decision lock and raising no exception. This was a test-of-test defect, not a product lock-order regression.
- Surgical correction applied in `750f47ef13370740a726b7720e69cdeb6afbd3fa`: the weakened-approval adversarial assertion now anchors the search to the approval query itself and requires that approval lock to occur after the decision lock. No production SQL or unrelated surface was changed.
- The exact-head `750f47...` Final Certification Gate then exposed a stale assertion in `scripts/check-decision-approval-toctou-contract.mjs`: it required the obsolete literal `where public.decision_approvals.status not in`, while the canonical latest RPC correctly uses the locked approval row plus `v_existing_status in ('APPROVED','REJECTED','CANCELLED')`. This is a contract-test drift, not a production SQL defect.
- Surgical correction applied in `58ec17eb818adea4558dce468198507750324cad`: removed the obsolete literal requirement and retained the structural terminal-state guard requirement anchored after the approval-row lookup. No production SQL was changed.
- The `05cf7c5f...` certification run `34404195488` failed when its contract sweep reached `scripts/check-decision-approval-toctou-contract.mjs`; the log showed the earlier 20-stage release-readiness suite at `TOTAL=20 PASS=20 FAIL=0`, and the canonical decision lock-order check itself passed. This confirms the narrow failure boundary.
- A subsequent run on `58ec17...` was stale/misaligned because its synthetic candidate side was created before this index binding; it is not evidence for the current candidate.
- The certification-boundary guard was then updated to classify `scripts/check-decision-approval-toctou-contract.mjs` as governance-only, preventing the repaired contract test itself from being rejected by the synthetic candidate-side boundary.
- The Master Index was rebound to `a3437237d87a8f3abd0e7e74c2efabc679565788`, then the fresh sweep exposed a narrow test-harness defect on `edc88542efe178b69414270974fe7e3dee792443`: `replaceLatestFunctionBody()` used a case-sensitive literal marker, so it mutated an older uppercase definition instead of the latest lowercase migration definition. The canonical SQL itself was correct and the lock-order gate passed; only the adversarial TOCTOU harness failed.
- Surgical correction applied in `c0905728c94c4a9c740bdf9c88d702fb6d51fcfd`: `replaceLatestFunctionBody()` now locates the latest function case-insensitively and slices to the next CREATE FUNCTION marker case-insensitively. No production SQL was changed.
- The `9e2fd53...` exact-head certification run `34405597178` then isolated the next narrow defect in `scripts/check-decision-approval-toctou-contract.mjs`: the `gateBeforeLock` mutation removed the canonical decision lock and inserted a new `FOR UPDATE` immediately before the approvability gate, so the validator correctly reached the gate-order error instead of the expected missing-lock error. The production SQL and canonical lock-order gate both passed; this was purely an adversarial test mutation construction defect.
- Surgical correction applied in `00d2f1e9fc571641ee96e3485eaa43d7c2729c38`: the `gateBeforeLock` adversarial mutation now moves the approvability gate before the existing decision lock instead of deleting the lock and inserting a replacement. This directly tests the intended TOCTOU ordering failure without creating a second synthetic lock. No production SQL was changed.
- The Master Index is now bound to `00d2f1e9fc571641ee96e3485eaa43d7c2729c38`. Fresh exact-head CI is required now; no PASS or certification is inferred from this repair.
