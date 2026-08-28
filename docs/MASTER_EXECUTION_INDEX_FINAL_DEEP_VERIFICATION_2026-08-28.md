# Report-Advisor — Final Deep Verification Execution Index

## Certification rule
`CODE → TEST → CI → RUNTIME → LIVE → PRODUCTION` are independent evidence layers. No completion percentage is a certification.

## Exact verification point
- Branch: `runtime-evidence/p0-2a-readiness`
- Base: `137facaf513652dd9ec38fc2db03d734dd8c7313`
- Current HEAD: `417a48c4223155f1f3846b672ab9090a59662648`
- PR: `#69`
- Exact-HEAD CI: `PENDING — no PASS claimed`
- `c71b95...` PASS is historical only; it does not certify the current SHA.

## P0 status
| Requirement | Implementation | CI | Runtime | Live | Production | Status |
|---|---|---|---|---|---|---|
| P0-2A Runtime Evidence Infrastructure | IMPLEMENTED | PENDING | NOT RUN | NOT RUN | NO | GATED |
| P0-2 Tenant A/B isolation | FULL fail-closed executor implemented | PENDING | NOT RUN | BLOCKED — no safe staging DB | NO | BLOCKED |
| P0-1 Authenticated browser runtime | Contract/test preparation | PENDING | NOT RUN | BLOCKED — no authenticated browser runtime | NO | BLOCKED |

## Findings ledger

### F1 — harness operational-error false-green risk
FOUND → runtime query errors could be confused with zero rows → FIXED by classifying operational errors as `NOT VERIFIED` and non-zero exit → regression in self-validation → CI proof is still required on current SHA → FIXED / current CI pending.

### F2 — tenant matrix drift
FOUND → hand-maintained matrix diverged from canonical SQL → FIXED by canonical table/child discovery and repository RPC discovery → regression compares matrix to schema/function surface → FIXED / current CI pending.

### F3 — self-validation syntax failure
FOUND in historical run `33129898899` → malformed JS loop → FIXED → Node/lint regression → historical CI passed after correction → FIXED.

### F4 — document-intelligence CI import failure
FOUND in historical run `33129898899` (`ModuleNotFoundError: app`) → Python import path boundary → FIXED in workflow → regression remains CI → FIXED historically.

### F5 — privileged seed scanner classification
FOUND in historical run `33128334365` → guarded seed was misclassified as application tenant consumer → FIXED classification/guard → regression → FIXED historically.

### F6 — Master Index assertion mismatch
FOUND → validator expected stale wording → FIXED to explicit status vocabulary → self-validation regression → FIXED.

### F7 — tenant membership ambiguity in seed
FOUND → seed assumed exclusivity → FIXED with `assertTenantExclusivity()` before data creation → live membership proof still requires staging → FIXED / runtime pending.

### F8 — Bolt/starter identity artifacts
FOUND → bootstrap artifacts/identity remained → current branch removes `.bolt` and old starter identity from production tree → regression guard is part of repository checks → current CI pending → FIXED / verification pending.

### F9 — lockfile identity drift
FOUND → `package.json=report-advisor@1.0.0` versus old lock root identity → FIXED through controlled `npm install --package-lock-only --ignore-scripts` regeneration, not hand edit → current lock root matches package identity → `npm ci`, typecheck, lint and build must still be proven on current SHA → FIXED / CI pending.

### F10 — P0-2 runtime coverage gap
FOUND → previous harness was primarily foreign-tenant SELECT probing → FIXED by adding `scripts/p0-2-runtime-executor.mjs` with authenticated A/B actors, own/foreign SELECT, explicit INSERT/UPDATE/DELETE fixtures, child-table inclusion, evidence binding and fail-closed mutation requirements → live execution remains blocked by staging → NOT LIVE-VERIFIED.

### F11 — mutation executor safety gap
FOUND during owner-level implementation review → generic mutation executor could leave side effects → FIXED by requiring deterministic `own`, `foreign`, and `restore` fixture data and cleanup/restore after successful mutations → if cleanup/restore fails executor returns `NOT VERIFIED` and non-zero → current CI pending.

### F12 — tenant-root query semantic gap
FOUND during executor review → treating `companies` like ordinary `company_id` tenant-owned rows would create a false executor failure → FIXED with explicit tenant-root `id` semantics; all other canonical tenant-owned surfaces retain explicit `company_id` → current CI pending.

