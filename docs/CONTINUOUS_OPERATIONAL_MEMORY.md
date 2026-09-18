# REPORT-ADVISOR — CONTINUOUS OPERATIONAL MEMORY

> Canonical operational memory.
> This file is part of the repository control plane. It exists so execution does not depend on the user's memory, the coordinator's conversational memory, or a programmer's pasted report.
>
> Truth rule: repository state + exact GitHub evidence + current environment evidence outrank chat summaries. Chat is a transport surface, not the system of record.

## 0. PURPOSE

This document is the durable handoff between execution cycles.

Every coordinator/programmer cycle MUST:
1. Read this file before deciding what to do.
2. Read the current exact main SHA and relevant PR head SHAs.
3. Compare current state against the last recorded state.
4. Execute all independent actions that are actually available.
5. Record every material state change with exact SHA, environment, action, result and timestamp/provider.
6. Update this file before ending the cycle whenever the state materially changed.
7. Never transfer PASS evidence from a different SHA/environment.
8. Never use this file as a substitute for runtime proof; it is the ledger of what was proven and what remains unproven.

If this file conflicts with a chat message, the newer repository/GitHub evidence wins.

---

# 1. OPERATING CONTRACT

## 1.1 Execution loop
DISCOVER → EXECUTE → VERIFY → RECORD → ADVANCE

The objective is continuous reduction of real closure work, not production of status prose.

## 1.2 No-memory-dependency rule

No person or agent should need to remember:
- the previous conversation;
- the previous pasted programmer report;
- which SHA was tested;
- why a PR was opened;
- which blocker was already diagnosed;
- which audits were already completed;
- what was already ruled out.

Those facts belong here or in linked repository/GitHub evidence.

## 1.3 No-repeat rule

Before repeating a check, compare:
SHA + ENVIRONMENT + INPUT + REQUIRED_GATES + PRIOR_RESULT

Repeat only when one of these materially changed, when a downstream gate newly requires it, or when prior evidence expired.

## 1.4 Exact-head rule

Every status item must identify the exact SHA to which it belongs.

A PR PASS is not a Main PASS.
A local PASS is not a CI PASS.
A contract PASS is not runtime evidence.
A preview deployment is not production proof.

---

# 2. LIVE EXECUTION HEADER

Last material update: 2026-09-18T03:55Z
Current Main: a32fae0fc08c1cbbcc60b6eedfb0f4bd74a21c50
Primary environment: Supabase staging fnqbvfuwbdpwvhcgzksl
Production URL: https://report-advisor.vercel.app
Coordinator branch: governance/coordinator-continuous-execution-20260918
Coordinator PR: #537
Coordinator PR head is verified directly from GitHub for every cycle; do not treat a self-referential stored SHA as authoritative.

### Open implementation fronts

| PR | Front | Exact HEAD | State | Canonical purpose |
|---|---|---|---|---|
| #540 | PDF/document runtime | b7c57d047fbf75e7fadf4167dad7b618c547a1c0 | OPEN / consolidated PDF hardening; exact-head CI in progress | Consolidated PDF parser + Node 22 runtime compatibility + deterministic real-PDF regression |
| #539 | Security-definer/current-main reconciliation | 5f636860eee883037e5c0ae2f4444cd6f753aa36 | OPEN / worker lineage + security hardening; exact-head CI active | Harden current-main SECURITY DEFINER boundaries and retry auth/tenant guards |
| #536 | Import terminal authority | 2ba3251712168ad64b14127b6583d2bc1d0162ac | OPEN / exact-head CI active; security gate depends on #539 | Route terminal import state through existing import_finish_job |
| #534 | Master execution index | 013c4c31f8fe91f789ad13d29cb3ec6741cfc4e4 | OPEN / governance | Rebind index to Main a32fae0 |
| #537 | Coordinator protocol | 4b230b4642dd99396cf7b779d383943d0cfcc9c6 | OPEN / governance | Continuous coordinator execution + this memory contract |

### Superseded fronts

- PR #535 PDF: CLOSED / superseded by #540; implementation carried forward.
- PR #538 security parser: CLOSED / superseded by #539; parser fix carried forward.
- Historical evidence from superseded SHA is not release evidence for current Main.

---

# 3. CURRENTLY PROVEN

## 3.1 PDF front

At exact SHA 18baeaed37ee01bf9b22bf6807af510927eefc73:
- Connected Windows worktree was reset to the exact branch head.
- Real deterministic PDF fixtures exist for structured English/Arabic-digit coverage.
- Production parser compatibility shim for the installed PDF.js runtime is in the actual production adapter.
- The total extraction regression caused by matching total inside Subtotal was identified and fixed.
- Local Structured PDF/OCR behavioral regression: PASS.
- Local npm run typecheck: PASS.
- GitHub exact-head CI remains authoritative for merge/certification.

