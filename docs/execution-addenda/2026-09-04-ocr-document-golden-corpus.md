# 2026-09-04 — OCR / Document Golden Corpus Execution Addendum

## Exact provenance

- Repository: `Report-Engainall/Report-Advisor`
- Main/base: `083225068f1e2d390f6e1d50e8b178a1e8e1bacb`
- Execution branch: `execution/owner-level-compatibility-hardening-main`
- PR: `#310` — OPEN / NOT MERGED
- Previous exact candidate: `266ca96a6d8a65471a48c1fd489281cc5def7cd3`
- OCR implementation mutation commits: `82774bc2ed8b566c7491ab26a0f61095a3642321`, `fadd90cc01add3ef250dcb218de4f3ef3cbc284f`, `629fe760704cd3df517b9588ce0d108fad24403e`, `90bb401e4abb5ad34fd341c2265a21e043ce4cda`
- Exact candidate after OCR workflow binding: `a97bfd3d756c75bda29fb6700d305a9ab0376afe`
- Worker mutation ancestry remains `ec2c6babef8176044ba63892e6638f23904db1d2`; the prior `da0c204...` was a candidate/index binding commit, not an OCR mutation.

## Surface discovered

Document Intelligence contains Python pipeline contracts and JS/TS validation plus existing corpus/closure gates:

- `services/document-intelligence/app/pipeline.py`
- `services/document-intelligence/app/contracts.py`
- `services/document-intelligence/app/intermediate_model.py`
- `services/document-intelligence/app/numeric_normalization.py`
- `services/document-intelligence/tests/test_pipeline.py`
- `services/document-intelligence/tests/test_numeric_normalization.py`
- `src/lib/document-intelligence/validation.ts`
- `src/lib/document-intelligence/validation.adversarial.test.ts`
- `scripts/adversarial-document-corpus.mjs`
- `scripts/adversarial-document-corpus.test.mjs`
- `scripts/document-intelligence-golden-corpus.mjs`
- `scripts/document-intelligence-golden-corpus.test.mjs`
- `.github/workflows/document-intelligence-closure.yml`

The pipeline computes a SHA-256 source fingerprint before parsing, preserves the inspected source hash, rejects provider hash disagreement, uses confidence gating, and has explicit lifecycle transitions. Cell-level provenance includes page/table/row/column/cell/bounding-box lineage. These are contract observations, not production-runtime certification.

## Golden corpus

The new deterministic corpus contains 54 cases covering the requested matrix: Arabic/Western numerals, Arabic decimal/thousands separators, mixed styles, empty/whitespace/malformed/non-finite/NULL/missing values, negatives/zero/large finite values, duplicate and missing business keys, ambiguous/conflicting mappings, header defects, Unicode/Arabic filenames, multi-page and partial extraction, low confidence/quarantine, inconsistent totals, source hash/change, replay/duplicate submission, unreadable binary, extension mismatch, formula error, duplicate/missing rows, double counting, wrong unit, rounding drift, stale/cross-tenant fingerprints/sources/artifacts, conflicting values, and explicit empty/malformed-to-zero attempts.

## Repair

Added deterministic `normalize_numeric_text()` using `Decimal`, Arabic digit translation, explicit Arabic separator normalization, whitespace removal, structural grouping checks, and finite-value rejection. Empty or malformed strings do not become zero.

Expanded `validation.adversarial.test.ts` to mutation-check null, blank/whitespace, finite-value, malformed-to-zero, and acceptance weakening paths.

Added `document-intelligence-golden-corpus.test.mjs` with mutation-sensitive checks for empty guards, finite guards, Arabic decimal/thousands normalization, and quarantine behavior.

## Actual execution

A local isolated execution of the exact normalized Python implementation passed the core Arabic/Western numeric golden cases and fail-closed invalid cases:

- `PY_NUMERIC_GOLDEN=PASS`
- 8 explicit numeric conversion cases exercised
- empty/whitespace/malformed/NaN/Infinity/NULL/boolean/ambiguous grouping rejected

Repository-side execution through GitHub Actions is not yet available for the new exact candidate. `fetch_commit_workflow_runs` for `a97bfd3d756c75bda29fb6700d305a9ab0376afe` returned no workflow runs. Therefore no CI PASS is claimed.

## Test-of-test boundary

The golden checker intentionally weakens critical normalization predicates and requires the weakened source to be detected. The TypeScript validation adversarial suite independently mutates the numeric guards. This is checker-level evidence only until fresh CI executes the files on the exact candidate.

## Bypass search

Searched the repository tree and document-intelligence workflow/script surface for alternate document-intelligence implementations. Existing legacy corpus and closure checks remain in place. No second numeric-normalization implementation was promoted as canonical during this pass. Existing parser/provider contracts remain adapter boundaries; source hash is rechecked at parser output.

## Tenant / provenance boundary

Document envelope/provenance structures carry source identifiers and source hashes. This addendum does not claim live Tenant A/B document runtime isolation, artifact ownership runtime, or authenticated production OCR execution. Those remain evidence-bound blockers where external runtime access is required.

## Cross-regression

Report/export, worker, tenant isolation, artifact runtime, and authenticated browser runtime were not promoted from static evidence. Existing workflows retain their own gates. The document workflow was strengthened to run on exact PR head and assert `git rev-parse HEAD` equals the PR head SHA before tests.

## CI / blockers

- Fresh exact-SHA CI: **NOT PROVEN**
- Vercel deployment: **BLOCKED by previously observed rate-limit**
- Production OCR runtime: **NOT PROVEN**
- External artifact runtime: **BLOCKED**
- Authenticated A/B: **BLOCKED**
- Backup/Restore: **BLOCKED**
- Rollback/Forward Recovery: **BLOCKED**
- Native Windows: **BLOCKED**

## Status rule

`CONTRACT PASS` and local isolated test execution do not equal `RUNTIME PROVEN`; neither equals `PRODUCTION CERTIFIED`.

Certification remains **NOT CLOSED** and Production Certified remains **0%**.

## Next executable front

After fresh exact-SHA CI becomes available, continue with P1 Scale/Performance while keeping Tenant/Security and artifact/runtime evidence open in parallel. Any newly discovered P0 supersedes that order.
