# CURRENT EXECUTION BOUNDARY — 2026-09-30 / REAL REPORT ROOT FIX PERSISTED

- MAIN EXACT HEAD → `9d5781dae6b4a787de7288486e4b59df29e62109`.
- REPORT-FIRST FRONT → staging import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340` / `تسعيرة الاصناف حسب رقم الصنف.pdf`.
- SOURCE FINGERPRINT → `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- PRE-FIX REAL STATE → canonical commit readback was 735 rows; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0` was `completed` at stage `rendered`; rendered evidence payload was empty and `import_jobs.status` remained `processing`.
- ROOT CAUSE → durable completion was not carrying a rendered payload, and import terminal finalization depended on the client path after durable completion.
- ROOT FIX PERSISTED → durable runner captures/persists `renderedOutput`; canonical adapter creates source-bound executive/evidence/decision/work-center + applicable domain surfaces, verifies canonical commit readback, finalizes open import jobs through `import_finish_job`, and safely recovers an already-completed durable job after interruption.
- CONTRACT PROOF SOURCE → exact files at current SHA contain the rendered-output, finalization, recovery, and regression-test guards; readback was performed from the resulting SHA.
- CURRENT REPORT STATE → `BLOCKED` for runtime closure, not `CLOSED`.
- RUNTIME BLOCKER → Netlify current deploy remains old commit `21f6562dbca1016842f037299ffd8815b59fe1aa`; the available deploy updater requires a local/source checkout and could not publish the new SHA from this workspace. PC01 is offline; TinyFish authenticated automation is unavailable at current wallet balance.
- GITHUB FIXTURE CORPUS → `tests/fixtures/realistic-reports/` contains only `README.md`; `GITHUB REPORT CORPUS COUNT = 0`.
- DO-NOT-REPEAT → no blind retry of the already-completed 735-row durable job; no fake tenant/auth; no stale PASS; no second report while this runtime closure remains open.
- NEXT EXACT ACTION → get exact SHA `9d5781dae6b4a787de7288486e4b59df29e62109` into an authenticated runtime, recover the same import job through the canonical server boundary, and prove DB + rendered evidence + UI before closure.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-30 / REAL REPORT CANARY + CANONICAL INTAKE BLOCKER

- MAIN EXACT HEAD VERIFIED BEFORE THIS CHECKPOINT → `1b0d25a7834c779198f9ad19039c87e1262c4cd3`.
- REPORT-FIRST FRONT → real execution input `ف العملاء الاجل من ت 01-06 حتى تاريخ 15-08.pdf` from the execution workspace/library.
- GITHUB FIXTURE CORPUS → exact-head discovery of `tests/fixtures/realistic-reports/` returns only `README.md`; **GITHUB REPORT CORPUS COUNT = 0**.
- SOURCE FINGERPRINT → `sha256:0a3e1bf1686ec64febbed95f5d5b4b755f82a5cebb1b268c8270ce122b261e82`.
- VERIFIED REPORT → 14-page native-text sales-period report for العامري لتجارة المواد الغذائية - صنعاء; `2026-06-01` → `2026-08-15`; 397 invoice rows; 61 unique customers; YER; all invoices are credit/آجل.
- VERIFIED SOURCE TOTALS → invoice amount `471,891,687.50 YER`; net `471,807,450.00 YER`; discounts `84,237.50 YER`; tax/fees `0`; average invoice `≈1,188,644.05 YER`.
- ANALYSIS STATUS → source-bound deterministic analysis performed for this execution input; no outstanding receivable balance or benchmark/outcome is invented.
- CANONICAL INTAKE STATUS → **BLOCKED**, not CLOSED. Existing canonical server path requires authenticated user, tenant `current_company_id`, tenant-bound document storage, authoritative server read/hash/detection/parse and durable canonical commit.
- BLOCKER EVIDENCE → PC01 is offline; browser automation path is unavailable with current TinyFish balance; no authenticated tenant session/storage upload path is available to safely execute the canonical import. No fake identity, service-role browser session, or synthetic persistence used.
- NO DUPLICATE PATH → no new importer/RPC/runner/report pipeline was created; only the existing canonical path was inspected and targeted for resumption.
- CURRENT REPORT STATE → `BLOCKED`.
- NEXT EXACT ACTION → obtain a valid authenticated runtime/session with tenant context; then execute this same PDF through the existing canonical upload/storage → `/api/canonical-import-execute` → durable lifecycle → commit/readback path; verify all nine durable stages and post-import business surfaces before closure.
- DO-NOT-REPEAT → do not treat GitHub corpus count as nonzero from a Library file; do not publish the business PDF to the public repo; do not transfer stale PASS; do not advance to a second report while the first remains a resolvable blocker.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / WORKER RPC TEST CONTRACT RECONCILED

- MAIN EXACT CONTROL HEAD BEFORE THIS WRITE → `42f1e861cf0a68279e446045b16100a94b9a3143`.
- FUNCTIONAL FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased` / `ee0cba1e220fc2c96e2fa4c77aa7fa96192abe68`.
- SECURITY CLOSURE → `fail_report_execution_job` is service_role-only in Staging and source.
- TEST CLOSURE → security-definer contract now verifies the latest worker-only REVOKE/GRANT boundary and rejects any later authenticated/anon grant.
- LIVE EVIDENCE → advisor authenticated SECURITY DEFINER count is 40 after this closure; no broad speculative revocations performed.
- FRESH TEST EVIDENCE → targeted contract harness passes: historical authenticated grant followed by revoke is accepted; authenticated grant after revoke is rejected. Syntax parse passes.
- CI → no exact-head Actions run registered at last poll for the latest functional SHA; no runtime PASS claimed.
- DEVICE/EXTERNAL → PC01 offline; Auth leaked-password protection and Vercel free-plan limit remain external blockers.
- NEXT → if no independent safe front can be proven without device, the only live certification gap is fresh exact-head CI plus device/external runtime evidence; do not transfer historical PASS.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / WORKER FAILURE RPC SECURITY BOUNDARY CLOSED

