# Report Advisor — Master Execution & Truth Index

## PERMANENT OWNER-LEVEL EXECUTION AUTHORITY — 2026-09-02

This file is the authoritative execution index and operational handoff for Report-Advisor. It is intended to be read first by the project owner, programmer/agent, and any future execution agent before taking action.

### Permanent delegated authority

The project owner has granted the programmer/agent and the assisting execution agent full and comprehensive project-level execution authority for the work required to complete, verify, harden, certify, merge, release, and maintain Report-Advisor.

This authorization includes, when technically available and justified:

- repository inspection and modification;
- source, tests, migrations, RPCs, configuration, workflows, documentation, and release-evidence changes;
- creation, modification, deletion, and reconciliation of project files;
- CI/CD execution and workflow repair;
- security hardening and remediation;
- database/schema/RPC work and migration reconciliation;
- runtime, deployment, Windows/Desktop, browser/E2E, storage, realtime, AI/vector, backup/restore, rollback, observability, performance, and UX verification;
- creation and maintenance of evidence artifacts and the Master Execution Index;
- branch/PR operations, merge decisions, and release preparation when all applicable evidence supports them;
- autonomous continuation across independent work fronts without waiting for per-step owner confirmation.

This is standing project execution authority. Do not stop merely because a new mutation is encountered or because a new blocker appears. Perform the required RCA, choose the safest evidence-supported action, execute it, verify it on the exact resulting SHA, document it, and continue.

### Authority boundaries

Full authorization does NOT authorize false evidence. The following remain permanently prohibited:

- fake PASS or unsupported PASS;
- suppressing, skipping, weakening, or bypassing a failing gate merely to obtain GREEN;
- changing expected values, fixtures, thresholds, security boundaries, or certification criteria solely to make a test pass;
- deleting or disabling a real security or release control without evidence-supported architectural justification;
- claiming runtime, production, database, backup, rollback, or certification evidence that was not actually executed;
- silently replacing historical truth with a newer interpretation;
- treating an unproven condition as proven.

When evidence is unavailable, record `UNPROVEN` rather than guessing. When a checker is stale, prove checker drift and align the checker/contract with the canonical architecture rather than corrupting the product to satisfy a stale assertion.

## OWNER-LEVEL OPERATING MANDATE

The programmer/agent is authorized and expected to operate as the project execution owner. The assisting execution agent is authorized to act as principal engineer, forensic auditor, release manager, security reviewer, database/RPC architect, and evidence auditor as appropriate.

The owner does not need to re-authorize each normal implementation, correction, test, documentation update, merge, or release-preparation action. Continue autonomously until the project reaches the final Definition of Done or a genuinely external capability/credential limitation prevents further execution.

Permanent execution loop:

`OPEN INDEX → READ CURRENT TRUTH → FULL/FOCUSED RESCAN → SELECT ALL INDEPENDENT FRONTS → RCA → IMPLEMENT → TEST IMPLEMENTATION → TEST THE TEST → ADVERSARIAL/EDGE-CASE TEST → REQUIRED REGRESSION → VERIFY ACTUAL RESULT → EXACT SHA → UPDATE EVIDENCE → MERGE IF JUSTIFIED → CONTINUE`

If one front is blocked, continue all independent fronts.

## Current Truth — 2026-09-02

- Current canonical `main` / exact HEAD: `fc49518f0d3b57bc02c496d436ad80df94fdce7f`.
- Quality #3417 / Run `33576701966`: **FAIL** on the exact HEAD.
- First failing gate: `CI topology and canonical release wiring`.
- Current RCA: **CHECKER DRIFT / ORCHESTRATION ISSUE**.
- `quality.yml`: canonical comprehensive quality/release gate.
- `final-execution-batch.yml`: auxiliary deterministic verification; `push main` is intentional by its current design.
- `storage-tenant-isolation.yml`: auxiliary security regression verification; `push main` is intentional by its current design.
- Branch Protection: **UNPROVEN** because the available GitHub API access returns `403 Resource not accessible by integration`.
- Required Checks: **UNPROVEN**; do not infer them.
- Rulesets: no visible Rulesets through the available API (`[]`).
- CASE 1 (quality.yml must be the sole canonical main-push workflow): **NOT PROVEN**.
- CASE 2 (auxiliary main-push workflows are intentionally allowed/canonical): **STRONGLY SUPPORTED / NOT FULLY PROVEN**.
- Mutation for the CI-topology blocker: authorized in principle by the permanent owner mandate, but must still be evidence-directed and minimal.
- J / Phase F / Recovery: keep independently classified and do not fabricate product gaps.
- Merge: only after applicable exact-head gates pass.
- Release: only after production evidence is complete.
- Certification: **NOT CERTIFIED** until every required certification condition is actually proven.

## Latest Executed Cycle — CI Topology Evidence — 2026-09-02

