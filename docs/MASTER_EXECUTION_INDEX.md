# Report Advisor — Master Execution & Truth Index

## OWNER-LEVEL RELEASE CLOSURE — 2026-09-01

This file is the authoritative execution index. Historical PASS remains historical. No PASS may move between branches/SHAs without exact-head evidence.

## Current Truth

- Planning estimate from latest developer assessment: **~88%** overall.
- Independent release-readiness judgment: advanced Release Candidate; **NOT Production Certified / NOT Sellable yet**.
- Current `main` release baseline: `17a49420c70faca143cf7cc58ad11aae6edcb662`.
- Owner integration PR: **#294**, OPEN / NOT MERGED.
- This execution wave adds implementation PR **#300**, OPEN / NOT MERGED.
- PR #300 integration branch current head: see PR metadata / exact latest commit below.
- Do not call branch-local hardening PASS `main` PASS until exact-head CI and merge conditions are satisfied.

## Latest Executed Cycle — 2026-09-01

### Concrete implementation completed in PR #300

1. **Canonical intelligence numeric hardening:** negative/non-finite payment values are sanitized before receivables/payables calculations.
2. **Canonical history hardening:** negative/non-finite sales history is sanitized before trend, velocity, forecast and backtest inputs.
3. **Inventory stochastic-input hardening:** negative/non-finite daily demand is sanitized before stochastic inventory decisions.
4. **CCC period hardening:** invalid/non-positive reporting periods fail to a deterministic safe period rather than reaching CCC as invalid input.
5. **Metric confidence hardening:** explicit NaN/infinite/out-of-range confidence fails closed to zero while omitted confidence retains the established valid-data fallback.
6. **Metric source-evidence hardening:** missing, fractional, negative, NaN or infinite source-row counts become `INSUFFICIENT_DATA` and cannot drive decisions.
7. **AI tenant hardening:** requested and authenticated tenant IDs are type-checked, trimmed and compared against session authority before hosted AI access.
8. **Evidence confidence hardening:** report-fact confidence is normalized to a safe `[0,1]` range and invalid values fail closed.
9. **Evidence provenance hardening:** evidence attachment is now derived from the authoritative ledger rather than preserving caller-supplied evidence.
10. **Executable regression coverage:** focused boundary tests were added for canonical intelligence, metrics, AI tenant policy and report-fact evidence.
11. **CI contracts:** read-only GitHub Actions workflows and deterministic runners were added for the four hardening surfaces.
12. **Release integration:** all of the above were consolidated onto one implementation branch and opened as PR #300 instead of mutating production aliases or fabricating runtime evidence.
13. **CI topology repair:** removed the duplicate `main` push trigger from `final-execution-batch.yml`, leaving its explicit manual execution path intact.
14. **Tenant-isolation workflow repair:** removed the duplicate `main` push trigger from `storage-tenant-isolation.yml`, preserving PR and manual execution.
15. **File-security ESM repair:** normalized `security.ts` imports to explicit `.ts` module paths so the archive traversal regression can execute under Node's ESM resolver.
16. **CI credential hardening:** disabled persisted checkout credentials in the file-intelligence security workflow.
17. **File-security integrity restoration:** restored the complete `security.ts` implementation after the prior branch edit had replaced it with an incomplete prefix; all scanner and duplicate-check exports are present again while retaining explicit ESM imports.
18. **Archive traversal adversarial expansion:** extended the executable ZIP regression matrix to cover backslash traversal, NUL entry names, unsafe uploaded archive filenames and NUL-containing uploaded filenames, in addition to POSIX/Windows absolute and nested parent traversal.
19. **Security-definer contract hardening:** the repository security-definer verifier now strips SQL comments before matching function definitions/grants, preventing commented-out SQL from satisfying the exposure contract.
20. **AuthGate dead-state removal:** removed an unused authenticated-user React state while preserving session/tenant authority checks and the fail-closed tenant-missing screen.
21. **KPI rendering cleanup:** removed an unused status-color map; status semantics and insufficient-data presentation remain unchanged.
22. **Data-quality runtime cleanup:** removed duplicate type imports while retaining the public type re-exports and validation boundary.
23. **Decision-engine cleanup:** removed an unused safety-metric import without changing decision calculations or thresholds.
24. **Semantic-metric cleanup:** removed a duplicate freshness import while retaining the explicit public freshness re-export.
25. **Golden-evidence integrity hardening:** executable contract now ignores malformed result records and requires boolean `passed` values, preventing truthy non-boolean evidence from counting as PASS.
26. **Golden-score identity hardening:** executable contract rejects malformed results, duplicate identities, empty expected IDs and empty corpora; readiness remains fail-closed.
27. **OCR confidence boundary expansion:** executable contract now covers negative infinity, negative confidence, threshold equality, out-of-range clamping, string confidence, Unicode whitespace and null text.
28. **Customer-product continuity hardening:** malformed rows, blank identities/periods and non-finite/negative numeric inputs are excluded or normalized before continuity, loss and fill-rate calculations.
29. **Batch decision input hardening:** non-array batches, malformed rows and blank group IDs now fail closed before any decision calculation.
30. **Data-quality runtime import simplification:** removed redundant multiline import syntax while preserving validation and type re-export behavior.
31. **Batch decision numeric strictness:** decision metrics now reject numeric strings and other coercible non-number values instead of silently converting them into decision inputs.
32. **Customer-product runtime contract:** continuity analysis now explicitly fails closed when its top-level input is not an array, preventing malformed runtime payloads from reaching grouping logic.
33. **Import write-guard resilience:** direct-write detection now strips comments before scanning import UI source, preventing commented examples from creating false violations while retaining the real-write guard.
34. **Tenant adversarial regression expansion:** tenant-boundary contract now executes concrete adversarial fixtures for browser storage, query parameters, client-selected filters, browser globals and static tenant fallbacks.
35. **Watched-report path boundary expansion:** executable watched-report contract now includes NUL/control-character path fixtures alongside traversal, absolute-path and Windows-drive cases.
36. **Golden-evidence identity contract:** golden evidence now requires array inputs, non-empty unique expected IDs and fails closed on malformed top-level inputs.

### Exact implementation chain

- Branch: `codex/release-hardening-integration-20260901`
- Latest code commit before this index update: `87abbe7611931d23b0c41abc419770c84fdb9cc6`
- This index update is documentation-only and must not be treated as code certification.

## Certification Boundaries

- Production runtime: **BLOCKED — external operational access required**.
- Authenticated E2E: **BLOCKED — real authenticated session required**.
- Live Tenant A/B isolation: **BLOCKED — real tenant credentials/session required**.
- Backup/Restore: **BLOCKED — actual DB operational evidence required**.
- Rollback: **BLOCKED — actual deployment/alias operational evidence required**.
- Production alias binding: **NOT CERTIFIED**; no alias mutation or rollback is authorized by this index.
- Vercel deployment quota may remain an external blocker; do not convert quota failure into a code PASS.

## Execution Rules

1. Continue independent implementation fronts while external operational blockers remain.
2. Every execution cycle must add at least five real implementation/verification improvements beyond discovery-only work.
3. Never fabricate CI, runtime, tenant, backup, restore, rollback or production evidence.
4. Never mutate protected production aliases merely to obtain evidence.
5. Do not reopen closed work unless new concrete evidence identifies a regression.
6. Exact SHA is the only certification identity.
