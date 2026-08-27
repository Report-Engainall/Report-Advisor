# Report Advisor — Execution & Evidence Delta — Batch 34
Date: 2026-08-27

## Exact execution head
- Current HEAD: `011e8871a1f8ef2249d88072e32052f4bd76161a`
- PR: #45
- Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`
- Latest quality run: `33071736008` — QUEUED at capture time.
- Prior exact-head failure: run `32928717071` on requested `407e6bb1e506a29ae35f741d5530400a3675b9a9` was not a valid commit in GitHub; the actual PR head at that point was `b23bbfa51cf13b43fa7dddfd7fa59f2acab78c3d`.

## Findings closed in this batch

### F34-01 — canonical query TypeScript resolution
- Root cause: the explicit `@/lib/queries` path override in `tsconfig.app.json` was not resolving the canonical module in CI, producing TS2307 across the App, import, dashboard, entity, intelligence and reports consumers.
- Fix: explicit `baseUrl: "."` plus canonical `@/lib/queries -> src/lib/queries` mapping.
- Regression: existing canonical-query alias gate remains enabled.
- Evidence: failed run `32928717071` proved the failure; new exact head `36b0b8755119e458293d1f1a9e7d272bd1f33e1d` triggered a fresh quality run.

### F34-02 — Receivables missing evidence was being dropped
- Root cause: the canonical receivables SQL filtered out rows with NULL `total` or `paid_amount`, which converted absence of evidence into absence of records.
- Fix: retain incomplete rows, classify them explicitly as `INCOMPLETE`, expose `incomplete_rows`, and return `INSUFFICIENT_DATA` when incomplete financial evidence exists.
- UI now surfaces the incomplete count instead of silently presenting a complete-looking report.
- Regression: `check-receivables-truth-contract.mjs` now requires incomplete-row retention and rejects filtering patterns.

### F34-03 — Alternative-group tenant authority was caller-supplied
- Root cause: sensitive SECURITY DEFINER RPCs accepted `p_company_id`, even though they validated it against `current_company_id()`. This created an unnecessary caller-controlled tenant authority surface.
- Fix: new migration `20260827123000_alternative_group_canonical_tenant.sql` drops the old overloads and recreates the RPCs with server-derived tenant authority only.
- Consumers updated: `AlternativeGroupsPage.tsx` no longer supplies a tenant id to the sensitive RPCs.
- Regression/gate: `check-alternative-group-tenant-authority.mjs` added and wired into quality CI.

## CI truth
- Run `32928717071`: FAILED at Typecheck. This was a real code/config topology failure, not flaky CI.
- Run `33071607970`: FAILED at Canonical query alias closure because the first attempt removed the explicit alias expected by the existing gate; this exposed a contract mismatch and was fixed rather than suppressed.
- Run `33071669717`: fresh exact-head run for `36b0b875...`, queued/in progress at capture; not certified.
- Run `33071736008`: current exact-head run for `011e8871...`, queued at capture; not certified.

## Current status
- Receivables truth: IMPLEMENTED + regression-enforced; CI exact-head certification pending.
- Tenant sibling sweep: ACTIVE; alternative-group caller authority finding fixed and newly gated.
- Export truth: partial/current-page exports explicitly named; full consumer-family sweep remains open.
- Profitability: server-backed report work exists, but financial truth remains OPEN for full contract/equivalence proof.
- BI ↔ Decision ↔ Analytics ↔ Export equivalence: OPEN.
- Worker failure-state/recovery: foundation exists; runtime crash/restart evidence remains LIVE REQUIRED.
- Storage/Realtime/AI/Vector: static sibling sweep remains OPEN; no runtime certification claimed.
- Semantic NULL/UNKNOWN sweep: ACTIVE; receivables uncovered a real missing-evidence-to-absence issue.
- Runtime evidence: NO RUNTIME EVIDENCE for these newly changed boundaries.
- Production certification: NOT PRODUCTION CERTIFIED.

## Next active fronts
1. Finish exact-head CI on `011e8871...`.
2. Sweep remaining tenant-sensitive RPCs for caller-supplied authority.
3. Complete profitability financial truth contract and cross-surface equivalence.
4. Complete export consumer-family scan and pagination→export regression.
5. Continue NULL/UNKNOWN/MISSING/EMPTY/ZERO semantic sweep.
6. Worker state-machine retry/recovery sibling sweep.
7. Storage/Realtime/AI/vector tenant isolation static audit.
8. Convert CI-stable fronts into explicit runtime drills; do not label them LIVE without evidence.
