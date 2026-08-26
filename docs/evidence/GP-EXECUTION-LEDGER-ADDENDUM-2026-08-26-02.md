# Gross Profit Execution Ledger Addendum — 2026-08-26-02

## FIND
The canonical core compared `invoice_date` to a date-only `endDate` lexicographically. Timestamped invoices on the selected end calendar day could therefore be excluded. Quantity was also coerced from NULL to zero, weakening the financial completeness contract.

## ROOT CAUSE
Date-only and timestamp boundaries were treated as the same representation, and numeric coercion used zero defaults in the core aggregation.

## FIX
HEAD `7cedeb86b807d48e6ef447b1254a41aec800215b` introduced explicit ISO date-range parsing: a date-only end is an exclusive next-day instant, preserving the entire selected calendar day. Quantity is now nullable and NULL propagates to `INSUFFICIENT_DATA`. Duplicate line identity is detected when line IDs are available and prevents a potentially double-counted financial result.

## REGRESSION
HEAD `bc6a6cc685a631e6cd19479f5f05a78823585884` strengthened the independent oracle with multi-line, duplicate-line, NULL quantity, cancelled/draft, mixed-currency, missing-currency, boundary, and 25>20 export cases. The oracle does not import production financial functions.

## LIMITATION
This proves repository-level contracts only. Authenticated Dashboard/Reports/Executive/Export runtime remains unproven until the six CERT_* runtime inputs are available.

## CLASSIFICATION
Date boundary semantics: IMPLEMENTED + REGRESSION-PROVEN, runtime NOT PROVEN.
Quantity NULL semantics: IMPLEMENTED + REGRESSION-PROVEN, runtime NOT PROVEN.
Independent oracle coverage: REGRESSION-PROVEN pending exact-head CI.
