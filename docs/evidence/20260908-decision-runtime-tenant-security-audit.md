# Decision Runtime Tenant Security Audit — 2026-09-08

## Scope

Staging Supabase project `fnqbvfuwbdpwvhcgzksl` was inspected for the authenticated Decision lifecycle and its tenant boundaries. This is an operational database audit; it is not an authenticated browser E2E certification.

## Findings

### SECURITY DEFINER boundaries

The following write/lifecycle functions currently use `SECURITY DEFINER`:

- `create_runtime_decision`
- `request_decision_approval`
- `create_decision_work_item`
- `start_decision_work_item`
- `complete_decision_work_item`
- `record_decision_outcome`
- `finalize_runtime_decision`
- `notify_decision_work_item`

Each inspected definition explicitly sets `search_path` to `pg_catalog` and calls tenant context through `public.current_company_id()`. The inspected functions also require `auth.uid()` and apply `company_id = v_company` predicates before reading or mutating tenant records.

`complete_decision_work_item` and `record_decision_outcome` additionally verify that evidence/work-item references belong to the current tenant before writing outcome state.

### RLS

The inspected Decision tables have tenant policies for `authenticated`:

- `business_intelligence_decisions`
- `decision_approvals`
- `decision_outcomes`
- `decision_work_items`
- `alerts`

The policies use `current_company_id()` and, where applicable, `WITH CHECK` tenant enforcement. `decision_work_items` additionally requires the referenced decision to belong to the same tenant and be `APPROVED` for writes.

### Execute privileges

The inspected Decision write functions have `anon` execution disabled and `authenticated` execution enabled. This was verified through PostgreSQL function privileges in Staging.

## Security decision

No blind conversion from `SECURITY DEFINER` to `SECURITY INVOKER` was made. The current Definer functions have explicit tenant and authenticated-user gates, and changing their execution mode without first proving equivalent table privileges/RLS behavior could break the Decision lifecycle.

The correct remaining certification step is authenticated adversarial execution with Tenant A and Tenant B identities, verifying that cross-tenant decision IDs, work-item IDs, assignees, evidence snapshot IDs, and outcome fingerprints are rejected.

## Nonclaims

- No authenticated browser E2E PASS is claimed.
- No live Tenant A/B isolation PASS is claimed.
- No Production Runtime certification is claimed.
- No Backup/Restore or Rollback certification is claimed.
