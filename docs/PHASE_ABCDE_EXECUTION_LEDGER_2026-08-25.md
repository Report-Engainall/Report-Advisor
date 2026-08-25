# Report-Advisor — A→E Execution Ledger

Date: 2026-08-25
Branch: `parallel/secondary-agent-evidence-ux`
Base target: `phase-8-9-completion`

## Governing rule

Static implementation, contracts, migrations and tests do **not** become Runtime Evidence by themselves. A capability may move through:

`INVENTORIED → IMPLEMENTED → INTEGRATED → TESTED → RUNTIME-EVIDENCED → PRODUCTION-CERTIFIED`

`UNKNOWN`, `GATED`, `BLOCKED`, and `LIVE REQUIRED` are retained whenever authoritative runtime proof is unavailable.

## A — Core Integration & Security

Static closure surfaces already represented in the repository:

- auth/tenant convergence
- tenant security contract
- global tenant RLS contract
- import RPC tenant context
- quality workflow contract
- import RPC signature audit

Runtime gates still required:

- deployed Supabase schema verification
- two-company adversarial tenant isolation
- real RPC invocation against deployed signatures
- storage/realtime isolation where applicable

**Status: GATED / LIVE REQUIRED**

## B — Data & Ingestion

Static closure surfaces:

- import transaction contract
- import runtime governance
- business-key contract
- direct-write guard
- canonical import mapping
- Onyx adapter contract
- operational file pipeline

Required runtime proof:

`real file → parse → map → validate → reconcile → commit → persist → audit → retry/rollback evidence`

Additional non-negotiable gates:

- idempotency
- concurrency
- partial failure
- quarantine
- lineage
- tenant context
- RPC caller/signature parity

Known blocker to resolve on the authoritative path: `import_upsert_product` caller/signature drift involving `p_is_active`.

**Status: GATED / MAINLINE DEPENDENCY + LIVE REQUIRED**

## C — Reports & Analytics

Static surfaces:

- report truth
- report execution foundation/E2E contracts
- metric single-source-of-truth
- data-quality projections
- inventory intelligence
- demand velocity

Runtime proof required:

`KPI definition → authoritative query → result → UI → export → reconciliation evidence`

**Status: GATED / LIVE REQUIRED**

## D — Decision & AI

Static surfaces:

- decision intelligence closure
- scenario engine
- forecast calibration
- trust/evidence runtime contract
- safe metrics

Runtime proof required:

`truth data → analysis → confidence → explanation → decision → action → outcome`

AI must use secure tenant-scoped retrieval and must not fabricate evidence.

**Status: GATED / LIVE REQUIRED**

## E — Runtime & Automation

Static surfaces:

- watched-report pipeline
- automation executor contract
- operational resilience
- Phase K runtime contract
- Phase L runtime contract
- resumable report execution

Runtime proof required:

`input/job → worker → persistence → retry/lease → result → evidence → operator action`

**Status: GATED / LIVE REQUIRED**

## Evidence requirements for every phase

For every capability, record:

`Requirement | Implementation | Contract Test | Integration Test | Runtime Artifact | Security Evidence | CI Run | Status`

No phase may be declared closed solely because its static contract exists.

## Current certification counts

- Runtime-EVIDENCED: **0 certified surfaces in this ledger**
- Production-CERTIFIED: **0**
- Live-required gates: **present across A–E**

## Execution order

1. Close A static/integration gaps without duplicating mainline work.
2. Close B import/Onyx integration and recovery gates.
3. Close C report/KPI truth and execution gates.
4. Close D decision/forecast/AI evidence gates.
5. Close E automation/K/L runtime gates.
6. Only then execute F security/resilience/scale and G final certification.
