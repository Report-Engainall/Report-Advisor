# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution index. Historical records remain in Git history and dated evidence. Evidence never crosses an exact-SHA boundary.

### EXECUTION SCOPE / BRANCH
- **Repository:** `Report-Engainall/Report-Advisor`
- **Current execution branch:** `execution/owner-level-compatibility-hardening-main`
- **Current main:** `b44a823b22653aded1408d36c6e5a109e4df4c3d`
- **Current execution candidate:** `ec2c6babef8176044ba63892e6638f23904db1d2`.
- Previous executable candidate: `393308f235b816e9610bb426813e6fefc9f7c6b9`.
- `b9597ac...` was governance/index-only and did not replace the executable candidate.
- Execution scope: P0 certification/test integrity; P0 security/database/RPC/RLS/tenant isolation; P0 worker adversarial lifecycle; P1 compatibility/legacy; worker/filesystem/OCR/documents; P2 reports/export/performance; PR/desktop reconciliation; final evidence/certification.
- Independent fronts run in parallel; Owner intervention is deferred until locally actionable work is exhausted.

### EXACT CANDIDATE
- **CURRENT CODE/TEST CANDIDATE:** `ec2c6babef8176044ba63892e6638f23904db1d2`
- `ec2c6bab...` adds P0 worker generation fencing, terminal-state guards, checkpoint monotonicity/source-hash integrity, max-attempt constraints, adapter/runner lease-token propagation, and a 34-case adversarial coverage matrix with test-of-test mutation.
- `b44a823...` strengthened the continuous-trust test-of-test from single replacement to `replaceAll`, proving partial stale persistence identifiers cannot survive the adversarial test.
- Certification evidence is valid only for this exact candidate or an explicitly governed ancestry of it.

### BATCH 1 — CERTIFICATION / TEST INTEGRITY
- Quality `#3854` on `18b634c...`: PASS, all 63 workflow steps.
- Final Execution Batch `#430` on `18b634c...`: PASS, 30 deterministic gates.
- Final Certification `#665` on `d362b229...`: boundary passed, then certification contracts failed on stale continuous-trust test-of-test; RCA and repair completed.
- Final Certification run on `b9597ac...`: boundary passed; continuous-trust test-of-test failed on a partial replacement that did not remove all stale occurrences. This failure was consumed and repaired at `b44a823...`.
- Fresh exact-candidate CI for `ec2c6bab...` is required before closure.

### BATCH 2 — SECURITY / DATABASE / RPC / RLS
- Live Staging: `autonomy_runtime_gate(text)` is SECURITY DEFINER, authenticated-executable, anon-denied; it calls `is_continuous_trust_healthy('production')` and evaluates critical drift.
- `is_continuous_trust_healthy(text)` is SECURITY DEFINER with `search_path=pg_catalog`; anon and authenticated direct EXECUTE are denied.
- `decide_approval()` is tenant-scoped, decision-lock-before-approval, PENDING-only, rejects self-approval, and updates only the same-tenant PROPOSED decision.
- `request_decision_approval()` is tenant-scoped and decision-lock-before-check, with terminal APPROVED/REJECTED/CANCELLED fail-closed behavior and conflict-path protection.
- Live public SECURITY DEFINER inventory remains 33; 19 authenticated-executable, 0 anon-executable; all 33 have explicit search_path; no dynamic SQL detected by current semantic sweep.
- Approval and decision tables have RLS enabled; authenticated direct INSERT/UPDATE/DELETE is denied; tenant policies scope by `current_company_id()`.
- Live adversarial rollback tests: self-approval rejected; cross-tenant approval rejected; terminal approval resurrection rejected; request-on-proposed decision succeeds transactionally and rolls back in smoke.
- Approver authority remains **PRODUCT DECISION REQUIRED** only if a distinct business authority class is intended.

