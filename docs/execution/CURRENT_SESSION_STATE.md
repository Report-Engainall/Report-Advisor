SESSION HANDOFF = READY
ACTION_STATUS = ACTIVE_EXECUTION
CURRENT_EXACT_HEAD = 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f
CURRENT_CODE_HEAD = 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f
CURRENT_MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
CURRENT_EXECUTION_HEAD = 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912
CURRENT_PR_HEAD_AT_CODE_CHECK = 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f
UPDATED_AT = 2026-10-10T00:50:00+03:00
PRODUCT_COMPLETE = NO



## LIVE CHECKPOINT — 2026-10-10 00:44 — HEAD RECONCILIATION

- Repository: https://github.com/Report-Engainall/Report-Advisor
- PR #912 remains OPEN / NOT MERGED: https://github.com/Report-Engainall/Report-Advisor/pull/912
- Branch: `fix/source-bound-generic-intelligence-20261009`
- Current code baseline reviewed and tested by workflow orchestration: `99d1adfb5bc6df409243f47f0ebb8e53b4808262`; parent: `3e46dd17511533bbbab77578b39c403058002020`.
- Main at last live PR metadata read: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- This commit corrects `scripts/check-session-handoff-contract.mjs`: the changed-path line split was over-escaped. It now splits using the actual newline expression `/\r?\n/`, rather than matching literal backslash sequences.
- The previous Session Handoff Contract run failed on head `3e46dd17511533bbbab77578b39c403058002020`: run [37994951056](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37994951056). Its log said `SESSION_HANDOFF_CONTRACT_FAIL: stale report`; state/report still pointed to `447d1009caa6279faf5664da932c1f25addb8594`. The failure is recorded as historical; a fresh post-fix PASS is not claimed.
- A documentation-only commit follows this code baseline so the next contract run can evaluate a report whose `REPORT_FOR_HEAD` is an ancestor of the tested HEAD and whose changed paths are only governance documents.
- Latest exact-head runs observed on `99d1adfb5bc6df409243f47f0ebb8e53b4808262`: Session Handoff Contract [37995180640](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180640) QUEUED; Full Product Browser E2E [37995180514](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180514) QUEUED; Product Build Gate [37995180426](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180426) QUEUED; Quality [37995180504](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180504) QUEUED; Commercial Product Creation E2E [37995180499](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180499) QUEUED; Device-Independent Browser E2E [37995180266](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180266) QUEUED; Phase-F Live Resilience [37995180352](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180352) PENDING.
- Netlify and Vercel deployment statuses for this baseline were PENDING at the last read. A success on parent `3e46dd1` is not promoted to the current code baseline.
- Browser upload→canonical import→persist→catalog→details→refresh/re-login is NOT PROVEN on this code baseline. Older-head persistence IDs and browser attempts remain historical only.
- A–J universal-file matrix: no full end-to-end matrix pass is claimed. Unknown formats must stay evidence-bounded. No claims about unobserved causal impact, financial benefit, prediction, or benchmark.
- Security remains fail-closed: no AuthGate/RLS bypass, no default tenant, no fabricated membership, and no cross-source/cross-tenant mixing.

### Gate separation at this checkpoint

| Gate | Current status | Evidence |
|---|---|---|
| CONTRACT / CI | PENDING after the handoff regex correction | Fresh current-baseline CI queued; previous handoff failure linked above |
| BUILD | PENDING | [Product Build Gate](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180426) queued |
| BROWSER | NOT PROVEN | [Full Product Browser E2E](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180514) queued |
| PERSISTENCE + READBACK | PRIOR-HEAD ONLY | Current-head upload and database readback journey not yet demonstrated |
| RUNTIME / PREVIEW | PENDING for current baseline | Deployment status pending at last read; previous preview status is not current proof |
| PRODUCTION | NOT PROVEN | Published production SHA remains historical/stale; no matching production smoke evidence |
| PRODUCT_COMPLETE | NO | Required customer journey and matrix are open |

