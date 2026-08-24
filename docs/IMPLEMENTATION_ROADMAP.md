# Report-Advisor implementation sequence

## Completed in current foundation branch
1. Tenant isolation primitives and RLS.
2. Membership privilege hardening.
3. Trial/entitlement model with direct client mutation locked.
4. Inventory liquidity/velocity engine.
5. Demand/reorder/stockout calculations.
6. Cash-flow/liquidity decision engine.
7. Decision/action ledger.
8. Report Studio persistence model.
9. Tenant-safe report execution ledger.
10. Usage metering ledger.
11. Tenant bootstrap before tenant-scoped queries.
12. Report Studio UI and Decision Automation UI.
13. Trial status UX.
14. Query planner hardening with canonical query fingerprints and tenant-scope invariants.
15. Demand-series utility layer for reusable deterministic velocity/peak/trend calculations.
16. Alternative-group demand runtime contract and grouped inventory/demand decision calculations.
17. Unified operational decision-chain engine connecting demand, requests, sellable stock, alternatives, stockout/lost-sales exposure, forecast confidence, freshness and protected operating liquidity.
18. Report-execution contract gate: trusted worker, queue/claim, immutable evidence and delivery-result requirements are regression-checked before execution work proceeds.
19. Entitlement-boundary contract gate: expensive report/AI work must be protected by server-side usage/capability enforcement before billing integration is introduced.
20. Trusted report-worker adapter contract: scoped leases, artifact integrity and delivery results are now explicit execution boundaries.
21. Decision-automation execution contract: approval, tenant scope, idempotency keys and execution receipts are now explicit side-effect boundaries.
22. Trusted report-worker pipeline: claim/lease, render artifact, integrity verification, delivery evidence and immutable completion evidence are now composed as one deterministic pipeline.
23. Automation executor: approved side effects now produce tenant-bound receipts with idempotent identity, retryable-error classification, exponential backoff and dead-letter threshold policy.
24. Deterministic forecast backtesting: MAE, RMSE, bias and coverage metrics can now be compared against a baseline before a forecast is allowed to become a high-impact decision input.

## Next implementation order
### Phase A — Report execution
- Build trusted worker adapter.
- Render saved semantic definitions to PDF/Excel/web outputs.
- Queue scheduled reports through `queue_report_run`.
- Claim jobs with `claim_report_run` using a trusted server credential.
- Persist immutable run evidence and delivery results.
- Regression gates: `npm run test:report-execution-contract`, `npm run test:worker-automation-contracts`, `npm run test:report-worker-pipeline`.

### Phase B — Usage/entitlements
- Aggregate usage by billing period.
- Enforce limits at the server boundary before expensive jobs.
- Add billing provider adapter.
- Add invoices, subscription lifecycle and webhook verification.
- Add plan/capability management UI for the platform operator.
- Regression gate: `npm run test:entitlement-boundary-contract`.

### Phase C — Decision automation
- Convert inventory/finance recommendations to explainable `automation_actions`.
- Require approval for external side effects by default.
- Add idempotency keys and execution receipts.
- Add retry/backoff/dead-letter handling.
- Keep every action linked to the originating decision, tenant and evidence snapshot.
- Regression gates: `npm run test:worker-automation-contracts`, `npm run test:automation-executor`.

### Phase D — Advanced intelligence
- Backtest forecasting models.
- Compare against deterministic baselines.
- Add confidence/coverage/accuracy diagnostics.
- Add scenario simulation and sensitivity analysis.
- Add semantic caching and local analytical acceleration where justified.
- Regression gate: `npm run test:forecast-backtest`.

### Phase E — Production SaaS
- Cross-tenant negative test suite.
- Storage policy audit.
- Realtime authorization audit.
- AI retrieval namespace audit.
- Backup/restore drill.
- Observability and SLOs.
- Security review and production release checklist.

## Release blockers
- Any cross-tenant read/write/search/export/retrieval.
- Client-side-only paid feature enforcement.
- Unverified billing webhooks.
- Worker that can process a report without explicit tenant context.
- AI retrieval without tenant namespace.
- Trial expiry that destroys customer data.
- Failed typecheck/build/lint.

## Continuous product intelligence addendum
These requirements are now part of the implementation sequence and must be traced to deterministic engines, UI, security, tests and evidence before being marked complete.

### Phase D1 — Market dynamics and inventory velocity
- Historical consumption by product/category/alternative group.
- Stable, accelerating, seasonal, intermittent and semi-stagnant movement classification.
- Velocity, acceleration and deviation from historical baselines.
- Minimum-data gates for forecasting and high-impact purchase decisions.

### Phase D2 — Stock continuity and lost-sales intelligence
- Customer-to-product demand linkage where evidence exists.
- Peak/trough detection.
- Stockout recurrence, recovery and continuity metrics.
- Evidence-based lost-sales exposure; uncertain cases remain explicitly uncertain.
- Sellable-stock semantics separating physical, reserved, damaged and blocked inventory.

### Phase D3 — Alternative-group decision layer
- Explicit named alternative groups with auditable membership.
- Validated unit/conversion factors where normalization is required.
- DETAIL, GROUPED and HYBRID reporting modes.
- Group-level requests, sellable stock, net sales, historical consumption, demand velocity, coverage, stockout exposure and reorder requirements.
- Member-level drill-down retained as evidence for every group recommendation.

### Phase D4 — Liquidity drivers
- Identify products/groups with rapid recurring cash conversion.
- Separate revenue, collections, receivables and cash.
- Protect operating cash reserves.
- Never substitute purchase totals for cost of sales or cash receipts.
