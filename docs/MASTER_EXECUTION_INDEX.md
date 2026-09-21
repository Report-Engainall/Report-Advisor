## CURRENT EXECUTION BOUNDARY — 2026-09-21

> تحديث تنفيذي بعد أمر المالك «انطلق». هذا القسم يصف الحالة المثبتة من الأدوات فقط. لا يتم نقل Evidence بين SHAs، ولا تُعد الحالة PASS إلا بدليل Exact-HEAD.

### CURRENT EXACT HEAD / DEPLOYED STATE
- **Observed current code HEAD before this documentation wave:** `1568e43889d27b5d850e64c0b99d03a994fd3bbe` on `main`. This documentation wave does not claim product-code changes and must not transfer code/runtime evidence to the documentation commits.
- **Current documentation branch:** `docs/aghbari-product-constitution-20260921`.
- **Current code/test candidate:** `fe5661060462ffa21d6aa31505f80c2021c4170a`.
- **Reference product/runtime code HEAD:** `c11c084d161cceb4595f8552b6c49c3f610f0ec2`; current `main` also carries the forward-only security/source-parity migrations merged afterward.
- **Current main observed from GitHub:** `1568e43889d27b5d850e64c0b99d03a994fd3bbe`. Treat this as the current code baseline for subsequent exact-SHA reconciliation.
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
- **Product direction:** the canonical Aghbari product constitution above is now the binding UI/product architecture.
- **Code baseline:** current \`main\` is \`1568e43889d27b5d850e64c0b99d03a994fd3bbe\` at the start of this documentation wave.
- **Runtime/certification:** existing fail-closed blockers and exact-SHA evidence rules remain active; no historical PASS is reclassified by this documentation change.
- **Immediate execution priority:** complete the visual product surface first, in the canonical order, while continuing independent runtime/data/evidence closure in parallel.

### SINGLE-PROGRAMMER EXECUTION MODE — NO OWNER SPLIT

There is one execution owner. Do not resurrect the previous UI/runtime owner split.

**MANDATORY PROGRAMMER COMMAND — APPLY NOW**

> نفّذ المنتج وفق \`docs/MASTER_PRODUCT_REFERENCE.md\` والـ**AUTHORITATIVE PRODUCT CONSTITUTION — AGHBARI 2026-09-21** باعتبارها المرجع الوحيد للهوية والواجهات والهيكلية. ابدأ بالواجهات كاملة أولًا: وحّد الـShell والـSidebar والـHeader والـDesign System، ثم غطِّ جميع الأسطح القانونية لمركز القرار والبيانات والتشغيل والتحليل التجاري والذكاء والقرار والثقة والأدلة والتقارير والمخرجات والبيانات المرجعية والإعدادات، مع المستشار الأغبري الثابت. أزل/استبدل أي واجهة أو قسم متعارض مع هذه البنية بعد فحص الاعتماديات، ولا تعُد إلى Bolt/Commerce/CRUD taxonomy أو duplicate navigation. استخدم البيانات والمسارات الحقيقية فقط، وأظهر حالات loading/empty/review/blocked/insufficient-data بدل التزييف. حافظ على المسارات/RPCs/runners الحالية والـtenant/RLS والحسابات الحتمية وfail-closed. نفّذ تغطية بصرية كاملة ثم واصل الـpolish والـruntime والـevidence والـCI حتى أقصى إغلاق حقيقي ممكن، وسجّل exact SHA والحالة التالية في هذا الفهرس بعد كل دفعة جوهرية.

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