- MAIN EXACT CONTROL HEAD BEFORE THIS WRITE → `a98dc4451b79544fde40f60680f8d52edd60e209`.
- FUNCTIONAL FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased` / `be0a64b01217ff16a53ef5d196e5613fb175cfa7`.
- SECURITY IMPLEMENTATION → restricted `fail_report_execution_job` to service_role only via `20260928230000_restrict_report_execution_failure_worker_rpc.sql`.
- LIVE PROOF → Staging applied the migration; readback confirms authenticated=false, anon=false, service_role=true while the function remains SECURITY DEFINER.
- ADVISOR PROOF → authenticated SECURITY DEFINER warnings reduced 41 → 40. Remaining 40 are not blanket-removal targets without caller/contract proof. Leaked-password protection remains an external Auth setting.
- SOURCE PROOF → exact branch migration contract PASS.
- CI → new SHA had not yet produced a registered Actions run at last poll; no runtime PASS transferred or claimed.
- DEVICE/RELEASE → PC01 offline; Vercel build-rate limit external; hosted/browser/device certification remains NOT PROVEN.
- NEXT EXECUTABLE ACTION → continue independent safe fronts; consume first terminal exact-`be0a64...` CI result when present, repair only the first current-SHA reproducible failure, then persist/rescan.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / CI DUPLICATION CLOSED + BENCHMARK UI CONTINUITY

- EXACT MAIN CONTROL HEAD AT START → `4ec779a0a1573fc3e0e395862f6761a70f775d49`.
- FUNCTIONAL FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased` / exact head `fdb59e8f4fa08cfb8778006ffc71a1e63088fb21`.
- UI DELIVERY → canonical Import now exposes Benchmark as the sixth post-import continuity step; `INSUFFICIENT_SAMPLE` is explicit until a peer cohort and evidence are available.
- CONTRACT DELIVERY → import transaction contract asserts the Benchmark route and fail-closed status.
- CI DELIVERY → Browser E2E, Final Certification, and Execution Enforcement push triggers are restricted to `main`; pull-request gates remain intact, eliminating duplicate PR push+PR executions for the affected workflows.
- FRESH PROOF → branch-source static contract execution PASS. Affected exact-head GitHub runs are PR-only and currently queued; no terminal runtime PASS/FAIL claimed.
- EXTERNAL → PC01 offline; Vercel free-plan build-rate limit; hosted/browser/device production proof remains NOT PROVEN.
- NEXT EXECUTABLE ACTION → consume the first terminal exact-head CI result on `fdb59e8...`; repair only the first reproducible non-external failure, then persist/rescan and continue the next safe front.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / LIVE POLICY PARITY CLOSED

- MAIN CONTROL HEAD AT CHECKPOINT → memory/index updates are the only main changes in this batch.
- FUNCTIONAL FRONT → PR #672 remains the single canonical import-to-decision front; client UI tenant-policy parity repair is included on the branch.
- LIVE PROOF → Staging policy/grant readback matches the repaired migration; migration application succeeded.
- EXACT-HEAD EVIDENCE → no PASS transferred from older branch SHAs after the repair. Fresh CI remains the release gate.
- RELEASE → Vercel build-rate external; Netlify exact-head preview cancellation; device offline.
- NEXT → stable re-anchor + fresh CI consumption, then first-failure repair only.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / RE-ANCHORED CI ADVANCE

- MAIN CONTROL HEAD AFTER MEMORY WRITE → `ac6bad42b2fcc0d4610fd4faba3a139585386027`.
- FUNCTIONAL FRONT → PR #672 / `0a48b4e19edf221d68e5d5c3d7497260b08352da`, exactly 1 ahead / 0 behind main at its base `517d01af...`.
- EXACT CI → `desktop-windows` run `36351392998` SUCCESS; remaining exact-head gates are still queued/pending with no terminal failure observed.
- STORAGE → authenticated documents bucket policy is tenant-prefix constrained; inserts bind owner to auth.uid; no cross-tenant storage relaxation detected.
- RELEASE/DEVICE → Netlify exact-head deploy is ERROR from no-content-change cancellation; Vercel external/pending; PC01 offline; browser/production/device certification remains NOT PROVEN.
- NEXT → consume the first terminal exact-head failure/result; repair only that root; persist and rescan.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / DEVICE-OFFLINE SAFE EXECUTION

- MAIN HEAD AT CHECKPOINT → `9e428325543a8198c16e2ecca9d0ebb0d5154111` (memory checkpoint only).
- PRIOR EXACT MAIN CODE/CONTROL HEAD → `9e35c768c7548ab87174e3ffa9426dc4605489d3`.
- FUNCTIONAL CANDIDATE → PR #672 / `cf0d30c4015642313d899d9d8262bc7159abb220`; candidate is 24 ahead / 8 behind current main and therefore NOT an exact-main proof source.
- LIVE STAGING SECURITY → import lifecycle RPCs are INVOKER with authenticated/service_role access and anon denied; six-argument `import_commit_batch` remains the intentional SECURITY DEFINER write boundary; canonical import tables RLS=true.
- SECURITY RESIDUAL → 40 authenticated SECURITY DEFINER advisor findings + leaked-password protection warning remain; no blanket revoke/speculative mutation.
- RELEASE → Vercel build-rate limit remains external; candidate has no fresh CI PASS; device/browser/production certification NOT PROVEN.
- DEVICE → PC01 offline. Independent repository/live read-only fronts continue.
- NEXT → re-anchor #672 to exact current main, then consume fresh exact-head CI and repair only reproduced failures.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / IMPORT-FINISH STAGING DRIFT RECONCILED

