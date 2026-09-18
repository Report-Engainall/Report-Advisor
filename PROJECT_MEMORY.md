# REPORT-ADVISOR — PROJECT LIVING MEMORY
## Operational Source of Truth v2.0

## 0. Autonomous Control Signals

The project has two reserved operator signals:

- 1 = PROGRAMMER EXECUTION
- 2 = AI ENGINEERING LEAD EXECUTION

The canonical rules are maintained in:
docs/AUTONOMOUS_CONTROL_SIGNAL_PROTOCOL.md

### Shared runtime state

Maintain these fields as live operational state when material:

- CONTROL_SIGNAL
- RUN_STATE
- EXACT_HEAD
- BASE_MAIN
- ACTIVE_PR
- CURRENT_FRONT
- NEXT_FRONT
- COMPLETED_FRONTS
- BLOCKED_EXTERNAL
- BLOCKED_ENGINEERING
- LAST_REAL_EVIDENCE
- CERTIFICATION_STATE
- SECURITY_STATE
- PRODUCTION_READINESS
- COMMERCIAL_READINESS
- LAST_DECISION
- LAST_MEMORY_UPDATE

### Signal law

1 means the programmer must execute/resume the autonomous engineering loop immediately. It must not echo the command or wait for another 1.

2 means the AI engineering lead must assume/resume technical leadership immediately: inspect, verify, challenge, decide, direct/execute, improve, and continue.

A report is an observation, not a stop condition.


This file is the durable operational memory of the project. It is not a status report and it is not a substitute for evidence.

## 0A. Full-Scope Execution Law

Every control activation is a project-wide execution cycle.

The active operator must inspect the complete protocol obligations and open work, not only the last reported defect.

Execution priority is:

1. Data integrity
2. Security
3. Core correctness
4. Reliability
5. Production safety
6. User-critical functionality
7. Verification and evidence
8. Performance
9. Maintainability
10. UX and visual quality
11. Commercial maturity
12. Optional polish

Whenever a recurring ambiguity or execution failure is discovered, the operating documents themselves become part of the corrective work.

## 1. Truth hierarchy

1. Live repository state at the exact inspected SHA.
2. Database/runtime/production evidence from the exact environment and time.
3. CI/workflow artifacts tied to the exact SHA and environment.
4. Git history, PRs, issues, and committed evidence artifacts.
5. This memory and decision records.
6. Conversation claims and pasted reports.

When sources conflict, record the conflict and prefer the highest-authority source. Do not silently merge incompatible states.

Core law:

> No Evidence → No PASS.
> Evidence belongs to an exact SHA + environment + execution context.
> Old Evidence is never New SHA Evidence.

## 2. Current state envelope

Maintain:

- Product
- Repository
- Current branch
- Current exact SHA
- Verification environment
- Last memory update
- Release/certification state
- Architecture state
- Critical capabilities
- Open blockers
- Active work fronts
- Known regressions
- Security risks
- Technical debt
- External dependencies
- Next executable front

Every material claim must be marked CURRENT, STALE, SUPERSEDED, or UNVERIFIED.

## 3. Memory entry contract

Every durable entry should identify:

- Entry ID
- Type
- Statement
- Status
- Source
- Exact SHA
- Environment
- Observed timestamp
- Evidence reference
- Owner
- Superseded entry
- Impact
- Recheck or expiry condition

Allowed statuses:

OPEN, IN_PROGRESS, VERIFIED, BLOCKED, REJECTED, SUPERSEDED, DEPRECATED.

Do not use DONE, PASS, READY, or CERTIFIED as evidence substitutes.

## 4. Immutable evidence ledger

For each material claim record:

- Claim ID
- Claim
- Exact SHA
- Exact environment
- Test or operation
- Observed result
- Artifact/log/reference
- Timestamp
- Scope
- Freshness rule
- Reviewer for certification claims

Evidence history is append-only in meaning. Compaction may remove repetition, never provenance.

Forbidden:

- Old screenshot used as proof of new code.
- Historical PASS copied to a new SHA.
- Test existence treated as product proof.
- Green CI treated as production proof.
- Local runtime treated as production proof.
- Contract-only evidence treated as runtime evidence.
- Synthetic fixtures presented as real production truth.

## 5. Architecture Decision Records

Every material engineering decision preserves:

- Decision ID
- Context
- Problem
- Options
- Chosen approach
- Reason
- Rejected alternatives
- Security impact
- Data impact
- Performance impact
- UX impact
- Migration and rollback impact
- Review trigger
- Evidence

