# Report Advisor — Master Execution & Truth Index

## CURRENT RESUME EXECUTION MAP — 2026-09-02 — v4.7 / RESILIENCE SSRF + STREAMING HARDENED

> This file is the authoritative current execution index. Historical execution records remain preserved in Git history and dated execution/evidence documents. No evidence crosses an exact-SHA boundary.

### CURRENT PROJECT STATE
- Repository: `Report-Engainall/Report-Advisor`.
- Latest repository synchronization commit before this documentation sync: `24d853d958c3d05979864883a9f9e77d431841c6` (CI execution wiring; current code/test candidate).
- Current repository head: `fae9abadbc5b3e56ba98cf5779d273e09d6a9bcd`.
- Current code/test head: `fae9abadbc5b3e56ba98cf5779d273e09d6a9bcd`.
- Current exact code/test candidate: `fae9abadbc5b3e56ba98cf5779d273e09d6a9bcd` (documentation-only index synchronization boundary; no product/test mutation in this commit).
- Previous exact-head Quality run `33662117870` and Final Execution Batch `33662117840` passed on `ab1cf0d9`; all later code/test/CI mutations are outside those evidence boundaries.
- Current candidate requires fresh exact-head repository verification before certification claims are renewed.

### 2026-09-02 RESILIENCE SECURITY CLOSURE WAVE — CURRENT CANDIDATE 24d853d9
- Closed a real SSRF target-class defect in the resilience outbound transport: configured HTTPS URLs are now rejected when their literal or resolved addresses are loopback, private, link-local, carrier-grade NAT, documentation/reserved, multicast, or otherwise non-public ranges covered by the guard.
- Added IPv4 and IPv6 range classification, including IPv4-mapped IPv6 handling, and normalized bracketed IPv6 URL hosts before validation.
- Added DNS resolution for hostname targets with all returned addresses inspected; any failed lookup or non-public resolution fails closed before the outbound request.
- Replaced full-response `arrayBuffer()` buffering in the backup artifact SHA-256 path with incremental Web Stream hashing, removing an avoidable whole-artifact memory spike while preserving byte count and digest output.
- Added adversarial regression coverage for private IPv4/IPv6 targets, IPv4-mapped IPv6, public-address acceptance, and streaming hash behavior.
- Wired `scripts/resilience-runtime.test.mjs` into the existing Operational Resilience certification step so this security regression suite is executed by Quality rather than merely existing as an uncalled test file.
- Commits: `a6ec26e3297636196c00cc0e5795e2cb82586a93` (SSRF/DNS + streaming implementation), `24ed4e33ca5066d5647d620db75b0c3850498958` (adversarial/streaming tests), `24d853d958c3d05979864883a9f9e77d431841c6` (Quality execution wiring/current code/test candidate).
- No production alias mutation, rollback, restore, or fabricated operational evidence was performed.

### LIVE DATABASE / SECURITY TRUTH
- Live Staging: 78/78 public tables have RLS; 147 policies; 0 policies targeting `anon`; 0 policies targeting `PUBLIC`; 0 direct `anon` EXECUTE grants on public routines.
- Deeper policy audit found the only company-independent SELECT policy on `company_memberships` is the intentional self-membership policy `user_id = auth.uid()`; the only `USING (true)` policy is on the global `synonym_dictionary`, which has no `company_id` and is reference data.
- Representative sensitive tenant tables use direct `company_id = current_company_id()` guards or relationship-based tenant guards; reviewed SECURITY DEFINER runtime routines use authenticated/user/tenant checks and no dynamic SQL.
- Live storage boundary has tenant-path/owner-aware authenticated policies, but storage runtime remains UNPROVEN and no canonical bucket-creation contract was found; no speculative bucket was created.
- Live Auth logs show successful password-login and `/user` 200 responses for authenticated users; this supports operations only and is not full authenticated E2E certification.
- Leaked-password protection remains disabled in Supabase Auth and is retained as an owner/control-plane item because the connected toolset cannot mutate that setting.

### RESILIENCE / DEPLOYMENT TRUTH
- Backup/restore verification requires a safe non-production target allowlist and enforces secure outbound transport with HTTPS-only, no credentials in URLs, no redirects, bounded timeout, non-public literal/DNS target rejection, and fail-closed DNS resolution.
- Backup artifact integrity hashing now streams the response instead of buffering the full artifact in memory.
- Rollback drill validates deployment IDs for exact project ownership and READY state, rejects identical/untrusted targets, forbids production drills, and uses the same secure verification transport. No production alias mutation was performed.
- Current Vercel production deployment is not certified as the exact current candidate; deployment/platform state must be reverified after the candidate's CI gates pass.
- Vercel build-rate-limit remains a platform/deployment-capacity condition when encountered, not a product-code failure.
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
| Repository quality | **STALE — reverify @ fae9abad** | Last PASS was `33662117870` @ `ab1cf0d9`, before current resilience/CI mutation |
| Release deterministic gates | **STALE — reverify @ fae9abad** | Last PASS was `33662117840` @ `ab1cf0d9`, before current resilience/CI mutation |
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
1. Obtain fresh exact-head Quality and deterministic release-gate verification for `fae9abadbc5b3e56ba98cf5779d273e09d6a9bcd`.
2. If Quality exposes a real regression, fix the smallest proven defect and reverify; otherwise continue independent resilience/runtime/security closure.
3. Prepare exact live authenticated Tenant A/B and resilience evidence paths; never fabricate credentials or operational artifacts.
4. Keep Production binding, backup/restore, RPO/RTO, rollback, DR, and final certification fail-closed until real evidence exists.
5. Enable leaked-password protection through the Supabase Auth control plane when that setting is reachable.
6. Desktop Windows certification remains backed by native smoke workflow; `desktop/package-lock.json` is absent, so reproducible desktop `npm ci` remains a real dependency-resolution gap rather than something to handcraft.

### HISTORICAL RECORD / SHA BOUNDARIES
- Previous index blob: `19ef71494cf187faed089e27d88efe5367dcd1c6`.
- Previous certified code/test boundary: `ab1cf0d9c16864f9bda07acd33973954c2dc1b7a`.
- Historical execution content remains preserved by Git history; documentation synchronization commits are never promoted to code/test candidates unless they contain a real product/test mutation.
