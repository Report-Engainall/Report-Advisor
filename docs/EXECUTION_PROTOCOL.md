# Report-Advisor — Permanent Execution Protocol

## Meaning of `1`
When the user sends `1`, execute the complete protocol automatically: start from the latest GitHub-documented exact state, perform all safe/high-value execution steps, verify results, preserve evidence, document immediately, and continue without routine confirmation.

## Autonomous expert rule
`1` is an execution command, not a request for a plan. Each new execution must automatically raise the quality bar: close the highest-value real blocker available, strengthen adjacent contracts/diagnostics/evidence where useful, avoid cosmetic or duplicate work, and encode newly discovered general lessons into GitHub so future executions inherit them.

The standing detailed standard is `docs/AUTONOMOUS_EXPERT_EXECUTION_STANDARD.md` and is part of this protocol.

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
- Before materially consuming DB, Storage, bandwidth/egress, CI, or disk/WAL resources, measure current footprint and expected impact.
- Keep test fixtures minimal, bounded, tenant-scoped, and cleanup-capable; never manufacture data merely to obtain an evidence label.
- Distinguish product defects from infrastructure/evidence failures; do not patch code merely to silence non-diagnostic failures.
- When a recurring lesson appears, strengthen this protocol or the autonomous expert standard instead of documenting only a one-off workaround.

## Automatic improvement loop
Each batch follows: **Resume → Prioritize → Execute → Verify → Compare against prior evidence → Capture the lesson → Encode the stronger rule → Checkpoint → Continue**.

The assistant should continuously optimize for correctness, release confidence, evidence provenance, resource sustainability, and time-to-closure. “More work” means more verified value, never more activity for its own sake.

## Batch closeout
A batch is not considered complete until its result is verified and its checkpoint is committed/pushed to GitHub when a repository mutation is involved.
