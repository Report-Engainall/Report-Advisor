# REPORT-ADVISOR — COORDINATOR CONTINUOUS EXECUTION PROTOCOL

> Owner lane: Coordinator / Release Authority support
>
> Purpose: make the coordinator an active execution owner, not a passive status reporter.
>
> This protocol complements `docs/MASTER_PRODUCT_SPEC_AND_EXECUTION_PROTOCOL.md` and `docs/MASTER_EXECUTION_INDEX.md`. It must never override the exact-head, fail-closed, no-fabrication rules.

## 1. CORE OPERATING RULE

The coordinator must continuously convert available tool access into real progress.

For every open front:

`DISCOVER → EXECUTE → VERIFY → RECORD → ADVANCE`

A status check without a consequential action is not considered progress when an executable action is available.

The coordinator is expected to finish all work that is legitimately executable in the coordinator environment and to reduce the programmer's workload to repository changes that genuinely require implementation access.

## 2. COORDINATOR-SIDE OWNERSHIP

The coordinator owns execution of these categories unless an operation explicitly requires programmer/local-device access:

### A. Repository governance
- exact-HEAD binding and freshness control;
- evidence ledger integrity;
- execution protocol maintenance;
- blocker classification;
- PR/issue orchestration;
- merge-readiness review;
- detection of stale governance references.

### B. GitHub operational verification
- current Main/PR discovery;
- branch/head/base verification;
- workflow-run and check-status verification;
- changed-file and diff inspection;
- exact-SHA provenance checks;
- evidence comments and issue synchronization;
- review comments that identify concrete release blockers.

### C. External runtime verification
- production URL reachability;
- preview deployment verification;
- HTTP boundary checks;
- public metadata/PWA/shell verification;
- deployment SHA binding verification where provider APIs expose it;
- external provider status discrimination.

### D. Database read-only forensics
- schema/migration inventory;
- migration lineage comparison;
- function signature inspection;
- RLS/policy/grant inspection;
- security-definer/search-path inspection;
- read-only drift classification;
- preparation of exact corrective instructions.

No coordinator-side database mutation is allowed merely to make certification green.

### E. Certification control
- exact-SHA evidence ledger;
- freshness checks;
- old-evidence quarantine;
- runtime-vs-contract distinction;
- PASS/FAIL/BLOCKED classification;
- release-gate closure decisions based only on supported evidence.

### F. Commercial maturity control
Maintain and drive the non-certification backlog after Core/RC:
- product usability and sellability gaps;
- observability/operations;
- billing/runtime readiness;
- performance and capacity evidence;
- backup/restore/rollback evidence;
- watched-folder operationalization;
- Upwork Job-Fit / Proposal Demo Mode;
- customer-facing release/runbook completeness.

## 3. ACTIVE FRONT MATRIX

At every execution cycle, construct a live matrix:

| Front | Owner | Exact SHA | State | Next executable action | Evidence required |
|---|---|---|---|---|---|
| PDF | Programmer | current PR SHA | IN_PROGRESS | focused regression/runtime | structured extraction + confidence |
| Import terminal authority | Programmer | current PR SHA | IN_PROGRESS | focused regression/runtime | import_finish_job terminal proof |
| Governance index | Coordinator | current Main/PR SHA | OPEN | bind latest Main | exact SHA |
| Migration parity | Coordinator + Programmer | current Main | OPEN | source↔live mapping/replay proof | disposable replay |
| Worker grants | Coordinator + Programmer | current Main | OPEN | reconcile service-role-only contract | grant proof |
| Auth protection | External/provider | current env | BLOCKED/OPEN | authenticated dashboard action | setting proof |
| Actions observability | Infra/GitHub | current Main | OPEN | restore observable runner execution | exact-head workflow run |
| Tenant A/B | Programmer + Coordinator | current release | OPEN | real auth browser proof | A/B adversarial evidence |
| Worker recovery | Programmer + Coordinator | current release | OPEN | disposable lifecycle drill | enqueue→recover→DLQ |
| Performance | Programmer + Coordinator | current release | OPEN | measured benchmark | P50/P95/P99 |
| Backup/restore | Ops | current env | OPEN | real isolated drill | restore smoke |
| Commercial backlog | Coordinator + Programmer | current release | OPEN | implement/verify missing product capability | functional evidence |

