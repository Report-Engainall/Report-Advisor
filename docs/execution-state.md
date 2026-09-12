HEAD: 694d6cc3c0b05676e0951b01f808e156f8ac0be2
LAST_GOOD: 694d6cc (Dashboard UI + Purchases KPI); ea239ac (Decision Evidence Guard)
MAIN_FREEZE: 999f93e91f657357d849f15a87a001cb389d8ff9
ACTIVE_BRANCH: desktop/remediation-electron44-electron

CLOSED:
- DQS → prior accepted closure
- DUPLICATE_IMPORT → prior accepted closure
- FAILURE_RECOVERY → prior accepted closure
- INVENTORY_LIQUIDITY → prior accepted closure
- INVALID_INVOICE_DATE → 591d322 / d38cdd5
- PURCHASES_KPI_DATA → 51ee40d
- PURCHASES_KPI_UI → 694d6cc
- DECISION_EVIDENCE_GUARD → ea239ac
- AUTOMATION_APPROVAL_GUARD → 1e640ff

ACTIVE:
- IMPORT_INTEGRITY → fingerprint/resume/idempotency/retention targeted inspection
- DECISION_STATE → transition bypass targeted inspection
- SECURITY → RPC/RLS targeted inspection
- METRICS → semantic source/formula/provenance targeted inspection

RUNTIME_QUEUE:
- real-import → no real business file/browser runtime
- tenant-A-B-e2e → browser/credentials unavailable
- 12-scenarios → real execution unavailable; evidence JSON must remain ungenerated
- exact-head-certification → waiting for real runtime evidence

DO_NOT_REPEAT:
- MAIN freeze → 999f93e91f657357d849f15a87a001cb389d8ff9
- import_commit_batch tenant/rollback proof → prior staging evidence
- dashboard staging snapshot/intelligence → prior staging evidence
- release decision source contract → production-regression-results.json is authoritative
- Evidence Producer contract → infrastructure ready; no fake results

NEXT:
- targeted import/decision/security/metric contracts
- operational/commercial blockers only where concrete
- full build only at integration milestone
- compact-state refresh after real batch
