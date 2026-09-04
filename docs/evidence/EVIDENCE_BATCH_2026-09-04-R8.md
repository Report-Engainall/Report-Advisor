# Evidence Batch R8 — 2026-09-04 — Full Business E2E Harness Closure

## Exact boundary
- Branch: `repair/currency-analytics-truth-46156969`
- PR: `#316 OPEN / DRAFT / NOT MERGED`
- Exact HEAD at capture: `4afdc174838b386e0001940f3cfa648871952f07`
- Certification: **NOT CERTIFIED**
- Note: subsequent documentation commits, if any, supersede this SHA; do not treat this file's embedded SHA as a future branch tip.

## E2E harness
The previous route-only runner has been replaced by a concrete 20-flow browser executor in `scripts/run-full-product-browser-e2e.mjs`.

### 20 flows implemented
1. BF-001 Auth / Session — real Supabase password login; browser token assertion.
2. BF-002 Tenant context — `current_company_id()` assertion.
3. BF-003 Product CRUD — UI create/edit/delete + REST DB oracle + tenant assertion + backend request assertion.
4. BF-004 Customer CRUD — UI create/edit/delete + REST DB oracle + tenant assertion + backend request assertion.
5. BF-005 Search / Filter — real search input interaction and rendered-result assertion.
6. BF-006 Import — real file chooser/upload + processing action + visible result contract.
7. BF-007 Inventory reconciliation — real report route/filter interaction + backend request oracle.
8. BF-008 Sales reporting — real report route/filter interaction + backend request oracle.
9. BF-009 Purchase reporting — real report route/filter interaction + backend request oracle.
10. BF-010 Receivables — real report route/filter interaction + backend request oracle.
11. BF-011 Dashboard truth — real dashboard interaction + backend request oracle.
12. BF-012 Export — real export/download action required.
13. BF-013 Document/OCR — real document input path and processing action.
14. BF-014 Evidence — real evidence action required on decision surface.
15. BF-015 Recommendation — real recommendation action required.
16. BF-016 Decision/Approval/Work/Outcome — real lifecycle action required.
17. BF-017 Realtime — two authenticated browser contexts; UI mutation followed by cross-context visibility assertion.
18. BF-018 Refresh persistence — hard reload and authenticated surface persistence assertion.
19. BF-019 Recovery — interrupted/reopened workflow reload assertion.
20. BF-020 Logout/Re-login — real logout followed by real password re-login and token assertion.

The harness is fail-closed: console errors, failed network requests, missing required controls, missing DB rows, tenant mismatch, missing auth, or incomplete action surfaces cannot produce PASS.

## Test-of-test
`scripts/full-product-browser-e2e-harness-contract.test.mjs` is now a mandatory CI gate. It verifies all 20 flow IDs, concrete browser operations, DB/security/persistence evidence fields, and fail-closed behavior.

## Authenticated A/B adversarial harness
`scripts/browser-tenant-adversarial-e2e.mjs` was added and attached to the full browser workflow. It logs in A and B with real credentials, proves distinct tenants, performs cross-tenant reads by IDs across critical objects, and attempts a forged `company_id=B` product insert using A's browser token. A/B runtime evidence remains blocked until test credentials are provisioned.

## Golden report
Primary product report remains `exchange-arabic` from the existing deterministic corpus. The business wrapper contract requires SOURCE→UPLOAD→PROCESS/EXTRACTION→NORMALIZATION→DB→RECONCILIATION→ANALYTICS→UI→EXPORT/EVIDENCE. The browser workflow now locates the real repository fixture rather than hardcoding a guessed path. If the fixture is absent, CI fails rather than silently downgrading the scenario.

Important boundary: the current repository corpus manifest is deterministic and defines expected dispositions, but no authenticated end-to-end report execution has occurred yet. Therefore source-to-output equality remains **NOT PROVEN**.

## State-machine / writer audit
- 12 critical lifecycle writers are explicitly covered by the current transition contract.
- All audited lifecycle tables deny authenticated direct INSERT/UPDATE/DELETE.
- Live public function inventory identified 16 recommendation/decision/approval/work/outcome/evidence-related functions, including helper/audit/notification functions. Runtime-callable lifecycle writers are SECURITY DEFINER and tenant/auth guarded.
- Known bypass classes: direct outcome without work, work without approval, approval without valid decision, decision outcome without evidence/work, terminal rewrite, cross-tenant transition, wrong actor, replay/state-change race.
- Backend repairs already applied: recommendation outcome lifecycle and recommendation status state machine.
- Runtime negative/forged/wrong-actor/wrong-tenant/replay matrix remains **NOT PROVEN** until authenticated runtime exists.

