# Operational Daily Plan + Task Lifecycle — 2026-09-08

## Scope
This batch advances the operating loop from durable role-task proposals toward a durable daily plan and a controlled decision/work-item lifecycle.

## Implemented

1. `operational_task_proposals` remains tenant-scoped and idempotent through the composite `company_id + task_key` uniqueness boundary.
2. Accepted proposals can only be converted through `convert_operational_task_proposal(...)`.
3. Conversion requires an authenticated tenant context, an `accepted` proposal, an `APPROVED` decision in the same tenant, and—when supplied—an active tenant assignee.
4. Recommendation-backed proposals must reference a recommendation already linked to the selected decision.
5. Conversion is idempotent when the proposal already has `converted_work_item_id`.
6. The new `get_operational_daily_plan(role,horizon)` read model aggregates today/tomorrow state for manager, employee, sales, warehouse, accountant, and purchasing.
7. The read model exposes proposed/accepted/open/in-progress/completed/overdue/evidence-missing counters and is tenant-scoped through `current_company_id()`.
8. The task center now reads the durable daily-plan counters alongside generated and persisted task proposals.
9. A static lifecycle guard checks the approval gate, tenant boundary, active-assignee rule, durable daily-plan RPC, and evidence-state UI contract.
10. Existing start/complete work-item RPCs continue to enforce approved-decision state and evidence before terminal completion; this batch does not bypass those boundaries.

## Staging verification

- Supabase project: `fnqbvfuwbdpwvhcgzksl`
- Migration `operational_daily_plan_read_model` is present in the applied migration ledger as version `20260908140631`.
- `get_operational_daily_plan(text,text)` execute privilege: `authenticated=true`, `anon=false`.
- `decision_work_items` tenant policy remains present and requires `company_id = current_company_id()`; its write check requires an approved decision.
- Existing `start_decision_work_item`, `complete_decision_work_item`, and `record_decision_outcome` definitions were inspected before this batch. Completion requires an evidence snapshot belonging to the same tenant; outcome recording requires a completed work item and tenant-owned evidence.

## Git evidence

- Daily plan migration: `7dfd96dcf242c591099c18d18c6e7cd32a2729e1`
- Persistence client: `e754319fbc811f281639f6931960f35cf5a792df`
- Task-center integration: `f91a338a2df64ce8a5ebe0ac4925d12a6480e88b`
- Lifecycle guard final form: `be1887c6df80cb8324ef380b2ed03d30ff39125b`

## Verification boundary

This is a development/Staging hardening batch. It does **not** certify authenticated browser E2E, Tenant A/B live adversarial isolation, Production Runtime, Backup/Restore, Rollback, or the Vercel preview. The PR remains draft/unmerged and the frozen RC/Production alias boundary was not mutated.
