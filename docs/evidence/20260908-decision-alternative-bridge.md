# Decision → Alternative bridge

Date: 2026-09-08

## Delivered

- Added `src/lib/decision-alternative-bridge.ts`.
- The bridge consumes existing recommendation records and existing alternative-item master data.
- It is read-only: it does not create, update, approve, or execute decisions.
- Only active alternative groups are considered.
- Inactive products are explicitly marked ineligible for execution rather than silently promoted.
- Ranking remains deterministic and can carry governed learning metadata from the alternative ranking layer.

## Safety boundary

- No prices, availability, demand, stock, margins, or outcomes are invented by this bridge.
- No tenant identifier is accepted as a decision-side override.
- Decision approval remains a separate persisted gate.
- Evidence and outcome recording remain mandatory in the downstream decision runtime.

## Verification boundary

The code and Staging database contract are verified at the source/SQL level. Authenticated browser E2E, live tenant A/B isolation, production runtime, backup/restore, and rollback remain operational gates and are not certified by this batch.
