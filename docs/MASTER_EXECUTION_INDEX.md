# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION TRUTH — 2026-09-01

This index is authoritative for execution state. Historical PASS is never promoted across SHAs. Certification requires exact-head evidence.

### Current candidate
- Repository: `Report-Engainall/Report-Advisor`
- PR: **#294 — OPEN / NOT MERGED**
- Base: `main` @ `89c8361e85878521c915328f6d0a595663498cd3`
- Current execution head: `4d8cb88576c42aedd9d5e440614f8481c9d5ad33`
- Current branch: `codex/p0-hardening-integration-20260901`
- Exact-head CI is required after the latest Phase-1 exact-head assertion repair; no final PASS is claimed yet.

### Latest executed repair
- Final Certification run `33516061527` and Quality run `33516061611` were inspected at the log level.
- Both were executing the older exact SHA `a09c90027870dd687ab92871a7cff5682e07a1dc`, not the newer candidate. This explains why they could not validate later fixes.
- Quality's Phase-1 checker failed on an outdated assertion requiring literal `${GITHUB_SHA}` syntax, while the canonical workflow correctly uses the PR head SHA expression and compares it to `git rev-parse HEAD`.
- Updated `scripts/check-phase1-foundation-closure.mjs` to validate the actual fail-closed exact-head contract rather than a superseded syntax pattern.
- New exact head: `4d8cb88576c42aedd9d5e440614f8481c9d5ad33`.

### Verified on the inspected exact-head cycle
- 20-stage release readiness: **19/20 PASS** before the Phase-1 repair; all stages except architecture passed.
- Build/typecheck: PASS.
- Lint: PASS.
- Auth/tenant: PASS.
- Global RLS: PASS.
- Migration schema/dependencies: PASS.
- Import security/transaction/runtime: PASS.
- File/schema/document/data/business/decision intelligence: PASS.
- Watched-folder: PASS.
- Production resilience: PASS.
- Production scale: PASS.
- Release blockers: PASS.
- Separate integrity/security/truth workflows: PASS.
- `production-chain-guard`: PASS.

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
