# 2026-09-04 — P1 Report / Export Adversarial Execution Addendum

## Exact execution boundary
- Base execution SHA: `da0c2047ea6530de869bb3b251fa8b83f3b5e812`
- Current candidate after report/export mutations: recorded by the containing commit.
- Branch: `execution/owner-level-compatibility-hardening-main`
- PR: `#310` — OPEN / NOT MERGED
- Main: `083225068f1e2d390f6e1d50e8b178a1e8e1bacb`
- Certification: NOT CLOSED
- Production Certified: 0%

## Finding RE-001 — P1 export bound was not fail-closed
### Discovery
All four canonical export RPCs (`get_inventory_export_rows`, `get_sales_export_rows`, `get_purchase_export_rows`, `get_receivables_export_rows`) previously normalized `p_max_rows` with `least(...,10000)`. Therefore `10001` was silently clamped to `10000` rather than rejected.

### RCA
The bound was implemented as a cap, not an input contract. A caller could therefore probe or rely on an out-of-contract value without receiving a fail-closed rejection. The same boundary also needed to be enforced in the local renderer so a direct renderer call could not create an oversized artifact.

### Repair
- Added migration `supabase/migrations/20260904062000_p1_fail_closed_export_row_bounds.sql`.
- Changed all four RPCs to reject `p_max_rows < 1` or `p_max_rows > 10000`.
- Preserved `NULL` as the default of `10000`.
- Preserved tenant authority through `current_company_id()` and explicit `p_company_id` mismatch rejection.
- Kept execute privilege restricted to `service_role` for the four canonical export RPCs.
- Added `MAX_EXPORT_ROWS = 10_000` and shared renderer input validation to PDF/XLSX/Web rendering.

## Adversarial matrix
| # | Case | Result | Evidence |
|---:|---|---|---|
| 1 | Missing source snapshot | PASS | execution-gate contract |
| 2 | Missing required evidence | PASS | governed evidence gate |
| 3 | Quarantined source | PASS | quarantine guard |
| 4 | Wrong tenant | PASS | DB current_company_id predicate |
| 5 | Cross-tenant execution | PASS | DB tenant mismatch rejection |
| 6 | Cross-tenant artifact access | BLOCKED | external artifact runtime unavailable |
| 7 | Cross-tenant export | PASS | DB tenant mismatch rejection |
| 8 | Tenant spoofing | PASS | authority derives from current_company_id |
| 9 | Duplicate execution | PASS | idempotency contract |
| 10 | Concurrent duplicate execution | PASS | centralized claim path |
| 11 | Same-tenant idempotency collision | PASS | tenant + fingerprint |
| 12 | Cross-tenant idempotency collision | PASS | tenant scope |
| 13 | Completed replay | PASS | lifecycle/idempotency boundary |
| 14 | Terminal-failure replay | PASS | retry is separate from fresh claim |
| 15 | Artifact hash mismatch | PASS | expectedHash verification |
| 16 | Artifact ownership mismatch | BLOCKED | external artifact runtime unavailable |
| 17 | Artifact substitution | PASS | content hash binding |
| 18 | Artifact mutation after generation | PASS | hash verification |
| 19 | Partial report output | PASS | renderer shape validation |
| 20 | Renderer failure | PASS | common renderer gate |
| 21 | Export generation failure | PASS | invalid input fails closed |
| 22 | Failure after artifact creation | PASS* | DB lifecycle + independent artifact verification |
| 23 | Artifact creation failure after state change | PASS* | completion remains lifecycle controlled |
| 24 | Download missing artifact | BLOCKED | external storage/download runtime |
| 25 | Download artifact for another execution | BLOCKED | external ownership runtime |
| 26 | Oversized export 9999/10000/10001 | PASS | 9999 accepted, 10000 accepted, 10001 rejected |
| 27 | `p_max_rows` violation | PASS | DB RPC rejects out-of-range |
| 28 | Pagination/parameter bypass | PASS | no clamping of 10001 |
| 29 | NULL-heavy input | PASS | explicit NULL presentation |
| 30 | Malformed numeric input | PASS | no silent numeric parsing |
| 31 | Malformed date/value | PASS | escaped value rendering |
| 32 | Duplicate rows | PASS | no alternate truth construction |
| 33 | Unexpected schema/data shape | PASS | invalid row/column shape rejected |
| 34 | Terminal-state replay | PASS | worker lifecycle remains canonical |
| 35 | Unauthorized completion | PASS | service-role lifecycle control |
| 36 | Unauthorized export | PASS | execute grants restricted |
| 37 | Direct legacy mutation | PASS | old public export execution path absent |
| 38 | Alternate RPC | PASS | canonical tenant boundary required |
| 39 | Alternate frontend/backend | PASS* | renderer + DB bounds |
| 40 | Non-canonical business truth | PASS* | canonical truth checker remains required |

`PASS*` is bounded contract evidence, not external production runtime certification. `BLOCKED` is not PASS.

## Actual Staging observations
- Authenticated tenant context was established in a rollback-scoped SQL transaction.
- For the active test tenant, `p_max_rows=10000` returned actual counts: inventory `1`, sales `2`, purchase `1`, receivables `2`.
- `p_max_rows=10001` was rejected by all four RPCs with `EXPORT_ROW_LIMIT_INVALID`.
- Cross-tenant `p_company_id` was rejected with `TENANT_CONTEXT_MISMATCH`.
- Probe transaction was rolled back; no test data was retained.
- RPC security metadata: all four are `SECURITY INVOKER`, `search_path=public`, with execute ACL restricted to `service_role` (plus owner/postgres); no `anon` or `authenticated` execute grant.

## Test-of-test
- Added `scripts/report-export-adversarial.test.mjs`.
- Mutation fixtures intentionally remove: row-limit guard, renderer row guard, tenant predicate, artifact hash guard, and idempotency tenant scope.
- The checker must classify each weakened fixture as unsafe; mutation sensitivity is asserted before the suite reports success.
- The report/export CI workflow is `.github/workflows/report-export-adversarial.yml`.

## Bypass / rescan
- Canonical export RPCs use DB-derived tenant identity rather than caller authority.
- Direct export execution privileges for the four canonical RPCs are restricted to `service_role`.
- Local renderers now have a 10,000-row hard boundary.
- External artifact ownership/download and crash/replay remain runtime evidence blockers.
- Repository-wide legacy/alternate report truth rescan remains open; no production certification claim is made from this addendum.

## CI
- Fresh workflow run for the new exact candidate is not yet observed through the available GitHub workflow-run API.
- Vercel status on the candidate remains `failure` due to `build-rate-limit`; this is not treated as PASS.

## Remaining executable work
1. Complete repository-wide report/export caller and alternate-path rescan.
2. Strengthen artifact ownership/execution binding once the external artifact runtime is available.
3. Continue OCR/Document Golden Corpus, then Scale/Performance and Filesystem/Windows.
4. Reconcile PR #310 only after fresh exact-SHA CI and evidence boundary checks.
