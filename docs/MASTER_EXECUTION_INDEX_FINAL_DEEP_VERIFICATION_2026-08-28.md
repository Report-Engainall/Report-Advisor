# Report-Advisor — Final Deep Verification Execution Index

## Certification rule
`CODE → TEST → CI → RUNTIME → LIVE → PRODUCTION` are independent evidence layers. No completion percentage is a certification.

## Exact verification point
- Branch: `runtime-evidence/p0-2a-readiness`
- Base: `137facaf513652dd9ec38fc2db03d734dd8c7313`
- Current HEAD (code state at index generation): `3b1ef098cfdb279f0d8b754df3268a50cf5c05ee`
- PR: `#69`
- Exact-HEAD CI: `PENDING — current HEAD has not yet completed its exact-head Quality run.`
- All prior SHA/Run results remain historical and do not certify this HEAD.

## P0 status
| Requirement | Implementation | CI | Runtime | Live | Production | Status |
|---|---|---|---|---|---|---|
| P0-2A Runtime Evidence Infrastructure | IMPLEMENTED | NOT VERIFIED | NOT RUN | NOT RUN | NO | GATED |
| P0-2 Tenant A/B isolation | FULL fail-closed executor implemented | NOT VERIFIED | NOT RUN | BLOCKED — no safe staging DB | NO | BLOCKED |
| P0-1 Authenticated browser runtime | Contract/test preparation | NOT VERIFIED | NOT RUN | BLOCKED — no authenticated browser runtime | NO | BLOCKED |
| P0-3 | NOT STARTED | NOT RUN | NOT RUN | NOT RUN | NO | NOT STARTED |

## Findings ledger

### F1 — harness operational-error false-green risk
FOUND → runtime query errors could be confused with zero rows → FIXED by classifying operational errors as `NOT VERIFIED` and non-zero exit → regression in self-validation → current-head CI proof remains required.

### F2 — tenant matrix drift
FOUND → hand-maintained matrix diverged from canonical SQL → FIXED by canonical table/child discovery and repository RPC discovery → regression compares matrix to schema/function surface → current-head CI proof remains required.

### F3 — self-validation syntax failure
FOUND in historical run `33129898899` → malformed JS loop → FIXED → Node/lint regression → historical CI passed after correction → FIXED.

### F4 — document-intelligence CI import failure
FOUND in historical run `33129898899` (`ModuleNotFoundError: app`) → Python import path boundary → FIXED in workflow → FIXED historically; current-head regression remains part of Quality.

### F5 — privileged seed scanner classification
FOUND in historical run `33128334365` → guarded seed was misclassified as application tenant consumer → FIXED classification/guard → regression → FIXED historically.

### F6 — Master Index assertion mismatch
FOUND → validator expected stale wording → FIXED to explicit status vocabulary → later exact-head iteration exposed a second stale-head assertion, recorded as F18 below.

### F7 — tenant membership ambiguity in seed
FOUND → seed assumed exclusivity → FIXED with `assertTenantExclusivity()` before data creation → live membership proof still requires staging → FIXED / runtime pending.

### F8 — Bolt/starter identity artifacts
FOUND → bootstrap artifacts/identity remained → current branch removes `.bolt` and old starter identity from production tree → regression guard is part of repository checks → current verification remains required.

### F9 — lockfile identity drift
FOUND → `package.json=report-advisor@1.0.0` versus old lock root identity → FIXED through controlled lockfile regeneration → prior exact-head Quality proved `npm ci` on `86b82dc...`; this is historical and does not certify the current SHA.

### F10 — P0-2 runtime coverage gap
FOUND → previous harness was primarily foreign-tenant SELECT probing → FIXED by adding `scripts/p0-2-runtime-executor.mjs` with authenticated A/B actors, own/foreign SELECT, explicit INSERT/UPDATE/DELETE fixtures, child-table inclusion, evidence binding and fail-closed mutation requirements → live execution remains blocked by staging → NOT LIVE-VERIFIED.

### F11 — mutation executor identity/safety gap
FOUND during owner-level implementation review → generic mutation executor could snapshot one record and mutate/observe another → FIXED by canonical immutable mutation identity state plus target/response assertions; UPDATE/DELETE zero-row own-tenant mutations fail closed; successful INSERT/UPDATE/DELETE paths require observable mutation state and verified restore/cleanup. Adversarial A→B identity divergence is rejected. CI verification is required on the current SHA.

