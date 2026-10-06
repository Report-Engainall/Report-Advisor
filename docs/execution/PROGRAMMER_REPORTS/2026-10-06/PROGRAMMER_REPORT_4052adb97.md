# Programmer Execution Report — 2026-10-06

## Exact state
- Branch: `feat/calculation-capability-engine-20261006`
- Product PR: #850
- Main/base: `a6d034e05172189d278e689eb01a0c86454f529e`
- Product-code head: `16f23f2724c7e570b24a7e46680a6aed558a9886`
- First-failure repair commit: `3addb06ab0c158d62f22e52717cf166c4a5cfc2a`
- Contract-proof commit: `4052adb9756ec59b48260a6a8207b35be3f05602`
- Current branch head while this report is created: `6417f53bb4f60f54c47ac1bc9df6cdf9fc43b986`

## User completion directive carried into persistent state
The product is not complete from file/function/test/build/API/E2E/48/48 PASS alone. Completion requires:

`IMPLEMENTED -> ORCHESTRATED -> EXECUTED ON REAL DATA -> PERSISTED -> READ BACK -> RENDERED IN UI -> PROVEN -> REAL BUSINESS VALUE`

The governing business flow is:

`REAL SOURCE -> TRUTH -> EVIDENCE -> SEMANTICS -> COMPUTE -> INTELLIGENCE -> EXPLANATION -> RECOMMENDATION -> DECISION -> APPROVAL -> WORK -> OUTCOME -> LEARNING -> BENCHMARK`

The required product scope remains the existing Intelligence/Calculation Kernel, Calculation Registry, business semantics and ontology, entity resolution, advanced/cause-aware/scenario/sensitivity/optimization intelligence, decision policy and recommendation compiler, evidence/provenance/replay, separate confidence dimensions and unknown states, forecast/ML governance, outcome learning, human-in-the-loop corrections, early warning/process/graph/drift, semantic diff, cross-source reconciliation, customer UI mirror, Smart Report, 48 archetypes as end-to-end business behavior, persistence/readback, browser proof, production proof, and exact SHA evidence.

Fail closed on unsupported capabilities with explicit `NOT_AVAILABLE`, `INSUFFICIENT_SAMPLE`, `REVIEW_REQUIRED`, or `BLOCKED` plus reasons and required evidence. LLM/AI is not Source Truth or calculation authority.

## First active failure
Exact-head Full Product Browser E2E run `37410218572` reached all canonical-heart regressions and the 48-archetype runtime contract, then failed first at:

`Resume and prove the real open report`

with:

`TEST_USER_A_EMAIL_MISSING`

The failure occurred before authenticated open-report readback.

## Root cause
`scripts/provision-e2e-actors.mjs` correctly created Actor D and provisioned D as the default member of the tenant owning the open report job. However, `persistActorCredentials()` had no explicit D branch and therefore routed every non-A/B/C actor to `TEST_APPROVER_EMAIL/PASSWORD`.

The workflow then attempted:

`TEST_USER_A_EMAIL = env.TEST_USER_D_EMAIL`

but `TEST_USER_D_EMAIL/PASSWORD` had never been persisted into the workflow environment.

This was a CI state-propagation defect, not a calculation, tenant-data, persistence-schema, or customer-data defect.

## Repair executed
1. `3addb06ab0c158d62f22e52717cf166c4a5cfc2a`
   - Added an explicit Actor D branch in `persistActorCredentials()`.
   - D credentials now persist to `TEST_USER_D_EMAIL` and `TEST_USER_D_PASSWORD`.

2. `4052adb9756ec59b48260a6a8207b35be3f05602`
   - Added contract assertions that D credential variables exist.
   - Locked the workflow handoff from Actor D to the open-report resume step.

No product UI, database schema, canonical truth, kernel calculation, or customer report data was changed by this repair.

## Real-data proof already available
Source: `تقارير ادارية.xlsx`
- Job: `16709d80-e012-40ef-9c12-6fd8255897f8`
- SHA: `sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313`
- Rows: 332
- Quality: 98
- Stock: 23075
- Demand: 324250
- Baseline coverage: 0.07116422513492675405
- Demand +15% coverage: 0.06188193489993630787
- Kernel anomalies: 3
- Scenarios: 1
- Sensitivities: 2
- Kernel status: REVIEW_REQUIRED
- Inventory monetary value: NOT_AVAILABLE because cost evidence is absent

Open real report:
- Job: `d074ad5c-70d4-4402-a763-01129786f392`
- Source hash: `sha256:f68f77f641cb54bbc30b9ece0ed9516700cb5ae48b6cbfb5b52317a8360faf10`
- Tenant/company: `f68a7e91-3c7e-46fb-97a8-e339bec04e13`
- File: `فواتير العملاء من تاريخ 01-01 حتى 30-08-2026.pdf`
- Supabase verification: completed + rendered
- Canonical rows: 6776
- Canonical commit records: 1

## Product / UX / UI delta
This first-failure repair adds no customer UI code. The existing product-code head already contains the customer-visible Kernel Decision Surface and Smart Report intelligence retention under REVIEW_REQUIRED. The UI remains subject to the mandatory mirror rule:

Real data -> real action -> loading/empty/error/retry/success -> readback -> permission -> audit/trace -> browser proof.

## Proof state
- Canonical-heart regression suite: PASS on the failing run before Resume.
- 48-archetype runtime contract: PASS on the failing run before Resume.
- Real source data/readback foundation: PROVEN.
- Browser Resume after repair: PENDING exact-head rerun.
- Authenticated Smart Report browser proof: PENDING.
- Smart Report refresh/readback: PENDING.
- Decision -> Approval -> Work -> Outcome -> Learning customer-run proof: PENDING.
- Source-bound Benchmark proof: PENDING.
- Exact-head real-source 48/48 matrix: PENDING final run.
- Final certification: PENDING.
- Product complete: NO.
- Sale ready: NO.

## Do not repeat
- Do not reuse Actor C for the open report.
- Do not hide missing workflow credentials with synthetic defaults.
- Do not change calculation/data code for a CI-only credential failure.
- Do not claim product completion from PASS-only contracts.
- Do not rebuild prior work.

## Next exact action
Consume the newest Full Product Browser E2E on the latest branch head. Fix only the first newly proven failure. Once Resume passes, continue directly through Smart Report browser proof, refresh/readback, Decision/Approval/Work/Outcome/Learning, Benchmark, exact-head 48/48 source matrix, deployed SHA and final certification.
