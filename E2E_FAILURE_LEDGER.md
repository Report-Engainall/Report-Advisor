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

The compact artifact was produced but is invalid for certification because the scenario contract correctly rejected non-terminal/failed scenario results. Artifact hashes observed during this run were `23593816b63b5e4e9f5192b8fe44f856d7366a92cdf65b0e6e70f046f0aa6e4` and `22611250b40dc7da1a32545627a5851d6ce28892e95ca9f2d84c1eecc489cbce`.

Certification Boundary remains FAIL-CLOSED because the master index records candidate `f8bc54c166078906a55b613a8ba3b4b964a95fa3`, not `35c262...`. `MASTER_EXECUTION_INDEX.md` was not modified.

## Exact-HEAD Failure and RCA — `ddf3aadd6735e703ea73c253245de8d57068b4c3`

Status: **FAILED**. This SHA is closed and must not be rerun.

First failure: `DUPLICATE_NON_TERMINAL` in `assertDuplicateIdempotency()`.

Dependency-closed results already proven on this SHA and not rerun without dependency change: `AUTH=PASS`, `TENANT=PASS`, `28/28 ROUTES=PASS`, `DASHBOARD=PASS`.

### Duplicate causal chain

1. **Second import** used the same normalized source identity as the first import.
2. **`sourceHash`** was persisted by the first successful canonical commit as `sha256:07dfa5f0586ff4b4af0c221588d4158f035122e94a2cf8a50a8a9aac2407d263`.
3. **`import_job`** for the failed second attempt was created as `08680ed1-9c01-45cf-acee-011af4a88cb8` with `status=processing` and empty `result_summary`.
4. **Duplicate detection** on `ddf3...` queried `file_records` only. No matching `file_records` row existed for the canonical source identity.
5. **Transaction path** therefore admitted the second import instead of rejecting it at the authoritative identity check.
6. **Terminalization** did not run before the duplicate assertion; `import_commit_batch` is separate from `import_finish_job`, so it cannot itself be treated as the terminalization proof.
7. **DB persistence/readback** confirmed the non-terminal `import_jobs` row rather than a legitimate duplicate terminal result.
8. **`assertDuplicateIdempotency()`** correctly rejected this observed state with `DUPLICATE_NON_TERMINAL`.

**First incorrect layer:** browser duplicate identity resolution in `checkDuplicate()` because it used the auxiliary `file_records` surface instead of the authoritative tenant-scoped `canonical_import_commits` ledger. The terminal assertion was downstream and was not weakened.

Independent observation: the `/import` history UI also emitted a 400 / `Failed to fetch` during this run. That is recorded as a separate UI-observer issue and is not the proven duplicate root cause.

### Root-cause fix

Successor branch: `fix/duplicate-idempotency-root-20260915`.

Fix commit: `5b4bc8edf3d8593b364f81b26720a1f11dd2d090` — `fix(import): bind browser duplicate detection to canonical commit ledger`.

The fix normalizes the SHA-256 identity, resolves the current tenant, checks `canonical_import_commits(company_id, source_hash)` first, returns a terminal canonical duplicate when present, and retains `file_records` only as legacy compatibility fallback. No timeout, assertion, observer, or evidence behavior was weakened.

PR: `#469`.

### Successor runtime and independent compilation blocker

Fresh workflows on `5b4bc8ed...` showed the focused `import-finish-lifecycle` contract itself **PASS 4/4**, but `npm run typecheck` failed at `src/components/AuthGate.tsx(65,81)` with `TS2554 Expected 1 arguments, but got 2`. This is an independent pre-release compilation blocker and not a duplicate-idempotency result.

An intermediate corrective commit `5dfeacfde7e1162a31696cd944249aff691c54cd` was used to remove the unsupported second `onAuthStateChange` argument, but that commit accidentally reduced the existing `AuthGate` UI to a simplified rendering. It is therefore not treated as a candidate fix or certification SHA.

The UI was immediately restored to the exact pre-change structure from `5b4bc8ed...`, retaining only the supported auth bootstrap call, producing successor SHA `b836c1070bb83dce96411714a0cf7eb0c8c89a0d`. No PASS from the intermediate SHA is promoted. Fresh runtime for `b836c107...` is required.

`Execution Enforcement Contract` run `34957041117`: **FAIL**; `data-quality-runtime` run `34957041198`: **FAIL**; `Final Certification Gate` run `34957041167`: **FAIL** on the predecessor and must be re-evaluated only on the current exact candidate.

## Next Execution Rule

No historical PASS is promoted. Every new SHA requires impact analysis and only affected suites are rerun. Every RCA, fix, focused result, fresh runtime, regression, governance, evidence, release, and closure event must be recorded against the exact SHA and run/job identifiers before that event is considered closed.
