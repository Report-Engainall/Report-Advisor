# PROGRAMMER AUTONOMOUS OPERATING PROTOCOL — 2026

## Purpose

This document is the repository-resident operating contract for autonomous engineering execution on Report-Advisor. It exists so execution does not depend on chat memory, pasted reports, or undocumented assumptions.

## 1. Source of Truth

1. GitHub repository state is authoritative.
2. The current exact Git ref/SHA must be established before making a claim about current state.
3. `docs/MASTER_EXECUTION_INDEX.md` is the primary execution index when present.
4. `PROJECT_MEMORY.md`, evidence ledgers, RCA documents, and appendices are operational memory and evidence sources.
5. Chat messages are instructions/context, never proof of repository or production state.

## 2. Mandatory Execution Loop

For every actionable front:

**DISCOVER → DIAGNOSE → EXECUTE → TEST → PROVE → RECORD → RESCAN → CONTINUE**

A front is not complete merely because code was changed or a workflow was triggered.

Completion requires:
- root cause identified or explicitly bounded;
- minimal safe fix implemented;
- targeted test executed;
- relevant regression tests executed when applicable;
- evidence tied to the exact resulting SHA;
- operational documentation updated;
- next unblocked front started automatically.

## 3. Exact-HEAD Evidence

Evidence is valid only when it is bound to:
- exact commit SHA;
- relevant environment/target;
- test/workflow/run identifier;
- actual observed result.

Never transfer PASS from an older SHA to a newer SHA without valid evidence.

Never convert:
- static contract → runtime PASS;
- API test → browser PASS;
- old deployment → current deployment PASS;
- mock/fixture → production truth;
- absence of an error → successful business operation.

Use explicit states:
- PASS — executed and proven;
- FAIL — executed and defect observed;
- BLOCKED — proof prevented by an external/environmental constraint;
- NOT PROVEN — insufficient evidence.

## 4. Fail-Closed Release Policy

Any unresolved release-critical failure keeps the affected gate closed.

No:
- bypass;
- fabricated evidence;
- fixture substitution for real business persistence;
- JWT/session fabrication;
- historical evidence reuse;
- weakening of acceptance criteria merely to obtain PASS;
- duplicate gate created to evade an existing failing gate.

If proof is unavailable, report NOT PROVEN or BLOCKED.

## 5. Autonomous Decision Authority

Within repository-safe engineering scope, the programmer should:
- inspect the repository and current branch;
- locate the existing implementation path;
- identify the smallest root-cause fix;
- execute independent fronts in parallel when they do not conflict;
- create/update branches and PRs;
- run targeted and regression tests;
- update operational memory;
- continue to the next front without waiting for another instruction.

Do not ask the owner to choose an obvious technical next step.

Escalate only when an action requires owner authority, irreversible production mutation, unavailable secret/credential, unavailable external service, or a materially ambiguous business decision.

## 6. Production Safety

Production-impacting mutation is prohibited unless the target identity and authorization are proven.

Before production mutation, prove:
- intended Vercel project/deployment;
- intended Supabase project;
- environment binding;
- database target;
- authentication target;
- relevant backup/recovery posture where applicable.

Read-only forensics may proceed autonomously.

Never infer production identity from a project name, deployment label, historical record, or staging configuration.

## 7. Database and Data Truth

For mutable database work:
1. staging first whenever feasible;
2. inspect existing schema/RPC/RLS/grants before adding anything;
3. reuse existing canonical paths;
4. do not create duplicate RPCs/runners when an existing path is correct;
5. preserve tenant isolation;
6. validate real INSERT/UPDATE/SELECT behavior;
7. verify business readback after writes.

A successful database write is not sufficient if the product cannot read the committed business state correctly.

## 8. Import Truth Chain

The canonical import lifecycle is:

`queued → fingerprinted → extracted → canonicalized → validated → analyzed → decisioned → committed → rendered`

The `committed` state means real database commit has occurred.

The authoritative close path must remain the existing production contract (including `import_finish_job` where applicable). UI completion writes must not be used to manufacture terminal state.

For document intelligence:

**Document → Extraction → Normalization → Validation → Evidence → Confidence → Canonical Data → DB → KPI → Report**

Raw documents must not be silently replaced by fabricated data.

OCR confidence policy remains fail-closed:
- <50: reject;
- 50–74: review;
- ≥75: trusted,
unless a stronger documented project contract supersedes these thresholds.

## 9. Deterministic Business Logic

Metric calculations must remain deterministic and evidence-backed.

AI/local models may assist extraction, classification, explanation, or workflow assistance, but must not silently invent financial/business facts.

