# Role Intelligence Task Engine — 2026-09-08

## Objective

Turn source-backed findings into a daily operational plan for manager, employee, sales, warehouse, accountant and purchasing.

## Contract

- Inputs: current alerts, recommendations and forecast quality.
- Output: proposed tasks for `today` or `tomorrow`.
- Each task has role, priority, reason, source type/id, expected outcome and evidence requirements.
- Critical/high signals default to today; medium/low signals can be scheduled for tomorrow.
- Role routing is deterministic from recommendation/alert category and text; manager receives oversight tasks.
- No fake task counts or completed status are generated.
- Runtime persistence/assignment/approval remains a separate closure gate; this engine currently creates proposal objects and the UI clearly labels them as proposed.

## Product flow

`Report → Finding/Alert → Recommendation → Role Task → Evidence → Execution → Actual Outcome → Learning`

## Roles

- Manager: approve/prioritize/monitor cross-department risks.
- Sales: customer follow-up, sales opportunities, collection support.
- Warehouse: stock, reorder, dead-stock and availability actions.
- Accountant: receivables, payment, reconciliation and financial controls.
- Purchasing: supplier/reorder/procurement actions.
- Employee: general operational actions when no specialized department is inferred.

## Acceptance

The task center must never claim an action was executed until authenticated runtime persistence records the actual lifecycle.
