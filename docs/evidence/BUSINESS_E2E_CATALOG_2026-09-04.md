# Business E2E Catalog — 2026-09-04

This catalog defines business behavior, not route availability. A flow is only PASS when the UI action, backend call, database effect, business result, security boundary, persistence, and expected failure behavior are all evidenced on the same exact HEAD.

| ID | Flow | Input / Action | Expected UI | Expected RPC/API | Expected DB effect | Business result | Security | Persistence | Expected failure |
|---|---|---|---|---|---|---|---|---|---|
| BF-001 | Auth / Session | valid A/B credentials, login/logout/re-login | authenticated shell | Supabase Auth | session established | correct user context | invalid creds rejected | survives navigation until logout | expired/invalid session surfaced |
| BF-002 | Tenant context | authenticated A then B | tenant identity/data changes | `current_company_id()` path | only selected/default membership context | tenant-scoped data | forged tenant rejected | refresh preserves context | missing membership blocks access |
| BF-003 | Product CRUD | create/edit/delete product | row appears/changes/disappears | Data API `products` | exact tenant row mutation | product usable by downstream flows | wrong tenant/blocked role rejected | refresh/reopen preserves result | duplicate SKU/domain-invalid input rejected |
| BF-004 | Customer CRUD | create/edit/delete customer | row appears/changes/disappears | Data API `customers` | exact tenant row mutation | customer usable by sales/receivables | wrong tenant/blocked role rejected | refresh/reopen preserves result | duplicate code/domain-invalid input rejected |
| BF-005 | Search / Filter | query product/customer and inventory filters | result set matches filter | bounded select/report RPC | no mutation | exact matching set | no cross-tenant rows | repeated search stable | invalid pagination rejected |
| BF-006 | Import | upload supported XLSX/PDF | preview, validation, commit status | import job RPC chain | job + canonical rows | committed rows equal accepted source | tenant-scoped import | refresh shows final state | malformed/partial input quarantined |
| BF-007 | Inventory reconciliation | inventory report vs canonical balances | mismatch/quality state visible | inventory/reconciliation RPCs | no unauthorized mutation | reconciled/flagged correctly | tenant boundary enforced | result persists | mismatch cannot silently become success |
| BF-008 | Sales reporting | sales source/report period | KPI, rows, totals | sales report RPC | read-only snapshot | totals match source truth | tenant scoped | refresh stable | currency mismatch gates financial values |
| BF-009 | Purchase reporting | purchase source/report period | KPI, rows, totals | purchase report RPC | read-only snapshot | totals match source truth | tenant scoped | refresh stable | currency mismatch gates financial values |
| BF-010 | Receivables | customer/invoice balances | aging + outstanding | receivables RPC/export | read-only snapshot | balances reconcile | tenant scoped | refresh stable | invalid page/size rejected |
| BF-011 | Dashboard truth | same source period | KPIs/breakdowns | dashboard canonical RPCs | no mutation | all consumers agree | tenant scoped | refresh stable | inconsistent currency => financial `INSUFFICIENT_DATA` |
| BF-012 | Export | normal/empty/large export | download/result state | export RPC | no mutation | exported rows equal canonical rows | tenant mismatch/row bound rejected | export reproducible | invalid `max_rows` rejected |
| BF-013 | Document / OCR | real PDF/scanned PDF/image | extraction + quality state | document execution path | source/extraction/evidence records | normalized data or quarantine | tenant scoped | rerun deterministic where promised | corrupt/unknown layout does not fake success |
| BF-014 | Evidence | source → extraction → evidence | evidence lineage visible | evidence APIs/RPCs | linked evidence records | provenance complete | source/evidence tenants match | refresh retains lineage | orphan/stale/cross-tenant evidence rejected |
| BF-015 | Recommendation | generated recommendation with evidence | status/owner/impact | recommendation RPCs | recommendation row/status | actionable recommendation | tenant + actor checks | refresh retains status | forged/invalid transition rejected |
| BF-016 | Decision / Approval | recommendation → decision → approval | lifecycle state | decision/approval/work RPCs | exact transition rows/audit | approved action with valid evidence | actor/tenant/evidence checks | refresh/re-login retains state | missing evidence/invalid transition rejected |
| BF-017 | Realtime | mutate entity/event from authenticated session | subscribed UI updates | Realtime channel | exact event source row | no stale UI | channel tenant scope | reconnect restores state | unauthorized event not visible |
| BF-018 | Refresh persistence | perform mutation then hard refresh/reopen | same result after reload | same canonical reads | committed row remains | persistence proven | no leakage after refresh | yes | rollback/failure must not appear persisted |
| BF-019 | Recovery | interrupted import/report execution | recovery state and retry | job checkpoint/retry APIs | checkpoint/state consistent | resume without duplicate | tenant/lease ownership | survives process restart | crash cannot create false completion |
| BF-020 | Logout / Re-login | logout then login A/B | login boundary restored | Auth | old session inaccessible, new session scoped | correct tenant/user after relogin | stale token/session rejected as required | state reloaded canonically | cross-user data never retained |

## Golden report business wrappers

Each report case must execute through: `SOURCE → UPLOAD → EXTRACTION → NORMALIZATION → DB → RECONCILIATION → ANALYTICS → UI → EXPORT/EVIDENCE` where applicable. Parser-only success is not business-flow success.

Required result envelope:

```text
case_id
source_artifact
input_hash
expected_disposition
actual_disposition
source_truth
parsed_truth
normalized_truth
db_truth
rpc_truth
analytics_truth
ui_truth
export_truth
mismatch_list
security_result
persistence_result
evidence_refs
exact_head
```

## Runtime status policy

`READY` means the scenario and oracle exist. `EXECUTED` requires real authenticated runtime. `PASS` requires the complete evidence envelope. `BLOCKED` is used only for an external prerequisite such as unavailable authentication secrets, current-head runtime, or operational access.
