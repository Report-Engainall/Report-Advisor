# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION TRUTH — 2026-09-01

This index is authoritative for execution state. Historical PASS is never promoted across SHAs. Certification requires exact-head evidence.

### Current candidate
- Repository: `Report-Engainall/Report-Advisor`
- PR: **#294 — OPEN / NOT MERGED**
- Base: `main` @ `89c8361e85878521c915328f6d0a595663498cd3`
- Current branch: `codex/p0-hardening-integration-20260901`
- Latest source/workflow hardening includes bounded Worker and Certification workflows, corpus guards, business-golden integrity guards, recovery-boundary alignment, checkpoint resume coverage, and the Alaghbari brand identity migration.
- Exact-head CI is required after every source/workflow mutation; no final PASS is claimed until that exact SHA is verified.

### Latest certification finding and repair
- Exact-head certification on `c53278730a28edf96518880fa9489fcb8d6207e0` passed the 20-stage readiness matrix, 30-stage final execution batch, P0 13/13, and P1 8/8 before `check-phase-k-runtime-closure.mjs` failed.
- Root cause: the Phase-K checker required stale API vocabulary while the canonical production coordinator bridge uses current runtime APIs.
- Repair: Phase-K checker now accepts canonical runtime APIs while retaining backward-compatible alternatives and sourceHash identity.
- Fresh exact-head CI remains mandatory; no certification is inferred from historical PASS.

### Worker lifecycle hardening
- Worker lifecycle regression suite covers heartbeat, checkpoint, completion, failure, retry, lease expiry, service-role authority, tenant isolation, terminal-state guards, search_path, lease floor, null payloads, lease clearance, grants, checkpoint monotonicity, retry eligibility, terminality, tenant boundary, RPC signatures, return semantics, updated_at, active-state restrictions, and completion evidence.
- `.github/workflows/worker-hardening-contract.yml` executes the repository-backed worker contract suite.
- Checkpoint monotonicity guard now targets the canonical `src/lib/report-execution/checkpoint.ts` module instead of a removed flat module path.
- Checkpoint resume regression coverage is now explicit in `scripts/report-execution-runtime.test.ts`.
- An invalid nonexistent claim-migration reference was removed; no unsupported guard remains.

### Certification evidence boundary hardening
- Canonical mandatory evidence order is tenant, backup, rollback, artifact, security.
- Score derivation, fail-closed behavior, duplicate/missing/failed evidence, key uniqueness, unknown keys, blocker propagation, warning separation, evidence preservation, set membership, adversarial coverage, writer-table coverage, runtime-test wiring, workflow trigger/security, and referenced-file integrity are guarded.
- Certification workflow has a 10-minute job timeout, read-only contents permission, shallow checkout, credential persistence disabled, and explicit action-major contract (`checkout@v7`, `setup-node@v7`, Node 22).
- Phase-10 recovery guard now recognizes the canonical P1-D Recovery closure track while retaining legacy P1-H/R16 compatibility.

### Completed repository hardening — prior batches
1. Worker workflow security contract.
2. Worker workflow trigger contract.
3. Worker referenced-file integrity guard.
4. Worker workflow coverage guard.
5. Worker runtime-authority contract.
6. Worker workflow timeout contract.
7. Worker workflow meta-guard coverage.
8. Certification workflow action contract.
9. Certification workflow timeout contract.
10. Certification workflow wiring for bounded execution guards.
11. Certification workflow coverage expansion.
12. Explicit separation between repository controls and live operational certification.
13. Adversarial document corpus completeness guard.
14. Adversarial document corpus severity guard.
15. Business golden corpus tenant-integrity guard.
16. Business golden corpus adversarial contract guard.
17. Business golden corpus truth-invariant guard.
18. Wiring of the five corpus guards into Certification Evidence Boundary.
19. Certification workflow coverage expansion for corpus guards.
20. Correction of adversarial fixture contract alignment before certification.
21. Explicit statement that corpus guards do not substitute for live Arabic Golden Corpus or tenant/runtime evidence.

### New completed work — Business Golden Corpus integrity batch
22. Added arithmetic guard locking gross sales, returns, net sales, purchases, inventory value, payments, receivables, and gross-profit derivation against fixture rows.
23. Added referential-integrity guard locking tenant ownership for sale customers, purchase suppliers, sale/purchase products, inventory products, and payment customers.
24. Added row-shape guard requiring the canonical fields for products, customers, suppliers, sales, purchases, inventory, and payments.
25. Added unique-identifier guard for entity IDs plus tenant/SKU uniqueness for inventory and products.
26. Added temporal/value guard enforcing ISO dates, non-negative monetary quantities, positive transaction quantities, return <= gross, and finite numeric values.
27. Wired all five new integrity guards into the Certification Evidence Boundary workflow.
28. Expanded certification workflow coverage so all five new integrity guards are mandatory and cannot silently disappear.

