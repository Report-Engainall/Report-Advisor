# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-14

### CURRENT EXACT HEAD

- **Repository:** `Report-Engainall/Report-Advisor`
- **Protected main:** `999f93e91f657357d849f15a87a001cb389d8ff5` — MUST NOT be mutated.
- **PR candidate:** `#467`
- **Current code/test candidate:** `8f862951f602e7d625880eee714b9167ed3dffe9`
- **Exact tested candidate:** `8f862951f602e7d625880eee714b9167ed3dffe9`
- **Indexed authority:** `8f862951f602e7d625880eee714b9167ed3dffe9`
- **Rule:** indexed authority and tested candidate are exact-match bound; no historical PASS transfer is permitted.
- **Governance rebind:** this index update is governance-only on PR #467; it does not alter production/runtime code and does not promote historical evidence.

### GOVERNANCE / CERTIFICATION RULES

- GitHub is the source of truth.
- No production/main mutation without evidence.
- No historical PASS transfer across Exact HEADs.
- No fake fixtures, sessions, JWTs, role bypasses, or fabricated evidence.
- Fail closed on missing or stale evidence.
- Do not weaken assertions or bypass gates to obtain PASS.
- Production Closure must execute through its official repository-native route. If only `workflow_dispatch` exists and no official dispatch mechanism is available, do not fabricate a run or substitute another workflow.
- Final Certification requires the complete chain on the same exact authority: Authority → Execution Enforcement → Scenario Matrix → Execution Contract → Regression Baseline → Production Closure → Release Decision → Final Closure → Final Certification.
- Protected `main` remains untouched.
- `docs/MASTER_EXECUTION_INDEX.md` is the governance ledger and must preserve audit history, evidence history, and prior candidate records. Historical references are retained as history, never as current authority.

## CURRENT CERTIFICATION STATUS

- Exact candidate: `8f862951f602e7d625880eee714b9167ed3dffe9`
- Browser Product E2E: PASS on exact candidate.
- Real Business Persistence E2E: PASS on exact candidate.
- Golden Evidence: PASS on exact candidate.
- Golden Score: PASS on exact candidate.
- OCR Confidence: PASS on exact candidate.
- Canonical Truth / Aggregation: PASS on exact candidate.
- Build: PASS on exact candidate.
- Execution Enforcement: pending fresh rerun after authority rebind.
- Certification Enforcement: pending fresh rerun after authority rebind.
- Production Closure: NOT YET EXECUTED; official workflow route is `workflow_dispatch` only.
- Release Decision: pending Production Closure.
- Final Closure: pending Production Closure and Release Decision.
- Final Certification: NOT CERTIFIED.

## DEEP AUDIT — 2026-09-07

The following historical audit baseline remains preserved. Historical PASS/FAIL records remain attached to their original exact SHAs and are not promoted to the current authority.

### Database / Security Baseline

- Tenant isolation and RLS remain mandatory.
- Authenticated access must resolve an active `current_company_id` through real memberships.
- Cross-tenant access must fail closed.
- Role and permission boundaries must be enforced server-side and client-side without trusting UI state.
- Upload and import paths must validate input and preserve evidence provenance.

### P0 Authenticated E2E / Tenant A-B

- Historical authenticated runtime E2E established real Auth A/B login, company membership resolution, and cross-tenant membership isolation.
- These records remain historical and are not treated as current exact-head certification evidence unless a current gate explicitly reruns them.

### P1 Migration / Schema Parity

- Migration/schema parity remains a release requirement.
- Runtime must use migrations and RPCs actually present in the candidate branch.
- No invented RPC or hidden schema dependency is permitted.

### Worker / Reliability

- Durable production execution is the existing implementation in `src/lib/report-execution/durable-production-runner.ts` plus `production-coordinator-bridge.ts`.
- Do not create a second execution engine.
- Lifecycle contract:
  `queued → fingerprinted → extracted → canonicalized → validated → analyzed → decisioned → committed → rendered`.
- `committed` is only valid after the real database transaction succeeds atomically. Any failure must prevent the committed checkpoint and roll back the transaction.

### OCR / Document Intelligence

- Evidence-first document flow remains:
  `Document → Extraction → Normalization → Validation → Evidence → Confidence → Canonical Data → DB → KPI → Report`.
- Arabic OCR and confidence thresholds are governed by the existing corpus/contracts.
- Raw source retention must follow the product contract; prohibited raw retention is not to be introduced.

### Import / Reconciliation

- SHA-256 fingerprinting, duplicate detection, resumability, import jobs, checkpoints, business keys, synonyms, evidence provenance, and tenant isolation remain required.
- Canonical import must use the existing governed path and existing RPC/contracts.

### Watched Folder

- Watched-folder behavior must remain governed by the existing import/execution contracts and must not bypass evidence or tenant controls.