## P0-2 runtime executor
`p0-2-runtime-executor.mjs` is intentionally fail-closed. It requires:
- safe non-production environment
- Supabase URL/anon key
- dedicated User A/User B credentials
- expected authenticated user IDs
- distinct Tenant A/Tenant B IDs
- release and commit SHA
- deterministic mutation fixtures for INSERT/UPDATE/DELETE

It executes own and foreign SELECT probes across the canonical table surface and checks that all declared child tables remain in the executor. Mutation fixtures are operation-specific and must include restore/cleanup information. Cross-tenant mutation success is `FAIL`; missing runtime context is `NOT VERIFIED` and non-zero.

`INFERENCE_SURFACES` are deliberately not auto-certified by row probes. COUNT/SUM/AVG/search/autocomplete/dashboard/report/forecast/recommendation/decision outputs require application-specific measured executors before they can become `PASS`.

## Runtime evidence contract
Each runtime record must bind:
`TEST_ID, ENVIRONMENT, RELEASE, COMMIT_SHA, TIMESTAMP, ACTOR, AUTHORIZED_TENANT, TARGET_TENANT, SURFACE, OPERATION, INPUT, EXPECTED, ACTUAL, ROWS_RETURNED, ROWS_AFFECTED, ERROR_CODE, RESULT, EVIDENCE_REFERENCE`.

Runtime result values are only `PASS | FAIL | NOT VERIFIED`. Workflow states such as `NOT RUN | BLOCKED | PLANNED` are not evidence results.

## Fail-closed rules
- production / PROD / unknown / empty environment → ABORT
- missing actor, tenant, release, commit or critical evidence → NOT VERIFIED
- incomplete/forged PASS → rejected
- runtime operational error → NOT VERIFIED + non-zero exit
- cross-tenant leak → FAIL + non-zero exit
- destructive seed without safe environment → ABORT
- ambiguous tenant membership → ABORT
- real secrets must never enter evidence; test-only secret values must be redacted

## Required P0 runtime surfaces
### Database
`SELECT | INSERT | UPDATE | DELETE` across `A→A | A→B | B→B | B→A`, with parent and child coverage.

Child tables explicitly required:
`sale_items | purchase_items | import_rows | import_job_rows`.

### RPC
Only repository-classified `APPLICATION RPC` belongs in application trust-boundary runtime execution. Internal, trigger, utility and unknown functions are not silently treated as public APIs.

### Inference
`COUNT | SUM | AVG | SEARCH | FILTER | SORT | AUTOCOMPLETE | DASHBOARD | REPORT | FORECAST | RECOMMENDATION | DECISION` require measured application-level runtime evidence.

### Storage
`upload | download | listing | metadata | signed URL | path manipulation | foreign-object access` remain blocked until staging runtime.

### Realtime
A subscriber must receive own-tenant events and zero foreign-tenant events in both directions.

### Workers/Queues
Tenant context must survive enqueue → worker → DB/storage → retry/recovery.

### Import/Export
Tenant ownership, business key, duplicate, partial failure, rollback/recovery and cross-tenant attack must be runtime-evidenced.

### Document Intelligence
`upload → processing → extraction → persistence → tenant ownership → retrieval` requires real staging execution; contract tests are not live proof.

## Repository identity
Current tree must be Report-Advisor-first-party. `.bolt` is absent from the current branch tree. Git history remains preserved. Any remaining starter/Bolt references must be classified as intentional/test/documentation/historical or treated as a finding.

## Compatibility boundary
`src/lib/queries-compat.ts` remains intentional compatibility infrastructure because it has real consumers. Removal requires consumer inventory, canonical migration, and regression proof. It must not become an alternate business-truth authority.

## Tenant authority
Client-selected `tenant_id/company_id/organization_id/workspace_id` is not authorization authority. Authorization must derive from authenticated/server-side context. Any exception requires explicit proof.

## Production boundary
`PRODUCTION-CERTIFIED = NO`.
P0-2 remains blocked without dedicated authenticated staging/test DB.
P0-1 remains blocked without authenticated browser runtime.
No P0-3 transition is authorized by this index.

## Remaining blockers
1. Exact-HEAD CI for `417a48c4223155f1f3846b672ab9090a59662648`.
2. Dedicated safe authenticated Supabase staging/test environment and deterministic mutation fixtures.
3. Live DB, child-table, RPC and inference evidence.
4. Storage, Realtime, worker/queue, import/export and document-intelligence runtime evidence.
5. Authenticated browser runtime for P0-1.
6. Backup/restore, deployment, canary, rollback and recovery evidence before production certification.
