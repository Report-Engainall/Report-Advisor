# Report Advisor — Master Execution & Truth Index

## OWNER CONTROL ADDENDUM — 2026-09-01

This addendum is authoritative for execution priority. Historical records remain historical; no old PASS is promoted to the current release candidate.

### Reconciled owner/developer assessment

The latest developer assessment supplied by the owner estimated overall completion at approximately **88%**, with the product already at an advanced Release Candidate stage. It identified the principal remaining work as operational/runtime proof rather than rebuilding the core product.

The assessment reported these planning estimates: Foundation/DB/Security/RLS/RBAC 100%; Core Product 95%; Import/Reconciliation/Canonical Truth 95%; Decision/Evidence/Outcome 93%; Runtime/Workers/Queue 85%; Document/OCR 82%; Watched Folder/Backup/Restore/Rollback 75%; Authenticated Runtime/Tenant A/B 65%; UI E2E/Regression 80%; Performance/Scalability 90%; Observability/Governance/CI 90%; Release/Quality Gates 100%. These are planning estimates, not certification evidence.

Independent reconciliation confirms the main conclusion: **do not rebuild the stack or core engines merely to increase a percentage. Finish integration, runtime proof, resilience, and certification.**

### Current release truth

- Current observed release baseline: `4705028d1e19ea7201f4cb9945ce3e1cc1a550a2`.
- Production Certified: **NO**.
- Sellable: **NOT YET CERTIFIED**.
- Current objective: converge all required proof onto one exact release SHA.

### Important reconciliation findings