No historical PDF PASS is transferable to another SHA.

## 3.2 Security front

At live staging, read-only inspection previously verified:
- retry_report_execution_job has authenticated caller/tenant guards in the live definition.
- worker report-execution functions are intended to remain service-role-only.
- repository migration explicitly revokes worker execution from PUBLIC/anon/authenticated and grants service_role for the canonical worker functions.

Open source-lineage gap: repository source for retry_report_execution_job required the same auth/tenant guard discipline. PR #539 addresses this.

## 3.3 Storage

Read-only inventory returned no storage buckets in staging at the last verification.

Therefore:
- REPORT_ADVISOR_STORAGE_BUCKET is NOT inferred.
- No guessed bucket has been created.
- Storage runtime certification remains open/external until the canonical bucket/environment is actually supplied.

## 3.4 Resilience

Phase-F live resilience probes are fail-closed when required operational environment values are missing.

Missing provider/operational inputs are an external blocker, not a code PASS and not a reason to weaken the gate.

---

# 4. ACTIVE-FRONT MATRIX

| Front | Owner | Exact state | Next executable action | Evidence required | Do not repeat |
|---|---|---|---|---|---|
| PDF | Programmer + coordinator | PR #540 head 18baeaed… | Inspect exact-head CI; fix only first real failure | CI regression + typecheck + scoped runtime evidence | Do not rerun old pre-fix failure unless SHA changed |
| Security | Programmer + coordinator | PR #539 head 76f2b5… | Inspect exact-head security/quality results; reconcile first real failure | security-definer contract + source/live parity | Do not copy PASS from older SHA |
| Import terminal authority | Programmer | PR #536 2832faf… | Complete missing exact-head runtime/evidence gates | import_finish_job terminal proof | Do not rebuild runner/RPC |
| Index governance | Coordinator | PR #534 013c4c… | Reconcile stale Main index and preserve provenance | exact Main binding | No blind rewrite of unrelated index history |
| Migration parity | Coordinator + programmer | OPEN | source↔live mapping and disposable replay where executable | authoritative lineage proof | No production mutation for forensics |
| Storage tenant runtime | External + coordinator | BLOCKED/OPEN | obtain canonical bucket + valid runtime credentials | real A/B storage isolation | Do not guess bucket or synthesize proof |
| Phase-F resilience | External + coordinator | BLOCKED EXTERNAL | restore required operational env/secrets | real live probe evidence | Do not convert BLOCKED to PASS |
| Vercel deployment | Provider | EXTERNAL QUOTA | preserve code path; verify when provider permits | exact production deployment | do not bypass provider checks |
| Commercial maturity | Coordinator + programmer | OPEN | advance independent sellability/ops gaps after core gates | functional product evidence | do not build a fake parallel demo |

---

# 5. EXTERNAL BLOCKERS

## Vercel Hobby quota
Observed provider condition: deployment/check activity was rate-limited by the daily deployment quota.

Required handling:
- classify as EXTERNAL INFRASTRUCTURE BLOCKER;
- do not alter application behavior to hide it;
- do not infer production certification from Cloudflare preview;
- retry only when provider state materially changes or a new deployment is required.

## Supabase provider/dashboard actions
Some controls require authenticated provider UI or human-owned operational credentials. Missing access is recorded as external.

Required handling:
- state the exact missing capability;
- continue independent repository/read-only work;
- never invent credentials, JWTs or runtime evidence.

---

# 6. PROGRAMMER HANDOFF — CURRENT

The programmer receives repository truth from this file, not from memory or a pasted chat report.

Immediate programmer priorities:
1. Continue from the current PR HEAD, never from a historical SHA.
2. For each failed/queued exact-head gate, inspect the first actionable failure.
3. Fix the smallest canonical defect only.
4. Run focused regression first.
5. Run affected closure gates.
6. Commit and record the new exact SHA here.
7. Immediately move to the next independent front.

Forbidden shortcuts:
- no fake fixtures representing real runtime proof;
- no fake PASS/evidence/session/JWT;
- no service-role browser sessions;
- no duplicate runner/RPC architecture;
- no migration-history rewriting;
- no weakening a failing gate;
- no cross-SHA evidence transfer;
- no waiting on one blocked front while independent work remains.

---

# 7. COORDINATOR HANDOFF — CURRENT

