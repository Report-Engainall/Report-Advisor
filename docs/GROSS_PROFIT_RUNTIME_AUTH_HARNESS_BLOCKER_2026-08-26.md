# Gross Profit Authenticated Runtime Harness — 2026-08-26

## Evidence scope

This record is created from the current Gross Profit truth-closure branch only. It does not treat any earlier SHA, merge SHA, or previous CI run as evidence for a later HEAD.

Starting HEAD inspected: `87a0848ec2bf4babc4db782af986b159eac037f3`.

## Required proof

```text
authenticated execution
  -> real production consumer
  -> real query/data boundary
  -> surface result artifact
  -> independent fixture comparison
```

Required surfaces with identified GP consumers:

- Dashboard
- Reports
- Executive Decision
- Export

Analytics and BI are not marked PASS. They remain `NO GP CONSUMER FOUND / NOT PROVEN` unless a real GP consumer is subsequently identified.

## Harness inventory performed

The repository was inspected for an existing reusable browser/authenticated E2E path using the following evidence classes:

- browser automation dependencies/configuration (`playwright`, `puppeteer`, `cypress`, browser storage-state configuration): no existing reusable harness was identified.
- authenticated browser test/spec naming and session artifacts: no existing reusable browser-auth harness was identified.
- report execution E2E infrastructure: `scripts/check-report-execution-e2e-contract.mjs` is a static contract gate over report-execution components; it does not execute an authenticated browser session.
- runtime infrastructure: existing production coordinator/worker/runtime scripts provide service/runtime contracts, but they do not provide an authenticated browser session that executes Dashboard/Reports/Decision/Export and captures surface KPIs.

The existing report-execution E2E contract explicitly checks files/contracts such as execution gate, queue, renderers, download and durable worker adapter; it is therefore not evidence of browser-authenticated surface execution.

## Blocker classification

`RUNTIME BLOCKED — AUTHENTICATED SURFACE HARNESS ABSENT`

This is a tooling/infrastructure evidence gap, not a product PASS and not a Gross Profit truth closure.

## What is intentionally NOT claimed

- No mock result is accepted as surface output.
- No canonical query output is copied into a surface artifact.
- No static tenant filter is treated as tenant runtime isolation.
- No `fetchAll...` implementation is treated as export runtime proof.
- No CI PASS is treated as Runtime PASS.
- No Gross Profit `TRUTH-PROVEN` claim is made.

## Minimum reusable harness contract when available

The harness must execute two authenticated contexts against the same deterministic dataset:

```text
Tenant A -> Dashboard -> Reports -> Executive Decision -> Export
Tenant B -> Dashboard -> Reports -> Executive Decision -> Export
```

It must capture an immutable JSON artifact with:

```text
surface
tenant
date_from
date_to
revenue
cost
gross_profit
quantity
status
source/query identity
execution timestamp
```

Export must additionally capture:

```text
exported_rows
presentation_page_size
```

with the fixture requirement:

```text
exported_rows = 25
presentation_page_size = 20
```

The comparator must calculate expected values independently from the fixture and compare each actual surface result independently.

## Closure gate

The Gross Profit Cross-Surface Truth remains OPEN until all required authenticated surface artifacts exist and pass numeric comparison, tenant A/B isolation, date boundaries, NULL/missing-cost semantics, export completeness, regression, and exact-head CI.
