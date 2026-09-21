## CURRENT EXECUTION BOUNDARY — 2026-09-21

> تحديث تنفيذي بعد أمر المالك «انطلق». هذا القسم يصف الحالة المثبتة من الأدوات فقط. لا يتم نقل Evidence بين SHAs، ولا تُعد الحالة PASS إلا بدليل Exact-HEAD.

- **CURRENT CODE/TEST CANDIDATE:** `e6c39323eb0c0177b1de73c3b276ce9491fd07f0`
- **CURRENT_REPOSITORY_HEAD:** `943f0619abfddb56daddc83bc500659376655474`

### CURRENT EXACT HEAD / DEPLOYED STATE
- **Current product/code HEAD:** `e6c39323eb0c0177b1de73c3b276ce9491fd07f0`.
- **Previous product/runtime baseline:** `1568e43889d27b5d850e64c0b99d03a994fd3bbe`.
- **Historical product/test candidate:** `fe5661060462ffa21d6aa31505f80c2021c4170a` — historical only; do not treat as current HEAD evidence.
- **Reference product/runtime code HEAD:** `c11c084d161cceb4595f8552b6c49c3f610f0ec2`; current `main` also carries the forward-only security/source-parity migrations merged afterward.
- **Last exact-head verified product result:** no current-head runtime/build PASS; the latest code-only verification on `23449d317277df32d560bc3fbb1b60f0e2a48eb9` closed a real AnalyticsPage import defect and re-read the exact file. Vercel remains blocked by free-plan `build-rate-limit`.
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

### LATEST EXECUTION UPDATE — 2026-09-18
- Staging forward-only parity checkpoint applied successfully: `harden_import_field_lineage_rls`, `revoke_authenticated_worker_enqueue`, `reconcile_live_source_end_state`.
- Verified import row integrity: null company=0, orphan job=0, cross-tenant row/job mismatch=0.
- Verified all 8 durable report-execution RPCs: authenticated EXECUTE=false, service_role EXECUTE=true; all have `search_path=public, pg_catalog`.
- Verified `import_field_lineage` authenticated policy is explicit restrictive deny; Security Advisor targeted findings remain clear.
- PR #590 source migrations are merged into `main` at `64c870426b75de7726e0f60321d580074bb76fa9`; staging verification is clean for import-row integrity and worker RPC authority.
- Product development PR #587 type error is repaired at `dfdc662...`; a fresh shared-harness login regression was then fixed at `182f0983...` and `3c4bb990...`. Fresh workflows on `3c4bb990...` remain authoritative and pending.

### SESSION START / SESSION END MEMORY CONTRACT — MANDATORY

**Canonical live memory:** `/Report-Advisor/ONE-PROGRAMMER-SESSION-MEMORY.md`.

At the start of every session, the programmer MUST:
1. Read the canonical session memory.
2. Read `docs/MASTER_PRODUCT_REFERENCE.md` and `docs/MASTER_EXECUTION_INDEX.md`.
3. Verify exact Git HEAD/branch/status plus relevant PR/CI/runtime/deployment evidence.
4. Resume from **CURRENT RESUME POINTER / NEXT EXECUTABLE ACTION**; never restart discovery from zero.
5. Execute all safe independent fronts in parallel and serialize only conflicting writes.

At the end of every meaningful batch, and before ending the session, the programmer MUST update the same memory file with:
`SESSION-ID → EXACT HEAD → DONE → ACTUAL RESULT → PRECISE STOP POINT → OPEN BLOCKERS → VERIFIED TESTS/EVIDENCE → NEXT EXECUTABLE ACTION → DO NOT REPEAT → CURRENT RESUME POINTER`.

A session is never considered complete merely because the chat ended. Repository memory is the continuity mechanism.

The startup command is intentionally short:

> **ابدأ من الذاكرة الحية. اقرأ المرجع الأساسي، ثبّت الـHEAD الحقيقي، خذ آخر RESUME POINTER، نفّذ NEXT ACTION مباشرة، واعمل بالتوازي دون إعادة الشغل المغلق. وفي نهاية كل دفعة احفظ النتيجة والـSHA ونقطة التوقف والخطوة التالية في نفس الذاكرة قبل مواصلة التنفيذ.**

