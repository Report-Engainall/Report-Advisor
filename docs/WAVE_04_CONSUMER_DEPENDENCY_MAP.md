# Wave 04 — Consumer Dependency & Authority Map

## Truth rules
- Consumer verification is distinct from static gate existence.
- Client input is never the tenant authority.
- Canonical calculations must be consumed through the canonical service/library path.
- Unknown/missing values remain unknown; they are not converted to zero.
- LIVE verification is not inferred from static evidence.

| Capability | Canonical implementation / authority | Real consumer scope | Legacy / risk | Wave 04 proof |
|---|---|---|---|---|
| Tenant | `resolveCurrentCompanyId()` / DB-derived context | pages, services, RPCs | client-selected tenant risk | static authority scanner + existing tenant gates |
| BI / KPI | canonical KPI calculation + presentation guards | dashboard/KPI/report consumers | page-local formulas | consumer inventory + formula guard |
| Import | unified import-upsert / governed RPC path | import UI, jobs, reconciliation | direct-write bypass | Wave 03 adversarial matrix + Wave 04 consumer gate |
| Document | document intelligence pipeline | import/document/report flows | provenance gaps | semantic execution + evidence checks |
| Decision | `decision-feedback-graph.ts` | decision/report/action consumers | legacy constructors/direct inserts | graph regression + consumer scan |
| Outcome | decision-linked outcome identity | outcome/feedback consumers | fake-zero risk | outcome regressions + graph validation |
| Worker | lease/checkpoint/recovery semantics | background execution | duplicate side effects | distributed runtime harness |
| Reports | canonical report execution/truth path | report pages/export | consumer-local transforms | static consumer inventory |
| Exports | server-authorized export path | download/export consumers | object/report IDOR risk | authority scanner; LIVE storage proof remains required |
| Notifications | server-derived recipient/tenant context | notification UI/background delivery | client recipient authority | authority scanner; LIVE realtime proof remains required |

## Consumer-level verification contract

For each critical consumer the target chain is:

`UI → handler → service → RPC/API → canonical calculation/authority → DB → result → state/error/refresh`

A static clean scan is **not** equivalent to runtime provenance certification. Any consumer that remains unresolved is recorded as `PARTIAL` until runtime evidence exists.

## Security authority matrix

| Surface | Client input allowed | Server authority | RLS | Application guard | LIVE proof |
|---|---|---|---|---|---|
| DB tenant | yes, as request context only | DB/session-derived tenant | yes | yes | A/B required |
| Storage object | object reference only | tenant-derived namespace + authorization | bucket/RLS where applicable | yes | required |
| Realtime | subscription request only | authenticated tenant/channel authorization | policy-dependent | yes | required |
| AI/vector | query/data only | tenant-scoped namespace | service-level | yes | required |
| Report/export | filter/request only | tenant-scoped record lookup | yes | yes | required |
| Download | opaque reference only | server authorization before URL issuance | yes | yes | required |
| Notification | event data only | server-derived recipient | yes | yes | required |
| Worker/job | job reference only | stored job tenant | yes | yes | deployed drill required |
| Cache | key request only | tenant included in canonical key | n/a | yes | production collision proof required |
| Decision/outcome | entity reference only | server-derived tenant/identity | yes | yes | runtime loop required |
