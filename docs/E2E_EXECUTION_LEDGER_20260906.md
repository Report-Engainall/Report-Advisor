# Report-Advisor — E2E Execution Ledger — 2026-09-06

## Exact execution baseline

- Repository: `Report-Engainall/Report-Advisor`
- Base branch: `main`
- Baseline `main` HEAD at execution start: `a0fd4a4ea4b9fb8a9a4e81ab2be5924f3b94b987`
- Execution branch: `e2e/real-import-persistence-closure-20260906`
- Current execution branch HEAD: `4200cb49d133e0b5265c5f606d1fe59a86a6f0`

## Implemented in this execution wave

### P0 — Real authenticated business E2E
Added `scripts/real-business-e2e.mjs` to execute a real browser flow against the application runtime when real credentials are supplied.

The flow covers:

1. Real login through the application's Login UI.
2. Browser-held Supabase session extraction.
3. Authoritative tenant resolution through `current_company_id()`.
4. Real customer import through the application's import UI.
5. Database read-back of the imported customer under Tenant A.
6. Customer UI read-back after navigation/search.
7. Real product import through the application's import UI.
8. Database read-back of the imported product under Tenant A.
9. Product UI read-back after navigation/search.
10. Real sales-invoice import through the application's import UI.
11. Database read-back of the persisted invoice and customer relationship.
12. Sales-report UI read-back of the persisted invoice.
13. Browser refresh and tenant-context re-verification.
14. Real Tenant B login in an isolated browser context.
15. Authoritative Tenant B resolution and distinct-tenant assertion.
16. Tenant B REST read probes for Tenant A customer/product/invoice, which must return zero rows.
17. Tenant B UI probes for Tenant A customer/product, which must return zero matches.
18. Real logout and return to the unauthenticated login state.
19. Browser console/page/network failures are collected and prevent PASS.
20. Exact execution SHA is recorded in the evidence artifact.

### Exact-head CI vehicle
Added `.github/workflows/real-business-e2e.yml`.

The workflow:

- checks out the exact GitHub SHA and verifies `git rev-parse HEAD == GITHUB_SHA`;
- requires a clean worktree;
- uses Node 22;
- installs locked repository dependencies with `npm ci`;
- installs the browser runner without mutating the committed dependency graph;
- installs Chromium;
- builds the exact head with the configured Supabase public runtime variables;
- starts the exact production preview;
- requires real Tenant A/B credentials and runtime configuration;
- runs the real business E2E;
- uploads `result.json` and browser failure evidence as a GitHub Actions artifact.

### Production browser hygiene
Added `public/favicon.svg` and linked it from `index.html` so the production document has an explicit Aghbari favicon and does not rely on an implicit `/favicon.ico` request.

## Evidence boundary

This wave **does not claim PASS** merely because the code and workflow exist. The E2E gate becomes `PASS` only after GitHub Actions executes this exact branch head with real authenticated runtime credentials and the resulting artifact proves the complete flow.

If required runtime secrets are absent, the workflow exits with a distinct `BLOCKED` status. No synthetic credentials, mock session, service-role token, or fabricated success is accepted.

## External blocker currently encountered

The connected Supabase tool currently denies execution permission for the staging project `fnqbvfuwbdpwvhcgzksl`. Therefore a live SQL verification query could not be executed from this session. This remains an operational access blocker and is not converted into a false PASS.

## Next priority

1. Execute the new real business E2E on the exact branch head with real Tenant A/B credentials.
2. Consume the resulting artifact and classify every failure by root cause.
3. Add adversarial A↔B mutation attempts once the authenticated runtime execution channel is available.
4. Continue independent migration parity, worker/recovery, OCR, backup/restore, rollback, performance, observability, Windows, and security work without reopening already closed work.
