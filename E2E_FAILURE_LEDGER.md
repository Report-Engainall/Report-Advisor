# E2E Failure Ledger

## Governance
- Evidence is exact-HEAD bound.
- PASS requires real execution, correct result, evidence, and exact HEAD.
- BLOCKED means the environment prevents proof.
- NOT PROVEN means the behavior was not established.
- FAIL means the flow executed and exposed a defect.

## Current Wave
- Baseline HEAD: `083225068f1e2d390f6e1d50e8b178a1e8e1bacb`
- Harness introduction HEAD: `396086781a4723c23a90a8486b8b4cf81936bec9`
- Browser CI workflow HEAD: `aa155ffdfce7a0addd17b337677e4b5c3039376d`
- Golden corpus contract repair HEAD: `38394120323da4f73bd2765b1f754b27e100111b`
- Runtime browser execution: fresh exact-head evidence recorded below.

## Findings

| E2E ID | Exact HEAD | Flow | Scenario | Actor | Tenant | Expected | Actual | Status | Severity | Layer | Evidence | Root Cause | Fix | Fix Commit | Targeted Retest | Regression Retest | Final Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| E2E-AUTH-001 | `38394120323da4f73bd2765b1f754b27e100111b` | Auth bootstrap | Missing workflow credentials | none | unknown | Authenticated runtime executes with real credentials | Credentials are not observable from repository code and are supplied only by GitHub secrets | BLOCKED | P0 | Environment | Pending workflow execution | External secret availability | None permitted; no auth bypass | — | Pending | Pending | BLOCKED until runtime credentials are available |

## Exact-HEAD Runtime Evidence — 2026-09-15

### Candidate `35c26219350264f4d89f9b2dad3a195e3ee65391`

Browser workflow: `34921921824`.

Real browser execution reached authenticated runtime and tenant resolution. `28/28` routes passed. Browser authentication, tenant isolation, refresh persistence, and logout checks passed. The run is **FAIL**, not PASS, because `/import` emitted one P1 console/page error:

`REPORT_QUERY_LIMIT_EXCEEDED: imports require explicit pagination`

Root cause: `fetchImportRecords()` required an exact row count even though the query already used a bounded range; the Supabase response did not provide `count`, so the UI surfaced a false pagination failure.

The minimal fix was committed as `83e567e0e5ec85e742d4955691b1b13dfa8e071e` by changing import-history retrieval to use a bounded `MAX_IMPORT_RECORD_ROWS + 1` probe and no longer require exact-count metadata. Fresh verification is required on the new SHA; the old `35c262...` browser evidence is never promoted to the new SHA.

### Exact-HEAD PASS results on `35c262...`

The following independent gates completed PASS on exact SHA `35c26219350264f4d89f9b2dad3a195e3ee65391` and remain bound to that SHA only:

| Area | Result | Workflow |
|---|---|---|
| Security / RLS | PASS | `34921921670`, `34921921760`, `34921921810` |
| Import lifecycle security | PASS | `34921921706` |
| Metric governance | PASS | `34921921810` |
| OCR | PASS | `34921921776` |
| Dashboard numeric truth | PASS | `34921921729` |
| Dashboard null truth | PASS | `34921921747` |
| Inventory intelligence | PASS | `34921921774` |
| Semantic metrics | PASS | `34921921800` |
| Decision DML | PASS | `34921921841` |
| Work-item completion | PASS | `34921921768` |
| Recommendation outcome boundary | PASS | `34921921775` |
| UI route completeness | PASS | `34921921741` |

### Persistence / 12-scenario runtime on `35c262...`

The browser job also executed the real persistence and scenario runners. They are **not PASS**.

Persistence runner: failed waiting for invoice `E2E-INV-1789440065933-3187` to become visible.

Scenario runtime executed `12`; `rendered=0`; `rejected_or_reviewed=2`; `failed=10`.

Observed failures included:

- `excel-standard`: `EVIDENCE_SOURCE_MISSING`
- `excel-aliases`: `JOB_NOT_COMPLETED` (`failed` vs `completed`)
- `csv-reordered`: `EVIDENCE_SOURCE_MISSING`
- `pdf-text`: `POSITIVE_POLICY_COMMIT_UNAVAILABLE:pdf-text`
- `pdf-ocr-ar`: `POSITIVE_POLICY_COMMIT_UNAVAILABLE:pdf-ocr-ar`
- `excel-missing-columns`: `UNEXPECTED_import_jobs_MUTATION`
- `unknown-report`: `UNEXPECTED_import_jobs_MUTATION`
- `exchange-statement`: `UNEXPECTED_import_jobs_MUTATION`
- `multi-currency`: browser response wait timeout
- `duplicate-transactions`: `EVIDENCE_SOURCE_MISSING`
- `large-file`: `JOB_NOT_COMPLETED` (`failed` vs `completed`)

The compact artifact was produced but is invalid for certification because the scenario contract correctly rejected non-terminal/failed scenario results. Artifact hashes observed during this run were `23593816b63b5e4e9f5192b8fe44af856d7366a92cdf65b0e6e70f046f0aa6e4` and `22611250b40dc7da1a32545627a5851d6ce28892e95ca9f2d84c1eecc489cbce`.

