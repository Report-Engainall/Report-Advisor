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


## 25. Execution Reconciliation — 2026-09-18

### Active exact-head state
- Main live head remains `a32fae0fc08c1cbbcc60b6eedfb0f4bd74a21c50`.
- Active runtime repair front: PR #542, current exact branch head `a346e68ff06cb452eff64d98a8b9980142a7daef`.
- Code-bearing PDF/OCR repair head immediately before the governance-only index correction: `51c71124c6b90f98f4659e8d79efabf800a5cc1c`.
- `a346e68...` changes only `docs/MASTER_EXECUTION_INDEX.md`; it removes a stale `NaN` marker and binds the index to the exact active head.

### Fresh verification
- Local Windows worktree exact code head `51c71124...`: `check-file-engine-regressions.ts` PASS.
- Local Windows worktree exact code head `51c71124...`: `check-pdf-structured-regression.ts` PASS with real staging URL/publishable key configuration; PDF.js emitted a Node compatibility warning only, and the test process exited successfully.
- Local Windows worktree exact code head `51c71124...`: `npm run typecheck` PASS.
- Local Windows worktree exact code head `51c71124...`: `npm run lint -- --quiet` PASS.
- These local results are local evidence only and are not production certification.

### Live staging truth
- Supabase staging `fnqbvfuwbdpwvhcgzksl` is `ACTIVE_HEALTHY`.
- Current staging row counts observed: companies=2, memberships=2, import_jobs=3590, canonical_import_commits=2475, sales_invoices=329.
- Live `public.import_finish_job(uuid,text,jsonb,text)` is SECURITY INVOKER, pins `search_path` to `public`, enforces `current_company_id()`, validates terminal states, and accepts the authoritative `committed` / `invalidRows` completion summary.
- `import_finish_job` EXECUTE is granted to authenticated/service_role/postgres and not anonymous.

### External blockers
- Vercel status on active PR/runtime heads remains provider quota failure `api-deployments-free-per-day`; no bypass is authorized.
- Storage Tenant Runtime remains externally blocked where `REPORT_ADVISOR_STORAGE_BUCKET` is absent; no synthetic bucket or PASS is permitted.
- Supabase security advisors currently report a broad existing set of authenticated SECURITY DEFINER exposure warnings plus leaked-password protection disabled. These are tracked findings, not silently treated as release blockers unless the affected function is in the release-critical surface.

### Certification state
- Certification remains FAIL-CLOSED.
- Fresh exact-head Actions evidence is required on the post-index-correction head before any runtime certification claim.


## 27. Leadership Self-Correction — 2026-09-18
- The prior `2` cycle was too observation-heavy and ended while safe independent work remained.
- Corrective governance commits: `d1a2d4e5dbfc15482eab06b7eacd4890ee80761b`, `1184b71d7f10a5bff5284810765185dc80ff6f98`, `9c9fa6f65420a7ce269fa6696cb6ec76726f406c`.
- These add a mandatory non-idle execution gate to the AI lead, dual-signal protocol, and programmer protocol: queued CI is not a stop; every activation must execute a material action, re-scan, and improve the control plane when a recurring failure is found.
- Live Supabase Security Advisor reports 49 authenticated-callable SECURITY DEFINER warnings.
- Release-critical report execution RPCs were inspected individually; no blanket revoke was performed.
- Issue #544 now tracks intent-based classification and adversarial closure of the seven report-runtime RPCs.
- Main: `a32fae0fc08c1cbbcc60b6eedfb0f4bd74a21c50`.
- PR #542 branch HEAD: `a346e68ff06cb452eff64d98a8b9980142a7daef`.
- Governed code/test candidate: `51c71124c6b90f98f4659e8d79efabf800a5cc1c`.
- Certification remains FAIL-CLOSED.


## 28. Security Research Record — 2026-09-18

