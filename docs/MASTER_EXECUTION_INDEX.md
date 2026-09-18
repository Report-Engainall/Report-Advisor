### LATEST EXECUTION UPDATE — 2026-09-18 / EXACT HEAD TEST + RUNTIME CLOSURE
- Current code/test candidate: `de49900065e141f8dab1e66b6587d57400082df3`; this follow-up commit is governance-only and exists to refresh the exact-head Preview deployment after the Vercel Preview runtime token was provisioned.
- Certification candidate is now `de49900065e141f8dab1e66b6587d57400082df3`; this is the first non-governance correction after the previously indexed candidate and therefore historical runtime evidence is not transferred automatically.
- Fresh head correction: Full Product Browser E2E KPI persistence harness now extracts the rendered Arabic evidence identifier from `لقطة الدليل:` instead of the obsolete English `Snapshot:` text. No production UI/data path was changed.
- Fresh runtime rerun before this correction: Commercial Product Creation E2E #492 PASS; Storage Tenant Runtime E2E #520 PASS; Device-Independent Browser E2E #515 was still running; Full Product Browser E2E #1805 failed only at the stale KPI snapshot-label assertion.
- Phase F #604 now reads all configured GitHub secrets, so secret provisioning is confirmed. Live probes are nevertheless FAIL-CLOSED at 0/4: operational-health HTTP 404, tenant-canary transport failure, backup-restore HTTP 405, rollback-forward-fix HTTP 405. The probe targets therefore require canonical live endpoint configuration; no synthetic evidence or seed was inserted.
- Vercel exact-head deployment remains externally blocked by the provider build-rate limit; an older deployment is not treated as current-head parity evidence.
- Supabase staging remains the governed target; no database mutation was made while correcting the test harness.
- Main remains unchanged at `1568e43889d27b5d850e64c0b99d03a994fd3bbe`.
- Certification remains FAIL-CLOSED until fresh Full Product E2E, live Phase F, exact deployed parity, and measured resilience/release evidence close on the current candidate.

### LIVE EXECUTION UPDATE — 2026-09-18T12:35Z
- **PR #595 Exact HEAD:** `46fd602a6038a6b2b7b4b45bf79e97e1de881adc`.
- **Fresh PC01 exact-head verification:** typecheck PASS; production build PASS; performance budget **887.7KB / 900KB** and largest JS 487.8KB; UI route/sidebar parity PASS (35/34); executive dashboard UI PASS.
- **Fresh exact-head release contracts:** 20/20 release readiness PASS; P0 13/13 PASS; P1 8/8 PASS; production-certification evidence integrity PASS; production-certification contract PASS; operational-resilience contract PASS; release-resilience manifest PASS.
- **CI state:** current authenticated browser/storage/worker/recovery/regression workflows are still QUEUED; no runtime PASS is transferred from another SHA.
- **Runtime truth:** local device has no E2E/Phase-F secret values. Direct staging attempt correctly fails closed without authenticated context; no credential/evidence bypass was used.
- **Still open:** authenticated business/persistence + tenant A/B runtime, storage signed-URL runtime, real worker lease/expiry/recovery/retry/DLQ runtime, measured backup/restore RPO/RTO, Phase-F live resilience, deployed-SHA parity, final certification.
- This update supersedes older exact-head pointers in this document; historical evidence remains bound to its original SHA.