### Decision / Evidence / Outcomes

- Recommendations require evidence provenance.
- Work items must not close without a real outcome.
- Terminal guards must prevent invalid state transitions.

### Observability / Failure Injection

- Failures must be classifiable and observable without leaking secrets or fabricating success.
- Failure-injection and recovery tests remain governed by existing contracts.

### Performance / Scale

- Correctness and evidence take priority over optimization.
- Investigate unnecessary queries, N+1 access, oversized payloads, duplicate API calls, excessive renders, blocking work, import memory use, retries, concurrency, and race conditions without weakening correctness.

### Recovery / Backup / Restore / Rollback

- Recovery procedures must preserve tenant isolation and evidence integrity.
- Transactional imports must roll back on partial failure.

### CI / Execution Infrastructure

- CI gates are fail-closed.
- Do not replace official workflows with shortcuts.
- Targeted reruns are preferred after a change; do not rerun unaffected green gates without a dependency or regression reason.

## ACTIVE EXECUTION FRONTS

1. Authority rebind to exact candidate `8f862951f602e7d625880eee714b9167ed3dffe9`.
2. Targeted Execution Enforcement / Certification Enforcement rerun after rebind.
3. Production Closure preparation and official execution when repository-native dispatch is available.
4. Release Decision / Final Closure / Final Certification only after their true dependencies pass on the applicable exact authority.
5. Repository-wide product completion sweep continues independently where changes are safe and do not invalidate certification evidence unnecessarily.

## CURRENT PR / REVIEW STATE

- PR: `#467`
- Head at rebind start: `8f862951f602e7d625880eee714b9167ed3dffe9`
- Base: `fix/financial-readback-calculated-contract`
- Protected main remains `999f93e91f657357d849f15a87a001cb389d8ff5`.
- PR remains the only mutation vehicle for this work.

## REAL RELEASE ASSESSMENT

The product has substantial real-business proof on the current candidate, including browser/persistence execution and canonical/evidence contracts. However, certification is intentionally blocked until the official Production Closure chain and its dependent release gates are truly executed and pass. A green sub-gate does not authorize a final certification claim.

## HONEST COMPLETION SCORE

- Runtime/product E2E: green on current candidate for the currently executed exact-head scenarios.
- Governance/certification: incomplete pending fresh enforcement and official production closure.
- Product completeness: requires repository-wide review of all remaining commercial-grade requirements; no unsupported completion claim is made.

## RELEASE DECISION

**NOT CERTIFIED.**

Reason: exact-head authority was rebound to `8f862951f602e7d625880eee714b9167ed3dffe9`, but Production Closure has not yet been executed through its official `workflow_dispatch` route, and downstream Release Decision / Final Closure / Final Certification therefore remain pending.

## GOVERNANCE LOG — 2026-09-14 — PR #467 EXACT-HEAD AUTHORITY REBIND

- Previous indexed candidate: `5c53fe3fc5ef1c0d9d1643583589a4d642d49d2d`.
- Exact candidate for this rebind: `8f862951f602e7d625880eee714b9167ed3dffe9`.
- The current candidate contains the diagnostic repair and current exact-head product evidence. No historical PASS is promoted by this entry.
- The authority boundary is now explicitly bound to `8f862951f602e7d625880eee714b9167ed3dffe9`.
- Protected main remains untouched.
- Production Closure remains NOT EXECUTED because the official workflow exposes only `workflow_dispatch` and no official dispatch mechanism is available in the current execution interface.
- Final Certification remains NOT CERTIFIED until the official closure chain is actually executed and all dependent gates pass on the exact applicable authority.

## HISTORICAL GOVERNANCE RECORDS

The following historical candidate references are retained as audit history only. They MUST NOT be interpreted as current authority or as transferable PASS evidence:

- `5c53fe3fc5ef1c0d9d1643583589a4d642d49d2d` — prior authority before this rebind.
- `a2b94a2b7ff951567c83b056ded1bb5a7431a9c9` — earlier candidate.
- `b292acf217d0452d2edcb241a771d4576c3809e9` — earlier exact candidate during authority investigation.
- `daffa5fbfa156b82cbf9fe3814ae9d5cfed8ab96` — diagnostic selector repair.
- `adb1893df337d5d323cdf0d597a6203b3aaac1e1` — diagnostic selector robustness repair.
- `999f93e91f657357d849f15a87a001cb389d8ff5` — protected main authority; never mutate.

## FINAL NON-NEGOTIABLES

- No main mutation.
- No fake evidence.
- No historical PASS transfer.
- No fake sessions/JWTs.
- No RLS/Auth bypass.
- No weakened assertions.
- No fake Production Closure.
- No duplicate execution engine.
- No invented RPCs.
- No deletion of evidence to hide failures.
- No Certification announcement before official Production Closure and all dependent gates pass.
