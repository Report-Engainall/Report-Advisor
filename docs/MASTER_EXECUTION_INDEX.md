# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-07

> Authoritative execution manifest. This index is not a release certificate. Every certification claim must be tied to the exact Git SHA under test and to fresh operational evidence. Because embedding this file's own commit SHA would self-invalidate the reference, the exact candidate is always the Git `HEAD` of the active remediation branch at the evidence checkout.

### ACTIVE REMEDIATION CANDIDATE
- Branch: `fix/runtime-provenance-20260906`
- PR: #348 — `fix: reconcile runtime migration provenance and worker contract`
- Current exact candidate before this documentation commit: `a04a65f783f7fb6ef356f708ae153c0c71ff8d06`.
- Latest checkpoint: `docs/EXECUTION_CHECKPOINT_20260907_37.md` at commit `a04a65f783f7fb6ef356f708ae153c0c71ff8d06`.
- Frozen historical RCs and Production aliases remain untouched.

## NO-MORE-88%-RULE

The previous recurring `88%` figure was a planning/code-maturity estimate, not a defensible production-readiness score. It is retired.

From this point forward, the project is scored against **sellable, production-certified readiness**, not against the amount of code written.

### Honest current score

**Overall sellable / production-certified readiness: ~47.5%**

This is a weighted assessment, not a claim that exactly 47.5% of source code exists. The live Staging durable-worker claim/enqueue contracts are hardened and provenance-mapped, while authenticated end-to-end, sustained worker lifecycle, and production evidence remain absent.

| Gate | Weight | Current evidence-based completion | Weighted contribution |
|---|---:|---:|---:|
| P0 authenticated runtime + tenant/browser security | 20% | ~45% | 9.0 |
| Worker/report execution | 10% | ~78% | 7.8 |
| Migration/schema provenance parity | 10% | ~80% | 8.0 |
| Import/reconciliation business runtime | 10% | ~60% | 6.0 |
| Arabic OCR/document golden runtime | 10% | ~30% | 3.0 |
| Backup/restore/rollback | 10% | ~20% | 2.0 |
| Windows watched-folder | 5% | ~30% | 1.5 |
| Performance/observability/governance | 5% | ~60% | 3.0 |
| CI/release evidence | 10% | ~30% | 3.0 |
| UX/business acceptance/reporting | 10% | ~42% | 4.2 |
| **Total** | **100%** | | **47.5** |

Implementation maturity remains approximately **80%+** as a separate engineering view. The release decision uses the lower operational score.

### What this means
- **Codebase maturity:** high (~80%+).
- **Operational/production certification:** ~47.5%.
- **Sellable with full production confidence:** **NO, not yet**.
- Remaining work is release-critical, not cosmetic.

## P0 — AUTHENTICATED E2E / TENANT SECURITY
**Status: OPEN — NOT CERTIFIED**

- Real Chromium harness exists.
- Actor A/B authentication and tenant resolution have historical local baseline evidence.
- Database tenant isolation has strong rolled-back adversarial staging evidence.
- Current-head authenticated browser certification is still missing.
- Browser-level A/B adversarial isolation remains unproven.
- Production runtime remains unproven.
- Cross-tenant business mutation harness exists, but current-head authenticated runtime evidence is not complete.

## P0/P1 — WORKER / REPORT EXECUTION
**Status: HARDENED — LIVE CONTRACT VERIFIED — LIFECYCLE NOT CERTIFIED**

Verified source/live facts:
- explicit tenant/company context;
- lease-token fencing;
- monotonic checkpoint progression;
- first checkpoint must be `queued`;
- `evidenceKeys` must be an array;
- exhausted final attempts converge to `dead_letter`;
- worker RPC execution restricted to `service_role`;
- live Staging claim RPC returns `jsonb` containing the claimed row and exact generated `lease_token`;
- live Staging claim RPC has `service_role_execute=true` and `authenticated_execute=false`;
- live canonical function definition was re-read after application and matches the hardened claim contract;
- durable enqueue migration is live and service-role-only, with tenant/company identity, source path/hash, idempotent job key, bounded max attempts, queued checkpoint, and evidence-key admission.

