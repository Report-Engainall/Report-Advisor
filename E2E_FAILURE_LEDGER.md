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
- Runtime browser execution: pending fresh GitHub Actions run on current exact HEAD.

## Findings

| E2E ID | Exact HEAD | Flow | Scenario | Actor | Tenant | Expected | Actual | Status | Severity | Layer | Evidence | Root Cause | Fix | Fix Commit | Targeted Retest | Regression Retest | Final Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| E2E-AUTH-001 | `38394120323da4f73bd2765b1f754b27e100111b` | Auth bootstrap | Missing workflow credentials | none | unknown | Authenticated runtime executes with real credentials | Credentials are not observable from repository code and are supplied only by GitHub secrets | BLOCKED | P0 | Environment | Pending workflow execution | External secret availability | None permitted; no auth bypass | — | Pending | Pending | BLOCKED until runtime credentials are available |
| E2E-PROD-001 | `a0897a2cef87d55d6cd91c342b86cf69c469b997` | Full Product Browser + real business persistence | Product readback after authenticated create | Actor A | `f68a7e91-3c7e-46fb-97a8-e339bec04e13` | Newly created product is persisted and searchable/readable through the Products UI | DB insert succeeded, but Products UI failed closed with `REPORT_QUERY_LIMIT_EXCEEDED: products require explicit pagination`; the tenant contained 501 products while the legacy query hard-limited 500 | FAIL | P0 | Product UI/query | Exact-head browser job `35265216931` | ProductsPage used unpaginated `fetchProducts()` and then applied client-side search; the query intentionally fails when more than 500 rows exist | Added tenant-scoped `fetchProductsPage()` with server-side search and bounded pagination; ProductsPage now reads pages with explicit page controls | `aefb30ca21abba334b63ae73f2afb1c2ceb89ab8` + `6fb728ea1ac0a4f985225c3b6229ee96089ee67a` | Pending | Pending | NOT PROVEN until fresh exact-head browser + business persistence evidence |

## Discovery Notes
- Existing `scripts/run-decision-runtime-e2e.mjs` is API/RPC-level authenticated runtime testing, not browser E2E.
- Browser harness is intentionally separate and uses a real Chromium browser against the exact-head built application.
- No browser PASS is inferred from API tests, mocks, old deployments, or static contracts.
- Route reachability checks are diagnostic only; page load alone does not certify business correctness.

## 2026-09-19 — Exact-head CI retrigger after backend secret provisioning
- The previously failed Full Product Browser run on `c9029723ef270917f7762182cfbd5b1ac12949c9` was blocked before business execution by the absent GitHub Actions backend secret `REPORT_ADVISOR_SUPABASE_SERVICE_ROLE_KEY`.
- The owner has now provisioned that secret externally. Changing the secret does not rerun a historical GitHub Actions attempt, and the connected GitHub integration lacks rerun permission (403).
- This ledger marker is governance-only and exists solely to create a new exact SHA through the existing `E2E_FAILURE_LEDGER.md` push trigger. No product/runtime behavior or evidence is changed by this marker.
- The fresh workflow run on the new exact SHA is the only authoritative business-persistence attempt; no evidence from `c9029723` is transferred.

## 2026-09-19 — Fresh exact-head retrigger after owner secret provisioning
- Owner reports REPORT_ADVISOR_SUPABASE_SERVICE_ROLE_KEY has been added in GitHub.
- Authoritative observation: rerun of c9029723ef270917f7762182cfbd5b1ac12949c9 still failed at the backend runtime secret contract with SUPABASE_SERVICE_ROLE_KEY=MISSING, before business execution.
- Exact successor 4a79e23faffd39c96c3839d1e15fe543465930cf contains the governed environment: staging binding for Full Product Browser E2E.
- No evidence is transferred from c902. The next push is a governance-only retrigger marker; the resulting successor SHA is the only authoritative runtime attempt.

## 2026-09-19 — Exact-head retrigger after canonical import schema fix
- Code fix committed at 4e90ffac8684d0c295173a1a38143e221dca6572.
- Static verification on the code head: diff-check PASS; import transaction contract PASS; TypeScript typecheck PASS; production build PASS.
- Root cause fixed: canonical-import-execute no longer selects non-existent import_jobs.file_name/entity_type columns; entity identity is checked against persisted job_type/result_summary while tenant and import ID remain mandatory.
- Retrigger marker only: no runtime/product behavior is changed by this ledger entry.
- Evidence from 6bfb9932 is not transferred; the next exact head must re-prove browser, KPI, and business persistence.
