# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-06

> Authoritative execution manifest. Because embedding this file's own commit SHA would make the SHA self-invalidating, the exact current candidate is always the Git `HEAD` of `main` at the same checkout. Pair this manifest with `git rev-parse HEAD` for every evidence batch.

### CURRENT EXACT HEAD
- Latest functional E2E integration commits: `9956014faadff896b20993105b0e8623efee8280` (real business E2E runner) and `a1fc78d0d70343f5727914400fe407e8b1414b3f` (browser workflow integration).
- This synchronization is documentation-only and will create the next exact HEAD; no runtime evidence is promoted across the documentation boundary.

### BOUNDARY / GOVERNANCE
- Branch: `main`.
- Historical evidence is valid only for its recorded SHA.
- No deployment, test, DB result, or prior RC is reused across a changed exact head.
- Browser E2E uses real Chromium, real Supabase authentication when credentials exist, and browser-held access tokens; service-role and mocked sessions are prohibited.
- The browser workflow uses scoped path triggers and `workflow_dispatch`; broad push triggers are prohibited by the CI topology contract.
- No rebuild from scratch; no reopening closed work without new evidence.
- Work continues in parallel on independent fronts; external owner/device blockers do not justify idle time on analysis, source reconciliation, test design, or evidence preparation.
- Certification remains fail-closed: no HTTP 200, UI success message, fixture PASS, simulated DB JWT, historical deployment, or old SHA may certify the current candidate.

### P0 — AUTHENTICATED E2E
- Real authenticated runtime baseline is proven locally for Actor A/B tenant resolution and DB isolation; this remains a baseline, not full browser certification.
- Existing route/forensic browser harness remains the broad discovery layer.
- Added `scripts/real-business-e2e.mjs` to exercise the real supported mutation path: Login → authenticated tenant resolution → customer import → canonical DB read-back → customer UI read-back → product import → canonical DB/UI read-back → sales-invoice import → canonical DB/report read-back → refresh/tenant continuity → isolated Tenant B login → cross-tenant REST read denial → cross-tenant REST mutation denial → cross-tenant UI denial → logout.
- Integrated that runner into `.github/workflows/full-product-browser-e2e.yml` after the existing browser route harness, with exact checkout, real runtime secrets, Chromium, and evidence artifacts.
- Transactional customer/product “new” buttons remain presentation-only and there is no dedicated invoice-entry route; no unsupported CRUD claim is made.

### CURRENT E2E STATUS
| Area | Status | Required evidence |
|---|---|---|
| Real Chromium | READY | current exact-head browser run |
| Authenticated browser login | BASELINE PASS locally; current-head browser run pending | real A/B credentials in runner |
| Tenant A/B resolution | BASELINE PASS locally | browser-held sessions + `current_company_id()` |
| A/B DB isolation | PASS in prior rolled-back DB probes | current-head browser direct-request proof |
| A/B browser isolation | NOT PROVEN | current-head cross-tenant reads/mutations/UI |
| Route discovery | HARNESS INTEGRATED | current-head execution |
| Supported business mutation | IMPLEMENTED IN HARNESS; RUNTIME NOT PROVEN | canonical import + DB read-back + UI read-back |
| Transactional CRUD | GAP | feature itself is not implemented in current UI |
| Import | IMPLEMENTED IN HARNESS; RUNTIME NOT PROVEN | real upload/preview/commit evidence |
| OCR/document | NOT PROVEN | real golden corpus runtime |
| Evidence/decision | NOT PROVEN | authenticated browser flow |
| Reporting/export | PARTIAL | live grants/row bounds repaired; browser output pending |
| Realtime/workers | NOT PROVEN | runtime lifecycle evidence |
| Recovery | NOT PROVEN | backup/restore/rollback drill |
| Negative security | PARTIAL | DB baseline PASS; browser direct-request proof pending |

