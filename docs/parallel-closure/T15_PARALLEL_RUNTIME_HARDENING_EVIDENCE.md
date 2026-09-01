# T15 — Parallel Runtime Hardening Evidence

Date: 2026-09-01

## Exact finding

Final Certification run `33522211063` checked out exact SHA `f2e20bd17f90725264fc1897009c067f83f770c6` and failed at `scripts/check-parallel-runtime-hardening.mjs`.

The failure was in the checker fixture, not the application runtime: `assertTenantBoundary()` unconditionally asserted `true`, while the adversarial `tenant-a` → `tenant-b` case must assert `false`. The terminal-guard fixture also used an identical next state despite the helper requiring a distinct transition.

## Repair

The checker now:

- accepts an explicit expected tenant-scope result;
- asserts same-tenant access as `true`;
- asserts cross-tenant access as `false`;
- keeps exact 40-hex SHA evidence validation;
- uses a distinct terminal next-state fixture so the terminal duplicate invariant is tested without a tautological assertion.

## Evidence before repair

- Quality run `33522210968` / job `99904025614`: **SUCCESS** on exact SHA `f2e20bd...`.
- 20-stage readiness: **20/20 PASS**.
- Final Execution Batch: **30/30 PASS**.
- P0 family: **13/13 PASS**.
- P1 family: **8/8 PASS**.
- Typecheck, lint, build, performance budget: **PASS**.
- Global tenant RLS: **22 tenant tables / 139 migrations**.
- Document Intelligence hardening: **20/20 PASS**.

## Current execution head

`911814867a2a6104a20a214a85912e4f44f53db3`

The branch currently points to this SHA. No CI result exists yet for this new SHA; therefore this repair is not certified until exact-head CI executes and passes.

## Operational boundary

This repository-level repair does not certify live production. Authenticated runtime, real Tenant A/B isolation, backup/restore, rollback, live deployment identity, and business acceptance remain separate certification evidence requirements.