### F12 — tenant-root query semantic gap
FOUND → treating `companies` like ordinary `company_id` tenant-owned rows would create a false executor failure → FIXED with explicit tenant-root `id` semantics; other canonical tenant-owned surfaces retain `company_id` → current-head CI verification required.

### F13 — child-table runtime coverage completeness
FOUND → child tables were present in the matrix but mutation fixture completeness was not enforced → FIXED by requiring deterministic INSERT/UPDATE/DELETE fixtures for `sale_items`, `purchase_items`, `import_rows`, and `import_job_rows` → dynamic missing/duplicate/invalid/completion regressions are present → runtime remains blocked without staging.

### F14 — cross-tenant denial semantics
FOUND → `0 rows` alone cannot establish why access was denied → FIXED by recording `DENIAL_CLASS` and distinguishing known-target `RLS_FILTERED` from `UNRESOLVED_ZERO_ROWS` and database/authorization errors → current-head runtime proof still required.

### F15 — CI checkout was not exact PR HEAD
FOUND → quality workflow used default pull-request checkout semantics → FIXED by explicitly checking out `github.event.pull_request.head.sha` and asserting checked-out SHA equals PR head → current topology also covers branch pushes.

### F16 — self-validation regex escaping defect
FOUND on exact source inspection at `e90db391bc48a96678d47b6eb7975d6014147060` → FIXED in `fbc48544570ade89b98e6ca70fec43d64e0a930c` → regression remains part of exact-head self-validation.

### F17 — branch push execution gap
FOUND → branch HEADs previously did not reliably receive Quality execution → FIXED at topology level with protected branch push trigger and exact-head enforcer. Exact-head execution must be observed on the current SHA before CI certification.

### F18 — stale Master Index assertion
FOUND in exact-head Quality run `33133750057` at self-validation line 144 → validator required stale wording while the synchronized index used the canonical `P0-2 Tenant A/B isolation` row → ROOT CAUSE: assertion coupled to stale prose. FIX: generalized self-validation to semantic status matching instead of stale exact wording. The index is synchronized to the new exact-head state.

## P0-2 runtime executor
`p0-2-runtime-executor.mjs` is intentionally fail-closed. It requires:
- safe non-production environment
- Supabase URL/anon key
- dedicated User A/User B credentials
- expected authenticated user IDs
- distinct Tenant A/Tenant B IDs
- release and commit SHA
- deterministic mutation fixtures for INSERT/UPDATE/DELETE

The executor carries one immutable canonical mutation target identity through each mutation cycle. For own-tenant mutations the identity is derived once from the fixture and must agree with `own.id` and `restore.id`; subsequent snapshot, response, observation, restore and comparison assertions cannot silently adopt another identity. Cross-tenant attack paths fail closed if an unauthorized mutation is observed or cannot be safely restored.

`INFERENCE_SURFACES` are deliberately not auto-certified by row probes. COUNT/SUM/AVG/search/autocomplete/dashboard/report/forecast/recommendation/decision outputs require application-specific measured executors before they can become `PASS`.

## Runtime evidence contract
Each runtime record must bind:
`TEST_ID, ENVIRONMENT, RELEASE, COMMIT_SHA, TIMESTAMP, ACTOR, AUTHORIZED_TENANT, TARGET_TENANT, SURFACE, OPERATION, INPUT, EXPECTED, ACTUAL, ROWS_RETURNED, ROWS_AFFECTED, ERROR_CODE, DENIAL_CLASS, RESULT, EVIDENCE_REFERENCE`.

Runtime result values are only `PASS | FAIL | NOT VERIFIED`. Workflow states such as `NOT RUN | BLOCKED | PLANNED | QUEUED` are not evidence results.

## Fail-closed rules
- production / PROD / unknown / empty environment → ABORT
- missing actor, tenant, release, commit or critical evidence → NOT VERIFIED
- incomplete/forged PASS → rejected
- runtime operational error → NOT VERIFIED + non-zero exit
- cross-tenant leak → FAIL + non-zero exit
- cross-tenant zero-row result with unknown target existence → `UNRESOLVED_ZERO_ROWS`, not automatic RLS proof
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
1. Exact-head Quality for `3b1ef098cfdb279f0d8b754df3268a50cf5c05ee`.
2. Dedicated safe authenticated Supabase staging/test environment and deterministic mutation fixtures.
3. Live DB, child-table, RPC and inference evidence.
4. Storage, Realtime, worker/queue, import/export and document-intelligence runtime evidence.
5. Authenticated browser runtime for P0-1.
6. Backup/restore, deployment, canary, rollback and recovery evidence before production certification.