NEXT_EXACT_ACTION = Read the first terminal result from the exact-head workflow set after the governance-only state sync; on failure, inspect that job's full log and fix only the first proven root cause. Do not re-run queued jobs or promote older-SHA evidence.
DO_NOT_MERGE = true


## HISTORICAL CHECKPOINT — 2026-10-10 00:42 — REPORT VISIBILITY REPAIR (superseded by the HEAD reconciliation above)

### Exact state
- Repository: https://github.com/Report-Engainall/Report-Advisor
- PR #912: https://github.com/Report-Engainall/Report-Advisor/pull/912 — OPEN, NOT MERGED.
- Code SHA described by this report: 447d1009caa6279faf5664da932c1f25addb8594. Main SHA: fa1ab4cbade9b01685507aa966c10f700a03f576.
- All historical checkpoint content from the 2026-10-08 source-agnostic checkpoint below is preserved; append-only reports also remain.
- Intermediate code commit 2bc08d60183193e53900561fb2b80e4b8702cc82 contained a literal escaped newline in a TSX comment and failed TypeScript/build. That defect was corrected on 447d1009caa6279faf5664da932c1f25addb8594; do not use the intermediate commit as validated code.

### P0 root cause verified with public route evidence
- On the Netlify public/preview host, PublicOrAuthenticatedWorkspace rendered ProposalDemoPage for every route merely because the hostname was a public Netlify preview/primary hostname.
- Live extraction of /reports at prior preview SHA 0474e1bf6f6e51414f9715154a385411f433f164 returned fixture inventory source 28-inventory-stockout-reorder.csv, not the tenant-protected Reports Center. This proves the visible route bug that caused demo output to substitute for the saved report experience.
- On code head 447d1009caa6279faf5664da932c1f25addb8594, host-triggered demo behavior is restricted to the landing route '/'. The protected /reports and /reports/smart/:jobId routes go through AuthGate and AppShell. Explicit ?demo=1 and /reports/smart/demo remain demo routes.
- The ?auth=1 branch now renders AuthGate with AppShell as its protected child, preventing an empty post-login workspace.
- scripts/customer-facing-report-surface-contract.test.mjs now asserts the landing-only demo route and the protected auth branch.
- The fix is pushed. Exact-head CI and the new Netlify preview/browser proof have not yet passed; do not claim completion.

### Other repairs retained
- 6f67a2ec558c08f4ea6af36c95dac56dadb0a14f: fix four Evidence Passport E2E selectors to use the visible decision chain/details summary; set E2E owner and corpus tenant IDs without weakening authorization.
- 7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b: update stale report-surface contract to match visible evidence proof.
- 0474e1bf6f6e51414f9715154a385411f433f164: Phase F PostgreSQL client uses configurable RESILIENCE_POSTGRES_CLIENT_IMAGE defaulting to public.ecr.aws/docker/library/postgres:17, after Docker Hub rate limiting blocked the predecessor backup/restore attempt. Fresh backup/restore PASS is pending.

### Predecessor-only persistence/readback evidence
- Source code head: 31cba40866569c6bdb6e53ce970b7b87901d1e5b.
- reportJobId: 16709d80-e012-40ef-9c12-6fd8255897f8; importJobId: 1e68460b-f181-4f09-a4fe-d6a58be1fb18; file record: c2d392e0-9b5c-4781-82b8-758680586524.
- Company/tenant: 99e33354-cc45-4317-8eb3-0d486b6c5932; source: تقارير ادارية.xlsx; sourceHash: sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313.
- 332 source/canonical rows, quality 98, evidence VERIFIED and execution stages completed. This proves DB readback on a predecessor, not visible report success on the fixed route; the old browser run failed later at the hidden text locator.

