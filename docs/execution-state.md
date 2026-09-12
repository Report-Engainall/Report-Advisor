HEAD: pending-after-this-commit
LAST_GOOD: 51ee40d (dashboard data wiring); ea239ac (decision evidence guard)
MAIN_FREEZE: 999f93e91f657357d849f15a87a001cb389d8ff9
ACTIVE_BRANCH: desktop/remediation-electron44-electron

CLOSED:
- DQS → accepted prior closure
- DUPLICATE_IMPORT → accepted prior closure
- FAILURE_RECOVERY → accepted prior closure
- INVENTORY_LIQUIDITY → accepted prior closure
- INVALID_INVOICE_DATE → 591d322 / d38cdd5 (recorded prior)
- PURCHASES_DATA_WIRING → 51ee40d
- DECISION_EVIDENCE_GUARD → ea239ac
- AUTOMATION_APPROVAL_GUARD → 1e640ff

ACTIVE:
- DASHBOARD_UI → add Purchases KPI to current DashboardPage without overwriting concurrent changes
- IMPORT_INTEGRITY → targeted source/contract inspection
- DECISION_STATE → targeted transition inspection
- SECURITY → targeted RPC/RLS inspection

RUNTIME_QUEUE:
- real-import → no real business file/browser runtime in current session
- tenant-A-B-e2e → runtime credentials/browser unavailable
- 12-scenarios → real execution unavailable; do not generate evidence JSON
- exact-head-certification → blocked on real runtime evidence

DO_NOT_REPEAT:
- main freeze → 999f93e91f657357d849f15a87a001cb389d8ff9
- import_commit_batch tenant/rollback proof → prior staging evidence; revisit only on dependency change
- dashboard staging snapshot/intelligence → prior staging evidence; revisit only on dependency change
- release decision source contract → production-regression-results.json is authoritative
- Evidence Producer contract → infrastructure ready; no fake results

NEXT:
- finish Dashboard UI wiring
- dependency-directed import/decision/security checks
- semantic metric gaps only where concrete
- operational/commercial blockers only where concrete
- cleanup and compact-state refresh after each real batch
