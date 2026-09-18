# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-18

> Authoritative execution manifest. This document never promotes historical evidence across an exact Git `HEAD` boundary. Pair every evidence batch with the exact Git `HEAD` of `main` and the exact environment/commit used.

### CURRENT EXACT HEAD
- Current code/test candidate: `11f21f57a424a5d4f29dc466851d2ff45881e9aa`.
- This is the exact remediation candidate created directly from current `main` `54b6b95bae9fd3737c70c126bf727cac21aec143`, preserving current-main governance files and reapplying the PDF/OCR + import runtime remediation.
- The autonomous operating protocol is now repository-resident at `docs/PROGRAMMER_AUTONOMOUS_OPERATING_PROTOCOL.md`.
- PC01 native desktop verification is recorded at `docs/evidence/DEVICE_PC01_VERIFICATION_20260918.md`; its native smoke is PASS and its evidence is bound to the documented local source SHA/environment.
- No runtime/browser/production evidence from an earlier SHA is promoted by this binding.
- The certification binding itself is governance-only and does not certify runtime/product code; fresh exact-HEAD runtime evidence is still required.
- Historical evidence from earlier SHAs remains historical and is not promoted automatically.
- Current-head workflow execution is not yet evidenced on this SHA by the repository Actions run feed; absence of runs is not PASS and does not transfer historical evidence.
- Current `main` is `54b6b95bae9fd3737c70c126bf727cac21aec143`.
- PR #552 is the active remediation path; stale PR #542 is closed and its evidence is not promoted.
- The first exact-head Vercel build at `d62e8894dfbeb06f2c9924ed82ff54e8bd8605f7` failed deterministically because `finishCanonicalImportFailure` was imported but not exported by `src/lib/import/canonical-production-adapter.ts`.
- This was corrected minimally on candidate `11f21f57a424a5d4f29dc466851d2ff45881e9aa`; the next exact-head build is required before treating build/runtime as green.
- Staging worker service-authority migration `20260918043413_reconcile_report_execution_worker_service_authority` is applied and preserved by this candidate.
- Vercel deployment proof remains pending for candidate `11f21f57a424a5d4f29dc466851d2ff45881e9aa`; no deployment/runtime PASS is claimed until the new build completes.

### CURRENT EXECUTION CONTROL — 2026-09-18
- PR #533 adds the mandatory continuous two-owner execution/resume protocol. It is governance-only and does not itself certify runtime.
- Programmer-owned active runtime front: PR #552 (`f860490641d3a9650ca75d56d3f3207e6c3ee0db`) for structured PDF/OCR, canonical import terminal authority, and worker service-authority reconciliation on current Main.
- Coordinator-owned verification fronts: fresh exact-head CI/runtime evidence, Supabase staging truth/security, production/deployment verification, resilience/evidence control, and commercial-gap control.
- Rule: do not restart closed work. Resume IN_PROGRESS fronts from their last verified checkpoint. Do not mix evidence across SHA boundaries.
- Rule: independent fronts must run in parallel; a queued CI workflow or external provider blocker must not idle unrelated work.

### VERIFIED STAGING WORKER AUTHORITY — 2026-09-18
- Real Staging transaction probe against job `e9b13f2d-1ad0-474f-b5b8-98322ce1e573` succeeded under trusted `service_role`: claim and `decisioned → committed` checkpoint transition both returned success.
- The transaction was rolled back; the real job returned to `queued` with no lease, so the probe did not mutate durable Staging state.
- Function execute privileges are now `service_role=true`, `authenticated=false`, `anon=false` for claim, advance, heartbeat, complete, fail, and retry worker RPCs.
- This closes the previously diagnosed worker authority mismatch at the RPC boundary. Full end-to-end lifecycle/runtime certification is still separate and remains unproven until a real exact-head production lifecycle is observed.

### ACTIVE EXACT-HEAD EVIDENCE — 2026-09-18
- GitHub Actions has begun the exact-head run matrix for candidate `11f21f57...`; many required workflows are queued, with `desktop-windows` in progress and no certification conclusion yet.
- Vercel stale-head deployment `dpl_BLhvgu345Srr8G4Ra5VSLuqHs5Bh` for `d62e889...` failed at `npm run build` on the missing export described above; no PASS is transferred.
- The correct next gate is the new candidate build plus the exact-head regression/certification workflows.

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