Preserve why, not only what.

## 6. Change ledger

For each material cycle record:

- Change ID
- Objective
- Base SHA
- Changed surfaces
- Risk
- Required tests
- Produced evidence
- Regression impact
- Final SHA
- Memory updates
- Remaining work

## 7. Autonomous authority

The engineering owner may independently decide:

- Implementation strategy
- File/module structure
- Refactoring required for correctness
- Test strategy
- UI/UX implementation details
- Accessibility
- Performance
- Security hardening
- Observability
- Documentation
- Dependencies within project constraints
- Regression protection

Escalate only for product intent, commercial policy, destructive or irreversible decisions, material external cost, or other decisions genuinely owned by the product owner.

## 8. Work discovery

At the beginning of each cycle derive work from:

1. Exact repository state
2. Runtime and CI evidence
3. Open defects and blockers
4. Security findings
5. Architecture and data risks
6. Product requirements
7. Release gates
8. Material technical debt
9. Missing evidence for existing claims

Every work item needs ID, priority, risk, value, dependencies, owner, status, acceptance criteria, and verification requirements.

## 9. Parallel execution

Independent fronts should run in parallel when safe.

Do not parallelize conflicting mutations on the same files, database state, release pointer, destructive environment, or shared artifact.

Before starting a front, search Git history, branches, PRs, and memory to prevent duplicate work.

## 10. Blocker protocol

A blocker changes the route; it does not end the mission.

1. Diagnose the exact blocker.
2. Record it.
3. State the minimum external action required.
4. Continue all safe independent fronts.
5. Revisit only when its prerequisite changes.
6. Never bypass a safety, security, data, or evidence gate.

## 11. Project-specific invariants

### Truth and release

- Exact SHA is authoritative.
- Release decisions are fail-closed.
- Historical evidence never transfers silently to a new SHA.
- No fake PASS, fabricated evidence, synthetic JWT/session claims, or fixture masquerading as production truth.
- Certification requires its actual evidence chain.

### Database and staging

- Mutable database changes are staged and verified before production.
- Preserve storage and data unless deletion is explicitly authorized.
- Do not create duplicate runners/RPCs when the canonical path works.
- Do not rewrite an existing durable runner merely to make a test green.

### Canonical integration surfaces

Existing canonical paths take precedence over invented substitutes. Known surfaces include:

- get_dashboard_snapshot
- get_dashboard_intelligence
- runDurableProductionLifecycle
- production-coordinator-bridge.ts
- import_commit_batch
- import_finish_job

Inspect the current implementation before modifying any of them.

### Import truth chain

queued → fingerprinted → extracted → canonicalized → validated → analyzed → decisioned → committed → rendered

Committed is a durable database state, not a UI completion event.

### Data and tenant truth

- Tenant identity and current_company_id are correctness boundaries.
- RLS and database permissions are correctness boundaries.
- Currency comes from tenant truth, not a UI default.
- Unknown metrics fail closed.
- Inventory and Demand conclusions must not invent severity.
- OCR confidence and review/reject behavior remain explicit and evidence-backed.
- Raw documents are not sent to local AI unless an explicitly approved architecture requires it.
- Deterministic metric math remains authoritative.

## 12. Certification state machine

DISCOVERED → IMPLEMENTED → TESTED → RUNTIME_VERIFIED → ENVIRONMENT_VERIFIED → RELEASE_ELIGIBLE → CERTIFIED

A lower state cannot be represented as a higher state.

Certification requires exact SHA, environment, required tests, runtime evidence where applicable, known limitations, and release-decision evidence.

Missing proof means FAIL-CLOSED.

## 13. Regression policy

Do not rerun every closed check by ritual.

Reopen a closed check when relevant source, configuration, schema/data, dependency, runtime, security boundary, interface, or test logic changed, or a relevant regression appeared.

## 14. Test-the-test

For important tests ask:

> Could this test pass while the real defect still exists?

Challenge success paths, failure paths, permission boundaries, tenant isolation, invalid input, duplicates, idempotency, retries, races, network/session failures, recovery, persistence, and regressions.

## 15. Security and data integrity gate

Review and test:

- Authentication
- Authorization
- RBAC
- RLS
- Tenant isolation
- Object-level access
- Input/output validation
- File upload handling
- Secrets
- Session behavior
- Injection/XSS/CSRF where applicable
- IDOR
- Privilege escalation
- Information leakage
- Dependency risk
- Auditability
- Transaction integrity
- Concurrency
- Rollback

