SESSION HANDOFF = READY
ACTION_STATUS = ACTIVE_EXECUTION
CURRENT_EXACT_HEAD = 2bc08d60183193e53900561fb2b80e4b8702cc82
CURRENT_CODE_HEAD = 2bc08d60183193e53900561fb2b80e4b8702cc82
CURRENT_MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
CURRENT_EXECUTION_HEAD = 2bc08d60183193e53900561fb2b80e4b8702cc82
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912
CURRENT_PR_HEAD_AT_CODE_CHECK = 2bc08d60183193e53900561fb2b80e4b8702cc82
UPDATED_AT = 2026-10-10T00:35:00+03:00
PRODUCT_COMPLETE = NO

## LIVE EXECUTION CHECKPOINT — 2026-10-10 — PR #912

### State
- Repository: https://github.com/Report-Engainall/Report-Advisor
- PR #912: https://github.com/Report-Engainall/Report-Advisor/pull/912 — OPEN, NOT MERGED.
- Code head covered by this checkpoint: `2bc08d60183193e53900561fb2b80e4b8702cc82`.
- main at latest ref read: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- Previous current report stated `0474e1bf6f6e51414f9715154a385411f433f164`; the route correction in `src/App.tsx` is a new code change at `2bc08d60183193e53900561fb2b80e4b8702cc82`.
- This state preserves the older execution checkpoint archive below verbatim; previous dated report files remain append-only.

### Current root cause established with live public route evidence
- On Netlify preview/public hosts, `PublicOrAuthenticatedWorkspace` was returning `ProposalDemoPage` for every non-special route merely because the hostname was a Netlify preview/primary hostname. This caused `/reports` and `/reports/smart/:jobId` to show the generic fixture demo rather than the tenant-protected Reports Center and saved Smart Report.
- Live public extraction of `https://deploy-preview-912--aghbari-report-advisor.netlify.app/reports` showed demo inventory source `28-inventory-stockout-reorder.csv` and its explicit fixture disclaimer, not the real tenant catalog. The page metadata identified source SHA `0474e1bf6f6e51414f9715154a385411f433f164`.
- Fixed in `src/App.tsx` at `2bc08d60183193e53900561fb2b80e4b8702cc82`: proposal demo for host-based public/demo contexts is now landing-path-only, while explicit `?demo=1` and `/reports/smart/demo` remain deliberate demo paths. Other routes pass through `AuthGate<AppShell>`, preserving tenant isolation.
- Fixed `?auth=1` to render `<AuthGate><AppShell /></AuthGate>`, so a user does not land on an empty screen after login; this does not bypass the gate.
- Added route assertions to `scripts/customer-facing-report-surface-contract.test.mjs` so the broad preview-to-demo override and empty auth-query route cannot return silently.
- This is the most material product-facing fix in this session. It is implemented/pushed; new Netlify Preview and CI pass evidence for `2bc08d60183193e53900561fb2b80e4b8702cc82` is still pending.

### All changes made in this PR repair
- `6f67a2ec558c08f4ea6af36c95dac56dadb0a14f`: fixed four real-business E2E checks that selected a hidden duplicate Evidence Passport label; provisioned E2E actors for the actual report-owner tenant and separate corpus tenant. AuthGate/RLS unchanged.
- `7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b`: aligned the static customer-facing surface contract with visible Evidence Passport proof.
- `0474e1bf6f6e51414f9715154a385411f433f164`: made Phase F PostgreSQL utility image configurable with default `public.ecr.aws/docker/library/postgres:17` after Docker Hub anonymous rate limiting blocked backup/restore. The mirror fix only counts if live backup/restore passes.
- `2bc08d60183193e53900561fb2b80e4b8702cc82`: restricted host-triggered proposal-demo routing to the landing path and fixed the protected `?auth=1` branch; added regression checks.

### Persistence and source-lineage proof (prior head only)
- Authenticated browser E2E at source code head `31cba40866569c6bdb6e53ce970b7b87901d1e5b` created and read back a canonical report from Supabase:
  - report job: `16709d80-e012-40ef-9c12-6fd8255897f8`
  - import job: `1e68460b-f181-4f09-a4fe-d6a58be1fb18`
  - file record: `c2d392e0-9b5c-4781-82b8-758680586524`
  - company: `99e33354-cc45-4317-8eb3-0d486b6c5932`
  - source: `تقارير ادارية.xlsx`
  - `sourceHash=sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313`
  - 332 canonical/source rows, quality 98, evidence VERIFIED, report execution stages completed.
- This proves prior-head persistence/readback but not a fixed-head visible report journey. That older run stopped at the duplicate hidden-text locator; current E2E must show a screenshot/assertion after the route fix.
- Prior tenant E2E correctly rejected a test actor belonging to a synthetic tenant; actor configuration was corrected, not the app authorization.

