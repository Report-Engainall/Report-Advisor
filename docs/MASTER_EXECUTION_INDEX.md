# Report Advisor — Master Execution & Truth Index

## CURRENT RESUME EXECUTION MAP — 2026-09-03 — v4.23 / OWNER-LAST-MILE EXECUTION MATRIX

> This file is the authoritative current execution index. Historical execution records remain preserved in Git history and dated execution/evidence documents. No evidence crosses an exact-SHA boundary.
>
> **Operating objective:** minimize owner/device work. The assistant must execute every repository, database, security, contract, evidence-preparation, CI, and code task that is executable through connected tooling before requesting any owner action. Owner/device work is reserved only for operations that inherently require the owner's credentials, real interactive authentication, protected production/recovery control-plane access, or an unavailable external control-plane setting.

### CURRENT PROJECT STATE
- Repository: `Report-Engainall/Report-Advisor`.
- Latest repository code/test synchronization commit: `5dbf20f4f376896a58f9e8110b9fc813b5069967` (SECURITY DEFINER relation qualification under locked `pg_catalog` search path).
- Current repository head may advance through governed index-only synchronization commits; the current code/test head is `5dbf20f4f376896a58f9e8110b9fc813b5069967` until a later real code/test mutation.
- Current exact code/test candidate: `5dbf20f4f376896a58f9e8110b9fc813b5069967`.
- Proven defect: five SECURITY DEFINER trust/governance helpers used `SET search_path TO 'pg_catalog'` while referencing application relations without schema qualification, producing runtime `42P01 relation-not-found` failures under the locked search path.
- Closed by adding `public.` qualification to every application relation in the affected five helpers while preserving the locked `pg_catalog` search path and existing tenant/trust predicates.
- Fresh exact-head CI on repository/index synchronization head `3bed44d8ca8a2da76bba8ccec16010cf6c3869a1` is consumed: Quality, Final Execution, Enforcement, Storage Tenant Isolation all PASS.
- Windows Desktop fresh exact-head result remains the repository CI item to consume if not yet present.

### 2026-09-02 SECURITY DEFINER SEARCH-PATH CLOSURE WAVE
- Live audit confirmed all public SECURITY DEFINER functions use `search_path=pg_catalog`; the five trust/governance helpers named above had unqualified application relations and were therefore unsafe/broken under the intended locked path.
- Applied migration: `supabase/migrations/20260902231600_reconcile_security_definer_search_path_qualification.sql`.
- Commit: `5dbf20f4f376896a58f9e8110b9fc813b5069967`.
- The migration changes only function definitions; no restore, rollback, live tenant state, or secret was mutated.
- Fresh Quality run `33678527913` on `5dbf20...`: PASS — historical exact-candidate evidence.
- After index synchronization, fresh repository-head runs completed successfully: Quality `33678779951`, Enforcement `33678779980`, Storage Tenant Isolation `33678779994`, Final Execution `33678780020`.

### EXACT-HEAD CI RECONCILIATION
- `Quality 33678779951` on `3bed44...`: PASS — 63 verification steps completed successfully.
- `Execution Enforcement 33678779980` on `3bed44...`: PASS — exact-head enforcement contract accepted.
- `Storage Tenant Isolation 33678779994` on `3bed44...`: PASS — adversarial tenant-isolation contract accepted.
- `Final Execution 33678780020` on `3bed44...`: PASS — 30 deterministic gates completed successfully.
- These runs validate the governed repository/index synchronization boundary. The underlying product code/test candidate remains `5dbf20...` because `3bed44...` is index-only.
- Windows Desktop exact-head evidence must remain separately tracked until consumed.

### LIVE DATABASE / SECURITY TRUTH
- Live Staging: 78/78 public tables have RLS; 147 policies; 0 policies targeting `anon`; 0 policies targeting `PUBLIC`; 0 direct `anon` EXECUTE grants on public routines.
- Reviewed SECURITY DEFINER runtime routines use authenticated/user/tenant checks and no dynamic SQL; the latest live/runtime defect was the locked-search-path relation qualification in five trust/governance helpers and has been addressed in the current candidate.
- Live storage has tenant-path/owner-aware authenticated policies; storage runtime remains UNPROVEN and no canonical bucket-creation contract was found, so no speculative bucket was created.
- Live Auth logs show successful password-login and `/user` 200 responses, but this is not full authenticated E2E certification.
- Leaked-password protection remains disabled in Supabase Auth and is retained as an owner/control-plane item because the connected toolset cannot mutate that setting.

