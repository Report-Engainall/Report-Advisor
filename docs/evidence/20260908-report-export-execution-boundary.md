# Report export / durable execution boundary — 2026-09-08

## Exact source boundary
- Base: `d0ddda19a21a341bc77931d14c2358545c6fd328`
- Branch: `fix/report-export-execution-integration-current-main`
- Boundary commit: `8aabc8b2f85c49b38e4187d715ca750f7fa86492`

## Finding
The browser Reports surface currently performs interactive exports by fetching canonical export rows and passing them to the presentation/download renderer. The durable production runner is a separate worker-side execution path with tenant-bound, lease-token-fenced store operations.

This is an architectural boundary, not a runtime certification result. The browser must not directly instantiate or call the durable worker store because its protected RPCs are service-role-only.

## Guard added
`scripts/check-report-export-execution-boundary.mjs` verifies:
- report pages retain the interactive export path;
- browser report code does not import the durable runner/worker adapter/store;
- the durable runner retains explicit tenant context;
- the durable adapter retains tenant and lease-token fencing;
- the download renderer remains free of worker-store coupling.

## Safety
- No Production mutation.
- No Staging mutation.
- No historical migration rewrite.
- No frozen RC mutation.
- No claim that interactive browser export is durable production execution.
- No claim of authenticated E2E or production certification.

## Next integration requirement
If product requirements demand durable/auditable export execution, the correct next step is a server-side authenticated enqueue boundary that creates a tenant-bound durable job and returns a run/evidence reference. The browser must consume that boundary; it must not receive service-role worker authority.
