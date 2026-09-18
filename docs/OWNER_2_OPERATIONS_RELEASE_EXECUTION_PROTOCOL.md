# Report-Advisor — Owner 2 / Operations, Runtime, Certification & Release Protocol
## Command: 2

## 0. Role
Owner 2 = المسؤول عن العمليات والتشغيل الفعلي والتكامل والاعتماد والإطلاق.
يمكنه إصلاح code defects التي تمنع runtime/release، لكنه لا يفتح redesign/product waves غير مطلوبة.
المصدر المرجعي: MASTER_PRODUCT_SPEC_AND_EXECUTION_PROTOCOL.md + MASTER_EXECUTION_INDEX.md.

## 1. PRIMARY OBJECTIVE
تحويل المنتج المطوّر إلى release فعلي قابل للتشغيل والاعتماد:
Code → DB → Security → Auth → Tenant → Runtime → Worker → Resilience → Observability → Deployment → Certification → Launch.

## 2. STARTUP ORDER
قبل mutation:
1. git ls-remote للـmain/UI/integration ذات الصلة.
2. حدد INTEGRATION HEAD أو branch العمل.
3. اقرأ implementation والاختبارات المرتبطة.
4. صنّف blockers إلى CODE / TEST / DATA-ENV / EXTERNAL.
5. اكتب START في OWNER_2_COMMUNICATION.md.

## 3. DATABASE / MIGRATION
أغلق:
- migration replay/parity.
- schema/constraints/indexes/RPC signatures.
- grants/EXECUTE/search_path.
- RLS tenant isolation.
- storage policies.
- source lineage drift.
المبدأ: forward-only.
لا rewrite للتاريخ ولا destructive cleanup أثناء certification.

## 4. AUTH / TENANT
اعتمد real authenticated users فقط.
اثبت Actor A وActor B:
login, session persistence, refresh, tenant resolution, logout.
اختبر A→B وB→A على:
UI, query, mutation, RPC, storage, import, report, decision, evidence, work, outcome.
لا service-role browser auth.
## 5. IMPORT / BUSINESS PERSISTENCE
أثبت:
real file → preview → validate → normalize → dedupe → commit → read-back → reconciliation.
commit الحقيقي يجب أن يحدث عبر canonical runtime.
إذا فشل persistence:
أصلح root cause، ثم أعد gate على Exact HEAD.
لا تنقل Evidence من SHA سابق.

## 6. PDF / OCR POSITIVE PATH
أغلق المسار:
extraction → normalization → validation → canonical commit → render.
آخر blocker المعروف تاريخيًا:
pdf-text وpdf-ocr-ar / POSITIVE_POLICY_COMMIT_UNAVAILABLE.
استخدم المسار الموجود ولا تعِد كتابة durable runner إلا إذا ثبت defect حقيقي يتطلب ذلك.

## 7. DURABLE WORKER
اثبت lifecycle حقيقي:
enqueue → claim → lease → heartbeat/checkpoint → expiry/fencing →
retry → DLQ → recovery → completion.
يجب أن تكون الحالة persisted وقابلة للتدقيق.
لا fake job ولا disposable mock يعتبر certification.

## 8. REPORT EXECUTION
اعثر على أول side-effect حقيقي من business action.
المسار المقصود:
business action → enqueueDurableReportExecution → guarded entrypoint → canonical RPC → job.
يجب أن يتضمن authoritative tenant/requester/idempotency/source snapshot/path/hash/formats بحسب العقد.
لا توصيل service-role مباشرة إلى browser export.

## 9. DECISION RUNTIME
اثبت:
Command → Evidence → Recommendation → Decision → Approval → Work → Outcome.
كل مرحلة tenant-authorized وpersisted.
النتيجة يجب أن ترتبط ببصمة decision/recommendation/evidence الحقيقية.

## 10. SECURITY
نفذ/تحقق:
RLS، SECURITY DEFINER hardening، pinned search_path،
restricted EXECUTE، service-role isolation، storage isolation،
secret audit، tenant A/B adversarial tests.
لا تحول security finding إلى PASS بمجرد contract إن كان runtime proof مطلوبًا.
## 11. STORAGE / REALTIME / AI ISOLATION
أثبت signed URL tenant scope.
أثبت realtime authorization.
أثبت AI retrieval isolation.
لا تسجل model output كcanonical business truth إلا إن كان مربوطًا بمصدر/دليل مصرح.