### LIVE EXECUTION UPDATE — 2026-09-18T12:20Z
- **PR #595 Exact HEAD:** `cb49e15e0f892c81d233a50b773d709a5d7687cb`.
- **PC01 exact-head local verification on cb49e15e:** typecheck PASS; production build PASS; performance budget PASS at **885.3KB / 900KB**, largest JS 487.8KB; UI route/sidebar parity PASS (35 routes / 34 sidebar links); executive dashboard UI contract PASS.
- **Broader exact-head local contracts already re-proven on the current product wave before the latest navigation trim:** 20/20 release readiness PASS; P0 family 13/13 PASS; P1 family 8/8 PASS; production-readiness PASS; production-release-blocker contract PASS; operational-resilience contract PASS; release-resilience manifest PASS; production-certification evidence-integrity PASS; production-certification contract PASS; report-execution foundation PASS; report-execution E2E/adversarial guard contract PASS.
- **UI regression fixed during this execution:** commercial Seven-Hub navigation exceeded the 900KB performance budget (904.5KB). Nonessential navigation bundle weight was trimmed, duplicate hub path `/intelligence` was removed, and the same current Exact HEAD re-proved at 885.3KB.
- **Still fail-closed / not claimed closed:** authenticated browser/business persistence E2E; tenant A/B runtime denial; storage runtime signed-URL evidence; real worker lease/expiry/recovery/DLQ lifecycle; measured backup/restore RPO/RTO; Phase-F live resilience; exact deployed production parity; final certification.
- **External secret state on PC01:** E2E/Phase-F runtime variables are not present locally; no credentials were fabricated. These gates remain BLOCKED_EXTERNAL/UNPROVEN until the governed runtime inputs are available.
- This update supersedes older stale “NO EXECUTION STARTED” wording for PR #595.

### LATEST EXECUTION OVERRIDE — 2026-09-18T10:15Z
- PR #595 UI/Product exact head: 6eb585546d0e90c88fd14dbacdcb9b7771a48215.
- Final UI closure includes localization of the aging unknown-state user text; no new RPC/runner/data path introduced.
- Exact-head PC01 evidence on 6eb58554…: typecheck PASS; executive dashboard UI contract PASS; dashboard numeric truth PASS; route/sidebar parity PASS; production build PASS; performance budget PASS; PostCSS toolchain PASS.
- External release blockers remain outside the UI lane: GitHub Actions queue/pending state, Vercel provider deployment quota, runtime/persistence/12-scenario E2E, Phase F live resilience, backup/restore + measured RPO/RTO, and release parity.
- This override supersedes older READY STATE wording below where it says no execution has started.

## CURRENT EXECUTION BOUNDARY — 2026-09-18

> تحديث تنفيذي بعد أمر المالك «انطلق». هذا القسم يصف الحالة المثبتة من الأدوات فقط. لا يتم نقل Evidence بين SHAs، ولا تُعد الحالة PASS إلا بدليل Exact-HEAD.
- **CURRENT CODE/TEST CANDIDATE:** `de49900065e141f8dab1e66b6587d57400082df3` on `integration/certification-candidate-20260918`; current branch HEAD is a governance-only binding commit after this candidate.
- **Fresh current-head changes:** KPI persistence browser harness now matches the actual rendered Arabic evidence identifier; no production UI/data path changed.
- **Runtime state:** browser/business/storage/PWA E2E, worker live lifecycle, backup/RPO/RTO and Phase-F live resilience remain unproven or externally blocked; no certification is claimed.

### CURRENT EXACT HEAD / DEPLOYED STATE
- **Reference product/runtime code HEAD:** `c11c084d161cceb4595f8552b6c49c3f610f0ec2`; current `main` also carries the forward-only security/source-parity migrations merged afterward.
- **Current main:** `7d6bca3c02416c9b6c877e82115eb9961f635a47`; this includes the forward-only security/source-parity merge `64c870426...` plus the closure-ledger docs sync. Product feature code remains anchored to the earlier runtime code reference until PR #587 is accepted.
- **Netlify Production:** latest verified production deploy `6aacfe23cc817a00089dce5c` = `ready`, branch `main`, but still points to commit `ad12e9e564f85ffde8bb29daa6e41e73ca969b92`, which predates current `main`. Public access remains verified without Netlify SSO/password. Connector-side redeploy requires a source/repo execution environment.
- **Netlify administrative access control:** تم إزالة Team SSO/password requirement للمشروع فقط؛ لم يتم تغيير Auth التطبيق.
- **Staging DB live counts:** companies=2, memberships=2, import_jobs=3800, canonical_import_commits=2557, kpi_evidence_snapshots=314, sales_invoices=355.

