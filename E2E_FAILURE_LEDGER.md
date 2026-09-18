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


## Fresh Exact-HEAD Business E2E Run — 2026-09-18

A governance-only touch is intentionally used to trigger the existing Full Product Browser E2E workflow on a clean Exact HEAD. The run must use the repository-provisioned real Supabase/Auth secrets and real Chromium; no local/mock session is accepted. Outcome remains **PENDING** until the Actions run completes.