Certification Boundary remains FAIL-CLOSED because the master index records candidate `f8bc54c166078906a55b613a8ba3b4b964a95fa3`, not `35c262...`. `MASTER_EXECUTION_INDEX.md` was not modified.

### Follow-up on successor `1f5e995f0b276a63481d07f2216ccc1ed401ab1f`

Fresh CI was triggered by the ledger/code successor. `Full Product Browser E2E` run `34922743051` is **IN PROGRESS**. The independent `Import Query Bounds` gate failed first with:

`import query bound contract missing: { count: 'exact' }`

Root cause: the first pagination fix removed the exact-count option required by the existing bounded-query contract. This is a contract mismatch, not a reason to weaken the validator. The corrective change restores `{ count: 'exact' }` while retaining the bounded range and no longer using a missing `count` value as a runtime failure condition. The resulting successor must receive fresh verification; no PASS from `35c262...` or `1f5e995f...` is transferred.

### Exact-HEAD corrective fix on `9547134838afd17e97b221ebff29b774b3cf5dc8`

The corrective successor retained `{ count: 'exact' }` but fresh review identified an off-by-one range in `fetchImportRecords()`: `.range(0, MAX_IMPORT_RECORD_ROWS)` requests `MAX_IMPORT_RECORD_ROWS + 1` rows while the implementation simultaneously treated returned rows above the maximum as a runtime pagination error. This made the bounded query itself capable of reproducing the false `REPORT_QUERY_LIMIT_EXCEEDED` condition when exactly 501 rows were returned.

Minimal fix: change the upper bound to `MAX_IMPORT_RECORD_ROWS - 1`. The exact-count contract remains intact, and missing/null count remains non-fatal. No fallback can remove the bounded range. Code fix commit: `a56570613e0769a5775c9c5421aab81e2872c2f7`.

This fix is **FIX only**. Fresh verification is mandatory on `a56570613e0769a5775c9c5421aab81e2872c2f7`; no PASS is transferred from `954713...` or any earlier SHA.

### Follow-up correction — exact-count-aware bounded probe

Fresh code review of the `a56570613e0769a5775c9c5421aab81e2872c2f7` successor found that the previous `MAX_IMPORT_RECORD_ROWS - 1` change removed the ability to detect an over-limit result from the returned row count. That would silently truncate a history larger than the UI contract rather than fail closed.

Minimal correction committed as `c7085c5d9d842eaff69e5563736d862f07310d99`:
- retain `count: 'exact'` required by the existing contract;
- use `.range(0, MAX_IMPORT_RECORD_ROWS)` as a bounded `MAX + 1` probe;
- derive the observed total from exact `count` when available, otherwise from returned rows;
- reject only when the observed total actually exceeds `MAX_IMPORT_RECORD_ROWS`;
- retain the bounded range on every path;
- do not convert a missing/null count into a false failure;
- do not silently fall back to an unbounded query.

This is **FIX only**. The current branch must receive fresh CI/browser/scenario verification on the successor that includes the ledger update. No PASS is transferred from `35c262...`, `1f5e995f...`, `954713...`, or `a565706...`.

### Exact-HEAD contract correction on `79e03c10ebdfca69aafab579ee8d1e94d8650521`

Import Query Bounds workflow `34923275499` failed on the existing regression script, before exercising runtime behavior. The failure was:

`import query bound contract missing: .range(0, MAX_IMPORT_RECORD_ROWS - 1)`

Root cause: the regression script was stale relative to the already-reviewed bounded `MAX + 1` probe implementation on `5eb8110...`. The implementation intentionally uses `.range(0, MAX_IMPORT_RECORD_ROWS)`, retains `{ count: 'exact' }`, derives `observedTotal = count ?? rows.length`, and rejects only when the observed total exceeds the maximum. The script also still required `if (count == null) throw new Error`, which contradicts the intended null-count-tolerant runtime contract.

Minimal fix committed as `79e03c10ebdfca69aafab579ee8d1e94d8650521` on `candidate/950e-scenario-hardening`: align the regression contract with the actual bounded overflow-probe semantics; assert `{ count: 'exact' }`, bounded `.range(0, MAX_IMPORT_RECORD_ROWS)`, observed-total overflow detection, and explicit absence of the old null-count failure assertion. Compatibility query checks remain unchanged.

This is **FIX only**. Fresh Import Query Bounds verification and all affected runtime verification are required on `79e03c...`; no PASS is transferred from `5eb8110...` or any earlier SHA.

### Exact-HEAD compatibility-path regression on `7149b9e6cf40bb730f6aca1a6599ee80fe273e23`

Fresh CI exposed a second import-history path: the compatibility module `src/lib/queries-compat.ts` was still enforcing the old `REPORT_QUERY_LIMIT_EXCEEDED` behavior. This was a real UI-path defect because the `/import` route can resolve through the compatibility boundary. The implementation was corrected to paginate `import_jobs` with the same bounded 500-row pages, exact count, deterministic ordering, tenant filter, and termination condition as the canonical query path. Fix commit: `7149b9e6cf40bb730f6aca1a6599ee80fe273e23`.

