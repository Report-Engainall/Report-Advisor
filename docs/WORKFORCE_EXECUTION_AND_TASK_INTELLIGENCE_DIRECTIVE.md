# Report-Advisor — Workforce Execution & Task Intelligence Directive

**Status:** Authoritative product-extension directive
**Scope:** Task Intelligence, Workforce Orchestration, Department Operations, Accountability, Approvals, Notifications, Outcome Tracking
**Parent vision:** `SOURCE → DATA → EVIDENCE → METRIC → INSIGHT → DECISION → APPROVAL → ACTION → OUTCOME → LEARNING`

## 1. Product Principle

Report-Advisor must not stop at analytics, recommendations, or reports. It must be able to translate trusted business intelligence into an executable operating plan for the people responsible for the business.

Target chain:

`Evidence → Metric → Insight → Recommendation → Decision → Approval → Task → Assignment → Execution → Verification → Outcome → Learning`

The task system is therefore a first-class product capability, not a generic to-do list.

## 2. Workforce Intelligence

The platform should understand the organization's operational roles and responsibilities without making business-critical assignments unsafe or opaque.

Typical departments/roles may include:

- Owner / Executive
- General Manager
- Accountant / Finance
- Sales Manager
- Sales Representative
- Procurement Manager
- Buyer
- Warehouse Manager
- Warehouse Clerk
- Branch Manager
- Inventory Controller
- Customer Service
- Operations
- IT / Administrator
- Auditor / Reviewer

Organizations must be able to configure their own departments, roles, users, permissions, approval limits, working calendars, and escalation rules.

## 3. Recommendation-to-Work Engine

Convert actionable intelligence into structured work:

`Finding → Recommendation → Required Decision → Approval Policy → Task Template → Assignment → SLA → Execution → Verification → Outcome`

Every automatically generated task should preserve its origin and evidence.

## 4. Task Object

A task should support, as applicable:

- taskId
- title
- concise action statement
- department
- role
- owner
- assignee
- backup assignee
- priority
- severity
- status
- createdAt
- dueAt
- SLA
- source recommendation
- decisionId
- reportId
- snapshotId
- metricIds
- evidence references
- reason
- expected impact
- required approval
- dependencies
- blockers
- execution notes
- attachments
- completion proof
- actual outcome
- variance
- audit trail

## 5. Assignment Intelligence

Task assignment should consider configured responsibility, role permissions, branch, warehouse, workload, availability, SLA, task type, and segregation-of-duties rules.

Do not use opaque AI assignment for sensitive actions when deterministic policy can decide safely.

When AI assists with assignment, the recommendation must be explainable and policy-constrained.

## 6. Department Action Packs

Generate specialized work queues and printable/actionable reports.

### Sales

- follow-up customers
- inactive customers
- churn-risk customers
- high-value opportunities
- overdue collection follow-ups where authorized
- cross-sell / repeat-order opportunities
- quote/order follow-up
- customer risk review

### Procurement

- purchase recommendations
- urgent replenishment
- supplier follow-up
- price-change review
- alternative supplier research
- delayed purchase orders
- lead-time exceptions
- concentration-risk review

### Warehouse

- stockout prevention
- stock transfer
- receiving checks
- inventory reconciliation
- cycle-count tasks
- dead-stock action
- slow-mover review
- location correction
- damaged/missing inventory review

### Finance / Accounting

- reconciliation review
- overdue receivable follow-up
- payable review
- cash-pressure actions
- anomaly review
- period-close tasks
- audit evidence collection

### Management

- decisions awaiting approval
- strategic risks
- high-impact opportunities
- exceptions beyond department authority
- overdue critical actions
- unresolved cross-department blockers

### IT / Operations

- failed jobs
- integration failures
- stale sources
- storage/backup warnings
- security events
- provider outages
- runtime incidents

## 7. Task Prioritization

Prioritize using a transparent combination of:

- financial impact
- urgency
- risk
- customer impact
- inventory impact
- operational dependency
- evidence quality
- confidence/trust
- SLA
- deadline

A priority score must never hide the underlying reasons.

## 8. Smart Task Bundling

Correlated findings should be grouped into a root business issue rather than generating dozens of duplicate tasks.

Example:

`Forecast decline + low demand + excess stock + falling margin`

may become one coordinated inventory/procurement review with linked sub-actions.

## 9. Cross-Department Workflows

Support coordinated workflows such as:

`Sales identifies demand increase`
→ `Management approves plan`
→ `Procurement creates purchase task`
→ `Warehouse prepares capacity`
→ `Finance checks liquidity`
→ `Procurement executes`
→ `Warehouse receives`
→ `Report-Advisor measures actual outcome`

The workflow should preserve dependencies and responsible parties.

## 10. Approval and Delegation

Support:

- threshold approvals
- role approvals
- dual approval
- delegation
- temporary delegation
- expiration
- escalation
- emergency override with audit
- segregation of duties

A user cannot approve an action that policy forbids them from approving.

## 11. SLA & Escalation Engine

Tasks should support configurable SLAs.

Examples:

- critical stockout risk: response within 4 hours
- high-priority customer issue: response within 8 hours
- reconciliation exception: resolve before close

Escalation should be policy-driven:

`Assigned → Reminder → Escalation → Manager → Executive`

The system should never create hidden escalation rules.

## 12. Task Status Model

Recommended lifecycle:

`Proposed → Pending Approval → Approved → Assigned → Acknowledged → In Progress → Blocked → Submitted for Verification → Completed → Verified → Closed`

