# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-18

> Authoritative execution manifest. This document never promotes historical evidence across an exact Git `HEAD` boundary. Pair every evidence batch with the exact Git `HEAD` of `main` and the exact environment/commit used.

### CURRENT EXACT HEAD
- Current code/test candidate: `0e43ac466faad12d787f3a9def9e6cb48135512d`.
- No runtime/browser/production evidence from `66d684...` or earlier SHAs is promoted to this candidate.
- The candidate now contains the terminal-writer fix, worker service-authority reconciliation, and their regression contract; it does not certify runtime/product behavior. Fresh exact-HEAD runtime evidence is required.
- Historical evidence from earlier SHAs remains historical and is not promoted automatically.
- Fresh exact-head CI/runtime evidence is required after the new worker-authority migration and terminal-writer correction. Any queued/pending workflow execution is evidence preparation only, not PASS.
- Vercel reports the current Main deployment path as externally blocked by the provider build-rate limit; no production deployment is claimed from that status.

### ACTIVE RUNTIME FINDINGS — 2026-09-18
- Staging real-data observation: canonical import jobs with lease owner `canonical-import-ui:*` reached `decisioned`; corresponding `canonical_import_commits` rows prove real DB commit (`committed_count=1`).
- Staging worker RPC definitions required `auth.uid()` even though the intended current server execution boundary uses `service_role`; this creates an authority mismatch for service-side checkpoint/failure transitions.
- PR #542 adds a forward-only worker-authority migration that accepts the trusted `service_role` JWT role for internal worker RPCs, preserves tenant/job/lease fencing, revokes authenticated/anon worker EXECUTE, and keeps user-facing `import_finish_job` authenticated.
- PR #542 also removes duplicate terminal `import_finish_job` writes from `CanonicalImportPage.tsx`; only the canonical durable/server boundary owns terminal completion after entry.
- These changes are corrective code/schema work only. Fresh exact-SHA runtime proof is still required; no Staging observation above is promoted as certification evidence.

### CURRENT EXECUTION CONTROL — 2026-09-18
- PR #533 adds the mandatory continuous two-owner execution/resume protocol. It is governance-only and does not itself certify runtime.
- Programmer-owned active runtime front: PR #542 (`dcbd519b562f5bce2981a46cbdab409f62cb7d5f`) for structured PDF/OCR, import terminal-contract closure, and certification-checker correction on current Main.
- Coordinator-owned verification fronts: current exact-head evidence binding, Supabase staging truth/security, production/deployment verification, resilience/evidence control, and commercial-gap control.
- Rule: do not restart closed work. Resume IN_PROGRESS fronts from their last verified checkpoint. Do not mix evidence across SHA boundaries.
- Rule: independent fronts must run in parallel; a queued CI workflow or external provider blocker must not idle unrelated work.

### CURRENT MAIN — MATERIAL FRONT CLOSURE
- PR #525 — security exposure checker bound to repository truth — merged.
- PR #520 — migration/observability parity reconciliation — merged.
- PR #521 — Phase F readiness classification — merged.
- PR #522 — authenticated tenant storage isolation proof — merged.
- PR #524 — Cloudflare Pages compatibility proof — merged.
- PR #528 — canonical import duplicate identity bound to `canonical_import_commits` before legacy `file_records` fallback — merged.
- PR #526 — tenant-scoped billing runtime with explicit PUBLIC/anon SECURITY DEFINER revocation and authenticated-only execution — merged.
- PR #527 — exact-PR-head recovery / Phase F CI evidence enablement — merged.
- PR #529 — tenant-backed `/work-center` operational surface using the existing import read path — merged.

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
- Staging Supabase project baseline was previously observed as `ACTIVE_HEALTHY`; these historical observations are not treated as current-head certification evidence.
- Critical-table RLS verification: 9/9 checked tables protected in the historical baseline.
- Critical-table anonymous-policy verification: 9/9 checked tables had no anon policies in the historical baseline.
- Security-definer authenticated surface was previously audited for tenant binding and pinned `search_path`.
- Worker RPC surface was designed for service_role-only execution; authenticated browser execution is not a substitute for worker authority.
- Canonical import RPCs remain the supported authenticated business mutation surface.
- Runtime lifecycle PASS is never inferred from schema-only inspection.

### P0 — AUTHENTICATED E2E / TENANT A-B
- Dedicated Actor A/B authenticated users and one-to-one tenant mapping remain part of the established browser test design.
- The real business runner covers authenticated tenant resolution, customer/product/invoice import, DB read-back, UI read-back, refresh continuity, Tenant B isolation, cross-tenant denial, and logout/session lifecycle.
- Existing customer and product screens now use tenant-scoped pagination/search and real create dialogs through existing canonical paths; current Main source confirms the capability, but fresh current-head business E2E evidence is still required before certification.
- `/onboarding` is present in current Main and reads authenticated user, current company, membership role, canonical import count, and data-quality state; current-head browser proof remains required.
- `/work-center` is present in current Main and is read-only: it reads existing `fetchImportRecords()` state and exposes operational filters/counts without creating a parallel job state.
- There is no dedicated invoice-entry route; canonical import remains the supported invoice mutation surface.