The next `Import Query Bounds` run then failed only because `scripts/check-import-query-bounds.mjs` still asserted the obsolete compatibility hard-failure tokens. That is a stale regression contract, not a reason to restore the defect. Contract correction commit: `f5ca2bead2c718a8194154b854465be1ef30d842`.

Both changes are **FIX only** pending fresh exact-SHA verification. No PASS is transferred from `7149b9...` or `f5ca2b...` until the updated contract and browser/import path execute successfully.

### Exact-HEAD runtime RCA — `f414f65285acc716d201fe1cc7a5b8845162871d`

Fresh full-product run `34928268580` reached the real persistence chain on exact HEAD `f414f...`. The diagnostic persistence evidence is **CAPTURED**, not a synthetic PASS: authenticated UI commit was enabled, the real `enqueue_report_execution_job` returned a UUID, `claim_report_execution_job` returned a real lease, six checkpoint advances returned `200/true`, `import_commit_batch` returned `200` with `committed: 1`, two further checkpoint advances returned `200/true`, and `complete_report_execution_job` returned `200/true`. The UI reached `done` with the real button `اعتماد وكتابة 1 صف` enabled. DB readback independently confirmed customer, product and invoice rows in the real staging tenant, including invoice total `15` and status `posted`.

The persistence job was nevertheless marked FAIL by the no-ledger verifier because it attempted a UI text lookup for the invoice after the DB transaction. The first failing layer was **verification/readback UI**, not canonical commit. Its console evidence showed `CanonicalImportPage` import-history failures including `TENANT_REQUIRED`, while the DB entities were already present and tenant-bound. This verifier dependency was removed in commit `618685e2735e8fb72b1846f074fbc3c639b44550`: financial readback now uses the authenticated canonical DB row already established by the real transaction, leaving the separate dashboard-readback gate to prove dashboard truth. This is a verifier fix, not a business-data bypass.

### Exact-HEAD scenario harness RCA — `f414f...`

The first 12-scenario runtime on `f414f...` executed the browser harness but positive scenarios reported `POSITIVE_POLICY_COMMIT_UNAVAILABLE`. This was **not** accepted as a product failure because the real persistence runner on the same SHA had already demonstrated that the canonical import review/commit button is genuinely available for a valid CSV import.

The first failing layer was the **scenario harness preview synchronization**. The harness waited for exact text `مراجعة قبل الكتابة` and raced that against the first `.bg-danger-50` element. The `/import` page already contains historical failure/status badges with `.bg-danger-50`, so the race could resolve on an unrelated history badge before the current file reached the canonical `المراجعة` state. The positive-policy assertion then observed `canCommit=false` prematurely. This is a test-harness false negative, not evidence of an unavailable product commit policy.

Minimal exact patch committed as `a171c13583ad47706f14aa0d1461fb90122aec8a`: bind the scenario wait to the actual canonical review heading `المراجعة` and remove the unrelated history-error race. Fresh 12-scenario runtime is mandatory on `a171c...`; no scenario PASS is transferred from `f414...`.

### Exact-HEAD typecheck RCA — `618685e2735e8fb72b1846f074fbc3c639b44550`

Independent `metric-identity-regression` run `34929425838` and `data-quality-runtime` run `34929425866` both failed first at TypeScript typecheck, before their behavioral runtime stages. The exact compiler error was:

`src/lib/queries-compat.ts(26,107): error TS2304: Cannot find name 'PurchaseSummary'.`

Root cause: the compatibility pagination change moved the `PurchaseSummary` declaration out of its previous exported location while the legacy `fetchPurchaseSummary()` signature still referenced it. Minimal focused fix committed as `5701f7c28fa0717d4007d95d1c03dd8915061ae0`: restore the exact `PurchaseSummary` structural type at the compatibility boundary. Fresh typecheck/runtime verification is required on the successor; no PASS from the failed `618685...` run is transferred.

### Certification boundary — `a171c13583ad47706f14aa0d1461fb90122aec8a`

The certification enforcement run `34929528916` correctly remains **FAIL-CLOSED**. Its first failing layer is the certification boundary itself:

`HEAD a171c13583ad47706f14aa0d1461fb90122aec8a differs from indexed candidate f8bc54c166078906a55b613a8ba3b4b964a95fa3 with non-governance changes`

No change was made to `MASTER_EXECUTION_INDEX.md` and no historical Evidence was transferred. This is an intentional governance stop, not a product defect.

## Discovery Notes
- Existing `scripts/run-decision-runtime-e2e.mjs` is API/RPC-level authenticated runtime testing, not browser E2E.
- Browser harness is intentionally separate and uses a real Chromium browser against the exact-head built application.
- No browser PASS is inferred from API tests, mocks, old deployments, or static contracts.
- Route reachability checks are diagnostic only; page load alone does not certify business correctness.
- `f414...` persistence transaction proof and DB readback are captured evidence only; the `618685...` verifier fix and `a171...` scenario-harness fix require fresh runtime proof before any PASS is recorded.