### RESILIENCE / DEPLOYMENT TRUTH
- Backup/restore verification enforces safe non-production targets, HTTPS-only transport, no URL credentials, no redirects, bounded timeout, non-public literal/DNS target rejection, and fail-closed DNS resolution.
- Backup artifact integrity hashing streams the response instead of buffering the full artifact.
- Rollback drill validates exact project ownership and READY state, rejects identical/untrusted targets, forbids production drills, and uses secure verification transport.
- Production deployment `dpl_5quRUVs6BZwSRTbhcvZQySGGm8mG` is READY and points to exact code/test candidate `5dbf20...`; production aliases include `report-advisor.vercel.app`. This proves deployment/runtime availability but does not by itself prove authenticated E2E, tenant isolation, backup/restore, RPO/RTO, rollback, or DR.
- Production binding is therefore **DEPLOYED / NOT YET CERTIFIED** until the full operational binding evidence contract is consumed.
- Backup, restore, RPO/RTO, rollback, and forward recovery/DR remain UNPROVEN until real exact-candidate operational evidence exists.

### EXACT-SHA / EVIDENCE RULES
- Exact SHA is mandatory for certification evidence.
- CI PASS proves repository gates only; it does not prove live authenticated runtime, Tenant A/B isolation, backup/restore, RPO/RTO, rollback, DR, or Production binding.
- `UNPROVEN` remains `UNPROVEN` until real operational evidence is captured and consumed.
- No mocks, fixtures, static checks, or documentation are promoted to LIVE evidence.
- No production alias mutation, restore, rollback, or secret fabrication is permitted merely to close a gate.
- An index-only synchronization commit never changes the code/test candidate and never inherits or upgrades runtime/production evidence.

# OWNER-LAST-MILE EXECUTION MATRIX — MANDATORY HANDOFF

## A. Rule: assistant does everything executable first

Before asking the owner to touch the device, the assistant must complete all available work in these classes:

1. Repository/code inspection, sibling-consumer sweeps, root-cause analysis, safe fixes, tests, regression tests, migrations, and evidence preparation.
2. GitHub branch/PR/CI inspection, exact-head comparisons, workflow/log/artifact consumption, and governed index synchronization.
3. Supabase schema/RPC/RLS/security-definer/storage/database inspection and any safe mutation available through the connected Supabase toolset.
4. Vercel deployment/configuration/log/runtime inspection and any safe non-production or explicitly authorized mutation available through the connected Vercel toolset.
5. Runtime test-plan preparation, scripts/harnesses, deterministic datasets, evidence collectors, and exact-SHA evidence packaging.
6. Backup/restore/rollback readiness work that does not require protected production credentials or an irreversible production action.
7. Discovery of every remaining blocker and classification as INTERNAL ACTIONABLE, OWNER REQUIRED, or EXTERNAL OPERATIONAL BLOCKER.

**Never send the owner to perform work merely because it is easier to ask.**

## B. OWNER DEVICE ACTIONS — ONLY THESE ARE EXPECTED

### B1. Authenticated E2E / Tenant A-B
**Owner must do:**
1. Open the exact deployed application URL supplied by the current exact-head run.
2. Use real authorized credentials for Tenant A and Tenant B when the harness requires interactive browser authentication.
3. Do not paste passwords, service-role keys, recovery codes, or secrets into chat.
4. If the harness requires two separate browser profiles/sessions, keep Tenant A and Tenant B sessions isolated.
5. Run the exact test plan supplied by the assistant; do not improvise additional mutations.
6. Preserve the generated run/evidence identifiers and return only the non-secret result summary or upload the evidence file if requested.

**Required proof:** authenticated session + Tenant A/B adversarial request matrix showing cross-tenant access fails, plus exact deployed SHA/URL association.

### B2. Supabase Auth control-plane
**Owner must do:**
1. Open Supabase Dashboard for the correct project.
2. Navigate to Auth/security settings.
3. Enable leaked-password protection if this control is still disabled.
4. Save the setting and record the non-secret control state.
5. Do not modify unrelated Auth settings, users, providers, redirect URLs, or secrets.
6. Return the resulting control-plane state; the assistant consumes and records it.

**Required proof:** control enabled on the correct Supabase project.

