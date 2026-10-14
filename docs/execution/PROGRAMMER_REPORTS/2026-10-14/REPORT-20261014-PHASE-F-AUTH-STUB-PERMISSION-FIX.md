# Execution checkpoint — 2026-10-14 — Phase-F restore file permission fix

Repository: Report-Engainall/Report-Advisor
Code checkpoint: d1e40bdff53f0776cd73834378080ac9a654dcf0
Branch: fix/netlify-runtime-provenance-current-main-20261014
PR: https://github.com/Report-Engainall/Report-Advisor/pull/918

## Root cause
Phase-F run 38568865682 advanced past the GHCR image pull and failed reading `/tmp/phase-f-auth-user-stubs.sql`. The file had mode 0600; the pinned PostgreSQL client runs non-root in the container.

## Implemented
Changed the ephemeral Auth stub SQL mode to 0644. It contains UUIDs only. A regression assertion was added; DB grants, RLS, authentication, restore SQL and test thresholds remain unchanged.

## Evidence boundary
Exact code head: d1e40bdff53f0776cd73834378080ac9a654dcf0. Current-head Phase-F, Build, Quality, Browser E2E and Certification results must be checked separately; no old-head results transferred. Session Handoff has been reanchored to this code checkpoint with no checker changes.

## Separate blocker
Netlify tenant-canary previously returned HTTP 503 `operational_token_not_configured`; the live Netlify environment lacks that required token. Production publishing separately needs authorized `NETLIFY_AUTH_TOKEN`. No secrets were invented, extracted or placed in Git.

## Next action
Read exact-head Phase-F and required CI. If restore passes, keep Netlify token provisioning as a separate release blocker.