### Unified closure checklist
| Track | Status | Evidence / blocker |
|---|---|---|
| Netlify host route P0 | IMPLEMENTED; exact-head proof pending | Old live preview showed the fixture demo at /reports; new preview must show protected workspace/login and later the authorized catalog. |
| AuthGate, RLS, tenant/source guards | Prior contracts passed; exact-head rerun pending | No default company, bypass or cross-tenant visibility added. |
| Universal generic intelligence | PARTIAL | Generic fallback and Arabic XLSX tests exist; A–J file matrix not yet passed end-to-end. |
| Visible RTL Smart Report | IMPLEMENTED; current browser proof pending | Executive result, decision chain, Evidence Passport, source hash and trust UI exist in code. |
| Persistence/readback | PASS on predecessor only | Exact record lineage above; replay after route repair required. |
| Catalog→details→refresh/re-login | NOT PROVEN on current head | Need browser evidence of saved catalog entry, detail values and fingerprint after refresh. |
| Active membership account | PARTIAL | Predecessor report persisted; fixed route journey pending. |
| No-membership account | Fail-closed UI exists; browser proof pending | Arabic reason shown; no default company or RLS bypass. |
| Typecheck/build/quality | QUEUED for current code head | Intermediate 2bc syntax failure corrected on current head; fresh pass is required. |
| Full Product Browser E2E | QUEUED | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993204984 |
| Device-Independent Browser E2E | QUEUED | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205140 |
| Final Certification | QUEUED | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205047 |
| Product Build Gate | QUEUED | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205233 |
| Quality | QUEUED | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205223 |
| File Intelligence Security | PENDING | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205145 |
| Data Quality Runtime | QUEUED | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205023 |
| Phase F resilience | PENDING | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205011 |
| Session Handoff Contract | PENDING | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205007 |
| Netlify Preview | NOT PROVEN for current code head | Prior deploy for 2bc failed because of TSX syntax; require new deployment with source SHA 447d1009caa6279faf5664da932c1f25addb8594. |
| Production | STALE / NOT PROVEN | Published SHA 858ef8e3e5bc5bf74430555eadfb9e6767be348b is older than main fa1ab4cbade9b01685507aa966c10f700a03f576. |
| Product complete | NO | Current browser matrix, certification and same-head production smoke not proven. |

### Required matrix A–J
- A. Arabic monthly customer purchases workbook + totals: PARTIAL; regression fixture exists but actual upload journey is not proven.
- B. Numeric report in a different domain: NOT PROVEN.
- C. CSV upload→persist→refresh→catalog: NOT PROVEN.
- D. PDF/DOCX extraction into saved report: PDF parser regression passed on predecessor; full format-to-report proof is not proven.
- E. Empty/corrupt file clean rejection with no false report: NOT PROVEN.
- F. Meaningful UNKNOWN business report: generic fallback exists; persisted/browser proof not proven.
- G. User without company membership: fail-closed UI exists; live browser proof pending.
- H. Same source hash then a new hash: scoped safeguards exist; end-to-end readback proof pending.
- I. Empty catalog then saved report appears: catalog code exists; live proof pending.
- J. Reopen persisted report after refresh/re-login: prior DB readback PASS; current visual proof pending.

### Release discipline
- Local preview is not a persisted record; DB readback is not browser-visible completion.
- Queued or pending is not PASS; preview is not production.
- Do not weaken AuthGate, RLS, membership or source lineage.
- Do not merge or declare COMPLETE while a required gate remains open.