### FRESH FINDINGS — ENGINEERING / RUNTIME / RELEASE
1. **Fresh exact-head runtime evidence:** product/runtime certification remains unproven. PR #587 now has fresh exact-head candidate `3c4bb990a0e0188f9984e0cd67d941cd29c7824e`, with 48 workflows re-triggered; no new PASS evidence is yet claimed.
2. **PR #587 exact-head harness finding:** at `dfdc662...`, Full Product Browser E2E and Storage Tenant Runtime E2E both failed at the login control before business checks because tests required the obsolete text `تسجيل الدخول` while `LoginPage` renders `الدخول إلى مساحة العمل`. The harness was corrected on the branch at `182f0983...` and `3c4bb990...` to target `form button[type="submit"]`.
3. **Phase F live resilience:** آخر تنفيذ exact-head على SHA الموازي أثبت أن سبب الفشل خارجي: جميع متغيرات Phase F الحية غير مُهيأة في GitHub Actions. المتطلبات المحددة: `RESILIENCE_TARGET_ENV`, `RESILIENCE_OPERATIONAL_TOKEN`, `RESILIENCE_CANARY_AUTH_TOKEN`, `RESILIENCE_HEALTH_URL`, `RESILIENCE_CANARY_URL`, `RESILIENCE_BACKUP_VERIFY_URL`, `RESILIENCE_ROLLBACK_DRILL_URL`.
4. **Migration/source parity:** PR #590's forward-only reconciliation is merged to `main`, and staging has the matching end-state applied. The remaining work is disposable replay/verification; no historical migration rewrite is authorized. `20260918053906_reconcile_import_job_row_tenant_schema`, `20260918053540_reconcile_import_lineage_tenant_integrity`, `20260918053527_reconcile_import_lineage_idempotency`, `20260918043413_reconcile_report_execution_worker_service_authority`, `20260918024152_reconcile_report_execution_worker_search_path_completion`, `20260918023708_reconcile_report_execution_worker_search_path`. هذا **DRIFT حقيقي** ويجب إغلاقه forward-only؛ لا حذف أو إعادة كتابة للتاريخ.
5. **Storage baseline:** bucket `documents` private، وسياسات storage الحالية authenticated + tenant-scoped. Runtime signed-URL proof ما زال غير مثبت.
6. **Realtime:** publication `supabase_realtime` تشمل حالياً `client_ui_settings`, `customer_invitations`, `inventory_balances`, `orders`. Authorization runtime proof ما زال مطلوباً.
7. **Worker live state:** `report_execution_jobs` حالياً يحتوي completed=2556, dead_letter=5, failed=10, leased=3, processing=15, queued=515. هذا ليس بحد ذاته resilience PASS؛ disposable enqueue→claim→heartbeat→expiry→recovery→retry/DLQ ما زال مطلوباً.
8. **Backup/restore:** جدول `backup_verification_runs` لا يحتوي سجلات تحقق حالية؛ RPO/RTO المقاس غير مثبت.
9. **PDF/OCR:** لا يوجد نقل للنتيجة التاريخية `10/12`; يجب إعادة إثبات السيناريوهات على Exact HEAD. Repository path يحتوي بالفعل على structured PDF/OCR hardening، لكن ذلك لا يساوي runtime certification.
10. **Production parity:** Netlify public access is verified, but Production is still serving the older `ad12e9e...` deploy. Vercel remains externally blocked by `api-deployments-free-per-day` build-rate-limit and is not release proof.


### CURRENT PRODUCT WAVE UPDATE — PR #595
- UI/product wave rebased directly onto current main fe5661060462ffa21d6aa31505f80c2021c4170a and opened as PR #595.
- Superseded PR #587 is closed; no historical CI/evidence from #587 is treated as certification for #595.
- Latest product/UI execution source head before this governance sync: `3230faa7d0dcd8258fcf8b1eb9d4265bb4f0eb81`. This checkpoint includes UI contract-alignment test fixes only after the completed product surface work.
- UI work included shell/header/sidebar/command palette, dashboard truth context, Intelligence assistant, decision stage UX/deep-link synchronization, Data Quality, Executive Command Center/Report, Metric Inspector, Alternatives and Work Center refinements.
- Shared E2E login harness fixed to target the semantic form submit control instead of the obsolete localized login-label text.
- Dashboard truth adversarial regression contract made whitespace-tolerant without weakening the intended semantic guard.
- PR #595 is based directly on current main; fresh exact-head CI is authoritative.