Read-only evidence confirmed that the current topology contains one canonical comprehensive release/quality gate plus auxiliary main-push verification workflows. No authoritative GitHub Required Checks/Branch Protection evidence was available because the protection endpoint returned 403. Repository rulesets were visible as an empty list. No repository document or manifest explicitly established a policy requiring `quality.yml` to be the only workflow allowed to target `main`.

Conclusion:

`CHECKER DRIFT / ORCHESTRATION ISSUE`

Do not convert `UNPROVEN` Required Checks into a claim. The next action is an evidence-directed RCA and, if justified, the smallest safe contract/checker alignment. Do not delete or weaken auxiliary verification merely to silence the checker.

## Historical Integrity

Historical PASS/FAIL records remain historical. No result may be moved between branches, commits, or SHAs without exact-head evidence. New cycles must append/reconcile current truth rather than erase history.

## Security Interpretation Rule

A `SECURITY DEFINER` function being executable by `authenticated` is not by itself proof of a vulnerability. It becomes a release blocker when its effective privileges or implementation allow an authenticated caller to bypass intended tenant/user authorization, RLS boundaries, or least-privilege requirements. Each flagged function must therefore be classified individually before any revoke.

Required classification:

`FUNCTION → CALLERS → SECURITY DEFINER → search_path → EXECUTE grants → tenant/user guards → underlying tables/RLS → intended runtime caller → exploit test → decision`

Allowed decisions:
- `RETAIN + JUSTIFY + TEST`
- `HARDEN + TEST`
- `REVOKE + TEST`

No blanket revoke is permitted without this analysis.

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
10. Every mutation must record OLD SHA → NEW SHA, RCA, justification, files changed, tests, and exact-head evidence.
11. `UNPROVEN` is a valid state and must never be silently promoted to PASS.
12. Full owner authorization permits implementation, but evidence rules remain mandatory.

## Parallel Execution Board

### P0-A — Exact-head Quality / CI closure
- Close `CI topology and canonical release wiring` using the permanent owner authorization and evidence-directed RCA.
- Run Quality again on the resulting exact SHA.
- Verify the workflow run itself checked the same SHA.
- Continue through every newly exposed blocker.

### P0-B — Security Advisor remediation
- Enumerate every flagged `SECURITY DEFINER` function.
- Trace callers and effective privileges.
- Verify tenant/user guards, `search_path`, underlying RLS, and intended runtime use.
- Build exploit/negative tests for unauthorized access.
- Retain intentional functions with documented justification and proof.
- Harden or revoke only where analysis demonstrates excessive privilege.
- Re-run Security Advisor and targeted regression after changes.

### P0-C — Authenticated Runtime / Tenant A-B
Execute Actor A/B login/session journeys, own-data CRUD/persistence, cross-tenant denial, Storage/signed URLs, Realtime and AI/vector isolation, with browser/network/console evidence. Do not invent evidence without credentials.

### P0-D — Vercel / Runtime Deployment
When deployment is possible, bind deployment to the final candidate SHA and prove `/`, `/login`, deep routes, authenticated journey, console/network and Supabase connectivity.

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

## No-Waste Operating Protocol

The programmer/agent must not restart with a broad repository tour or repeat old reports.

For every cycle:

`OPEN INDEX → SELECT ALL INDEPENDENT FRONTS → INSPECT MINIMUM NEEDED → IMPLEMENT → TARGETED TEST → ADVERSARIAL TEST → REQUIRED REGRESSION → EXACT SHA → MERGE IF JUSTIFIED → IMMEDIATELY CONTINUE`

If a front is blocked by an external capability, document the blocker and continue independent fronts.

Required execution report:

```text
EXECUTED:
- concrete implementation

VERIFIED:
- actually executed tests/evidence

SHA:
- exact SHA

RCA:
- root cause

MUTATION:
- files + concise change summary

BLOCKED:
- real blocker only

NEXT PARALLEL:
- next executable fronts
```

## Mutation / Evidence Record Requirement

For every mutation, record:

```text
OLD EXACT HEAD:
NEW EXACT HEAD:
COMMIT SHA:
COMMIT MESSAGE:
RCA:
MUTATION JUSTIFICATION:
FILES CHANGED:
EXPECTED VALUES:
FIXTURES:
THRESHOLDS:
SECURITY:
WORKFLOW TOPOLOGY:
VERIFICATION RUNS:
EXACT-HEAD PROOF:
MASTER INDEX UPDATED:
```

Preserve historical entries. Never rewrite history to make the current state appear cleaner.

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

The project remains in **PROVE → CERTIFY → RELEASE**, not BUILD. The permanent owner-level delegation is active. The programmer/agent and assisting execution agent are authorized to execute the project autonomously and comprehensively, including mutations and merge/release preparation when justified by evidence.

The standing rule is:

**Full authorization to execute does not mean authorization to fabricate evidence.**

The governing principle is:

**Evidence → RCA → Execute → Verify → Exact-Head Evidence → Document → Continue → Certify**
