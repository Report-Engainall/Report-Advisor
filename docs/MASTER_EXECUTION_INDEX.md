# Report Advisor — Master Execution & Truth Index

## OWNER-LEVEL RELEASE CLOSURE — 2026-09-01

This file is the authoritative execution index. Historical PASS remains historical. No PASS may move between branches/SHAs without exact-head evidence.

## Current Truth

- Planning estimate from latest developer assessment: **~88%** overall.
- Independent release-readiness judgment: advanced Release Candidate; **NOT Production Certified / NOT Sellable yet**.
- Current `main` release baseline before PR #294 integration: `4705028d1e19ea7201f4cb9945ce3e1cc1a550a2`.
- Owner integration PR: **#294**, OPEN / NOT MERGED.
- Latest PR #294 head: `688be5ea9636f47d9d205ec3a1fa8193368a86ca`.
- PR #294 base SHA: `4705028d1e19ea7201f4cb9945ce3e1cc1a550a2`.
- Do not call the PR head `main` PASS until PR #294 is merged and exact-head CI passes.

## Latest Executed Cycle — 2026-09-01

The developer continued Cycle 3 without waiting for CI and performed direct staging Supabase verification. A new security-advisor finding was surfaced and retained as a real remediation item rather than hidden under historical PASS.

Executed/verified:
- Staging Supabase is reported `ACTIVE_HEALTHY`, PostgreSQL 17, with **78 public tables**.
- `public.finalize_runtime_decision(uuid)`: `anon EXECUTE = FALSE`; `authenticated EXECUTE = TRUE`.
- Security Advisor was executed against staging and identified multiple `SECURITY DEFINER` functions executable by `authenticated`, including runtime decision functions and `current_company_id`.
- Leaked Password Protection remains disabled.
- No broad/reckless revoke was performed because some authenticated `SECURITY DEFINER` functions may be intentional runtime contracts and must be reviewed against callers, tenant checks, RLS, and least privilege before changing grants.
- PR #294 remains **OPEN / NOT MERGED** at `688be5ea9636f47d9d205ec3a1fa8193368a86ca`.
- No GitHub Actions workflow run has yet been observed for the exact `688be5...` candidate; therefore no Exact-Head CI PASS exists.
- Backup verification remains 0 PASS; production rollback drills remain 0 PASS; autonomy rollback drills remain 0 PASS.

## Security Interpretation Rule

A `SECURITY DEFINER` function being executable by `authenticated` is **not by itself proof of a vulnerability**. It becomes a release blocker when its effective privileges or implementation allow an authenticated caller to bypass intended tenant/user authorization, RLS boundaries, or least-privilege requirements. Each flagged function must therefore be classified individually before any revoke.

Required classification for every Advisor-flagged function:

`FUNCTION → CALLERS → SECURITY DEFINER → search_path → EXECUTE grants → tenant/user guards → underlying tables/RLS → intended runtime caller → exploit test → decision`

Allowed decisions:

- `RETAIN + JUSTIFY + TEST`
- `HARDEN + TEST`
- `REVOKE + TEST`

No blanket revoke is permitted without this analysis.

## Current Operational Truth / Blockers

1. **Exact-Head CI:** no run yet for `688be5...`; no PASS.
2. **Security:** Advisor findings require per-function analysis; leaked-password protection is still disabled.
3. **Authenticated A/B:** no operational credentials/sessions available for honest LIVE E2E evidence.
4. **Backup/Restore:** no real PASS run yet.
5. **Rollback:** no real PASS run yet.
6. **Vercel:** new deployment remains blocked by `api-deployments-free-per-day` (>100 deployments/24h).
7. **Runtime certification:** current public production is reachable but is not a fresh deployment of the current integration candidate.

## Parallel Execution Board

### P0-A — PR #294 exact-head closure
- Trigger/obtain real GitHub Actions execution on the candidate.
- Run Vitest contracts, typecheck, lint, build, regression, security, quality.
- Inspect and fix failures.
- Do not promote old/e0cf21 PASS to `688be5...`.
- Merge only after required exact-head gates pass.

### P0-B — Security Advisor remediation
**Immediate and parallel.**
- Enumerate every flagged `SECURITY DEFINER` function.
- For each, trace callers and effective privileges.
- Verify tenant/user guards, `search_path`, underlying RLS, and intended runtime use.
- Build exploit/negative tests for unauthorized access.
- Retain intentional functions with documented justification and proof.
- Harden or revoke only where analysis demonstrates excessive privilege.
- Re-run Security Advisor and targeted regression after each change.
- Resolve Leaked Password Protection through the correct Auth configuration surface when access is available.

**Exit:** every Advisor finding is either safely remediated or explicitly proven intentional with runtime/security evidence; no unexplained authorization bypass remains.

