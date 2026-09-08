# Role Task Persistence — 2026-09-08

## Implemented

- `operational_task_proposals` is a tenant-scoped durable proposal store.
- Roles: manager, employee, sales, warehouse, accountant, purchasing.
- Horizons: today, tomorrow.
- Priorities: critical, high, medium, low.
- Source linkage: recommendation, alert, forecast, KPI plus source id.
- Expected outcome and evidence requirements are persisted.
- Proposal lifecycle: proposed → accepted/dismissed/converted.
- Converted proposals can reference the existing `decision_work_items` lifecycle.
- RLS is enabled and authenticated access is constrained by `current_company_id()`.
- Anonymous access is revoked.

## Verification

Staging project `fnqbvfuwbdpwvhcgzksl` verified the table exists, RLS is enabled, and the initial row count is 0.

## Safety

This layer does not bypass the existing approved-decision boundary. Saving a proposal is not execution and is explicitly presented as such in the UI.

## Branch evidence

- Proposal schema commit: `6bce3034da6ddb729388beb68899a8d87425baf6`
- Persistence client commit: `e94d675737f5788b41fc386de59432473bcd7660`
- Task-center UI persistence update: `e119d1ecfbddcf8519ab4e5f08a59800922756e8`
- PR #427 head after this batch: `e119d1ecfbddcf8519ab4e5f08a59800922756e8`

## Remaining closure

Authenticated browser E2E, assignment to real tenant members, approval-to-work-item conversion, execution receipts, and production certification remain separate gates. No PASS is claimed for those gates here.
