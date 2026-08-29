## Deep closure — watched report file tenant boundary
Finding: `record_watched_report_file(p_folder_id,...)` was SECURITY DEFINER and derived the stored `company_id` from the caller, but did not independently verify that the caller's authoritative tenant owned the supplied `folder_id`. A caller able to name another tenant's folder UUID could therefore reach the privileged function boundary with a cross-tenant reference.

Classification: `SECURITY/TENANT + WATCHER INTEGRITY`

Root cause: the function trusted the child row's derived company context without validating the referenced folder's company context.

Fix applied to the certification Supabase project as `harden_watched_report_file_tenant_boundary` and mirrored canonically in `supabase/migrations/20260829180903_harden_watched_report_file_tenant_boundary.sql`:
- requires authenticated tenant context;
- rejects blank identity fields;
- rejects negative/NULL file size;
- validates the accepted watcher-file state set;
- verifies `watched_report_folders.id` belongs to `current_company_id()` before INSERT/UPDATE;
- fails closed with `FOLDER_NOT_FOUND_OR_FORBIDDEN` on cross-tenant or missing folders.

Adversarial verification:
- created two temporary folders under the two existing certification tenants inside a transaction;
- authenticated as the first tenant;
- attempted to record a file against the second tenant's folder;
- the call was rejected with the expected `FOLDER_NOT_FOUND_OR_FORBIDDEN`;
- transaction rolled back; no test data persisted.

Status: `PRODUCTION DB MUTATED FOR PROVEN DEFECT → ADVERSARIAL VERIFIED`; exact-head CI/live authenticated evidence still required.

## DB migration drift finding
Live database currently contains **62** tracked migrations after the latest hardening migration, while the repository routing closure history is still being reconciled against all later production hardening migrations applied during the current execution wave.

Classification: `REPOSITORY/PRODUCTION SCHEMA DRIFT`

Impact: future fresh environments cannot be assumed equivalent to the currently hardened production database until the later applied migrations are restored into repository history and exact-head certification includes them.

Status: `OPEN / HIGH PRIORITY`; do not claim fresh-environment equivalence until reconciled.

## Security advisor finding — SECURITY DEFINER review
A fresh Supabase security-advisor scan after the watcher hardening still reports authenticated EXECUTE on multiple SECURITY DEFINER functions, including `claim_report_execution_job`, `record_watched_report_file`, `current_company_id`, decision approval/outcome functions, and trust/eligibility predicates. These are not blindly revoked because several are deliberate privileged boundaries and revocation could break runtime paths. The next action is consumer-by-consumer classification (browser, worker, edge/server, external) followed by least-privilege grants or relocation where justified.

Additional advisor finding: leaked-password protection is disabled. This is a product/security configuration gap and remains NOT PROVEN as closed because no safe account-level mutation path was exercised in this cycle.

## Current cycle evidence
- New migration applied and tracked in Supabase as version `20260829180903`.
- Current live migration count: **62**.
- Vercel deployment `dpl_9XiBy6ieMGwZRWCYg6CfX2ky8KJZ` is READY and is tied to exact Git SHA `238c63ba129e5da3792adca94146187dd743d92f`.
- Vercel build error scan contains no build failures; only npm allow-scripts and Browserslist warnings.
- Vercel runtime error scan for the selected 24h window reports no runtime errors.
- Exact-head GitHub Actions for `238c63ba129e5da3792adca94146187dd743d92f` were not yet observed at the time of this index update; no PASS is claimed.