### P1 — MIGRATION / SCHEMA PARITY
- Migration/observability parity was reconciled on Main through PR #520 using the forward-only lineage already established by the project.
- No historical migration record is rewritten.
- Fresh disposable replay parity is still required before certification; PR/branch evidence is not equivalent to a fresh replay PASS.

### Worker / Reliability
- Durable worker contract has explicit tenant identity, lease ownership, lease-token fencing, checkpoint monotonicity, retry budget, dead-letter handling, source provenance, and service_role-only execution.
- Queue scalar boundaries are implemented in current Main: blank run/worker/lease identifiers are rejected, retry budgets require positive integers, and lease duration is finite and at least 30 seconds.
- Worker runtime crash/retry/recovery remains UNPROVEN until an actual disposable job is executed through enqueue → claim → heartbeat/checkpoint → forced expiry → recovery → retry/DLQ.
- Current exact-head resilience workflows are enabled for PRs and verify the checked-out SHA explicitly before execution.
- Backup/restore runtime remains NOT PROVEN: repository evidence-integrity checks pass, but a disposable restore drill with verified RPO/RTO and exact-head evidence is still required before release certification.

### OCR / Document Intelligence
- The historical OCR confidence defect fix remains part of the repository contract: recognition confidence is preserved, malformed metadata fails closed, and low-confidence/no-text paths are review/reject paths rather than fabricated confidence.
- Repository-native OCR behavioral coverage exists.
- Real Arabic golden-corpus runtime remains NOT PROVEN until an actual document passes through source → OCR → normalization → DB → reconciliation → analytics → evidence/decision → output on the current exact SHA.

### Import / Reconciliation
- Canonical import remains the supported business mutation path.
- Import RPC tenant context, direct-write guards, transaction lifecycle, state contracts, business-key behavior, and runtime governance are represented by repository checks.
- Current Main now resolves duplicate source identity against tenant-scoped `canonical_import_commits` using normalized SHA-256 identity before consulting legacy `file_records`; no historical duplicate PASS is transferred.
- Current-head import runtime with real authenticated tenant data remains NOT PROVEN until exact-SHA E2E evidence records upload/preview/commit/read-back, duplicate terminal idempotency, and A/B denial.

### Watched Folder
- Native watched-folder contract exists and is covered by repository checks.
- End-to-end discovery, hash/fingerprint, duplicate handling, tenant binding, processing handoff, terminal state, and retry remain operationally UNPROVEN.
- Disposable lifecycle execution remains required before certification.

### Billing / Commercial Runtime
- Current Main contains the provider-neutral billing runtime: plans/capabilities/subscriptions/usage/events, tenant RLS, idempotent usage and provider event keys, quota/entitlement fail-closed behavior, and authenticated-only SECURITY DEFINER billing RPC execution.
- Billing SECURITY DEFINER functions explicitly revoke PUBLIC/anon execution before granting `authenticated` execution.
- Billing runtime is repository-merged; real provider webhook/payment integration and current-head staging runtime proof are not claimed without live evidence.

### Decision / Evidence / Outcomes
- Decision SECURITY DEFINER functions were reviewed individually rather than blanket-revoked.
- Sensitive decision mutations use tenant context and user identity checks; anonymous execution is denied.
- Decision work-item RLS is tenant-scoped.
- Outcome/evidence paths enforce tenant/provenance/state boundaries.
- The release decision layer currently fail-closes on missing/invalid `source_sha`, candidate SHA mismatch, scenario count mismatch, non-PASS scenario states, per-scenario SHA mismatch, missing/invalid evidence, evidence hash mismatch, and regression mismatch.
- Final Certification Gate checks out the exact certification SHA with full history, verifies certification-boundary integrity, verifies exact checkout provenance, and rejects synthetic PR merge SHA as certification evidence.
- Final certification remains FAIL-CLOSED until fresh exact-head runtime/evidence and governed candidate binding are satisfied.

### EXECUTION RECONCILIATION — 2026-09-18
- Windows production-regression harness was repaired for explicit \`npm.cmd\` execution through \`ComSpec\`; no implicit shell option is used.
- Quality workflow contract checker was made line-ending agnostic; the prior CRLF workflow caused a false-negative concurrency check.
- Local exact-code-head regression matrix on \`50551116b4221e3914de52f3906b3a3af25fecab\`: 12/12 scenarios PASS, including \`pdf-text\` and \`pdf-ocr-ar\`.
- This 12/12 result is executable regression evidence only. It does not prove live DB commit, browser persistence, or production runtime certification.
- Vercel remains externally rate-limited; no bypass/forced deployment is inferred.
