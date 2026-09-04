# Governance Boundary Correction Proposal — 2026-09-04

## Status

PROPOSAL ONLY — NO CODE OR CANDIDATE MUTATION EXECUTED.

## Current indexed candidate

`a1e1426eebe56b14e5271e504918a3d96be22a03`

## Repair successor under review

`deab8ca5f8971a2b0eacf2bdb183c2e60036cc56`

## Findings

The certification boundary checker reads the current code/test candidate from `docs/MASTER_EXECUTION_INDEX.md`; it does not independently select the candidate. The checker permits a differing HEAD only when the diff is governance-only and the indexed candidate is an ancestor of the HEAD.

The current noFollow repair `deab8...` is a descendant of the frozen failed `798ef3...` repair path, but `a1e1426...` is not an ancestor of `deab8...`. Therefore changing only the index candidate would be a governance correction, but the authoritative index itself must be preserved byte-for-byte except for the explicitly authorized candidate binding line/section.

## Required correction

If and only if the complete authoritative index can be updated with exact preservation of all unrelated content, change the current code/test candidate binding from `a1e1426...` to `deab8...`.

No production code, test semantics, expected values, migrations, RPCs, or security privileges are part of this correction.

## Provenance requirements

- Old indexed candidate: `a1e1426eebe56b14e5271e504918a3d96be22a03`
- Proposed new candidate: `deab8ca5f8971a2b0eacf2bdb183c2e60036cc56`
- Proposed correction type: GOVERNANCE/DOCUMENTATION ONLY
- Production changes: NONE
- Test semantics changes: NONE
- Expected values: NONE
- Migrations: NONE
- RPC changes: NONE
- Security privilege changes: NONE

## Safety decision

This proposal deliberately does not mutate `docs/MASTER_EXECUTION_INDEX.md`. The available update mechanism requires replacement of the complete UTF-8 file. Without the exact complete source payload and an independently verified preservation diff, performing the update would violate the owner's no-loss/no-reordering requirement.