Still open:
- real queued-job claim/heartbeat/checkpoint/complete/fail/retry lifecycle;
- sustained production worker lifecycle;
- production crash/retry/recovery;
- production queue observability and failure injection;
- legitimate application-side durable report-generation caller (tracked by #372).

## P1 — MIGRATION / SCHEMA PROVENANCE
**Status: SUBSTANTIALLY RECONCILED — ACTIVE CLAIM/ENQUEUE CONTRACT APPLIED — FULL PARITY NOT YET CLOSED**

Fresh Staging ledger verification on 2026-09-07 established the post-2026-09-06 execution tail as follows:

| Repository source migration | Source blob SHA | Live migration version | Live migration name |
|---|---|---|---|
| `20260907000000_harden_report_execution_claim_token.sql` | `400b39d616d10e9bae7b19ad0f2a6bcf1966a14b` | `20260907000717` | `harden_report_execution_claim_token_20260907` |
| `20260907001000_reconcile_report_execution_claim_atomic_return.sql` | `40eea68ffa0e5f104ed0a6f4ca0f7e00a1dd5f4e` | `20260907000931` | `reconcile_report_execution_claim_atomic_return_20260907` |
| `20260907001015_add_report_execution_durable_enqueue_20260907.sql` | `781a1047f2e325999e67738ada080ba94a6de82e` | `20260907005932` | `20260907001015_add_report_execution_durable_enqueue_20260907` |

Important: the first two live versions are execution timestamps and therefore are **not** filename-timestamp matches. The mapping above is based on authoritative migration content/name provenance, not filename inference.

Remaining requirement: authoritative source-to-live schema comparison proving exact parity for the active candidate across the complete migration history, including historical migration naming/history reconciliation. The post-2026-09-06 execution tail is now explicitly mapped but this does not certify full historical parity.

## P1 — IMPORT / RECONCILIATION
**Status: IMPLEMENTED — LIVE CONTRACT RE-AUDITED — RUNTIME OPEN**

- Canonical truth boundary, provenance requirements, reconciliation states, and import commit path exist.
- Staging `import_commit_batch` is tenant-checked and restricts entity types to `products`, `customers`, and `sales_invoices`; rows must be an array.
- Customer/product/invoice canonical upserts enforce current-company context; invoice upsert additionally verifies customer ownership by company.
- Progress counters are non-negative, bounded, monotonic, and terminal jobs cannot be overwritten; `completed` requires all rows processed.
- Import job/upsert/commit RPCs have `anon_execute=false`; authenticated execution is tenant-checked.
- Full authenticated business-corpus runtime and adversarial A/B import evidence remain open.

## P1 — ARABIC OCR / DOCUMENT INTELLIGENCE
**Status: NOT CERTIFIED**

Golden contracts exist, but the real source-document → OCR/extraction → normalization → DB → reconciliation → analytics → evidence → decision → output path is not yet proven against the required corpus.

## P1 — BACKUP / RESTORE / ROLLBACK
**Status: BLOCKED / NOT CERTIFIED**

No fresh end-to-end backup integrity, isolated restore, business invariant validation, measured RPO/RTO, and rollback drill evidence is counted.

## P1 — WINDOWS WATCHED FOLDER
**Status: NOT CERTIFIED**

Contract and platform checks exist, but actual Windows filesystem lifecycle evidence is outstanding.

## P2 — PERFORMANCE / OBSERVABILITY / GOVERNANCE / UX
**Status: PARTIAL**

RLS performance work materially improved the policy shape. Fresh security review still reports authenticated SECURITY DEFINER functions and leaked-password protection disabled. Recommendation UI lifecycle remediation is landed; authenticated runtime evidence remains required.

## CI / RELEASE TRUTH

- The exact active candidate is the Git `HEAD` of `fix/runtime-provenance-20260906` at the time of each evidence batch.
- PR #348 remains open; no merge has been performed.
- Current-head workflow fan-out remains non-diagnostic where inspected: failed jobs expose no executable steps (`steps=[]`, `runner_id=0`, empty runner name) and logs may return `BlobNotFound`. No product defect is inferred from that evidence shape.
- Vercel verification is currently rate-limited for 24 hours; no repeated deployment attempts or certification claim is made during the limit.
- No historical deployment or RC evidence is promoted to the current candidate.

## SECURITY BOUNDARY AUDIT

- The Staging public `SECURITY DEFINER` surface was enumerated: exactly 16 functions are currently executable by `authenticated`; worker/recovery functions are service-role-only.
- The inspected authenticated SECURITY DEFINER functions are tenant/company scoped; anonymous execution is disabled on that surface.
- Supabase Auth leaked-password protection remains disabled and is still an external control-plane blocker; no SQL bypass was used.

## HISTORICAL EVIDENCE BOUNDARY

Issue #205 records an exact historical RC `d846821...` with successful Quality and Production deployment evidence, but explicitly records **Production Certified: NO** and lists authenticated E2E, tenant adversarial runtime, migration parity, business corpus, OCR, watched-folder, worker recovery, backup/restore, observability, rollback, and final acceptance as remaining gates. That historical record cannot certify the current candidate.

## RELEASE BLOCKERS — REAL, NOT THEORETICAL

1. Current-head CI with observable executed steps and PASS.
2. Authenticated Chromium E2E for Actors A and B.
3. Browser-level A/B adversarial tenant isolation.
4. Production runtime and real business data-path proof.
5. Fresh migration source ↔ replay/live parity for the complete migration history.
6. Arabic OCR/document golden runtime corpus.
7. Import/reconciliation adversarial golden business corpus.
8. Real worker claim/heartbeat/checkpoint/complete/fail/retry lifecycle and production crash/recovery.
9. Backup/restore with measured RPO/RTO.
10. Windows watched-folder lifecycle.
11. Observability/failure-injection proof.
12. Supabase Auth leaked-password protection control-plane remediation.
13. Final UX/business acceptance and release certification.

## CANONICAL TRACKING MAP — 2026-09-07

Use the following existing GitHub issues as the primary trackers. Do not create another issue for the same gate unless a genuinely distinct defect or evidence boundary appears:

- CI observable runner execution → #355.
- Authenticated Tenant A/B runtime → #295.
- Migration/source-live provenance reconciliation → #96.
- Durable worker recovery/lifecycle → #299.
- Arabic OCR + import/reconciliation corpus → #297 (with authenticated import runtime tracked by #358 where specifically applicable).
- Backup/restore/rollback → #296.
- Windows watched-folder → #102.
- Supabase Auth leaked-password protection → #354.
- Overall exact-head/live certification → #62.
- Historical RC evidence ledger → #205 (reference only; never promoted).
- Real report-generation durable caller → #372 (distinct architectural gap).

## GOVERNANCE RULE

- Never use commit count as completion percentage.
- Never promote historical SHA evidence to a new SHA.
- Never call implementation proof operational proof.
- Never mutate frozen RCs or Production aliases to manufacture evidence.
- Prefer forward-only migrations when a historical migration has already been applied.
- Search existing open issues/PRs before creating a new tracking issue; update the canonical item when it already represents the same gate.
- Update this index only when the evidence boundary or actual state changes.