## 12. WATCHED FOLDER / FILE INTELLIGENCE
أثبت:
discover → hash → identify → validate → process → reconcile → finalize.
ثم retry/recovery وعدم duplicate processing.

## 13. BACKUP / RESTORE / ROLLBACK
أثبت real backup.
أثبت isolated restore.
أعد smoke + tenant isolation بعد restore.
قِس RPO/RTO بدل التوثيق النظري.
نفذ rollback/forward-fix drill على release معروف وسجل deployment IDs.

## 14. OBSERVABILITY
تحقق من:
structured logs، health، worker queue، failures،
alerts، recovery visibility، incident trail، SLO/latency where required.

## 15. CI / WORKFLOW INTEGRITY
إذا فشل runner قبل steps:
صنّف EXTERNAL INFRASTRUCTURE BLOCKER.
لا تضعف gate.
لا تعيد workflowات مغلقة دون SHA/env/contract change.
لا تعتبر queued = PASS.

## 16. DEPLOYMENT / PROVIDER ECONOMY
تحقق من:
exact artifact، source SHA، environment config، staging parity، deploy identity.
provider rate limit ليس code PASS ولا code FAIL.
استخدم preview/isolated build عندما يكون ذلك كافيًا.
لا تُنتج deployments مكررة بلا سبب.

## 17. CERTIFICATION BOUNDARY
لا تستخدم تاريخًا قديمًا.
كل candidate له:
exact SHA، exact environment، exact actor/tenant،
fresh evidence، release manifest.
Final Certification لا يمر إلا إذا أغلقت critical rows المطلوبة.
## 18. CERTIFICATION MATRIX
الحد الأدنى:
Code, Build, Auth, Tenant, DB, RLS, Import,
Document/OCR, Intelligence, Evidence, Decision,
Work, Outcome, Report, Worker, Watched Folder,
Performance, Backup, Restore, Rollback,
Observability, CI, Release integrity.

## 19. RELEASE GATE
Release Candidate فقط عندما:
- exact source SHA معروف.
- tests المرتبطة بالـSHA PASS.
- runtime evidence حقيقي.
- blockers external موثقة ولا يوجد blocker داخلي متنكر.
- deployed source parity verified.
- final artifact هو نفس SHA المعتمد.

## 20. LAUNCH
ترتيب الإطلاق:
1. staging final smoke
2. production configuration verification
3. release artifact/deploy
4. deployed SHA verification
5. authenticated business smoke
6. tenant A/B sanity
7. monitoring/health
8. incident rollback readiness
9. release record
10. post-launch stabilization.

## 21. POST-LAUNCH
بعد الإطلاق:
- راقب errors/latency/worker queue/auth/storage.
- لا تعدّل production عشوائيًا.
- أي hotfix يصبح branch + exact SHA + targeted evidence.
- ارجع إلى release candidate السابق عبر rollback إذا كان ذلك هو الإجراء المعتمد.

## 22. HANDOFF FROM OWNER 1
عند استلام development handoff:
اقرأ branch + SHA + changed files + tests.
لا تعتمد على وصف «جاهز».
اختبر فقط ما يتأثر بالـSHA.
إذا احتجت تعديل shared file، اتبع Parallel Execution Coordination Protocol.

## 23. DEFINITION OF DONE — OWNER 2
Operations complete عندما:
- runtime حقيقي مثبت.
- security/tenant isolation مثبت.
- persistence/worker/report/decision runtime مثبت.
- resilience/backups/rollback مثبتة حسب العقد.
- release artifact/deployed SHA متطابق.
- certification evidence مربوط بنفس candidate SHA.
- launch record مكتمل.

## 24. REQUIRED START MARKER
عند استلام الرقم 2، ابدأ ملف التواصل بهذا الشكل:
START | OWNER=2 | BRANCH=<exact> | HEAD=<exact> | OBJECTIVE=<one line>
ثم EXECUTION entries لكل mutation/evidence.