NEXT_EXACT_ACTION = Consume exact-head workflow and new Netlify preview results; prove /reports routes to AuthGate rather than demo, then prove authenticated upload→persist/readback→catalog→details→refresh/relogin and matrix A–J; repair the first terminal failure before evaluating release.
DO_NOT_MERGE = true
## 2026-10-08 checkpoint — source-agnostic file analysis closure
- APPLICATION HEAD BEFORE GOVERNANCE CHECKPOINT: 555b8b1865978ca7054537c7f23e579671c2e465.
- PR #905 merged successfully: source-agnostic external file analysis.
- Added generic parsing paths for TXT/Markdown, XML, YAML, RTF, legacy DOC review, plus explicit safe handling for ZIP containers.
- Added source-agnostic file intelligence for risk/action language, dates, numeric evidence, content profile, proposed action, and evidence boundaries.
- Added customer-facing GenericFileIntelligenceCard to the external file-analysis surface.
- Final Execution Batch on 555b8b1865978ca7054537c7f23e579671c2e465: 30/30 deterministic gates PASS.
- UI route completeness on 555b8b1865978ca7054537c7f23e579671c2e465: PASS.
- Storage tenant isolation on 555b8b1865978ca7054537c7f23e579671c2e465: PASS.
- PDF structured parser regression on 555b8b1865978ca7054537c7f23e579671c2e465: PASS.
- Netlify Deploy Preview for #905 passed and publicly rendered the general file-analysis upload surface.
- Vercel status remains infrastructure-limited by the Free daily deployment/build-rate limit and is not evidence of an application defect.
- Fresh quality/build/certification/browser gates for the application HEAD are still open.
- The prior Session Handoff failure was caused by persisted governance files still pointing to older HEADs; this checkpoint updates the recorded execution state to the current application HEAD.
- Production Netlify is still not proven current until its published deploy commit matches the final application HEAD.

CURRENT_OPEN_GATES
- Fresh exact-head quality/typecheck/build for the post-#905 main.
- Fresh exact-head final certification and full browser E2E.
- Same-head production deployment.
- GitHub Pages current-head proof if it becomes ready.

CURRENT_ACTIVE_FAILURE
- Infrastructure/proof only: Vercel Free deployment/build-rate limit.
- No application parser failure is asserted on the current application HEAD; current quality/build/certification results are still pending.

NEXT_EXACT_ACTION = Consume the current-head quality/typecheck/build result first; if clean, consume Final Certification + full browser E2E; then prove a same-head free production deployment. Do not certify from older SHAs.


## 2026-10-08 checkpoint — executive visual refinement
APPLICATION HEAD = d347f6a1683f808723388d26019497f6b78c539f4
UI_SCOPE = Shell / Sidebar / Topbar / Journey rail / Page headers / Cards / Tables / Smart Report surfaces / Mobile action bar
STATUS = IMPLEMENTED + INTEGRATED; terminal build/browser proof pending
DESIGN_DIRECTION = dark ink shell + indigo intelligence + restrained brass accent; remove legacy green/teal wash and reduce admin-CRUD visual density
NO_LOGIC_CHANGE = true
NEXT_EXACT_ACTION = consume fresh exact-head visual/build/browser gates for d347f6a1683f808723388d26019497f6b78c539f4; do not certify production from deployment READY alone.


## LIVE CHECKPOINT — 2026-10-10 00:50 — SOURCE-BOUND REPORT E2E

- Repository: https://github.com/Report-Engainall/Report-Advisor
- PR #912: OPEN / NOT MERGED — https://github.com/Report-Engainall/Report-Advisor/pull/912
- Branch: `fix/source-bound-generic-intelligence-20261009`
- Application code HEAD reviewed: `692e0d6ed5c299dfc1a3bda23dfea16ed24a374f`; parent: `54f4c6941304a0641c32e86d5fd8f095d5e42a31`.
- Main: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- Change on application HEAD `692e0d6ed5c299dfc1a3bda23dfea16ed24a374f`: Full Product Browser E2E now resumes the actual XLSX report job owned by test user C/company rather than an old PDF execution whose import metadata carries zero valid rows. It keeps source hash, company authorization and row-count checks; PDF extraction remains covered separately by parser regression.
- Netlify runtime endpoint read live on this code HEAD: `status=healthy`; `source_sha=build_sha=deployment_sha=692e0d6ed5c299dfc1a3bda23dfea16ed24a374f`; target environment `preview`; deployment `6ac9613bfb4f2400086a0786`. This is current preview runtime proof, not production proof.
- Public route fetch for unauthenticated `/reports` and `/reports/smart/:jobId` no longer returned the fixture inventory demo; it returned the general landing/auth surface. This proves only the demo override is gone; authenticated report catalog/details still require browser proof.