The coordinator owns:
- GitHub governance and exact-head binding;
- PR/issue synchronization;
- check/workflow verification;
- source↔live read-only database forensics;
- evidence freshness control;
- blocker classification;
- release-boundary truth;
- operational-memory maintenance;
- independent repository/documentation work;
- commercial maturity backlog control.

The coordinator must update this memory after every material coordinator-side change.

---

# 8. EVIDENCE LEDGER RULE

Every material result recorded here must have the form:
[DATE/TIME] [SHA] [ENV] [ACTION] [RESULT] [PROVIDER/ARTIFACT]

A result without an exact SHA/environment is an observation, not certification evidence.

---

# 9. DECISION LEDGER — LONG-LIVED

These decisions survive conversation/session boundaries unless a newer exact-head decision explicitly supersedes them:
- Main remains the release authority.
- Current Main at this snapshot is a32fae0fc08c1cbbcc60b6eedfb0f4bd74a21c50.
- PDF uses the existing file-engine architecture; no duplicate parser path.
- PDF.js runtime compatibility belongs in the production adapter, not test-only code.
- OCR thresholds are <50 reject, 50–74 review, >=75 trusted.
- OCR confidence is never upgraded by structured extraction.
- Tenant currency is YER.
- Deterministic metric math remains authoritative; local AI is assistive.
- Raw documents are not sent to local AI.
- import_finish_job is authoritative for terminal import completion.
- Existing canonical RPCs/runners are reused; no duplicate architecture for test satisfaction.
- Production/forensic DB mutation is prohibited unless separately authorized as an operational action.
- Evidence must remain fail-closed and exact-head bound.

---

# 10. NO-REPEAT INDEX