### LATEST UI SURFACE UPDATE — PR #595
- Canonical Import visible durable-job label localized; import workflow remains on the existing authoritative lifecycle and RPC path.
- Full navigation parity verified: Router 33 non-wildcard routes ↔ Command Palette 33 paths ↔ Sidebar 33 links; Header labels cover all non-root routes.
- PWA verification: current preview exposes service worker v2 with app-shell/offline navigation fallback; source manifest is Arabic RTL, standalone, and scoped to root.
- Route/sidebar parity verified after the latest nav fix: 34 application routes, 33 sidebar links (wildcard excluded), no missing or duplicate paths.
- Added canonical report links for sales, purchases, and inventory to the sidebar; hardened the parity parser for whitespace-tolerant path syntax.
- Localized remaining visible technical English across Intelligence, Decision Experience, Executive Report, Data Quality, File Analysis, Onboarding, Metric Inspector, Proposal Demo, shell and contextual assistant surfaces.
- Added semantic selection/pressed states to additional mode/tab controls.
- Completed an additional UI polish pass: localized operating-model/context labels, translated decision lifecycle states, replaced raw freshness JSON with a user-readable freshness policy, localized metric snapshot wording, normalized the Proposal Demo setter, localized the Proposal capability/snapshot surface, and localized the aging-analysis unknown-state label (UNDATED → Arabic user-facing wording).
- Repaired dashboard UI contract drift: the guard now follows the current executive headline, work-path surface, live alert/recommendation arrays, and current coverage wording instead of obsolete identifiers/copy.
- Current Netlify public preview renders the Arabic Aghbari shell successfully; Vercel preview is provider-authenticated. Certification remains independent of preview rendering.
- Exact-head GitHub Actions on the current product source head remain queued/pending; no PASS is transferred or claimed. Local PC01 verification on 6eb58554… passed typecheck, production build, executive-dashboard UI contract, dashboard numeric-truth contract, route/sidebar parity, PostCSS toolchain and performance budget.
### LATEST EXECUTION UPDATE — 2026-09-18
- Staging forward-only parity checkpoint applied successfully: `harden_import_field_lineage_rls`, `revoke_authenticated_worker_enqueue`, `reconcile_live_source_end_state`.
- Verified import row integrity: null company=0, orphan job=0, cross-tenant row/job mismatch=0.
- Verified all 8 durable report-execution RPCs: authenticated EXECUTE=false, service_role EXECUTE=true; all have `search_path=public, pg_catalog`.
- Verified `import_field_lineage` authenticated policy is explicit restrictive deny; Security Advisor targeted findings remain clear.
- PR #590 source migrations are merged into `main` at `64c870426b75de7726e0f60321d580074bb76fa9`; staging verification is clean for import-row integrity and worker RPC authority.
- Product development PR #587 type error is repaired at `dfdc662...`; a fresh shared-harness login regression was then fixed at `182f0983...` and `3c4bb990...`. Fresh workflows on `3c4bb990...` remain authoritative and pending.

### EXECUTION STATE
- **Done:** Netlify administrative access blocker removed; PR #590 security/source-parity migrations merged; staging import-row integrity is 0/0/0 and all 8 worker RPCs are service_role-only with pinned search_path.
- **In progress:** exact-head runtime/DB/release closure; migration parity investigation; operational certification evidence.
- **Blocked externally:** Phase F live probes until required GitHub Actions secrets/targets are provisioned.
- **Fail-Closed:** Final certification remains closed until fresh Exact-HEAD Browser E2E + persistence + resilience + backup/RPO/RTO + release parity evidence exists.

