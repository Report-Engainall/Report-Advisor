# Report Advisor — Master Execution & Truth Index

## OWNER CONTROL ADDENDUM — 2026-09-01

This addendum is authoritative for execution priority. Historical records remain historical; no old PASS is promoted to the current release candidate.

### Reconciled owner/developer assessment

The latest developer assessment supplied by the owner estimated overall completion at approximately **88%**, with the product already at an advanced Release Candidate stage. It identified the principal remaining work as operational/runtime proof rather than rebuilding the core product. fileciteturn22file0L5-L8

The assessment reported these planning estimates: Foundation/DB/Security/RLS/RBAC 100%; Core Product 95%; Import/Reconciliation/Canonical Truth 95%; Decision/Evidence/Outcome 93%; Runtime/Workers/Queue 85%; Document/OCR 82%; Watched Folder/Backup/Restore/Rollback 75%; Authenticated Runtime/Tenant A/B 65%; UI E2E/Regression 80%; Performance/Scalability 90%; Observability/Governance/CI 90%; Release/Quality Gates 100%. These are planning estimates, not certification evidence. fileciteturn22file0L52-L68

Independent reconciliation confirms the main conclusion: **do not rebuild the stack or core engines merely to increase a percentage. Finish integration, runtime proof, resilience, and certification.**

### Current release truth

- Current observed `main`: `a3c4e22b410482fdd2ddf73eb125cf9f51586a96`.
- Production Certified: **NO**.
- Sellable: **NOT YET CERTIFIED**.
- Current objective: converge all required proof onto one exact release SHA.

### Important reconciliation findings

1. **Authenticated runtime remains the largest release blocker.** The developer assessment explicitly states that authenticated production behavior, persistence, re-login, and tenant A/B isolation are not yet proven live. fileciteturn22file0L420-L465
2. **Backup/restore and rollback remain runtime evidence gaps.** The required restore validation, integrity checks, RPO/RTO measurement, and controlled rollback evidence are still required. fileciteturn22file0L569-L630
3. **OCR is technically present but needs a deterministic Golden Corpus and measurable accuracy/regression evidence.** fileciteturn22file0L636-L668
4. **Workers/queue/watched-folder require execution/recovery evidence**, not another implementation report. fileciteturn22file0L672-L724
5. **Windows/Electron was reported as PASS on its tested release candidate**, but that evidence must remain SHA-bound. It cannot be silently transferred to a later `main` SHA unless the Electron change and native evidence are both bound to that same candidate. fileciteturn22file0L314-L346
6. **CI/Quality was reported as successful**, but this does not replace live runtime evidence. fileciteturn22file0L352-L374
7. **The previous Vercel `/login` routing defect has a repository-level SPA fallback fix**, but the current exact release still requires a fresh deployment and direct-route runtime verification.
8. Recent hardening PRs (#289–#293) must be treated as current engineering work until their accepted changes are integrated and exact-head verified. Do not report their branch-local PASS as `main` PASS.
9. PR #291 requires correction of its confidence/NaN semantics before merge; PR #292 requires a null/non-string tenant-ID guard before `.trim()`; PR #293 requires final review and exact-head proof. These are concrete release-closure items, not requests for another broad project scan.

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

The developer's **~88%** estimate is retained as the latest planning assessment, not replaced by an artificially lower percentage. The owner's independent gate is stricter: the product is an advanced Release Candidate, but **not certified for sale until live operational proof and the remaining exact-SHA gates are closed**. fileciteturn22file0L927-L952

The project has therefore moved from **BUILD** to **PROVE → CERTIFY → RELEASE**. fileciteturn22file0L917-L923