## 16. UX/UI integrity gate

Evaluate the product as one system:

- Information architecture
- Navigation
- Terminology
- RTL/LTR
- Responsive layout
- Loading/empty/error/success states
- Forms
- Tables
- Search and filters
- Keyboard/focus
- Accessibility
- Mobile
- Visual consistency
- Performance

## 17. Research log

When research materially influences a decision, record:

- Question
- Sources
- Date
- Findings
- Trade-offs
- Decision
- Recheck trigger

Prefer current authoritative documentation for platform and security behavior.

## 18. Assumptions register

For each important assumption record:

- ID
- Statement
- Reason
- Evidence
- Risk if false
- Validation plan
- Status

When disproved, mark superseded and record the correction. Do not erase history.

## 19. Known unknowns

Keep a short list of unresolved questions that can materially change engineering behavior, with owner, impact, next verification action, and blocking status.

## 20. Anti-drift controls

Periodically compare memory with live state for:

- Current branch/SHA
- Architecture
- Canonical integration points
- Release state
- Open blockers
- Security assumptions
- Database contracts
- Test inventory

Any contradiction becomes a tracked memory defect until resolved.

## 21. Completion definition

A task is closed only when:

- Implementation exists
- Root cause is addressed where applicable
- Relevant tests pass
- Evidence is captured
- Required runtime/environment verification is done
- Security/data/UX impact is reviewed
- Regression risk is addressed
- Memory is updated
- Remaining work is explicit

## 22. Standard execution record

~~~text
CURRENT STATE
Branch:
Exact SHA:
Environment:
Objective:

DISCOVERED
Root cause / missing capability:

ACTION
Changed surfaces:
Decision:

TESTS
Executed:
Expected:
Observed:

VERIFICATION
Proven:
Not proven:

EVIDENCE
Exact references:

RISK / REGRESSION
Remaining risks:

MEMORY
Updated records:

NEXT FRONT
Next executable action:
~~~

## 23. Final principle

The project must remain understandable, reproducible, and provable without depending on the memory of one person, model, or conversation.

The repository is where engineering truth, decisions, evidence, and operational memory converge.


## 24. Leadership Review — 2026-09-18

### Exact-head findings

The AI engineering lead independently inspected PR #542 and its exact runtime evidence.

#### Finding L1 — Certification checker false-negative

- Failed workflow: Final Certification Gate
- Run: 35302318549
- Exact SHA: 66d6844830c183cd674c731c144f5058e38f905c
- Failing check: scripts/check-decision-approval-lock-order.mjs
- Root cause: the checker used case-sensitive string search for lowercase SQL tokens while the exact-head migration used uppercase SQL keywords such as FROM and FOR UPDATE.
- Exact-SHA inspection confirmed the required lock order was present.
- Corrective commit: 0b1d0c0d6d20243cefed00eaec1d2f3b72a9bb0e
- Corrective principle: strengthen the parser rather than weaken the database guard.
- Required verification: fresh CI on the corrected head.

#### Finding L2 — Import terminal completion contract mismatch

- Failed workflow: Full Product Browser E2E
- Run: 35302318597
- Exact SHA: 66d6844830c183cd674c731c144f5058e38f905c
- Runtime failure: IMPORT_COMPLETION_REQUIRES_ALL_ROWS_PROCESSED
- Root cause: CanonicalImportPage.tsx invoked import_finish_job with valid_rows and invalid_rows, while the authoritative function accepts the completion contract committed and invalidRows, or requires all processed rows otherwise.
- Staging evidence: live public.import_finish_job definition was inspected through Supabase and matched the failure mechanism.
- Corrective commit: 87b362eb6def5e114810ee7a8f423aef446bd0de
- Regression guard: src/lib/import-finish-ui-summary.contract.test.ts
- CI wiring: import-finish-lifecycle-security.yml
- Required verification: fresh exact-head browser/persistence proof.

#### Finding L3 — Storage runtime external blocker

- Failed workflow: Storage Tenant Runtime E2E
- Run: 35302318611
- Exact SHA: 66d6844830c183cd674c731c144f5058e38f905c
- Result: BLOCKED EXTERNAL
- Missing configuration: REPORT_ADVISOR_STORAGE_BUCKET
- Repository/staging evidence does not justify inventing a storage bucket or secret.
- Action: keep fail-closed; provision real storage configuration only if and when the product capability is genuinely required.
- No fake PASS.

#### Finding L4 — Vercel provider rate limit

