# Evidence Batch R7 — 2026-09-04 — Last Internal Exhaustion Wave

## Boundary
- Product branch: `repair/currency-analytics-truth-46156969`
- PR: `#316 OPEN / DRAFT / NOT MERGED`
- Code/test snapshot at capture: `043a6029fcf14e2fdcb6247032f2abe103bbc43c`
- This evidence file is documentation-only; the final branch SHA is the commit that adds this file.
- Certification: **NOT CERTIFIED**.

## Newly discovered internal gap and repair
A full backend state-machine writer audit found `public.update_recommendation_status(uuid,text)` accepted legal-looking status names but did not enforce predecessor state or required decision/work state. This was an alternate mutation path capable of bypassing the decision/work lifecycle.

Repair applied live and source:
- `20260904073550_harden_recommendation_status_state_machine` is present in the live migration history.
- Source canonical migration: `supabase/migrations/20260904213000_harden_recommendation_status_state_machine.sql`.
- `approved` requires an OPEN recommendation linked to an APPROVED decision.
- `in_progress` requires APPROVED recommendation state plus an IN_PROGRESS tenant work item.
- `completed` requires IN_PROGRESS recommendation state plus a COMPLETED tenant work item.
- terminal states are locked against arbitrary rewrites.
- auth + tenant context and row locking are enforced.
- CI contract added: `scripts/recommendation-status-state-machine-contract.test.mjs`.
- Full writer contract added: `scripts/decision-state-machine-writer-contract.test.mjs`.
- Both are attached to `business-e2e-contract.yml`.

## Financial truth rescan
A source/live function scan for currency/money/revenue/profit/margin/valuation/aging/price found additional financial consumers beyond the prior analytics list:
- `cash_liquidity_snapshot`
- `get_sales_export_rows`
- `get_purchase_export_rows`
- `get_receivables_export_rows`

These consumers now fail closed on transaction/company currency mismatch in live staging and source migration `20260904214500_harden_financial_export_and_cash_currency.sql`.
- Contract test: `scripts/financial-currency-consumer-contract.test.mjs`.
- Live migration history records `harden_financial_export_and_cash_currency`.
- Inventory valuation and inventory liquidity velocity were inspected; they derive value from tenant-owned product/inventory cost fields rather than transaction-currency fields and are therefore not incorrectly treated as invoice-currency consumers.

## State-machine writer matrix
| Writer | Backend preconditions | Tenant/auth | Evidence | Result |
|---|---|---|---|---|
| `create_runtime_recommendation` | tenant evidence snapshot required | required | required | HARDENED |
| `create_runtime_decision` | tenant, confidence bounds | required | decision evidence payload | HARDENED |
| `link_recommendation_to_decision` | both records same tenant; link consistency | tenant required | provenance link | HARDENED |
| `request_decision_approval` | decision PROPOSED; terminal approval cannot reopen | required | request reason/evidence model | HARDENED |
| `decide_approval` | decision PROPOSED; pending approval; no self approval | required | approval record | HARDENED |
| `create_decision_work_item` | APPROVED decision; linked recommendation; active assignee | required | evidence refs | HARDENED |
| `start_decision_work_item` | APPROVED decision; OPEN work; correct assignee | required | predecessor state | HARDENED |
| `complete_decision_work_item` | APPROVED decision; IN_PROGRESS work; correct assignee; tenant evidence | required | required snapshot | HARDENED |
| `record_decision_outcome` | APPROVED decision; COMPLETED work; tenant evidence; valid label | required | required snapshot | HARDENED |
| `record_recommendation_outcome` | provenance; APPROVED decision; COMPLETED work; tenant evidence; valid status/values | required | required snapshot | HARDENED |
| `finalize_runtime_decision` | APPROVED decision; all work COMPLETED; decision outcome exists | required | downstream outcome | HARDENED |
| `update_recommendation_status` | explicit predecessor/state/work guards | required | inherited lifecycle evidence | **NEWLY HARDENED** |

Known bypass classes checked: direct outcome without work, work without approval, approval without valid decision, decision outcome without evidence/work, terminal rewrite, cross-tenant transition, wrong actor, replay/state-change races.

## Direct table writers
Critical lifecycle tables (`recommendations`, `business_intelligence_decisions`, `decision_approvals`, `decision_work_items`, `decision_outcomes`, `recommendation_outcomes`, `decision_action_receipts`) have authenticated INSERT/UPDATE/DELETE table privileges denied in the live database. Lifecycle mutation therefore routes through guarded functions for authenticated callers; RLS remains enabled.

## Live DB security inventory
- Public base tables with RLS: **81/81**.
- RLS-enabled tables without policies: **0/81**.
- Anonymous SELECT privilege over public base tables: **0/81**.
- Cross-tenant product/customer reads: **0 visible rows** in prior adversarial staging probes.
- Forged product company mutation: **REJECTED**.
- Viewer mutation: **REJECTED**.
- Cross-tenant export: **REJECTED / TENANT_CONTEXT_MISMATCH**.

