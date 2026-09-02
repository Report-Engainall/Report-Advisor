# Report Advisor — Master Execution & Truth Index

## CURRENT RESUME EXECUTION MAP — 2026-09-02 — v4.6 / RESILIENCE OUTBOUND HARDENED

> This file is the authoritative current execution index. Historical execution records remain preserved in Git history and dated execution/evidence documents. No evidence crosses an exact-SHA boundary.

### CURRENT PROJECT STATE
- Repository: `Report-Engainall/Report-Advisor`.
- Latest repository synchronization commit before this documentation sync: `d4731152bda8970503929ca459c16baf50d92c64` (documentation-only synchronization; stable historical pointer).
- Current code/test head: `6150bd185bf827278780a6300f197489ceeedfd5`.
- Current exact code/test candidate: `6150bd185bf827278780a6300f197489ceeedfd5`.
- Previous exact-head Quality run `33662117870` and Final Execution Batch `33662117840` passed on `ab1cf0d9`; after the current resilience code/test mutation, those results are historical and do not certify `6150bd18`.
- Current code/test candidate must receive fresh exact-head repository verification before certification claims are renewed.

### 2026-09-02 RESILIENCE SECURITY CLOSURE WAVE — 6150bd18
- Found and fixed a real outbound transport boundary defect in backup/restore verification: configured artifact/verifier URLs were fetched directly with no protocol restriction, redirect suppression, or bounded request lifetime.
- Added `parseSecureOutboundUrl()` and `secureOutboundFetch()` to enforce HTTPS-only URLs, reject embedded URL credentials, reject invalid URLs, disable automatic redirects, and enforce a bounded 1–60 second outbound timeout.
- Routed backup artifact download and restore verifier calls through the hardened transport boundary.
- Routed rollback drill verification probes through the same hardened transport boundary; Vercel API calls remain fixed to the trusted `https://api.vercel.com` origin.
- Added adversarial regression coverage for insecure HTTP URLs, credential-bearing URLs, malformed URLs, and invalid timeout configuration while preserving the existing rollback project/READY/production guards.
- Commits: `8ba1ffc3416a9e42fe56f62a453a5c4aa2c694fc` (transport primitive), `dbfa3aff20331951c443da196423db8f7764a3ee` (backup/restore integration), `7ba3bf8b52af45c5cfea761ebce899ea60442558` (regression tests), `6150bd185bf827278780a6300f197489ceeedfd5` (rollback integration/current code-test boundary).
- No production alias mutation, rollback, restore, or fabricated operational evidence was performed.

### LIVE DATABASE / SECURITY TRUTH
- Live Staging: 78/78 public tables have RLS; 147 policies; 0 policies targeting `anon`; 0 policies targeting `PUBLIC`; 0 direct `anon` EXECUTE grants on public routines.
- Deeper policy audit found the only company-independent SELECT policy on `company_memberships` is the intentional self-membership policy `user_id = auth.uid()`; the only `USING (true)` policy is on the global `synonym_dictionary`, which has no `company_id` and is reference data.
- Representative sensitive tenant tables use direct `company_id = current_company_id()` guards or relationship-based tenant guards; reviewed SECURITY DEFINER runtime routines use authenticated/user/tenant checks and no dynamic SQL.
- Live storage boundary has tenant-path/owner-aware authenticated policies, but storage runtime remains UNPROVEN and no canonical bucket-creation contract was found; no speculative bucket was created.
- Live Auth logs show successful password-login and `/user` 200 responses for authenticated users; this supports operations only and is not full authenticated E2E certification.
- Leaked-password protection remains disabled in Supabase Auth and is retained as an owner/control-plane item because the connected toolset cannot mutate that setting.

### RESILIENCE / DEPLOYMENT TRUTH
- Backup/restore verification requires a safe non-production target allowlist and now also enforces secure outbound transport with HTTPS-only, no credentials in URLs, no redirects, and bounded timeout.
- Rollback drill validates deployment IDs for exact project ownership and READY state, rejects identical/untrusted targets, forbids production drills, and now uses the same secure verification transport. No production alias mutation was performed.
- Current latest Vercel READY production deployment observed is `dpl_4AtoUj1MecV6K8hkMkVUBLWd7X22` on SHA `8ba1ffc3416a9e42fe56f62a453a5c4aa2c694fc`; it is not the current exact candidate `6150bd18` and is therefore not release certification evidence.
- Vercel reports a build-rate-limit failure/pending status for the current main push; this remains a platform/deployment-capacity condition, not a product-code failure.
- Backup, restore, RPO/RTO, rollback, forward recovery/DR, and production binding remain UNPROVEN/NOT CERTIFIED until real operational evidence is captured at the exact candidate boundary.

