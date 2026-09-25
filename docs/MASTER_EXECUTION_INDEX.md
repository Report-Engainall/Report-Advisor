# CURRENT EXECUTION BOUNDARY — 2026-09-25 / PHASE-F CASH-ACCOUNT PARITY WAVE

- MAIN HEAD OBSERVED BEFORE THIS WRITE: `d99ebb5ebe4f5891cb5e6126c4f2dcfc094b0368`.
- CURRENT CODE/TEST CANDIDATE: `cbd2d4fd1eab522f093dc1bc1bde3fb0b096fe25`.
- GOVERNANCE HEAD BEFORE THIS WRITE: `d99ebb5ebe4f5891cb5e6126c4f2dcfc094b0368`.
- CORE CHANGE: restore-parity migration `20260925185000_restore_cash_accounts_schema_parity.sql` reconstructs the live `public.cash_accounts` schema, composite branch/company FK, invariants, index, RLS and ACL; Phase-10 contract locks the shape.
- ROOT-CAUSE EVIDENCE: Phase-F run `36173306548` stopped at logical restore because live source contained `public.cash_accounts` while canonical replay did not create it. This branch fixes that first reproduced gap only.
- NO PRODUCTION MUTATION: live Supabase was inspected read-only; no production DDL was executed.
- OPEN UI: PR #647 remains independent and contains purchase-report truth context plus command-palette focus/keyboard closure.
- NEXT EXECUTABLE ACTION: consume fresh exact-head Phase-F + Quality/Final/Browser/Desktop evidence for `cbd2d4fd...`; repair only the first new runtime failure; merge only after exact-head evidence.
- DO NOT REPEAT: do not transfer Phase-F evidence from `2eb7c69...`; no preview-as-production; no Vercel bypass; no duplicate RPC/runner/import path.


---

---

# CURRENT CONTROL-PLANE BOUNDARY — 2026-09-25 / POST-MERGE PR #632 + UI PR #634

- MAIN HEAD OBSERVED BEFORE THIS INDEX WRITE: `6ef890dc59aabe05efd93e496c863a40e1d28f66` (live-memory write-back commit; functional core merge is `886c3e11afb0304f48b8653001bf5b6a4f039ab5`).
- CORE CODE MERGE: PR #632 merged as `886c3e11afb0304f48b8653001bf5b6a4f039ab5`.
- UI CODE CANDIDATE: PR #634 head `57b19ff9a0bbd56c506f2f8df3f22fbcdd2715be`, rebased onto current main; only Header/Sidebar accessibility closure is pending merge.
- PHASE-F: run `36165329471` is IN_PROGRESS on exact PR #632 head `dcff29f15d4851bd6f48dd863e5a62b29f67519e`; exact-head canary and all pre-probe steps succeeded, live resilience probes are running. Final status is NOT YET PROVEN.
- UI AUTOMATION: PR #634 has exact-head workflows queued/in progress; no fresh UI PASS transferred.
- EXTERNAL HOSTING: Vercel free-plan deployment rate limit remains a deployment-status blocker; do not bypass it or promote preview evidence to production.
- NEXT EXECUTABLE ACTION: consume Phase-F live probe result first; repair only the first reproduced failure, then consume fresh exact-head Quality/Enforcement/Final Certification/Browser evidence and merge the UI closure when required checks permit.
- DO NOT REPEAT: PR #632 repair; stale certification evidence; SHA/credential bypass; unsafe merge of PR #634.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / PHASE-F IMPLICIT-PORT FALLBACK REPAIR

