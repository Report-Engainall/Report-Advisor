# Report Advisor — Current Execution Table

> **Updated:** 2026-09-04 02:48 +03. This is the compact current-state surface. Authoritative historical execution remains `docs/MASTER_EXECUTION_INDEX.md`; detailed 30h evidence is recorded in `docs/EVIDENCE/2026-09-04_DEEP_FORENSIC_RESCAN_30H.md`. Exact-SHA evidence never crosses a candidate boundary.

**Current repository HEAD:** `c2824cc8dac9677bb3859617d1298c7a38c72351`  
**Latest product-code/test HEAD:** `0fa2e6970c5203ca6a36dd7e076162d48a0488c5`  
**Previous product mutation:** `e6f27cf5885acc6bb1e29e4cd977e274bad08f16`  
**Status:** **NOT 100% CERTIFIED — FAIL CLOSED**  
**Engineering/product implementation:** **~92%**  
**Operational/runtime evidence:** **~76%**  
**Production certification readiness:** **~58%**  
**Overall honest closure readiness:** **~83%**

| ✓/◐/✗ | ID | Phase / area | What is completed | What remains | Mode | Owner device |
|---|---|---|---|---|---|---|
| ✓ | P0-01 | Foundation / architecture | App shell, routing, canonical/compat boundaries, error boundary, Vite production structure | Fresh current-head Quality/typecheck/build consumption | Parallel | No |
| ◐ | P0-02 | Authentication | Supabase Auth, persistent session, AuthGate, fail-closed tenant resolution | Current deployed-head authenticated browser proof; leaked-password protection | Sequential after deploy | Yes |
| ✓/◐ | P0-03 | Tenant isolation | DB/RLS adversarial boundary proven; 81/81 public tables with RLS in last live audit | Current deployed-head Tenant A/B browser denial + persisted evidence | After deployment | Yes |
| ◐ | P0-04 | RBAC / authority | Membership and active/default membership; self-approval and active-assignee guards | Canonical business-role authority contract for approval/mutations | Parallel | Product decision may be required |
| ◐ | P0-05 | SECURITY DEFINER | 33 public SD functions audited; locked `pg_catalog` paths; no anonymous/public policy exposure in recorded audit | Least-privilege EXECUTE decision/proof for 19 authenticated-executable routines | Parallel | Only authority decision if needed |
| ◐ | P0-06 | Canonical data truth | Dashboard/report canonical RPCs, tenant scoping, null/unknown semantics and bounded reads | Fresh exact-head integration + real data E2E | Parallel | No |
| ✓/◐ | P1-01 | Import | Reconciliation, transactional lifecycle, monotonic progress, terminal replay protection, bounded canonical + compat history read | Golden Excel/Onyx authenticated E2E + large-file/scale proof | Parallel | No |
| ◐ | P1-02 | Document/OCR | Routing, extraction envelope, provenance/lineage, OCR contracts, golden fixtures | Arabic Golden Corpus runtime + accuracy/confidence/error evidence | Parallel | Corpus only if local-only |
| ✓/◐ | P1-03 | Decision/Evidence/Outcome | One-to-one linkage, provenance, outcome validation, work-item terminal/assignee guards | Authenticated end-to-end lifecycle + authority/RBAC proof | Parallel | Real session for final proof |
| ✓/◐ | P1-04 | Worker/queue | Lease/heartbeat/checkpoint/retry/fencing/DLQ contracts; DB terminal branches live-proven | Real crash→expiry→retry→duplicate/fencing→DLQ→recovery runtime | Parallel | No initially |
| ◐ | P1-05 | Watched folder | Stability wait, traversal defense, dedupe, rescan/delete logic | Watcher→ingestion authenticated E2E + Windows exact-head evidence | Parallel | Conditional |
| ◐ | P1-06 | Storage | Tenant/path/owner-aware policies | Canonical bucket contract + authenticated upload/read/delete runtime; recorded live bucket count was 0 | Parallel | Browser/product decision |
| ◐ | P1-07 | Realtime | No published application tables/channel consumer in recorded live state; no fake PASS | Resolve release requirement; implement/prove if required | Parallel | No |
| ◐ | P1-08 | AI/vector | Capability/routing architecture | Tenant-isolated retrieval + provenance runtime proof if in scope | Parallel | Conditional |
| ◐ | P1-09 | Reports/export | Canonical report sources, bounded pages, SHA-256 artifact integrity | Authenticated report→artifact→provenance E2E + PDF/RTL visual acceptance | Parallel | Final browser proof |
| ◐ | P1-10 | Performance/scale | Query-bound contracts; 43 unused-index INFO notices classified non-blocking | Fresh EXPLAIN, benchmark, concurrency, large-tenant and report-generation evidence | Parallel | No |
| ◐ | P1-11 | Backup/restore/DR | Safety contracts: non-prod targets, HTTPS/no URL creds, bounded timeout, private-target rejection, fail-closed DNS | Real backup + isolated restore + integrity + RPO/RTO | Sequential | Yes |
| ◐ | P1-12 | Rollback/forward recovery | Ownership/READY safeguards and protected drill contract | Authorized real rollback + forward recovery evidence | Sequential | Yes |
| ◐ | P2-01 | UI/UX | RTL screens, dashboard/report/intelligence surfaces, loading/error/empty states; Arabic visual system refined | Full mobile/desktop/RTL browser acceptance | After runtime | Yes |
| ◐ | P2-02 | Desktop/Windows | Electron watcher/native smoke logic | Exact-head Windows evidence; Electron 44 remediation branch still open | Parallel | Conditional |
| ✓/◐ | P2-03 | Observability/governance | Execution enforcement, adaptive governance, evidence lineage, exact-SHA rules | Fresh current-head CI + live operational signal proof | Parallel | No |
| ✗ | P2-04 | Release/certification | Certification schema/manifests/gates exist | Fresh exact-head Quality, current deployment, runtime, A/B, DR, rollback, final evidence bundle | Final sequential | Yes for protected steps |