### EXACT-SHA / EVIDENCE RULES
- Exact SHA is mandatory for certification evidence.
- CI PASS proves repository gates only; it does not prove live authenticated runtime, Tenant A/B isolation, backup/restore, RPO/RTO, rollback, DR, or Production binding.
- `UNPROVEN` remains `UNPROVEN` until real operational evidence is captured and consumed.
- No mocks, fixtures, static checks, or documentation are promoted to LIVE evidence.
- No production alias mutation, restore, rollback, or secret fabrication is permitted merely to close a gate.

### CERTIFICATION STATUS — FAIL CLOSED
| Gate | State | Reason |
|---|---|---|
| Repository quality | **STALE — reverify @ 6150bd18** | Last PASS was `33662117870` @ `ab1cf0d9`, before current resilience mutation |
| Release deterministic gates | **STALE — reverify @ 6150bd18** | Last PASS was `33662117840` @ `ab1cf0d9`, before current resilience mutation |
| Storage tenant isolation contract | STALE | Prior evidence is on older exact head; runtime still unproven |
| Work Item Actionability Guard | STALE | Prior evidence is on older exact head |
| Production runtime | UNPROVEN | Requires authenticated live product runtime evidence |
| Authenticated E2E | UNPROVEN | Harness is ready; real exact-environment execution evidence still required |
| Live Tenant A/B isolation | UNPROVEN | Requires real two-tenant adversarial runtime evidence |
| Backup | UNPROVEN | Requires real backup artifact/inventory evidence |
| Restore | UNPROVEN | Requires real non-production restore verification |
| RPO / RTO | UNPROVEN | Requires real backup/restore timing evidence |
| Rollback | UNPROVEN | Requires authorized real deployment drill |
| Forward recovery / DR | UNPROVEN | Requires real operational environment |
| Production binding | NOT CERTIFIED | Production deployment is not the exact candidate SHA |
| Auth leaked-password protection | **OPEN — CONTROL PLANE** | Setting is disabled; current toolset cannot mutate Supabase Auth security configuration |
| Final certification | BLOCKED | Live operational evidence plus the Auth control-plane setting remain outside executable closure |

### DEVICE / OWNER LAST-MILE RULE
- Do not defer executable repository, database, security, contract, or evidence-preparation work to the owner's device.
- Owner/device involvement is reserved for unavoidable operations requiring owner credentials, real authenticated users, deployment authorization, protected production/recovery access, or the Supabase Auth control-plane setting unavailable through the connected toolset.
- No owner/device request is made while independent executable work remains.

### NEXT EXECUTION FRONT
1. Obtain fresh exact-head Quality and deterministic release-gate verification for `6150bd185bf827278780a6300f197489ceeedfd5`.
2. Continue independent security/resilience audits without reopening closed work.
3. Prepare exact live authenticated Tenant A/B and resilience evidence paths; never fabricate credentials or operational artifacts.
4. Keep Production binding, backup/restore, RPO/RTO, rollback, DR, and final certification fail-closed until real evidence exists.
5. Enable leaked-password protection through the Supabase Auth control plane when that setting is reachable.
6. Desktop Windows certification remains backed by native smoke workflow; `desktop/package-lock.json` is absent, so reproducible desktop `npm ci` remains a real dependency-resolution gap rather than something to handcraft.

### HISTORICAL RECORD / SHA BOUNDARIES
- Previous index blob: `88d1ee59b1259ae658f5bc4ffae028167b054f85`.
- Previous certified code/test boundary: `ab1cf0d9c16864f9bda07acd33973954c2dc1b7a`.
- Historical execution content remains preserved by Git history; documentation synchronization commits are never promoted to code/test candidates unless they contain a real product/test mutation.
