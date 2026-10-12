# LIVE RESUME — 2026-10-12 / TENANT-SCOPED SOURCE MATRIX

Repository: Report-Engainall/Report-Advisor
Branch: fix/source-bound-generic-intelligence-20261009
PR #912: OPEN / NOT MERGED.
Code checkpoint: a6351f3b72f7e4007f9ba8f4264cc33d3a3b46e2
PRODUCT_COMPLETE = NO.

- Commit 75f64f4b631b0da07fd9171eb6ef293798c79c34 fixes default workspace landing route. On run 38275049594, authenticated Chromium route/personalization and the subsequent business/smart-report journey both passed, but full run failed closed at 23/48 real-source coverage.
- Commit bf7268bb6e4b1397b1e1335be5fb1bf81c7d3b19 adds shared source provenance classifier, regression test and CI gate; it excludes known test-fixture paths/explicit synthetic sources, applies the rule at passport refresh and real-source matrix selection, and refines executive/import theme with ink/indigo/brass while preserving semantic status colors.
- Commit a6351f3b72f7e4007f9ba8f4264cc33d3a3b46e2 scopes evidence-passport and report-job discovery to the company_id at query time, and scopes target file diagnostics to the target report job tenant. This fixes a global 5,000-row scan plus in-memory tenant filter that could silently omit tenant-specific records and a file_hash-only diagnostic query that returned same-hash rows from multiple tenants.
- Exact-head validation of a6351f3b72f7e4007f9ba8f4264cc33d3a3b46e2 is pending. Netlify production root still shows source SHA 858ef8e3e5bc5bf74430555eadfb9e6767be348b (not the current branch). Do not merge or claim product complete until exact-head gates, strict eligible-source matrix, cross-screen persistence/readback and production deployment proof pass.
---