## Last ~30h — closure ledger summary

| ✓ | Closure family | Result |
|---|---|---|
| ✓ | SECURITY DEFINER search-path closure | Real relation-qualification defect fixed; autonomy helpers hardened |
| ✓ | Resilience outbound target security | IPv6 + IPv4-mapped IPv6 private-target rejection hardened |
| ✓ | Governance/enforcement | Index-only boundary made deterministic; adversarial/test-of-test coverage strengthened |
| ✓ | Worker lifecycle | Durable dead-letter transition restored and DB branches live-proven |
| ✓ | Import lifecycle | Monotonic progress + terminal resurrection protection + test-of-test |
| ✓ | Decision↔Recommendation | One-to-one uniqueness + locking + overwrite/reassignment denial |
| ✓ | Approval lifecycle | `CANCELLED` reconciled as terminal with provenance + reopen protection |
| ✓ | Active assignee | Inactive tenant members rejected by decision work-item creation |
| ✓ | Recommendation outcome provenance | Decision provenance required on formerly open paths |
| ✓ | Data truth / report / export | Canonical sources, bounded reads, null/unknown semantics maintained |
| ✓ | Compatibility query boundary | `fetchImportRecords()` bounded to 500 with exact count and explicit overflow failure |
| ✓ | UI Arabic refinement | RTL dashboard visual system refined |
| ✓ | Live forensic discipline | No old runtime/production evidence promoted to newer SHA |
| ✓ | Migration lineage | Remote migration-history reconciliation recorded; no replay DDL in lineage-only files |
| ✓ | Production forensic inspection | Prior READY deployment identity verified; current candidate remains a separate evidence boundary |

## Current open release-critical work

