# Universal import identity fallback and contract hardening

**Date:** 2026-09-08
**Branch:** `fix/folder-sync-universal-persistence`

## Closure batch

This batch hardens row identity resolution without changing the server-side authorization boundary.

### Changes

1. Customer identity is now a deterministic fallback chain: `code` is authoritative when present; `name` is used only when code is absent.
2. Customer code changes are therefore classified as the same entity with a conflict rather than incorrectly becoming a new row.
3. In-batch regression coverage now includes three identical incoming rows and three conflicting rows, ensuring later rows remain anchored to the first incoming identity.
4. The existing canonical/source field lookup behavior remains intact: source headers are checked before canonical mapped fields.
5. The dedicated CI contract explicitly enables Node TypeScript stripping so the `.mjs` contract can import the TypeScript intelligence module reliably under Node 22.

## Exact implementation commits

- `1b32590e5f1bde8c785c0014f6947a9128e38b0b` — deterministic customer identity fallback.
- `0f11c0fb86e008f7d3f05921d3c3d88a1d044002` — expanded in-batch identity regression contract.
- `45bfdbd5729aa0ddb43335563b17edd7164e873a` — explicit TypeScript stripping in CI.

## Verification boundary

The contract is designed to fail closed on identity regressions. This evidence does **not** claim authenticated browser E2E, live Tenant A/B isolation, production runtime certification, backup/restore certification, rollback certification, or a successful Vercel deployment.

## Expected outcomes

- First unseen identity: `new`.
- Repeated identical incoming identity: `candidate_duplicate` anchored to the first incoming row.
- Repeated incoming identity with changed content: `conflict` anchored to the first incoming row.
- Existing tenant row with same authoritative identity and changed content: `conflict`.
- Customer without code falls back to name for identity matching.
- Customer with code does not silently switch identity when the name changes.