### Unified closure checklist

| Track | Status | Evidence / next proof |
|---|---|---|
| Root public/Netlify route selection | IMPLEMENTED at `2bc08d60183193e53900561fb2b80e4b8702cc82`; PASS pending | Live old preview proves prior route bug; fresh preview must prove /reports is AuthGate and authorized saved details surface is real. |
| Core import/AuthGate/RLS | Prior contracts PASS; current-head rerun pending | Never bypass membership or tenant isolation. |
| Universal generic intelligence | PARTIAL | Generic unknown-archetype implementation + contract tests exist; A–J real-file browser matrix remains. |
| Visible RTL smart report | IMPLEMENTED; current browser PASS pending | Executive decision, chain, Evidence Passport, source hash and trust state are in app. |
| Persistence/readback | PASS on predecessor only | IDs/source lineage above; replay after fixes required. |
| Catalog→detail→refresh/relogin | NOT PROVEN on current head | Playwright must assert catalog entry, detail state, source hash and same values after reload/re-login. |
| Authenticated user with membership | PARTIAL | Previous persisted record evidence exists, but fixed route and current head need full journey proof. |
| User without company membership | FAIL-CLOSED UI present; browser proof pending | Arabic membership/context messages, no default company, no RLS bypass. |
| Quality/build/contracts on current head | PENDING | Fresh runs linked below; never report queued as PASS. |
| Full Product Browser E2E | QUEUED on code head; see run links | Captures and DB readback required. |
| Device-Independent Browser E2E | QUEUED on code head; owner company now explicit | Captures and no-membership scenario required. |
| Phase F live resilience | PENDING after ECR image change | Do not certify until backup→restore is proven end-to-end. |
| Netlify Preview | PREVIOUS code preview READY on `0474e1b`; latest `2bc08d60183193e53900561fb2b80e4b8702cc82` pending | Confirm exact `commit_ref` and test `/reports`, `/reports/smart/:jobId` after auth. |
| Production | NOT PROVEN / STALE | Published Netlify SHA was `858ef8e3e5bc5bf74430555eadfb9e6767be348b`, not current main `fa1ab4cbade9b01685507aa966c10f700a03f576`. |
| Product complete | NO | Required browser matrix, current-head certification and production deployed-SHA/smoke remain open. |

### Required matrix A–J
- A. Arabic customer/monthly purchases with totals: PARTIAL — XLSX semantic regression exists, actual uploaded workbook flow on the fixed current head not proven.
- B. Different numerical domain: NOT PROVEN on current browser matrix.
- C. CSV: upload→persist→refresh→catalog not proven on current head.
- D. PDF/DOCX: PDF structured parser regression passed on predecessor; whole format-to-stored-report journey not proven.
- E. Empty/corrupt file: live error/no-false-report path not proven.
- F. Meaningful UNKNOWN archetype: generic fallback is implemented; persisted browser proof not proven.
- G. Authenticated account without company membership: secure Arabic state exists; live browser proof not proven.
- H. Repeat source hash and then change source: scoped safeguards exist; full current-head import/readback proof not proven.
- I. Empty catalog then saved report: tenant catalog exists; live browser proof not proven.
- J. Stored report after refresh/relogin: DB readback proven on predecessor only; current visible proof pending.

### Exact-head workflow references
The following new checks were current at the last status read; each must be re-polled for terminal result and exact SHA:
- Quality: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992981427
- Product Build Gate: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992981516
- Final Certification Gate: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992981498
- File Intelligence Security: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992981598
- Full Product Browser E2E: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992981545
- Device-Independent Browser E2E: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992981154
- Phase F live resilience: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992981503
- Session Handoff Contract: https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992981077
- Netlify Preview for code head `2bc08d60183193e53900561fb2b80e4b8702cc82`: deployment pending at https://app.netlify.com/projects/aghbari-report-advisor/deploys/6ac95ae5d3655400088afafc

### DO NOT REPEAT
- Local file preview is not a persisted report.
- Supabase readback is not visible UI/browser proof.
- Queued is not PASS; Preview READY is not production.
- Do not weaken AuthGate, RLS, active membership, or tenant/source lineage.
- Do not declare support for a file format without actual extraction proof.
- Do not merge/declare COMPLETE with mandatory gates still open.

NEXT_EXACT_ACTION = Poll current-head workflow runs and Netlify Preview; first re-test public-host /reports route, then run the authenticated upload→persist/readback→catalog→detail→refresh journey and A–J matrix, repair the first terminal failure, and only after all gates pass assess merge and production.
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
