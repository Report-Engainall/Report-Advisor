# Head Coordination Protocol — 2026-09-18

## Purpose

This protocol prevents UI, integration, runtime, and certification reports from accidentally treating different Git SHAs as one "current head".

## Authoritative roles

`main` is the protected production baseline.

`ui/aghbari-command-wave2-20260918` is the Owner 1 product/UI development branch.

`integration/certification-candidate-20260918` is the Owner 2 integration, runtime, DB, CI, and certification branch.

Only the integration branch HEAD can be called the certification source.

## Required preflight

Run:

```text
node scripts/check-head-coordination.mjs
```

The command reads the live remote refs and prints:

```text
MAIN_HEAD
UI_HEAD
INTEGRATION_HEAD
WORKTREE_HEAD
WORKTREE_BRANCH
WORKTREE_DIRTY
CURRENT_BRANCH_ROLE
CERTIFICATION_SOURCE
EVIDENCE_TRANSFER
```

A handoff is invalid when the worktree is dirty, the local owner branch does not match its remote HEAD, a required remote ref is missing, or work is being performed directly on `main`.

## Reporting contract

Every execution report must identify the exact branch and full SHA. Never write only `CURRENT EXACT HEAD`.

Use one of:

```text
MAIN HEAD: <sha>
UI HEAD: <sha>
INTEGRATION HEAD: <sha>
```

For the owner handoff also include:

```text
NEXT HANDOFF
Target branch: <branch>
Source SHA: <sha>
Expected verification SHA: <sha after integration>
Certification Candidate: YES|NO
```

## Evidence rule

PASS is bound to the exact SHA on which the evidence was generated. Evidence is never transferred automatically from UI HEAD, older integration HEADs, or older deployments to a newer candidate.

A code change after the last certification candidate creates a new candidate and requires the applicable exact-head reproof.

## Parallel work rule

Owner 1 may continue UI development while Owner 2 works on runtime/DB/CI. Neither owner may call its own branch the final certification head.

The flow is:

```text
UI HEAD
   -> handoff
INTEGRATION HEAD
   -> exact-head runtime proof
CERTIFICATION
```

## Final candidate rule

When UI changes are handed off, Owner 2 creates/updates the integration candidate and records the new full SHA. Runtime and certification work then runs only against that SHA until the next handoff.

Historical SHA references remain historical. They may explain prior work but may not be used as current certification evidence.
