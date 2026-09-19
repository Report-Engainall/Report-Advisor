# Architecture Consolidation Register

## Baseline
- Base Exact HEAD: `53c520bd9f34c21fc195df6f37861624014c4004`
- Consolidation branch: `refactor/consolidation-20260919`
- Rule: consolidate implementation, not semantics. A similarly named module is not removed until its contract and consumers are understood.

## Canonicalization completed in this wave

| Surface | Canonical implementation | Legacy surface | Treatment |
|---|---|---|---|
| Intelligence pages | `src/pages/IntelligencePage.tsx` | `src/pages/IntelligencePages.tsx` | Re-export only; no second UI implementation |
| Receivables report | `src/pages/ReceivablesReportCanonicalPage.tsx` | `src/pages/ReceivablesReportPageCanonical.tsx` | Re-export only; no second report implementation |
| Folder handle persistence | `src/lib/import/folder-handle-store.ts` | `src/lib/import-pipeline/folder-handle-store.ts` | Re-export only; stronger canonical implementation retained |
| Data-quality score | `src/lib/free-toolbox/data-quality-score.ts` | `src/lib/free-toolbox/data-quality-gate.ts` | Gate is now policy adapter over canonical score math |

## Deliberately retained as separate bounded contracts

### Decision arbitration
- `decision-arbitration.ts`: signal-group arbitration. Input is a group of source signals and output is a coarse decision state.
- `decision-arbitrator.ts`: decision-candidate scoring. Input is a candidate with urgency/impact/liquidity/evidence and output is ranked decision candidates.

These are different contracts and must not be collapsed into one overloaded function merely to reduce file count.

### Action planning
- `action-planner.ts`: converts generic action signals into priority/status plans.
- `action-plan.ts`: converts already-arbitrated decision candidates into approval-aware execution steps.

These represent two pipeline stages. The intended chain is:
`signal planning -> decision arbitration -> action plan`.
They should share canonical types where practical, but are not duplicate implementations.

## Import architecture

Canonical rule:
- UI/external integration code imports from `src/lib/import/*`.
- `src/lib/import-pipeline/*` is compatibility-only unless a capability is proven to belong exclusively to pipeline orchestration.
- New folder-handle persistence APIs must be added only to the canonical store.

## Page architecture

Canonical rule:
- One route surface -> one implementation file.
- Legacy filenames may remain temporarily as zero-logic re-export adapters.
- No new feature work may be added to a compatibility file.

## Quality architecture

Canonical rule:
`dimensions -> qualityScore -> gate policy -> decision eligibility`.

There must be one scoring formula. Gates may apply different policy thresholds, but must not recalculate a second score.

## Next consolidation wave

The next targets are not blind deletions:
1. audit the 470 scripts into authority families;
2. identify duplicate CI assertions and historical wrappers;
3. consolidate report/evidence abstractions where the contracts are actually equivalent;
4. audit `free-toolbox` vs `intelligence` for true semantic duplication;
5. delete compatibility adapters only after repository-wide consumer scan proves they are unused.

## Hard guardrails

- No deletion based on filename similarity alone.
- No changes to `main` from this consolidation branch.
- No weakening of fail-closed behavior.
- No new Runner/RPC introduced solely as part of cleanup.
- Every removed implementation must have exactly one surviving canonical contract.
