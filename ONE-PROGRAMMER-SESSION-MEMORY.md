# ONE-PROGRAMMER-SESSION-MEMORY

> Canonical live resume memory for Report-Advisor / الأغبري. Do not create another competing session-memory file.

## SESSION START COMMAND

ابدأ من هذه الذاكرة. اقرأ `docs/MASTER_PRODUCT_REFERENCE.md` ثم `docs/MASTER_EXECUTION_INDEX.md`، ثبّت الـHEAD الحقيقي والفرع والحالة، خذ آخر `CURRENT RESUME POINTER` ونفّذ `NEXT EXECUTABLE ACTION` مباشرة. اعمل على الجبهات المستقلة بالتوازي، ولا تعيد أي عمل مغلق إلا إذا تغير SHA أو البيئة أو العقد.

## SESSION END WRITE-BACK — MANDATORY

قبل إنهاء أي جلسة أو دفعة جوهرية، حدّث **هذا الملف نفسه** بهذه الصيغة:

SESSION-ID →
EXACT HEAD →
BRANCH / PR →
DONE →
ACTUAL RESULT →
PRECISE STOP POINT →
OPEN BLOCKERS →
VERIFIED TESTS / EVIDENCE →
NEXT EXECUTABLE ACTION →
DO NOT REPEAT →
CURRENT RESUME POINTER

لا تعتبر الجلسة مكتملة إذا لم تُحفظ حالة الاستئناف.

## CURRENT PRODUCT AUTHORITY

- Product + UI + technology architecture: `docs/MASTER_PRODUCT_REFERENCE.md`
- Execution + evidence + blocker policy: `docs/MASTER_EXECUTION_INDEX.md`
- Legacy requirement/audit documents: historical/reference only unless explicitly linked by the master.
- No second product master and no second session-memory file.

## CURRENT RESUME POINTER

- SESSION-ID: 2026-09-21-AGHBARI-CONSOLIDATION
- EXACT HEAD: `ab43a5e23eaa0d8838dde608ec57d0ccd49d3d46`
- BRANCH: `main`
- PRODUCT CODE BASELINE: `1568e43889d27b5d850e64c0b99d03a994fd3bbe` (subsequent commits in this sequence are documentation/memory governance only unless proven otherwise)
- LAST DONE: canonical Aghbari product constitution merged; canonical product tree and technology/operating architecture consolidated into the master reference; session start/end continuity contract added to the execution index; this file established as the single live resume memory.
- NEXT EXECUTABLE ACTION: execute the full visual product coverage wave on the current product-code baseline, beginning with the shared Aghbari App Shell / Sidebar / Header / Design System, then all canonical surfaces in the master tree. Reconcile and remove incompatible legacy UI only after dependency inspection. Continue runtime/data/evidence/CI work in parallel wherever independent.
- OPEN BLOCKERS: existing fail-closed runtime/certification blockers remain open until fresh exact-head proof. Do not convert them to PASS.
- DO NOT REPEAT: do not recreate product architecture docs; do not recreate navigation taxonomies; do not restore Bolt/Commerce/CRUD identity; do not create duplicate RPCs/runners; do not transfer PASS/evidence across SHAs; do not use fake data/session/JWT/evidence; do not delete useful capabilities without dependency inspection.
- CURRENT RESUME POINTER: shared visual foundation → global shell/navigation → Decision Center → Data Operations → Business Analytics → Intelligence & Decision → Trust & Evidence → Reports & Outputs → Master Data → Settings → visual regression/performance/accessibility → parallel truth/runtime/evidence closure.