## SECURITY DEFINER
- **33 total**.
- **20 authenticated-executable**.
- **13 not authenticated-executable**.
- **0 anon-executable**.
- Authenticated-callable SECURITY DEFINER functions were audited for auth identity, tenant resolution, search_path, grants, and critical state/evidence guards.
- Supabase security advisor WARNs on authenticated execution of intended SECURITY DEFINER APIs; this is an exposure warning, not by itself an exploit. The external Auth warning for leaked-password protection remains separate.
- No authenticated browser exploit is claimed because browser credentials are unavailable.

## RPC parity / generated types
- Static frontend→migration RPC parity gate remains present.
- Live public function inventory and generated TypeScript function signatures were regenerated from staging.
- Generated types expose the current critical function signatures including recommendation/outcome/state-machine functions.
- A fully automated bidirectional source↔migration↔live↔generated-type diff is **NOT PROVEN** because generated types are not persisted as the repository's canonical checked-in artifact and the connector does not execute the repo scanner locally. No false PASS is claimed.

## Import
- Counter range/monotonicity and completion invariants are live-hardened.
- Row locks and normalized SKU locking/race handling exist.
- Full same-file concurrent workers + retry + crash + recovery + idempotency drill is **NOT PROVEN** without authenticated runtime/worker execution.

## Real report / business E2E
- Business flows: **20 defined / 0 runtime-proven / BLOCKED**.
- Real report scenarios: **14 ready / 0 executed / 0 certified PASS / BLOCKED**.
- Browser harness has exact-head checkout, pinned Playwright, build, preview startup, auth contract, tenant resolution, route/request/console evidence, refresh persistence, logout, and artifact capture.
- Important limitation: the current browser harness performs authenticated route inspection and auth/tenant/persistence checks, but does not yet execute the complete 20 business actions or the full SOURCE→UPLOAD→PROCESS/OCR→DB→RECONCILIATION→ANALYTICS→UI→EXPORT→EVIDENCE→DECISION chain. Therefore the product E2E remains **INCOMPLETE/NOT PROVEN**, not READY/PASS. This is an internal harness capability gap in addition to the external credential blocker.

## Auth plumbing
Workflow secret contract is explicit and uses only test-runtime secrets:
- `REPORT_ADVISOR_SUPABASE_URL`
- `REPORT_ADVISOR_SUPABASE_ANON_KEY`
- `REPORT_ADVISOR_E2E_USER_A_EMAIL`
- `REPORT_ADVISOR_E2E_USER_A_PASSWORD`
- `REPORT_ADVISOR_E2E_USER_B_EMAIL`
- `REPORT_ADVISOR_E2E_USER_B_PASSWORD`

No secret values are written to source/evidence. Current status: **EXTERNAL CONTROL-PLANE BLOCKED — secret values not provisioned to workflow**.

## Vercel
- Current-head deployment status at the prior exact head: **RATE LIMITED / BLOCKED**.
- Vercel is not used as evidence from an older deployment.
- Exact-head deployment verification remains pending.

## CI discipline
- Any CI result from a parent SHA is historical and cannot certify the current head.
- At the prior wave, the current candidate checks included queued/cancelled states; queued is never promoted to PASS.
- New commits in this wave necessarily create a new exact-head CI boundary. Fresh results must be collected for the final branch SHA.

## Backup / restore / rollback / Windows
- Backup/restore: **EXTERNAL OPERATIONAL ACCESS BLOCKED**.
- Rollback: **EXTERNAL OPERATIONAL ACCESS BLOCKED**.
- Windows native install/launch/update/uninstall: **NOT PROVEN without Windows-native environment**; Linux evidence is not substituted.

## Classification
| Status | Current findings |
|---|---|
| FIXED | currency analytics/export/cash fail-closed; recommendation outcome bypass; recommendation status alternate writer; entity CRUD dead actions; import lifecycle counters; RLS/tenant guards; file-security import issue |
| OPEN | none known from the internal backend audit above, subject to fresh CI/runtime execution |
| MISSING | complete automated 20-flow runtime executor; persisted generated-type parity gate |
| INCOMPLETE | full browser business actions and source-to-output golden report execution; bidirectional RPC parity automation |
| NOT PROVEN | authenticated browser, A/B tenant attack matrix, import crash/retry concurrency, realtime/recovery runtime, full report/OCR pipeline, current-head deployment |
| EXTERNAL BLOCKED | A/B credentials, Vercel rate limit, Auth leaked-password control-plane setting, backup/restore/rollback operations, Windows-native environment |

## Certification impact
**NOT CERTIFIED.**
The last internal exhaustion wave found and repaired an additional lifecycle bypass and four additional financial currency consumers. It also explicitly identified that the current browser harness is not yet a complete 20-flow product executor; this must not be hidden behind the external auth blocker. Certification requires a real authenticated runtime and the complete business-flow/source-to-output execution with exact-head evidence.