### New completed work — Business Golden Corpus traceability batch
29. Added COGS derivation guard from transaction quantities and canonical product costs.
30. Added transaction-line arithmetic guard for sales gross and purchase totals.
31. Added zero-stock truth guard against the fixture's canonical `zero_stock_skus` set.
32. Added payment/receivables trace guard linking payment rows to tenant-owned customers and expected receivable totals.
33. Added isolation-completeness guard requiring populated, tenant-pure collections and tenant-correct sale/customer links for every golden tenant.
34. Wired all five traceability guards into Certification Evidence Boundary.
35. Expanded certification workflow coverage so the five traceability guards are mandatory.

### New completed work — Brand identity migration
36. Replaced the login-screen business identity with **الأغبري** and **منصة الأغبري لذكاء الأعمال والقرار**.
37. Redesigned the login surface with a branded split presentation, executive positioning, secure-entry indicator, and responsive mobile layout.
38. Rebranded the authenticated sidebar to **الأغبري** with the same canonical brand title and refreshed visual treatment.
39. Added centralized `src/lib/brand.ts` as the source of truth for brand name, title, description, and mark.
40. Added a brand regression contract and dedicated CI workflow preventing the retired identity from returning to the login/sidebar/index surfaces.

### New completed work — large closure batch 01
41. Repaired the Worker checkpoint guard's stale source path and added an explicit advancement-implementation assertion.
42. Completed Tenant-B Golden Corpus profitability truth with `estimated_cogs=440` and `estimated_gross_profit=200`, eliminating a real arithmetic gate failure.
43. Hardened the Golden Corpus arithmetic guard to fail closed when mandatory profitability truth fields are missing or non-finite.
44. Added a recursive source sweep preventing the retired **العامري** identity from reappearing anywhere under active `src` source files.
45. Wired the retired-brand source sweep into the dedicated brand CI workflow and expanded its PR path coverage to the whole `src/**` tree.
46. Repaired Phase-10 recovery-boundary vocabulary drift so the guard follows the canonical P1-D Recovery track while preserving historical compatibility.

### New completed work — large closure batch 02
47. Added explicit checkpoint-resume regression assertions for same-stage resume, backward-stage rejection, and source-hash mismatch rejection.
48. Strengthened the Worker runtime contract output to explicitly include checkpoint-resume coverage.
49. Revalidated the canonical Worker checkpoint implementation against the runtime regression harness after the stale-path repair.
50. Preserved strict tenant/idempotency identity invariants while expanding recovery-path coverage.
51. Updated the authoritative execution index to record the checkpoint-resume closure and current recovery alignment.

### New completed work — operational hygiene + regression alignment batch
52. Corrected checkpoint-resume regression coverage to match the canonical one-argument `resumeFromCheckpoint(checkpoint)` API, including invalid-stage, source-hash, evidence-key, and timestamp rejection cases.
53. Simplified brand workflow path coverage so `src/**` is the single authoritative source-tree trigger without redundant file-specific entries.
54. Added `docs/VERCEL_DEPLOYMENT_RETENTION.md` defining safe Preview/Canceled/Errored retention targets and strict preservation rules for Production, RC, rollback, and certification evidence.
55. Added `scripts/check-vercel-deployment-retention-contract.mjs` plus `.github/workflows/vercel-deployment-hygiene-contract.yml` to prevent unsafe project-wide deletion instructions and retention-policy drift.
56. Verified Vercel project state through the connected project API: Hobby plan, project `report-advisor`, current deployment inventory visible, and no deployment-delete mutation exposed by the available connector; no unsafe deletion was fabricated.

### Current dependency/security observation
- `npm ci` currently reports **21 dependency vulnerabilities (3 low, 4 moderate, 14 high)** in the latest exact-head run. No blind `npm audit fix` is authorized.
- `pdfjs-dist@6.2.108` is already on the patched line for the current 2026 PDF.js advisory.
- `xlsx@0.18.5` remains a separate unresolved high-severity direct dependency decision; no false PASS or blind replacement has been made.

## PARALLEL CLOSURE TRACKS
- **P0-A Authenticated Runtime:** real login/session/browser E2E and authenticated operation matrix.
- **P0-B Tenant A/B:** real cross-tenant adversarial runtime verification with zero leakage.
- **P1-C Production Runtime:** deployment identity, runtime health, Supabase connectivity, smoke, and source-SHA binding.
- **P1-D Recovery:** real backup, restore, migration parity, integrity, RPO/RTO evidence, and rollback drill.
- **P1-E Documents/OCR:** real Arabic Golden Corpus execution and evidence comparison.
- **P1-F Import/Reconciliation:** realistic Excel/import/reconciliation/conflict/canonical-truth business dataset drill.
- **P1-G Workers:** real queue/claim/heartbeat/checkpoint/retry/dead-letter/resume and tenant isolation drill.
- **P2-H Performance:** production-like concurrency, P95 read/write/preview and large-import behavior.
- **P2-I Operations/UX:** observability, PWA/mobile/RTL/slow-network/offline/installability and recovery UX sweep.
- **P2-J Acceptance:** independent business acceptance and final evidence completeness.

Repository-executable fronts continue even when operational fronts are blocked by external access.