### OWNERSHIP SPLIT — START ONLY AFTER OWNER COMMAND

#### A) UI / Product Experience Owner — ChatGPT
**الاختصاص الكامل:** تطوير الواجهات وتجربة المنتج فقط، مع الالتزام بالمصادر/Adapters/RPCs الحالية وعدم اختراع مسارات بيانات جديدة.

**المتبقي فقط:**
1. **موجة UI الشاملة لبقية الأسطح:** Analytics، Data Quality، Intelligence/Intelligence Pages، Executive Command Center/Report، Decision Experience، Inventory Intelligence، Demand Velocity، Alternative Groups، Metric Inspector، Scenario/Scenario Truth Guard، External File Analysis، Onboarding، Company/Profile Settings، وكل الصفحات canonical/report detail غير المغلقة بصريًا.
2. **توحيد نظام الواجهة:** typography/spacing/surfaces/buttons/forms/tables/badges/tabs/dialogs/empty-loading-error states، RTL، hierarchy، density، visual evidence states.
3. **مسار المنتج المتكامل:** Source → Evidence → Data → Decision → Action → Outcome داخل الواجهة، مع progressive disclosure وعدم إخفاء نقص البيانات أو حالات review/reject/insufficient-data.
4. **Command Palette / keyboard-first UX** وربطها فعليًا بالمسارات والإجراءات الموجودة دون اختراع actions backend.
5. **Saved views / filters / grouping / reset UX** بالاعتماد على المسارات الحالية، مع الحفاظ على tenant scope.
6. **Mobile + responsive + low-bandwidth:** progressive disclosure، جداول قابلة للاستخدام، عدم الاعتماد على صور ثقيلة، وعدم تحميل الموارد غير المطلوبة للمسار.
7. **Performance / storage economy للواجهة:** route-level lazy loading، تقسيم chunks، إزالة التكرار والأنماط/المكونات المكررة، عدم إضافة حزم ثقيلة بلا ضرورة، وعدم إدخال assets كبيرة إلى المستودع.
8. **Accessibility + RTL quality:** focus/keyboard/labels/contrast/reduced-motion، حالات الشاشة الصغيرة، ودعم الاستخدام الفعلي بالعربية.
9. **Visual QA بعد كل موجة:** exact-head build + route verification + responsive sanity + no console errors في المسارات التي يتم تعديلها؛ لا يُرفع أي UI claim إلى Certification بدون Evidence حقيقي.

**حدود هذا المسار:** لا تغيير في RPCs، لا Runner جديد، لا fake KPI/data، لا bypass، لا نقل مسؤولية commit إلى الواجهة.

#### B) Engineering / Runtime / Release Owner — Programmer
**الاختصاص الكامل:** كل ما عدا تطوير الواجهات أعلاه، مع السياسة الصارمة الحالية.

**المتبقي فقط:**
1. **Fresh exact-HEAD business/browser E2E:** real Chromium + real Supabase auth + Actor A/B + tenant isolation + import/create/read-back/refresh/logout؛ لا mocks ولا service-role browser sessions.
2. **إغلاق Known Runtime blockers:** آخر 12-scenario runtime كان `10/12` مع فشل `pdf-text` و`pdf-ocr-ar` بسبب `POSITIVE_POLICY_COMMIT_UNAVAILABLE`، إضافة إلى فشل persistence E2E؛ يجب إعادة التحقق على `c11c084...` أو SHA أحدث وعدم نقل أي Evidence قديم.
3. **PDF/OCR positive-policy commit path:** extraction → normalization → validation → canonical commit → render، باستخدام المسار القائم، بدون إعادة كتابة durable runner.
4. **Persistence / business truth:** إصلاح السبب الجذري لأي فشل في commit/read-back، والتحقق من DB→UI→refresh truth.
5. **Migration/source parity:** إغلاق أي live migration/source lineage drift بقي من السجل، بدون rewriting تاريخي.
6. **Worker resilience:** enqueue → claim → heartbeat/checkpoint → expiry/recovery → retry/DLQ evidence.
7. **Operational certification:** storage/signed URL، realtime authorization، AI retrieval isolation، backup/restore + measured RPO/RTO، rollback/forward-fix، observability/SLO، security/secret audit.
8. **Production/release parity:** exact environment variables/config، signed artifact verification، staging dry-run/schema drift، release manifest/canary/stabilization، final fail-closed certification bundle.
9. **Netlify/public-access verification:** التأكد من أن حماية Netlify الإدارية لا تمنع الوصول المقصود لتطبيق المستخدم؛ لا تغيير في Auth داخل التطبيق ولا تعطيل ضوابطه.
10. **Resource/storage economy خارج UI:** CI/deployment hygiene، منع artifacts المكررة/الكبيرة في Git، تقليل استهلاك build/deploy حيث لا يمس وظائف المنتج أو Evidence، وعدم حذف أي مصدر أو سجل مطلوب.
11. **Memory/governance:** بعد كل دفعة تنفيذية، تحديث exact HEAD، evidence، blockers والمالك؛ لا تعاد Audits المغلقة ما لم يتغير SHA أو البيئة أو العقد.

