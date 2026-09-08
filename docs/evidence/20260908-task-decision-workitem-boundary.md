# Task → Approved Decision → Work Item Boundary — 2026-09-08

## Objective
Close the operational boundary between role task proposals and executable decision work items without allowing a task proposal to become an executable work item by itself.

## Implemented
- `operational_task_proposals.decision_id` stores the approved decision linkage.
- `convert_operational_task_proposal(...)` is tenant-scoped and authenticated-only.
- Conversion requires proposal status `accepted`.
- Conversion requires a `business_intelligence_decisions` row in the same tenant with status `APPROVED`.
- Recommendation-origin proposals additionally require the source recommendation to belong to the same tenant and already link to that decision.
- Optional assignee must be an active member of the same tenant.
- Department is derived from the task role: management, operations, sales, warehouse, accounting, purchasing.
- Work item creation delegates to the existing `create_decision_work_item(...)` approval boundary.
- Conversion records `decision_id`, `converted_work_item_id`, and status `converted` on the proposal.
- Repeated conversion of an already-converted proposal returns the existing work-item id instead of creating another work item.
- Direct client status mutation to `converted` is rejected by the persistence layer; conversion requires the RPC and approved decision.

## Staging verification
Verified on Supabase Staging project `fnqbvfuwbdpwvhcgzksl`:
- `operational_task_proposals.decision_id` exists as UUID.
- `convert_operational_task_proposal(uuid,uuid,uuid,text,timestamptz)` exists.
- `anon` does not have EXECUTE privilege.
- `authenticated` has EXECUTE privilege.
- Function definition enforces tenant context, accepted proposal state, approved decision, recommendation linkage, and active tenant assignee.

## Evidence boundary
This proves the database contract and persistence boundary only. It does **not** certify authenticated browser E2E, production runtime, live tenant A/B adversarial isolation, or actual execution/outcome completion.

## Source commits
- `3c68add524e0b9cd72f147af66d5a57d17df56ba` — persistence client: decision/work-item linkage and secure conversion call.
- `dcfafb2c85e3ff09119682dda92996a2407000cb` — prior task-center baseline before this batch.
- `a7d668e9258da2aa23411075168591d5c70bb41e` — execution plan updated with T-03/T-04 boundary.

## Next closure
Expose the existing decision lifecycle from the task center so an accepted proposal can be opened in the decision experience, approved through the existing authority path, and then converted to a work item with a real tenant member assignment. After that, close `work item → evidence → outcome → learning` with live authenticated E2E evidence.
