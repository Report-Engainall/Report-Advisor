# Secondary Agent Batch 16 — Low-Bandwidth + Mobile Readiness

## Scope
Prepare performance-safe UX contracts for slow/unstable networks and mobile use without changing canonical data, calculations, authentication, or deployment architecture.

## Design rules
- Prefer cached metadata and progressive loading.
- Bound payloads and avoid unnecessary polling.
- Preserve retryable/offline-friendly read states.
- Never turn stale cached data into LIVE truth; expose freshness.
- Keep deterministic local views usable when network access is unavailable.
- Keep RTL/LTR, touch targets, keyboard accessibility, and deep-link-safe navigation.
- Do not introduce a mandatory mobile app or cloud service.

## Non-goals
No rewrite of APIs, no new database, no service worker replacement, no paid dependency, no new analytics engine.

## Status
FOUNDATION. Runtime measurement and primary integration remain required.
