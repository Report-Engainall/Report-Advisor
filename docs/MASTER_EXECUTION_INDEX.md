## CURRENT EXECUTION BOUNDARY — 2026-09-18

> تحديث تنفيذي بعد أمر المالك «انطلق». هذا القسم يصف الحالة المثبتة من الأدوات فقط. لا يتم نقل Evidence بين SHAs، ولا تُعد الحالة PASS إلا بدليل Exact-HEAD.

### CURRENT EXACT HEAD / DEPLOYED STATE
- **Reference code HEAD:** `c11c084d161cceb4595f8552b6c49c3f610f0ec2`.
- **Current main:** `c42214361bde9be484eab622adf7c6065a37af3e`; المقارنة مع `c11c084...` تُظهر تغييرات توثيقية فقط، لذلك لا يوجد تغيير Product/Runtime بينهما.
- **Netlify Production:** deploy `6aacfad6652a8000086bf290` = `ready`, branch `main`, commit `c422143...`; public fetch نجح، وظهر التطبيق للمستخدم غير المسجل دون جدار Netlify SSO/password.
- **Netlify administrative access control:** تم إزالة Team SSO/password requirement للمشروع فقط؛ لم يتم تغيير Auth التطبيق.
- **Staging DB live counts:** companies=2, memberships=2, import_jobs=3800, canonical_import_commits=2557, kpi_evidence_snapshots=314, sales_invoices=355.

### FRESH FINDINGS — ENGINEERING / RUNTIME / RELEASE
1. **Fresh exact-head runtime evidence:** غير مثبت على `c11c084...`; لا توجد workflow runs مرتبطة مباشرة بهذا SHA. لا يتم نقل Evidence من SHA آخر.
2. **Current parallel UI branch evidence is not certification evidence:** PR #587 / SHA `866e39...` لديه فشل UI/typecheck في `src/pages/ReportsPage.tsx`; هذا خارج ملكية Runtime ولا يُنقل إلى `c11c084...`.
3. **Phase F live resilience:** آخر تنفيذ exact-head على SHA الموازي أثبت أن سبب الفشل خارجي: جميع متغيرات Phase F الحية غير مُهيأة في GitHub Actions. المتطلبات المحددة: `RESILIENCE_TARGET_ENV`, `RESILIENCE_OPERATIONAL_TOKEN`, `RESILIENCE_CANARY_AUTH_TOKEN`, `RESILIENCE_HEALTH_URL`, `RESILIENCE_CANARY_URL`, `RESILIENCE_BACKUP_VERIFY_URL`, `RESILIENCE_ROLLBACK_DRILL_URL`.
4. **Migration/source parity blocker:** Staging migration ledger يحتوي على migrations تطبيقية أحدث غير موجودة في `c11...` source tree، منها: `20260918053906_reconcile_import_job_row_tenant_schema`, `20260918053540_reconcile_import_lineage_tenant_integrity`, `20260918053527_reconcile_import_lineage_idempotency`, `20260918043413_reconcile_report_execution_worker_service_authority`, `20260918024152_reconcile_report_execution_worker_search_path_completion`, `20260918023708_reconcile_report_execution_worker_search_path`. هذا **DRIFT حقيقي** ويجب إغلاقه forward-only؛ لا حذف أو إعادة كتابة للتاريخ.
5. **Storage baseline:** bucket `documents` private، وسياسات storage الحالية authenticated + tenant-scoped. Runtime signed-URL proof ما زال غير مثبت.
6. **Realtime:** publication `supabase_realtime` تشمل حالياً `client_ui_settings`, `customer_invitations`, `inventory_balances`, `orders`. Authorization runtime proof ما زال مطلوباً.
7. **Worker live state:** `report_execution_jobs` حالياً يحتوي completed=2556, dead_letter=5, failed=10, leased=3, processing=15, queued=515. هذا ليس بحد ذاته resilience PASS؛ disposable enqueue→claim→heartbeat→expiry→recovery→retry/DLQ ما زال مطلوباً.
8. **Backup/restore:** جدول `backup_verification_runs` لا يحتوي سجلات تحقق حالية؛ RPO/RTO المقاس غير مثبت.
9. **PDF/OCR:** لا يوجد نقل للنتيجة التاريخية `10/12`; يجب إعادة إثبات السيناريوهات على Exact HEAD. Repository path يحتوي بالفعل على structured PDF/OCR hardening، لكن ذلك لا يساوي runtime certification.
10. **Production parity:** Netlify public access مثبت؛ Vercel status على main ما زال غير صالح كدليل نشر بسبب build-rate-limit failure/pending، لذلك لا يُستخدم كـrelease proof.

### EXECUTION STATE
- **Done:** Netlify public-access administrative blocker removed and public access verified.
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
