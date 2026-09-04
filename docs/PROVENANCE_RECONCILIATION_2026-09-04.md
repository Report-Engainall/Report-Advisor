# Provenance Reconciliation — 2026-09-04

## Rule
This record is append-only. No historical evidence, commit, branch, or certification result is deleted, rewritten, or transferred across exact-SHA boundaries.

## Current certification boundary

- Frozen failed boundary: `798ef363e074e0263c156578c229a94adb88be13`
- Parent frozen failed boundary: `21b15503871f3fca8c9d811ee4c65eabfc81befc`
- PR #311: open / draft / not merged
- Certification: NOT PROVEN

## Reference classification

| Reference | Classification | Certification use |
|---|---|---|
| `083225068f1e2d390f6e1d50e8b178a1e8e1bacb` | CURRENT MAIN REFERENCE observed by repository provenance at the audited boundary | Valid only when independently tested on this exact SHA or governed ancestry |
| `b44a823b22653aded1408d36c6e5a109e4df4c3d` | HISTORICAL / STALE FOR CURRENT CERTIFICATION | Historical evidence only; never inherited by `798ef3...` |
| `a1e1426eebe56b14e5271e504918a3d96be22a03` | HISTORICAL / STALE FOR CURRENT CERTIFICATION | Historical evidence only; never inherited by `798ef3...` |
| `798ef363e074e0263c156578c229a94adb88be13` | FROZEN FAILED CURRENT BOUNDARY | Failure evidence only; no rerun substitution |

## Index discrepancy observed

`docs/MASTER_EXECUTION_INDEX.md` at `798ef3...` still names `b44a823...` as current main and `a1e1426...` as current code/test candidate. Those references are preserved as historical text. This reconciliation does not rewrite them; it explicitly records that they are not valid substitutes for the current frozen failed boundary.

## noFollow repair provenance

- Repair branch starts from `798ef363e074e0263c156578c229a94adb88be13`.
- Repair SHA: `deab8ca5f8971a2b0eacf2bdb183c2e60036cc56`.
- Repair scope: test-of-test only; no production filesystem code changed.
- Fresh CI must be evaluated against `deab8ca5...` itself.
- Evidence from `798ef3...` remains frozen failure evidence and is not converted into pass evidence.
