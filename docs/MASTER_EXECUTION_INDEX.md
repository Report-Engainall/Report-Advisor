# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-06

> Authoritative execution manifest. This index is not a release certificate. Every certification claim must be tied to the exact Git SHA under test and to fresh operational evidence.

### ACTIVE REMEDIATION CANDIDATE
- Branch: `fix/runtime-provenance-20260906`
- PR: #348 — `fix: reconcile runtime migration provenance and worker contract`
- Exact active remediation HEAD before this documentation commit: `8b56439495d2586c64e6cb194a4e1e335bb82692`
- Frozen historical RCs and Production aliases remain untouched.

## NO-MORE-88%-RULE

The previous recurring `88%` figure was a planning/code-maturity estimate, not a defensible production-readiness score. It is retired.

From this point forward, the project is scored against **sellable, production-certified readiness**, not against the amount of code written.

### Honest current score

**Overall sellable / production-certified readiness: ~46%**

This is a weighted assessment, not a claim that exactly 46% of source code exists. Recent staging remediation closed prerequisites in the import and worker contracts, but authenticated end-to-end and production evidence remain absent, so the operational score is not increased merely for source/DB fixes.

| Gate | Weight | Current evidence-based completion | Weighted contribution |
|---|---:|---:|---:|
| P0 authenticated runtime + tenant/browser security | 20% | ~45% | 9.0 |
| Worker/report execution | 10% | ~70% | 7.0 |
| Migration/schema provenance parity | 10% | ~75% | 7.5 |
| Import/reconciliation business runtime | 10% | ~60% | 6.0 |
| Arabic OCR/document golden runtime | 10% | ~30% | 3.0 |
| Backup/restore/rollback | 10% | ~20% | 2.0 |
| Windows watched-folder | 5% | ~30% | 1.5 |
| Performance/observability/governance | 5% | ~60% | 3.0 |
| CI/release evidence | 10% | ~30% | 3.0 |
| UX/business acceptance/reporting | 10% | ~45% | 4.5 |
| **Total** | **100%** | | **46.5** |

Because several foundational areas are materially implemented beyond their operational evidence, a separate **implementation maturity** view remains approximately **80%+**. The release decision uses the lower operational score.

### What this means
- **Codebase maturity:** high (~80%+).
- **Operational/production certification:** ~46%.
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
**Status: HARDENED — PARTIALLY CERTIFIED**

Verified source/live facts:
- explicit tenant/company context;
- lease-token fencing;
- monotonic checkpoint progression;
- first checkpoint must be `queued`;
- `evidenceKeys` must be an array;
- exhausted final attempts converge to `dead_letter`;
- worker RPC execution restricted to `service_role`;
- live Staging RPC signatures match the explicit-tenant contract.

The forward-only checkpoint migration was applied to Staging and the canonical function definition was re-read successfully. This closes the previously identified source-vs-live checkpoint-admission gap.

Still open:
- sustained production worker lifecycle;
- production crash/retry/recovery;
- production queue observability and failure injection.

## P1 — MIGRATION / SCHEMA PROVENANCE
**Status: SUBSTANTIALLY RECONCILED — PARITY NOT YET CLOSED**

- The live Staging ledger contains the worker/reconciliation migration chain, including execution-timestamped applications.
- A live source/runtime gap was found in the canonical import chain: `import_commit_batch` and the customer/invoice upsert RPCs were absent from Staging even though their source migrations exist.
- Forward-only Staging reconciliation restored those missing import RPCs without rewriting historical migration records.
- Remaining requirement: fresh replay or authoritative source-to-live schema comparison proving exact parity for the active candidate.

## P1 — IMPORT / RECONCILIATION
**Status: IMPLEMENTED — RUNTIME OPEN**

- Canonical truth boundary, provenance requirements, reconciliation states, and import commit path exist.
- The missing Staging `import_commit_batch` RPC was restored as a tenant-checked atomic batch wrapper.
- Customer and sales-invoice canonical upsert RPCs were restored to Staging and then hardened to `SECURITY INVOKER`, leaving RLS as an independent enforcement layer.
- Four unauthenticated negative import security checks passed against Staging.
- Full authenticated business-corpus runtime remains open.
- Import UI has additional real gaps tracked in issues #351 and #352: failure after an earlier successful batch can leave partial state, and preview-required fields do not match canonical commit requirements.

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

RLS performance work materially improved the policy shape. Fresh security review still reports authenticated SECURITY DEFINER functions and leaked-password protection disabled. Recommendation UI lifecycle and presentation-only customer/product create controls are now tracked as real UX/runtime gaps (#349, #350).

## CI / RELEASE TRUTH

- Latest PR-head Vercel deployment for the current documentation commit reached `READY`; build completed successfully with warnings only.
- Current GitHub Actions records on the remediation head still expose completed `failure` jobs with `steps=null`; this is not proof of test-step execution.
- Therefore no CI PASS is being fabricated or inferred.
- PR #348 remains unmerged until executable CI evidence and the required operational gates exist.

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
8. Production worker crash/retry/dead-letter/recovery lifecycle.
9. Backup/restore with measured RPO/RTO.
10. Windows watched-folder lifecycle.
11. Observability/failure-injection proof.
12. Final UX/business acceptance and release certification.

## NEW VERIFIED GAPS — 2026-09-06

- #349 — Recommendations UI exposes a transition flow that does not match the durable decision/recommendation state machine.
- #350 — Customer/Product create buttons are presentation-only and have no mutation handler.
- #351 — Canonical import can persist earlier chunks if a later chunk fails unless the lifecycle is made atomic or durably resumable.
- #352 — Import preview validation is weaker than canonical commit requirements.
- #353 — Missing Staging `import_commit_batch` was a concrete source/live runtime break; forward reconciliation has now restored it.
- #354 — Supabase Auth leaked-password protection remains disabled.

## GOVERNANCE RULE

- Never use commit count as completion percentage.
- Never promote historical SHA evidence to a new SHA.
- Never call implementation proof operational proof.
- Never mutate frozen RCs or Production aliases to manufacture evidence.
- Prefer forward-only migrations when a historical migration has already been applied.
- Update this index only when the evidence boundary or actual state changes.