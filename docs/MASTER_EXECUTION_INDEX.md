# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-07

> Authoritative execution manifest. This index is not a release certificate. Every certification claim must be tied to the exact Git SHA under test and to fresh operational evidence. Because embedding this file's own commit SHA would self-invalidate the reference, the exact candidate is always the Git `HEAD` of the active remediation branch at the evidence checkout.

### ACTIVE REMEDIATION CANDIDATE
- Branch: `fix/runtime-provenance-20260906`
- PR: #348 — `fix: reconcile runtime migration provenance and worker contract`
- Exact candidate reference: **Git `HEAD` of the active remediation branch**; pair this index with `git rev-parse HEAD` for every evidence batch.
- Frozen historical RCs and Production aliases remain untouched.

## NO-MORE-88%-RULE

The previous recurring `88%` figure was a planning/code-maturity estimate, not a defensible production-readiness score. It is retired.

From this point forward, the project is scored against **sellable, production-certified readiness**, not against the amount of code written.

### Honest current score

**Overall sellable / production-certified readiness: ~47%**

This is a weighted assessment, not a claim that exactly 47% of source code exists. The live Staging durable-worker claim contract is now applied and privilege-verified, but authenticated end-to-end, sustained worker lifecycle, and production evidence remain absent.

| Gate | Weight | Current evidence-based completion | Weighted contribution |
|---|---:|---:|---:|
| P0 authenticated runtime + tenant/browser security | 20% | ~45% | 9.0 |
| Worker/report execution | 10% | ~75% | 7.5 |
| Migration/schema provenance parity | 10% | ~76% | 7.6 |
| Import/reconciliation business runtime | 10% | ~60% | 6.0 |
| Arabic OCR/document golden runtime | 10% | ~30% | 3.0 |
| Backup/restore/rollback | 10% | ~20% | 2.0 |
| Windows watched-folder | 5% | ~30% | 1.5 |
| Performance/observability/governance | 5% | ~60% | 3.0 |
| CI/release evidence | 10% | ~30% | 3.0 |
| UX/business acceptance/reporting | 10% | ~45% | 4.5 |
| **Total** | **100%** | | **47.1** |

Because several foundational areas are materially implemented beyond their operational evidence, a separate **implementation maturity** view remains approximately **80%+**. The release decision uses the lower operational score.

### What this means
- **Codebase maturity:** high (~80%+).
- **Operational/production certification:** ~47%.
- **Sellable with full production confidence:** **NO, not yet**.
- The remaining work is release-critical, not cosmetic.

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
- live Staging claim RPC now returns `jsonb` containing the claimed row and exact generated `lease_token`;
- live Staging claim RPC has `service_role_execute=true` and `authenticated_execute=false`;
- live canonical function definition was re-read after application and matches the hardened claim contract.

Still open:
- real queued-job claim/heartbeat/checkpoint/complete/fail/retry lifecycle;
- sustained production worker lifecycle;
- production crash/retry/recovery;
- production queue observability and failure injection.

## P1 — MIGRATION / SCHEMA PROVENANCE
**Status: SUBSTANTIALLY RECONCILED — ACTIVE CLAIM CONTRACT APPLIED — FULL PARITY NOT YET CLOSED**

- The live Staging ledger contains the worker/reconciliation migration chain, including execution-timestamped applications.
- The durable claim hardening was applied forward-only to live Staging under migration record `20260907000717 / harden_report_execution_claim_token_20260907`.
- Remaining requirement: authoritative source-to-live schema comparison proving exact parity for the active candidate, including migration naming/history reconciliation.

## P1 — IMPORT / RECONCILIATION
**Status: IMPLEMENTED — RUNTIME OPEN**

- Canonical truth boundary, provenance requirements, reconciliation states, and import commit path exist.
- The missing Staging `import_commit_batch` RPC was restored as a tenant-checked atomic batch wrapper.
- Customer and sales-invoice canonical upsert RPCs were restored to Staging and then hardened to `SECURITY INVOKER`, leaving RLS as an independent enforcement layer.
- Four unauthenticated negative import security checks passed against Staging.
- Full authenticated business-corpus runtime remains open.
- Source remediation for #351/#352 is landed; authenticated adversarial recovery and business-corpus runtime evidence remain required.

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
- Current-head workflow fan-out for `7ed8b1dc...` failed across many workflows, but the Quality representative job exposed `steps=[]`, `runner_id=0`, empty runner name, and no executable command output. This remains non-diagnostic and is not being treated as a product/test assertion failure.
- Vercel deployment `dpl_4NzGUFKuFua2FLQCYkjX1jxe6z8D` is `READY` and exactly bound to `7ed8b1dc...`; build logs show Vite production build completed successfully in 12.00s and deployment completed.
- The later source commits after `7ed8b1dc...` are not promoted to that deployment evidence.

## HISTORICAL EVIDENCE BOUNDARY

Issue #205 records an exact historical RC `d846821...` with successful Quality and Production deployment evidence, but explicitly records **Production Certified: NO** and lists authenticated E2E, tenant adversarial runtime, migration parity, business corpus, OCR, watched-folder, worker recovery, backup/restore, observability, rollback, and final acceptance as remaining gates. That historical record cannot certify the current candidate.

## RELEASE BLOCKERS — REAL, NOT THEORETICAL

1. Current-head CI with observable executed steps and PASS.
2. Authenticated Chromium E2E for Actors A and B.
3. Browser-level A/B adversarial tenant isolation.
4. Production runtime and real business data-path proof.
5. Fresh migration source ↔ replay/live parity.
6. Arabic OCR/document golden runtime corpus.
7. Import/reconciliation adversarial golden business corpus.
8. Real worker claim/heartbeat/checkpoint/complete/fail/retry lifecycle and production crash/recovery.
9. Backup/restore with measured RPO/RTO.
10. Windows watched-folder lifecycle.
11. Observability/failure-injection proof.
12. Supabase Auth leaked-password protection control-plane remediation.
13. Final UX/business acceptance and release certification.

## NEW VERIFIED GAPS — 2026-09-07

- Durable claim contract — CLOSED at source and **live Staging contract verified**: `claim_report_execution_job(uuid,uuid,text,integer)` now returns `jsonb`, exact lease token, tenant/worker identity, and is executable only by `service_role`.
- Real worker lifecycle — OPEN: Staging currently has zero `report_execution_jobs`, so no legitimate queued-job lifecycle was fabricated or inferred.
- CI forensic boundary — OPEN: current-head fan-out still fails with non-executable job records; no code defect inferred.
- #354 — Supabase Auth leaked-password protection remains disabled.

## GOVERNANCE RULE

- Never use commit count as completion percentage.
- Never promote historical SHA evidence to a new SHA.
- Never call implementation proof operational proof.
- Never mutate frozen RCs or Production aliases to manufacture evidence.
- Prefer forward-only migrations when a historical migration has already been applied.
- Update this index only when the evidence boundary or actual state changes.