### NON-NEGOTIABLE EXECUTION RULES
- لا يبدأ أي مسار من هذه القائمة قبل أمر المالك **«انطلق»**.
- بعد أمر «انطلق» تعمل المساران بالتوازي؛ لا ينتظر أحد المسارين الآخر عند وجود blocker خارجي.
- ما هو منجز أعلاه لا يعاد كمهام جديدة إلا إذا ظهر Regression على SHA/Environment متغير.
- كل PASS يجب أن يكون حقيقيًا، exact-HEAD، وقابلًا للتتبع؛ لا historical transfer ولا synthetic evidence.
- Staging first لأي DB mutation؛ Production mutation ممنوع دون إثبات الهدف والبوابة المناسبة.
- لا rebuild من الصفر، لا duplicate runner/RPC، ولا fake fixtures في مسارات الاعتماد.
- الأولوية في توفير المساحة: تقليل تكرار builds/assets/dependencies ورفع الكفاءة قبل إضافة موارد جديدة، مع إبقاء المنتج كاملًا.

### READY STATE FOR NEXT COMMAND
- **Status:** تخطيط وتقسيم ملكية فقط — **NO EXECUTION STARTED**.
- **Next owner command:** `انطلق`.
- عند وصول `انطلق`: ChatGPT يبدأ موجة UI الشاملة، والمبرمج يبدأ كل الأعمال الهندسية/التشغيلية/الشهادات المتبقية أعلاه بالتوازي.
- لا حاجة لإعادة إرسال هذه التعليمات بعد أمر «انطلق».
 
## DEEP AUDIT — 2026-09-07

### Database / Security baseline
- Staging Supabase project baseline was previously observed as `ACTIVE_HEALTHY`; these historical observations are not treated as current-head certification evidence.
- Critical-table RLS verification: 9/9 checked tables protected in the historical baseline.
- Critical-table anonymous-policy verification: 9/9 checked tables had no anon policies in the historical baseline.
- Security-definer authenticated surface was previously audited for tenant binding and pinned `search_path`.
- Worker RPC surface was designed for service_role-only execution; authenticated browser execution is not a substitute for worker authority.
- Canonical import RPCs remain the supported authenticated business mutation surface.
- Runtime lifecycle PASS is never inferred from schema-only inspection.

### P0 — AUTHENTICATED E2E / TENANT A-B
- Dedicated Actor A/B authenticated users and one-to-one tenant mapping remain part of the established browser test design.
- The real business runner covers authenticated tenant resolution, customer/product/invoice import, DB read-back, UI read-back, refresh continuity, Tenant B isolation, cross-tenant denial, and logout/session lifecycle.
- Existing customer and product screens now use tenant-scoped pagination/search and real create dialogs through existing canonical paths; current Main source confirms the capability, but fresh current-head business E2E evidence is still required before certification.
- `/onboarding` is present in current Main and reads authenticated user, current company, membership role, canonical import count, and data-quality state; current-head browser proof remains required.
- `/work-center` is present in current Main and is read-only: it reads existing `fetchImportRecords()` state and exposes operational filters/counts without creating a parallel job state.
- There is no dedicated invoice-entry route; canonical import remains the supported invoice mutation surface.