| Priority | Task | State | Dependency | Next operation |
|---|---|---|---|---|
| P0 | Fresh Quality for `0fa2e697...` | OPEN | None | Run/consume exact-head Quality; investigate any first failure and repair |
| P0 | Integrate PR #305 security/product hardening | OPEN | Current main rebase | Rebase/retarget; resolve conflicts; exact-head CI |
| P0 | Integrate PR #307 test-of-test repair | OPEN | #305 | Land #305 first or fold equivalent repair, then rebase #307 and rerun CI |
| P0 | Integrate PR #308 autonomy/exact-head certification hardening | OPEN / DRAFT | #305/#307 overlap | Rebase/retarget after accepted baseline; resolve final-cert/autonomy checker overlaps; rerun all gates |
| P0 | Current deployment + authenticated runtime | UNPROVEN | Fresh Quality + merged candidate | Establish current deployment, then authenticated browser proof |
| P0 | Tenant A/B live certification | UNPROVEN | Authenticated runtime | Execute A/B denial matrix and persist exact-head evidence |
| P1 | Approval/RBAC authority contract | PARTIAL | Business role semantics | Define canonical authority; implement only if required; adversarial test |
| P1 | SECURITY DEFINER least privilege | PARTIAL | Authority contract | Classify 19 authenticated-executable functions and justify/restrict only where contract allows |
| P1 | OCR Golden Corpus | PARTIAL | Corpus + runtime | Execute Arabic corpus; capture accuracy/confidence/error evidence |
| P1 | Worker real runtime recovery | PARTIAL | Runtime environment | Crash/lease-expiry/retry/fencing/DLQ/recovery test |
| P1 | Watched folder E2E | PARTIAL | Windows/runtime | File event→watcher→ingestion→worker→result proof |
| P1 | Storage runtime | UNPROVEN | Bucket decision | Establish canonical bucket contract then authenticated upload/read/delete proof |
| P1 | Realtime | REQUIREMENT OPEN | Product scope | Decide whether required; if yes implement tenant-safe channel and reconnect proof |
| P1 | AI/vector | UNPROVEN | Release scope/model environment | Tenant/provenance runtime proof if required |
| P1 | Performance/scale | PARTIAL | Representative data | EXPLAIN + concurrency + large-tenant benchmark |
| P1 | Backup/restore/RPO/RTO | UNPROVEN | Protected recovery access | Backup→isolated restore→integrity→timings |
| P1 | Rollback/forward recovery | UNPROVEN | Protected deployment access | Authorized drill + forward recovery |
| P2 | Desktop Electron 44 | OPEN | PR #207 rebase | Rebase exact head and consume Windows/native evidence |
| P2 | Final certification bundle | BLOCKED | All P0/P1 evidence | Assemble only current exact-SHA evidence; final gate last |

## Open PR disposition

| PR | Current assessment | Required action |
|---|---|---|
| #308 | **ACTIVE CRITICAL** — autonomy runtime reconciliation + exact-head/final-cert hardening; DRAFT/non-mergeable | Rebase after #305/#307 accepted; do not merge as-is |
| #307 | **ACTIVE CRITICAL** — execution-enforcement test-of-test repair; DRAFT/non-mergeable | Depends on #305; rebase and rerun |
| #305 | **ACTIVE CRITICAL** — watched-report direct-DML boundary, terminal approval guard, file-security/security hardening | Fresh Quality previously failed on its candidate; incorporate #307-equivalent repair before merge |
| #304 | **STALE / REVIEW REQUIRED** — migration lineage restoration | Compare against current 239-file lineage; no blind merge |
| #303 | **LIKELY SUPERSEDED** — dashboard adapter hardening from older baseline | Verify current main; close/supersede if already present |
| #302 | **LIKELY SUPERSEDED** — profitability RPC closure from older baseline | Verify current main; close/supersede if present |
| #301 | **LIKELY SUPERSEDED** — BI overflow regression from older baseline | Verify current main; close/supersede if present |
| #300 | **SUPERSEDED CANDIDATE** — broad old-baseline hardening integration | Do not merge wholesale |
| #294 | **SUPERSEDED CANDIDATE** — old P0 integration branch | Do not merge wholesale |
| #207 | **ACTIVE SECURITY/DESKTOP** — Electron 44.0.0 | Rebase, exact-head CI/Windows evidence, then merge if clean |

## Assistant parallel execution matrix

