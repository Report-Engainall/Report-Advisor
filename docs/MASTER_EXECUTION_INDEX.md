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

- Current canonical `main` / exact HEAD: **`ac964ae3b2dd3f05a0710489afa25eac4497ad13`**.
- Previous candidate `1fe28c4081c997bb6379e0c9b4fc3df3a2af3f2b` received fresh exact-SHA verification through Final Execution Batch `#32 / Run 33578283657`.
- That run checked **exactly** `1fe28c4081c997bb6379e0c9b4fc3df3a2af3f2b`; release-manifest generation passed and then the deterministic batch exposed the first J-runtime failure plus additional independent contract gaps.
- `0f91336e55b307ebd3e3d707e2a633cc428c8eff` remains historical evidence only: **Phase 10 BACKUP/RESTORE CONTRACT = PASS (source-level)**. It does not transfer to later SHAs.
- Backup/Restore operational truth remains: `RPO = UNPROVEN`, `RTO = UNPROVEN`, `RESTORE = UNPROVEN`, `DR = UNPROVEN`.
- Vercel remains `BLOCKED — External Deployment Rate Limit`; no substitute production/runtime evidence is accepted.
- Merge: **STOPPED**.
- Release: **STOPPED**.
- Certification: **STOPPED / NOT CERTIFIED** until required operational evidence is proven on one exact release SHA.

## Latest Executed Cycle — Fresh Exact-SHA Verification of `1fe28c...` — 2026-09-02

### Evidence / RCA

Final Execution Batch `#32 / Run 33578283657` fetched and checked repository HEAD `1fe28c4081c997bb6379e0c9b4fc3df3a2af3f2b` exactly. The manifest-generation step passed and emitted `sourceSha=1fe28c...`, dependency fingerprint, migration fingerprint, and package version. The deterministic gate then failed on real runtime/contract gaps; no historical result was promoted.

First failure:

`FAIL check-j-runtime-chain.mjs`

`Error: J runtime invariant missing: dead-letter`

Additional failures exposed in the same fresh run included incomplete recovery-contract scripts, missing N→S package gates/evidence paths, missing Phase-F workflow invariant, missing K→S `advanceLifecycle`, release-evidence completeness token drift, performance budget running before a build artifact existed, and folder-batch import contract drift. These remain independently actionable and were not hidden behind the first failure.

### Mutation — J runtime dead-letter closure

`RCA = REAL J-RUNTIME CAPABILITY GAP`

The J runtime checker required a dead-letter boundary, while the canonical runtime files had checkpoint/resume/idempotency semantics but no actual dead-letter representation or runtime test. This was a product/runtime contract gap, not a stale checker assertion.

`MUTATION = MINIMAL RUNTIME IMPLEMENTATION + TEST`

- OLD EXACT HEAD: `1fe28c4081c997bb6379e0c9b4fc3df3a2af3f2b`
- NEW EXACT HEAD: **`ac964ae3b2dd3f05a0710489afa25eac4497ad13`**
- COMMIT MESSAGE: `feat: close J runtime dead-letter contract`
- FILES CHANGED:
  - `src/lib/report-execution/dead-letter.ts`
  - `src/lib/phase-kl-runtime.ts`
  - `scripts/dead-letter-runtime.test.ts`
  - `scripts/check-j-runtime-chain.mjs`
- Implementation: validated immutable dead-letter records, duplicate-safe queue insertion, queue listing, runtime exports, and a deterministic runtime test covering valid enqueue, duplicate rejection, and invalid-attempt rejection.
- The J checker now executes the dead-letter runtime test rather than merely checking for a keyword.
- EXPECTED VALUES: **UNCHANGED**.
- FIXTURES: **UNCHANGED**.
- THRESHOLDS: **UNCHANGED**.
- SECURITY: **UNCHANGED**.
- WORKFLOW TOPOLOGY: **UNCHANGED**.
- BACKUP/RESTORE CERTIFICATION: **UNCHANGED / UNPROVEN operationally**.

### Verification requirement

`ac964ae...` is a **candidate only** until a fresh exact-SHA Actions run proves the mutation and the remaining gates. No PASS from `1fe28c...` is transferred to `ac964ae...`.

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
- Close the current first failing gate using evidence-directed RCA.
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
`R16 — backup / restore / DR`

Real backup artifact verification and safe-environment restore verification for schema, data, relationships, constraints and application behavior; record RPO/RTO and execute the **actual restore drill** before any runtime/certification PASS is claimed.

Current status: **UNPROVEN / BLOCKED on operational access until an actual backup artifact and safe-environment restore drill are executed.**

Required runtime evidence remains:
- `RPO` — measured from an actual restore scenario;
- `RTO` — measured from an actual restore scenario;
- `actual restore drill` — successful safe-environment restoration and application-behavior verification.

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