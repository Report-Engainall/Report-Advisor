# Execution Checkpoint — 2026-09-07 Batch 23

## Objective
Advance the Vercel-first execution ladder so authenticated browser certification can run from a hosted deployment on GitHub Actions without requiring a physical/local device.

## Completed

1. Added `.github/workflows/remote-browser-e2e.yml`.
   - Manual `workflow_dispatch` accepts an exact Vercel deployment URL and expected Git SHA.
   - Runs Chromium on `ubuntu-22.04` in GitHub Actions.
   - Reuses the existing authenticated browser and real-business E2E harnesses.
   - Uses only repository Secrets for Supabase URL/anon key and Actor A/B credentials; no credentials are written to code or artifacts by this workflow.
   - Verifies hosted deployment reachability before authenticated execution.
   - Fails closed when any required authentication secret is missing.
   - Uploads browser/business evidence as Actions artifacts.
   - Does not promote aliases, mutate production bindings, or alter frozen RCs.

2. Vercel exact-head observation after the workflow commit:
   - Deployment: `dpl_HFEmL2Lj6NQ56MV1hqEQoSFo8nu8`
   - URL: `report-advisor-bbmg5ptb7-injaz2.vercel.app`
   - Git SHA: `703598165a587a16d83cc16ebb3d96cef3ad8e0b`
   - Branch: `fix/runtime-provenance-20260906`
   - State observed: `BUILDING` at checkpoint time.
   - Branch alias: `report-advisor-git-fix-runtime-provenance-20260906-injaz2.vercel.app`

3. Prior exact-head Vercel verification remains valid only for its own SHA:
   - `5b083100d463aae4a4cf22ebbbff7e1470749b1f` was observed as READY on the production target deployment `dpl_Ehzx6xKtPVsFLuucn7uHa14GT5kp`.
   - This is not transferred as evidence to `703598165a...`.

## Verification boundary

- The new remote browser workflow is source-present and committed.
- The hosted deployment for the new workflow commit was observed in Vercel and was still building at the final poll.
- Authenticated E2E has **not** been claimed PASS.
- No production alias mutation or rollback was performed.
- No secrets were exposed or copied into repository files.

## Material execution gain

The project now has a concrete hosted-browser certification path: GitHub Actions can drive Chromium directly against an exact Vercel deployment instead of starting the application on a developer machine. This removes the physical-device/local-runtime dependency for the browser-certification portion whenever the existing test-only Secrets are provisioned.

## Remaining highest-value actions

- Verify the `703598165a...` Vercel deployment reaches READY and preserve exact-SHA evidence.
- Dispatch the new remote browser workflow against that exact deployment when GitHub Actions dispatch is available, using the repository's existing test-only Secrets.
- If the workflow is blocked by missing Secrets, preserve the fail-closed evidence and investigate only the environment/provisioning boundary; never manufacture authentication evidence.
- Continue migration/live provenance reconciliation and legitimate worker lifecycle testing independently.