Do not repeat at unchanged SHA/environment:
- completed PDF fixture construction;
- the pre-fix Subtotal false-match diagnosis;
- the historical PDF Node-22 failure at pre-fix SHAs;
- storage bucket guessing/search loops that already found no canonical bucket name;
- repeated live mutation attempts for security/storage/resilience forensics;
- unchanged closed PR fronts (#535/#538);
- historical PASS evidence from prior security/PDF candidates.

Repeat only after:
- exact SHA changes;
- environment/provider state changes;
- required downstream gate changes;
- evidence expires or becomes invalid by protocol.

---

# 11. EXECUTION QUEUE

### NOW
- inspect exact-head CI state for #540 and #539;
- inspect first actionable failures only;
- maintain this memory with the resulting state;
- keep #534/#536/#537 governance fronts moving without duplicate audits.

### NEXT
- source↔live migration lineage proof;
- worker/report runtime evidence where environment permits;
- tenant A/B adversarial runtime closure;
- watched-folder and resilience evidence;
- performance/observability evidence.

### LATER, AFTER CORE/RC
- commercial maturity;
- onboarding and buyer-facing demo hardening;
- Upwork Job-Fit / Proposal Demo Mode;
- operational runbooks and customer delivery packaging.

---

# 12. CYCLE CLOSURE CHECKLIST

Before ending any execution cycle, the coordinator/programmer must answer from repository evidence:
- [ ] What changed?
- [ ] Exact SHA?
- [ ] What was actually verified?
- [ ] What remains OPEN?
- [ ] What is BLOCKED externally?
- [ ] What independent action was advanced?
- [ ] Which old evidence is now invalid?
- [ ] What is the next executable action?
- [ ] Was this file updated if material state changed?

A cycle that changes code/evidence but does not update this memory is operationally incomplete.

---

# 13. HANDOFF PRINCIPLE

The next agent/session must be able to start with:

READ MEMORY → VERIFY CURRENT HEAD → EXECUTE NEXT QUEUE ITEM

without asking the user to reconstruct project history.

**The repository must remember the work.**


---

# 14. COORDINATOR CYCLE LOG

### 2026-09-18T03:02Z — Durable memory upgrade
- Added this operational-memory document to the coordinator branch.
- Bound the coordinator protocol to mandatory memory read/update behavior.
- Bound the master execution protocol to the same restartable execution-state requirement.
- No application, database, production alias, or runtime semantics were changed by this cycle.
- New coordinator branch HEAD: 32f4386fbe3270ab948aacbf009418e08aea54b4.
- Next action: inspect exact-head CI for implementation fronts and advance the first actionable independent failure without repeating closed audits.


### 2026-09-18T03:08Z — Certification-binding reconciliation
- Exact-head certification failure on prior #539 head 76f2b5c was traced to stale Master Index binding 684d57c; coordinator rebound the index and produced #539 head f24ddd623d9d0a72c0c3b3d0bd6724bd6dcb6c5b.
- The same stale-index pattern was found on #540 and #536 and corrected without changing application/runtime behavior: #540 -> a378f55ba7e845a7c5f672ca276e36099de8bee0; #536 -> 2ba3251712168ad64b14127b6583d2bc1d0162ac.
- Persistent PR comments record these coordinator-owned fixes so the programmer does not duplicate them.
- Prior #539 exact-head results showed security-definer exposure, quality and many contract fronts passing; certification boundary, enforcement, browser/runtime and external resilience/storage remained unresolved on that superseded head and are not transferred to the new head.
- Next executable action: use the new exact heads only, inspect newly completed failures, and advance independent read-only/evidence/governance fronts without repeating superseded audits.


### 2026-09-18T03:14Z — Structured memory upgrade
- Added machine-readable companion docs/CONTINUOUS_OPERATIONAL_STATE.json.
- Updated coordinator and master execution protocols so agents must read both memory files and reconcile them when they disagree.
- No product/runtime/database semantics changed.
- Current coordinator PR head: c7930917aa461f7bba50867f84ad8bbae27d5e98.
- Next action remains exact-head verification on implementation PRs plus independent lineage/evidence work; no historical result is promoted.


### 2026-09-18T03:18Z — Stable self-reference rule
- Coordinator branch head is no longer stored as a self-referential value that would become stale when this file changes.
- GitHub branch/PR metadata is authoritative for the coordinator branch head.
- Exact implementation PR SHAs remain explicitly stored because they are release/evidence boundaries.


### 2026-09-18T03:32Z — PDF consolidation + duplicate-front closure
- PR #541 was audited against Main and #540. Its 32-commit branch contained PDF hardening plus unrelated security migrations and import/browser changes.
- PDF-only commits after the common ancestor were selectively integrated into #540; security migrations and unrelated import/browser changes were deliberately excluded.
- Consolidated #540 exact head: b7c57d047fbf75e7fadf4167dad7b618c547a1c0.
- Main comparison for #540 contains only the intended PDF/runtime files plus the Master Execution Index and deterministic PDF fixtures; no #539 security migration was transferred.
- Local connected-worktree proof on the consolidated branch:
  - npm run test:file-engine-regressions = PASS
  - node --experimental-strip-types scripts/check-pdf-structured-regression.ts = PASS
  - npm run typecheck = PASS
- #541 was closed as duplicate/superseded. Future PDF work continues only on #540.
- #536 exact-head security-definer exposure failure was inspected and classified as a dependency on the unresolved current-Main security reconciliation in #539, not an import defect. No duplicated security implementation added to #536.
- #539 candidate label was corrected to the checker-recognized "Current code/test candidate"; exact new head is 89507eaaf68ca227816920bf09d2c0093ec0f7e4. Fresh CI is queued; no old #539 result is promoted.
- Issue #399 remains OPEN: live staging has later security-definer migration history not represented by current Main names; forward-only source reconciliation exists on #539, while disposable replay is still required for closure.

### 2026-09-18T03:45Z — Security parser/TOCTOU closure step
- Exact #539 source was locally reproduced against `check-decision-approval-lock-order.mjs`; the failure was caused by case-sensitive token parsing of SQL keywords/references, not by missing transactional locks.
- The exact security migration retains decision row `FOR UPDATE` before approval lookup and explicit authenticated tenant binding.
- Coordinator corrected the checker parser to perform case-insensitive token indexing and added a regression assertion; exact local `lock-order` and `security-definer exposure` contracts now PASS.
- #539 exact head is now `900c009a8a37b2cc354aa8e9f94d5893c9016be8`; fresh GitHub workflows have not started yet. Earlier CI failures tied to other refs/merge refs are not evidence for this head.
- #536 remains dependent on security reconciliation for the repository-wide security-definer gate; no duplicate security implementation was added to import front.

### 2026-09-18T03:55Z — Worker lineage reconciliation completed in source
- Added forward-only current-Main migration `20260918035000_reconcile_report_execution_worker_search_path_completion_current_main.sql` to #539.
- This records safe `search_path = public, pg_catalog` for enqueue/advance/recover worker functions already verified in Staging; it does not fabricate or recreate missing historical migration history.
- Rebound #539 Master Execution Index candidate to the code head before its governance-only index commit.
- Exact latest #539 head: `5f636860eee883037e5c0ae2f4444cd6f753aa36`.
- Local exact-head contracts: decision approval lock order PASS; security-definer exposure PASS; certification boundary PASS.
- Fresh GitHub CI is active for #539 `5f636860...`; earlier runs on 76f2/f24/895/900 are historical and must not be used as current-head evidence.
