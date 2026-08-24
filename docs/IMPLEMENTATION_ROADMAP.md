# Report-Advisor implementation sequence

## Completed in current foundation branch
1-35. Foundation, intelligence, explainability, calibration, configurable horizons, pack normalization, decision policy, demand attribution, weighted substitution and liquidity-aware replenishment.
36. Production readiness gate: explicit blocker/warning checks now determine whether a release can be considered production-ready.
37. Unified production decision chain: readiness, replenishment liquidity, explainability blockers, calibration evidence and decision score are composed into one final outcome with the originating decision fingerprint.

## Next implementation order
### Phase A — Report execution
- Queue scheduled reports through `queue_report_run`.
- Claim jobs with `claim_report_run` using a trusted server credential.
- Render saved semantic definitions to PDF/Excel/web outputs.
- Persist immutable run evidence and delivery results.

### Phase B — Usage/entitlements
- Aggregate usage by billing period.
- Enforce limits at the server boundary before expensive jobs.
- Add billing provider adapter.
- Add invoices, subscription lifecycle and webhook verification.
- Add plan/capability management UI for the platform operator.

### Phase C — Decision automation
- Customer/SKU attribution → weighted group substitution → normalized KG → liquidity-safe replenishment → unified decision score → explainability → policy → production readiness → executor.
- Require approval for external side effects by default.
- Add idempotency keys and execution receipts.
- Keep every action linked to the originating decision, tenant and evidence snapshot.

### Phase D — Advanced intelligence
- Backtest forecasting models and calibrate against actual outcomes.
- Scenario simulation and sensitivity analysis.
- Semantic caching and local analytical acceleration where justified.
- Outcome learning must preserve decision fingerprints and evidence snapshots.

### Phase E — Production SaaS
- Cross-tenant negative test suite.
- Storage policy audit.
- Realtime authorization audit.
- AI retrieval namespace audit.
- Backup/restore drill.
- Observability and SLOs.
- Security review and production release certification.

## Release blockers
- Any cross-tenant read/write/search/export/retrieval.
- Client-side-only paid feature enforcement.
- Unverified billing webhooks.
- Worker without explicit tenant context.
- AI retrieval without tenant namespace.
- Trial expiry that destroys customer data.
- Weak forecast used for high-impact automation.
- Protected-liquidity breach used for automatic purchase execution.
- Decision score below policy threshold used for automatic execution.
- High-impact decision without structured evidence, confidence and stable fingerprint.
- Automatic threshold changes without sufficient outcome evidence and explicit policy approval.
- Missing customer/SKU attribution for high-impact lost-sales decisions.
- Group aggregation without explicit substitutability and normalized unit basis.
- Replenishment plan exceeding protected liquidity.
- Production readiness blocker present at release time.
- Final decision chain bypassed by any automation executor.
