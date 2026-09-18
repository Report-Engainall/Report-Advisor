# REPORT-ADVISOR — EXECUTION START HERE

This is the single entrypoint for any new coordinator, programmer, reviewer, or automation agent.

## Start sequence

1. Read `docs/CONTINUOUS_OPERATIONAL_MEMORY.md`.
2. Read `docs/CONTINUOUS_OPERATIONAL_STATE.json`.
3. Verify the current Main SHA directly in GitHub.
4. Verify every relevant PR head SHA directly in GitHub.
5. Re-check only the active-front items whose SHA/environment changed or whose next gate requires fresh proof.
6. Execute the next independent queue item.
7. Record exact SHA, environment, action, result, invalidated evidence, blocker state, and next action.
8. End the cycle only after the memory files are updated.

## Source of truth

Priority order:

`GitHub repository / exact runtime evidence`
→ `continuous operational memory`
→ `chat / pasted reports`

A pasted programmer report is never required to reconstruct history.

## Fail-closed rules

Never:
- invent PASS;
- invent credentials, JWTs, sessions, fixtures, or runtime evidence;
- transfer evidence across SHAs;
- weaken a gate to obtain PASS;
- duplicate an existing runner/RPC architecture;
- mutate production for forensic purposes without explicit operational authorization;
- wait on one blocked front while independent work is executable.

## Required handoff

Every material code/evidence change must be resumable by the next agent with:

`READ → VERIFY EXACT HEAD → EXECUTE → PROVE → RECORD → ADVANCE`

The repository must remember the work.
