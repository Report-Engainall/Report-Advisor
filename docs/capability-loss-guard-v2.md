# Capability Loss Guard — Pass 2

Repository-side master capability guard for W2.1 and future waves.

| Capability | Why it matters | Current foundation | Missing layer | Dependency | Business value | Architecture value | Priority | Wave | Acceptance criteria |
|---|---|---|---|---|---|---|---|---|---|
| AI Provider Registry | controlled provider lifecycle | AI capability registry/policies | provider health + lifecycle | AI runtime policy | High | High | P0 | C/D | deterministic registry, permissions, audit |
| Model Routing | reliable cost/latency/capability selection | AI runtime policy | governed router | provider registry | High | High | P0 | D | deterministic route under same policy |
| Hybrid Retrieval | grounded multi-source intelligence | document intelligence/vectors | unified retrieval router | knowledge layer | High | High | P0 | D | provenance-bound retrieval |
| Knowledge Layer | reusable business context | scattered intelligence contracts | canonical tenant knowledge | tenant model | High | High | P0 | D | versioned tenant-safe knowledge |
| Browser AI | private local assistance | AI policies | browser execution boundary | offline/private | Medium | High | P1 | D | no secret leakage + deterministic fallback |
| Private/Offline | resilience on weak connectivity | local storage/policies | end-to-end offline workflow | data contracts | High | High | P0 | D/E | offline import/analyze/queue/sync |
| Business Rules Studio | explicit governed policy | rule contracts | authoring/version UI | tenant config | High | High | P0 | E | versioned audited deterministic rules |
| Metric Governance Studio | metric lifecycle | W2.1 persistence/contracts | complete management UX | W2.1 | High | High | P0 | B/D | version/certify/deprecate with evidence |
| Audit Explorer | deep trust | evidence/audit foundations | cross-object explorer | evidence contracts | High | High | P1 | D/E | source-to-action lineage |
| Security Center | visible security posture | tenant/RLS checks | unified posture surface | security contracts | High | High | P1 | E/K | actionable evidence-backed findings |
| Health Score | explainable business health | health signals | canonical scoring | metrics/data quality | High | Medium | P1 | E | explainable + freshness |
| Optimization | best feasible action | BI engines | constrained optimizer | metrics/rules | High | High | P1 | D | deterministic objective/constraints |
| Simulation | what-if decisions | scenario concepts | scenario engine | metrics/optimizer | High | High | P1 | D | reproducible isolated scenarios |
| Impact Analysis | dependency blast radius | lineage foundations | dependency queries | Evidence Graph | High | High | P1 | W2.2 | changed metric lists affected consumers |
| Metric dependency map | prevent silent breaks | contracts | persisted dependency registry | semantic layer | High | High | P0 | B/D | certified metrics map consumers |
| Report dependency map | report impact | report foundations | dependency registry | report model | High | Medium | P1 | D | report-to-metric/evidence/action |
| Recommendation dependency map | recommendation trace | decision foundations | dependency registry | evidence/decision | High | High | P1 | D/E | recommendation-to-evidence/rules |
| Decision dependency map | decision governance | decision evidence | graphable lineage | Evidence Graph | High | High | P1 | W2.2 | decision-to-approval/task/outcome |
| Board Pack | executive governance | report snapshot foundation | composition/export | report model | High | Medium | P1 | D | reproducible board pack |
| Daily Brief | daily focus | dashboard/intelligence | scheduled projection | reports/notifications | High | Medium | P1 | D/F | role-specific brief |
| Weekly Review | trend/change review | analytics | period comparison | report diff | High | Medium | P1 | D | deterministic period comparison |
| Monthly Review | management close | analytics | monthly pack | board pack | High | Medium | P1 | D | certified monthly snapshot |
| Workforce Execution | insight-to-action | task/automation foundations | unified execution model | decision/action contracts | High | High | P0 | E | evidence-backed role-routed tasks |
| SLA / Escalation | prevent stalled actions | partial automation | governed SLA engine | workforce tasks | High | High | P1 | E/F | deterministic escalation |
| Outcome Tracking | measure advice effectiveness | outcome feedback regressions | productized loop | tasks/decisions | High | High | P0 | E/G | expected vs actual evidence |

## Status vocabulary

Foundation, End-to-End, Live, Certified, Missing, Superseded.

## Guard rule

No capability may silently disappear. A superseding implementation must explicitly record its replacement and preserve the acceptance intent.
