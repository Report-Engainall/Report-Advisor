# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-18

> Authoritative execution manifest. This document never promotes historical evidence across an exact Git `HEAD` boundary. Pair every evidence batch with the exact Git `HEAD` of `main` and the exact environment/commit used.

### CURRENT EXACT HEAD
- Governed Main: `9bd7243c8864ca5bcf431b14a7c2eb35c698de7c`.
- Current remediation candidate after rebasing PR #560 onto current Main: `2cf7a63c5d6b814176e822c8d996c76762002975`.
- PR #560 branch `fix/pdf-structured-runtime-final-20260918` is the active remediation path; the previous wrapper SHA `01f453bf...` is superseded by the rebased candidate and must not carry forward as certification evidence.
- The autonomous operating protocol remains repository-resident at `docs/PROGRAMMER_AUTONOMOUS_OPERATING_PROTOCOL.md`.
- Fresh PC01 exact-candidate proof on `2cf7a63c...`: TypeScript typecheck PASS, production build PASS, file-engine behavioral regressions PASS, and 20-stage release-readiness PASS (20/20).
- The current Main Windows-safe readiness change was retained during rebase; the only conflict was the documentation binding, which was resolved by preserving the newer Main binding rather than transferring stale candidate memory.
- No runtime/browser/production evidence from an earlier SHA is promoted by this binding.
- Fresh exact-head GitHub runtime/certification evidence remains mandatory; queued Actions are not PASS and cannot inherit earlier evidence.
- Current-head production deployment/cutover remains NOT PROVEN; no production mutation or alias change was performed.

### CURRENT EXECUTION CONTROL — 2026-09-18
- PR #533 remains the repository-resident continuous execution/resume protocol and is governance-only.
- Structured PDF/file-engine front is revalidated on the rebased candidate: file-engine regression PASS and build/typecheck PASS. The real Supabase-backed PDF regression still requires GitHub CI secrets; PC01 has no `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` environment variables and no fake values were used.
- Canonical import server-boundary remediation and worker service-role authority reconciliation remain part of the current candidate. The existing durable runner/RPC architecture was retained; the runner was not rewritten.
- Current exact-candidate repository readiness is strong, but authenticated business E2E, fresh PDF/OCR runtime with real Supabase configuration, current-head Browser/Certification evidence, and current-head production/deployment verification remain open.
- Rule: do not restart closed work or transfer evidence across SHA boundaries.
- Rule: independent fronts must run in parallel; queued CI or external provider blockers must not idle repository-side execution.

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
- PR #550 — structured PDF/file-engine runtime repair — merged and fresh exact-main PDF verification is recorded.
- PR #556 — production-coordinator runtime test loader restoration — merged and current exact-head coordinator proof is recorded.

### BOUNDARY / GOVERNANCE
- No rebuild from scratch.
- No historical migration rewrite.
- No Production alias mutation or rollback action as part of source reconciliation.
- No Staging data fixture is treated as certification unless an actual lifecycle is observed.
- No HTTP 200, UI shell, CI-created run, fixture assertion, simulated JWT, historical deployment, or old SHA can certify the current candidate.
- External operational blockers do not justify idle work on source reconciliation, contract hardening, test design, or evidence preparation.
- Recovery boundary: `backup/restore` remains **NOT PROVEN** until an isolated restore drill records measured RPO/RTO, successful application readback, and exact evidence on the current candidate.

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
