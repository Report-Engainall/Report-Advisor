# Report Execution Caller Audit — 2026-09-09

## Exact base
- Main: `d5851b010d832b5d3e0ae8cf62a3f8abe958aaaa`
- Guard branch: `guard/report-execution-real-caller-20260909`

## Finding
The durable execution engine and TypeScript enqueue boundary exist, but no verified production business caller has been established that reaches `enqueueDurableReportExecution(...)`.

The visible report surface is read/export oriented: `ReportsPage.tsx` reads canonical snapshots and invokes browser artifact download; `App.tsx` routes report pages. These are not evidence of durable job creation.

## Evidence classification
- Durable engine: IMPLEMENTED / repository-proven.
- Durable enqueue boundary: IMPLEMENTED / repository-proven.
- Real production business caller: NOT PROVEN.
- Authenticated live durable lifecycle: NOT PROVEN.
- Production certification: BLOCKED on these evidence gaps.

## Anti-false-positive guard
PR #449 adds a fail-closed caller contract. A separate truth guard deliberately fails if the repository runtime harness is treated as live evidence merely because it prints a PASS label. A repository harness cannot substitute for an authenticated Staging observation of a real `report_execution_jobs` transition.

## Do not do
- Do not wire browser export directly to durable enqueue merely to create a job row.
- Do not create synthetic production-looking evidence and call it runtime proof.
- Do not mutate Production Alias or the frozen RC.