| Workstream | Can run now? | Sequence dependency | Assistant action |
|---|---|---|---|
| RPC signature/consumer sweep | ✓ | None | Scan canonical + compat consumers and RPC contracts |
| SECURITY DEFINER audit | ✓ | None | Re-audit search_path, qualification, EXECUTE and authority |
| UI truth/RTL sweep | ✓ | None | Check loading/error/empty/unknown/zero and cross-surface equivalence |
| Import/report/export bounds | ✓ | None | Check limits, counts, pagination, deterministic ordering, N+1 |
| Worker lifecycle | ✓ | None | Adversarial state-machine audit + runtime harness preparation |
| OCR/document | ✓ | None | Audit contracts/fixtures and prepare corpus evidence |
| Storage/Realtime/AI | ✓ | Scope decisions only block implementation, not audit/preparation | Audit and prepare required proof |
| Performance/scale | ✓ | None | EXPLAIN/benchmark plan and query-risk audit |
| Certification manifest | ✓ | None | Prepare exact-SHA evidence collector and bundle |
| PR disposition | ✓ | None | Compare open PRs against current main; avoid stale merges |
| Supabase live mutation | ✗ | Permission currently unavailable in connected session | Owner/tool-access boundary; no unsafe workaround |
| Authenticated browser | ✗ | Real credentials/session | Owner device |
| Backup/restore | ✗ | Protected recovery control plane | Owner device |
| Rollback/forward recovery | ✗ | Protected deployment authorization | Owner device |
| Windows native smoke | Conditional | Local Windows boundary | Owner device only if CI cannot provide exact-head evidence |

## Mandatory sequential chain

`CURRENT PRODUCT/TEST HEAD → #305/#307/#308 integration and conflict resolution → FRESH QUALITY → CURRENT DEPLOYMENT → AUTHENTICATED E2E → TENANT A/B → LIVE CERTIFICATION EVIDENCE → BACKUP/RESTORE/RPO/RTO → AUTHORIZED ROLLBACK → FORWARD RECOVERY → FINAL CERTIFICATION`

Independent audits/preparation remain parallel throughout. Protected production/recovery actions remain sequential and owner-controlled.

## Owner-only minimum workload

| ID | Exact action | Why owner/device | Return evidence |
|---|---|---|---|
| OWNER-AUTH-01 | Login with real Tenant A and Tenant B accounts in isolated browser sessions | Real credentials + interactive browser | Run/evidence IDs, timestamps, exact deployed SHA |
| OWNER-AUTH-02 | Enable Supabase leaked-password protection | Auth control-plane setting unavailable to connected tools | Non-secret enabled state |
| OWNER-RUN-01 | Execute authenticated E2E + A/B adversarial matrix | Real browser/session | Exact-head runtime artifact |
| OWNER-DR-01 | Create approved backup and isolated non-production restore | Protected recovery operation | Backup/restore IDs, hashes, timings, integrity, RPO/RTO |
| OWNER-DR-02 | Execute approved rollback + forward recovery drill | Protected deployment authorization | Deployment IDs, health, timestamps, recovery result |
| OWNER-WIN-01 | Run exact-head Windows watcher smoke if CI evidence unavailable | Local Windows filesystem/device | Exact SHA + logs/artifact |
| OWNER-PROD-01 | Perform unavoidable protected production authorization | Credential/approval boundary | Non-secret operation result |

## 100% release definition

All boxes below must be true simultaneously:

- [ ] Fresh current-head required CI/Quality passes.
- [ ] Current deployed SHA exactly matches the certified candidate.
- [ ] Authenticated browser E2E passes.
- [ ] Tenant A/B adversarial isolation is live-proven and persisted.
- [ ] Approval/mutation authority contract is canonical and proven.
- [ ] SECURITY DEFINER EXECUTE exposure is least-privilege and justified.
- [ ] Import + worker + document/OCR + report/export are proven with representative real data.
- [ ] Arabic OCR evidence is complete if in release scope.
- [ ] Watched-folder ingestion is proven on target OS if in scope.
- [ ] Storage is proven if in scope.
- [ ] Realtime is proven or explicitly removed from scope.
- [ ] AI/vector is proven if in scope.
- [ ] Performance/scale targets are met with real benchmark/plan evidence.
- [ ] Backup/restore/integrity/RPO/RTO evidence exists.
- [ ] Rollback/forward recovery evidence exists.
- [ ] Production binding is current and exact-SHA bound.
- [ ] Final certification bundle is complete and independently consumable.
- [ ] Actionable execution debt = 0.

**Fail closed:** `CI PASS ≠ Runtime PASS ≠ Production Certification`. Historical evidence never certifies a newer SHA. Index updates never count as capability closure by themselves.