# Report-Advisor — A→G Deep Execution Ledger

## Non-negotiable closure rule

A gate is closed only when its required surfaces have static/integration coverage **and**, where runtime is required, reproducible runtime evidence exists. A contract, migration, route, or test file alone never becomes runtime evidence.

## Gates

| Gate | Scope | Static/integration objective | Runtime objective | Current state |
|---|---|---|---|---|
| A | Core Integration & Security | Inventory, DB dependencies, tenant/RLS, truth boundaries | Live isolated tenant evidence | GATED / LIVE REQUIRED |
| B | Data & Ingestion | Import contracts, RPC signatures, business keys, Onyx | Real file → canonical DB → reconciliation → audit → recovery | GATED / LIVE REQUIRED |
| C | Reports & Analytics | Report execution, KPI truth, metric SSOT | Live report/query evidence | GATED / LIVE REQUIRED |
| D | Decision & AI | Decision, scenario, forecast, evidence contracts | Secure retrieval + decision/outcome evidence | GATED / LIVE REQUIRED |
| E | Runtime & Automation | Watched reports, automation, K/L runtime contracts | Worker/job/action evidence | GATED / LIVE REQUIRED |
| F | Security / Resilience / Scale | resilience, cache, concurrency, performance gates | adversarial/load/recovery evidence | GATED / LIVE REQUIRED |
| G | Production Certification | certification and release gates | live deployment + golden scenarios + certification artifact | GATED / LIVE REQUIRED |

## Evidence ledger requirements

Every critical capability must record:

`Requirement → Implementation → Contract → Test → Integration Result → Runtime Evidence → Certification Status`

Permitted states:

`UNKNOWN → INVENTORIED → IMPLEMENTED → GATED → INTEGRATED → RUNTIME-EVIDENCED → PRODUCTION-CERTIFIED`

## Safety rules

- No fabricated IDs, rows, metrics, runtime results, or certification claims.
- No parallel Metric/Truth, Import, Reconciliation, Evidence Graph, Parser/OCR, Decision, or RLS engines.
- Existing mainline fixes are dependencies, not duplicate implementations.
- Every code fix requires regression coverage for affected paths.
- Rollback, retry, idempotency, concurrency, quarantine, and audit are mandatory for ingestion closure.
- `COMPLETE` is not a certification state.

## Current confirmed constraints

- PR #18 remains draft/open/unmerged and targets `phase-8-9-completion`.
- The branch is intentionally not rebased or merged.
- Runtime evidence remains unproven until authoritative live systems produce reproducible artifacts.
- Import RPC/application signature drift must remain a first-class Phase B gate.
