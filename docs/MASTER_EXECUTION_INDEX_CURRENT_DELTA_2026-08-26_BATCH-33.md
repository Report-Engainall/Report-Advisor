# Master Execution Index — Batch 33

## Exact state
- Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`
- Current Code HEAD: `a21869e5dc3c958143dbe188b187b2666d151483`
- PR: #45
- Branch: `wave/parallel-compat-closure-20260826`

## Failure Family: durable worker replay safety

### FIND
`runDurableProductionLifecycle` automatically retried a failed job after the execution path could already have crossed a stage side-effect boundary. A crash/error after `executeStage()` or during production lifecycle completion could therefore replay work without an explicit idempotency guarantee.

### ROOT CAUSE
Retry eligibility was based on job attempt count rather than whether the current execution had already entered a side-effect/recovery boundary. Checkpoint persistence and side effects are not one atomic transaction.

### FIX
- Added an explicit `recoveryBoundaryStarted` state.
- Every stage execution receives a deterministic idempotency key: `jobId:stage:sourceHash`.
- Failures after stage execution/checkpoint boundary are classified `MANUAL_RECONCILIATION_REQUIRED`.
- Automatic retry remains available only when the failure occurred before entering a side-effect boundary.
- The production lifecycle + completion boundary is also fail-closed against automatic replay.

### REGRESSION
`check-durable-production-runner.mjs` now requires:
- idempotencyKey propagation;
- recovery boundary tracking;
- explicit manual-vs-auto recovery classification;
- no auto-retry when `unsafeReplay` is true.

### STATUS
**IMPLEMENTED / REGRESSION ENFORCED / CI PENDING**.

## Exact-head CI
Current HEAD is `a21869e...`. At the time of this index update, GitHub Actions exact-head query was not yet observable for the newest commits. Therefore no PASS is claimed for this HEAD.

Historical exact-head PASSes on `8e84ef2...` remain historical only.

## Runtime / LIVE / Production
- Runtime: NOT VERIFIED.
- LIVE: REQUIRED for real worker crash/restart/replay evidence.
- Production certification: NOT CLAIMED.

## Remaining active fronts
1. Exact-head CI and real compiler feedback for the report/worker batches.
2. Full canonical export migration; current-page export remains explicitly scoped.
3. Receivables/profitability browser aggregation closure.
4. BI/Decision/Analytics cross-surface equivalence.
5. Tenant sibling sweep for background execution, Storage, Realtime and AI/vector.
6. Runtime crash/recovery evidence and real idempotent replay tests.