### B3. Backup / Restore / DR
**Owner must do only when the connected tooling cannot execute the protected operation:**
1. Confirm the target is non-production recovery/staging, never production.
2. Initiate the approved backup operation using the project's authorized control plane.
3. Capture backup artifact/inventory metadata, creation timestamp, and integrity/hash evidence without exposing secrets.
4. Restore into the approved isolated non-production target.
5. Record restore start/end timestamps and resulting target state.
6. Run the supplied integrity/data-count/consistency verification.
7. Do not overwrite production and do not alter the release candidate solely to manufacture evidence.

**Required proof:** exact backup artifact identity, restore target identity, integrity verification, RPO/RTO timings, and exact-candidate association.

### B4. Rollback / Forward Recovery
**Owner must do only under an approved controlled drill:**
1. Confirm the deployment/project and target are exactly those named by the assistant.
2. Confirm the drill is authorized and non-destructive.
3. Perform the documented rollback drill against the approved deployment target.
4. Capture deployment IDs, timestamps, resulting READY state, and health-check result.
5. Execute forward recovery if the plan requires it.
6. Never mutate the production alias or production deployment unless the assistant explicitly identifies the operation as the approved certification action and the owner confirms authorization.

**Required proof:** exact source/target deployment IDs, timestamps, READY state, health checks, rollback result, and forward-recovery result where applicable.

### B5. Windows Desktop evidence
**Owner must do only if the exact-head Windows runner cannot be executed/consumed through connected tooling:**
1. Checkout the exact SHA named by the assistant.
2. Use the repository's documented Windows/Desktop verification command only.
3. Do not update dependencies or modify the working tree.
4. Capture PASS/FAIL logs and the exact SHA.
5. Return the log/artifact, not a verbal assertion.

### B6. Protected production/deployment authorization
**Owner must do only when required by the platform:**
1. Authenticate to the correct Vercel/Supabase control plane locally.
2. Approve only the exact operation named in the execution plan.
3. Do not rotate secrets, change aliases, redeploy, restore, rollback, or modify environment variables unless explicitly listed as required.
4. Return the resulting non-secret IDs/status values.

## C. ASSISTANT EXECUTION — MUST BE DONE WITHOUT OWNER

### C1. Repository and code
- Read the protocol and current index before every execution cycle.
- Rescan current exact HEAD and identify real remaining work.
- Run FIND → CLASSIFY → ROOT CAUSE → FIX → TEST → REGRESSION → EXACT-HEAD CI → RUNTIME → LIVE EVIDENCE → INDEX UPDATE.
- Search sibling consumers and cross-surface equivalents, not only individual files.
- Sweep semantic conversions: NULL/UNKNOWN/MISSING/EMPTY/ZERO/INSUFFICIENT_DATA/BLOCKED/LOW/PASS/FAIL and reject accidental coercions.
- Close zero-consumer/inventory/receivables/financial truth/export/cross-surface parity findings where executable.
- Continue Worker/Queue lifecycle, Watched Folder, Canonical/RPC parity, UI/Export parity, OCR source closure, Performance, Product Acceptance, Electron/Windows preparation, and Production readiness work in parallel where independent.
- Never reopen a closed family unless a dependency, consumer, regression, or new evidence contradicts it.

### C2. Security / tenant / storage / realtime / AI
- Continue RLS and SECURITY DEFINER audits.
- Verify authenticated/user/tenant predicates and locked search paths.
- Continue storage policy and runtime-readiness closure without speculative bucket creation.
- Prepare and execute all possible Realtime authorization/filtering tests.
- Verify AI/vector tenant namespace, provenance, document/chunk identity, embedding ownership, retrieval filtering, citation/evidence, stale-data behavior, and deletion propagation.

### C3. Workers / reliability
- Prepare/execute worker scenarios: start → lease → heartbeat → crash → lease expiration → retry → duplicate attempt → fencing → checkpoint → DLQ → recovery.
- Prove absence of duplicate side effects, silent loss, stuck jobs, and inconsistent state where the connected runtime permits it.

### C4. Performance / scale
- Use realistic datasets.
- Verify bounded queries, EXPLAIN plans, pagination, indexes, N+1, large-tenant behavior, concurrency, import volume, and report generation.
- Do not treat the existence of a performance script as scalability proof.

### C5. Backup / restore / rollback readiness
- Validate contracts, safety guards, artifact hashing, target validation, secure transport, and evidence schemas.
- Prepare exact operational runbooks and evidence collectors.
- Do not claim backup/restore/RPO/RTO/rollback/DR as certified until real operational evidence exists.

### C6. CI / evidence / index
- Consume exact-head CI results and artifacts.
- Track Windows separately until consumed.
- Maintain the Evidence Matrix for every requirement:
  `Requirement | Canonical Truth | Consumers | Implementation SHA | Regression | Exact-head CI | Runtime Evidence | Production Evidence | Remaining Risk | Certification`.