- Question: Should the 49 authenticated-callable SECURITY DEFINER warnings be closed by blanket revocation?
- Authoritative reference reviewed: current Supabase Database Functions / API security guidance.
- Decision: no blanket revocation. Function EXECUTE must be granted only to roles that genuinely need the function; SECURITY DEFINER must be explicitly justified and protected by a pinned search_path and authorization checks.
- Applied to Report-Advisor: classify the release-critical report-runtime RPCs by actual caller intent, then prove or restrict each boundary.
- Research supports the existing fail-closed decision to preserve legitimate authenticated business functions while independently closing worker-only exposure where proven.
- Separate external hardening item remains open: Supabase Auth leaked-password protection (Issue #354).


## 29. Control-Plane Enforcement — 2026-09-18

- The non-idle leadership rules are now machine-checked by the existing `Execution Enforcement Contract` workflow rather than remaining documentation-only.
- `scripts/check-execution-enforcement-protocol.mjs` now validates the control-signal protocols themselves for the non-idle/queue-is-not-stop/self-correction/cycle-contract rules.
- `scripts/check-execution-enforcement-protocol.test.mjs` now adversarially removes the new sections and requires the validator to reject the weakened protocols.
- Corrective commits: `618114d64f676e20ef61995f540710956ac413e8`, `5ee4869d417b8a00f0c46a2b8149ccbab11987a6`, `4da5dd46ff65e9343595c52e717e72660d4855d7`, `0e70fd53a8c80f47f7e4f6bb7ab2dd03ca9c7526`.
- CI execution for the latest governance commit is not currently surfaced in the commit workflow-run feed; therefore these new checks are implementation evidence, not a CI PASS claim.


## 26. Regression Closure Reconciliation — 2026-09-18

### Exact-head sequence
- Code repair head: `50551116b4221e3914de52f3906b3a3af25fecab`.
- Post-verification governance/index-only head: `4b865aa2f8b418385d2bf9b3c0b5334b3e10d4a5`.
- The index-only head does not change application/runtime code; code regression evidence remains bound to `50551116...`.

### Root causes fixed
- Production regression evidence generator was not platform-safe on Windows. It now invokes the explicit Windows `ComSpec` with `npm.cmd`, without Node's implicit `shell:true` option.
- Quality workflow contract checker produced a false negative because the workflow file uses CRLF while the checker regex expected LF. The checker now normalizes CRLF to LF before contract parsing.

### Exact local evidence
- `50551116...` local regression matrix: **12/12 scenarios PASS**.
- `pdf-text`: PASS on exact `50551116...`.
- `pdf-ocr-ar`: PASS on exact `50551116...`.
- `excel-missing-columns`: PASS after the line-ending checker fix.
- Quality workflow contract: PASS on exact `50551116...`.
- Windows direct npm subprocess probe: PASS.

### Evidence boundary
- The 12/12 result is executable regression-harness evidence only. It does not prove live authenticated database commit, browser persistence, or production deployment.
- The historical `POSITIVE_POLICY_COMMIT_UNAVAILABLE` condition is not present in the current 12-scenario harness output for `pdf-text`/ `pdf-ocr-ar`, but live positive commit/readback remains separately unproven.
- Certification remains FAIL-CLOSED pending fresh exact-head GitHub runtime/browser evidence and any required live staging commit/readback proof.

### External state
- Supabase staging `fnqbvfuwbdpwvhcgzksl` remains `ACTIVE_HEALTHY`.
- Vercel remains provider-rate-limited; no bypass or forced deployment is allowed.


## 30. Device Operations Front — 2026-09-18

- Device: PC01, Windows, Remote Desktop Commander 0.2.51.
- Device was confirmed online and pingable before cleanup attempts.
- Live config identified current Desktop Commander server PID `4476`.
- Live process snapshot identified duplicate Desktop Commander Node processes `14296, 21308, 20276, 9916, 7972`.
- Two stale blocked terminal sessions were visible: `8932`, `18548`.
- Two duplicate `winget` installations of `MikeFarah.yq` were visible: `11348`, `16760`.
- Two `actionlint` processes were active against Report-Advisor verification worktrees.
- Targeted cleanup was attempted only against the duplicate/stale automation processes; the remote control channel then became timeout-prone. Device cleanup is therefore **IN_PROGRESS / BLOCKED_EXTERNAL_CHANNEL**, not closed.
- No reboot, shutdown, destructive disk operation, or user-application termination was performed.
- Issue #545 records the exact device cleanup front and acceptance evidence.


## 31. Exact-head Runtime Wave RCA — 2026-09-18

### Fresh evidence on a346e68ff06cb452eff64d98a8b9980142a7daef

Verified workflow results:
- Full Product Browser E2E 35304097897: SUCCESS.
- import-finish-lifecycle-security 35304098135: SUCCESS.
- PDF structured parser regression 35304098034: SUCCESS.
- production-regression-evidence 35304098023: SUCCESS.
- desktop-windows 35304098075: SUCCESS.
- certification-evidence-boundary 35304097925: SUCCESS.
- storage-tenant-isolation 35304097938: SUCCESS.
- Commercial Product Creation E2E 35304097936: SUCCESS.
- Phase 2 security closure 35304098012: SUCCESS.
- Phase 3 data import truth 35304098113: SUCCESS.
- security-definer-exposure-contract 35304097962: SUCCESS.
- OCR Confidence Contract 35304098048: SUCCESS.
- company-context-contract 35304098042: SUCCESS.
- Execution Enforcement Contract 35304098045: SUCCESS.

### Failures independently classified

- Quality 35304097988 failed at a diagnostic branch-head consistency assertion; install was skipped, so later eslint/vite failures were secondary command-not-found effects. The branch continued advancing while the run was executing, so this is stale-head workflow evidence, not a product-code failure.
- Phase9 Windows contract 35304097919 failed in the same exact-head-vs-remote-branch consistency preflight before the actual phase contract ran.
- Storage Tenant Runtime 35304098052 is a genuine external configuration block: REPORT_ADVISOR_STORAGE_BUCKET is empty; runtime explicitly classified itself BLOCKED EXTERNAL. No storage bucket is invented.
- Final Certification 35304098114 failed at check-decision-approval-toctou-contract.mjs: the SQL verifier used case-sensitive indexOf for lowercase from/guard tokens while the canonical migration uses normal uppercase SQL. This is a verifier false-negative.

### Corrective action

- Root cause fixed in scripts/check-decision-approval-toctou-contract.mjs.
- New code fix commit: ce674d937cde275f6e233e2fd4ad78589e9dafb5.
- Master Index candidate rebound to that exact code commit via docs-only commit: e5ca7443748562c97d2098e55d31d6a857cc053b.
- Fresh exact-head CI for the new candidate is not yet surfaced in the commit run feed; therefore no PASS is claimed for the new candidate.

### Governance branch note

- PR #543 governance workflows include a security-definer contract failure because PR #543 is based on main and does not contain PR #542 runtime security migrations. This is dependency scope, not a reason to weaken the security contract.
- Keep governance and runtime lanes independent; classify workflow applicability rather than transferring runtime evidence across branches.

### Certification state

FAIL-CLOSED until fresh evidence exists on ce674... / its governance-only descendant e5ca....

### Device state

PC01 device cleanup remains IN_PROGRESS / BLOCKED_EXTERNAL_CHANNEL after the remote control channel became timeout-prone while targeted duplicate-process cleanup was attempted. Exact process evidence is tracked in Issue #545.


## 32. Fresh Candidate Wave — 2026-09-18

### Exact candidate
- Code/test candidate: ce674d937cde275f6e233e2fd4ad78589e9dafb5
- Governance-only descendant / current candidate boundary: e5ca7443748562c97d2098e55d31d6a857cc053b

### Fresh exact-head observations
- import-finish-lifecycle-security 35305165514: SUCCESS.
- Execution Enforcement Contract 35305165855: SUCCESS.
- semantic-metric-runtime-contract 35305165538: SUCCESS.
- inventory-intelligence-truth 35305165777: SUCCESS.
- Cloudflare Pages Compatibility 35305165895: SUCCESS.
- production-chain-guard 35305165774: SUCCESS.
- UI route completeness 35305165802: SUCCESS.
- canonical-truth-boundary 35305165776: SUCCESS.
- canonical-aggregation-truth 35305166010: SUCCESS.
- integrity-batch 35305165821: SUCCESS.
- OCR Confidence Contract 35305165738: SUCCESS.
- storage-tenant-isolation 35305165713: SUCCESS.
- Golden Evidence Integrity 35305165807: SUCCESS.
- Phase F live resilience run 35305165724: **BLOCKED EXTERNAL**. All local/static resilience checks passed. Live probe requires RESILIENCE_TARGET_ENV, RESILIENCE_OPERATIONAL_TOKEN, RESILIENCE_CANARY_AUTH_TOKEN, RESILIENCE_HEALTH_URL, RESILIENCE_CANARY_URL, RESILIENCE_BACKUP_VERIFY_URL, and RESILIENCE_ROLLBACK_DRILL_URL, all absent in the workflow environment.
- Device-independent browser, Full Product Browser E2E, Quality, PDF regression, Production Regression, and Final Certification remain queued/in progress at this inspection; no PASS is promoted before completion.

### Decision
- Do not weaken Phase F to make it green.
- Do not fabricate live resilience URLs/tokens.
- Continue all unrelated exact-head fronts.


## 33. TOCTOU Verifier Second-Pass Hardening — 2026-09-18

- First verifier fix commit: ce674d937cde275f6e233e2fd4ad78589e9dafb5.
- Adversarial self-review found two remaining case-sensitive assertions inside the same TOCTOU contract:
  - terminal conflict-path guard lookup;
  - canonical adversarial fixture decision SELECT lookup.
- These were corrected in follow-up code/test commit: bdea176d498347d1c6150f9eae6dc08dc79f9c8f.
- Master Index was rebound to the new code/test candidate by governance-only commit: 884362ebb7380d7db3deae1032de7099f94ae0006.
- No SQL lock order, transaction semantics, or approval policy was weakened.
- Fresh CI evidence for the new candidate is required; no previous certification evidence transfers.


## 34. Device Channel State — 2026-09-18

- PC01 (`e4088840-5dc3-49fe-bb4f-b331a167703b`) subsequently reports **offline** in Remote Desktop Commander.
- The earlier live process snapshot remains the last reliable device evidence: duplicate Desktop Commander PIDs, stale blocked sessions, duplicate yq installation processes, and actionlint instances were observed.
- Targeted process termination was attempted but the remote channel became timeout-prone before post-cleanup verification.
- No process is marked as successfully terminated without evidence.
- Device front status: **IN_PROGRESS / BLOCKED_EXTERNAL_CHANNEL**.
- Required future proof remains before closure: reconnect, inspect processes, remove only confirmed automation duplicates/stale sessions, then capture before/after CPU/memory evidence.


## 27. Final Certification TOCTOU Parser Closure — 2026-09-18

### Exact repair lineage
- PR #542 application repair head: `17898a913237bd50168e0f64231a475f7608f0b1`.
- PR #542 governance/index rebind head: `dad5dda868bc8943fbcae2ec70c708a684c242d3`.
- Prior certification failure was traced to `scripts/check-decision-approval-toctou-contract.mjs` using case-sensitive token searches against canonical SQL that uses uppercase SQL keywords.
- Repair normalized the canonical function body for semantic position checks and hardened the adversarial gate mutation similarly.
- `MASTER_EXECUTION_INDEX.md` is intentionally bound to the application/code head, while the immediately following governance commit contains only the rebind.

### Fresh evidence boundary
- The prior exact-head Final Certification run failed specifically at `check-decision-approval-toctou-contract.mjs`; all earlier 20-stage release-readiness checks in that same run passed.
- A fresh CI wave was triggered by the repaired exact-head lineage and remains the authority for acceptance.
- Local regression matrix evidence remains 12/12 PASS on code head `50551116...`; it is not promoted to production certification.
- Vercel deployment status remains externally rate-limited on the affected release fronts; Cloudflare Pages has independently reported successful branch preview deployments on earlier exact security heads.

### Migration provenance boundary
- Staging contains later migration ledger entries including the worker/security reconciliation tail not present on `main`.
- PR #542 includes forward-only source reconciliation migrations for the verified live worker search_path state.
- The historically missing ledger record `20260918024152` remains an explicit provenance gap; no synthetic source file or historical migration rewrite is permitted.


## 35. Device Cleanup Closure — 2026-09-18

- Device: PC01, Windows, Desktop Commander 0.2.51, device id e4088840-5dc3-49fe-bb4f-b331a167703b.
- Reconnection succeeded with persisted session restored; live ping returned pong and Desktop Commander reported the device online.
- The previously reported duplicate Desktop Commander PIDs from the earlier blocked channel were not present after reconnection. The live active Desktop Commander chain was inspected and retained: node PIDs 13640 -> 22424/10808 -> 20616 as the current npx/bridge/server process chain.
- Remaining stale automation processes identified before cleanup: winget PIDs 11348 and 16760, both installing MikeFarah.yq; actionlint PIDs 3176 and 7508 against Report-Advisor worktrees. Their combined working-set memory was approximately 91.97 MB.
- Termination evidence: PIDs 11348, 16760, 3176, and 7508 were each successfully terminated by Remote Desktop Commander.
- Post-cleanup verification: no winget or actionlint processes remained; no active Desktop Commander terminal sessions remained; current Desktop Commander node chain remained online.
- yq installation was verified independently after cleanup: MikeFarah.yq 4.53.6 listed by winget.
- Post-cleanup machine observation: CPU load 11%; available physical memory 19,657.9 MB at the observation instant.
- Current Desktop Commander node working sets were approximately 67.9 MB, 110.2 MB, and 108.3 MB for PIDs 13640, 10808, and 20616 respectively.
- No reboot, shutdown, destructive disk/system operation, or user-application termination was performed.
- Issue #545 device-operations acceptance criteria are now satisfied for the verified cleanup scope; issue closure should reference this exact evidence and must not imply broader performance optimization beyond the measured process cleanup.


## 28. Fresh Live Import Positive-Path Evidence — 2026-09-18

- Staging `fnqbvfuwbdpwvhcgzksl` produced a fresh real positive import persistence chain.
- `import_jobs.id=84b510df-d84c-4057-8b76-89d9d7d8544d` reached `completed`, progress 100, processed 1, valid 1, invalid 0, with `result_summary.committed=1`.
- Source hash: `sha256:d35ebf6343dd840bfbbd3137fd121e3b0c40ea5e0d8d550e99697da81c9a3b7f`.
- Matching `canonical_import_commits.id=2dd2865a-0784-4109-941e-5e691877bddc`, `committed_count=1`, with committed product id `517b037d-7a05-440a-be8a-92ce21a6a081`.
- Direct readback of `public.products` confirms the committed row exists under the same company and contains the E2E SKU/name and financial fields.
- This closes the evidence gap for this particular positive import/commit/readback path only; it does not certify browser behavior, tenant-A/B adversarial isolation, or release certification.


## 29. Report Execution Worker Security Boundary — 2026-09-18

- Fresh Staging security audit found six release-critical report execution worker RPCs executable by `authenticated`: enqueue, claim, heartbeat, checkpoint, complete, fail.
- `anon` is already denied for those functions.
- Function bodies use tenant/worker/lease fencing; they do not require a business-user authorization boundary. `retry_report_execution_job` is intentionally a separate authenticated tenant-scoped operator boundary and was not changed.
- PR #546 `security/report-execution-worker-service-only-20260918` adds one forward-only migration revoking authenticated/anon/public EXECUTE from the six worker functions and granting only `service_role`, with an in-migration privilege assertion.
- The repository contract checker for this boundary was added as `scripts/check-report-execution-worker-service-boundary.mjs`; exact-head CI is authoritative before merge.
- Disposable Supabase branch negative-privilege verification was not run because creating a new Supabase branch requires explicit cost confirmation; no cost was incurred.

### Import stale residue
- Staging currently shows a historical residue set of `processing` import_jobs on company `f68a7e91-3c7e-46fb-97a8-e339bec04e13`, with jobs dating back to 2026-09-14/15 and zero progress.
- New import executions on the same tenant continue to reach `completed` with `committed=1` and direct canonical readback, so this is currently classified as stale historical residue rather than an active positive-path failure.
- No bulk status mutation was performed. There is no dedicated public recovery RPC discovered; the authoritative terminal path remains `import_finish_job`.


## 36. Worker Security Boundary + Canonical Import Server Boundary — 2026-09-18

### Current exact runtime head
- PR #542 exact branch head after security-boundary integration: `70e13022e48983293c7ed094671e851754f7f82b`.
- Parent code/test head before governance rebind: `70b8a2b24f975c991ce193375b4486afa71f9ee7`.
- The final `70e130...` commit is a documentation-only Master Execution Index rebind; runtime/code evidence must remain bound to `70b8a2...` until fresh exact-head CI completes, and certification evidence is not promoted automatically.

### Security architecture correction
- Exact source inspection showed the browser-side canonical import adapter still invoked the durable worker lifecycle through the browser Supabase client while the worker migration had already restricted worker RPCs toward service-only execution.
- This was treated as a real architecture/security mismatch, not as a checker problem.
- PR #542 now moves the durable worker lifecycle behind `api/canonical-import-run.ts` and keeps the existing canonical durable runner/store intact.
- The browser path now stages already-reconciled canonical rows into tenant-scoped `public.import_job_rows` using the existing authenticated RLS boundary, then calls the authenticated server endpoint with the user session token.
- The server endpoint resolves the authenticated user and tenant, uses the existing `service_role` Supabase client for worker-only RPCs, executes `runDurableProductionLifecycle` with `SupabaseReportExecutionStore`, and preserves `import_finish_job` as the authoritative terminal close.
- Shared canonical commit logic was extracted to `src/lib/import/canonical-commit-core.ts` so the server boundary can reuse the existing deterministic import-commit implementation without importing the browser Supabase client.
- No new durable runner or database RPC was introduced.

### Security-definer classification correction
- The repository SECURITY DEFINER exposure checker was updated to classify the full report worker set as service-only: enqueue, claim, heartbeat, checkpoint, complete, fail, recover-expired, and retry.
- `retry_report_execution_job` is no longer treated as an authenticated operator boundary in the active runtime path because its verified caller is the server-side worker boundary.
- The authoritative worker migration already revokes PUBLIC/anon/authenticated EXECUTE and grants `service_role` for the worker set; the checker now verifies that exact intent instead of asserting an obsolete authenticated grant.

### Duplicate security front closed
- PR #546 was closed unmerged as superseded by the integrated PR #542 implementation.
- No evidence from #546 is transferred to #542.
- The #546 revoke-only migration was intentionally not merged because it duplicated worker privilege hardening already present in the active #542 branch and excluded retry in a way that no longer matched the verified caller graph.

### Freshness / blockers
- No GitHub Actions workflow result has yet been promoted for the new runtime code head after the security-boundary commits; the connector did not yet surface workflow runs for the new commit at the inspection point.
- Vercel remains an external provider path and has reported deployment rate-limit constraints on affected release heads; no bypass or production-deployment claim is allowed.
- Storage Tenant Runtime remains a separate external/product-readiness question; no synthetic bucket or configuration is introduced.
- Staging mutable data was not modified during this source-level security correction; live `import_job_rows` currently contains zero rows at the inspection point.

### Required next proof
- Fresh exact-head CI on `70b8a2...` / `70e130...` lineage.
- Exact security-definer exposure contract success.
- Exact import lifecycle/browser proof proving the browser-to-server worker boundary and real DB persistence.
- Only then re-evaluate certification state.
