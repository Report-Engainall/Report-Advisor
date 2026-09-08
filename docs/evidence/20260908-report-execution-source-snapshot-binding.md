# Report Execution Source Snapshot Binding — 2026-09-08

## Exact source boundary
- Base main: `d9962a2cc624272897c77b04036c703889796633`
- Branch: `feat/report-execution-source-snapshot-binding-current-main`
- Latest branch HEAD: `0de4cf3d7effd4b04604b4357df4be3370d3e4a7`
- Verified production entry point: `src/lib/report-execution/verified-production-runner.ts`
- Guards: `scripts/check-report-execution-source-binding.mjs`, `scripts/check-report-execution-source-snapshot-identity.mjs`, `scripts/check-verified-production-runner.mjs`

## Closure delivered
- Durable production execution has an explicit `loadSourceSnapshot` boundary.
- The loaded source hash is compared with the durable job's expected hash before stage execution continues.
- Empty source hashes and empty authoritative current-row snapshots are rejected fail-closed.
- Tenant identity remains fenced before source processing.
- Stage execution receives verified snapshot rows.
- The production lifecycle consumes the verified snapshot's authoritative `currentRows` when the loader is used.
- Completion evidence preserves `sourceSnapshotId`, source row count, and authoritative current-row count.
- A dedicated verified production entry point now requires an explicit `sourceSnapshotId` and a source loader, so a production caller cannot accidentally enter through the compatibility path without a snapshot identity.

## Security / truth boundary
This change does not weaken tenant isolation, RLS, financial guards, service-role boundaries, or Production aliases. The legacy compatibility path remains preserved for callers that are not yet migrated; the new verified entry point is the intended production boundary.

## Certification boundary
Source-level closure only. This does **not** certify a live worker consumer, authenticated E2E, production runtime, tenant A/B adversarial runtime, or successful artifact rendering. Those require runtime evidence and remain separate gates.
