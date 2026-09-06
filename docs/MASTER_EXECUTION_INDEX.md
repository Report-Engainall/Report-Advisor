# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-06

> Authoritative execution manifest. Because embedding this file's own commit SHA would make the SHA self-invalidating, the exact current candidate is always the Git `HEAD` of `main` at the same checkout. Pair this manifest with `git rev-parse HEAD` for every evidence batch.

### CURRENT EXACT HEAD
- Latest functional/documented candidate before this governance synchronization: `96fab0e04686035a3190ecaa58784a0f131458be`.
- This synchronization is documentation-only and changes the exact HEAD; therefore all runtime/release evidence must be re-established against the new HEAD after the index commit.
- No historical runtime evidence is promoted onto the new HEAD.

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
- Real authenticated runtime baseline is proven locally for Actor A/B tenant resolution and DB isolation; this is a **baseline**, not full browser certification.
- Full browser workflow exists and requires current-head execution with the real A/B test credentials configured in the runner.
- The browser harness already records real Chromium route execution, console errors, failed requests, screenshots, session refresh persistence, and logout state.
- A real supported business mutation path exists through `CanonicalImportPage`; transactional customer/product “new” buttons currently have no mutation handlers and there is no dedicated invoice-entry route. A transactional CRUD E2E claim would therefore be false unless that product capability is added.
- Current priority is to make browser E2E execute the supported canonical import path end-to-end: upload → scan → parse → canonical reconciliation → RPC commit → DB read-back → UI read-back → refresh read-back, followed by A/B cross-tenant adversarial API checks.

### CURRENT E2E STATUS
| Area | Status | Required evidence |
|---|---|---|
| Real Chromium | READY | exact-head browser run |
| Authenticated browser login | BASELINE PASS locally; current-head browser run pending | current-head runner with real A/B credentials |
| Tenant A | BASELINE PASS locally | browser-held session + `current_company_id()` |
| Tenant B | BASELINE PASS locally | browser-held session + `current_company_id()` |
| A/B DB isolation | PASS in prior rolled-back DB probes | current-head browser direct-request proof |
| A/B browser isolation | NOT PROVEN | cross-tenant read/update/delete/insert attempts |
| Route discovery | HARNESS READY; runtime pending | current-head browser run |
| Supported business mutation | NOT PROVEN in browser | canonical import + DB truth + refresh |
| Transactional CRUD | GAP | current UI is read-only for customer/product creation |
| Import | NOT PROVEN in browser | real upload/preview/commit + canonical read-back |
| OCR/document | NOT PROVEN | real golden corpus runtime |
| Evidence/decision | NOT PROVEN | authenticated browser flow |
| Reporting/export | PARTIAL | live grants/row bounds repaired; browser output pending |
| Realtime/workers | NOT PROVEN | runtime lifecycle evidence |
| Recovery | NOT PROVEN | backup/restore/rollback drill |
| Negative security | PARTIAL | DB baseline PASS; browser direct-request proof pending |

### CURRENT EXECUTION FINDINGS
1. `src/pages/EntityPages.tsx`: Customer/Product “new” buttons are presentation-only; no mutation handler is attached.
2. `src/App.tsx`: product routes include reports/import/customers/products/inventory/intelligence/settings, but no dedicated sales/invoice-entry route.
3. `src/pages/CanonicalImportPage.tsx`: canonical import is the current real supported business mutation surface, including security scanning, format detection, hash/dedup, parse, validation, reconciliation, RPC commit, import-history update, and UI completion.
4. `src/lib/import/canonical-commit.ts`: canonical import requires an authenticated tenant context, validates the canonical boundary, and commits through `import_commit_batch`.
5. `scripts/run-full-product-browser-e2e.mjs`: route/forensic assertions are present, but a real business mutation/read-back sequence is not yet part of the harness.
6. Direct harness modification was attempted but blocked by the tool security layer; no bypass or unsafe workaround was used.

### P1 — MIGRATION / SCHEMA PARITY
- Fresh live migration history shows `20260905173336_restore_authenticated_alternative_group_read_grants` and its exact source migration exists on `main`.
- Fresh live migration history also shows `20260904211416_inventory_intelligence_runtime_schema`; repository lookup for the exact versioned source path returned NOT FOUND.
- This is a concrete live/source migration-lineage drift. It remains open until the provenance is reconciled without rewriting historical migration records.

### WORKER / RELIABILITY
- Durable report execution has checkpoint monotonicity, tenant/idempotency identity, lease/failure/dead-letter invariants, and durable RPC adapters in source tests.
- Runtime worker crash/retry/DLQ/recovery remains **UNPROVEN** until an actual operational lifecycle is executed.

### OCR / IMPORT
- Seven golden corpus cases have explicit contract coverage.
- Runtime source→parse→normalize→DB→reconcile→analytics→evidence→decision→output remains NOT PROVEN.
- Supported import code path is integrated; runtime browser proof and realistic adversarial corpus remain pending.

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
- P0 current-head authenticated browser E2E.
- P0 A/B browser adversarial direct-request checks.
- P1 migration/source parity reconciliation.
- P1 worker retry/idempotency/recovery runtime preparation.
- P1 Arabic OCR/document golden runtime.
- P1 import/reconciliation adversarial runtime.
- P1 backup/restore/rollback operational drills.
- P1 Windows watched-folder runtime proof.
- P2 performance, observability, SECURITY DEFINER least-privilege, UX, production configuration, and final certification evidence.

### GOVERNANCE LOG
- `96fab0e04686035a3190ecaa58784a0f131458be`: E2E Product Gap Ledger updated with current product-capability and migration-lineage findings.
- This index update is documentation-only. Its resulting commit becomes the new exact-head boundary; all runtime gates must be retested against that resulting SHA.
