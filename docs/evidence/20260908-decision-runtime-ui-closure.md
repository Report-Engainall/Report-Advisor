# Decision Runtime UI Closure — 2026-09-08

## Scope
This batch closes the browser-side wiring for the already-existing tenant-safe decision lifecycle contracts without changing the frozen RC or Production alias.

## Implemented
- `src/lib/decision-runtime.ts` adds tenant-scoped reads for APPROVED decisions, decision work items, and active `company_memberships`.
- The client calls existing guarded RPCs for `start_decision_work_item`, `complete_decision_work_item`, and `record_decision_outcome`.
- Completion requires an evidence snapshot identifier and passes it to the server gate; the server remains authoritative for tenant/evidence validation.
- Decision Experience now reads persisted APPROVED decisions and persisted Work Items.
- Accepted operational task proposals can be converted from the UI only through `convert_operational_task_proposal`.
- Assignee selection is restricted in the UI to active tenant memberships; the database independently revalidates membership.
- Task Center now carries `proposalId` into Decision Experience so the accepted proposal remains linked through the lifecycle.
- Task Center durable counters now keep today and tomorrow read-model rows available simultaneously instead of filtering away the opposite horizon.

## Verified database contracts in Staging
- `business_intelligence_decisions` contains approval fields and tenant ownership.
- `decision_work_items` contains decision/recommendation linkage, assignee, status, timestamps, evidence refs, expected/actual impact.
- `start_decision_work_item` requires an APPROVED decision and enforces assignee authority.
- `complete_decision_work_item` requires IN_PROGRESS plus tenant-owned evidence.
- `record_decision_outcome` requires an APPROVED decision, COMPLETED work item, tenant-owned evidence, and a valid outcome label.
- `convert_operational_task_proposal` requires accepted proposal + APPROVED decision + active tenant assignee when supplied and preserves recommendation→decision linkage.

## Git commits
- Task Center horizon/counter correction: `c531a325313330d2363eb81a821a0116556b93bb`
- Decision runtime client: `3789430953c3ef6b5c8e4234a1c11d23dd4ce9f9`
- Decision Experience persisted lifecycle UI: `289c855d1f1eea1cedbc1bdbb8f628cef3f3db02`
- Task proposal context propagation: `1717c3357f3794436e797df5e42e925d60b94221`

## Boundary
This is source/contract and UI wiring evidence. It is **not** authenticated browser E2E certification, Production certification, backup/restore certification, rollback certification, or Vercel deployment PASS. CI for the newest commit was not returned by the connected GitHub workflow lookup at documentation time.