- Keep CI PASS, regression, runtime, and production certification as separate states.
- Update this index after real evidence or real mutation changes truth.

## D. OWNER HANDOFF GATE — WHEN THE ASSISTANT MAY ASK FOR DEVICE WORK

The assistant may issue an owner action request only when all are true:

- [ ] The exact requirement is identified in this index.
- [ ] The assistant has exhausted executable work available through connected tools.
- [ ] The remaining operation genuinely requires owner credentials, interactive browser authentication, protected production/recovery authorization, or unavailable control-plane access.
- [ ] The exact command/navigation/test sequence is written down.
- [ ] Inputs that are safe to share are specified; secrets are explicitly excluded from chat.
- [ ] Expected PASS evidence is specified.
- [ ] Rollback/abort condition is specified for any consequential operation.
- [ ] The owner is asked for one bounded action batch, not a discovery exercise.

## E. OWNER BATCH ORDER — MINIMUM ERROR / MINIMUM INTERRUPTIONS

When owner intervention is required, consolidate work into the fewest batches:

### Batch O1 — Authentication + Auth control plane
- Real Tenant A/B login/session setup.
- Confirm leaked-password protection state/change.
- Preserve session separation.

### Batch O2 — Runtime evidence
- Run authenticated E2E.
- Run Tenant A → Tenant B adversarial matrix.
- Run Storage and Realtime cross-tenant attempts where the browser/session is required.
- Capture all evidence in one bounded run.

### Batch O3 — Resilience
- Backup.
- Non-production restore.
- Integrity verification.
- RPO/RTO timing capture.
- Rollback/forward-recovery drill only if separately authorized.

### Batch O4 — Desktop / protected deployment
- Windows Desktop exact-head verification if still unavailable.
- Any unavoidable Vercel/Supabase protected authorization action.

**Do not ask the owner to perform O2/O3/O4 while assistant-executable prerequisites are incomplete.**

## F. CURRENT OWNER ACTION QUEUE

| ID | Owner action | Why owner is required | Assistant prerequisite | Evidence returned | State |
|---|---|---|---|---|---|
| OWNER-AUTH-01 | Real authenticated Tenant A/B sessions | Interactive real credentials/session | Harness + exact deployed target ready | Authenticated E2E + A/B evidence | **OWNER REQUIRED** |
| OWNER-AUTH-02 | Enable leaked-password protection | Supabase Auth control-plane unavailable to connected tools | Correct project/control identified | Non-secret enabled state | **OWNER REQUIRED** |
| OWNER-RUN-01 | Execute authenticated E2E + tenant adversarial matrix | Real browser session/credentials | Test plan and exact target ready | Run/evidence artifact | **OWNER REQUIRED** |
| OWNER-DR-01 | Backup + isolated restore | Protected recovery operation | Safety contract + runbook ready | Backup/restore/integrity/RPO/RTO | **OWNER REQUIRED / CONDITIONAL** |
| OWNER-DR-02 | Rollback + forward recovery drill | Protected deployment authorization | Drill contract + target validation ready | Deployment IDs + health + timings | **OWNER REQUIRED / CONDITIONAL** |
| OWNER-WIN-01 | Windows Desktop exact-head verification | May require local Windows runtime | Exact SHA and command ready | Exact-SHA logs/artifact | **OWNER REQUIRED / CONDITIONAL** |
| OWNER-PROD-01 | Any unavoidable protected production authorization | Platform permission boundary | Assistant identifies exact operation and safety checks | Non-secret operation result | **OWNER REQUIRED / CONDITIONAL** |

## G. CURRENT ASSISTANT-FIRST QUEUE — DO NOT DEFER TO OWNER

1. Consume/locate fresh Windows Desktop exact-head evidence if accessible.
2. Continue Supabase RPC/signature/security-definer/sibling-consumer audit.
3. Continue production runtime forensic checks against the exact deployed candidate.
4. Continue Authenticated E2E harness readiness and evidence packaging.
5. Continue Tenant A/B adversarial test preparation and all non-interactive security checks.
6. Continue storage/realtime/AI-vector runtime test preparation and executable tests.
7. Continue worker/queue crash/retry/fencing/recovery closure.
8. Continue semantic conversion and cross-surface equivalence sweeps.
9. Continue performance/scale verification where runtime/tool access permits.
10. Continue backup/restore/rollback readiness and evidence-contract closure.
11. Continue OCR/document golden-corpus and source-closure work.
12. Continue UI/export parity and product-acceptance work that does not depend on owner runtime.
13. Continue Production readiness checks: environment separation, secrets references, migrations, observability, logging, errors, rate limits, auth, monitoring, alerts, deployment, health checks, failure handling.
14. Rescan after every closure and discover sibling/new findings.