### BATCH 3 — COMPATIBILITY / LEGACY
- `queries-compat.ts` delegates to canonical query paths.
- Import history bounded to 500 with deterministic ordering/overflow rejection.
- Export adapters tenant-scoped and bounded to 10,000.
- Repository-wide caller/legacy/RPC/response/null/error parity sweep remains active; actionable mismatches must be fixed and rescanned.
- **2026-09-04 owner execution:** added `scripts/check-compatibility-legacy-consumers.mjs` to assert canonical delegation, tenant gating, RPC-only writes, explicit error propagation, import-history bound/overflow rejection, and export bounds.
- **2026-09-04 security hardening:** extended `check-tenant-legacy-consumers.mjs` with multi-hop taint tracking for client-selected tenant identifiers and metadata-derived aliases; extended its regression fixture with direct, two-hop, and user-metadata bypass attempts.
- **2026-09-04 cleanup:** removed a redundant error branch in `src/lib/queries-compat.ts` without changing business behavior.
- Exact execution candidate for this batch: `5408ec5c1bacd90c9393f7af6f845790c6c0e57e`; fresh CI/runtime verification is still required before certification closure.

### BATCH 4 — WORKER / FILESYSTEM / OCR / DOCUMENTS
- Worker DB lifecycle/dead-letter/lease/fence contracts are verified; full deployed runtime worker proof remains unproven.
- Watched-report direct authenticated DML is blocked live; recorder RPC remains the approved write path. Native path resolution includes resolve/realpath/containment and stable-file protections.
- OCR/document scope covers Arabic/RTL, mixed Arabic-English, scanned/rotated/low-quality pages, tables, malformed/empty OCR, partial extraction, duplicate fingerprint, confidence/provenance and page/line references.
- Runtime/Windows proof is never inferred from static contracts.

### 2026-09-04 — P0 WORKER ADVERSARIAL LIFECYCLE MILESTONE
**Execution scope boundary:** this front covers the repository worker lifecycle and its canonical Supabase lifecycle RPCs: queue claim/lease ownership, heartbeat, checkpoint, retry/maxAttempts, dead-letter, completion/failure, idempotency/duplicate execution guards, tenant/authorization propagation, persistence transitions, and worker-to-RPC adapter boundaries. It does **not** certify deployed production worker runtime, Authenticated A/B browser E2E, backup/restore, rollback/forward recovery, or native Windows behavior.

**BASE / BRANCH / PR**
- Base execution SHA: `4ba7021c91fedc41a94ec83310c1a8b70d2ca37c`
- Mutation branch: `execution/owner-level-compatibility-hardening-main`
- PR: `#310` — OPEN / NOT MERGED
- Worker mutation commit: `ec2c6babef8176044ba63892e6638f23904db1d2`
- Index update commit: recorded immediately after worker mutation; fresh exact-SHA CI remains required.

**SURFACE DISCOVERY**
- Queue fixture: `src/lib/report-execution/queue.ts`
- Durable Supabase adapter: `src/lib/report-execution/durable-worker-adapter.ts`
- Production lifecycle runner: `src/lib/report-execution/durable-production-runner.ts`
- Lifecycle checkpoint contract: `src/lib/report-execution/checkpoint.ts`
- Production coordinator bridge: `src/lib/report-execution/production-coordinator-bridge.ts`
- Artifact integrity surface: `src/lib/report-execution/artifact-integrity.ts`
- Canonical lifecycle DB RPCs: claim, heartbeat, checkpoint, completion, failure, retry.

**FINDINGS / RCA / FIXES**
| ID | Severity | Finding | RCA | Repair |
|---|---|---|---|---|
| WKR-001 | P0 | Lease ownership used worker identity without a process-generation fencing token in DB transitions. | A stale process can reuse a worker identity after lease takeover; owner-only checks do not distinguish generations. | Added `lease_token`, rotate on claim, require token on heartbeat/checkpoint/complete/fail, clear token on terminal state, and remove old mutator signatures. |
| WKR-002 | P0 | Completion was not DB-gated by terminal lifecycle checkpoint. | Completion RPC trusted caller state instead of canonical persisted stage. | Completion now requires `checkpoint.stage = rendered` plus live unexpired lease/token. |
| WKR-003 | P0 | Checkpoint RPC accepted arbitrary stage movement. | No persisted stage-order or source-hash invariant existed at DB boundary. | Added strict lifecycle ordering, source-hash immutability, JSON shape validation, and row locking. |
| WKR-004 | P0 | Retry/attempt bounds were not protected by DB constraints. | Attempt arithmetic was partly application-owned. | Added attempt/max-attempt constraints and claim guard `attempt < max_attempts`. |
| WKR-005 | P0 | Alternate legacy mutator signatures could remain callable after adding a new token-aware path. | PostgreSQL overloads preserve old signatures unless explicitly dropped. | Dropped old heartbeat/checkpoint/completion/failure signatures and granted only canonical token-aware RPCs to `service_role`. |
| WKR-006 | P1 | Artifact side-effect crash windows are not fully runtime-proven by the current worker harness. | Side effect and checkpoint are separate persistence boundaries; exact external artifact replay semantics require deployed runtime/artifact store execution. | Kept as an explicit remaining evidence item; no false PASS. |

