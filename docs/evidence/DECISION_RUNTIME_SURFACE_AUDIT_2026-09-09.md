# Decision Runtime Surface Audit — 2026-09-09

## Scope
This audit binds the visible Decision Experience lifecycle to the existing runtime service boundary without claiming live execution.

## Runtime capabilities verified in source
`vertical-slice-runtime.ts` exposes durable RPC-backed operations for:

- create decision
- request approval
- decide approval
- create work item
- start work item
- notify work item
- complete work item
- load work-item outcome

The runtime boundary resolves the authenticated company context before privileged operations where required.

## UI boundary
`DecisionExperiencePage.tsx` exposes six lifecycle stages:

1. Command
2. Evidence
3. Decision
4. Approval
5. Work
6. Outcome & Learning

Approval and Work remain explicitly `RUNTIME_REQUIRED` until authenticated runtime evidence exists. The UI does not create local approval/work state.

## Outcome truth
Persisted outcomes are loaded through `loadPersistedOutcomes(companyId)` and are tenant-checked. Only outcomes with an evidence snapshot are surfaced. The selected recommendation is matched by exact `decisionFingerprint` equality; no fuzzy or positional matching is allowed.

## Contract guard
`scripts/check-decision-runtime-surface-contract.mjs` verifies the lifecycle tokens, tenant boundary, persisted outcome source, exact outcome matching, and absence of synthetic/local runtime fallbacks.

## Certification boundary
This audit proves repository wiring and contract shape only. It does not certify authenticated production runtime, live Tenant A/B isolation, backup/restore, rollback, or an end-to-end approval/work/outcome execution. Those require fresh operational evidence.
