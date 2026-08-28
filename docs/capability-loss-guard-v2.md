# Capability Loss Guard — Pass 2

Repository-side master capability guard for W2.1 and future waves.

| Capability | Why it matters | Current foundation | Missing layer | Dependency | Business value | Architecture value | Priority | Wave | Acceptance criteria | NO |
|---|---|---|---|---|---|---|---|---|---|---|
| AI Provider Registry | controlled provider lifecycle | AI capability registry/policies | provider health + lifecycle | AI runtime policy | High | High | P0 | C/D | deterministic registry, permissions, audit | YES |
| Model Routing | reliable cost/latency/capability selection | AI runtime policy | governed router | provider registry | High | High | P0 | D | deterministic route under same policy | YES |
| Hybrid Retrieval | grounded multi-source intelligence | document intelligence/vectors | unified retrieval router | knowledge layer | High | High | P0 | D | provenance-bound retrieval | YES |
| Knowledge Layer | reusable business context | scattered intelligence contracts | canonical tenant knowledge | tenant model | High | High | P0 | D | versioned tenant-safe knowledge | YES |
| Browser AI | private local assistance | AI policies | browser execution boundary | offline/private | Medium | High | P1 | D | no secret leakage + deterministic fallback | NO |
| Private/Offline | resilience on weak connectivity | local storage/policies | end-to-end offline workflow | data contracts | High | High | P0 | D/E | offline import/analyze/queue/sync | YES |
| Business Rules Studio | explicit governed policy | rule contracts | authoring/version UI | tenant config | High | High | P0 | E | versioned audited deterministic rules | YES |
| Metric Governance Studio | metric lifecycle | W2.1 persistence/contracts | complete management UX | W2.1 | High | High | P0 | B/D | version/certify/deprecate with evidence | YES |
| Audit Explorer | deep trust | evidence/audit foundations | cross-object explorer | evidence contracts | High | High | P1 | D/E | source-to-action lineage | YES |
| Security Center | visible security posture | tenant/RLS checks | unified posture surface | security contracts | High | High | P1 | E/K | actionable evidence-backed findings | YES |
| Health Score | explainable business health | health signals | canonical scoring | metrics/data quality | High | Medium | P1 | E | explainable + freshness | NO |
| Optimization | best feasible action | BI engines | constrained optimizer | metrics/rules | High | High | P1 | D | deterministic objective/constraints | YES |
| Simulation | what-if decisions | scenario concepts | scenario engine | metrics/optimizer | High | High | P1 | D | reproducible isolated scenarios | YES |
| Impact Analysis | dependency blast radius | lineage foundations | dependency queries | Evidence Graph | High | High | P1 | W2.2 | changed metric lists affected consumers | YES |
| Metric dependency map | prevent silent breaks | contracts | persisted dependency registry | semantic layer | High | High | P0 | B/D | certified metrics map consumers | YES |
| Report dependency map | report impact | report foundations | dependency registry | report model | High | Medium | P1 | D | report-to-metric/evidence/action | YES |
| Recommendation dependency map | recommendation trace | decision foundations | dependency registry | evidence/decision | High | High | P1 | D/E | recommendation-to-evidence/rules | YES |
| Decision dependency map | decision governance | decision evidence | graphable lineage | Evidence Graph | High | High | P1 | W2.2 | decision-to-approval/task/outcome | YES |
| Board Pack | executive governance | report snapshot foundation | composition/export | report model | High | Medium | P1 | D | reproducible board pack | YES |
| Daily Brief | daily focus | dashboard/intelligence | scheduled projection | reports/notifications | High | Medium | P1 | D/F | role-specific brief | YES |
| Weekly Review | trend/change review | analytics | period comparison | report diff | High | Medium | P1 | D | deterministic period comparison | YES |
| Monthly Review | management close | analytics | monthly pack | board pack | High | Medium | P1 | D | certified monthly snapshot | YES |
| Workforce Execution | insight-to-action | task/automation foundations | unified execution model | decision/action contracts | High | High | P0 | E | evidence-backed role-routed tasks | YES |
| SLA / Escalation | prevent stalled actions | partial automation | governed SLA engine | workforce tasks | High | High | P1 | E/F | deterministic escalation | YES |
| Outcome Tracking | measure advice effectiveness | outcome feedback regressions | productized loop | tasks/decisions | High | High | P0 | E/G | expected vs actual evidence | YES |

## Status vocabulary

Foundation, End-to-End, Live, Certified, Missing, Superseded.

## Guard rule

No capability may silently disappear. A superseding implementation must explicitly record its replacement and preserve the acceptance intent.

## Product Moat rule

YES = directly strengthens defensibility through trusted evidence, governed intelligence, deterministic action, or closed-loop outcomes.
NO = supporting capability; still protected, but should not displace security/data-truth/evidence work.

## Product Experience Integration — 2026-08-28

| Capability | Classification | Status | Evidence boundary |
|---|---|---|---|
| Product Intelligence Flow | MOAT | IMPLEMENTED + INTEGRATED + TESTED (repository contract) | `/product-flow` uses the vertical-slice canonical model |
| Dashboard → Finding | MOAT | INTEGRATED | product flow provides direct finding inspection |
| Finding → Evidence Inspector | MOAT | INTEGRATED | source/document/row/fingerprint/extracted/normalized/entity/trust/calculation lineage |
| Evidence → Semantic Metric | MOAT | INTEGRATED | W2.1 metric identity/version/confidence |
| Metric → Insight | MOAT | INTEGRATED | stockout risk insight |
| Insight → Recommendation | MOAT | INTEGRATED | evidence/confidence/policy/impact/alternatives |
| Recommendation → Decision | MOAT | INTEGRATED | metric versions/evidence/rules/confidence/alternatives |
| Decision → Approval UX | MOAT | INTEGRATED | deterministic policy display; AI does not select policy |
| Approval → Workforce Task | MOAT | INTEGRATED | shared Decision/Task projection; owner remains `UNRESOLVED` |
| Executive Report | MOAT | INTEGRATED | canonical SliceReport projection |
| Print / Export PDF | MOAT | IMPLEMENTED | browser print action; browser PDF runtime pending |
| Outcome Capture | MOAT | CONTRACT | Expected/Actual/Variance/Reason/Learning; actual remains null |
| Command Center | SUPPORTING | INTEGRATED | same product-slice canonical state |
| Department projections | SUPPORTING | INTEGRATED | Sales/Procurement/Warehouse/Finance share Task/Decision model |
| Demo fixture separation | SUPPORTING | INTEGRATED | explicitly labelled DEMO FIXTURE |
| Evidence Graph Runtime W2.2 | DEFERRED | PREPARED | blocked by W2.1 Security/Migration/Quality/Consumer/E2E gates |

## Product benchmark levels

Fixture Contract → Product Integration → Runtime Verification → Real Data → E2E Certification.

Current slice: levels 1–2 plus repository regression coverage. It is not runtime, E2E, or certified.