**FILES / MIGRATION / TESTS**
- `src/lib/report-execution/durable-worker-adapter.ts` — lease-token propagation.
- `src/lib/report-execution/durable-production-runner.ts` — token capture and propagation through heartbeat/checkpoint/complete/fail.
- `supabase/migrations/20260904050000_p0_worker_adversarial_lifecycle_fencing.sql` — DB fencing, lifecycle constraints, checkpoint integrity, canonical RPC signatures/grants.
- `scripts/worker-adversarial-lifecycle.test.ts` — adversarial matrix + mutation-based test-of-test.
- `.github/workflows/batch-integrity-guards.yml` — executes worker adversarial regression on PRs.

**ADVERSARIAL MATRIX RESULT TABLE**
| # | Case | Expected | Actual | Result | Evidence boundary |
|---:|---|---|---|---|---|
| 1 | Lease then stop before heartbeat | Lease eventually stale | Covered by expiry/fencing invariant | PASS | fixture + DB invariant |
| 2 | Stale worker returns after expiry | Reject | Reject | PASS | fixture + DB token |
| 3 | Worker A/B same job | Single owner | Single owner | PASS | atomic claim + fixture |
| 4 | Duplicate delivery | Idempotent | Same run within tenant | PASS | queue test |
| 5 | Duplicate completion | Reject | Terminal/token fence | PASS | fixture + DB invariant |
| 6 | Completion after failure | Reject | Terminal/token fence | PASS | DB state guard |
| 7 | Failure after completion | Reject | Terminal/token fence | PASS | DB state guard |
| 8 | Crash after checkpoint before side effect | Resume without unsafe terminalization | Contract covered; external side effect runtime unproven | PASS* | contract only |
| 9 | Crash after side effect before checkpoint | No duplicate side effect | External artifact replay not runtime-proven | BLOCKED | deployed runtime required |
| 10 | Retry amplification | One retry transition per failed state | Atomic failed→queued guard | PASS | DB RPC invariant |
| 11 | maxAttempts 0/1/max/max+1 | Reject 0; stop at max | DB constraints + claim guard | PASS | DB constraint |
| 12 | Dead-letter transition | Terminal at max | `dead_letter` | PASS | DB RPC |
| 13 | Retry after terminal | Reject | Only `failed` + budget is retryable | PASS | DB RPC |
| 14 | Reprocess dead-letter | Reject | Claim excludes terminal state | PASS | DB RPC |
| 15 | Lease renewal after expiry | Reject | Expired lease predicate | PASS | DB RPC |
| 16 | Non-owner heartbeat | Reject | owner+token fence | PASS | fixture + DB RPC |
| 17 | Stale completion after takeover | Reject | Old token fenced | PASS | actual DB probe + fixture |
| 18 | Malformed job state | Reject | DB constraints/checkpoint validation | PASS | DB contract |
| 19 | Missing dependency | Reject/fail without false completion | Completion requires rendered checkpoint | PASS* | contract boundary |
| 20 | Tenant A worker → Tenant B job | Reject | `current_company_id()` predicate | PASS | DB RPC |
| 21 | Tenant identity manipulation | Reject | tenant is DB-derived, not payload-owned | PASS* | DB boundary |
| 22 | Idempotency collision across tenants | Isolate | Separate tenant keys in fixture | PASS | queue test |
| 23 | Idempotency collision same tenant | Same logical run | Same run | PASS | queue test |
| 24 | Concurrent retries | Single queue transition | Atomic status predicate | PASS* | DB invariant |
| 25 | Restart during transition | No stale-generation mutation | Fencing token | PASS* | DB invariant |
| 26 | Partial persistence failure | No false completion | Boolean transition checks + terminal gating | PASS* | contract |
| 27 | Partial artifact generation | No false completion | Rendered checkpoint required | PASS* | contract; artifact runtime unproven |
| 28 | Completion with missing/invalid artifact | Reject | Completion requires rendered lifecycle checkpoint, but artifact store itself is not executed here | BLOCKED | deployed artifact runtime |
| 29 | Failure with partial artifact | Preserve failure; no false success | Failure clears lease/token; artifact cleanup runtime unproven | PASS* | DB state boundary |
| 30 | Replay completed work | Reject mutation | Completed has no active lease/token | PASS | DB invariant |
| 31 | Repeated delivery after success | Reject mutation | Terminal state excluded | PASS | DB invariant |
| 32 | Unexpected state transition injection | Reject | Checkpoint stage ordering | PASS | DB RPC |
| 33 | Terminal-state resurrection | Reject | Retry only `failed`; claim excludes terminal | PASS | DB RPC |
| 34 | Unauthorized direct mutation bypass | Reject | Old signatures removed; EXECUTE restricted to service_role | PASS | DB grants/signatures |