- CANONICAL MAIN HEAD BEFORE THIS WRITE → `6f1d818f60a700b07a13b0163ddfc20dce0f2a57`
- CURRENT CODE/TEST CANDIDATE → PR #672 / `exec/20260927-current-main-import-ui-rebased` / `9aa6c8ccea82b20d949ae2e41fdad2f1b1126631`
- FRONT → IMPORT-TO-DECISION-CONTINUITY / SECURITY-RUNTIME-RECONCILIATION
- ROOT CAUSE → live staging had `import_finish_job(uuid,text,jsonb,text)` as SECURITY DEFINER because an applied historical migration was absent from the candidate repository lineage.
- IMPLEMENTED → candidate adds `20260927235000_reconcile_import_finish_job_security_invoker.sql` which preserves the function body and restores SECURITY INVOKER, safe search_path, and explicit authenticated/service_role EXECUTE.
- LIVE PROOF → Supabase staging `fnqbvfuwbdpwvhcgzksl` applied migration `20260927203948_reconcile_import_finish_job_security_invoker` successfully; readback shows no SECURITY DEFINER clause and EXECUTE only for authenticated/postgres/service_role.
- RELATED PROOF → canonical six-argument `import_commit_batch` remains SECURITY DEFINER with source/tenant checks; authenticated/service_role execution is present and public/anon execution is absent. Canonical import tables are RLS-enabled.
- SECURITY RESCAN → 46 historical authenticated SECURITY DEFINER advisor warnings remain outside this exact import boundary; no blanket or speculative revoke.
- HOSTING/DEVICE → exact candidate Netlify deploy `6ab97f10fb0f09000849973a` is STATE=error (no content change); Vercel is externally rate-limited; PC01 remains offline. No hosted/browser/device PASS.
- GATE STATE → fresh workflows for `9aa6c8c` have not appeared yet; current Vercel status is pending, Netlify commit status success but authoritative deploy error, CodeRabbit success. Certification remains NOT PROVEN.
- DO NOT REPEAT → do not mutate broad Security Advisor findings; do not count Netlify status as deployment PASS; do not transfer old candidate evidence.
- NEXT EXECUTABLE ACTION → consume fresh exact-`9aa6c8c` gates, repair only the first current-SHA reproducible failure, then rescan UI/core/security/cleanup fronts.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / EXACT-CANDIDATE EVIDENCE BOUNDARY UPDATE

- MAIN DOCUMENTATION HEAD BEFORE THIS WRITE → `924dc7c327d7c444bbe6ad6e436616014e58283d`
- CURRENT CODE/TEST CANDIDATE → PR #672 / `ecfff32aa5ce1ec737663a71b1d9080ffe69e7eb`
- FRESH BUILD EVIDENCE → Windows desktop job `36348110511` completed SUCCESS on the exact candidate SHA: web build, native watcher, native runtime smoke, installer packaging and artifact upload all completed.
- FRESH QUALITY/CERTIFICATION/BROWSER GATES → quality `36348110541`, enforcement `36348110823`, final certification `36348110593`, device-independent browser `36348110591`, full product browser `36348110595` remain queued at last observation.
- VERCEL → commit status failure remains the free-plan `build-rate-limit` blocker; no production proof.
- NETLIFY → commit status was `success`, but actual deploy `6ab97c3d6fa5b900087ac057` is STATE=error with `Canceled build due to no content change`. Therefore there is NO hosted preview PASS.
- DEVICE → PC01 offline; no device/browser/production PASS claimed.
- LIVE STAGING → six-argument import_commit_batch grant boundary and RLS are verified read-only; import_finish_job remains SECURITY DEFINER from applied migration lineage not present in the candidate tree. Treat as migration/environment drift, not a mutation target until caller/source reconciliation.
- EVIDENCE LAW → no stale PASS from older SHAs; current exact candidate evidence must bind to `ecfff32...`.
- NEXT → consume first terminal exact candidate quality/certification/browser result; repair only the first reproducible current-SHA failure, then rescan.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / CURRENT-CANDIDATE + LIVE-STAGING BOUNDARY