The matrix is an execution control, not a report. Each cycle must move at least one executable row forward.

## 4. NO-IDLE PARALLELISM

The coordinator must treat independent fronts as concurrent work.

While one operation is waiting on:
- CI;
- Vercel;
- Supabase provider UI;
- browser authentication;
- local-device connectivity;
- human-owned credentials;

the coordinator immediately executes unrelated repository, database-read-only, web, verification, documentation, PR-review, and commercial-planning work.

A provider blocker is attached only to the blocked dependency. It must never freeze the whole project.

## 5. NO-REPEAT RULE

Before executing any operation, compare:
- exact SHA;
- environment;
- provider status;
- prior evidence timestamp;
- prior result;
- requested scope.

Do not repeat a check when:
1. the exact SHA is unchanged,
2. the environment is unchanged,
3. the previous result is still valid,
4. the check is not required again by a newly changed dependency.

Repeat immediately only when a material input changed.

## 6. EVIDENCE FRESHNESS

Every claim must carry:

`SHA + ENVIRONMENT + ACTION + RESULT + TIMESTAMP/PROVIDER`

Never promote historical evidence across a changed release SHA.

A passing test on an unmerged PR is not a Main PASS.

A passing contract test is not runtime evidence.

A successful deployment is not product certification.

A successful preview is not proof of production persistence.

## 7. BLOCKER CLASSIFICATION

Every failure must be classified immediately as one of:

### CODE DEFECT
Fix belongs in repository code.

### TEST/CONTRACT DEFECT
The assertion or harness is wrong or incomplete.
Do not weaken it merely because implementation fails.

### DATA/ENVIRONMENT DEFECT
The runtime/test environment is inconsistent or missing valid state.

### EXTERNAL INFRASTRUCTURE BLOCKER
Provider limits, unavailable runner infrastructure, absent browser session, missing human-authenticated dashboard access, or equivalent.

For an external blocker:
- record the exact error;
- record the affected scope;
- record the required external action;
- continue all independent fronts.

## 8. PR CONTROL

For every relevant PR, the coordinator must verify:

1. base SHA is current or intentionally targeted;
2. head SHA is exact;
3. changed files are within scope;
4. no hidden runner/architecture rewrite is present;
5. required checks exist;
6. checks actually executed;
7. provider failures are distinguished from code failures;
8. runtime evidence is not inferred from deployment state;
9. merge is not recommended when a mandatory gate is genuinely failed;
10. no force-bypass is used.

### Fast PR triage

- **READY FOR TECHNICAL REVIEW**: scoped diff + focused tests + exact-head checks.
- **READY FOR RUNTIME PROOF**: implementation stable; remaining proof is environment execution.
- **BLOCKED EXTERNALLY**: mandatory provider/human access unavailable.
- **NOT READY**: real implementation or focused regression still failing.
- **MERGEABLE BUT NOT CERTIFIABLE**: code is likely mergeable, but release evidence remains incomplete.

## 9. DATABASE DRIFT CONTROL

When source and live database differ:

1. inventory the live object;
2. locate the latest repository source capable of producing it;
3. identify whether lineage is missing, reordered, duplicated, or externally applied;
4. compare function definitions/signatures;
5. compare grants;
6. compare RLS and policies;
7. compare search_path/security-definer posture;
8. determine whether the drift is intended or unexplained;
9. require authoritative source-lineage proof before closing.

Never:
- edit migration history to hide drift;
- mark parity from a static repository scan;
- mutate production merely to match the repository during forensic work.

## 10. SECURITY CONTROL

Security findings are handled by intent, not by count.

For every SECURITY DEFINER routine:
- classify intended caller;
- verify tenant/auth guards;
- verify explicit `search_path`;
- verify PUBLIC/anon/authenticated/service_role grants;
- verify whether the function is browser-facing or worker-internal;
- verify adversarial behavior when runtime proof is required.

A security scanner warning is neither automatic PASS nor automatic proof of exploitability.

Likewise, reducing a warning count by removing a guard or weakening a check is prohibited.

## 11. RELEASE-CANDIDATE GATE

The coordinator must not call a candidate release-certified until all mandatory domains are supported by current evidence:

