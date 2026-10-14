# Execution checkpoint — 2026-10-14 — Phase-F PostgreSQL image registry fallback

Repository: Report-Engainall/Report-Advisor
Code checkpoint: a96656b9fcc1be61052b415b522bbd34bd399504
Branch: fix/netlify-runtime-provenance-current-main-20261014
PR: https://github.com/Report-Engainall/Report-Advisor/pull/918

## Root cause
Phase-F run 38564780775 used `public.ecr.aws/docker/library/postgres:17` and failed the logical backup/restore probe because the registry returned `toomanyrequests: Data limit exceeded`. This is distinct from the tenant-canary HTTP 503 caused by missing `RESILIENCE_OPERATIONAL_TOKEN` in the Netlify function environment.

## Implemented
The code checkpoint switches the default image to the digest-pinned GHCR image `ghcr.io/cloudnative-pg/postgresql@sha256:02d2219649fa845ed4f67cd8b8720b5de6437bd130b4615efda6b4ee294730d8` and retains the existing explicit image override. Regression assertions confirm that a SHA-256 pinned GHCR image remains the default and that ECR is not the default source.

## Exact-head evidence
The predecessor `556feab5e31e81f35b2ea51dad370624e2dfffd8` passed Product Build, Quality, Full Product Browser E2E, Session Handoff and Final Certification. It failed Phase-F 2/4 due the ECR quota and missing live operational token:
- Phase-F failure: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38564780775
- Product Build PASS: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38564780427
- Quality PASS: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38564780517
- Browser E2E PASS: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38564780516
- Session Handoff PASS: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38564780042
- Final Certification PASS: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38564780752

These predecessor results are not proof for the new code checkpoint. New exact-head Actions are pending.

## Boundaries
No authentication, tenant isolation, SQL restore semantics, RLS, test threshold, or failure condition was removed. `PRODUCT_COMPLETE = NO`; `PRODUCTION-PROVEN = NOT_PROVEN`. Netlify operational token and production deployment credentials are still external configuration dependencies.

## Next action
Read exact-head Phase-F results. If the pinned GHCR client works, fix the next actual backup/restore assertion and keep the tenant-canary missing token as a distinct blocker.

