HEAD: 16c44190f7ce82ec0e7b524a7cb011f7396e227b
LAST_GOOD: 16c4419 (security definer hardening); 3c489c5 (decision owner/evidence)
MAIN_FREEZE: 999f93e91f657357d849f15a87a001cb389d8ff9
ACTIVE_BRANCH: desktop/remediation-electron44-electron

CLOSED:
- DQS → accepted
- DUPLICATE_IMPORT → accepted
- FAILURE_RECOVERY → accepted
- INVENTORY_LIQUIDITY → accepted
- INVALID_INVOICE_DATE → 591d322 / d38cdd5
- PURCHASES_KPI_DATA → 51ee40d
- PURCHASES_KPI_UI → 694d6cc
- DECISION_EVIDENCE_GUARD → ea239ac
- DECISION_WORK_ITEM_OWNER_EVIDENCE → 3c489c5
- SECURITY_DEFINER_HARDENING → 16c4419 + staging

ACTIVE:
- SECURITY → 36 authenticated SECURITY DEFINER warnings remain; triage continues, no blind revoke
- IMPORT_INTEGRITY → fingerprint/resume/idempotency/retention
- DECISION_STATE → remaining transitions
- METRICS → semantic source/formula/provenance

RUNTIME_QUEUE:
- real-import → no real business file/browser runtime
- tenant-A-B-e2e → browser/credentials unavailable
- 12-scenarios → real execution unavailable; evidence JSON remains ungenerated
- exact-head-certification → waiting for real runtime evidence
- leaked-password-protection → Supabase Auth setting requires hosted Auth configuration; not changed by SQL

DO_NOT_REPEAT:
- MAIN freeze → 999f93e
- import_commit_batch tenant/rollback proof → prior staging evidence
- dashboard staging snapshot/intelligence → prior staging evidence
- release decision source contract → production-regression-results.json authoritative
- Evidence Producer contract → infrastructure ready; no fake results
- Vercel 3c489c5 → READY

NEXT:
- classify/fix remaining critical/high SECURITY DEFINER paths
- import integrity contracts
- decision transition audit
- semantic metrics
- full build only at integration milestone
