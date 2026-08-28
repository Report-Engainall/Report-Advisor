# W2.1 Parallel Acceptance Matrix v1

This matrix is preparation/proof mapping only until staging is available.

| Dimension | Repository proof target | Runtime proof | Status |
|---|---|---|---|
| Definition | metric registry + governance contract | execute canonical metric | READY |
| Formula | canonical metric definition | golden fixture result | READY |
| Source | lineage/evidence contract | source fixture | READY |
| Version | persisted metric version | version replay | READY |
| Time semantics | period/data-as-of contract | boundary cases | READY |
| Freshness | data-as-of/freshness fields | stale/fresh fixture | READY |
| Evidence | evidence references | persisted evidence | READY |
| Consumers | consumer traceability | runtime consumer output | PARTIAL |
| Permissions | tenant/RLS contracts | adversarial tenants | BLOCKED |
| Reproducibility | immutable version references | repeated runtime execution | BLOCKED |
| Impact | dependency map design | changed metric blast radius | GAP/READY |
| Inspector | Metric Inspector route/component | authenticated UI | READY |
| Runtime path | gateway/read-model contracts | staging execution | BLOCKED |

Required final condition:
QUALITY GREEN + E2E PASS + SECURITY PASS + MIGRATION PASS + semantic consumer proof + evidence proof.
