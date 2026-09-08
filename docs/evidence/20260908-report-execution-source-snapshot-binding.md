# Report Execution Source Snapshot Binding — 2026-09-08

## Exact source boundary
- Base main: `d9962a2cc624272897c77b04036c703889796633`
- Branch: `feat/report-execution-source-snapshot-binding-current-main`
- Implementation commit: `c6e699fad8b48f33fb989dd030e6c32c81e2d705`
- Contract guard commit: `eae2b64acf1f01b33ddc5b5270b438891aed5755`
- Guard: `scripts/check-report-execution-source-binding.mjs`

## Closure delivered
- Durable production execution can resolve its report rows through an explicit `loadSourceSnapshot` boundary.
- The loaded source hash is compared with the durable job's expected hash before stage execution continues.
- Empty source hashes are rejected fail-closed.
- Tenant identity remains fenced before source processing.
- Stage execution receives the verified snapshot rows rather than an independently supplied row array when the loader is present.
- Completion evidence records the verified source row count.

## Security / truth boundary
This change does not weaken tenant isolation, RLS, financial guards, service-role boundaries, or Production aliases. It does not fabricate a source snapshot when the loader is absent; the existing compatibility path remains explicitly preserved.

## Certification boundary
Source-level closure only. This does **not** certify a live worker consumer, authenticated E2E, production runtime, tenant A/B adversarial runtime, or successful artifact rendering. Those require runtime evidence and remain separate gates.