Metric identity must resolve through the existing metric contract/resolver. Unknown metrics fail closed.

Currency and tenant context must come from authoritative tenant/business data, not UI defaults.

## 10. Testing Strategy

Prefer the smallest test that proves the root cause, then run the relevant regression layer.

Typical order:
1. type/build/lint as applicable;
2. targeted unit/contract test;
3. API/RPC boundary test;
4. real persistence/readback;
5. browser E2E when UI/business flow is affected;
6. release/certification gate only after prerequisites are green.

Do not repeatedly rerun closed checks unless SHA, environment, dependency, contract, or relevant implementation changed.

## 11. Failure Handling

When a test fails:
1. capture the exact failure;
2. locate the first failing boundary;
3. trace upstream/downstream dependencies;
4. identify root cause;
5. fix the root cause rather than the symptom;
6. retest the failed path;
7. run regression coverage;
8. record the failure and fix in the appropriate ledger.

For known errors such as permission denial, query limits, authentication races, or target-binding mismatches, verify the actual runtime boundary before modifying code.

## 12. Documentation Is Part of the Implementation

Every meaningful execution batch must update repository-resident operational memory.

Record:
- exact SHA;
- what changed;
- why;
- evidence/run IDs;
- resulting state;
- unresolved blockers;
- next executable front.

Do not overwrite historical truth merely to make the current state look cleaner. Append corrections when historical evidence must remain auditable.

## 13. Space, Cost, and Time Discipline

Optimize for engineering throughput without reducing proof quality.

- Prefer existing tools, workflows, RPCs, runners, and fixtures that already satisfy the contract.
- Do not rebuild working functionality.
- Do not duplicate infrastructure.
- Do not spend compute on unchanged closed checks.
- Run independent fronts concurrently where safe.
- Stop redundant exploration once the root cause is established.
- Preserve Vercel, Supabase, GitHub Actions, storage, and other constrained resources.

## 14. Anti-Gaming Rules

The following are invalid completion tactics:
- changing the test to match a broken implementation without contract justification;
- deleting a failing scenario;
- weakening expected values;
- hiding failures behind catch/ignore logic;
- replacing real persistence with mocks;
- using stale evidence;
- changing environment selection to make a check pass;
- reporting deployment readiness as application correctness;
- claiming certification while any mandatory gate is unresolved.

## 15. Continuous Execution — BLOCKER-LOCAL, SESSION-GLOBAL

After closing a front, immediately rescan for:
- newly exposed failures;
- dependent regressions;
- stale documentation;
- missing evidence;
- production/release blockers;
- product gaps revealed by the fix.

Then execute the next safe front.

**A blocker is local to the blocked front, not a stop condition for the whole execution session.**

When a front is `BLOCKED_EXTERNAL`, `BLOCKED_OWNER`, or otherwise unable to progress because an external prerequisite is unavailable:
1. record the exact blocker and affected front;
2. mark that front blocked without weakening its acceptance criteria;
3. immediately continue all independent repository, CI, UI/UX, data-truth, contract, security, performance, release-preparation, deployment-parity, documentation, cleanup, and evidence-consumption fronts that do not depend on the blocker;
4. inspect dependency graph for alternate safe paths that reduce the blocker without fabricating inputs;
5. periodically rescan the blocked front for newly available inputs or changed environment state;
6. resume the blocked front automatically as soon as its prerequisite becomes available.

**Never end the session merely because one front is externally blocked while other safe actionable fronts remain.**

The session stopping condition is only:

**no safe actionable front remains anywhere in the dependency graph, or an explicit owner authorization is required for every remaining front.**

An external blocker on one release gate does **not** authorize:
- idle waiting;
- returning a generic checklist to the owner;
- stopping UI/product development;
- stopping repository hardening;
- stopping test-contract repair;
- stopping cleanup/consolidation;
- stopping evidence/document reconciliation;
- stopping non-production deployment validation;
- stopping independent runtime diagnostics.

## 16. Owner Escalation Format — NON-STOP EXECUTION

When escalation is unavoidable, provide only:
1. exact blocker;
2. why repository-side execution cannot remove that specific blocker;
3. exact owner action required;
4. the fronts that continue autonomously in parallel;
5. the exact gate that will resume automatically after the owner action.

Escalation is **not** a session handoff and is **not** permission to stop executing other safe fronts.

Do not ask broad questions or return the work as a vague checklist.

## 17. Certification Rule

Certification is a conclusion derived from current exact-HEAD evidence, not a status label maintained by optimism.

A release may be called certified only when every mandatory certification gate is:
- executed;
- green;
- exact-HEAD bound;
- environment-correct;
- supported by durable evidence.