- MAIN HEAD BASE → `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CORE CODE/TEST HEAD → `6d4c849f7b9b10f13e71e41bf15f12138c640278`.
- PRECISE FAILURE CONSUMED → Phase-F run `36163768006` on `d4e34ee...`: exact-head/local/static/canary checks passed; logical backup failed because the source remained `db.fnqbvf...supabase.co:5432` over IPv6; production health separately failed exact deployment SHA; rollback drill returned 503.
- ROOT CAUSE → `URL.port` is empty when the connection URI omits the default port, so the prior fallback condition never matched `5432`.
- DONE → `preferIpv4Host()` now treats an omitted port as `5432` and activates the same-project Supabase Pooler fallback; Phase-10 contract now asserts the implicit-port condition.
- CURRENT PROOF → this repair is new and has no fresh CI result yet. No PASS claimed.
- UI LANE → corrected Sidebar JSX closure is on exact UI head `a232508a...`; desktop-windows run `36164338872` remains in progress.
- NEXT → consume the fresh Core exact-head Phase-F/certification set created by this repair; in parallel consume UI build/browser/certification; fix only the first reproduced failure.
- DO NOT REPEAT → no return to direct IPv6 source routing, no production SHA bypass, no stale PASS transfer, no rollback/RPO/RTO claim without the measured artifact.
# CURRENT EXECUTION BOUNDARY — 2026-09-25 / PARALLEL CORE + UI EXECUTION

- MAIN HEAD OBSERVED → `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CORE CODE/TEST HEAD → `d4e34ee9650ed6f8daaff6c9343d8e4a0ba533aa` (PR #632).
- UI CODE HEAD → `a232508aeb7de8669cecc028bc3b146a0aa6d1d3` (PR #633).
- CORE FIX APPLIED → Phase-F logical schema-count query now uses the IPv4-resolved `runnerSource`; source contract guard also binds logical dump to `runnerSource`.
- CORE CURRENT RUN → Phase-F `36163768006` is still `in_progress`; exact-head verification, npm CI, local runtime tests, and static resilience contracts have passed before the live probes step. No Phase-F PASS claimed yet.
- UI FIX APPLIED → repaired the reproduced JSX closure defect in `src/components/Sidebar.tsx` that caused Windows build `36164023271` to fail. Replacement commit is `a232508aeb7de8669cecc028bc3b146a0aa6d1d3`.
- UI CURRENT RUN → desktop-windows `36164338872` is `in_progress` on exact UI head; the earlier JSX transform failure is the defect being revalidated. No current UI PASS claimed yet.
- PRODUCTION → no production mutation or SHA bypass. Current release identity remains a separate gate.
- NEXT → consume exact-head Core Phase-F + certification results and exact-head UI build/browser/certification results; repair only the first reproduced failure on each lane.
- DO NOT REPEAT → no stale PASS transfer, no production SHA bypass, no duplicate navigation/import path, no weakening of resilience or accessibility guards.

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / PHASE-F LOGICAL SOURCE QUERY REPAIR

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE WRITE: `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CURRENT CODE/TEST CANDIDATE: `6d4c849f7b9b10f13e71e41bf15f12138c640278`.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: `6d4c849f7b9b10f13e71e41bf15f12138c640278`.
- DONE: fixed the Phase-F logical backup path so the generated schema-count query uses the resolved `runnerSource` URI, not the original direct DB URI; added a contract guard proving both schema-count and dump use the resolved source. This closes the observed IPv6 direct-host leak in one remaining query.
- RETAINED CORE FIXES: replay-safe `enforce_same_company_reference()` helper; UUID-safe `current_company_id()`; no push trigger on Phase-F; bounded auth clock-skew retry; IPv4-safe source URI resolution.
- EXACT CURRENT-HEAD CI: fresh workflows launched for `1843040...`; no result is transferred from earlier candidates. Phase-F still has a separate production SHA mismatch against live deployment `dcabe46...`; production promotion remains external/authorized path only.
- NEXT: consume Quality/Enforcement/Certification/Browser/Storage/Phase-F exact-head results. If logical restore passes but production SHA remains mismatched, preserve fail-closed boundary and resolve deployment identity through authorized release process.
- DO NOT REPEAT: do not revert to original `source` for any logical DB read; no SHA bypass, no arbitrary host, no stale PASS transfer.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / STORAGE AUTH CLOCK-SKEW RETRY

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE WRITE: 9c4e5f03a53ae211d5ed00077c2fd43a339a7db2.
- CURRENT CODE/TEST CANDIDATE: 10d2d4f5556efa662eba46f235c963f2c75126c5.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: 993778e43d72e77747a67c61cabd49304f962695.
- DONE: Storage Tenant Runtime E2E exposed Supabase Auth "JWT issued at future". The test harness now retries only that exact transient condition (bounded to 12 attempts); normal authentication failures remain fail-closed.
- PRIOR INDEPENDENT CORE FIX RETAINED: logical Phase-F backup now prefers IPv4 hostaddr while preserving source hostname; source candidate b8a19ec...
- PRIOR EXACT GATES: Full Product Browser SUCCESS on 993...; Execution Enforcement SUCCESS on 993...; older stable gates are not transferred to 10d2d4...
- PHASE-F: run 36160600882 on b8a19ec... was still in progress at the time of this write; no result transferred.
- NEXT: consume stable CI/Phase-F generated from 10d2d4...; first current-SHA failure only.
- DO NOT REPEAT: no stale PASS transfer, no relaxation of auth/tenant checks, no production-SHA bypass, no historical migration rewrite.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / PHASE-F DEPLOYMENT BOUNDARY + IPV4 BACKUP REPAIR

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE WRITE: `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CURRENT CODE/TEST CANDIDATE: `b8a19ec642955f695e7fe8b8a8525b9fa0918cc5`.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: `bb6bf125474c185670bb0bcf44f75eac8f85b4d8`.
- PHASE-F EXACT RUN `36159874884` → FAILED CLOSED on `bb6bf12...`.
- FIRST LIVE FAILURE → production `report-advisor.vercel.app` returned HTTP 200 but deployment SHA `dcabe46e594cbb070e145882a87dd67fa91ddabe`, not the exact candidate `bb6bf125474c185670bb0bcf44f75eac8f85b4d8`. Tenant canary itself returned HTTP 200.
- SECOND INDEPENDENT FAILURE → logical backup/restore hit `Network is unreachable` to the Supabase source over IPv6; rollback-forward drill returned 503 downstream. This remains separate from the deployment-identity blocker.
- DONE INDEPENDENTLY → `scripts/phase-f-live-resilience-probes.mjs` now prefers an IPv4 `hostaddr` for external logical backup connections while preserving the hostname for TLS. Exact source candidate `b8a19ec...`.
- STABLE PRIOR GATES ON `bb6bf12...` → Quality SUCCESS; Final Certification SUCCESS; Enforcement SUCCESS; Storage Tenant Runtime SUCCESS; Full Product Browser SUCCESS; Device-Independent Browser SUCCESS.
- PRODUCTION TARGET FACT → Vercel project `prj_jcqgz6UKGd6tPgHZlttgFXaXvyvo`, exact READY candidate deployment `dpl_BPRcrUeoQf45cCTAKNeLDwHCfn9o` maps to `bb6bf12...`; current production remains `dpl_Cp3rVDpmEFuzuS4Y6fCDMQcsd5fp` / `dcabe46...`.
- EXTERNAL BOUNDARY → Vercel connector exposes no promote mutation; local PC01 is offline. Do not claim production promotion or Phase-F recovery proof.
- NEXT → consume fresh exact-head CI/Phase-F for `b8a19ec...`; first reproduced current-SHA failure only. When the only remaining Phase-F blocker is production identity, use the supported production-promotion path only after target/recovery authorization is satisfied.
- DO NOT REPEAT → no stale PASS transfer, no production-SHA bypass, no historical migration rewrite, no direct staging SQL used as release proof.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / TENANT-RESOLVER LINEAGE CONTRACT REPAIR

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE WRITE: `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CURRENT CODE/TEST CANDIDATE: `92a32692497234841d942e5548465d54f3ff017e`.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: `4558397568c844ea934bbc46697cdc6e3cd793c9`.
- DONE: fixed `check-tenant-resolver-lineage.mjs`, which incorrectly required the historical `count(*), min(company_id)` UUID aggregation. The contract now proves the intended fail-closed resolver semantics: count active/default memberships, require exactly one, then bounded-select its UUID.
- PRIOR EXACT EVIDENCE: Quality SUCCESS, Storage Tenant Runtime E2E SUCCESS, Execution Enforcement SUCCESS, Full Product Browser E2E SUCCESS on `4558397...`. Final Certification exposed the lineage-contract defect.
- NEXT: consume the stable exact-head workflow set for `92a3269...`; repair only the first new reproduced defect. Phase-F remains the release boundary.
- DO NOT REPEAT: do not reintroduce UUID min aggregation, do not weaken ambiguity protection, do not transfer stale evidence, do not rewrite applied migrations.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / TENANT-RESOLVER CONTRACT REGEX REPAIR

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE WRITE: `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CURRENT CODE/TEST CANDIDATE: `817b9298b08677ea87a0a8deeaaeee4e3e976431`.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: `f23d6f730c535ce858dec42cbf155c93a32205ab`.
- DONE: fixed the next real Final Certification contract failure in `check-tenant-security-contract.mjs`: schema-qualified `public.company_memberships` is now accepted by the bounded tenant SELECT guard without relaxing tenant or security invariants.
- PRIOR EXACT EVIDENCE: Storage Tenant Runtime E2E SUCCESS, Full Product Browser E2E SUCCESS, and Execution Enforcement SUCCESS on the previous stable governed head; Final Certification then exposed the regex defect.
- NEXT: consume the stable exact-head workflow set for `817b9298...`; repair only the first new current-SHA defect; Phase-F remains the release boundary.
- DO NOT REPEAT: no weakening of tenant invariants, no historical migration rewrite, no stale PASS transfer, no branch mutation after the final governance sync.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / TENANT-CONTRACT REPAIR

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE WRITE: `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CURRENT CODE/TEST CANDIDATE: `ec1006f555a17a9c02492e29839c285c7214282e`.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: `ec1006f555a17a9c02492e29839c285c7214282e`.
- DONE: repaired `current_company_id()` with an incremental UUID-safe resolver migration and verified the live staging function; Storage Tenant Runtime E2E is SUCCESS and Full Product Browser E2E is SUCCESS on the prior exact code candidate.
- DONE: corrected `check-tenant-security-contract.mjs` so tenant schema evidence is validated across the full migration chain, while resolver-specific invariants remain bound to the latest resolver definition.
- EXACT CURRENT FAILURE: Quality run `36158568461` failed only at routing/security discovery because the checker incorrectly required `ALTER TABLE company_memberships` in the latest resolver migration. This code-contract defect is fixed at `ec1006f...`; the failure is not transferred as a runtime defect.
- NEXT: consume fresh exact-head workflows for `ec1006f...`; then Phase-F live resilience and final certification. Repair only the first reproduced current-SHA failure.
- DO NOT REPEAT: no stale PASS transfer, no SHA/production bypass, no historical migration rewrite, no weakening of tenant invariants, no direct SQL substituted for source lineage.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / UUID-RESOLVER REPAIR

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE WRITE: `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CURRENT CODE/TEST CANDIDATE: `34f77c248de5bcdb77c77f7fd1a016559c1fd1c5`.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: `34f77c248de5bcdb77c77f7fd1a016559c1fd1c5`.
- DONE: reproduced and fixed the first exact-head Storage/tenant runtime failure: `current_company_id()` used PostgreSQL `min(uuid)`. Added incremental migration `20260925154500_repair_current_company_id_uuid_resolver.sql` without rewriting historical migrations.
- LIVE STAGING REPAIR: the same UUID-safe resolver was applied to `Report-Advisor-P0-2-Staging` (`fnqbvfuwbdpwvhcgzksl`) for immediate runtime proof; source lineage remains the new migration.
- EXACT-HEAD CI: Quality, browser, storage, certification, enforcement and Phase-F workflows launched for `34f77c2...`; certification first failed only because this index still pointed at `a35e5a...`. This write rebinds the governance candidate exactly.
- NEXT: consume fresh exact-head CI results; then Phase-F live resilience. Repair only the first reproduced current-SHA failure.
- DO NOT REPEAT: no stale evidence transfer, no production/SHA bypass, no rewriting applied migration history, no credential bypass.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / PHASE-F RESTORE CANDIDATE

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE REBIND: `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CURRENT CODE/TEST CANDIDATE: `a35e5a08884040a6ad983b24a7820f834ebdb1b9`.
- CURRENT GOVERNANCE HEAD: `a35e5a08884040a6ad983b24a7820f834ebdb1b9`.
- DONE: Phase-F restore chain fixed through the generic tenant-reference helper, dashboard UUID→text fallback, import progress RPC default preservation, watched provenance composite-uniqueness prerequisite, and exact-head certification guard normalization.
- EXACT PHASE-F HEAD: next run executes against `a35e5a08884040a6ad983b24a7820f834ebdb1b9`; prior source probe failure was Docker bridge IPv6/network-unreachable, not database or credential failure.
- CERTIFICATION STATE: index is now explicitly bound to the current execution head; no historical PASS is transferred.
- NEXT: consume Phase-F live restore result, then current-head Final Certification/Enforcement/Browser evidence.
- DO NOT REPEAT: no stale candidate transfer, no SHA bypass, no production bypass.

---

# CURRENT CONTROL-PLANE BOUNDARY — 2026-09-25 / EXACT CANDIDATE DDD

> Exact-head routing header. The code candidate is the tested source SHA; the governance commit that follows must not be mistaken for the code candidate.

- MAIN HEAD OBSERVED BEFORE THIS WRITE: `7159553fcfc9d21304ffff60e1086a34b714ac09`.
- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: `ddd9382f347cc02eb401fee75a9df48beaae7f05`.
- DONE: terminal-approval concurrency migration reference fixed at `647f3c...`; live Phase-F then exposed a real restore defect in `20260828172000_runtime_lifecycle_idempotency_hardening.sql`, now corrected to fully-qualified RLS target columns.
- EXACT LOCAL PROOF: migration schema audit PASS (254 migrations / 0 findings), decision/intelligence closure PASS, TypeScript PASS, Vite build PASS, route/sidebar parity PASS, Product WOW/Executive/Intelligence/Report UI contracts PASS.
- EXACT CLOUD BASELINE: Quality/Final Certification/Execution Enforcement/Full Product Browser E2E succeeded on governed head `d5c618a9...`; no PASS is transferred to `ddd9382f...`.
- PHASE-F FAILURE `36092211529`: target `staging`; canary PASS; deployment identity failed because production currently serves `7be9f014...` instead of exact head; logical restore failed on the unqualified action-receipt RLS policy; rollback drill returned 503.
- PRODUCTION IDENTITY NOW OBSERVED: Vercel production deployment `dpl_F4nkx3kwgxgncjre1Mo34sfp8448` / SHA `7be9f01491384e641f32b31b2753c46fd32f7128`; GitHub main is 12 commits ahead. No current-head production proof.
- NEXT CORE FRONT: consume fresh exact-head gates on `ddd9382f...`; then rerun Phase-F. If deployment identity remains the only live blocker after the restore fix, promote the certified release through the normal main/Vercel path rather than bypassing the SHA guard.
- NEXT UI FRONT: consume fresh exact-head browser/device-independent evidence; only alter UI on a reproduced current-head gap.
- DO NOT REPEAT: no stale PASS transfer, no SHA bypass, no credential bypass, no migration deletion without dependency proof.

# CURRENT CONTROL-PLANE BOUNDARY — 2026-09-22

> HEAD below is the exact GitHub HEAD observed before this write. Never treat it as the SHA of this file's own future commit.

- MAIN HEAD OBSERVED BEFORE THIS WRITE: `a024f263c90c5da9bc65a15482f95b3ab03b0d3b`
- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`
- CURRENT WORKING STATE: current main reconciled to exact candidate; certification-boundary governance rebind pending; Phase-F remains fail-closed; UI/core 50/50 execution remains mandatory.
- LIVE STATE SOURCE: ONE-PROGRAMMER-SESSION-MEMORY.md
- CONTROL PLANE: docs/SYSTEM_HEART.md
- KNOWLEDGE CONSOLIDATION MAP: docs/PROJECT_KNOWLEDGE_MANIFEST.md
- NEXT EXECUTION MODE: 50% UI/surface completion + 50% product-heart/runtime/data/security/certification/consolidation, parallel when independent.
- NON-NEGOTIABLE: reconcile exact GitHub HEAD before every session.
- CURRENT CONSOLIDATION STATUS: CONTROL_PLANE_ESTABLISHED / CONTENT_MIGRATION_PENDING.
- NEXT EXECUTABLE CORE FRONT: consume fresh Enforcement + Final Certification after this candidate rebind; continue Phase-F only after authorized valid live resilience configuration.


> HEAD below is the exact GitHub HEAD observed before the current control-plane write. Never treat it as the SHA of this file's own future commit.

- MAIN HEAD OBSERVED BEFORE THIS WRITE: 9e1586ddecec31dd29ca9385d88236adb2307d90
- CURRENT CODE/TEST CANDIDATE: 28691df0781b101ddf053425d5d6eddee999438a
- CURRENT WORKING STATE: canonical knowledge control plane established; content migration remains active; UI 50% + core 50% execution remains mandatory.
- LIVE STATE SOURCE: ONE-PROGRAMMER-SESSION-MEMORY.md
- CONTROL PLANE: docs/SYSTEM_HEART.md
- KNOWLEDGE CONSOLIDATION MAP: docs/PROJECT_KNOWLEDGE_MANIFEST.md
- NEXT EXECUTION MODE: 50% UI/surface completion + 50% product-heart/runtime/data/security/certification/consolidation, parallel when independent.
- NON-NEGOTIABLE: reconcile the exact GitHub HEAD before every session. Do not resume from a historical phase because an old entry below names it.
- CURRENT CONSOLIDATION STATUS: CONTROL_PLANE_ESTABLISHED / CONTENT_MIGRATION_PENDING.
- NEXT EXECUTABLE CONSOLIDATION FRONT: continue remaining source-family absorption into the canonical domain masters, verify references/dependencies and affected contracts, then gate archive/remove separately.

> This header is authoritative for session-resume routing. Historical entries below remain evidence/history and must not override it.

- MAIN HEAD: ec7db7e503af15af42045df1107a3eb5dc8e27db
- CURRENT CODE/TEST CANDIDATE: 28691df0781b101ddf053425d5d6eddee999438a
- CURRENT WORKING STATE: governance/control-plane consolidation is active; the latest main commits after the tested code candidate are documentation/governance changes.
- LIVE STATE SOURCE: ONE-PROGRAMMER-SESSION-MEMORY.md
- CONTROL PLANE: docs/SYSTEM_HEART.md
- KNOWLEDGE CONSOLIDATION MAP: docs/PROJECT_KNOWLEDGE_MANIFEST.md
- UI MASTER: docs/MASTER_UI_UX_REFERENCE.md
- ENGINEERING MASTER: docs/MASTER_ENGINEERING_ARCHITECTURE.md
- DATA/SECURITY MASTER: docs/MASTER_DATA_TRUTH_SECURITY.md
- RUNTIME/CERTIFICATION MASTER: docs/MASTER_RUNTIME_CERTIFICATION.md
- COMMERCIAL MASTER: docs/MASTER_COMMERCIAL_REFERENCE.md
- NEXT EXECUTION MODE: 50% UI/surface completion + 50% product-heart/runtime/data/security/certification/consolidation, in parallel when independent.
- NON-NEGOTIABLE: reconcile the exact GitHub HEAD before every session. Do not resume from a historical phase because an old entry below names it.
- CURRENT CONSOLIDATION STATUS: control plane established; content absorption is the next documentation front. No legacy document is yet approved for deletion solely because of duplication.

## CURRENT EXECUTION BOUNDARY — 2026-09-22 / WAVE 102 — UNIFIED IMPORT HISTORY CLOSURE

> Exact-head evidence only. The current code/test candidate is the exact SHA where the Import Center contract, bounded history focus, DataTable pagination, and Browser E2E were freshly proven.

- CURRENT MAIN HEAD OBSERVED: `28691df0781b101ddf053425d5d6eddee999438a`.
- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- DONE: fixed `scripts/check-import-center-product-contract.mjs` so `missingDataTable` is initialized before validation; the previously masked contract defect is now exposed rather than hidden.
- DONE: restored real bounded pagination controls in `src/components/ui/DataTable.tsx`; the component now provides previous/next navigation and explicit Arabic table-navigation semantics.
- DONE: preserved bounded import-history reads while adding an exact `focusJobId` readback path in canonical `fetchImportRecords`.
- DONE: `queries-compat.ts` now forwards `fetchImportRecords` to the canonical implementation instead of owning a duplicate implementation.
- DONE: Browser E2E trigger now explicitly covers `src/components/ui/DataTable.tsx`.
- EXACT-HEAD LOCAL PROOF: Import Center product contract PASS; TypeScript typecheck PASS; Execution Enforcement protocol PASS on `28691df...`.
- EXACT-HEAD QUALITY: GitHub Actions Quality run `35778954134` / job `106919207242` completed SUCCESS with all 63 release-readiness steps successful, including lint, build, performance budget, tenant RLS, import contracts, and intelligence/production contracts.
- EXACT-CODE BROWSER PROOF: Full Product Browser E2E run `35778953810` / job `106919205127` completed SUCCESS on exact `28691df...`; authenticated real-business persistence reached authoritative import completion and canonical persistence, and the prior history readback timeout did not recur.
- CURRENT GOVERNANCE REBIND REQUIRED: Execution Enforcement run `35778953651` and Final Certification run `35778953731` on `28691df...` failed only because the Master Index still pointed to `772afb548f6c381e2e3c6596a57d108ce6d2eebf`; no new product/runtime failure was reproduced there.
- PHASE-F BLOCKER: `RESILIENCE_LOGICAL_SOURCE_DB_URL` remains invalid/stale; live backup/restore, measured RPO/RTO, and rollback remain NOT PROVEN. Do not invent or guess the credential.
- HOSTING BLOCKER: connected Vercel production's newest observed production deployment is commit `84db430a0cde48963d7ff9045342bc31dc2d6063`; no current-candidate Production deployment exists for `28691df...`, so current-head production proof remains NOT PROVEN.
- OPEN OPERATIONAL DEBT: 151 `import_jobs` remain in `processing` at progress 0; no unsafe terminalization or deletion was performed.
- PRECISE NEXT ACTION: consume fresh Enforcement + Final Certification evidence after this index rebind, then continue Phase-F only after an authorized valid resilience source credential is available.
- DO NOT REPEAT: do not weaken the certification boundary or browser assertions; do not transfer production evidence from `84db430...` to `28691df...`; do not rerun Phase-F with the unchanged invalid credential; do not mutate the 151 stale jobs without a governed recovery contract.

## CURRENT EXECUTION BOUNDARY — 2026-09-22 / WAVE 91 — EXACT-HEAD CANDIDATE REBIND
- CURRENT_CODE_TEST_CANDIDATE: `fc0a84d85e56f43112df7e07886a9f6c04089998`.
- CURRENT GOVERNANCE HEAD: `f1c7685344da1cd202819b74e871c13e379170e7`.
- REASON: the current source candidate is the exact SHA where the unified document import regression was fixed and source/build contracts were freshly verified. Later commits are governance-only memory records.
- VERIFIED: Product WOW UI contract PASS; connections/language contract PASS; Vite production build PASS; unified decision/evidence/action/learning/runtime contracts PASS.
- PRECISE NEXT ACTION: consume fresh Phase-F and Final Certification evidence against the exact candidate lineage; repair only a reproduced current-SHA failure.
- DO NOT REPEAT: do not weaken certification boundary; do not transfer historical certification; do not create parallel import/document paths.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 65 — EXACT-HEAD CERTIFICATION REBIND

> Exact-head evidence only. No historical runtime result is transferred.

- CURRENT_CODE_TEST_CANDIDATE: `30cf5d6ecf5a91e65642a38df31087498f4e356c`.
- CURRENT GOVERNANCE HEAD: `30cf5d6ecf5a91e65642a38df31087498f4e356c`.
- DONE: Work Center explicitly labels the 500-row read as a bounded display window and no longer presents `rows.length` as `إجمالي السجل`.
- DONE: UI contract guards the bounded semantics.
- VERIFIED: source re-read on exact SHA; Supabase history index remains present; staging currently has `import_jobs=4477`; `backup_verification_runs=0`.
- VERIFIED: fresh exact-head verification has been triggered for `30cf5d6...`; predecessor quality failure was the Dashboard hook-order defect, now repaired.
- ROOT CAUSE CLOSED: certification parsing selected historical `84a62...` because the current boundary used the non-canonical `CURRENT CODE/TEST HEAD` wording.
- NETLIFY: READY production deploy is on old commit `21f6562...`; not current-head evidence.
- PHASE-F: canonical workflow remains fail-closed until the required live resilience configuration is actually provisioned.
- PRECISE NEXT ACTION: consume fresh Final Certification Gate + Execution Enforcement Contract on `30cf5d6...`, then continue Phase-F backup/restore/RPO/RTO/rollback evidence.
- DO NOT REPEAT: do not transfer historical PASS, do not mislabel bounded history, do not use old Netlify deploy as current, do not invent Phase-F configuration.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 63 — DASHBOARD UI + EXACT-HEAD PROOF OPEN

> Exact-head evidence only. No historical runtime result is transferred.

- CURRENT CODE/TEST HEAD: `476c4bb827c3a2d485726af6b2e5d3e5391ff33a`.
- DONE: Dashboard next action is now derived from live truth/decision state and rendered in both the decision brief and NEXT ACTION surface.
- DONE: Product WOW UI contract guards the new derivation and canonical route/rationale binding.
- VERIFIED: Supabase staging still exposes `idx_import_jobs_company_created_id`; `backup_verification_runs=0`; `import_jobs=4477`.
- NOT VERIFIED: fresh CI/build/browser runtime for `476c4bb...`; no PASS transferred from `84a62...`.
- PHASE-F: canonical workflow remains fail-closed until live resilience configuration is actually provisioned; required configuration includes `RESILIENCE_MAX_RPO_SECONDS` and backup/restore runtime target/credentials. No values invented.
- PRECISE NEXT ACTION: consume or trigger the first fresh exact-head verification path for `476c4bb...`, while closing the external Phase-F configuration gate through the existing workflow.
- DO NOT REPEAT: do not transfer historical browser/certification evidence; do not recreate import paths; do not weaken the Phase-F fail-closed guard.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 62 FINAL — RUNTIME PASS + PHASE-F EXTERNAL BLOCKER

> Exact-head evidence only. No historical production runtime result is transferred.

- CURRENT CERTIFIED MAIN BASELINE: `5367346e2837a06a4d1787bb016399245f213792`.
- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- DATABASE FIX VERIFIED: migration `20260921194500_import_history_recent_window_index.sql` was committed and applied to Supabase staging; `idx_import_jobs_company_created_id` exists.
- EXACT-HEAD BROWSER RESULT: Full Product Browser E2E for `84a62...` completed **SUCCESS**. Build, exact checkout, app start, authenticated E2E contract, full product browser E2E, KPI evidence persistence, and real-business browser evidence completed without failure.
- ROOT CAUSE CLOSED: the real-business E2E timeout was an import-history scale/performance boundary on a tenant with 4,471 import jobs; the bounded query lacked its matching composite index.
- REPOSITORY CI ON MAIN BASELINE: quality, Final Certification Gate, Execution Enforcement Contract, Final Execution Batch, and Storage Tenant Isolation all PASS.
- PHASE-F RESULT: governed same-repo PR #611 executed the real Phase-F workflow. Checkout, local operational resilience, static resilience contracts, continuous trust, and authenticated canary session all PASS. Live resilience probes fail-closed with `PHASE_F_STATUS=BLOCKED EXTERNAL` because required live resilience configuration is not provisioned; at minimum `RESILIENCE_MAX_RPO_SECONDS` and backup/restore runtime credentials/config are absent.
- SUPABASE PROJECT STATE: `ACTIVE_HEALTHY`; database host is `db.fnqbvfuwbdpwvhcgzksl.supabase.co`. This does not substitute for restore/RPO/RTO evidence.
- VERCEL: current production build status remains blocked by `build-rate-limit`; no current-head Vercel production PASS is claimed.
- PRECISE NEXT ACTION: provision the missing Phase-F live resilience configuration in the GitHub execution environment, rerun Phase-F, and consume real backup/restore + RPO/RTO + rollback evidence. Then continue worker/server-boundary → tenant A/B → server OCR → watched-folder runtime → final production certification.
- DO NOT REPEAT: do not treat local/source resilience contracts as RPO/RTO proof; do not transfer browser PASS to old Vercel deployments; do not invent missing secret values; do not merge the closed probe branch.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 61 — IMPORT HISTORY DATABASE PERFORMANCE

> Exact-head evidence only. No historical runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- ROOT CAUSE CONFIRMED: `import_jobs` had no composite index for the exact bounded history order/filter `company_id, created_at DESC, id ASC`; the affected tenant had 4,471 import jobs.
- FIX APPLIED: migration `20260921194500_import_history_recent_window_index.sql` creates `idx_import_jobs_company_created_id`.
- DB PROOF: Supabase staging now exposes that index in `pg_indexes`.
- UI/query FIX from Wave 60 remains: bounded recent history read without global exact count.
- PRECISE NEXT ACTION: exact-head Browser E2E on `84a62...`, with emphasis on unified import history readback; then consume quality/certification and continue Phase-F/RPO-RTO.
- DO NOT REPEAT: do not restore global count rejection; do not remove the composite history index; do not transfer f6d6 browser evidence to 84a62.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 60 — IMPORT HISTORY SCALE CLOSURE

> Exact-head evidence only. No historical runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- ROOT CAUSE CLOSED: `fetchImportRecords()` rejected any tenant with more than 500 import rows because it requested `count: 'exact'` and converted `count > 500` into `REPORT_QUERY_LIMIT_EXCEEDED`.
- LIVE E2E OBSERVATION: the affected tenant had 4,471 import jobs; the newly imported customer job itself completed successfully with one canonical row and provenance. The UI history failed only when rendering the bounded history because the read function rejected the large total count.
- FIX: canonical and compatibility import-history reads now use only the existing bounded latest-500 window; no global count query, no unbounded tenant read, no new RPC, and no new import route.
- UI: the import history header explicitly states that it shows the latest 500 while older records remain stored.
- NEXT: fresh exact-head quality, certification, final execution, storage, and browser E2E on `f6d6...`; then re-check real business persistence and continue Phase-F/RPO-RTO.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 58 FINAL — CERTIFIED UI CLOSURE, RUNTIME BLOCKER

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- GOVERNED MAIN DESCENDANT CERTIFIED: `2b9d28c9a1a8fa12677c03f11b7ba94e2a3dbac7` (documentation/governance descendants only).
- CI PASS: quality, Execution Enforcement Contract, Final Execution Batch, Storage Tenant Isolation, Final Certification Gate.
- UI DONE: Connections source status and next action are state-derived and guarded.
- RUNTIME BOUNDARY: current main has Vercel `failure / build-rate-limit` and Vercel deployment `pending`; no live/browser PASS is claimed.
- BACKUP/RPO-RTO: source-level contracts are PASS, but staging still reports `backup_verification_runs=0`; restore/RPO/RTO runtime proof remains open.
- PRECISE NEXT ACTION: obtain a real exact-head deployment/browser runtime result for `2b9d28c9...`; then run/consume governed Phase-F backup/restore → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not transfer old Vercel READY deployments, do not call source contracts runtime evidence, do not fabricate E2E secrets or browser sessions, do not bypass Phase-F gates.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 58 — CONNECTIONS STATE-DRIVEN UI

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- DONE: Connections summary is now state-derived: proven/bounded/adapter counts and next-source action come from the existing connector array.
- UI CONTRACT: current Product WOW contract guards the new state-derived summary.
- ARCHITECTURE: no new route/RPC/runner/importer/tenant/calculation path.
- PRECISE NEXT ACTION: consume fresh quality/enforcement/final-certification for `cbfb...`; then exact-head runtime/browser, backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not restore hard-coded connector counts or generic next-source text; do not transfer `9684...` certification evidence to this new SHA.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 57 — CURRENT-SHA UI CONTRACT REPAIR

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- DONE: corrected the Work Center UI contract guard so it asserts the actual null-safe `expiredActive` expression used by the current implementation.
- ROOT CAUSE OF THE FRESH CERTIFICATION FAIL: source guard drift, not a product/runtime failure.
- NO ARCHITECTURE CHANGE: only `scripts/check-product-wow-ui-contract.mjs` changed in this correction.
- PRECISE NEXT ACTION: consume fresh quality/enforcement/final-certification runs for `c88abe...`; repair only a reproduced current-SHA failure, then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not restore the stale literal assertion; do not weaken the guard to accept both correct and incorrect optional-state implementations; do not transfer certification from `88323...`.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 56 — EXACT-HEAD CERTIFICATION REBIND

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- EXACT-HEAD QUALITY: 20/20 release-readiness stages PASS on this SHA after closing three typecheck defects exposed by the runner.
- CURRENT CERTIFICATION DIAGNOSIS: certification/enforcement gates rejected the run because their index still pointed to `435534c9...` while current code/test was `88323d3f...`.
- CORRECTION IN THIS WAVE: certification index/reference is being rebound to the real current code/test SHA through the existing governance files; no boundary weakening or bypass.
- PASSING INDEPENDENT RUNS ON CURRENT SHA: UI route completeness, storage tenant isolation, and Final Execution Batch.
- CURRENT RUNTIME BOUNDARY: Vercel runtime evidence is still not current-head proof; older READY deployments are not transferred.
- PRECISE NEXT ACTION: consume fresh Execution Enforcement Contract + Final Certification Gate after this rebind; repair only a reproduced current-SHA failure, then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 55 — WORK CENTER OPERATIONAL ACTIONABILITY

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- UI IMPLEMENTATION: `src/pages/WorkCenterPage.tsx` at the current main code head; the exact implementation is source-re-read and bound by the product UI contract.
- UI CONTRACT: `scripts/check-product-wow-ui-contract.mjs` now asserts the state-derived next-action branches, canonical import action, filter actions, `aria-pressed`, and `aria-live`.
- DONE: Work Center now turns the live operational state into a concrete next action without inventing runtime state or creating a second workflow.
- EXACT SOURCE VERIFICATION: compare from `b01ae295...` to this candidate contains only `WorkCenterPage.tsx` and `check-product-wow-ui-contract.mjs`.
- CURRENT BUILD/DEPLOY BOUNDARY: Vercel current-head `failure` / `build-rate-limit`; Vercel deployment context `pending`; GitHub Actions exposes no workflow run for the current SHA. No current-head build/browser/runtime PASS is claimed.
- PRECISE STOP POINT: UI/actionability/accessibility closure is implemented and source-guarded; external runtime certification remains the execution boundary.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `435534c9...`; repair only a reproduced current-SHA failure, then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not transfer older READY deployments; do not treat source guards as runtime certification; do not add parallel import/decision paths; do not use fake sessions or weaken deployment identity checks.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 54 — EXACT-SHA PHASE-F + LIVE SECURITY/DB CLOSURE

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- PHASE-F PROBE: `97a52c0772089609ee3a5a5fb346839a3f8c6601`.
- PHASE-F CONTRACT GUARD: `91536018fb02b8918874c28ecedfb8ef7d5e5df3`.
- IMPORT PERFORMANCE MIGRATION: GitHub file `supabase/migrations/20260921182858_20260921183000_import_fk_performance_indexes.sql`; live migration version `20260921182858` / name `20260921183000_import_fk_performance_indexes`.
- LIVE SECURITY MIGRATION: repo migration `20260830061000_close_public_rpc_advisor_gaps`; live version `20260921182639`.
- DONE: Phase-F runtime health is now bound to the exact deployment SHA; two live SECURITY DEFINER exposure gaps were closed using the repository's existing hardening migration; six import-lineage FK indexes were added and the corresponding unindexed-FK advisor finding disappeared.
- EXACT SOURCE/DB VERIFICATION: GitHub source re-read confirms the probe/guard and migration file; Supabase migration history confirms both migrations live; post-change SQL confirms watched-file browser execute is revoked; performance advisor no longer reports unindexed FKs for the lineage path.
- CURRENT BUILD/DEPLOY BOUNDARY: Vercel current-head status is `failure` / `build-rate-limit`; Deployments is `pending`. No current-head build/browser/runtime PASS is claimed.
- NEXT EXECUTABLE ACTION: obtain a fresh exact-head Phase-F/CI/browser result for `2c9b4756...`. The first health probe will now fail closed if `report-advisor.vercel.app` does not serve this exact SHA; once exact runtime is available, close backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not bypass the deployment-SHA check; do not transfer older Vercel READY evidence; do not remove unused indexes without usage evidence; do not blanket-revoke authenticated SECURITY DEFINER functions.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 53 — DECISION TRUTH SEMANTICS

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- DECISION EXPERIENCE: implementation `58f6dd971ce905a3ea5a1f8670101e92c75ddade`; zero expected impact remains semantically valid.
- COMMAND CENTER: implementation `274f813567d111112d850a696035bf4aba604c28`; Money Recovery now reports receivables availability rather than recoverable-money certainty.
- UI CONTRACT: `3ab9e99a41676b22a6b61fe35db7891c7f170eac`.
- EXACT SOURCE VERIFICATION: current DecisionExperience, ExecutiveCommandCenter and UI guard were re-read after write; code changes are limited to the two intended UI semantics plus synchronized governance.
- CURRENT BUILD/DEPLOY BOUNDARY: exact-head Vercel `failure` / `build-rate-limit`, with deployment context `pending`; no runtime/browser/build PASS claimed.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `3ab9e99a...`; repair only a reproduced current-SHA failure, then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not treat zero expected impact as missing; do not label receivables availability as recoverable money; do not transfer older deployments.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 52 — IMPORT HISTORY FAIL-CLOSED + LIVE DB POSTURE

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- UI IMPLEMENTATION: `25c681ad540bacab9b0567d78b74a331ea224849` with initial action commit `e0978b867fbcd4a9a9f70b8d8f3515948dfaa590`.
- UI CONTRACT: `d6aec3aa6285f852043c4b3b7b1bbb364305141b`.
- DONE: Canonical Import history is now fail-closed: backend fetch errors are not represented as empty history; actual empty history has a real source-selection action.
- EXACT SOURCE VERIFICATION: `CanonicalImportPage.tsx` contains `historyError`, retryable `ErrorState`, `onRetry`, and the existing `reset` action; compare from `db047cb4...` is limited to the import UI and its UI guard.
- LIVE DB POSTURE: staging reports 103/103 public tables with RLS enabled; security advisor reports 60 authenticated SECURITY DEFINER findings and one leaked-password-protection warning. Core import/runtime functions were checked for actual product use before any privilege change; no unsafe blanket revoke was applied.
- CURRENT BUILD/DEPLOY BOUNDARY: exact-head Vercel is `failure` / `build-rate-limit`; Vercel deployment context is `pending`. No current-head build/browser/runtime PASS is claimed.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `d6aec3aa...`; repair only a failure reproduced on this SHA. Then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not map history fetch failures to empty state; do not revoke authenticated execute from core RPCs without usage/tenant-boundary proof; do not transfer older deployment evidence.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 51 — INVENTORY EMPTY-STATE GOVERNANCE

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- UI IMPLEMENTATION: `3b7f6e35f69bb53fd56a1714922376d4322ccd1a` (with initial actionable-state commit `976adb2b54ba52af9cadae4b4deb0085bdc539e8`).
- UI CONTRACT: `c90a97aad3c353f031c80cfd0788836b20add1e1`.
- DONE: Inventory empty states are now source-aware and filter-aware, with real next actions and no reload.
- EXACT SOURCE VERIFICATION: current `EntityPages.tsx` confirms `totalRows === 0` for source-empty and explicit `filter` + `filteredRows === 0` for filtered-empty.
- CURRENT BUILD/DEPLOY BOUNDARY: Vercel exact-head status remains `failure` / `build-rate-limit`; no runtime PASS is claimed.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `c90a97aa...`; repair only a failure reproduced on this SHA. Then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not classify unknown counts as empty; do not transfer older READY deployments; do not recreate import workflows.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 50 — DASHBOARD ANALYTICAL EMPTY STATES

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- UI IMPLEMENTATION: `42743647d0a94d5fca37dc2308e904fda5b2dc5f`.
- UI CONTRACT: `6ae2c1c5e41c85598d2b7a160b7fe681aa7e7e33`.
- DONE: Dashboard analytical empty states for trend, categories, customers and products now contain context-aware next actions; no values are fabricated.
- EXACT SOURCE VERIFICATION: current DashboardPage.tsx and its UI guard were re-read after commit; compare from `9dd467e...` to this candidate is exactly the two intended files.
- CURRENT BUILD/DEPLOY BOUNDARY: exact-head status is Vercel `failure` / `build-rate-limit` plus Vercel Deployments `pending`.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `6ae2c1c5...`; repair only a failure reproduced on this SHA. Then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not restore passive dashboard analytical empties; do not transfer older READY deployments; do not use source guards as runtime certification.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 49 — REPORT RETRY RESILIENCE

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- UI IMPLEMENTATION: `e6478ad3d7569e1e9cea832dac2e6b02f731ed9f`.
- UI CONTRACT: `7301ae56b7c01723ebdcc78756fc8a1ea5ffe399`.
- DONE: four report pages now retry in place through their existing loaders; full browser reload is removed from report error recovery.
- EXACT SOURCE VERIFICATION: current ReportsPage.tsx contains zero `window.location.reload()` calls; exact compare from previous `69e56486...` head is limited to ReportsPage.tsx and its UI contract guard.
- CURRENT BUILD/DEPLOY BOUNDARY: exact-head status is Vercel `failure` / `build-rate-limit` plus Vercel Deployments `pending`.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `7301ae56...`; repair only a failure reproduced on this SHA. Then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not restore full-page report retries; do not transfer older READY deployment evidence; do not count source-level verification as runtime PASS.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 48B — DECISION SOURCE ROUTING CORRECTION

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- **CURRENT CODE/TEST CANDIDATE:** `34b2038602f4899a78e6e183087cfe232c02faa8`.
- **UI IMPLEMENTATION:** `42ca66e327ce63fd5353de86d3f8753f12356b55`.
- **UI CONTRACT:** `34b2038602f4899a78e6e183087cfe232c02faa8`.
- **DONE:** decision alerts now send «فحص المصدر أولًا» to the existing Trust & Evidence route instead of returning to the same command screen.