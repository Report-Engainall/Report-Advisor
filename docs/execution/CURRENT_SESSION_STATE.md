SESSION HANDOFF = READY
ACTION_STATUS = ACTIVE_EXECUTION
CURRENT_EXACT_HEAD = 0474e1bf6f6e51414f9715154a385411f433f164
CURRENT_CODE_HEAD = 0474e1bf6f6e51414f9715154a385411f433f164
CURRENT_MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
CURRENT_EXECUTION_HEAD = 0474e1bf6f6e51414f9715154a385411f433f164
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912
CURRENT_PR_HEAD_AT_CODE_CHECK = 0474e1bf6f6e51414f9715154a385411f433f164
UPDATED_AT = 2026-10-10T00:29:00+03:00
PRODUCT_COMPLETE = NO

## CURRENT EXECUTION CHECKPOINT — 2026-10-10 — PR #912

### Exact state and history integrity
- Repository: https://github.com/Report-Engainall/Report-Advisor
- PR #912: https://github.com/Report-Engainall/Report-Advisor/pull/912 — OPEN, NOT MERGED.
- Exact application code HEAD covered by this checkpoint: `0474e1bf6f6e51414f9715154a385411f433f164`.
- main HEAD at inspection: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- Previous live files incorrectly referred to `b40e6a1462ca8b660c8f4e07461132b0da7bccbb`; it is a predecessor, not the current execution head.
- Previous governance writeback omitted the older checkpoint body. It has been restored verbatim below this current checkpoint; earlier execution history is preserved.
- This report distinguishes the exact tested application code head from the subsequent docs-only writeback commit because a report cannot contain its own eventual commit SHA without another commit.

### Actual changes in this repair
- `6f67a2ec558c08f4ea6af36c95dac56dadb0a14f`: corrected four browser checks to wait for the visible source-bound decision chain and Evidence Passport details summary. Explicitly set Device-Independent Browser E2E owner and corpus tenant IDs. No AuthGate/RLS/tenant guard was weakened.
- `7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b`: corrected the static customer-facing surface contract to require that visible proof and forbid the hidden-text locator.
- `0474e1bf6f6e51414f9715154a385411f433f164`: changed three Phase F `psql`/`pg_dump` invocations to the configurable `RESILIENCE_POSTGRES_CLIENT_IMAGE`, default `public.ecr.aws/docker/library/postgres:17`, avoiding Docker Hub anonymous pull rate limiting. This is not a pass until live backup/restore passes on current head.
- No merge or production promotion has occurred.

### First failures and root causes
- Previous Full Product Browser E2E did create/read back a real canonical report, then failed when Playwright selected a hidden duplicate `EVIDENCE PASSPORT` text instead of the visible details summary. Browser helper and contract were corrected. Fresh exact-head browser proof remains pending.
- Previous Device-Independent E2E used synthetic tenant A rather than the real report-owner company; the application's tenant guard correctly denied access. Workflow now provisions the actor with the right company ID and separate corpus tenant, without bypassing tenant security.
- Previous Product Build Gate then failed because a static source contract required the old broken selector at `scripts/customer-facing-report-surface-contract.test.mjs:55`; corrected on `7a91d7c`.
- Previous Session Handoff Contract failed because the state/report had not accounted for changed source files and listed stale SHAs. This writeback anchors the code checkpoint at `0474e1bf6f6e51414f9715154a385411f433f164`.
- Previous Phase F backup/restore failed because Docker Hub anonymous pull rate limiting prevented fetching `postgres:17`; the client-image registry was switched to the verified public ECR official image mirror. Fresh test result is pending.
- Canonical path is unchanged: `/try-report` and `/import/analyze` are preview/local analysis; persistence is via `/import` under AuthGate/active company. Local preview is not a saved report.

### Persisted record proof from predecessor (not current-head browser proof)
- Source head: `31cba40866569c6bdb6e53ce970b7b87901d1e5b`.
- reportJobId: `16709d80-e012-40ef-9c12-6fd8255897f8`.
- importJobId: `1e68460b-f181-4f09-a4fe-d6a58be1fb18`.
- fileRecordId: `c2d392e0-9b5c-4781-82b8-758680586524`.
- company/tenant: `99e33354-cc45-4317-8eb3-0d486b6c5932`.
- source: `تقارير ادارية.xlsx`.
- sourceHash: `sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313`.
- 332 source/canonical rows, quality score 98, evidence state `VERIFIED`, and rendered checkpoint recorded. The subsequent UI locator failure means browser-visible completion must still be re-proven after the fix.

