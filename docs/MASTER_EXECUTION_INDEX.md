# Report Advisor — Master Execution & Truth Index

## OWNER-LEVEL RELEASE CLOSURE — 2026-09-01

This file is the authoritative execution index. Historical PASS remains historical. No PASS may move between branches/SHAs without exact-head evidence.

## Current Truth

- Planning estimate from latest developer assessment: **~88%** overall.
- Independent release-readiness judgment: advanced Release Candidate; **NOT Production Certified / NOT Sellable yet**.
- Current `main` baseline before the new integration work: `a3c4e22b410482fdd2ddf73eb125cf9f51586a96`.
- Owner integration PR: **#294**, OPEN / NOT MERGED.
- PR #294 head: `e0cf21cad8296d3a98cd2107c349b5a97c8bac22`.
- PR #294 base SHA: `4705028d1e19ea7201f4cb9945ce3e1cc1a550a2`.
- Do not call `e0cf21c...` `main` PASS until PR #294 is merged and exact-head CI passes.

## Latest Executed Cycle — Developer Evidence

The developer reports that PR #289–#293 hardening was consolidated into PR #294 rather than merging stale/diverged branches directly.

Executed:
- Confidence guards: NaN / Infinity / -Infinity / negative / >1 / missing are fail-closed; 0/1 boundaries covered.
- Tenant ID guards: null / undefined / non-string / empty / whitespace / mismatch handled before trim.
- Canonical financial inputs sanitized against invalid/non-finite/negative values.
- Report-fact confidence/evidence strengthened and ledger evidence made authoritative.
- Executable Vitest boundary contracts added.
- Least-privilege CI workflows added for those contracts.
- Evidence classification tooling integrated without stale historical/package mutations.
- Production DB grant hardened so `anon` cannot execute `finalize_runtime_decision`; `authenticated` can.

Verified/reported:
- `anon EXECUTE = FALSE`; `authenticated EXECUTE = TRUE` for `finalize_runtime_decision`.
- Direct scan of executable public SECURITY DEFINER RPCs exposed to `anon`: 0 results.
- Supabase currently reports 2 tenants/companies.
- Backup verification records: 0 PASS.
- Production rollback drills: 0 PASS.
- Autonomy rollback drills: 0 PASS.
- Current public Production is reachable, but is not a fresh deployment of the current integration candidate.
- New Vitest contracts are **NOT PASS** yet because no real GitHub execution result has been produced.

## Active Blockers

1. **Vercel quota:** new deployment currently blocked by `api-deployments-free-per-day` (>100 deployments/24h). Do not wait on it; continue independent fronts.
2. **Authenticated A/B:** no operational credentials/sessions available for honest LIVE authenticated E2E evidence. Do not fabricate.
3. **Backup/Restore:** no real backup/restore verification runs yet.
4. **Rollback:** no real production/safe-environment rollback drill evidence yet.
5. **Supabase leaked-password protection:** disabled; requires Auth configuration access.
6. **PR #294:** open and unverified; no merge until exact-head CI.

## Parallel Execution Board

### P0-A — PR #294 exact-head closure
**Immediate.**
- Run real Vitest contracts.
- Run typecheck/lint/build/regression/security/quality gates.
- Review changed migrations and grants.
- Attack confidence, tenant-ID, financial-number, evidence, and permission boundaries.
- Verify exact candidate SHA.
- Merge only when evidence-backed.

**Exit:** one clean merged SHA with all accepted hardening + exact-head CI PASS.

### P0-B — Authenticated Runtime / Tenant A-B
**Parallel.**
- Actor A and B real login/session.
- Own-data CRUD/persistence/re-login.
- Cross-tenant IDs/RPC/read/write denial.
- Storage/signed URLs, Realtime, AI/vector isolation.
- Browser/network/console evidence.

**Exit:** A own PASS, B own PASS, A→B DENY, B→A DENY, evidence bound to release SHA.

### P0-C — Vercel / Runtime Deployment
**Parallel; never wait if quota-blocked.**
- Fresh deployment of final candidate.
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