Cancellation and rejection should be explicit states with reason and audit trail.

## 13. Proof of Completion

For critical tasks, completion should require evidence such as:

- linked transaction
- uploaded document
- reconciliation result
- inventory count
- purchase order reference
- customer contact record
- approval record
- user confirmation

Do not mark critical work complete solely because a checkbox was clicked.

## 14. Verification Layer

Separate:

**Execution** from **Verification**.

Example:

Buyer marks purchase executed.

System then verifies:

- purchase order exists
- quantities match
- price is within policy
- receipt is recorded
- expected inventory changed

Only then should the action become `Verified`.

## 15. Outcome Measurement

Every material task should optionally connect to:

- expected impact
- target metric
- measurement window
- actual result
- variance
- explanation
- lesson

This creates:

`Task → Outcome → Learning`

and feeds Outcome Learning without silently changing sensitive business rules.

## 16. Morning Command Center

Executive home should surface work, not merely charts:

- decisions waiting for approval
- critical risks
- top opportunities
- overdue tasks
- tasks blocked by other departments
- today's deadlines
- recent changes
- expected impact at risk
- evidence quality warnings

## 17. Personal Workbench

Each user should have a focused work queue:

- My Tasks
- Due Today
- Overdue
- Waiting for Me
- Waiting for Approval
- Blocked
- Completed
- Recently Changed

Users should not have to search the entire system to find their responsibilities.

## 18. Task Detail UX

A task detail screen should answer within seconds:

**What?**
**Why?**
**Evidence?**
**Expected impact?**
**Who?**
**When?**
**Approval?**
**Dependencies?**
**What changed?**
**How do I complete it?**
**How is completion verified?**

The UI should provide direct links back to the originating Report, Decision, Metric, and Evidence.

## 19. Intelligent Notifications

Notifications should be context-rich:

`What happened + Why it matters + Evidence + Recommended action + Owner + Deadline`

Support:

- in-app
- email where configured
- browser/device notifications where available
- digest mode
- quiet hours
- snooze
- acknowledge
- escalation

Never expose protected data to an unauthorized notification recipient.

## 20. Notification Digest

Reduce noise with daily/periodic summaries such as:

- 3 critical actions
- 5 approvals waiting
- 2 overdue tasks
- 4 new opportunities
- 1 system/data incident

Correlated alerts should be grouped.

## 21. Smart Reports as Work Documents

Executive and operational reports should include action tables, not only analysis.

Recommended section:

### ACTION PLAN

| Priority | Department | Action | Owner | Due | Reason | Evidence | Expected Impact | Status |
|---|---|---|---|---|---|---|---|---|

The same action records should link to the live Action Center so the printed report and the live system do not become two different truths.

## 22. Printable Department Packs

Generate department-specific printable packs:

- Sales Daily Action Sheet
- Procurement Purchase Action Sheet
- Warehouse Operations Sheet
- Finance Exceptions Sheet
- Management Decision Sheet

Each pack should carry report ID, data-as-of, generated-at, evidence references, and page numbering.

## 23. Workload & Capacity View

Provide management with visibility into:

- tasks per user
- tasks per department
- overdue burden
- SLA risk
- blocked work
- critical work concentration
- workload imbalance

This should support reassignment while respecting permissions and segregation of duties.

## 24. Dependency Graph

Tasks may depend on other tasks, decisions, approvals, imports, reconciliations, or external events.

Visualize:

`Task A → Task B → Task C`

and clearly identify the root blocker.

## 25. Recurring Work

Support governed recurring tasks such as:

- daily cash review
- weekly stock review
- monthly reconciliation
- monthly KPI certification
- periodic backup verification

Recurring tasks must maintain template/version history and auditability.

## 26. Human Override

Users with the right permission may override assignment or priority, but must provide a reason for material overrides.

Overrides must be auditable and must not silently alter the originating recommendation.

## 27. Safety Rules

The task engine must not:

- execute financially sensitive actions without required approval
- bypass tenant isolation
- reveal unauthorized data
- silently alter evidence
- silently change KPI definitions
- close critical tasks without required verification
- silently replace a human owner with AI

## 28. Competitive Product Objective

The differentiator is not 'AI creates tasks'.

The differentiator is:

`Trusted Evidence → Business Reasoning → Decision → Governed Assignment → Human Execution → Verification → Measured Outcome`

This turns Report-Advisor into an operating intelligence layer for the business.

## 29. Integration with Existing Master Directive

This directive extends the Master Product & Architecture Directive. It must be reconciled into the Master Feature/Technology Matrix and Master Acceptance Matrix.

The implementation must reuse:

- Evidence Graph
- Semantic Metric Layer
- Decision Graph
- Outcome Graph
- Trust Model
- Report Snapshots
- Action Center
- Approval Workflows
- Audit infrastructure
- Tenant/RBAC/RLS controls
- Durable runtime

Do not create parallel task, metric, evidence, or decision truths.

## 30. Acceptance Standard

Task Intelligence is not complete because tasks can be created.

Target acceptance chain:

`Recommendation → Decision → Approval → Task → Assignment → Runtime → Execution → Verification → Evidence → Outcome → Audit`

Verify end-to-end with real business scenarios before calling the capability complete.

## 31. Strategic Outcome

The final user experience should feel like:

**Report-Advisor does not only tell me what is happening. It organizes what my business needs to do next, gives every responsible person their work, explains why the work matters, proves completion, and tells me whether the action actually worked.**