### Unified completion checklist

| Track / gate | Status | Evidence / blocker |
|---|---|---|
| Core routing and tenant/source guards | PASS on predecessor; current run pending | Prior route/company/security contracts passed. |
| Generic intelligence and Arabic XLSX | PARTIAL | Generic intelligence/semantic tests exist and passed on predecessor; unknown archetype and full real workbook matrix remains. |
| RTL Smart Report visual | IMPLEMENTED; browser proof pending | Executive surface, decision chain, generic intelligence and Evidence Passport exist in code. |
| Persistence/readback | PASS on predecessor | Exact IDs above; rerun after fix required. |
| Catalog/detail/refresh | NOT PROVEN on current head | Tenant-paged catalog and source-hash-bound detail exist, but fresh browser screenshot/reload assertion pending. |
| Auth user with membership | PARTIAL | Prior canonical report test persisted/read back; current-head full flow pending. |
| Auth user without membership | Static fail-closed UI present; live browser proof pending | Arabic no-membership/unresolved-context reasons; no default tenant or RLS bypass. |
| Build/typecheck/quality | Pending for current head | Previous build failed on stale static locator contract; corrected; exact-head rerun queued. |
| Session handoff | Prior-head failure corrected; exact-head rerun queued | State/report now identify this code head; historical state is restored. |
| Full Product Browser E2E | Pending | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992370030 |
| Device-Independent Browser E2E | Pending | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992370160 |
| PDF parser regression | PASS on predecessor | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37991603631; live PDF/DOCX-to-stored-report flow is unproven. |
| Phase F live resilience | Pending after image mirror change | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992370028 |
| Preview deployment | Pending for `0474e1bf6f6e51414f9715154a385411f433f164` at last check | https://app.netlify.com/projects/aghbari-report-advisor/deploys/6ac95986e0c1ac0008ab7612 |
| Production deployment | FAIL / stale | Published SHA `858ef8e3e5bc5bf74430555eadfb9e6767be348b`, older than main `fa1ab4cbade9b01685507aa966c10f700a03f576`. |
| Product complete | NO | E2E matrix, current-head proof and same-head production proof incomplete. |

### Required matrix A–J (current live state)
- A. Arabic monthly customer purchases workbook + totals: PARTIAL — regression fixture exists; real supplied workbook upload flow unproven.
- B. Different numeric domain: NOT PROVEN in current browser matrix.
- C. CSV upload→persistence→refresh→catalog: NOT PROVEN.
- D. PDF/DOCX extraction→stored report: PDF parser regression passed on predecessor; complete browser flow NOT PROVEN.
- E. Empty/corrupt file: NOT PROVEN in live browser matrix.
- F. Meaningful UNKNOWN archetype: generic path exists; persisted browser proof NOT PROVEN.
- G. User without company membership: secure Arabic gate exists; live browser proof NOT PROVEN.
- H. Same-file duplicate vs changed sourceHash: safeguards exist; current full browser/readback proof NOT PROVEN.
- I. Empty catalog→saved report: catalog exists; browser proof NOT PROVEN.
- J. Stored report after reload/relogin: prior DB readback exists; current visible refresh/relogin proof pending.

### Current-head CI links (queued/pending at last poll)
- Quality: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992370038
- Product Build Gate: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992369738
- Final Certification Gate: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992369617
- File Intelligence Security: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992369495
- Full Product Browser E2E: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992370030
- Device-Independent Browser E2E: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992370160
- Phase F live resilience: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992370028
- Session Handoff Contract: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992370182

### DO NOT REPEAT
- Preview is not persistence; DB readback is not browser proof.
- Queued is not PASS; Netlify Preview is not production.
- Do not weaken AuthGate, RLS, membership or tenant isolation.
- Do not claim a file format works without extraction proof.
- Do not merge or write COMPLETE with mandatory gates still open.

NEXT_EXACT_ACTION = Consume current-head CI/browser/Phase-F outcomes, fix the first terminal failure without weakening security or contracts, execute the A–J source matrix, then verify production deployed SHA and smoke after a valid merge.
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
