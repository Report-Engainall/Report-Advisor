# Report-Advisor — Permanent Execution Protocol

## Meaning of `1`
When the user sends `1`, execute the complete protocol automatically: start from the latest GitHub-documented exact state, perform all safe/high-value execution steps, verify results, preserve evidence, document immediately, and continue without routine confirmation.

## Mandatory continuity rule
After **every execution batch**, immediately record on GitHub what was done, what was verified, what remains blocked/open, the exact SHA/branch, evidence references, and the next execution point. A chat report alone is not sufficient documentation.

At the next `1`, read the **latest GitHub-documented checkpoint first** and continue from it. Do not restart discovery or repeat completed work. Re-run only when code/state changed, evidence expired, a new defect/reason exists, or certification requires a fresh exact-head proof.

## Execution rules
- No routine confirmation for safe execution.
- Execute, verify, document, then continue.
- Never claim PASS without evidence at the required boundary.
- Never promote old evidence to a new exact SHA.
- Do not reopen closed findings without a new reason.
- Do not mutate frozen RC/certification boundaries unless explicitly authorized by the governing protocol.
- Prefer parallel/high-value fronts; do not sit idle on external blockers.
- Every meaningful mutation must be traceable to GitHub.
- Preserve exact SHA, branch, CI status, and evidence boundary at each checkpoint.

## Batch closeout
A batch is not considered complete until its result is verified and its checkpoint is committed/pushed to GitHub when a repository mutation is involved.