## H. CERTIFICATION STATES — FAIL CLOSED

- **PASS** = requirement directly proven at the stated evidence boundary.
- **IMPLEMENTED** = code/config exists; not necessarily runtime-proven.
- **REGRESSION-PROVEN** = automated regression proves the scoped behavior; not production proof.
- **RUNTIME-PROVEN** = real runtime evidence at the exact relevant SHA/environment.
- **PRODUCTION-PROVEN** = real production evidence at the exact relevant SHA/environment.
- **UNPROVEN** = required evidence does not exist.
- **OWNER REQUIRED** = exact remaining action genuinely requires owner/device capability.
- **EXTERNAL BLOCKER** = external operational dependency prevents execution; other fronts must continue.
- **NOT CERTIFIED** = certification threshold not met regardless of implementation completeness.

## CERTIFICATION STATUS — FAIL CLOSED
| Gate | State | Reason |
|---|---|---|
| Repository quality | **PASS** | Fresh Quality `33678779951` |
| Release deterministic gates | **PASS** | Final Execution `33678780020` — 30 gates |
| Execution enforcement contract | **PASS** | `33678779980` exact-head enforcement |
| Storage tenant isolation contract | **PASS** | `33678779994` adversarial contract |
| Windows desktop | **PENDING CONSUMPTION** | Fresh exact-head evidence still to consume |
| Work Item Actionability Guard | **STALE** | Prior evidence is on older exact head |
| Production runtime | **HTTP 200 / runtime available; E2E UNPROVEN** | Production exact candidate deployment responds successfully |
| Authenticated E2E | **UNPROVEN / OWNER REQUIRED** | Harness ready; real exact-environment execution evidence required |
| Live Tenant A/B isolation | **UNPROVEN / OWNER REQUIRED** | Requires real two-tenant adversarial runtime evidence |
| Backup | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Requires real backup artifact/inventory evidence |
| Restore | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Requires real non-production restore verification |
| RPO / RTO | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Requires real backup/restore timing evidence |
| Rollback | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Requires authorized real deployment drill |
| Forward recovery / DR | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Requires real operational environment |
| Production binding | **DEPLOYED / NOT CERTIFIED** | Exact candidate is deployed to production; full binding evidence contract not yet consumed |
| Auth leaked-password protection | **OPEN — CONTROL PLANE / OWNER REQUIRED** | Setting is disabled; connected toolset cannot mutate Supabase Auth security configuration |
| Final certification | **BLOCKED** | Live operational evidence plus Auth control-plane setting remain outside executable closure |

## I. EXECUTION PROTOCOL — ALWAYS ROTATE

`READ PROTOCOL → READ INDEX → READ CURRENT EXACT STATE → RESCAN → FIND → CLASSIFY → ROOT CAUSE → FIX → TEST → REGRESSION → EXACT-HEAD CI → RUNTIME → LIVE EVIDENCE → INDEX UPDATE → RESCAN`

- If executable work exists: **EXECUTE**.
- If a defect exists: **FIX**.
- If proof is possible: **PROVE**.
- If an external blocker exists: **ISOLATE and continue other fronts**.
- If a front closes: **CLOSE and move immediately**.
- If Remaining Work becomes empty: **DISCOVER AGAIN** from another perspective.
- `PENDING ≠ DONE`.
- `REPORT ≠ COMPLETION`.
- `CI PASS ≠ Runtime`.
- `Runtime ≠ Production Certification`.
- `Production deployment ≠ Production certification`.
- Work first, report last.

### NEXT EXECUTION FRONT
1. Consume fresh Windows Desktop exact-head evidence where accessible.
2. Continue parallel Supabase RPC/signature/security-definer audit without speculative privilege changes.
3. Continue production runtime forensic checks against the exact deployed candidate.
4. Complete all assistant-executable prerequisites for OWNER-AUTH-01/02 and OWNER-RUN-01.
5. Continue resilience/backup/restore/rollback contract closure and evidence preparation.
6. Continue independent P1/P2 execution fronts; do not wait on owner gates.
7. When an owner batch is genuinely unblocked, issue one bounded owner batch with exact steps and expected evidence.
