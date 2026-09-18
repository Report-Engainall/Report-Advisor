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

## 3. Head Identity, Candidate Control, and Handoff

Every execution, commit, PR, and report MUST identify the governed repository head before making a state claim.

Required report header, in this exact order:

`Branch:`
`SHA:`
`Role:`
`Base:`
`Certification Candidate: YES/NO`

The governed names are:
- `MAIN HEAD` — `main`; protected production; no direct mutation.
- `UI HEAD` — `ui/*`; Owner 1 product/UI development; never a certification head.
- `INTEGRATION HEAD` — `integration/certification-*`; Owner 2 integration/runtime/certification; the only certification candidate class.

No other branch is a certification head. A developer worktree branch may exist, but it MUST be reported as non-certification and MUST NOT be used as release evidence.

Before every execution that can change or report repository state, run and record:

`git ls-remote origin refs/heads/main refs/heads/ui/<target> refs/heads/integration/certification-<target>`

Then match the resolved remote SHA to the report SHA before proceeding. Local `git rev-parse HEAD` alone is insufficient.

After every integration merge, record all three refs explicitly:

`INTEGRATION HEAD=<full SHA>`
`UI HEAD=<full SHA>`
`MAIN HEAD=<full SHA>`

A handoff MUST end with:

`NEXT HANDOFF`
`Target branch:`
`Expected action:`
`SHA to verify after handoff:`

A UI handoff becomes a new integration candidate only after the change is actually merged into `integration/certification-*`. Runtime and certification proof then applies to the resulting integration SHA only.

No report may use the phrase `CURRENT EXACT HEAD` as a standalone identity. Use `MAIN HEAD`, `UI HEAD`, or `INTEGRATION HEAD` with the full SHA instead.

Evidence from an earlier SHA, a UI branch, or a previous deployment is historical unless the exact current integration SHA is independently reproven. Any code/config/migration/workflow change after a certification candidate creates `NEEDS_REPROOF` for affected gates; prior PASS is never silently retained.

Do not reopen closed checks unless SHA, environment, dependency, contract, or relevant implementation changed.

## 4. Exact-HEAD Evidence

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

## 15. Continuous Execution

After closing a front, immediately rescan for:
- newly exposed failures;
- dependent regressions;
- stale documentation;
- missing evidence;
- production/release blockers;
- product gaps revealed by the fix.

Then execute the next safe front.

The stopping condition is not “one task finished.” The stopping condition is:

**no safe actionable front remains, or an explicit external/owner authorization blocker remains.**

## 16. Owner Escalation Format

When escalation is unavoidable, provide only:
1. exact blocker;
2. why repository-side execution cannot remove it;
3. exact owner action required;
4. what execution will resume automatically afterward.

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

## 18. Default Command

When an owner issues a generic continuation command, execute:

**READ CURRENT MEMORY → VERIFY EXACT HEAD → IDENTIFY LIVE BLOCKERS → EXECUTE ALL SAFE INDEPENDENT FRONTS → TEST → PROVE → DOCUMENT → RESCAN → CONTINUE**

Do not wait for another prompt merely because the previous front closed.

---
**Governance:** This document is repository-resident operational policy. Changes to it must be intentional, auditable, and committed to GitHub.
