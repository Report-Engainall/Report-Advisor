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

- SESSION-ID: 2026-09-21-AGHBARI-VISUAL-CLOSURE-02
- LAST VERIFIED EXECUTION HEAD: `2d37e5fb50f0d6fc8d112d0e1d439d835d4374cf`
- BRANCH: `main`
- CURRENT PRODUCT CODE HEAD: `2d37e5fb50f0d6fc8d112d0e1d439d835d4374cf`
- LAST DONE: added the canonical Trust & Evidence hub at `/trust` and the canonical Master Data hub at `/master-data`; exposed both inside the existing 8-zone navigation; mapped their icons; preserved the persistent Aghbari Advisor and existing authoritative routes.
- ACTUAL RESULT: Trust now has a first-class visual control surface tied to `fetchDataQualitySnapshot()` with explicit VERIFIED/REVIEW/BLOCKED/PARTIAL states. Master Data now has a first-class visual entry surface for Customers, Products, Inventory and Alternatives while refusing to fabricate unavailable entities.
- EXACT-HEAD VERIFIED: `npm run typecheck` PASS; `npm run build` PASS; 2808 modules transformed; build completed in 11.20s; built chunks include `TrustEvidencePage` and `MasterDataHubPage`. Local dev server returned HTTP 200 for `/`, `/trust`, `/master-data`, `/intelligence`, `/reports`, `/import`, `/command-center`, `/decision-experience`.
- VISUAL RUNTIME RESULT: local browser automation was not completed in this batch. No fake session, token, or business data was introduced. Vercel exact-head status is currently blocked by the existing free build-rate limit; this is not a source compile failure.
- PRECISE STOP POINT: all eight top-level zones now have a visible canonical entry surface; remaining visual depth is sub-surface refinement and a real authenticated visual sweep across the complete route matrix.
- OPEN BLOCKERS: authenticated post-login visual sweep remains unproven; Vercel build-rate limit remains open; runtime/business E2E, resilience, backup/RPO/RTO and final certification remain independently open.
- NEXT EXECUTABLE ACTION: continue the visual sweep route-by-route on exact main, prioritize the weakest canonical screens and responsive/mobile states, fix real visual/runtime defects only, then run exact-head verification again.
- DO NOT REPEAT: do not recreate the 8-zone navigation; do not recreate the global Advisor; do not restore Bolt/Commerce/CRUD identity; do not transfer PASS between SHAs; do not fabricate sessions/data/evidence; do not create duplicate RPCs/runners.
- CURRENT RESUME POINTER: exact main head → authenticated-capable visual sweep → weakest canonical surfaces → responsive/accessibility polish → exact-head verification → parallel runtime/evidence/CI closure.
