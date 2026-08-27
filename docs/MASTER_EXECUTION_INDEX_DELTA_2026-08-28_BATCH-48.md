# Batch 48 — ABC/XYZ Data Truth Regression

## Finding
ABC/XYZ classification uses annual value and demand-derived variability. The implementation now rejects non-finite annual value and demand inputs at runtime and preserves explicit negative annual-value normalization for cumulative classification.

## Root Cause
The business-truth contract existed in code but lacked executable regression proving runtime rejection of NaN/Infinity and lacked a gate assertion that the executable regression remained wired.

## Fix
- Added runtime finite-value validation to `src/lib/free-toolbox/abc-xyz.ts`.
- Added executable regression at `scripts/abc-xyz-runtime.test.ts`.
- Added `test:abc-xyz-runtime` to `package.json`.
- Hardened `scripts/check-abc-xyz-truth.mjs` to require both runtime validation and runtime regression wiring.

## Consumers
No consumer migration is claimed by this batch. Real Dashboard/Report/Export consumers still require trace-and-verify evidence before consumer certification.

## Regression
Required commands:
- `node scripts/check-abc-xyz-truth.mjs`
- `node --experimental-strip-types scripts/abc-xyz-runtime.test.ts`
- `npm run test:abc-xyz-runtime`

The executable test covers normal classification, non-finite annual values (NaN/+Infinity/-Infinity), and non-finite demand.

## CI
Not yet observed for the latest exact batch HEAD. No PASS claimed.

## Exact SHA
- Branch base: `137facaf513652dd9ec38fc2db03d734dd8c7313`
- Runtime validation: `86105b651c8baa20cc80dd869413e3653aaf5e24`
- Executable regression: `3ffdb99185279a0eaa21b4700be64960be5517e1`
- Package wiring: `f9301b3de16c13b7c8e68cb97b9eac74a594edf0`
- Hardened gate: `ddf9572369e4f23df2fa8301adb4e1cc333da341`

## Remaining Work
- Trace all real ABC/XYZ consumers.
- Verify cross-surface equivalence where ABC/XYZ-derived metrics are exposed.
- Execute regression suite and exact-head CI.
- Runtime/live validation remains separate.
- Do not claim consumer/runtime/live certification from static gates.

## LIVE Required
No local code-only proof can substitute for authenticated tenant/runtime isolation or production corpus validation.

## Certification State
**PARTIAL — RUNTIME REGRESSION IMPLEMENTED; EXECUTION, CONSUMER VERIFICATION, EXACT-HEAD CI, RUNTIME/LIVE CERTIFICATION REMAIN OPEN.**