`PASS*` = bounded contract/invariant evidence, not deployed external-side-effect runtime certification. `BLOCKED` is not PASS.

**ACTUAL DATABASE PROBE**
- Live Staging was used for a transaction-scoped lease probe with an authenticated tenant context.
- The probe demonstrated the repaired lease model generates a lease token on claim and uses generation-specific ownership rather than worker identity alone. The transaction was rolled back; no probe data was retained.
- The stale-worker takeover/completion case is therefore **runtime-proven at the DB RPC boundary**, while full worker process/external artifact execution remains unproven.

**TEST-OF-TEST**
- The adversarial test creates a controlled temporary copy of the queue implementation, removes the fencing-token predicate, and executes a forged-token heartbeat probe.
- The mutated implementation must fail the regression; if the mutation bypasses the test, the test itself fails.
- This specifically prevents a false green caused by only checking happy-path ownership.

**BYPASS SEARCH**
- Alternate old mutator signatures: removed from DB.
- Token-aware canonical RPCs: all mutation paths require owner/token where a lease is required.
- Tenant mutation predicates: claim/heartbeat/checkpoint/complete/fail/retry are tenant-scoped through `current_company_id()`.
- Direct `service_role` table mutation remains a privileged operational capability and is not equivalent to public/authenticated bypass; production runtime governance remains separate.
- External artifact replay and native worker process restart paths remain evidence gaps, not hidden PASS claims.

**REGRESSION**
- Existing worker lease fencing regression remains in the batch guard workflow.
- New adversarial matrix is added to the same PR CI gate.
- Canonical report execution behavior remains under the existing report lifecycle contract; no merge was performed.
- Full tenant/security, report/export, OCR, scale/performance, filesystem/Windows, PR reconciliation, repository rescan, and evidence reconciliation are next execution fronts.

**CI**
- Fresh CI was requested by pushing `ec2c6bab...` to PR #310; exact-head result must be recorded before certification closure.
- No CI PASS is claimed in this index until a run explicitly reports the exact SHA.

**BLOCKERS**
- Authenticated A/B browser session: BLOCKED / OWNER.
- Backup/restore: BLOCKED / protected operational access.
- Rollback/forward recovery: BLOCKED / protected deployment access.
- Native Windows: BLOCKED unless exact-head native evidence is available.
- Production control-plane runtime worker proof: BLOCKED / external operational access.

**REMAINING WORK / NEXT ACTION**
1. Fresh exact-SHA CI for `ec2c6bab...` and consume any failures.
2. Full Tenant/Security Rescan on the same exact ancestry.
3. Report/Export adversarial evidence.
4. OCR/Golden Corpus execution.
5. Scale/Performance.
6. Filesystem/Windows.
7. PR Reconciliation.
8. Full Repository Rescan.
9. Evidence Reconciliation.
10. Reassess P0/P1 queue if a higher-risk finding appears.

