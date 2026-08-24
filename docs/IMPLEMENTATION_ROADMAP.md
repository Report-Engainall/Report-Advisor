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
18. Report-execution contract gate: trusted worker, queue/claim, immutable evidence and delivery-result requirements are now regression-checked before execution work proceeds.
19. Entitlement-boundary contract gate: expensive report/AI work must be protected by server-side usage/capability enforcement before billing integration is introduced.
20. Trusted report-worker adapter contract: scoped leases, artifact integrity and delivery results are now explicit execution boundaries.
21. Decision-automation execution contract: approval, tenant scope, idempotency keys and execution receipts are now explicit side-effect boundaries.
22. Trusted report-worker pipeline: claim/lease, render artifact, integrity verification, delivery evidence and immutable completion evidence are now composed as one deterministic pipeline.
23. Automation executor: approved side effects now produce tenant-bound receipts with idempotent identity, retryable-error classification, exponential backoff and dead-letter threshold policy.
24. Deterministic forecast backtesting: MAE, RMSE, bias and coverage metrics can now be compared against a baseline before a forecast is allowed to become a high-impact decision input.
25. Scenario and sensitivity decision engine: demand, supply, cost, coverage, purchase cost, margin and protected liquidity can now be stress-tested before automation.
26. Forecast confidence gate: minimum observations, coverage, baseline comparison and bias checks now explicitly block weak forecasts from high-impact decisions.
27. Unified operational decision score: demand pressure, velocity, stockout exposure, alternative availability, forecast confidence, liquidity safety, scenario safety and evidence freshness now combine into one auditable score and automation gate.
28. Decision explainability/evidence layer: every scored decision can now carry structured evidence, freshness, confidence, blockers, rationale and a stable decision fingerprint before automation.
29. Decision outcome calibration engine: actual-vs-predicted outcomes now produce accuracy, precision, recall and false-positive diagnostics with threshold recommendations; insufficient evidence is explicitly blocked from calibration changes.
30. Configurable demand horizon: request quantities are now normalized by an explicit source horizon and can be projected to any target horizon; the 30-day example is not a hard-coded business rule.
31. Explicit pack/weight normalization: package configurations and net kilograms are now first-class analytical units, preventing unit-count comparisons from treating 20 kg and 40 kg packs as equivalent.
32. Unified decision policy: score, explainability, calibration and high-impact approval requirements are now evaluated together before an automation outcome is allowed.

## Next implementation order
### Phase A — Report execution
- Queue scheduled reports through `queue_report_run`.
- Claim jobs with `claim_report_run` using a trusted server credential.
- Render saved semantic definitions to PDF/Excel/web outputs.
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
- Add scenario/confidence gate before high-impact automation.
- Use the unified decision score as a final pre-automation gate.
- Require explainability evidence and a stable decision fingerprint before high-impact execution.
- Apply explicit pack/weight normalization before aggregating inventory, requests or lost-sales quantities.
- Apply the unified decision policy after score/explainability/calibration and before executor dispatch.
- Regression gates: `npm run test:worker-automation-contracts`, `npm run test:automation-executor`, `npm run test:scenario-confidence-contracts`, `npm run test:decision-score-contract`, `npm run test:decision-explainability-contract`, `npm run test:decision-calibration-contract`, `npm run test:demand-horizon-contract`, `npm run test:decision-policy-contract`.

### Phase D — Advanced intelligence
- Backtest forecasting models.
- Compare against deterministic baselines.
- Add confidence/coverage/accuracy diagnostics.
- Add scenario simulation and sensitivity analysis.
- Connect group demand, stockout/lost-sales, liquidity and forecast confidence into one decision score.
- Add semantic caching and local analytical acceleration where justified.
- Add decision outcome learning and calibration from actual-vs-expected results.
- Preserve decision fingerprints to connect outcomes back to the evidence and model state that produced them.
- Treat request horizon as runtime input; never assume 30 days unless explicitly selected by the user/report configuration.
- Keep daily-rate normalization separate from business horizon selection so 7/14/30/60/90-day and custom horizons are comparable.
- Normalize pack sizes into net weight before cross-SKU group comparisons.
- Do not change production thresholds from calibration without sufficient outcome evidence and explicit policy review.
- Regression gates: `npm run test:forecast-backtest`, `npm run test:scenario-confidence-contracts`, `npm run test:decision-score-contract`, `npm run test:decision-explainability-contract`, `npm run test:decision-calibration-contract`, `npm run test:demand-horizon-contract`, `npm run test:decision-policy-contract`.

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
- Forecast below confidence gate used for high-impact automation.
- Scenario showing protected-liquidity breach used for automatic purchase execution.
- Unified decision score below the automation threshold used for automatic execution.
- High-impact decision without structured evidence, confidence and stable fingerprint.
- Automatic threshold changes without sufficient outcome evidence and explicit policy approval.
- Missing or ambiguous demand horizon.
- Cross-SKU aggregation that ignores package/net-weight differences.
- High-impact automation dispatched without unified decision-policy approval.