- CURRENT MAIN DOCUMENTATION HEAD BEFORE THIS WRITE → `c246071b6200f1652f7f8f272c18c2dcc2eaf2d1`
- CURRENT CODE/TEST CANDIDATE → PR #672 / `ecfff32aa5ce1ec737663a71b1d9080ffe69e7eb`
- CODE/TEST REPAIRS ACTUAL → UI contract and import transaction contract harnesses repaired and compile-style syntax verified.
- FRESH EXACT-HEAD CI → quality `36348110541` queued; enforcement `36348110823` queued; Final Certification `36348110593` queued; Device-Independent Browser `36348110591` queued; Full Product Browser `36348110595` queued; desktop-windows `36348110511` in progress/queued.
- DEVICE → PC01 offline; no device/browser/production PASS claimed.
- LIVE STAGING → `fnqbvfuwbdpwvhcgzksl` is healthy and has the current specialty/grant migrations. Six-argument `import_commit_batch` is SECURITY DEFINER with EXECUTE for authenticated/service_role and no PUBLIC/anon grant. RLS is enabled on import_jobs, file_records, canonical_import_commits and import_job_rows.
- LIVE STAGING DRIFT → `import_finish_job(uuid,text,jsonb,text)` is currently SECURITY DEFINER and executable by authenticated/service_role. The canonical repository chain migration `20260830210000_harden_import_finish_lifecycle.sql` declares SECURITY INVOKER, while staging also contains applied historical migration `20260919220623_allow_import_job_rpc_writes_via_definer`, which is not present in the current candidate tree. Treat this as migration-lineage/environment drift; DO NOT mutate until caller, grant, and canonical ownership are reconciled.
- SECURITY ADVISOR → staging has broad historical authenticated SECURITY DEFINER warnings (62 findings); no blanket revoke is authorized. Current action is limited to exact canonical import boundaries.
- EVIDENCE LAW → all current proof remains bound to the exact SHA/target; no transfer from `2ab...` or older.
- NEXT EXECUTABLE ACTION → consume first terminal `ecfff32...` CI result; independently continue safe repository fronts. Revisit staging finish-RPC drift only with exact migration source/owner reconciliation.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / EXACT-CURRENT-CODE-CANDIDATE CONTRACT-CLOSURE

- MAIN DOCUMENTATION HEAD → `8141294dd436aa96b91debc1ca9a5706ad6b358f`
- CURRENT CODE/TEST CANDIDATE → PR #672 / `ecfff32aa5ce1ec737663a71b1d9080ffe69e7eb`
- CODE RELATION → candidate remains based directly on main code base `132e40f023e564dba9e7f84c63d543bab1b7fc71`; the current main docs tail is intentionally separate and does not invalidate code SHA evidence.
- REAL FIX — UI CONTRACT → repaired declaration order, duplicate shared bindings, and a malformed literal newline in `scripts/check-product-wow-ui-contract.mjs`; local compile-style syntax check now passes after imports are stripped.
- REAL FIX — IMPORT CONTRACT → repaired a missing token-list comma, added an explicit canonical import-page binding, and resolved a duplicate page-path binding in `scripts/check-import-transaction-contract.mjs`; same syntax check now passes.
- FRESH EXACT-HEAD CI → quality `36348110541` queued; enforcement `36348110823` queued; Final Certification `36348110593` queued; Device-Independent Browser `36348110591` queued; Full Product Browser `36348110595` queued; desktop-windows `36348110511` queued.
- OBSERVED TERMINAL RESULT → Commercial PWA `36348110613` skipped; no fresh terminal failure on required gates yet.
- DEVICE → PC01 offline; no device/browser/production PASS claimed.
- HOSTING → Vercel free-plan deployment-rate blocker remains external; no production mutation.
- EVIDENCE LAW → evidence from `2ab23aec...` and older SHAs is not transferred; current candidate must terminalize on `ecfff32...`.
- NEXT EXECUTABLE ACTION → consume the first terminal current-SHA result. If failed, repair only its current-SHA root; otherwise continue independent security/data/UI fronts and rescan.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / EXACT-CURRENT-MAIN + CODE-CANDIDATE CHECKPOINT

- MAIN DOCUMENTATION HEAD BEFORE THIS WRITE → `132e40f023e564dba9e7f84c63d543bab1b7fc71`
- CURRENT CODE/TEST CANDIDATE → PR #672 / `2ab23aec8747c4a39081a7b6b8ccef7115406c20`
- CODE/MAIN RELATION → candidate is 1 commit ahead / 0 behind the main SHA used for its build; 76 files changed.
- RECONCILIATION → candidate functional tree is preserved as a direct child of current main; this checkpoint is documentation-only.
- FRESH EXACT-HEAD CI ON CODE CANDIDATE → quality `36347828523` queued; enforcement `36347828519` queued; Final Certification `36347828427` queued; Device-Independent Browser `36347828437` queued; Full Product Browser `36347828521` queued; desktop-windows `36347828455` in progress.
- OBSERVED TERMINAL RESULT → Commercial PWA `36347828353` skipped; no terminal failure observed yet on the listed required fresh gates.
- DEVICE → PC01 offline; no device/browser/production PASS claimed.
- HOSTING → Vercel free-plan build-rate blocker remains external; no production mutation.
- EVIDENCE BOUNDARY → prior `f42d6f2` evidence is not transferred; current proof must bind to `2ab23aec` (or a fresh resulting SHA).
- NEXT EXECUTABLE ACTION → consume the first terminal exact-head gate; repair only a reproducible current-SHA root, continue independent repository-safe fronts, then persist and rescan.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / CANONICAL LIVE FRONT

> This top block is the only startup boundary.

