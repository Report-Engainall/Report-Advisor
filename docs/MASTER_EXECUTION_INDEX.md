# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-18

> هذا القسم هو حالة العمل الحالية فقط. السجل التاريخي محفوظ أدناه ولا يُعاد منه اعتماد أي Evidence عبر حدود Exact HEAD. لا يوجد تنفيذ برمجي جديد ضمن هذه المزامنة؛ هذه الموجة توثيق/تقسيم ملكية فقط.

### CURRENT EXACT HEAD / DEPLOYED STATE
- **Current code/test HEAD:** `c11c084d161cceb4595f8552b6c49c3f610f0ec2` (last code change).
- **Current repository HEAD:** `913de96f068cbcc4cc59de7a4368313fe12dcd23` (documentation-only sync; no product/runtime code mutation).
- **Netlify Production:** `ready` ومربوط بنفس الـHEAD؛ Build `npm run build` نجح، وSPA redirect نجح.
- **Completed UI wave:** Application Shell + RTL visual system + Dashboard + Login + Work Center + Import framing + Reports Center. هذه الأسطح تُعامل الآن كـ**منجزة مصدرًا** ولا تُعاد كمهام تصميمية أساسية.
- آخر إصلاح منشور: تصحيح JSX في `src/pages/WorkCenterPage.tsx` بعد خطأ Build، ولا توجد حاجة لإعادة فتح هذا العطل.
- لا تُستخدم حالة Netlify الناجحة كدليل على Browser/Auth/Business E2E؛ Runtime certification تبقى Exact-HEAD فقط.

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