### P1 — MIGRATION / SCHEMA PARITY
- Migration/observability parity was reconciled on Main through PR #520 using the forward-only lineage already established by the project.
- No historical migration record is rewritten.
- Fresh disposable replay parity is still required before certification; PR/branch evidence is not equivalent to a fresh replay PASS.

### Worker / Reliability
- Durable worker contract has explicit tenant identity, lease ownership, lease-token fencing, checkpoint monotonicity, retry budget, dead-letter handling, source provenance, and service_role-only execution.
- Queue scalar boundaries are implemented in current Main: blank run/worker/lease identifiers are rejected, retry budgets require positive integers, and lease duration is finite and at least 30 seconds.
- Worker runtime crash/retry/recovery remains UNPROVEN until an actual disposable job is executed through enqueue → claim → heartbeat/checkpoint → forced expiry → recovery → retry/DLQ.
- Current exact-head resilience workflows are enabled for PRs and verify the checked-out SHA explicitly before execution.

### OCR / Document Intelligence
- The historical OCR confidence defect fix remains part of the repository contract: recognition confidence is preserved, malformed metadata fails closed, and low-confidence/no-text paths are review/reject paths rather than fabricated confidence.
- Repository-native OCR behavioral coverage exists.
- Real Arabic golden-corpus runtime remains NOT PROVEN until an actual document passes through source → OCR → normalization → DB → reconciliation → analytics → evidence/decision → output on the current exact SHA.

### Import / Reconciliation
- Canonical import remains the supported business mutation path.
- Import RPC tenant context, direct-write guards, transaction lifecycle, state contracts, business-key behavior, and runtime governance are represented by repository checks.
- Current Main now resolves duplicate source identity against tenant-scoped `canonical_import_commits` using normalized SHA-256 identity before consulting legacy `file_records`; no historical duplicate PASS is transferred.
- Current-head import runtime with real authenticated tenant data remains NOT PROVEN until exact-SHA E2E evidence records upload/preview/commit/read-back, duplicate terminal idempotency, and A/B denial.

### Watched Folder
- Native watched-folder contract exists and is covered by repository checks.
- End-to-end discovery, hash/fingerprint, duplicate handling, tenant binding, processing handoff, terminal state, and retry remain operationally UNPROVEN.
- Disposable lifecycle execution remains required before certification.

### Billing / Commercial Runtime
- Current Main contains the provider-neutral billing runtime: plans/capabilities/subscriptions/usage/events, tenant RLS, idempotent usage and provider event keys, quota/entitlement fail-closed behavior, and authenticated-only SECURITY DEFINER billing RPC execution.
- Billing SECURITY DEFINER functions explicitly revoke PUBLIC/anon execution before granting `authenticated` execution.
- Billing runtime is repository-merged; real provider webhook/payment integration and current-head staging runtime proof are not claimed without live evidence.

### Decision / Evidence / Outcomes
- Decision SECURITY DEFINER functions were reviewed individually rather than blanket-revoked.
- Sensitive decision mutations use tenant context and user identity checks; anonymous execution is denied.
- Decision work-item RLS is tenant-scoped.
- Outcome/evidence paths enforce tenant/provenance/state boundaries.
- The release decision layer currently fail-closes on missing/invalid `source_sha`, candidate SHA mismatch, scenario count mismatch, non-PASS scenario states, per-scenario SHA mismatch, missing/invalid evidence, evidence hash mismatch, and regression mismatch.
- Final Certification Gate checks out the exact certification SHA with full history, verifies certification-boundary integrity, verifies exact checkout provenance, and rejects synthetic PR merge SHA as certification evidence.
- Final certification remains FAIL-CLOSED until fresh exact-head runtime/evidence and governed candidate binding are satisfied.