- MAIN HEAD BEFORE THIS DOCS WRITE → `3215c601f68aea214c8455f52d5f5c519074d7f1`
- CURRENT FUNCTIONAL CANDIDATE → PR #672 / `f42d6f2b22004eb5213d2a4460975ce1a4c11c60`
- FUNCTIONAL FRONT → `IMPORT-TO-DECISION-CONTINUITY`
- EXACT GIT RELATION → functional candidate is 1 commit ahead / 0 behind the main head used for its current build; 76 files changed. This checkpoint is documentation-only and must be reconciled with the next main SHA before merging.
- EXACT-HEAD STATUS AT LAST FUNCTIONAL HEAD → GitHub Actions showed 47 queued + 2 skipped/completed and 0 terminal failures; Vercel remained `failure / build-rate-limit`.
- PLAYWRIGHT LAYER → repository already contains the canonical Playwright browser-proof layer in `.github/workflows/full-product-browser-e2e.yml` and `scripts/run-full-product-browser-e2e.mjs`; it checks exact checkout SHA, builds exact head, installs Chromium, captures screenshots/artifacts, checks console/network/HTTP errors, authenticated tenant, A/B isolation, route coverage, workspace persistence, refresh, and logout.
- PWA LAYER → `.github/workflows/commercial-pwa-e2e.yml` already covers service-worker/cache/offline app-shell and authenticated E2E contracts.
- LOCAL BROWSER FALLBACK → system Chromium exists, but container Playwright navigation to the Netlify preview was blocked with `net::ERR_BLOCKED_BY_ADMINISTRATOR`; PC01 is also offline. No browser PASS was fabricated.
- NETLIFY EXACT-HEAD → status check was green, but deployment `6ab97914b5d4da000892e4b3` reported `Canceled build due to no content change`; therefore the preview alias is not accepted as exact-head deployment proof for `f42d6f2`.
- SOURCE/ROUTE/SECURITY AUDITS → 37 canonical nav paths map to 40 actual routes with no missing/duplicate nav paths; canonical import RPC and `import_finish_job` tenant/security contracts verified; no safe free-toolbox deletion proven.
- PHASE-F → NOT CERTIFIED; production/browser/device/restore/RPO/RTO/rollback exact-SHA evidence remains open.
- CLEANUP → #671 remains superseded/closed; #672 is the single functional front.
- NEXT → reconcile #672 onto the newest main SHA, then consume terminal Playwright/quality/enforcement/certification evidence; repair only the first current-SHA failure.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / LIVE CHECKPOINT

> Exact-head evidence only. Current code candidate is kept separate from documentation/test-harness tails.

- MAIN HEAD BEFORE THIS DOCS COMMIT → `f1444f7c7277fdc7662052a28629171063ab7d17`
- CURRENT CODE/TEST CANDIDATE → `c5b193116e16b7ce46fd88d6d6edde268820ef52`
- FUNCTIONAL FRONT → PR #664 / `9218274998a82b0613d8ec8b6b0820bad173ad0b`
- GOVERNANCE FRONT → PR #666 / `9aec629f5573830ef5d8d5bbc1e303ce41470ba3`
- UI AFTER IMPORT → single canonical Import → Trust/Evidence → Decision/Work → Outcome/Learning → Replay path; Benchmark remains INSUFFICIENT_SAMPLE.
- PHASE-F → fail-closed external/runtime boundary: restore target missing current_customer_company_id(), downstream rollback-forward 503.
- VERCEL → free-plan build-rate limit remains external.

---
# CURRENT EXECUTION BOUNDARY — 2026-09-27 / LIVE CHECKPOINT

> Exact-head evidence only. Code candidate and documentation tail are tracked separately.

- MAIN HEAD BEFORE THIS DOCS COMMIT → `d5be7220b048a3e7bd798a9b2d9fea677b200183`
- CURRENT CODE/TEST CANDIDATE → `c5b193116e16b7ce46fd88d6d6edde268820ef52`
- FUNCTIONAL FRONT → PR #664 / `22bdfb19f234a38640961e3851c3e5eef786cbad`
- GOVERNANCE FRONT → PR #666 / `9aec629f5573830ef5d8d5bbc1e303ce41470ba3`
- PROOF → #664 3 success / 3 in-progress / 39 queued / 0 failure; #666 3 in-progress / 1 pending / 34 queued / 0 failure.
- UI AFTER IMPORT → one canonical path: Import → Trust/Evidence → Decision/Work → Outcome/Learning → Replay; Benchmark remains INSUFFICIENT_SAMPLE.
- PHASE-F → fail-closed due restore-target migration dependency on current_customer_company_id() and downstream 503 rollback-forward.
- EXTERNAL → Vercel free-plan rate limit; browser/device/production proof remains not proven.

---
# CURRENT EXECUTION BOUNDARY — 2026-09-27 / MIXED-SPECIALTY CONTRACT ROOT CLOSED

> Exact-head evidence only. This startup block supersedes older historical boundaries.

- MAIN HEAD BEFORE THIS DOCS COMMIT → `16bfd89ac25f55dbc776871b5bc4cbc538320fc0`
- CURRENT CODE/TEST CANDIDATE: `c5b193116e16b7ce46fd88d6d6edde268820ef52`
- FUNCTIONAL CANDIDATE → PR #664 / `c5b193116e16b7ce46fd88d6d6edde268820ef52`
- GOVERNANCE CANDIDATE → PR #665 / `da99f6a873144b2ee56f73ad759f25456c2d9755`
- ROOT CLOSED → TypeScript + canonical-import mapping roots fixed; fresh proof required on `c5b193116e16b7ce46fd88d6d6edde268820ef52`.
- UI CONTINUITY → single canonical Import → Trust/Evidence → Decision/Work → Outcome/Learning → Replay path; Benchmark fail-closed.
- NEXT → first terminal current-SHA failure only; merge only after required exact-head evidence.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / CURRENT CODE ROOT REPAIR

> Exact-head evidence only. This startup block supersedes older historical boundaries.

