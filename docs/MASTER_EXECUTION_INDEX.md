# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION TRUTH — 2026-09-01

This index is authoritative for execution state. Historical PASS is never promoted across SHAs. Certification requires exact-head evidence.

### Current candidate
- Repository: `Report-Engainall/Report-Advisor`
- PR: **#294 — OPEN / NOT MERGED**
- Base: `main` @ `89c8361e85878521c915328f6d0a595663498cd3`
- Current PR head: `79b79098bc784aa6ffe690dd809e250796dc6387`
- Current branch: `codex/p0-hardening-integration-20260901`
- Exact-head CI on the preceding `8df3b143...` exposed CI-boundary failures; those are now repaired and a new exact-head cycle is required on `79b79098...`.

### Verified in the immediately preceding exact-head cycle
- 20-stage release readiness: **20/20 PASS**.
- Auth/tenant convergence: PASS.
- Authenticated E2E authorization/session/operation matrices: PASS as executable contracts.
- Document Intelligence hardening: **20/20 PASS**.
- DR recovery contract/readiness: PASS.
- Evidence provenance/lineage: PASS.
- Decision/work-item authorization and DML boundaries: PASS.
- Import security/transaction/runtime governance: PASS.
- Windows contract: pending exact-head re-run after CI identity-gate repair.
- Storage tenant isolation: PASS.
- Canonical truth/aggregation/dashboard numeric truth: pending exact-head re-run after identity-gate repair.
- Production-chain and release-blocker contracts: PASS.

### Current CI repairs
1. Quality Diagnostics was incorrectly attempting `git ls-remote` after checkout had deliberately disabled persisted credentials. The exact PR SHA is already supplied by the pull-request event and checked out directly; the unauthenticated remote lookup was removed.
2. Phase 9 Windows exact-head verification had the same credential-dependent remote lookup; replaced with local checked-out SHA versus PR event SHA.
3. Dashboard numeric truth had the same credential-dependent remote lookup; replaced with local exact-head verification.
4. The resulting change is intentionally limited to CI identity validation; no product/runtime behavior was altered.

### Security hardening already applied
- Worker lifecycle RPCs are restricted to `service_role`; authenticated EXECUTE was revoked for checkpoint/complete/fail/heartbeat/retry operations.
- Authenticated direct INSERT/UPDATE/DELETE/TRUNCATE on `report_execution_jobs` were revoked; read-only tenant-scoped access remains.
- Repository migration: `supabase/migrations/20260901150000_harden_worker_runtime_authority.sql`.
- No blanket SECURITY DEFINER revoke was used; user-facing authenticated APIs remain subject to individual privilege/tenant analysis.

## NON-NEGOTIABLE CERTIFICATION BLOCKERS

These are not to be fabricated as PASS:
- Production authenticated runtime.
- Real Actor A/B tenant isolation.
- Real backup + restore drill.
- Real rollback drill.
- Live Vercel deployment/runtime bound to the certified SHA.
- Real browser authenticated E2E with valid credentials.
- Live OCR/Golden Corpus execution where backend/device capability is required.
- Independent business acceptance.

## EXECUTION PROTOCOL

`OPEN INDEX → SELECT INDEPENDENT FRONTS → INSPECT MINIMUM → IMPLEMENT → TARGETED TEST → ADVERSARIAL TEST → REGRESSION → EXACT SHA → VERIFY → CONTINUE`

Do not rebuild closed work. Do not promote historical PASS. Do not mutate the frozen release candidate or production alias without certification evidence. If one operational front is blocked, continue all repository-executable fronts.

## RELEASE EQUATION

`ONE EXACT SHA + build/typecheck/lint + quality/security + canonical truth + authenticated E2E + tenant A/B + deployment/runtime + OCR/document + workers/recovery + backup/restore + rollback + performance + observability + UX + business acceptance + complete evidence = PRODUCTION CERTIFIED / SELLABLE`
