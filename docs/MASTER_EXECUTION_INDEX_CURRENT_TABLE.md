# Report Advisor — Current Execution Table

> Compact review surface for daily execution. The authoritative historical index remains `docs/MASTER_EXECUTION_INDEX.md`. Exact-SHA evidence never crosses candidate boundaries.

**Updated:** 2026-09-03  
**Current code/test candidate:** `8cfaf6e8d11f5facc6f5bd047f48210290a23959`  
**Parent code candidate:** `fc78bfb04e14e07fbab03ad01eb4f351b202409f`

| Area | State | What is actually proven / completed | What remains |
|---|---|---|---|
| Tenant isolation DB/RPC | ✅ DONE | Prior adversarial contract proof + 236/236 Onyx isolation PASS | Live authenticated A/B browser proof at current deployed SHA |
| RLS coverage | ✅ DONE | 81/81 public tables RLS; 0 without policy; 0 anon policies; 0 PUBLIC policies | Authenticated runtime adversarial confirmation |
| SECURITY DEFINER search_path | ✅ HARDENED | 33 public SECURITY DEFINER functions audited; autonomy helpers locked to `pg_catalog` with schema-qualified relations | Fresh exact-head CI/regression consumption |
| Worker lifecycle | ✅ DONE | Dead-letter terminal transition, lease ownership, retry boundary and rollback-safe DB probes proven | Real worker crash/expiry/recovery runtime evidence |
| Import lifecycle | ✅ HARDENED | Monotonic progress + terminal resurrection protections regression-proven | Golden Excel + authenticated import E2E |
| Decision↔Recommendation | ✅ DONE | One-to-one uniqueness, tenant FK shape, atomic link and overwrite rejection live-proven | Authenticated end-to-end decision flow |
| Approval lifecycle | 🟡 PARTIAL | Self-approval blocked; CANCELLED consistency fixed; direct DML writes blocked | Authority/RBAC contract is not defined by canonical membership schema; do not invent role policy |
| Work-item assignment | ✅ HARDENED | `create_decision_work_item()` now rejects inactive assignees; tenant membership and approved-decision checks retained | Authenticated E2E execution proof |
| Membership model | 🟢 VERIFIED | Canonical schema defines `role='member'` and active/default membership; staging has 2 active/default members | If business RBAC is required, define canonical authority contract before mutation |
| Profiles | 🔴 DRIFT / INVESTIGATE | Current staging has no `public.profiles` relation visible in information_schema | Reconcile repo/app expectations vs current canonical migrations before recreating anything |
| Storage isolation | 🟡 CONTRACT DONE | Tenant/owner-aware authenticated policies exist | Authenticated upload/read runtime proof + canonical bucket contract |
| Realtime | 🟡 UNPROVEN | Contract/work is present | Authenticated subscription + tenant event isolation + reconnect proof |
| AI/vector | 🟡 UNPROVEN | Architecture exists | Authenticated tenant isolation + retrieval/provenance runtime proof |
| Watched folder | 🟡 CONTRACT DONE | Tenant boundary + state model + RPC hardening | Actual watcher/file-change/retry/DLQ E2E |
| OCR / Document intelligence | 🟡 IMPLEMENTED | OCR pipeline/contracts exist | Arabic Golden Corpus + regression evidence |
| Report execution | 🟡 IMPLEMENTED | Lifecycle DB contract strong | Full authenticated report E2E + artifact/provenance chain |
| Performance | 🟡 PARTIAL | P95 targets and large-dataset work exist | Fresh authenticated production-like benchmark |
| Production runtime | 🔴 BLOCKED | Prior deployment exists but is stale vs current candidate | Current-candidate deployment + authenticated smoke |
| Backup / Restore / DR | 🔴 UNPROVEN | Safety/readiness contracts exist | Real backup + isolated restore + integrity + RPO/RTO |
| Rollback / Forward recovery | 🔴 UNPROVEN | Readiness contract exists | Controlled authorized drill + forward recovery evidence |
| Certification bundle | 🔴 NOT CERTIFIED | Certification schema/contract exists | Current exact-SHA evidence bundle with all required gates |
| Repository Quality | 🔴 NOT CERTIFIED | Historical quality runs exist only on older candidates | Fresh Quality run for current `8cfaf6e8...` |
| Leaked-password protection | 🔴 OWNER REQUIRED | Setting identified as Auth control-plane item | Owner enables and returns non-secret state |

## Latest real closure in this cycle

1. Identified a real lifecycle defect: work-item assignment accepted a tenant member even when `company_memberships.is_active=false`.
2. Added `20260903220000_require_active_assignee_membership.sql` to require an active tenant membership for assignees.
3. Applied the migration successfully to staging project `fnqbvfuwbdpwvhcgzksl`.
4. Verified live function remains `SECURITY DEFINER`, keeps `search_path=pg_catalog`, and remains unavailable to `anon` while executable by `authenticated`.
5. Verified the new function definition contains the active-membership guard and preserves tenant/approved-decision/recommendation linkage checks.
6. Advanced the code/test candidate to exact SHA `8cfaf6e8d11f5facc6f5bd047f48210290a23959`.

## Parallel execution rule

- Continue independent closure work in parallel: OCR, import golden corpus, worker recovery, watched-folder runtime, storage/realtime/AI, performance, UI/export parity, and production-readiness preparation.
- Sequential protected chain: current candidate → fresh Quality → current deployment → authenticated runtime → Tenant A/B → production evidence → certification.
- DR chain: backup → isolated restore → integrity → RPO/RTO → rollback → forward recovery → certification.
- Owner work is only the interactive/protected boundary: real credentials, Auth control-plane setting, approved backup/restore, approved rollback, and unavoidable protected production authorization.

## Fail-closed rule

`PASS` means directly proven at the stated boundary. `IMPLEMENTED` is not runtime proof. Historical SHA evidence never certifies a newer candidate.
