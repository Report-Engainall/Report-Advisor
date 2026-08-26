# Gross Profit Runtime Execution Directive — 2026-08-26

## Target HEAD

`746a0e4186a0ebcfc4e12164d6f26d42956523c9`

This document is an execution directive and evidence boundary. It does not certify runtime truth.

## Current evidence boundary

- Authenticated live data boundary: PROVEN by prior evidence.
- Raw `sale_items` execution is **not** surface runtime proof.
- Dashboard: NOT PROVEN
- Reports: NOT PROVEN
- Executive Decision: NOT PROVEN
- Export: NOT PROVEN
- Analytics: NO INDEPENDENT GP CONSUMER / NOT PROVEN unless a real consumer is discovered.
- BI: NO INDEPENDENT GP CONSUMER / NOT PROVEN unless a real consumer is discovered.

## Required execution path

```text
REAL JWT
  -> actual production surface consumer
  -> real query/RPC/data boundary
  -> captured actual surface result
  -> independent fixture comparator
```

The comparator MUST NOT import or call `canonicalFinancialQueries`, `canonicalFinancialTruth`, or `semanticMetrics` to generate expected values or surface output.

## Required consumer record

For each surface, record:

- surface
- entry point
- production consumer
- underlying query/RPC
- authentication boundary
- tenant boundary
- result shape
- actual runtime result

If a surface cannot be executed through the existing live infrastructure because it requires browser-only/UI orchestration, record `RUNTIME BLOCKED — REQUIRES UI EXECUTION`; do not substitute a raw query and call it a surface pass.

## Runtime scenarios

Execute independently for Tenant A and Tenant B:

- complete records
- missing/NULL cost
- discount-bearing record (without inventing discount semantics)
- multiple invoices
- multiple customers
- start boundary
- end boundary
- outside date range
- cross-tenant access attempts
- 25 export rows with 20-row presentation page

Expected fixture values remain independent and must not be derived from the production implementation.

## Artifact contract

`gross-profit-runtime-results.json` must contain, without secrets:

- timestamp
- surface
- tenant identity (non-secret identifier)
- authenticated execution identity (non-secret descriptor)
- consumer/query identity
- actual result
- independent expected result
- comparison result
- NULL/missing status
- date-boundary status
- export row count where applicable

Never persist JWTs, access tokens, anon keys, or other secrets.

## Classification

Any difference must be classified before fixing:

- REAL TRUTH BUG
- EXPECTED TRANSFORMATION
- DATE BOUNDARY
- TENANT BOUNDARY
- ROUNDING
- INCOMPLETE DATA
- PRESENTATION ONLY
- UNKNOWN

No exception or expected-value modification may be used to hide a divergence.

## Closure gate

Gross Profit cannot be marked `TRUTH-PROVEN` until all applicable real consumers have actual runtime evidence, independent numeric comparison, Tenant A/B isolation evidence, NULL/missing semantics, date-boundary evidence, export completeness, regression, and exact-head CI evidence.

A missing or unexecutable surface remains `NOT PROVEN`; absence of a consumer is never a PASS.
