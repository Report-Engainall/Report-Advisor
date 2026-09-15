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

This fix is **FIX only**. Fresh verification is mandatory on `a56570613e0769a5775c9c5421aab81e2872c2f7`; no PASS is transferred from `954713...` or any earlier SHA. This ledger update is part of the same follow-up chain and `MASTER_EXECUTION_INDEX.md` remains untouched.

## Discovery Notes
- Existing `scripts/run-decision-runtime-e2e.mjs` is API/RPC-level authenticated runtime testing, not browser E2E.
- Browser harness is intentionally separate and uses a real Chromium browser against the exact-head built application.
- No browser PASS is inferred from API tests, mocks, old deployments, or static contracts.
- Route reachability checks are diagnostic only; page load alone does not certify business correctness.
