# Report-Advisor — Smart Reports, Executive Printing & Visual Experience Directive

**Status:** Authoritative product-extension directive
**Purpose:** Make reports, tabs, dashboards, notifications, and printed outputs feel like a premium decision product while remaining evidence-backed and operational.

## 1. Smart Report Principle

A report is a decision document, not a screenshot of a dashboard.

Target flow:

`Data → Evidence → Metric → Insight → Recommendation → Decision → Action → Outcome`

Every important conclusion should be traceable and usable.

## 2. Report Families

Support reusable templates for:

- Executive Intelligence Report
- Management Decision Report
- Sales Action Report
- Procurement Intelligence Report
- Warehouse Action Report
- Finance Exception Report
- Customer Intelligence Report
- Supplier Intelligence Report
- Risk Report
- Forecast/Scenario Report
- Audit/Evidence Report
- Daily Business Brief
- Weekly Intelligence Review
- Monthly Executive Review
- Board Pack

## 3. Executive Report Structure

Preferred order:

1. Cover
2. Executive Brief
3. Business Health
4. Critical Issues
5. Opportunities
6. What Changed
7. Why It Changed
8. Evidence
9. Recommendations
10. Why Not
11. Alternatives
12. Decisions Requiring Approval
13. Department Action Plans
14. Expected Impact
15. Previous Outcomes
16. Action Register
17. Next Review

## 4. Cover Page

Display, as applicable:

- company
- branch
- reporting period
- report title
- report ID
- data-as-of
- generated-at
- report version
- overall business health
- top risk
- top opportunity
- top action

## 5. Visual Hierarchy

Reports should use a disciplined visual system with:

- strong typography hierarchy
- meaningful section numbers/tabs
- restrained status and priority indicators
- consistent spacing
- clear tables
- compact executive summaries
- whitespace that improves scanning
- visual emphasis on action and decision sections
- accessible contrast
- print-safe presentation

Do not use visual decoration that obscures meaning.

## 6. Executive KPI Cards

KPI cards should show, where applicable:

- current value
- previous value
- delta
- trend
- target
- status
- data-as-of
- trust indicator
- evidence entry point

## 7. Action Tables

Action tables should be prominent and readable:

| Priority | Department | Action | Owner | Due | Reason | Evidence | Expected Impact | Status |
|---|---|---|---|---|---|---|---|---|

## 8. Decision Tables

Decision sections should show:

- decision
- alternatives
- recommendation
- evidence
- trust
- financial/operational impact
- required approval
- decision owner
- deadline
- status

## 9. Evidence References

Each significant recommendation, decision, or KPI should have an evidence reference when available.

Interactive reports should allow drill-back to source evidence.

Printed reports should show concise evidence IDs/references without overwhelming the page.

## 10. Why / Why Not Blocks

Provide compact explanation blocks:

**Why:** evidence and calculations supporting the recommendation.

**Why Not:** data, policy, threshold, risk, or confidence reasons preventing an alternative decision.

## 11. Alternatives

Show Option A/B/C where material alternatives exist with:

- benefit
- cost
- risk
- confidence/trust
- evidence
- expected outcome

Highlight the recommended option and reasoning.

## 12. Department Work Sections

Reports should automatically generate focused sections for Sales, Procurement, Warehouse, Finance, Management, and other configured departments.

Each section should show only information relevant to the department's responsibilities and permissions.

## 13. Professional PDF / Print Requirements

The PDF engine must be treated as a publication subsystem.

Requirements:

- executive cover
- intentional page breaks
- repeated table headers
- no orphaned headings
- no awkward row clipping
- readable font sizes
- stable column widths
- suitable margins
- header/footer
- page numbering
- report ID
- generation timestamp
- data-as-of
- confidentiality/visibility marker where configured
- high quality on screen and paper
- grayscale-safe meaning
- Arabic RTL print correctness
- English LTR print correctness

## 14. Print Variants

Support, as applicable:

- executive concise
- executive detailed
- operational department pack
- audit/evidence pack
- printer-friendly grayscale

## 15. Report Cover-to-Action Experience

A report should be understandable by a busy executive in seconds, but allow deeper inspection without losing context.

The sequence should be:

**headline → proof → meaning → decision → action**

## 16. Live/Print Truth Consistency

Printed reports and live Action Center records must reference the same canonical records and snapshots.

A printed action must never become a separate copy of the business truth.

## 17. Report Templates

Templates must be versioned and reproducible.

Changing a template should not rewrite historical reports.

## 18. Smart Narratives

Narratives should be generated from governed metrics and evidence.

They should state material facts, comparisons, drivers, and implications without inventing unsupported claims.

## 19. Executive Attention Design

Highlight only what requires attention:

- critical risk
- decision required
- opportunity
- overdue action
- major variance
- data quality issue

Do not create visual noise.

## 20. Notifications Visual/UX Standard

Notifications should be concise but actionable:

`What happened → Why it matters → Evidence → Recommended action`

Support priority, severity, assignment, acknowledgement, snooze, and escalation.

## 21. Command Center

The primary executive interface should show:

- critical decisions
- top risks
- top opportunities
- pending approvals
- overdue actions
- data quality warnings
- recent changes
- health indicators

Include an accessible "What changed since my last look?" experience.

## 22. Empty / Loading / Error States

Every major area should have designed states rather than generic blank pages.

Examples:

- no data yet
- import processing
- stale data
- evidence unavailable
- action blocked by policy
- report generating
- report generation failed

Errors should explain next steps and preserve user context.

## 23. Interaction Patterns

Use consistent patterns for:

- tabs
- drawers
- modals
- command palette
- drill-through
- detail inspectors
- evidence panels
- confirmation flows
- approval dialogs

## 24. Performance UX

Visual polish must not sacrifice speed.

Prefer progressive loading, cached metadata, stable skeletons, and targeted detail fetches.

## 25. Accessibility / Readability

Design for readable text, keyboard operation where appropriate, clear focus state, semantic labels, and non-color-only status meaning.

## 26. Arabic/English Presentation

RTL/LTR switching must be native to the design system.

Tables, charts, numerals, dates, currencies, and PDF layouts must remain coherent in both directions.

## 27. Report Composer

Provide reusable report components:

- KPI
- chart
- table
- narrative
- evidence block
- recommendation
- risk
- decision
- action list
- approval block
- outcome block

Support templates and versioning.

## 28. Acceptance Standard

Smart reporting is complete only when:

`Metric → Evidence → Insight → Recommendation → Report → Decision/Action → Print → Reproducible Snapshot`

works end-to-end for representative business scenarios.

## 29. Product Differentiation

The report should feel like an executive operating document, not a dashboard export.

The strongest visual story is:

**What happened → Why → Evidence → What to decide → Who acts → Expected result → What actually happened.**