- MAIN HEAD BEFORE THIS DOCS COMMIT → `75cc34765b9c2a18d7f0f06e5fdc2dd101aec2c0`
- FUNCTIONAL CANDIDATE → PR #664 / `2f0dcbb2f27345631f05558a6e7898af8148de42`
- GOVERNANCE CANDIDATE → PR #665 / `da99f6a873144b2ee56f73ad759f25456c2d9755`
- ROOT FIX → current exact-head TypeScript + canonical-import mapping roots repaired on #664.
- PROOF → fresh workflows for the repaired candidate must be consumed; historical failures on `361db8a…` are closed evidence.
- UI → canonical Import → Trust/Evidence → Decision/Work → Outcome/Learning → Replay remains the single post-import path.
- RELEASE → Vercel free-plan build-rate; browser/production/Phase-F remain external/not proven.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / EXACT-HEAD PROOF UPDATE

- MAIN HEAD BEFORE THIS DOCS COMMIT → `6219eb5a68aff19a3ef77a23537d5fb2db2d5a38`
- FUNCTIONAL CANDIDATE → PR #664 / `2f0dcbb2f27345631f05558a6e7898af8148de42`
- GOVERNANCE CANDIDATE → PR #665 / `da99f6a873144b2ee56f73ad759f25456c2d9755`
- EXACT PROOF → #664 desktop-windows SUCCESS on exact head; 44 other workflows queued, 2 skipped, 0 failures at latest scan. #665 has 37 queued and 1 in progress.
- RELEASE BOUNDARY → Vercel free-plan build-rate remains external; browser/production/Phase-F remain NOT PROVEN.
- UI CONTINUITY → canonical post-import path remains Import → Trust/Evidence → Decision/Work → Outcome/Learning → Replay; Benchmark remains fail-closed.
- NEXT → consume first terminal new gate/failure; repair current-SHA root only; do not transfer stale evidence.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / EXACT CURRENT-MAIN CHECKPOINT

> Exact-head evidence only. This startup block supersedes older historical boundaries.

- MAIN HEAD BEFORE THIS DOCS COMMIT → `5bb08044bcb3800d9c5561af0edc945cf0defea6`
- FUNCTIONAL CANDIDATE → PR #664 / `361db8af5e58dcb122b2b6623acf9a804e6a3fdb`
- GOVERNANCE CANDIDATE → PR #665 / `da99f6a873144b2ee56f73ad759f25456c2d9755`
- REMOTE PROOF → #664 Netlify + CodeRabbit SUCCESS, Vercel external build-rate failure, GitHub Actions queued/in-progress; #665 same Vercel boundary with governance gates queued/in-progress.
- UI CONTINUITY → #664 is the canonical existing post-import path: Import → Trust/Evidence → Decision/Work → Outcome/Learning → Replay; Benchmark remains `INSUFFICIENT_SAMPLE`.
- CLEANUP → #662/#663 closed as superseded; history retained.
- EXTERNAL → PC01 offline; browser/production/Phase-F remains NOT PROVEN.
- NEXT → consume terminal exact-head gates, repair only first current-SHA root failure, then merge only after required evidence.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / CURRENT-MAIN INTEGRATION

> Exact-head evidence only. This startup block supersedes older historical boundaries.

- MAIN HEAD → `9fbb842f754f04ada2f09af3a6d21d15ff1c6382` (canonical memory checkpoint added on current main).
- FUNCTIONAL CANDIDATE → PR #664 / `361db8af5e58dcb122b2b6623acf9a804e6a3fdb`.
- GOVERNANCE CANDIDATE → PR #665 / `da99f6a873144b2ee56f73ad759f25456c2d9755`.
- FUNCTIONAL BOUNDARY → Any Source → Security → Fingerprint → Understand all datasets → Normalize/Reconcile → Quality/Trust → Evidence → Canonical Commit → Persistence/Readback → Business Understanding → Signals → Decision/Work → Outcome → Replay/Learning; Benchmark remains fail-closed until a real peer cohort exists.
- UI AFTER IMPORT → #664 contains the existing canonical post-import surface; no duplicate post-import route/path is permitted.
- PROOF → no new exact-head PASS claimed for #664/#665. Their current combined statuses expose the known Vercel free-plan rate-limit failure; workflow-run results are not yet materialized.
- EXTERNAL → PC01 offline; local execution environment cannot resolve github.com for a local clone; browser/production/Phase-F runtime proof remains NOT PROVEN.
- NEXT → consume the first terminal exact-head gate on #664/#665; repair only the first current-SHA reproducible root; continue independent UI/cleanup work without changing closed contracts.
- DO NOT REPEAT → stale PASS transfer; old-main memory overwrite; duplicate importer/RPC/runner; preview-as-production; unsafe legacy import_jobs mutation.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / CURRENT-HEAD DEPLOYMENT READBACK

- FUNCTIONAL CURRENT HEAD → PR #662 / `334c80ec51d304041071eae5908f125016f520d4`.
- DEPLOYMENT READBACK → Cloudflare exact-head check for `334c80e` is SUCCESS; the deployed import URL resolves to the Arabic الأغبري identity gate and does not fabricate an authenticated workspace. This is deployment/readback evidence only, not authenticated browser E2E proof.
- CURRENT MANDATORY GATES → `certification-contracts` and `enforcement-contract` remain queued; no new code failure is available to repair.
- UI DELIVERY → the full 16-stage post-upload lifecycle is present in the existing canonical import result surface and protected by the existing UI contract; evidence wording remains fail-closed.
- PHASE-F → source-side review found no new safe code mutation to remove the remaining live-proof blocker: the current Phase-F script requires live runtime secrets/targets and exact deployment identity. Keep fail-closed; do not synthesize production proof.
- EXTERNAL → PC01 offline; Vercel free-plan deployment-rate limit; authenticated browser and production/Phase-F resilience proof remain NOT PROVEN.
- NEXT → consume terminal mandatory gates on `334c80e`; then consume #663. If queues persist, continue only independent repository-safe fronts.


