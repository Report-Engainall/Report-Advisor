# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-17

> Authoritative execution manifest. This document never promotes historical evidence across an exact Git `HEAD` boundary. Pair every evidence batch with the exact Git `HEAD` of `main` and the exact environment/commit used.

### CURRENT EXACT HEAD
- Current code/test candidate: `a8dbce2e5c2e105805102fa3a406bfeb9cd488c7`.
- This candidate is the current executable certification candidate on PR #476 (`fix(e2e): close real customer persistence on canonical fixture`).
- The candidate contains the bounded authentication/session-convergence test hardening, the production lifecycle fixes, the minimal current-head UI contract fixes, the corrected K/L evidence-chain contract coverage, the minimal CSV header-parser compatibility fix, the canonical Phase-H continuous-trust contract binding, and the canonical Phase-K runtime closure contract binding, plus the canonical Phase-L autonomy runtime migration restored under fresh exact-SHA certification.
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
- Current browser certification remains NOT PROVEN until the fresh exact-head browser run produces the required operational evidence.
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
- Certification consumer contract fix is now governed against candidate `a8dbce2e5c2e105805102fa3a406bfeb9cd488c7`; this note is governance-only and does not transfer runtime evidence.