## Financial truth
The currency consumer rescan covered source and live consumers using currency/money/price/cost/revenue/profit/margin/valuation/aging/receivable semantics. Additional consumers fixed in this wave:
- `cash_liquidity_snapshot`
- `get_sales_export_rows`
- `get_purchase_export_rows`
- `get_receivables_export_rows`

Canonical behavior remains: same currency → calculable; mixed/missing/invalid transaction currency → fail closed / `INSUFFICIENT_DATA` for financial outputs.

## RPC parity
- Frontend→migration static parity gate exists.
- Live function inventory and critical signatures have been inspected.
- Full automated bidirectional `frontend ↔ generated types ↔ migration ↔ live signature ↔ grants ↔ tenant guard` gate is still **INCOMPLETE** because the repository does not persist a canonical generated-type artifact that can be compared automatically on every change.

## Security
- Public RLS tables: **81/81**.
- RLS tables without policies: **0/81**.
- Anonymous SELECT privilege on public base tables: **0/81**.
- Prior staging probes rejected forged tenant product mutation, viewer product mutation, cross-tenant export, and cross-tenant product/customer reads.
- New authenticated browser A/B attack runner: **IMPLEMENTED / NOT EXECUTED** pending credentials.

### SECURITY DEFINER
- Total: **33**
- Authenticated callable: **20**
- Not authenticated callable: **13**
- Anonymous callable: **0**
- Classification: audited/hardened for the critical authenticated-callable lifecycle paths; remaining runtime exploitability is **NOT PROVEN**, not PASS.

## Import
- Counter integrity: fixed/proven in DB.
- Completion invariant: fixed/proven in DB.
- Row locking / normalized SKU race handling: present.
- Browser same-file concurrency: **READY / NOT EXECUTED**.
- Worker retry: **READY / NOT EXECUTED**.
- Crash/partial failure/recovery/idempotency: **READY / NOT EXECUTED**; full runtime proof requires worker/authenticated environment.

## CI current-head discipline
This wave created new commits, so all parent CI is historical. The final SHA must receive fresh workflow results. At the time of this evidence capture, the new current-head checks were queued/pending; no queued result is counted as PASS.

## Deployment / external operations
- Current-head Vercel deployment: **EXTERNAL BLOCKED / rate limited**.
- Auth A/B: **EXTERNAL BLOCKED** — required test-only secret values are not provisioned.
- Backup/restore: **EXTERNAL OPERATIONAL ACCESS BLOCKED**.
- Rollback: **EXTERNAL OPERATIONAL ACCESS BLOCKED**.
- Windows native: **EXTERNAL ENVIRONMENT BLOCKED**.

## Final classification for this batch
| Category | Status |
|---|---|
| Browser harness implementation | **FIXED / IMPLEMENTED** |
| Browser 20-flow runtime | **BLOCKED / NOT EXECUTED** |
| Golden report browser execution | **READY / BLOCKED** |
| A/B adversarial browser execution | **READY / BLOCKED** |
| State-machine backend | **HARDENED** |
| Critical direct-DML bypass | **CLOSED for audited lifecycle tables** |
| Financial currency consumer gaps | **FIXED / RESCANNED** |
| Import lifecycle counters | **FIXED** |
| Import concurrency/recovery runtime | **NOT PROVEN** |
| RPC bidirectional parity | **INCOMPLETE** |
| CI current-head | **PENDING — no PASS claim** |
| Vercel | **EXTERNAL BLOCKED** |
| Auth A/B | **EXTERNAL BLOCKED** |
| Backup/Restore/Rollback | **EXTERNAL BLOCKED** |
| Windows | **EXTERNAL BLOCKED** |
| Certification | **NOT CERTIFIED** |

## Certification impact
The internal E2E harness gap is no longer the same route-only capability: the 20-flow executor, fail-closed evidence fields, product CRUD DB oracles, report/import actions, persistence/relogin, realtime cross-context check, and A/B adversarial runner now exist in source and CI. This does **not** prove runtime success. The next boundary is fresh exact-head CI followed by real authenticated execution as soon as A/B credentials and a current-head runtime are available.