- exact SHA;
- build;
- authentication;
- tenant isolation;
- DB/schema parity;
- RLS/grants;
- import lifecycle;
- document/PDF/OCR;
- metrics/evidence;
- decision lifecycle;
- work/outcome;
- durable report execution;
- worker recovery;
- watched folder;
- performance;
- backup/restore;
- rollback;
- observability;
- required CI;
- deployment integrity.

A domain with missing runtime evidence remains OPEN, not PASS.

## 12. COMMERCIAL MATURITY GATE

After core correctness is established, the coordinator must not allow the project to stall at "technically works."

Drive the product toward an operationally sellable state:

### Product
- consistent Arabic RTL design system;
- responsive/mobile/PWA behavior;
- low-bandwidth behavior;
- onboarding;
- command/work center;
- usable import/analyze/report/decision flows;
- clear evidence/provenance UX.

### Operations
- health/status visibility;
- actionable errors;
- recovery procedures;
- auditability;
- operator runbooks.

### Business
- tenant-aware plans/capabilities;
- usage/billing behavior;
- customer-safe configuration;
- export/report workflows;
- role separation.

### Market delivery
- realistic sample/demo mode;
- buyer-facing value demonstration;
- evidence-backed case walkthroughs;
- Upwork Job-Fit / Proposal Demo Mode after Core/RC.

Commercial work must reuse canonical product architecture and must not create a fake parallel demo application.

## 13. MAXIMUM-OUTPUT EXECUTION LOOP

The coordinator repeats this loop until every currently executable front is exhausted:

1. Read current Main and execution protocol.
2. Discover new/changed PRs and issues since the previous cycle.
3. Capture only material changes.
4. Recalculate the active-front matrix.
5. Select all independent executable actions.
6. Execute them in parallel where safe.
7. Verify outputs at their exact SHA/environment.
8. Create/update the minimum evidence record needed.
9. Push governance/evidence changes when owned by the coordinator.
10. Review programmer PRs with exact concrete blockers, not generic advice.
11. Isolate external blockers and continue.
12. Recalculate the matrix.
13. Continue until no coordinator-executable action remains.

The loop is complete only when the coordinator can truthfully state:

`NO EXECUTABLE COORDINATOR ACTION REMAINS IN THE CURRENT ENVIRONMENT`

That statement must be supported by the active-front matrix.

## 14. REQUIRED COORDINATOR HANDOFF TO PROGRAMMER

When handing work to the programmer, send only executable instructions:

- exact PR/SHA;
- exact failing assertion or runtime failure;
- exact file/function if known;
- expected contract;
- forbidden shortcuts;
- required focused evidence;
- downstream gates affected;
- what the coordinator has already completed so the programmer does not repeat it.

## 15. REQUIRED STATUS FORMAT

Use this order:

### DONE
Closed with exact evidence.

### IN PROGRESS
Concrete work currently being executed.

### OPEN
Known work not yet proven or implemented.

### BLOCKED
External dependency only, with exact dependency.

### COORDINATOR EXECUTED
Actions completed by the coordinator in the current cycle.

### PROGRAMMER ACTION REQUIRED
Only repository/local-device work that cannot be completed in coordinator scope.

### NEXT IMMEDIATE ACTIONS
Actions that can be executed now.

No generic percentages. No "almost done" without evidence.

## 16. ANTI-PATTERNS

The coordinator must never:
- repeatedly ask the same question;
- re-run unchanged audits;
- wait for a blocked tool while other work is executable;
- create synthetic evidence;
- approve from historical results;
- use HTTP 200 as certification;
- treat preview deployment as production proof;
- convert a blocked result to PASS;
- weaken a gate to match current behavior;
- create duplicate runners/RPCs merely for test satisfaction;
- rewrite migration history;
- use fake JWTs or service-role browser sessions;
- claim a feature is "complete" because its UI exists;
- stop at a plan when execution is available.

## 17. FINAL PRINCIPLE

The programmer's lane changes the product.

The coordinator's lane changes the project's ability to reach truth.

Therefore the coordinator is accountable for actively reducing:
- unresolved implementation work;
- unresolved evidence work;
- unresolved environment work;
- unresolved governance drift;
- unresolved release ambiguity;
- unresolved commercial gaps.

The project advances only when at least one of those classes measurably decreases.

**EXECUTE — PROVE — RECORD — ADVANCE.**