### P0-C — Authenticated Runtime / Tenant A-B
**Parallel; do not wait on CI.**
- Prepare/execute Actor A and B login/session journeys.
- Own-data CRUD, persistence, reload, logout/re-login.
- Cross-tenant direct IDs/RPC/read/write denial.
- Storage/signed URLs, Realtime, AI/vector isolation.
- Browser/network/console evidence.

### P0-D — Vercel / Runtime Deployment
**Parallel; never wait if quota-blocked.**
- Prepare fresh deployment for final candidate.
- SHA binding.
- `/`, `/login`, deep routes, authenticated journey.
- Console/network/runtime checks.

### P0-E — Canonical Truth / BI / Export
**Parallel.**
- Golden business corpus.
- UI = RPC = Export.
- Date/status/as-of/filter semantics.
- NULL/UNKNOWN/INSUFFICIENT_DATA.
- Forecast/demand/inventory.
- Legacy/compatibility consumer risks.

### P1-F — OCR / Document Golden Corpus
- PDF text, scanned PDF, Arabic/English OCR, DOCX, images, malformed files.
- Ground truth comparison.
- Accuracy/confidence/provenance/regression baseline.

### P1-G — Workers / Queue / Watched Folder
- Success/failure/retry/lock/idempotency.
- Crash/restart/recovery/DLQ.
- Watched folder: detect → parse → validate → import → reconcile → canonical → evidence.
- Duplicate/malformed/interrupted/reprocess.

### P1-H — Backup / Restore / DR
- Real backup artifact.
- Restore in safe environment.
- Schema/data/relationship/application integrity.
- Measure RPO/RTO.

### P1-I — Canary / Rollback
- Known-good candidate.
- Controlled canary.
- Controlled rollback in safe environment.
- Verify integrity and runtime after rollback.

### P1-J — Performance / Scale
- Read P95 ≤300ms.
- Write P95 ≤800ms.
- Preview ≤1500ms.
- Realistic corpus.
- Query plans/indexes.
- N+1/unbounded-read attacks.

### P1-K — Observability / Operations
- DB/Realtime/services/Storage/notifications/security health.
- Trigger representative alerts.
- Verify alert visibility and recovery.
- Bind evidence to exact SHA.

### P2-L — UI/UX
- Authenticated responsive/RTL/accessibility.
- Loading/empty/error states.
- Deep links.
- Import/documents/evidence/admin/logout.

### P2-M — Business Acceptance
- Merchant golden scenarios.
- Independent expected results.
- Decision/evidence/outcome.
- UI/export equality.
- User can operate product without developer intervention.

## SHA / Evidence Rules

1. Branch-local PASS is not `main` PASS.
2. Historical PASS is not current candidate PASS.
3. A migration being present is not proof of runtime behavior.
4. A test file existing is not test PASS.
5. A reachable deployment is not runtime certification.
6. Every final PASS must identify the exact tested SHA.
7. Certification requires all required evidence to converge on ONE release SHA.
8. A Security Advisor warning must be classified by actual exploitability/privilege semantics; do not close it by blanket revoke or by ignoring it.

## No-Waste Operating Protocol

The programmer must NOT restart with a broad repository tour or repeat old reports.

For every cycle:

`OPEN INDEX → SELECT ALL INDEPENDENT FRONTS → INSPECT MINIMUM NEEDED → IMPLEMENT → TARGETED TEST → ADVERSARIAL TEST → REQUIRED REGRESSION → EXACT SHA → MERGE IF JUSTIFIED → IMMEDIATELY CONTINUE`

If one front is blocked, continue all independent fronts.

Required update format only:

```text
EXECUTED:
- concrete implementation

VERIFIED:
- actually executed tests/evidence

SHA:
- exact SHA

BLOCKED:
- real blocker only

NEXT PARALLEL:
- next executable fronts
```

## Final Definition of Done

```text
ONE EXACT RELEASE SHA
+ Build/Typecheck/Lint
+ Quality/Architecture
+ Security
+ DB/Migration parity
+ Canonical Truth
+ Authenticated E2E
+ Tenant A/B
+ Storage/Realtime/AI isolation
+ Vercel/runtime
+ OCR/document corpus
+ Workers/queue/recovery
+ Backup/Restore
+ Rollback
+ Performance
+ Observability
+ Critical UX
+ Business Acceptance
+ Complete Evidence Pack
= PRODUCTION CERTIFIED / SELLABLE
```

## OWNER DECISION

The project remains in **PROVE → CERTIFY → RELEASE**, not BUILD. The newly surfaced Security Advisor findings are a real release-closure workstream, but they must be handled by per-function authorization analysis rather than blanket revocation. No security PASS is granted until the flagged functions are classified, negative authorization paths are tested, and the final candidate is re-verified.
