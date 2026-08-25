# Phase A/B Execution Ledger — 2026-08-25

## Scope

This ledger is the execution gate for the current two-package closure:

- **A — Core Integration & Security Closure**
- **B — Data & Ingestion Closure**

The 27-domain checklist remains the detailed audit map; A/B are the execution packages.

## Evidence rule

`IMPLEMENTED` is not `INTEGRATED`.
`INTEGRATED` is not `TESTED`.
`TESTED` is not `RUNTIME-EVIDENCED`.
`RUNTIME-EVIDENCED` is not `PRODUCTION-CERTIFIED`.

No package is CLOSED until its required runtime evidence exists.

## A — Core Integration & Security Closure

| Surface | Current state | Evidence required to close |
|---|---|---|
| Repository/source inventory | INVENTORIED | 100% surface coverage |
| Supabase RPC caller/signature coverage | IMPLEMENTED | CI execution + zero unexplained drift |
| Import RPC signature compatibility | BLOCKED | Resolve caller/schema truth on primary integration path |
| Tenant context in import RPCs | IMPLEMENTED/GATED | Live isolated Supabase execution |
| Auth → tenant resolution | IMPLEMENTED/GATED | Runtime tenant/RLS evidence |
| Cross-tenant read/write/RPC isolation | LIVE REQUIRED | Two-company adversarial test evidence |
| TypeScript | MAINLINE DEPENDENCY | Primary path/PR #20 resolution + passing CI |
| ESLint | MAINLINE DEPENDENCY | Primary path/PR #20 resolution + passing CI |
| Build | MAINLINE DEPENDENCY | Primary path/PR #20 resolution + passing CI |

### A gate

A is **not closed** until static coverage, integration compatibility, tenant security, and required runtime evidence are all present.

## B — Data & Ingestion Closure

| Surface | Current state | Evidence required to close |
|---|---|---|
| Canonical import boundary | IMPLEMENTED | Integration execution |
| Governed RPC write boundary | IMPLEMENTED | CI regression |
| Import transaction lifecycle | IMPLEMENTED/GATED | Live job lifecycle evidence |
| Business-key/idempotency | IMPLEMENTED/GATED | Real repeated-import evidence |
| Concurrency protection | IMPLEMENTED/GATED | Concurrent real-import evidence |
| Null/preserve policy | IMPLEMENTED/GATED | Real-file regression evidence |
| Quarantine/failure handling | GATED | Live failure/quarantine evidence |
| Lineage/audit | GATED | Persisted row/file evidence |
| Real-file E2E | LIVE REQUIRED | Upload → parse → map → validate → reconcile → commit → audit |
| Retry/rollback/recovery | LIVE REQUIRED | Reproducible failure/retry/rollback evidence |
| Supabase persistence | LIVE REQUIRED | Authoritative database evidence |
| Onyx real-file certification | LIVE REQUIRED | Real Onyx corpus + expected canonical outputs |

### B gate

B is **not closed** by a static contract or a single fixture. It requires real-file E2E, persistence, idempotency/concurrency, failure recovery, lineage and Onyx evidence.

## Current blockers

1. `import_upsert_product` caller/signature drift (`p_is_active` is supplied by `canonical-commit.ts` but is absent from the authoritative product RPC signature in the inspected migration).
2. Live Supabase tenant/RLS execution is required for certification.
3. Primary/mainline TypeScript/ESLint/Build work overlaps PR #20 and must not be duplicated on this branch.
4. Real-file and real-Onyx runtime evidence is not available from static repository inspection.

## Change-control rules

- No merge.
- No rebase.
- No `main` changes.
- No parallel Core/Metric/Import/Reconciliation/Evidence/Document engines.
- No fabricated runtime evidence or business data.
- Existing mainline fixes are recorded as dependencies rather than copied.

## Current branch

`parallel/secondary-agent-evidence-ux`

## Target base

`phase-8-9-completion`