### BATCH 5 — REPORTS / EXPORT / PERFORMANCE
- Required lineage: canonical truth → calculation → report → artifact → SHA-256 → provenance → export.
- Adversarial coverage required for wrong period, stale truth, duplicates, tenant leakage, NULL/unknown semantics, pagination/bounds, PDF/RTL, CSV and Excel.
- 43 unused-index advisor INFO notices remain NON-BLOCKING/OPTIMIZATION pending realistic workload evidence.
- Small-data EXPLAIN is not production-scale proof.

### BATCH 6 — PR / DESKTOP
- PR #305 terminal-approval implementation is superseded by current-main lineage; no wholesale merge.
- PR #307 fixture/test ideas were selectively reproduced; no blind merge.
- PR #308 autonomy changes remain separate until a unique missing behavior is proven.
- Native Windows smoke remains Owner/External only if CI cannot produce exact-head evidence.

### STORAGE / REALTIME / AI
- Live Staging storage bucket inventory is empty; policies are tenant/owner-aware. Requirement status remains classification-dependent, not PASS.
- Realtime has no published application tables and no repository consumer found; requirement status remains classification-dependent, not PASS.
- AI/vector architecture exists; live retrieval authorization, tenant isolation and provenance remain unproven.

### LIVE / RESILIENCE
- Backup/restore, RPO/RTO, rollback/forward recovery and current production alias binding remain unproven.
- Historical deployments or prior RC evidence do not certify the current candidate.

### OWNER UNBLOCK QUEUE
| ID | Operation | Real blocker | Prepared | Evidence required | Status |
|---|---|---|---|---|---|
| OWNER-AUTH-01 | Authenticated Tenant A/B E2E | Interactive authenticated browser session | Matrix + exact candidate | A/B authenticated E2E + adversarial isolation | OWNER REQUIRED |
| OWNER-AUTH-02 | Leaked-password protection | Auth control plane | Setting identified | Non-secret enabled state | CONDITIONAL |
| OWNER-DR-01 | Backup + isolated restore | Protected recovery access | Safety/validation contract | Backup/restore/hash/timing/RPO/RTO | CONDITIONAL |
| OWNER-DR-02 | Rollback + forward recovery | Protected deployment access | Drill/evidence contract | Deployment/health/recovery proof | CONDITIONAL |
| OWNER-WIN-01 | Native Windows smoke | Native environment if CI unavailable | Exact command packet | Exact-head logs/artifact | CONDITIONAL |

### STATE MATRIX
| Front | BUILT | INTEGRATED | VERIFIED | RUNTIME PROVEN | PRODUCTION CERTIFIED |
|---|---|---|---|---|---|
| Approval/RBAC | YES | YES | DB + concurrency regression | NO | NO |
| Worker | YES | YES | DB adversarial + test-of-test | DB RPC boundary | NO |
| Tenant isolation | YES | YES | DB adversarial | NO current A/B browser | NO |
| Import/compat | YES | YES | Partial + compatibility contract added | NO | NO |
| OCR | YES/architecture | PARTIAL | Partial | NO | NO |
| Reports/export | YES | PARTIAL | Partial | NO | NO |
| Storage | YES/policies | NO contract | Policy | NO | NO |
| Realtime | Client capability | NO publication | NO | NO | NO |
| AI/vector | Architecture | PARTIAL | Architecture | NO | NO |
| Certification provenance | YES | YES | PENDING fresh exact candidate | N/A | NO |

### EXECUTION DEBT
`LOCAL ACTIONABLE EXECUTION DEBT = NOT ZERO`.

Active local execution: Batch 1 fresh exact-candidate certification/test integrity; repository-wide compatibility consumer sweep; watched filesystem proof; OCR corpus; report/export adversarial evidence; performance scale; Electron exact-head verification; PR reconciliation; migration lineage; SECURITY DEFINER semantic review; worker adversarial lifecycle; storage/realtime/AI scope classification.

Owner-only: authenticated browser sessions, protected Auth/recovery/deployment controls, and unavoidable native Windows operations.

### TRUE STOP
Only when local actionable debt is zero, all required security/DB/RPC/compat/import/worker/file/document/report/performance/desktop/certification work is evidenced on the exact candidate, and only Owner/External/Product Decision items remain.
