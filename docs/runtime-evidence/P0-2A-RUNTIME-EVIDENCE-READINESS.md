# P0-2A — Runtime Evidence Readiness

Status: READY FOR ENVIRONMENT / P0-2 BLOCKED

This document defines the non-production runtime environment and evidence contract required to execute P0-2 Tenant A/B live database isolation. **READY does not mean LIVE-VERIFIED.**

## Environment contract

| Component | Requirement | Classification |
|---|---|---|
| Supabase project | Dedicated staging/test project; must not be production | REQUIRED |
| Postgres | Real deployed database with current migrations | REQUIRED |
| Auth | Email/password or equivalent test identities; no real users | REQUIRED |
| Storage | Same staging project when storage is enabled by the release | OPTIONAL for P0-2 DB-only; required for later storage tests |
| Realtime | Same staging project when enabled by the release | OPTIONAL for P0-2 DB-only; required for later realtime tests |
| RPC / Edge Functions | Deployed versions matching release under test | REQUIRED for RPC matrix |
| Workers / queues | Reachable if RPCs enqueue tenant-owned jobs | OPTIONAL for P0-2; required for worker closure |
| Environment variables | URL/public client configuration available to harness; secrets remain in environment | REQUIRED |
| Seed data | Deterministic, sentinel-only, resettable | REQUIRED |
| Test users | User A and User B with exclusive tenant membership | REQUIRED |
| Test tenants | Tenant A and Tenant B | REQUIRED |

## Safety requirements

1. The harness must resolve an explicit environment classification before any write test.
2. `RUNTIME_EVIDENCE_ENV` must be `staging` or `test` for destructive tests.
3. `production`, `prod`, an unknown value, or a missing value causes an immediate abort.
4. Production writes are never permitted by these scripts.
5. No password, access token, service-role key, PII, or secret is written to evidence.
6. Sentinel identifiers are deterministic and non-sensitive.

## Required runtime identities

- Tenant A: `TENANT_A_RUNTIME_SENTINEL_2026`
- Tenant B: `TENANT_B_RUNTIME_SENTINEL_2026`
- User A: dedicated test identity associated only with Tenant A
- User B: dedicated test identity associated only with Tenant B

The actual user identifiers are environment-owned values and must not be committed to this repository.

## Seed lifecycle

`CREATE -> ASSERT -> RESET -> CLEANUP`

Seed operations must be idempotent. Cleanup must target only sentinel records created by this harness. The harness must refuse to operate outside staging/test.

## Runtime evidence state model

- `READY`: implementation is prepared to run when the environment exists.
- `BLOCKED`: required runtime capability/environment is unavailable.
- `NOT READY`: harness or required contract is incomplete.

These states are separate from requirement verification states. A readiness artifact must never promote P0-2 to `RUNTIME-EVIDENCED`, `LIVE-VERIFIED`, or `PRODUCTION-CERTIFIED`.

## Release binding

Every runtime evidence record must bind to:

- deployed release identifier
- exact commit SHA
- environment name
- timestamp
- authenticated actor
- authorized tenant
- target tenant

The harness must refuse to emit a successful runtime result when identity, tenant authority, target tenant, release, or environment cannot be established.