1. **Authenticated runtime remains the largest release blocker.** Authenticated production behavior, persistence, re-login, and tenant A/B isolation are not yet proven live.
2. **Backup/restore and rollback remain runtime evidence gaps.** The required restore validation, integrity checks, RPO/RTO measurement, and controlled rollback evidence are still required.
3. **OCR is technically present but needs a deterministic Golden Corpus and measurable accuracy/regression evidence.**
4. **Workers/queue/watched-folder require execution/recovery evidence**, not another implementation report.
5. **Windows/Electron PASS remains SHA-bound.** It cannot be silently transferred to a later release SHA.
6. **CI/Quality success does not replace live runtime evidence.**
7. **The previous Vercel `/login` routing defect has a repository-level SPA fallback fix**, but the current exact release still requires fresh deployment and direct-route runtime verification.
8. Recent hardening PRs (#289–#293) are current engineering work until accepted changes are integrated and exact-head verified.
9. PR #291 required correction of confidence/NaN semantics before merge; PR #292 required null/non-string tenant-ID handling before `.trim()`; PR #293 required final review and exact-head proof.

## EXECUTION UPDATE — 2026-09-01

### Integrated hardening candidate

A new integration branch/PR was created from the current release baseline to avoid attempting to merge stale, diverged PR branches directly:

- Branch: `codex/p0-hardening-integration-20260901`
- PR: **#294**
- Integration candidate HEAD at this update: `e2d7f57e4a4eab3327b54d762427a46e4d3a3264`
- PR #294 remains **OPEN / NOT MERGED** pending exact-head verification; no branch-local PASS is promoted to `main`.

The integration contains justified portions of #289–#293 and intentionally excludes stale historical/package-only changes that do not advance the current release.

### Concrete fixes executed

- Metric confidence is now fail-closed for `NaN`, `Infinity`, `-Infinity`, negative values, values above `1`, and missing/undefined confidence. Valid boundaries `0` and `1` remain explicit. Missing/invalid source-row evidence is also fail-closed.
- AI tenant scope validates type and non-blank content before `.trim()`, including requested and authenticated tenant IDs; mismatch is denied.
- Canonical intelligence sanitizes non-finite/negative numeric inputs, history, inventory demand, and caller-supplied payment/receivable amounts.
- Report facts normalize non-finite confidence to zero and attach evidence from the authoritative ledger.
- New executable Vitest boundary contracts were added for these protections.
- New CI boundary workflows use least privilege and `npm ci` before executing the real Vitest contracts.
- Release evidence classification and executable contract batch tooling from #289 were integrated without its stale index/package mutations.

### Production database hardening executed

Applied and verified migration:

`20260901000000_lock_finalize_runtime_decision_to_authenticated.sql`

It revokes PUBLIC execution of `public.finalize_runtime_decision(uuid)` and grants execution only to `authenticated`.

Direct privilege verification:

- `anon` EXECUTE: **FALSE**
- `authenticated` EXECUTE: **TRUE**

The Supabase security advisor may retain a cached warning; direct privilege inspection is the authoritative verification for this grant boundary.

### Current operational evidence state

- Supabase currently has **2 companies / tenant memberships**, but no live tenant-isolation canary run has been recorded yet.
- `backup_verification_runs`: **0** records / **0 PASS**.
- `production_rollback_drills`: **0** records / **0 PASS**.
- `autonomy_rollback_drills`: **0** records / **0 PASS**.
- Existing Production public deployment is reachable, but the new integration candidate has not received a fresh Vercel deployment because the Vercel project hit the free deployment quota (`api-deployments-free-per-day`, more than 100 deployments in 24h).

### New security observation

Supabase security advisory inspection identified multiple intentionally authenticated `SECURITY DEFINER` RPCs that already enforce tenant/user context. The one exposed to `anon`, `finalize_runtime_decision`, was corrected at the database grant layer and verified directly. Leaked-password protection remains disabled and requires Auth configuration access; this is an operational security hardening item, not a reason to fabricate evidence.

### Parallel execution rule remains active

Do not stop because Vercel, Auth, Backup, or another external surface is blocked. Continue independent fronts: canonical truth, OCR/document corpus, workers/queue, deterministic boundary tests, performance, observability, and business acceptance preparation.

## PARALLEL EXECUTION BOARD

### P0-A — Hardening / PR integration
**Run immediately.**

- Resolve #289/#290 review state.
- Correct #291 fail-closed confidence semantics; invalid/NaN confidence must not become trusted `1`.
- Correct #292 tenant-ID type/null handling before string operations.
- Finish review of #293 and incorporate only justified fixes.
- Batch related fixes; run targeted tests, adversarial edge cases, then exact-head CI.
- Merge only evidence-backed changes.

**Exit:** one clean candidate SHA containing all accepted hardening changes + exact-head CI PASS.

### P0-B — Authenticated runtime + Tenant A/B
**Run concurrently with P0-A.**

- Real Actor A login/session.
- Real Actor B login/session.
- Own-data workflow and persistence for each.
- Cross-tenant reads/writes/IDs/RPC parameters denied.
- Cached state, Realtime, Storage/signed URLs, and AI/vector namespace isolation.
- Capture browser/network/console/application evidence bound to SHA.

**Exit:** A own=PASS, B own=PASS, A→B=DENY, B→A=DENY, evidence bound to exact release SHA.

### P0-C — Vercel / exact deployment
**Run concurrently; if quota blocks, do not wait.**

- Deploy current candidate.
- Prove deployment SHA binding.
- `/`, `/login`, and representative deep routes.
- Authenticated journey.
- Console/network/runtime clean.

**Exit:** exact candidate has a reachable, verified deployment.

### P0-D — Canonical Truth / BI / Export
**Run concurrently.**

- Golden business corpus.
- UI vs RPC vs export equality.
- Dates/status/as-of/filter semantics.
- NULL/UNKNOWN/INSUFFICIENT_DATA.
- Forecast/demand/inventory intelligence evidence.
- Compatibility consumer graph and legacy-risk classification.

**Exit:** no unexplained KPI divergence.

### P1-E — OCR / Document Golden Corpus

- PDF text, scanned PDF, Arabic/English OCR, DOCX, images, malformed files.
- Ground truth and deterministic comparison.
- Accuracy, confidence, provenance and regression baseline.

**Exit:** measurable, repeatable OCR/document PASS.

### P1-F — Workers / Queue / Watched Folder

- Execute success/failure/retry/lock/idempotency.
- Crash/restart/recovery/DLQ.
- Watched-folder detection through import → reconciliation → evidence.
- Duplicate/malformed/interrupted/retry/reprocess scenarios.

**Exit:** failure and recovery behavior demonstrated.

### P1-G — Backup / Restore / DR

- Verify artifact.
- Safe restore.
- Schema/data/relationship/application integrity.
- Measure RPO/RTO.

**Exit:** BACKUP=PASS + RESTORE=PASS.

### P1-H — Canary / Rollback

- Known-good candidate.
- Controlled canary.
- Controlled rollback in safe environment.
- Post-rollback integrity/runtime verification.

**Exit:** ROLLBACK=PASS.

### P1-I — Performance / Scale

- Validate accepted targets: read P95 ≤300ms, write P95 ≤800ms, preview ≤1500ms.
- Realistic corpus load.
- Query plans/indexes.
- N+1 and unbounded-read attacks.

**Exit:** production-representative evidence or documented justified exception.

### P1-J — Observability / Operations

- Health signals for DB/Realtime/services/Storage/notifications/security.
- Trigger representative alerts.
- Verify alert visibility/recovery.
- Tie operational evidence to exact SHA.

### P2-K — UI/UX final sweep

- Authenticated responsive/RTL/accessibility.
- Empty/loading/error states.
- Core navigation/deep links.
- Import/documents/evidence/admin/logout.

### P2-L — Business acceptance / sellability

- Merchant-level golden scenarios.
- Independent expected results.
- Decision/evidence/outcome flow.
- UI/export equality.
- Product usable without developer intervention.

## DO NOT WASTE EXECUTION TIME ON

- Rebuilding React/Vite/Supabase architecture without a concrete defect.
- Rebuilding Import V2.
- Reopening Canonical Truth wholesale.
- Re-running historical test suites solely to produce another report.
- Repeating repository discovery already covered by this index.
- Waiting for one blocked platform task while independent fronts are executable.
- Creating evidence-only branches that do not advance implementation or verification.
- Mutating production aliases or destructive database state without a release-specific reason.

## PROGRAMMER OPERATING PROTOCOL

The programmer must treat this index as the standing baseline. Each new execution cycle starts from the listed open fronts, not from a fresh project explanation.

Required behavior:

1. Select all executable independent fronts immediately.
2. Inspect only the minimum source/logs needed for the selected action.
3. Batch related defects.
4. Implement.
5. Test targeted behavior.
6. Attack bypass/edge cases.
7. Run required regression gates.
8. Bind evidence to exact SHA.
9. Merge when justified.
10. Immediately continue to the next independent front.

Required short update only:

```text
EXECUTED:
- concrete implementation

VERIFIED:
- tests/evidence actually executed

SHA:
- exact SHA

BLOCKED:
- real external blocker only

NEXT PARALLEL:
- next executable fronts from this index
```

No repeated status essay is required unless a new defect, blocker, or certification decision exists.

## FINAL CERTIFICATION DEFINITION OF DONE

```text
ONE EXACT RELEASE SHA
+ Build/Typecheck/Lint PASS
+ Quality/Architecture PASS
+ Security PASS
+ DB/Migration parity PASS
+ Canonical Truth PASS
+ Authenticated E2E PASS
+ Tenant A/B PASS
+ Storage/Realtime/AI isolation PASS
+ Exact Vercel deployment/runtime PASS
+ OCR/Document Golden Corpus PASS
+ Worker/Queue/Recovery PASS
+ Backup/Restore PASS
+ Rollback PASS
+ Performance/Scale PASS
+ Observability PASS
+ Critical UX PASS
+ Independent Business Acceptance PASS
+ Complete Evidence Pack
= PRODUCTION CERTIFIED / SELLABLE
```

## OWNER DECISION

The developer's **~88%** estimate is retained as the latest planning assessment, not replaced by an artificially lower percentage. The owner's independent gate is stricter: the product is an advanced Release Candidate, but **not certified for sale until live operational proof and the remaining exact-SHA gates are closed**.

The project has therefore moved from **BUILD** to **PROVE → CERTIFY → RELEASE**.
