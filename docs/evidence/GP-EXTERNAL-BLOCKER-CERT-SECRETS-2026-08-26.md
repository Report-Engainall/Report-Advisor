# GP External Blocker — Authenticated Runtime Certification

## BLOCKER ID
`GP-RUNTIME-CERT-001`

## EXACT REQUIRED INPUTS
- `CERT_SUPABASE_URL`
- `CERT_SUPABASE_ANON_KEY`
- `CERT_TENANT_A_ID`
- `CERT_TENANT_B_ID`
- `CERT_USER_A_JWT`
- `CERT_USER_B_JWT`

## EXACT WORKFLOWS
- `.github/workflows/gross-profit-exact-head.yml`
- `.github/workflows/phase-e-live-certification.yml`

## ENVIRONMENT / JOB
- Exact-head job: `verify`
- Phase-E live certification job: repository workflow's live certification job
- Current secret source observed by Actions: `Actions`

## FAILURE SIGNAL
The runtime certification step cannot establish authenticated tenant/surface evidence when the CERT_* values are unavailable. Static workflow mapping is present, but secret values themselves are intentionally unreadable through repository tooling.

## VERIFIED WITHOUT SECRET VALUES
- All six exact secret names are referenced in the committed workflow.
- The exact-head checkout asserts `git rev-parse HEAD == GITHUB_SHA`.
- No workflow/job `environment:` binding is present in the Phase-E workflow inspected by the static audit.
- Phase-E is push/dispatch topology, not `pull_request`.
- Static audit intentionally leaves authenticated runtime and cross-surface equivalence `NOT PROVEN`.

## CANNOT BE VERIFIED HERE
- Whether the repository Actions secret store currently contains non-empty values.
- Whether the supplied credentials authenticate successfully.
- Tenant A/B runtime isolation.
- Live Dashboard/Reports/Executive/Export values.
- 25-row XLSX artifact from a real tenant database.

## OWNER ACTION REQUIRED
Populate the six named repository Actions secrets with valid certification-only values and ensure the certification workflow is permitted to access them.

## UNBLOCK CONDITION
A new exact-head run reaches the `Gross Profit runtime certification` step with all six inputs non-empty and produces sanitized, reproducible runtime artifacts for Tenant A and Tenant B. No secret/JWT value may be written to logs or artifacts.

## STATUS
`EXTERNAL BLOCKER — AUTHENTICATED RUNTIME`

This record does not claim that the secrets are absent; it records only that their values cannot be verified by the available repository interface and the runtime proof therefore cannot be executed here.
