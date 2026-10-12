# Live Resume — 2026-10-11 20:30 +03:00

## Repository and exact refs
- Repository: Report-Engainall/Report-Advisor
- Branch: fix/source-bound-generic-intelligence-20261009
- PR: [#912](https://github.com/Report-Engainall/Report-Advisor/pull/912), OPEN / NOT MERGED.
- Branch head before this checkpoint: `9f2d7b39aa6d73e3c680b0a7870bd27f056f1d4b`.
- Main/base: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- This update is a single atomic documentation checkpoint over the verified parent; exact resulting commit SHA must be verified after commit creation.

## Current root cause and product shape
The general intelligence core is already present and must not be rebuilt. The generic layer coexists with eligible specialty intelligence, the detail mapping returns a separate `genericIntelligence`, and UI surfaces use source identity. The latest known browser defect was `inventory: source hash missing`. Root-cause review established that `/reports/inventory` renders through `ReportsPage → SourceBoundDomainSurface → CustomerReportSurface`; rendering the hash only in `SourceBoundReportSurface` was a wrong-surface patch. Current product fix adds the full `sourceHash` to `CustomerReportSurface` with `data-testid="customer-report-source-hash"`, and the current UI contract checks that surface.

## Exact-head workflow state captured
| Gate | Run | State at capture |
|---|---:|---|
| Full Product Browser E2E | [38159739343](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159739343) | PENDING |
| Product Build Gate | [38159739335](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159739335) | QUEUED |
| Quality | [38159739332](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159739332) | QUEUED |
| Session Handoff | [38159739357](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159739357) | PENDING |
| Final Certification | [38159739368](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159739368) | QUEUED |
| Device-Independent Browser E2E | [38159739338](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159739338) | QUEUED |
| Phase-F live resilience | [38159739385](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159739385) | QUEUED |
| Data-quality runtime | [38159739327](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159739327) | IN_PROGRESS |
| Report Value Cohort | [38159739145](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159739145) | IN_PROGRESS |

These are observations before the documentation checkpoint and may be superseded. Queued/pending/in-progress are not passes. The Netlify preview status was green for the prior SHA; Vercel was pending. No current-head authenticated browser/readback/production pass is claimed.

## Scope and integrity
- Preserve `universal-report-intelligence.ts`, `generic-intelligence.ts`, `report-smart.ts`, `UniversalIntelligenceChain.tsx`, the current File Lab and Smart Report screens.
- Validate the actual rendered component and route, not a sibling component or static label.
- Keep universal analysis plus eligible specialty analysis, with all facts/signals/recommendations/evidence grounded in the same `reportJobId + sourceHash`.
- No fabricated metrics, causes, benchmarks, money impact, or claims based only on build/preview status.

## Required proof and next action
1. Refresh exact-head Browser/Build/Quality results and inspect the first terminal failure.
2. Prove `/reports/inventory` displays the exact full source hash and that its job ID/hash match Smart Report and Evidence routes.
3. Prove fresh upload → generic plus applicable specialist output → evidence/recommendations → saved report readback → reload/re-entry with the same source identity.
4. Re-check Phase-F restore, Session Handoff and Final Certification on the resulting exact head.
5. Only then assess merge and production; otherwise keep PR open and record the precise blocker.

`PRODUCT_COMPLETE = NO`. Next exact action: consume terminal exact-head browser/build/quality outcomes and fix the first confirmed assertion failure.
