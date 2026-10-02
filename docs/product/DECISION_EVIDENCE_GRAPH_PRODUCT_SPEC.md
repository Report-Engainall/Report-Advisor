# NASR CAPTAIN — DECISION EVIDENCE GRAPH PRODUCT SPEC
## Date
2026-10-02

## Purpose
تحويل Smart Report من مجموعة نتائج منفصلة إلى سلسلة معرفية قابلة للتتبع من المصدر حتى النتيجة.

المسار الحاكم:

`SOURCE → TRUTH → EVIDENCE → CLAIM → SIGNAL → HYPOTHESIS → RECOMMENDATION → DECISION → APPROVAL → WORK → OUTCOME → LEARNING`

هذه الطبقة لا تستبدل canonical truth engine ولا Evidence Passport؛ بل تربط مخرجاتهما.

## 1. Core object
كل نتيجة مهمة تصبح node ذات هوية، وكل انتقال موثق يصبح edge.

### Node types
- SOURCE
- TRUTH
- EVIDENCE
- CLAIM
- SIGNAL
- HYPOTHESIS
- RECOMMENDATION
- DECISION
- APPROVAL
- WORK
- OUTCOME
- LEARNING

### Minimum node envelope
`NODE_ID`
`NODE_TYPE`
`TENANT_ID`
`SOURCE_HASH`
`IMPORT_JOB_ID`
`EVIDENCE_SNAPSHOT_ID`
`PROFILE_VERSION`
`CREATED_AT`
`STATUS`
`LIMITATIONS`

## 2. Claim semantics
Claim types remain explicit:

`OBSERVED`
`DERIVED`
`INFERRED`
`RECOMMENDED`
`DECISION`
`OUTCOME`

Every claim must expose:
- what is being asserted;
- exact source/evidence locators;
- derivation method;
- sample/time/entity scope;
- confidence state;
- limitations.

`INFERRED` never means proven causality.

## 3. Evidence edge
Permitted relationships include:
- `SUPPORTED_BY`
- `DERIVED_FROM`
- `EXPLAINS`
- `TRIGGERS`
- `RECOMMENDS`
- `DECIDES`
- `APPROVES`
- `CREATES_WORK`
- `RESULTS_IN`
- `LEARNED_FROM`

Every edge carries the identity of the parent and child and the evidence snapshot used to justify the relationship.

## 4. Fail-closed rules
- A recommendation without source-bound evidence is `REVIEW_REQUIRED`.
- A decision without a source-bound recommendation/evidence chain is `BLOCKED`.
- An outcome without observed readback is `INSUFFICIENT`.
- Unsupported causal language becomes `HYPOTHESIS`, never `FACT`.
- Missing fields reduce capability to `NOT_AVAILABLE` / `INSUFFICIENT_SAMPLE`.

## 5. Smart Report UX
The executive surface should let the user move:

`WHAT` → `WHY` → `PROOF` → `WHAT NEXT`

without losing `reportJobId + sourceHash`.

Every important sentence should have a lightweight “proof trail” affordance showing:
source → evidence → calculation → limitation.

## 6. Acceptance
For one real verified source, the system must be able to render a read-only graph/path showing:

`SOURCE → TRUTH → EVIDENCE → CLAIM → RECOMMENDATION → DECISION → APPROVAL → WORK → OUTCOME`

and preserve the same source/job/hash/snapshot identity through readback.

## 7. Non-goals
- no second truth engine;
- no fabricated impact/forecast/confidence;
- no requirement to create L7-L9 when no real workflow exists;
- no graph visualization solely for decoration.

## 8. Evolution
This graph becomes the common provenance backbone for archetypes, Smart Pack, decisions, exports, audit, and future learning.