### PRODUCT CONSTITUTION — MANDATORY OPERATING CONTRACT

**Primary product authority:** \`docs/MASTER_PRODUCT_REFERENCE.md\` → **AUTHORITATIVE PRODUCT CONSTITUTION — AGHBARI 2026-09-21**.

This constitution is mandatory for every product/UI change. The programmer must not restore, extend or invent a conflicting navigation taxonomy, Bolt/Commerce/CRUD presentation, standalone chatbot identity, duplicate design system, duplicate Intelligence/Evidence tree, or one-page-per-KPI sidebar.

**Fixed top-level product zones:**
1. مركز القرار
2. البيانات والتشغيل
3. التحليل التجاري
4. الذكاء والقرار
5. الثقة والأدلة
6. التقارير والمخرجات
7. البيانات المرجعية
8. الإعدادات

**Permanent intelligence layer:** المستشار الأغبري is a context-aware fixed drawer available across the product; it is not a ninth sidebar category.

**Visual-first rule:** the first major implementation objective is complete visual coverage of the canonical product surfaces using one Aghbari RTL design system and the real application paths. The goal is a coherent commercial product, not a growing collection of routes.

**Cleanup rule:** every conflicting legacy surface must be classified KEEP / IMPROVE / REPLACE / REMOVE after dependency inspection. Do not preserve conflicting UI simply because it already exists; do not delete valid capability merely because its presentation is obsolete.

### EXECUTION STATE
- **Product direction:** the canonical Aghbari product constitution remains the binding UI/product architecture.
- **Current product code:** `main` at `7ed583d40ac4090620270c17b48b38f75949cacd`.
- **Visual implementation state:** comprehensive Aghbari UI wave integrated; global Advisor fixed and mobile-ready; canonical 8-zone navigation in place; Proposal Demo no longer a primary navigation surface; Trust/Outputs metadata unified; stale UI contracts converted to structural checks.
- **Exact-head verified gates:** typecheck PASS; Product WOW UI PASS; UI route/sidebar parity PASS; Executive Dashboard UI PASS; Intelligence Product Contract PASS; Connections/Language UI PASS (7 checks).
- **Runtime visual proof:** public/login surface PROVEN on exact product HEAD via Vercel deployment `dpl_7SbnFXRtMJhto7aJKsqfBq2ggHqK` (READY, HTTP 200); Chrome verified RTL desktop/mobile and no console errors or horizontal overflow. Authenticated post-login visual coverage remains NOT PROVEN because auth was not bypassed or fabricated.
- **Immediate execution priority:** authenticated visual sweep of all canonical surfaces using a real permitted session/runtime, followed by real defect fixes, responsive/accessibility/performance polish, and independent runtime/truth/evidence/CI closure.

### SINGLE-PROGRAMMER EXECUTION MODE — NO OWNER SPLIT

There is one execution owner. Do not resurrect the previous UI/runtime owner split.

**MANDATORY PROGRAMMER COMMAND — APPLY NOW**

> نفّذ المنتج وفق \`docs/MASTER_PRODUCT_REFERENCE.md\` والـ**AUTHORITATIVE PRODUCT CONSTITUTION — AGHBARI 2026-09-21** باعتبارها المرجع الوحيد للهوية والواجهات والهيكلية. ابدأ بالواجهات كاملة أولًا: وحّد الـShell والـSidebar والـHeader والـDesign System، ثم غطِّ جميع الأسطح القانونية لمركز القرار والبيانات والتشغيل والتحليل التجاري والذكاء والقرار والثقة والأدلة والتقارير والمخرجات والبيانات المرجعية والإعدادات، مع المستشار الأغبري الثابت. أزل/استبدل أي واجهة أو قسم متعارض مع هذه البنية بعد فحص الاعتماديات، ولا تعُد إلى Bolt/Commerce/CRUD taxonomy أو duplicate navigation. استخدم البيانات والمسارات الحقيقية فقط، وأظهر حالات loading/empty/review/blocked/insufficient-data بدل التزييف. حافظ على المسارات/RPCs/runners الحالية والـtenant/RLS والحسابات الحتمية وfail-closed. نفّذ تغطية بصرية كاملة ثم واصل الـpolish والـruntime والـevidence والـCI حتى أقصى إغلاق حقيقي ممكن، وسجّل exact SHA والحالة التالية في هذا الفهرس بعد كل دفعة جوهرية.


### MANDATORY UI PRODUCT-DESIGN INITIATIVE — EVERY EXECUTION WAVE

هذه قاعدة تنفيذ إلزامية، وليست اقتراحًا اختياريًا: عند العمل على أي واجهة أو تدفق، لا يقتصر دور المبرمج على تنفيذ النص الحرفي للمواصفة؛ بل يعمل أيضًا بعقلية **Product Designer + UI/UX Engineer**، ويراجع كل شاشة وكل تدفق لاكتشاف فرص حقيقية لرفع قيمة المنتج.

بعد إنجاز أي جزء تقني مرتبط بواجهة، يجب تنفيذ مراجعة **«ما الذي يمكن تحسينه هنا؟»** ثم اتخاذ الإجراء المناسب مباشرة، دون انتظار تعليمات تفصيلية لكل زر أو بطاقة أو تفاعل. يجوز للمبرمج، ضمن هوية الأغبري وبنية المنتج القائمة، أن يقترح وينفذ تحسينات مثل: زر أو Action يختصر خطوة، بطاقة أو مؤشر، عرض بيانات أفضل، Drawer/Panel/Modal، تبويب أو فلتر أو بحث ذكي، تنبيه أو حالة بصرية، Tooltip أو شرح سياقي، مقارنة أو Visualization أو Timeline أو Evidence View، حالات Empty/Loading/Success/Warning/Blocked/Review/Insufficient Data، Micro-interaction أو Shortcut، أو إعادة ترتيب وتبسيط وتحسين التسلسل البصري وطريقة تقديم النتيجة أو التوصية أو القرار.

**القاعدة الحاكمة:** لا تُضاف عناصر لمجرد زيادة المحتوى. كل مبادرة جديدة يجب أن تضيف قيمة يمكن الدفاع عنها عبر واحد أو أكثر من: **فهم أسرع، قرار أسرع، عمل أسرع، وضوح أفضل للحقيقة/الدليل، اكتشاف فرصة، كشف مشكلة، تقليل خطوات، رفع الثقة، أو رفع القيمة المدركة للمنتج.** وما لا يحقق قيمة واضحة يُترك.

المبادرة لا تمنح صلاحية اختراع وظائف تجارية أو backend paths من خارج العقد القائم. أي تحسين يجب أن يحافظ على الهوية البصرية للأغبري، الـIA المعتمدة، المسارات authoritative، الحقيقة والـevidence، deterministic calculations، tenant/RLS، fail-closed، والأداء والاستجابة وإتاحة الاستخدام. **المطلوب ليس تنفيذ واجهة مكتوبة فقط؛ المطلوب اكتشاف وإغلاق الفجوات التي تمنع الواجهة من أن تكون أوضح وأكثر قيمة واحترافًا.**

### MANDATORY BUSINESS-FIRST PROGRESSIVE DISCLOSURE

عند إكمال الواجهات أو إضافة سطح جديد، **لا تُحوّل كل capability إلى عنصر Sidebar ظاهر مباشرة**. حافظ على الأقسام الثمانية الحالية، وأظهر الوظائف الأساسية في المستوى الأول، ثم ضع التفاصيل والتحليلات المتقدمة داخل الـHub أو خلف فتح القسم، مع السماح بإظهارها في وضع Advanced/Expert فقط عند الحاجة.

كل دفعة UI يجب أن تحقق ثلاثة أمور معًا:
1. تغطية القدرة الحقيقية الموجودة في المنتج.
2. اكتشافها والوصول إليها بوضوح.
3. عدم تشتيت المستخدم الأساسي أو إعادة المنتج إلى taxonomy ضخمة.

**Progressive Disclosure إلزامي:** كلما كانت القدرة أقل تكرارًا أو أكثر تخصصًا، يُفضّل أن تظهر داخل المساحة الأم، عبر تبويب/Drawer/قسم متقدم، أو ضمن Advanced/Expert navigation بدل إضافتها إلى المستوى الأول.

### NON-NEGOTIABLE EXECUTION RULES
- لا تُنقل نتيجة أو Evidence أو PASS بين SHAs.
- لا تغيّر المسارات authoritative لمجرد تجميل الواجهة.
- لا Runner جديد، لا RPC جديد، لا fake KPI/data/session/JWT/evidence، ولا bypass.
- اعمل على الجبهات المستقلة بالتوازي؛ blocker واحد لا يوقف العمل المستقل.
- بعد كل دفعة جوهرية: exact SHA → verification → memory update.
- الأولوية للمساحة: lazy routes/chunks، إزالة التكرار، تقليل assets/dependencies، consolidation قبل الإضافة.
- لا تعاود اختبار ما أُغلق إلا عند تغير SHA أو البيئة أو العقد.
- لا تعتبر المنتج مكتملًا بمرور build فقط؛ المطلوب UX + truth + persistence + runtime + evidence + CI + deployment.

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


## LATEST EXACT-HEAD OVERRIDE — 2026-09-21 / VISUAL POLISH WAVE
- **Authoritative current product/code HEAD:** `5b93dce673ebfc84710d2c07d37a4640ec2bada4` on `main`; this supersedes stale earlier CURRENT HEAD values in this historical execution section.
- **Done:** premium shell polish across the global app frame, sidebar identity, top bar/search, fixed Aghbari Advisor drawer, Advisor launcher, and mobile action bar. No business calculation, RPC, runner, tenant/RLS, import lifecycle or fail-closed rule was changed.
- **Exact-head verification:** `npm run typecheck` PASS; `npm run build` PASS (2808 modules transformed); `npm run test:product-wow-ui` PASS; `npm run test:ui-route-sidebar-parity` PASS (37 routes / 35 canonical navigation links); `npm run test:executive-dashboard-ui` PASS; `npm run test:intelligence-product-contract` PASS; `npm run test:connections-language-ui` PASS (7 checks); `git diff --check` PASS; lint 0 errors / 63 warnings.
- **Deployment boundary:** Netlify latest proven deploy remains `6ab09c139d58a600089e430f` serving product commit `64ce8344acc8a8e2ae3f46890efd8af69b008dd9`. The new `5b93dce6...` code is pushed to GitHub `main` but has not yet received fresh Netlify runtime proof; do not transfer the older live proof to this SHA.
- **Open blocker:** authenticated visual sweep still requires a real configured Supabase runtime/session; no fake session/JWT/bypass is permitted.
- **Next executable action:** continue visual polish on any remaining weak canonical surface only after inspecting its existing route and dependencies; then obtain fresh deployment/runtime proof on exact `5b93dce6...` and proceed with independent runtime/evidence/CI closure.
- **Do not repeat:** do not recreate the canonical shell/navigation/advisor; do not fabricate post-login screenshots; do not claim current-head live PASS from the older `64ce8344...` deploy.


## LATEST EXACT-HEAD OVERRIDE — 2026-09-21 / NAVIGATION READABILITY + TRUST SURFACES
- **Current exact product/code HEAD:** `e831771435e84a66356a718fb6d63abc1fe7c18d` on `main`.
- **UI work completed:** sidebar branch connectors clarified with explicit high-contrast vertical/horizontal tree lines, clearer child-row contrast and active-state joining; Data Quality, Master Data and Metric Governance surfaces elevated into the shared Aghbari visual system.
- **No architecture change:** no new route, RPC, runner, calculation, tenant/RLS path, import state, or fail-closed behavior was introduced.
- **Exact-head gates:** typecheck PASS; build PASS (2808 modules); Product WOW UI PASS; route/sidebar parity PASS (37/35); Executive Dashboard UI PASS; Intelligence Product Contract PASS; Connections/Language UI PASS (7); diff-check PASS; lint 0 errors / 63 warnings.
- **Deployment boundary:** latest proven Netlify deploy remains `6ab09c139d58a600089e430f` at product commit `64ce8344...`; no live PASS transferred to `e8317714...`.
- **Next:** continue remaining weak canonical surfaces with responsive state polishing, then obtain exact-head deployment/runtime proof and resume runtime/evidence/CI closure.


## LATEST EXACT-HEAD OVERRIDE — 2026-09-21 / VALUE-FIRST CORE SURFACES
- **Current exact product/code HEAD:** `7d7fd0ee560e3e95c9d8c5937bf1f4b2aaafcce5` on `main`.
- **Visual coverage added:** Reports Center, Decision Experience, Trust & Evidence, Connections, Customers/Products/Inventory, and Import received a unified value-first treatment. ImportPage visible Arabic copy was corrected from mojibake to clear product language while retaining the canonical import path.
- **Design intent:** each core surface now makes the user-facing value, evidence state, next action, and operational context more legible without adding unsupported capabilities.
- **No architecture change:** no new route, RPC, runner, tenant/RLS path, calculation logic, or import contract introduced.
- **Exact-head gates:** typecheck PASS; build PASS (2808 modules); Product WOW UI PASS; route/sidebar parity PASS (37/35); Executive Dashboard UI PASS; Intelligence Product Contract PASS; Connections/Language UI PASS (7); diff-check PASS; lint 0 errors / 63 warnings.
- **Deployment boundary:** the latest proven Netlify deploy is still the older `64ce8344...`; no live proof is transferred to `7d7fd0ee...`.
- **Next:** continue high-value polish over remaining analytics/intelligence/output surfaces, then refresh exact-head deployment/runtime proof.


## LATEST EXACT-HEAD OVERRIDE — 2026-09-21 / SOURCE-FIRST + INTELLIGENCE POLISH
- **Current exact product/code HEAD before documentation write-back:** `a5da0df9f675010cd8f324786ea495ddeae32c07`.
- **Product correction:** unified ingestion remains source-first and general-purpose. No fixed business entity is exposed as the import engine, target picker, or product identity. Internal legacy compatibility remains internal only.
- **Intelligence polish:** `src/pages/IntelligencePages.tsx` was rebuilt at the UI-contract level: corrupted Arabic text was corrected, recommendation filtering/status/action states were clarified, evidence/decision transitions were made more explicit, and forecast surfaces now expose source count, company series coverage, quality metadata and forecast-as-estimate framing.
- **Work Center correction:** `src/pages/WorkCenterPage.tsx` no longer displays `entity_type` to the user. It now presents source file, source format, operational status, progress, accepted data and exceptions without leaking internal importer taxonomy.
- **Architecture impact:** no new route, RPC, runner, job family, calculation path, tenant/RLS path or import lifecycle was introduced.
- **Exact diff evidence:** relative to the previous code HEAD `895690b44c...`, two independent UI commits changed only `src/pages/IntelligencePages.tsx` and `src/pages/WorkCenterPage.tsx`.
- **Deployment boundary:** current exact-head GitHub Vercel status reports **failure** on the free-plan `build-rate-limit` context, while the deployment context for `a5da0df9...` is pending. No READY/PASS is transferred from any older SHA.
- **Verification boundary:** GitHub status has no completed runtime checks for this SHA yet; authenticated browser proof remains unavailable because PC01 is offline and no fake session is permitted.
- **Next executable action:** continue independent high-value UI/runtime-safe work only where it improves canonical surfaces without changing product taxonomy; separately obtain exact-head deployment/runtime proof when the hosting capacity path permits.
- **Do not repeat:** do not recreate shell/navigation/advisor; do not expose internal importer entity names through any surface; do not invent specialized import routes/RPCs; do not transfer deployment or browser PASS across SHAs.


## LATEST EXACT-HEAD OVERRIDE — 2026-09-21 / TRUST & EVIDENCE ACTIONABILITY
- **Latest exact product/code head:** `778a601189077e0bda5b844e6d6a06e35ab7e1e3`.
- **UI work completed:** `src/pages/TrustEvidencePage.tsx` was materially upgraded: evidence surfaces are now presented once in a compact two-column governance panel; unsupported surfaces remain explicitly unverified; a context-aware `NEXT TRUST ACTION` routes to data-quality review when issues exist or source-evidence inspection otherwise; refresh is explicit.
- **Truth boundary:** next-step selection uses only the existing data-quality snapshot/issues. No synthetic evidence, confidence score, business metric or new backend state was added.
- **Architecture impact:** no new route, RPC, runner, job family, calculation path, tenant/RLS path or import lifecycle change.
- **Verification:** exact GitHub file re-read after repair; JSX closure was corrected before this state was accepted. Current GitHub Vercel status for the exact head remains **failure** at `build-rate-limit`.
- **Deployment/runtime boundary:** no READY/PASS is claimed for this SHA; authenticated browser evidence remains unavailable while PC01 is offline.
- **Next executable action:** continue with the next weak canonical surface and responsive/accessibility/value polish, while pursuing exact-head deployment/runtime proof when free hosting capacity permits.
- **Do not repeat:** do not recreate prior shell, navigation, import, intelligence or trust panels; do not expose internal importer taxonomy; do not transfer old deployment/runtime evidence.


## LATEST EXECUTION OVERRIDE — 2026-09-21 / CONTINUOUS DEVELOPMENT WAVE 26
- **Authoritative exact repository HEAD:** `3de200146403ff4e1dae105837dd37af3eff3f50` on `main`.
- **Current UI work completed:** `CanonicalScenarioPage.tsx`, `ScenarioTruthGuardPage.tsx`, and `DataQualitySnapshotPage.tsx` were materially improved for product value, responsive structure, state clarity, actionability and truth-boundary communication.
- **Architecture boundary:** no route/RPC/runner/import lifecycle/tenant-RLS/calculation engine changes.
- **Exact file verification:** all three current UI files were re-read from GitHub after their commits on the current `main` head.
- **Current verification boundary:** no typecheck/build/browser PASS is claimed for `3de20014...`. PC01 is offline and the connected container cannot resolve GitHub, preventing a local checkout/build. GitHub combined status currently reports only the known Vercel free-plan `build-rate-limit` failure.
- **Next executable action:** continue the next weak canonical surface with real UI/product-value improvement; then pursue exact-head compile/deployment/runtime proof.
- **DO NOT REPEAT:** do not recreate the newly polished scenario, truth-gate or data-quality surfaces; do not invent backend paths; do not transfer evidence across SHAs.


## LATEST EXECUTION OVERRIDE — 2026-09-21 / CORE IMPORT PROVENANCE HARDENING
- **Exact current main HEAD:** `aaf3b07e2399718c8efe379c328d96ed149ea2a4`.
- **Core correction:** canonical import server execution now derives rows from authoritative source bytes, re-runs reconciliation server-side, and enforces server-authoritative quality thresholds plus explicit review approval.
- **State-order correction:** source/file readiness is not committed before authoritative extraction for execute mode.
- **UI correction:** import result/snapshot uses server-authoritative count/quality/preview/columns returned from the exact source.
- **Contract guard:** `scripts/check-import-transaction-contract.mjs` now asserts these authoritative-server invariants.
- **Live Supabase proof:** current staging is healthy; canonical generic substrate is installed, tenant/RLS boundaries are present, and the authoritative import RPC verifies tenant/source provenance in its live function body.
- **Open runtime blockers:** exact-head build/runtime/deployment, authenticated E2E, worker resilience, backup/RPO-RTO, OCR/scanned-PDF server authority, watched-folder runtime, final certification.


## LATEST EXECUTION OVERRIDE — 2026-09-21 / CORE RESILIENCE + UI WAVE 28
- Exact current `main` HEAD: `403d6af5211482fd9086668136b2902707970e41`.
- Canonical import provenance and quality are now server-authoritative; browser rows are not commit truth.
- Expired durable worker leases were actually recovered in staging using the existing canonical recovery RPC: 5 expired processing jobs → queued, leaving expired active leases at 0.
- Added forward-only worker-recovery parity migration `20260921170000_reconcile_expired_worker_recovery_retryable.sql`.
- Scanned-PDF server authority is explicitly fail-closed until a server OCR runtime exists; no browser-only OCR can create authoritative committed data.
- Decision Experience and Work Center gained real operational context without new backend business paths.
- Current exact-head GitHub status still has the Vercel free-plan `build-rate-limit` failure. No build/browser/runtime PASS is transferred.
- Next executable action: Phase-F/backup/OCR runtime closure, then exact-head compile/deploy/browser proof and final certification.


## CONTINUATION UPDATE — 2026-09-21 / ANALYTICS CURRENT-HEAD REPAIR
- Exact code HEAD: `23449d317277df32d560bc3fbb1b60f0e2a48eb9`.
- Fixed `src/pages/AnalyticsPage.tsx` missing `ChartNoAxesCombined` import and removed unused `BarChart3` import.
- Exact file re-read successfully after the write.
- Supabase staging recheck: expired active leases=0; backup verification runs=0; queued=563; dead_letter=7.
- No runtime/build PASS is claimed because exact-head Vercel remains externally blocked by `build-rate-limit`.
- Next executable action: independent weak canonical surface or cloud-safe closure, then exact-head runtime proof when an executable environment is available.


## CONTINUATION UPDATE — 2026-09-21 / UI TRUTH + INTERACTION HARDENING WAVE 30
- Exact product code HEAD: `369fa466dee576c64ff82c7f61fddaf3ca389daa`.
- Analytics current-head import defect closed in the preceding wave; exact file was re-read.
- Connections surface now distinguishes proven, bounded, and adapter-only connection states. Watched-folder automation and scanned-PDF OCR are no longer implied to be runtime-proven.
- Intelligence recommendation actions now have an in-flight interaction guard and explicit error handling while retaining the existing mutation boundary.
- No new backend route/RPC/runner/import taxonomy/tenant path was introduced.
- Exact-head runtime/build evidence remains open because Vercel reports the free-plan `build-rate-limit`; PC01 remains offline.
- Next executable action: another independent weak canonical surface or cloud-safe closure, then exact-head runtime proof.


## CONTINUATION UPDATE — 2026-09-21 / EXECUTIVE REPORT ACCOUNTABILITY WAVE 31
- Exact product code HEAD: `cd8f32ad1fc7d3ebc96d215596e010a14efe2892`.
- Executive Report now derives decision accountability and outcome state from existing recommendation fields: status, owner and impact_result.
- Recommendation list now exposes status/owner/expected impact/actual impact result.
- No new route, RPC, runner, data model, tenant/RLS path or calculation engine.
- Vercel exact-head runtime remains blocked by free-plan `build-rate-limit`; no current-head PASS transferred.
- Next executable action: continue the next weak canonical surface or independent cloud-safe closure, then runtime proof.


## CONTINUATION UPDATE — 2026-09-21 / IMPORT AUTHORITY + CI REPAIR WAVE
- Product code HEAD entering this documentation-only continuation: `cccf7fa61c9689aab08e425f885c9d2a8583e71d`.
- Unified `/import` now exposes only the canonical source-first importer; the legacy `FolderBatchImportPanel` and fixed user-facing `products/customers/sales_invoices` selector were removed from that entry surface.
- `scripts/check-import-center-product-contract.mjs` now fails when the forbidden specialization/legacy folder importer re-enters the unified entry.
- Canonical source-analysis Snapshot persistence moved from the browser import page to the authoritative server boundary after durable canonical execution; the import UI no longer performs direct Supabase table writes.
- The import transaction contract now checks that authoritative parsing/reconciliation precede the `file_records.status='ready'` write.
- Current code also repairs a real Decision Experience syntax error and the Liquidity loading-state lint error found by GitHub Actions.
- Exact-head runtime/build proof is still to be consumed from the new CI run; no stale PASS is transferred.


## CONTINUATION UPDATE — 2026-09-21 / CURRENT-HEAD JSX REPAIR
- Exact product code HEAD: `ad20f67fcb19b7668a168ed974b5b33d8de105de`.
- Decision Experience JSX was simplified to a direct readiness block after CI exposed an invalid nested JSX expression.
- No business behavior, backend path, decision mutation, tenant/RLS or deterministic calculation changed.
- Previous import-authority, unified-entry, server Snapshot and import-order repairs remain part of the same current code candidate.


## CONTINUATION UPDATE — 2026-09-21 / DECISION JSX FINAL REPAIR
- Exact product code HEAD: `13b690c06b185ad2aba7a764bb5a8f158ab8f7eb`.
- Replaced the invalid nested JSX/IIFE Decision Readiness block with direct JSX.
- Exact diff confirms the previous malformed expression and section closure were removed.
- No decision data contract or mutation path changed.


## CONTINUATION UPDATE — 2026-09-21 / ROUTE + JSX CLOSURE
- Exact product code HEAD: `522099ffa8b7b0c4f12e60813d4a99bb62fb1f9c`.
- Decision Experience conditional is now structurally closed with the required `) }` boundary.
- UI route completeness explicitly permits only `/proposal-demo` as an internal progressive-disclosure route; it remains outside the primary sidebar taxonomy.
- The unified import entry remains canonical-only.


## CONTINUATION UPDATE — 2026-09-21 / DECISION CONDITIONAL FINAL CLOSURE
- Exact product code HEAD: `48ae39978afc495290a1b634bf052f4f10eeef24`.
- Decision Experience `command` stage now has one enclosing conditional around the full command surface; the readiness strip and alert/recommendation grid are not split by premature JSX closure.
- No decision data or backend contract changed.


## CONTINUATION UPDATE — 2026-09-21 / COMMAND STAGE FRAGMENT CLOSURE
- Exact product code HEAD: `175fb6d0a417c12ed9809a6a0489d844fa096065`.
- Decision Experience `command` stage now wraps its readiness and command-surface sections in a single JSX Fragment, eliminating the sibling-element parse failure found by Exact-HEAD build.


## CONTINUATION UPDATE — 2026-09-21 / TYPECHECK + PERFORMANCE REPAIR
- Exact product code HEAD: `8a9d6dc1df8afc9a421b0db205225953f43ad957`.
- Closed TypeScript failures in canonical commit provenance typing, Canonical Import callback dependency ordering, and Suppliers typed table columns.
- Dashboard charts are now dynamically imported behind Suspense so the chart vendor is no longer part of the initial critical asset set.
- Performance budget is kept unchanged; the code is being optimized to satisfy it rather than weakening the gate.


## CONTINUATION UPDATE — 2026-09-21 / LEGACY FOLDER IMPORTER REMOVAL
- Exact product code HEAD: `167fcaf05400af135d76e1409a8dc8d26cf2f65f`.
- Removed the legacy specialized folder importer package: `FolderBatchImportPanel`, `batch-folder.ts`, its lifecycle/validation tests, and its obsolete contract script.
- `/import` remains the sole source-first canonical import entry.
- The Import Center product contract now fails when any legacy specialized folder-importer file exists or when fixed entity targets re-enter the unified entry.
- GitHub Code Search found no remaining references to the removed importer component, test, or contract script.


## CONTINUATION UPDATE — 2026-09-21 / CANONICAL PROVENANCE LINT REPAIR
- Exact product code HEAD: `e6c39323eb0c0177b1de73c3b276ce9491fd07f0`.
- Canonical commit mapping now accepts the full reconciled row, including provenance, and uses a type alias rather than an empty interface.
- This closes the sole exact-head lint error; previous 63 warnings remain non-fatal under the current ESLint gate.
