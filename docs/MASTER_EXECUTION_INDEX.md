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

- Current canonical `main` / exact HEAD: `70dbef5156c2e51d01acf7b261fb0f35717b796d` at the start of this Quality cycle; this cycle's first failing gate is recorded below.
- Quality #3421 / Run `33577939879`: **FAIL** on exact HEAD `70dbef5156c2e51d01acf7b261fb0f35717b796d`.
- First failing gate on #3421: `Phase 10 backup/restore contract`.
- RCA: **EXECUTION-INDEX CONTRACT DRIFT** — the checker requires the persisted recovery boundary tokens `r16 — backup / restore / dr`, `rpo`, `rto`, and `actual restore drill`, but the index at `70dbef...` had the Phase 10 board entry without the required R16 register wording.
- No product/runtime/security contract was weakened. No expected values, fixtures, thresholds, or certification criteria were changed.
- `quality.yml`: canonical comprehensive quality/release gate.
- Merge: only after applicable exact-head gates pass.
- Release: only after production evidence is complete.
- Certification: **NOT CERTIFIED** until every required certification condition is actually proven.

## Latest Executed Cycle — Quality #3421 / Phase 10 Contract Failure — 2026-09-02

### Exact-head evidence

Quality `#3421 / Run 33577939879` checked repository HEAD exactly as fetched by Actions: `70dbef5156c2e51d01acf7b261fb0f35717b796d`.

The run was not promoted to PASS. All earlier gates in the job passed, including CI topology, public RPC hardening, auth/tenant convergence, migration audits, golden E2E corpus, production evidence integrity, release evidence workflow, operational resilience, tenant RLS, import tenant context/business key, lint, build, performance budget, scale, and intelligence gates. The first actual failure was the Phase 10 backup/restore contract.

Failure:

`Error: Remaining-work register lost recovery boundary: r16 — backup / restore / dr`

### RCA

`RCA = EXECUTION-INDEX CONTRACT DRIFT`

The Phase 10 checker is intentionally source-level and fail-closed. Its migration/security invariants and certification evidence-key bindings were present, but its remaining-work register assertion could not find the canonical R16 recovery-boundary phrase in `docs/MASTER_EXECUTION_INDEX.md`.

This was a documentation/index contract mismatch, not evidence that backup/restore had been executed. Runtime restore/RPO/RTO remain unproven until actual drills are performed.

### Mutation

`MUTATION = MINIMAL EXECUTION-INDEX RECONCILIATION`

- OLD EXACT HEAD: `70dbef5156c2e51d01acf7b261fb0f35717b796d`
- NEW EXACT HEAD: **created by this index-only correction**
- COMMIT MESSAGE: `docs: restore Phase 10 recovery boundary in execution index`
- FILES CHANGED: `docs/MASTER_EXECUTION_INDEX.md` only.
- CHANGE: restored explicit `R16 — backup / restore / DR` recovery-boundary wording and made the exact RPO/RTO/actual-restore-drill state explicit.
- EXPECTED VALUES: **UNCHANGED**.
- FIXTURES: **UNCHANGED**.
- THRESHOLDS: **UNCHANGED**.
- SECURITY: **UNCHANGED**.
- WORKFLOW TOPOLOGY: **UNCHANGED**.
- RELEASE/CERTIFICATION CRITERIA: **UNCHANGED**.

### Verification rule

The mutation must be verified by a fresh Quality run on the resulting exact SHA. The historical failure on `70dbef...` remains historical and is not promoted.

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