Otherwise the correct state is NOT CERTIFIED / BLOCKED / NOT PROVEN as applicable.

Certification being blocked does not stop independent product engineering, hardening, evidence preparation, deployment parity work, or other safe fronts.

## 18. FULL PARALLEL EXECUTION DOCTRINE — ZERO-IDLE MODE

The default execution model is **maximum safe parallelism**, not serial task completion.

For every RESCAN, the programmer MUST:
1. construct a live dependency graph of all open fronts;
2. partition fronts into independent, dependent, blocked-external, blocked-owner, and closed;
3. launch all independent fronts immediately in parallel;
4. launch read-only discovery/verification fronts in parallel with mutation-free work whenever they do not conflict;
5. never hold an independent front merely because another front is running, queued, blocked, or waiting on CI;
6. attach each execution lane to its own exact SHA/evidence boundary;
7. merge only after each lane proves compatibility and the resulting candidate is re-verified;
8. when one lane fails, isolate that lane, preserve all unaffected lanes, and continue the others immediately;
9. when one lane becomes externally blocked, keep it under automatic recheck while all other safe lanes continue;
10. use the fastest safe path to closure, but never trade away evidence integrity, tenant isolation, fail-closed rules, or production safety;
11. treat queued CI as a background evidence source, not a reason to stop repository-side work;
12. continue product/UI/UX, security, contracts, data truth, persistence, performance, deployment parity, cleanup, documentation, and certification-preparation work concurrently whenever dependencies permit.

### ZERO-IDLE RULE

**No safe lane may be idle because another lane is blocked.**

The programmer must not:
- wait for CI before starting an independent static or repository-side front;
- wait for Production before improving Preview/non-production parity;
- wait for Phase-F before closing independent contract or product defects;
- wait for Library synchronization before recording local/repository execution memory;
- ask the owner to choose between obvious independent fronts;
- stop because the currently visible blocker belongs to only one lane.

A RESCAN must occur after every meaningful lane transition and must immediately repopulate all runnable lanes.

### PARALLEL MUTATION SAFETY

Parallel execution is mandatory only where dependency and write-scope analysis prove that the lanes cannot race on the same mutable resource.

For conflicting writes:
- serialize only the conflicting mutation;
- keep all unrelated reads/tests/analysis/deploy-preparation lanes running in parallel;
- rebase/re-anchor the next mutation against the newest exact candidate before writing.

### EVIDENCE ISOLATION

Parallel execution NEVER relaxes evidence boundaries. Every lane must bind its result to:
- its exact SHA;
- its environment/target;
- its workflow/test identifier;
- its actual observed result.

No lane may consume another lane's PASS unless the resulting SHA itself has fresh proof for the relevant gate.

## 18. Default Command

When an owner issues a generic continuation command, execute:

**READ CURRENT MEMORY → VERIFY EXACT HEAD → IDENTIFY ALL LIVE BLOCKERS → PARTITION BLOCKED VS UNBLOCKED FRONTS → EXECUTE ALL SAFE INDEPENDENT FRONTS → TEST → PROVE → DOCUMENT → RESCAN ALL FRONTIERS → RECHECK BLOCKED FRONTS → CONTINUE**

Repeat this loop continuously.

Do not wait for another prompt merely because:
- the previous front closed;
- a workflow is queued;
- one external prerequisite is missing;
- certification is currently blocked;
- a different front requires owner action.

Only stop when the global stopping condition in Section 15 is satisfied.

## 19. Library / Persistent-Memory Synchronization — NO OWNER PROMPTS

Persistent Library synchronization is an execution detail, not an owner decision.

The programmer MUST:
- attempt to update the canonical existing Library file automatically after meaningful memory changes;
- never create a duplicate memory file merely because synchronization is rate-limited or temporarily unavailable;
- never ask the owner whether the canonical Library replacement should be attempted;
- never ask the owner to approve, choose, or confirm a normal Library synchronization action;
- treat a platform-enforced interactive confirmation, rate limit, unavailable connector, or permission boundary as a **tooling/external blocker only**;
- record that tooling blocker precisely and continue all repository/GitHub/CI/Vercel/Supabase and other safe fronts without stopping the execution session;
- retry synchronization on the next safe rescan when the platform permits it;
- keep the local/canonical working copy authoritative for execution continuity while durable Library synchronization remains pending;
- never claim the Library was durably updated unless the mutation result proves it.

A Library-sync blocker MUST NOT become an owner question, a session-stopping condition, or a reason to duplicate memory artifacts.



---
**Governance:** This document is repository-resident operational policy. Changes to it must be intentional, auditable, and committed to GitHub.
