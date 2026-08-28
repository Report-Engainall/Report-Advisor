# P0-2 Runtime Evidence Index

This index tracks **evidence readiness**, not live verification.

## Current state

- P0-2A: `READY`
- P0-2: `BLOCKED`
- Live database verification: `NOT RUN`

## Readiness matrix

| Capability | Readiness | Live claim |
|---|---|---|
| Safe staging/test environment guard | READY | NOT VERIFIED |
| Deterministic Tenant A/B seed | READY | NOT VERIFIED |
| Authenticated User A/B harness | READY | NOT VERIFIED |
| Database read isolation matrix | READY | NOT VERIFIED |
| Database write isolation matrix | READY | NOT VERIFIED |
| Child-table matrix | READY | NOT VERIFIED |
| RPC isolation matrix | READY | NOT VERIFIED |
| Client-supplied tenant attack cases | READY | NOT VERIFIED |
| Cross-tenant inference matrix | READY | NOT VERIFIED |
| Evidence record schema | READY | NOT VERIFIED |

## Live evidence rule

A row can only move from `READY` to `LIVE-VERIFIED` after execution against a real authenticated staging/test deployment produces sanitized evidence bound to environment, release, exact commit SHA, actor, authorized tenant, target tenant, operation, expected result, actual result, row counts, and evidence reference.

No CI result, static policy inspection, fixture, seed definition, or documentation can promote a row to `LIVE-VERIFIED`.

## External prerequisites

1. Dedicated Supabase staging/test project.
2. Current release migrations deployed there.
3. Two dedicated authenticated test users, one per tenant.
4. Their user IDs supplied only through environment variables.
5. Supabase URL/public key and test passwords supplied only through environment/CI secrets.
6. Permission to create/reset sentinel records in the staging/test project.
7. RPCs/functions deployed at the release SHA under test.
8. For later surfaces, Storage/Realtime/workers enabled in the same safe environment.
