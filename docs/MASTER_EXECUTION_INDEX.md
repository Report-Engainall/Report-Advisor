# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-18

> Authoritative execution manifest. This document never promotes historical evidence across an exact Git `HEAD` boundary. Pair every evidence batch with the exact Git `HEAD` of `main` and the exact environment/commit used.

### CURRENT EXACT HEAD
- Current code/test candidate: `efe572cf65d56728e0b4a3d9d42007439b20e185`.
- This candidate is reconstructed directly on governed current Main `f37e4eee4131b521be7f69589a27832bc978761f`; the only code changes are the retained canonical import/worker remediation and the structured PDF/OCR hardening.
- No earlier runtime PASS is promoted across this SHA boundary.
- PC01 exact-candidate verification on `efe572cf...`: `npm ci` completed; TypeScript typecheck PASS; file-engine behavioral regression PASS; file-engine architecture contract PASS; production build PASS.
- The production build completed with only non-blocking Browserslist/Bluebird warnings.
- Fresh real-Staging PDF/OCR runtime evidence is still required; the predecessor `e5a31d...` failure at `invoice_date` is historical and its parser root cause has been corrected here.
- Vercel deployment remains unproven because the provider build-rate-limit gate is external; no production mutation/cutover was performed.

### CURRENT EXECUTION CONTROL — 2026-09-18
- PR #560 is the authoritative active remediation path.
- Current Main `f37e4eee...` is governance-only over product candidate `b554af...`; its change is limited to certification-index wording. The active remediation is based directly on the governed head.
- Staging worker service-authority migration `20260918043413_reconcile_report_execution_worker_service_authority` remains applied. Prior transaction-only service-role proof is historical and is not transferred as current candidate runtime evidence.
- Fresh exact-head CI/certification is mandatory before any release claim.
- Independent fronts continue in parallel; Vercel external rate limiting does not block source/contract/staging work.

### ACTIVE REMEDIATION RCA — 2026-09-18
- Exact predecessor `e5a31d88...` failed real-Staging structured PDF regression at `invoice_date`.
- Root cause: integration/rebase retained a stricter date/numeric parser than governed Main's whitespace-tolerant parser.
- Candidate `efe572cf...` restores whitespace-tolerant date separators/numeric spacing while retaining the durable canonical-import and worker authority remediation.
- A source-newline encoding defect was found by exact typecheck in an intermediate parser commit and corrected before this candidate.

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
