# ONE-PROGRAMMER SESSION MEMORY — CANONICAL RESUME STATE

## Current execution state

- SESSION-ID → `20260927-IMPORT-UI-FINALIZE-02`
- CURRENT VERIFIED MAIN SHA → `ae88b0b5cb4fe9ec0a0afab5f4aab061e6be30a8`
- CURRENT CODE/TEST CANDIDATE SHA → `372a03095900f6397f7179ec80eaaea1bc1aba8f`
- MEMORY CHECKPOINT PARENT → `2881c57df7515ad93e66a3ff46f426450b9ce1da` (docs-only checkpoint; current branch ref may advance when memory is persisted)
- BRANCH / PR → `exec/20260927-current-main-import-ui-finalize-head` / PR #671
- FRONT-ID → `IMPORT-TO-DECISION-CONTINUITY + UI-POLISH + TRUTH/A11Y + BROWSER-PROOF`
- CURRENT BOUNDARY → Any Source → Security → Fingerprint → Understand → Normalize/Reconcile → Quality/Trust → Evidence → Review → Canonical Commit → Persistence/Readback → Business Understanding → Signals → Decision/Work → Outcome → Replay/Learning.
- RESUME STATUS → ACTIVE / NOT CLOSED / SAFE WORK REMAINS.

## Proven repository work retained

- The first reproducible current-head code failure was a stale import of deleted `src/pages/CanonicalScenarioPage.tsx` from `ScenarioTruthGuardPage.tsx`.
- The deterministic scenario calculator was consolidated into `ScenarioTruthGuardPage.tsx`; the deleted duplicate page was not restored.
- Shared shell/table/alert truth was hardened: skip-link, route-aware titles, semantic unavailable state, fail-closed alert retrieval, geometry-preserving table loading.
- AlternativeGroups, Metric Inspector, Suppliers, Product Journey, Work Center, Executive Command Center, and Connections were hardened for interaction state, touch targets, accessibility, and truth semantics.
- Canonical import UI now exposes the post-import continuation: Evidence → Signals → Decision → Work → Outcome/Learning, reusing canonical routes rather than introducing duplicate flows.
- Legacy `ExternalFileAnalysisPage.tsx` was removed on PR #671 after proving the duplicate path was no longer required.
- Exact historical CI root evidence remains: merge SHA `d4925a376ee888777ed699355fb23aa5698f813f` failed `npm run build` because the deleted scenario page was still imported; exact fix candidate `4e9486d4e93a7bb18007f8d53d6a33935890a630` reached a successful Windows `Build web application` step. This evidence is not transferred as current-head PASS.

## Browser proof activation — current mutation

- EXISTING BROWSER RUNNER → `scripts/run-full-product-browser-e2e.mjs` already exists and imports Playwright.
- GAP FOUND → `package.json` did not install Playwright and `.github/workflows/full-product-browser-e2e.yml` stopped after exact-checkout verification; it did not build, start the app, or execute the browser.
- MUTATION → Commit `372a03095900f6397f7179ec80eaaea1bc1aba8f`.
- MUTATED FILE → `.github/workflows/full-product-browser-e2e.yml`.
- NEW BEHAVIOR → exact checkout → Node 22 setup → `npm ci` → install Playwright without changing the lockfile → install Chromium with dependencies → `npm run build` → start Vite Preview on 127.0.0.1:4173 → execute the existing Playwright E2E runner → upload `artifacts/e2e` and preview logs → stop preview.
- AUTH ENVIRONMENT → The workflow passes the existing optional runtime secrets for both browser users and Supabase. Exit code 0 is PASS; exit code 1 is a reproducible harness/test failure; exit code 2 is treated as an authenticated-environment BLOCKED condition rather than falsely green authentication evidence.
- DUPLICATION RULE → No second browser framework or second E2E harness was introduced; the repository's existing Playwright runner is now actually wired into CI.

## Current proof boundary

- VERIFIED NOW → The workflow file at exact commit `372a03095900f6397f7179ec80eaaea1bc1aba8f` contains the complete Playwright execution path.
- NOT YET VERIFIED → A terminal GitHub Actions run consuming code candidate `372a03095900f6397f7179ec80eaaea1bc1aba8f` or the later docs-only PR head. The workflow-run lookup currently returned no run for the browser activation commit `372a03095900f6397f7179ec80eaaea1bc1aba8f` or the current head. The GitHub workflow-run lookup currently returned no terminal run for the browser activation commit or its current PR head.
- NOT CLAIMED → No browser PASS, no authenticated tenant PASS, and no deployment PASS is transferred from any older SHA.
- DEVICE → User device is unavailable; no device-dependent proof is being used.
- EXTERNAL BLOCKERS → Vercel deployment-rate limit; live Phase-F resilience proof; authenticated runtime proof when required secrets/environment are unavailable.
- RESOURCE RULE → Repository-side proof is preferred over Vercel/device usage; do not spend another browser runner or add duplicate automation architecture.

## Immediate continuation

- NEXT EXECUTABLE ACTION → Consume the first terminal GitHub Actions result that executes code candidate `372a03095900f6397f7179ec80eaaea1bc1aba8f`; fix only the first reproducible current-head root and rerun on a new exact SHA. If a current-head failure appears, fix only the first reproducible root and rerun on a new exact SHA.
- NEXT INDEPENDENT ACTION → Continue only safe repository-side UI/core closure and proven-stale cleanup while runtime/device fronts remain blocked.
- DO NOT REPEAT → Do not restore `CanonicalScenarioPage`; do not transfer historical PASS across SHAs; do not create another browser framework; do not use unauthenticated preview as authenticated proof; do not close unresolved legacy PRs without absorption evidence.

## Canonical product chain

`Any Source → Security → Fingerprint → Understand → Normalize/Reconcile → Quality/Trust → Evidence → Review → Canonical Commit → Persistence/Readback → Business Understanding → Signals → Decision/Work → Outcome → Replay/Learning`.

AI remains assistive only. Deterministic/server-backed truth remains authoritative for tenant, KPI, financial, provenance, evidence, approval, and persisted state.
