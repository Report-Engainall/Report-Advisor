# Import Resolution Preview — Runtime Hardening

Date: 2026-09-09

## Verified on Staging

Project: `fnqbvfuwbdpwvhcgzksl`

The tenant-scoped `public.import_resolution_preview(text,jsonb)` function was hardened and verified after migration.

Verified properties:

- `SECURITY INVOKER` (`prosecdef=false`)
- `anon` has no EXECUTE
- `authenticated` has EXECUTE
- requires `public.current_company_id()` tenant context
- normalizes incoming JSON object keys before identity lookup
- preserves the 500-row batch limit
- keeps customer name fallback alongside customer code lookup

The Staging migration ledger records the applied migration as:
`20260908214908 / harden_import_resolution_preview_normalized_input`.

## Operational state

At verification time:

- processing import jobs: `0`
- tenantless active queued/processing jobs: `0`

## Why this matters

The browser import parser can preserve source headers such as `SKU`, `Invoice Number`, or other separator/case variants while the canonical resolver operates on mapped fields. The preview boundary now normalizes those incoming JSON keys before tenant-scoped candidate retrieval, reducing a false-new classification caused solely by source header spelling.

## Nonclaims

This is a Staging database/function verification. It is not authenticated browser E2E, live Tenant A/B adversarial isolation, or Production certification. The frozen RC and Production aliases were not modified.
