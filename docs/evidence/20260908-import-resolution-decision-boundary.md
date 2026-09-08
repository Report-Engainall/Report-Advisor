# Import Resolution Decision Boundary — 2026-09-08

## Scope

This closure records the current authorization boundary for universal import resolution.

## Verified source contract

- `new` is the only resolution outcome permitted to cross the canonical write boundary.
- `skip_exact`, `candidate_duplicate`, and `conflict` are blocked from canonical writes.
- Every permitted resolution must use `action=write_new` and `allowedToWrite=true`.
- The server-side governed RPC re-checks tenant context, identity keys, duplicate identities within the batch, and existing tenant rows before delegating to the lineage-aware writer.

## Important product truth

The current review panel is a presentation layer. It exposes the four resolution states but does **not** yet provide a complete row-level exclusion/selection workflow. Therefore this evidence does not claim that interactive duplicate/conflict decisions are closed.

## Staging verification

The governed RPC was verified in the Staging database as `SECURITY INVOKER`, with `anon` execution denied and `authenticated` execution granted. Customer identity namespaces distinguish coded customers from name-fallback customers.

## Non-claims

- No authenticated browser E2E PASS is claimed.
- No Tenant A/B live isolation PASS is claimed.
- No Production runtime certification is claimed.
- No backup/restore or rollback certification is claimed.
