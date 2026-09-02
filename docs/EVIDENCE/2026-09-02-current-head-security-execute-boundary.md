# Current-Head Security Execute Boundary — 2026-09-02

## Exact source boundary
- Main source HEAD: `3fa9e9c839b1ef3d7d71c06f93b7a29c76de43d4`
- Closure branch boundary before this evidence commit: `76d12f2d1e0f19ec83544be6491d78d951493f79`
- Supabase project: `fnqbvfuwbdpwvhcgzksl`

## Verified database privilege boundary
A live Postgres privilege query was executed against every `SECURITY DEFINER` function in `public`.

Result:
- `anon EXECUTE = false` for every inspected `SECURITY DEFINER` function.
- `public EXECUTE = false` for every inspected `SECURITY DEFINER` function.
- Only the intended authenticated business RPCs retain `authenticated EXECUTE = true`.
- Internal worker/control-plane `SECURITY DEFINER` functions are not executable by `authenticated`, `anon`, or `public`.

The authenticated-callable set is limited to the application business path: decision/recommendation creation, approval, work-item lifecycle, outcomes, receivables reporting, alert mutation, and tenant context.

## Authorization review boundary
The authenticated-callable functions were inspected for tenant/user guards. The reviewed definitions use `auth.uid()` and/or `current_company_id()` and constrain target rows by the resolved company. Outcome/work-item paths additionally validate provenance, membership, assignee, approval state, or evidence ownership as applicable.

## Advisor interpretation
Supabase Security Advisor still reports the generic `authenticated_security_definer_function_executable` warning for these intentional authenticated RPCs. The live privilege query proves there is no anonymous/public execute exposure. Blanket revocation of authenticated EXECUTE would break the application RPC contract and was therefore not performed.

Leaked-password protection remains a separate Auth configuration item and is not falsely marked closed.

## Certification boundary
- Anonymous/public `SECURITY DEFINER` execution exposure: VERIFIED CLOSED.
- Authenticated business RPC authorization boundary: VERIFIED by live definition review.
- Supabase generic authenticated SECURITY DEFINER advisor warning: REVIEWED / INTENTIONAL, not a blanket-fix candidate.
- Production runtime certification: UNPROVEN.
- Authenticated E2E: UNPROVEN.
- Tenant A/B adversarial runtime proof: UNPROVEN.
- Backup/Restore/RPO/RTO/DR/Rollback: UNPROVEN.

No production mutation was performed.
