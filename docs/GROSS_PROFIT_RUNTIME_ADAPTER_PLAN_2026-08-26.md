# Gross Profit Runtime Adapter — 2026-08-26

## Starting point

The implementation branch starts exactly from `9c2ab29cbe1145fc7ea37382d942fcd975ce1647`.

## Constraint

The adapter must not import `canonicalFinancialQueries`, `canonicalFinancialTruth`, or `semanticMetrics` into its independent comparator.
It must use the existing authenticated live certification configuration and real Supabase boundary.

## Current live infrastructure

Required runtime inputs are supplied through the existing certification environment:

- `CERT_SUPABASE_URL`
- `CERT_SUPABASE_ANON_KEY`
- `CERT_TENANT_A_ID`
- `CERT_TENANT_B_ID`
- `CERT_USER_A_JWT`
- `CERT_USER_B_JWT`

No JWT or secret is persisted by the adapter.

## Important limitation

The first implementation probe intentionally targets the authenticated `sale_items` data boundary. It is **not yet surface proof**. A raw data-boundary result cannot be labeled Dashboard/Reports/Decision/Export evidence.

Therefore the following remain `NOT PROVEN` until the actual production consumer entry points are executed:

- Dashboard
- Reports
- Executive Decision
- Export

Likewise Analytics and BI remain `NO INDEPENDENT GP CONSUMER FOUND / NOT PROVEN` unless an independent consumer is identified.

## Required next implementation step

Wire the existing live authenticated identity into each real consumer entry point (or its existing callable query/service boundary) and capture the actual returned surface result. The independent comparator must consume only fixture/domain values.

No new browser framework is justified by the evidence so far.