- Exact-head PR checks on governance and runtime branches report Vercel failure with build-rate-limit.
- This is an external provider/quota blocker, not evidence of source-code failure.
- Action: do not bypass; continue independent GitHub/Supabase/source verification.

### Evidence freshness decision

Evidence from 66d is historical after code/test changes. The active PR #542 candidate was rebound to:

39b90e44c91c227a02989245e3a8d9c3b9791177

The subsequent 51c71124c6b90f98f4659e8d79efabf800a5cc1c commit is documentation-only; it does not itself require a code candidate rebind.

Certification remains FAIL-CLOSED until fresh evidence is produced on the corrected candidate.

### Leadership decision

Do not weaken:

- decision lock ordering,
- import_finish_job authority,
- tenant/security gates,
- storage truth,
- certification evidence boundaries.

Fix the verifier when the verifier is wrong. Fix the producer/consumer contract when the runtime contract is mismatched. Preserve external blockers as blockers.


## 25. Leadership Resume — 2026-09-18

### Current execution observation

- Corrected execution branch currently reaches 51c71124c6b90f98f4659e8d79efabf800a5cc1c.
- Fresh GitHub Actions runs were created for this head.
- At the time of inspection, most affected workflows remained queued; desktop-windows was in progress.
- No fresh success or failure from the corrected browser or certification runs is promoted yet.

### Vercel truth

- Vercel team: Injaz, plan HOBBY.
- Production deployment remains the main deployment at exact SHA a32fae0fc08c1cbbcc60b6eedfb0f4bd74a21c50.
- A separate ready deployment exists for governance PR #543 at SHA 787762563b3da0e6bdd2d87103dffb49354ae660.
- The current PR #542 corrected head is not the production deployment.
- GitHub Vercel checks on current PR work report build-rate-limit; this remains an external deployment-provider constraint.
- Do not describe the current candidate as production-deployed.

### Supabase storage truth

- Live storage.buckets query returned zero buckets.
- Therefore REPORT_ADVISOR_STORAGE_BUCKET cannot be populated from an existing real bucket.
- Do not create a bucket solely to turn the Storage Tenant Runtime E2E green.
- Treat Storage runtime as an external or product-readiness blocker until a real storage-backed product capability and configuration are established.

### Continuation

Next verification fronts after the queued runs complete:

1. Import terminal contract / Full Product Browser E2E on corrected head.
2. Final Certification Gate on corrected head.
3. PDF/OCR runtime evidence.
4. Tenant/persistence runtime proof.
5. Storage decision: either a real integrated capability with real configuration, or explicit readiness backlog without fake certification.
6. Vercel deployment verification only after the provider accepts a candidate deployment.

Historical evidence from 66d is not promoted to 51c.

## 26. Leadership Resume — 2026-09-18 / Exact-head verification wave

- Exact active PR branch: `fix/pdf-structured-runtime-closure-20260918`
- PR #542 branch HEAD: `51c71124c6b90f98f4659e8d79efabf800a5cc1c`
- Governed code/test candidate remains: `39b90e44c91c227a02989245e3a8d9c3b9791177`
- Fresh CI wave is attached to the current branch head; at inspection time Browser E2E, Final Certification, import-finish lifecycle security, PDF structured parser regression, production regression evidence, and Storage Tenant Runtime E2E were still queued.
- Exact-head `desktop-windows` run `35303725683` completed successfully, including web build, native runtime smoke, packaging, and installer upload. This is fresh evidence for that verification front only; it does not certify the product.
- Staging live counts observed independently: `import_jobs=3590`, `canonical_import_commits=2475`, `kpi_evidence_snapshots=156`, `sales_invoices=329`, `companies=2`. These are environment observations, not certification evidence by themselves.
- Storage remains unconfigured at the live project level: `storage.buckets` is empty. No bucket or secret is invented to satisfy tests.
- Vercel has no deployment for PR #542 candidate/head in the currently inspected deployment list. Production remains separate; no candidate deployment is claimed.
- Governance-document defect observed: `docs/MASTER_EXECUTION_INDEX.md` contains an isolated `NaN` line immediately after the current candidate line. It does not currently break the case-insensitive certification-boundary parser, but it is a documentation-integrity defect and should be removed in a later governance-only correction without transferring or invalidating runtime evidence.
- Decision: do not churn the candidate while the fresh exact-head evidence wave is pending. Continue independent verification and patch only causal failures. Do not promote queued, historical, local, or unrelated evidence.
