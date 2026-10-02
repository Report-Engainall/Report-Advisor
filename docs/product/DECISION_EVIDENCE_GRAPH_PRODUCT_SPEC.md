# DECISION EVIDENCE GRAPH — PRODUCT CONTRACT
## 2026-10-02

### Product objective
Make every material Smart Report conclusion traceable from real source through evidence to decision and outcome:

`SOURCE → TRUTH → EVIDENCE → CLAIM → SIGNAL → HYPOTHESIS → RECOMMENDATION → DECISION → APPROVAL → WORK → OUTCOME → LEARNING`

This is an orchestration/provenance layer above canonical Truth and Evidence Passport. It is not a second truth engine.

### Claim classes
`OBSERVED | DERIVED | INFERRED | RECOMMENDED | DECISION | OUTCOME`

### Required identity
Every material node/claim carries:
`NODE_ID`, `NODE_TYPE`, `TENANT_ID`, `SOURCE_HASH`, `IMPORT_JOB_ID`, `EVIDENCE_SNAPSHOT_ID`, `PROFILE_VERSION`, `CREATED_AT`, `STATUS`, `LIMITATIONS`.

### Evidence relationships
`SUPPORTED_BY`
`DERIVED_FROM`
`EXPLAINS`
`TRIGGERS`
`RECOMMENDS`
`DECIDES`
`APPROVES`
`CREATES_WORK`
`RESULTS_IN`
`LEARNED_FROM`

### Fail-closed semantics
- Recommendation without source-bound evidence = `REVIEW_REQUIRED`.
- Decision without recommendation/evidence chain = `BLOCKED`.
- Outcome without observed readback = `INSUFFICIENT`.
- Unsupported causality remains `HYPOTHESIS`.
- Missing inputs reduce capability to `NOT_AVAILABLE` or `INSUFFICIENT_SAMPLE`.

### UX consequence
Every key statement in Smart Report should support a compact proof trail:

`WHAT → WHY → PROOF → WHAT NEXT`

The proof trail must retain `reportJobId + sourceHash` and expose source/evidence/calculation/limitation without forcing the user into raw technical data.

### Acceptance
For one real verified source, render and persist a read-only path:

`SOURCE → TRUTH → EVIDENCE → CLAIM → RECOMMENDATION → DECISION → APPROVAL → WORK → OUTCOME`

All nodes must retain the same tenant/source/job/snapshot lineage where applicable.

### Non-goals
No fabricated impact, confidence, forecast, causality, outcome, or workflow state. No decorative graph without traceability value.