### CURRENT EXECUTION FINDINGS
1. `src/pages/EntityPages.tsx`: Customer/Product “new” buttons are presentation-only; no mutation handler is attached.
2. `src/App.tsx`: product routes include reports/import/customers/products/inventory/intelligence/settings, but no dedicated sales/invoice-entry route.
3. `src/pages/CanonicalImportPage.tsx`: canonical import is the supported business mutation surface, including security scan, format detection, hash/dedup, parse, validation, reconciliation, RPC commit, import-history update, and UI completion.
4. `src/lib/import/canonical-commit.ts`: canonical import requires authenticated tenant context, enforces canonical boundary validation, and commits through `import_commit_batch`.
5. `scripts/real-business-e2e.mjs`: current business E2E implementation is real-browser/real-session oriented and records exact-head evidence; it has not yet produced a successful runtime artifact on the current `main` HEAD.
6. `full-product-browser-e2e.yml`: current integration runs the broad route/forensic harness followed by the business persistence harness and uploads both evidence directories.

### P1 — MIGRATION / SCHEMA PARITY
- Fresh live migration history shows `20260905173336_restore_authenticated_alternative_group_read_grants` and its exact source migration exists on `main`.
- Fresh live migration history also shows `20260904211416_inventory_intelligence_runtime_schema`; the exact versioned source path was not found in `main`.
- A separate source branch contains the inventory-intelligence hardening migration lineage, but its version is `20260905190000`; the live history uses `20260904211416`. This is provenance drift requiring reconciliation, not blind historical rewrite.

### WORKER / RELIABILITY
- Durable report execution has checkpoint monotonicity, tenant/idempotency identity, lease/failure/dead-letter invariants, and adversarial regression coverage.
- Runtime worker crash/retry/DLQ/recovery remains **UNPROVEN** until an actual operational lifecycle is executed.

### OCR / IMPORT
- Seven golden corpus cases have explicit contract coverage.
- Runtime source→parse→normalize→DB→reconcile→analytics→evidence→decision→output remains NOT PROVEN.
- Supported canonical import code is integrated; business E2E now exercises it in the browser, but current-head runtime proof remains pending.

### LIVE DB FORENSICS / REPAIR
- Staging `fnqbvfuwbdpwvhcgzksl` is active/healthy.
- Core public tables checked have RLS; core anonymous table grants were not found.
- Tenant A/B database adversarial probes previously passed.
- Authenticated export RPC execution was repaired and remains bounded; anonymous execution remains denied.
- Dashboard financial truth is gated on currency consistency and explicit insufficient-data conditions.
- Alternative-group authenticated read grants were restored while anonymous access remains denied.
- Supabase Auth leaked-password protection remains disabled according to the prior advisor result and is an external control-plane hardening item.

### RECOVERY / BACKUP / RESTORE
- Recovery remains **UNPROVEN** until backup creation, integrity validation, isolated restore, business invariant checks, tenant isolation, authenticated smoke, measured RPO/RTO, and rollback drill produce exact-head operational evidence.

### CERTIFICATION
- The canonical certification evaluator remains fail-closed and exact-head bound.
- No runtime certification can be issued while P0 browser proof, migration parity, and required operational gates remain open.

### ACTIVE EXECUTION QUEUE
- P0 current-head authenticated browser E2E and A/B adversarial browser proof.
- P1 migration/source parity reconciliation.
- P1 worker retry/idempotency/recovery runtime.
- P1 Arabic OCR/document golden runtime.
- P1 import/reconciliation adversarial runtime.
- P1 backup/restore/rollback operational drills.
- P1 Windows watched-folder runtime proof.
- P2 performance, observability, SECURITY DEFINER least-privilege, UX, production configuration, and final certification evidence.

### GOVERNANCE LOG
- `96fab0e04686035a3190ecaa58784a0f131458be`: earlier E2E Product Gap Ledger and migration-lineage findings.
- `9956014faadff896b20993105b0e8623efee8280`: added real business persistence/tenant-isolation browser E2E runner.
- `a1fc78d0d70343f5727914400fe407e8b1414b3f`: integrated business E2E into the full browser gate.
- This index update is documentation-only; its resulting commit becomes the next exact-head evidence boundary.