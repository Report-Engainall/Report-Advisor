# Report Advisor — Master Execution & Truth Index

## OWNER-LEVEL RELEASE CLOSURE — 2026-09-01

This file is the authoritative execution index. Historical PASS remains historical. No PASS may move between branches/SHAs without exact-head evidence.

## Current Truth

- Planning estimate from latest developer assessment: **~88%** overall.
- Independent release-readiness judgment: advanced Release Candidate; **NOT Production Certified / NOT Sellable yet**.
- Current `main` release baseline: `4705028d1e19ea7201f4cb9945ce3e1cc1a550a2`.
- Owner integration PR: **#294**, OPEN / NOT MERGED.
- Latest PR #294 head: `688be5ea9636f47d9d205ec3a1fa8193368a86ca`.
- PR #294 base SHA: `4705028d1e19ea7201f4cb9945ce3e1cc1a550a2`.
- `e2d7f57e4a4eab3327b54d762427a46e4d3a3264` is an index-referenced integration candidate only; it is NOT the current PR #294 HEAD.
- Do not call the PR head `main` PASS until PR #294 is merged and exact-head CI passes.

## Latest Executed Cycle — 2026-09-01

The developer revalidated PR #294 and the index, confirmed the candidate remains unmerged, and attempted additional direct Supabase and local-test verification. Those attempts were blocked by missing valid Supabase project reference and unavailable GitHub network access in the execution environment. No fabricated DB/test PASS was accepted.

Security work continues as function-level analysis rather than blanket revoke. The previous staging verification remains recorded: `finalize_runtime_decision` had `anon EXECUTE = FALSE` and `authenticated EXECUTE = TRUE`; Security Advisor identified multiple authenticated-callable `SECURITY DEFINER` functions; leaked-password protection remains disabled.

A reference mismatch was explicitly confirmed: the index referenced `e2d7f57...` while PR #294 remained at `688be5...`. This is recorded as a mismatch, not reconciled by assumption. `main` remains `4705028...`.

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
7. **Local test execution:** current execution environment cannot reach GitHub; therefore no local `npm ci`/Vitest PASS is claimed.
8. **Supabase direct SQL:** valid project reference was unavailable to the execution tool in the latest cycle; no new DB PASS is claimed from that attempt.

## Parallel Execution Board

### P0-A — PR #294 exact-head closure
- Obtain real GitHub Actions execution on the candidate.
- Run Vitest contracts, typecheck, lint, build, regression, security, quality.
- Inspect and fix failures.
- Do not promote old/e0cf21 PASS to `688be5...`.
- Merge only after required exact-head gates pass.

### P0-B — Security Advisor remediation
- Enumerate every flagged `SECURITY DEFINER` function.
- Trace callers and effective privileges.
- Verify tenant/user guards, `search_path`, underlying RLS, and intended runtime use.
- Build exploit/negative tests for unauthorized access.
- Retain intentional functions with documented justification and proof.
- Harden or revoke only where analysis demonstrates excessive privilege.
- Re-run Security Advisor and targeted regression after changes.
- Resolve Leaked Password Protection through the correct Auth configuration surface when access is available.

**Exit:** every Advisor finding is safely remediated or explicitly proven intentional with runtime/security evidence; no unexplained authorization bypass remains.

### P0-C — Authenticated Runtime / Tenant A-B
Prepare and execute Actor A/B login/session journeys, own-data CRUD/persistence, cross-tenant denial, Storage/signed URLs, Realtime and AI/vector isolation, with browser/network/console evidence. Do not invent evidence without credentials.

### P0-D — Vercel / Runtime Deployment
Do not wait on quota. When deployment is possible, bind deployment to final candidate SHA and prove `/`, `/login`, deep routes, authenticated journey, console/network and Supabase connectivity.

### P0-E — Canonical Truth / BI / Export
Golden business corpus; UI = RPC = Export; date/status/as-of/filter semantics; NULL/UNKNOWN/INSUFFICIENT_DATA; forecast/demand/inventory; legacy/compatibility risks. Fix discrepancies rather than merely report them.

### P1-F — OCR / Document Golden Corpus
Execute PDF text, scanned PDF, Arabic/English OCR, DOCX, images and malformed corpus. Record ground truth, actual, diff, score, provenance and regression evidence.

### P1-G — Workers / Queue / Watched Folder
Execute success/failure/retry/lock/idempotency/duplicate/crash/restart/recovery/DLQ and watched-folder detect → parse → validate → import → reconcile → canonical → evidence.

### P1-H — Backup / Restore / DR
Real backup artifact verification and safe-environment restore verification for schema, data, relationships, constraints and application behavior; record RPO/RTO.

### P1-I — Canary / Rollback
Controlled known-good → canary → rollback → verify drill in a safe environment; verify DB/schema/data/auth/core workflow/canonical truth/application health.

### P1-J — Performance / Scale
Read P95 ≤300ms; write P95 ≤800ms; preview ≤1500ms; realistic corpus; query plans/indexes; N+1/unbounded-read attacks; fix and remeasure.

### P1-K — Observability / Operations
DB/Realtime/services/Storage/notifications/security health, representative alert triggers, visibility and recovery, exact-SHA evidence.

### P2-L — UI/UX
Authenticated responsive/RTL/accessibility, loading/empty/error states, deep links, import/documents/evidence/admin/logout.

### P2-M — Business Acceptance
Merchant golden scenarios, independent expected results, decision/evidence/outcome, UI/export equality, and operation without developer intervention.

## SHA / Evidence Rules

1. Branch-local PASS is not `main` PASS.
2. Historical PASS is not current candidate PASS.
3. A migration being present is not proof of runtime behavior.
4. A test file existing is not test PASS.
5. A reachable deployment is not runtime certification.
6. Every final PASS must identify the exact tested SHA.
7. Certification requires all required evidence to converge on ONE release SHA.
8. A Security Advisor warning must be classified by actual exploitability/privilege semantics; do not close it by blanket revoke or by ignoring it.
9. If an index entry names a SHA different from the actual PR head, the PR head is authoritative for PR status; reconcile the index only after direct verification.

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

The project remains in **PROVE → CERTIFY → RELEASE**, not BUILD. The latest cycle adds no fabricated PASS. The real security findings remain an active P0 closure lane, while environmental blockers are explicitly isolated so independent engineering work continues in parallel.