---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / LIVE RECONCILED STATE

> Exact-head evidence only. This startup block supersedes older historical boundaries; history remains evidence.

- CURRENT REPOSITORY HEAD OBSERVED → `a47532a1c6887ad233705f99b5b726f6d88dcfea` (docs-only reconciliation descendant).
- CURRENT CODE/TEST BASELINE → `46675643e32f6ea28b6c1d80a530b2eb134e7907`.
- FUNCTIONAL CANDIDATE → PR #662 / `a8ef795c290b035023e3b5781488c7e650ab6866`.
- GOVERNANCE CANDIDATE → PR #663 / `13432b118aa8db00d3a498332803d2c1324a9291`.
- FUNCTIONAL PROOF → #662 Windows build PASS + Cloudflare Pages PASS; remaining exact-head security/browser/contract/certification/data gates queued. No browser/production/Phase-F PASS claimed.
- GOVERNANCE → continuous-resume enforcement is isolated from product behavior; its earlier merge-ref failures exposed defects owned by the functional lane, not a second implementation target.
- PHASE-F → NOT CERTIFIED: rollback-forward probe lacks required runtime configuration; local restore-parity migration exposed `current_customer_company_id()` dependency. Keep fail-closed.
- EXTERNAL → PC01 offline; Vercel free-plan rate limit; production/browser/Phase-F exact-SHA proof unavailable.
- NEXT → consume first terminal #662 gate; repair only first reproducible current-SHA failure; concurrently consume #663 governance gates; reconcile/merge only after exact-head compatibility proof.
- UI AFTER IMPORT → #662 already covers full-source understanding, persisted dataset summaries/provenance, Trust/Evidence → Decision → Outcome/Learning continuity, tenant-scoped Business Replay, and evidence-safe Benchmark. Do not create another post-import path.
- CLEANUP → no deletion in this batch. Legacy removal remains gated by Manifest reference/caller checks and tests; historical evidence retained.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / LIVE RECONCILED STATE

> Exact-head evidence only. This block supersedes older historical boundaries for startup; history remains immutable evidence.

- MAIN HEAD → `46675643e32f6ea28b6c1d80a530b2eb134e7907`.
- FUNCTIONAL CANDIDATE → PR #662 / `a8ef795c290b035023e3b5781488c7e650ab6866`.
- GOVERNANCE CANDIDATE → PR #663 / `13432b118aa8db00d3a498332803d2c1324a9291`.
- FUNCTIONAL PROOF → #662 Windows build PASS + Cloudflare Pages PASS; remaining exact-head gates are queued. No browser/production/Phase-F certification claimed.
- GOVERNANCE PROOF → #663 current head has successful basic verify/authenticated-e2e checks but certification/verify failures were observed against its merge ref; the known typecheck defects belong to the functional lane and must not be duplicated in governance.
- PHASE-F → NOT CERTIFIED: live rollback-forward drill is blocked by missing runtime configuration; local migration test also exposed dependency on `current_customer_company_id()` in restore-parity migration. Keep fail-closed.
- EXTERNAL → PC01 offline; Vercel free-plan rate limit; production/browser/Phase-F exact-SHA proof unavailable.
- NEXT → consume first terminal #662 gate; repair only first reproducible current-SHA failure; concurrently consume #663 governance gates; then reconcile/merge only after exact-head compatibility proof.
- UI AFTER IMPORT → #662 already implements full-source understanding, persisted dataset summaries/provenance, Trust/Evidence and Decision continuation, Outcome/Learning continuation, tenant-scoped Business Replay, and evidence-safe Benchmark. Do not create another post-import surface/path.
- CLEANUP → no deletion in this batch; deletion remains gated by Manifest reference/caller checks and tests. Preserve historical evidence.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / CONTINUOUS EXECUTION CHECKPOINT 144

