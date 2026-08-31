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

The developer continued PR #294 on the same integration branch and found a structural CI defect in the Final Certification Gate: certification contract scripts were executed before `npm ci`, although new contracts depend on project dependencies.

Executed:
- Changed the Final Certification Gate to run `npm ci` from the lockfile before certification contracts.
- Added `persist-credentials: false` and `contents: read` least-privilege settings.
- Applied the change directly to PR #294 without forced merge.
- Confirmed PR #294 still targets the intended baseline.

Verified:
- Current PR #294 exact HEAD: `688be5ea9636f47d9d205ec3a1fa8193368a86ca`.
- PR #294 remains **OPEN / NOT MERGED**.
- Previous `e0cf21...` CI failures included Final Certification Gate, quality, and file-intelligence-security; desktop-windows was in progress.
- The new HEAD has **not yet produced an Exact-Head GitHub Actions run** at the time of this update.
- Therefore no PASS is promoted to `688be5...` or `main`.

## Current Operational Truth

- Vercel remains independently blocked by `api-deployments-free-per-day` (>100 deployments/24h).
- Combined status currently shows Vercel failure and CodeRabbit pending for `688be5...`; this is not an application certification PASS.
- Authenticated A/B runtime proof remains unavailable without operational credentials/sessions; do not fabricate evidence.
- Backup/restore has no real PASS run yet.
- Production/safe-environment rollback has no real PASS run yet.
- Supabase leaked-password protection remains disabled and requires Auth configuration access.
- New Vitest contracts are **NOT PASS** until actually executed on the candidate SHA.

## Parallel Execution Board

### P0-A — PR #294 exact-head closure
**Immediate.**
- Wait for/trigger real GitHub Actions execution on `688be5...`.
- Run Vitest contracts, typecheck, lint, build, regression, security, quality.
- Investigate any failure rather than reporting it as infrastructure without evidence.
- Review changed migrations/grants and boundary behavior.
- Merge only after all required gates pass on the exact candidate SHA.

**Exit:** one clean merged SHA with all accepted hardening + exact-head CI PASS.

### P0-B — Authenticated Runtime / Tenant A-B
**Parallel; do not wait on CI.**
- Prepare/execute Actor A and B login/session journeys.
- Own-data CRUD, persistence, reload, logout/re-login.
- Cross-tenant direct IDs/RPC/read/write denial.
- Storage/signed URLs, Realtime, AI/vector isolation.
- Browser/network/console evidence.

**Exit:** A own PASS, B own PASS, A→B DENY, B→A DENY, evidence bound to release SHA.

### P0-C — Vercel / Runtime Deployment
**Parallel; never wait if quota-blocked.**
- Prepare fresh deployment for final candidate.
- SHA binding.
- `/`, `/login`, deep routes, authenticated journey.
- Console/network/runtime checks.

**Exit:** exact release candidate deployed and runtime-proven.

### P0-D — Canonical Truth / BI / Export
**Parallel.**
- Golden business corpus.
- UI = RPC = Export.
- Date/status/as-of/filter semantics.
- NULL/UNKNOWN/INSUFFICIENT_DATA.
- Forecast/demand/inventory.
- Legacy/compatibility consumer risks.

**Exit:** no unexplained KPI divergence.

### P1-E — OCR / Document Golden Corpus
- PDF text, scanned PDF, Arabic/English OCR, DOCX, images, malformed files.
- Ground truth comparison.
- Accuracy/confidence/provenance/regression baseline.

**Exit:** deterministic measurable OCR/document PASS.

### P1-F — Workers / Queue / Watched Folder
- Success/failure/retry/lock/idempotency.
- Crash/restart/recovery/DLQ.
- Watched folder: detect → parse → validate → import → reconcile → canonical → evidence.
- Duplicate/malformed/interrupted/reprocess.

**Exit:** recovery behavior demonstrated with evidence.

### P1-G — Backup / Restore / DR
- Real backup artifact.
- Restore in safe environment.
- Schema/data/relationship/application integrity.
- Measure RPO/RTO.

**Exit:** BACKUP PASS + RESTORE PASS.

### P1-H — Canary / Rollback
- Known-good candidate.
- Controlled canary.
- Controlled rollback in safe environment.
- Verify integrity and runtime after rollback.

**Exit:** ROLLBACK PASS.

### P1-I — Performance / Scale
- Read P95 ≤300ms.
- Write P95 ≤800ms.
- Preview ≤1500ms.
- Realistic corpus.
- Query plans/indexes.
- N+1/unbounded-read attacks.

**Exit:** production-representative evidence or justified exception.

### P1-J — Observability / Operations
- DB/Realtime/services/Storage/notifications/security health.
- Trigger representative alerts.
- Verify alert visibility and recovery.
- Bind evidence to exact SHA.

### P2-K — UI/UX
- Authenticated responsive/RTL/accessibility.
- Loading/empty/error states.
- Deep links.
- Import/documents/evidence/admin/logout.

### P2-L — Business Acceptance
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

## Current Owner Decision

The project is in **PROVE → CERTIFY → RELEASE**, not BUILD. Do not rebuild completed subsystems merely to increase a percentage. The remaining work is predominantly integration, execution evidence, runtime proof, resilience, security hardening, and final release convergence.

**Latest owner execution directive:** PR #294 must first obtain real Exact-Head CI evidence on `688be5...`. In parallel, all independent runtime/proof fronts continue. No blocker is allowed to serialize the project, and no historical or branch-local PASS may be promoted to the final release SHA.