### Previous-run failure diagnosis
- Session Handoff Contract run `37994951056` on `3e46dd17511533bbbab77578b39c403058002020` failed because the docs pointed to older `447d100...` and `scripts/check-session-handoff-contract.mjs` used an over-escaped newline split. The checker was corrected on ancestor `99d1adfb5bc6df409243f47f0ebb8e53b4808262`.
- The subsequent Session Handoff Contract on `54f4c6941304a0641c32e86d5fd8f095d5e42a31` passed: [run 37995313007](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995313007).
- Quality run `37995312955` on `54f4c694...` failed its early branch exact-head diagnostic while the PR advanced to a later commit. Its log then showed `eslint: not found`, `vite/bin/vite.js` missing, and absent `dist/index.html` because the workflow's `Install` and preceding phases were skipped after the diagnostic failure. Treat those downstream messages as cascading failures for that stale run, not as valid evidence of a current-head build defect. Fresh Quality run for `692e0d6ed5c299dfc1a3bda23dfea16ed24a374f` is queued.
- Phase 9 Windows contract run `37995313052` similarly failed `Verify exact PR head` on a stale run; do not promote it to an application failure on `692e0d6ed5c299dfc1a3bda23dfea16ed24a374f`.

### Exact-head workflow state observed
- Full Product Browser E2E: [37995669275](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995669275) was pending at the last read for `692e0d6ed5c299dfc1a3bda23dfea16ed24a374f`; a newer exact-head run may be created by governance sync.
- Product Build Gate: [37995669087](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995669087) queued at last read.
- Quality: [37995669171](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995669171) queued at last read.
- Session Handoff Contract: [37995669026](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995669026) queued at last read.
- Device-Independent Browser E2E: [37995668973](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995668973) queued at last read.
- Final Certification Gate: [37995669096](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995669096) in progress at last read.
- This report does not claim a terminal PASS for any still-queued/in-progress exact-head gate.

### Release gates
| Gate | Status | Note |
|---|---|---|
| CONTRACT/CI | PARTIAL | Several security, UI route, import truth, certification and file-engine contracts passed on `692e0d6ed5c299dfc1a3bda23dfea16ed24a374f`; exact-head Quality and Session Handoff fresh result still pending |
| BUILD | PENDING | Product Build Gate queued |
| BROWSER | NOT PROVEN | Real Chromium authenticated journey has not finished |
| PERSISTENCE + READBACK | PRIOR HEAD ONLY | Current-head upload/recovery → catalog → details → refresh/re-login remains unproven |
| RUNTIME | PASS on preview | Healthy health endpoint and exact SHA match proven |
| PRODUCTION | NOT PROVEN | No production SHA/currentness/smoke pass established |
| PRODUCT_COMPLETE | NO | Do not merge or claim completed until required customer journey passes |

### Matrix A–J
A Arabic purchases XLSX: regression fixture exists; real upload path pending.
B different numeric domain: end-to-end not proven.
C CSV upload/persistence/catalog: not proven.
D PDF/DOCX full report journey: parser regressions are separate; full PDF/DOCX-to-persisted-report proof not proven.
E empty/corrupt file rejection: full journey not proven.
F unknown report type: generic intelligence exists; source-bound saved-report proof not proven.
G user without company membership: fail-closed contracts exist; live browser proof pending.
H same hash and new hash: end-to-end lineage/readback proof pending.
I empty catalog then saved report visible: not proven.
J reopen after refresh/re-login: not proven on current head.

NEXT_EXACT_ACTION = Consume the first terminal exact-head result after this documentation sync; diagnose the first failing step from its job log, then complete the authenticated XLSX report resume and Chromium journey through persisted catalog/detail/refresh proof. Do not re-run queued jobs blindly or promote stale-head evidence.
DO_NOT_MERGE = true