- MAIN HEAD OBSERVED BEFORE THIS INDEX WRITE: `8eb5b4154e02a1320942e08a33e052e0a35ab238`.
- CURRENT CODE/TEST CANDIDATE A: `e76d7fb639da2e7a1a8b603156e82fc3ab27b0f9` (PR #657; current-main deep UI/core lane + Work Center zero-progress signal).
- CURRENT CODE/TEST CANDIDATE B: `b324e023f1dbf603811f2cfe47bf58bfff6a0660` (PR #658; receivables truth closure).
- CURRENT GATES: previous #657 Vercel/Netlify/CodeRabbit and Windows success were exact for `124eec1...` only; they are not proof for `e76d7fb...`. #658 Netlify is READY exact; Vercel is externally rate-limited.
- WORK CENTER CLOSURE: active rows with progress 0 are now explicitly surfaced as an operational signal and routed to active-work review. No DB status is altered.
- KNOWLEDGE ARCHITECTURE: quality workflow includes `npm run test:knowledge-architecture`; current-head execution remains unproven until the new quality run terminalizes.
- SUPERSEDED PRS: #647/#651/#653/#654 closed without merge. Their source lineage is preserved through #657/#658; no stale PASS transferred.
- NEXT EXECUTABLE ACTION: consume new exact-head #657 CI result first; then #658. Repair only the first reproduced current failure, and merge only after required exact-head evidence.
- DO NOT REPEAT: stale evidence, duplicate PR fronts, production promotion bypass, blanket security revokes, unsafe import-job mutations.

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

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / IMPORT TYPED-ENTITY FAIL-CLOSED HARDENING

- FUNCTIONAL CURRENT HEAD → PR #662 / `exec/20260927-import-full-lifecycle` / exact HEAD `3a03d4e3e1a6967b0b590253d8ca54d8e720d9d9`.
- ROOT FIX → `src/lib/import/canonical-source-understanding.ts` no longer selects typed canonical entities from a single weak signal. It now requires the exact canonical write-field contract for products/customers/sales; incomplete sources remain `generic:source-data` with a machine-readable missing-fields warning.
- CONTRACT → existing `scripts/check-canonical-import-mapping.mjs` now guards both the fail-closed inference and the required write-field set. No duplicate importer/test/RPC/runner created.
- EXACT-HEAD CI → certification run `36326147880` job `108639175638` and enforcement run `36326147877` job `108639175656` are present for this SHA and currently `queued`; no failure is available yet, so no repair is inferred.
- CURRENT VERCEL → exact-head status remains `failure` / `build-rate-limit`; external blocker only.
- CURRENT DEPLOYMENT PROOF → earlier Cloudflare/Netlify successes remain bound to their exact SHAs and are not transferred to `3a03d4e`.
- GOVERNANCE → PR #663 remains exact head `43a29443477aeb5969b99d672bd2c6698e0f7106`; do not mix its lane with product behavior.
- NEXT → consume the first terminal mandatory gate on `3a03d4e`; if the queues persist, continue only independent repository-safe work, then consume #663.
- DO NOT REPEAT → stale evidence, preview-as-production, duplicate import/navigation/RPC/runner, unsafe import-job mutations, speculative Phase-F changes without new live evidence.

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / IMPORT PER-DATASET TYPED-ENTITY HARDENING

- FUNCTIONAL CURRENT HEAD → PR #662 / `exec/20260927-import-full-lifecycle` / exact HEAD `b081c3f5d8c7ca4879c41f16cada76f0c5c66f00`.
- ROOT FIX → typed canonical inference now requires all canonical write fields on **every dataset**; complementary sheets can no longer collectively satisfy a strict entity contract while individual datasets remain incomplete.
- CONTRACT → existing `scripts/check-canonical-import-mapping.mjs` guards the per-dataset condition. No duplicate test/import/RPC/runner path.
- EXACT-HEAD CI → certification run `36326239773` / job `108639438487` and enforcement run `36326239775` / job `108639438409` are both `queued`; no terminal failure is available.
- VERCEL → exact-head status remains `failure` / `build-rate-limit`; external constraint only.
- DEPLOYMENT/PRODUCTION → no fresh exact-head browser or production/Phase-F PASS; prior deployment evidence remains bound to earlier SHAs.
- UI → canonical import post-upload lifecycle remains complete and existing; Business Replay import-scoping was reviewed and left unchanged because no existing import-filter contract was found.
- GOVERNANCE → PR #663 exact head `43a29443477aeb5969b99d672bd2c6698e0f7106`; governance jobs remain queued.
- NEXT → consume the first terminal mandatory gate on `b081c3f`; repair only reproduced current-SHA failure; otherwise continue independent safe fronts and reconcile governance.
- DO NOT REPEAT → stale evidence, preview-as-production, duplicate import/navigation/RPC/runner, unsafe import-job mutation, speculative replay filtering.

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / FRESH EXACT-HEAD DEPLOYMENT READBACK

- FUNCTIONAL CURRENT HEAD → PR #662 / `exec/20260927-import-full-lifecycle` / `b081c3f5d8c7ca4879c41f16cada76f0c5c66f00`.
- NETLIFY EXACT-HEAD → deploy-preview SUCCESS; `https://deploy-preview-662--aghbari-report-advisor.netlify.app`.
- CLOUDFLARE EXACT-HEAD → SUCCESS; `https://3a4e8985.report-advisor.pages.dev`.
- READBACK → exact Netlify preview renders the real Arabic الأغبري identity/company isolation gate, Evidence-first product positioning, and explicitly no demo workspace. Deployment/readback proof only; authenticated browser E2E remains unproven.
- MANDATORY CI → certification-contracts `36326239773` / job `108639438409` and enforcement-contract `36326239775` / job `108639438487` remain QUEUED.
- VERCEL → exact-head failure / build-rate-limit; external hosting blocker.
- CORE → per-dataset typed canonical inference hardening is on the current functional branch and protected by the existing import contract.
- NEXT → consume the first terminal mandatory gate; do not transfer this deployment proof to production or to another SHA.

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / PRODUCTION SHA MISMATCH READBACK

- FUNCTIONAL CANDIDATE → PR #662 / `b081c3f5d8c7ca4879c41f16cada76f0c5c66f00`.
- EXACT PREVIEW PROOF → Netlify SUCCESS + Cloudflare SUCCESS on `b081c3f`.
- VERCEL PRODUCTION → READY deployment `dpl_2mYGpzpzdgQdJsEJFy6FzKHaWFja` aliases `report-advisor.vercel.app` but is bound to main SHA `47502385cd999d1151360e30f47855360659b055`, not `b081c3f`.
- RELEASE IMPLICATION → functional production exact-SHA identity is NOT PROVEN. Do not use the current READY production deployment as evidence for the functional candidate.
- MANDATORY CI → certification `36326239773` / job `108639438409` and enforcement `36326239775` / job `108639438487` remain queued.
- GOVERNANCE → broad-push coverage remains intentional per `check-ci-execution-topology.mjs`; no queue-clearing trigger weakening was introduced.
- NEXT → first terminal mandatory gate on `b081c3f`, then authorized release identity/Phase-F path. No production SHA bypass.
