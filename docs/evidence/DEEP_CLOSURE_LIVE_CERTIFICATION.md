# Deep Closure / LIVE Certification Gate

## Purpose

This gate prevents promotion from deep CI closure to runtime/live/production certification without real evidence.

## Exact-HEAD discipline

- Code HEAD under evaluation: `c7b21db4d68e396fa6ceefe3f6fdc15b1a8b8d4c`
- Any subsequent code change invalidates this SHA and requires a new exact-head verification.
- Historical PASS results are not valid evidence for a different SHA.

## Certification matrix

| Capability | Current state | Required evidence |
|---|---|---|
| Canonical data truth | IMPLEMENTED / REGRESSION | exact-head regression + consumer proof |
| Tenant isolation | REGRESSION | authenticated A/B adversarial runtime |
| Storage isolation | PREPARED | authenticated A/B storage access test |
| Realtime authorization | PREPARED | authenticated A/B channel test |
| AI/vector isolation | PREPARED | authenticated A/B metadata/query test |
| Worker reliability | PREPARED | crash/restart, stale lease, retry, DLQ, duplicate-worker test |
| Native watcher | PREPARED | real filesystem event + restart/recovery evidence |
| Backup/restore | PREPARED | restore run + measured RPO/RTO |
| Document intelligence | REGRESSION | real PDF/XLSX/CSV/OCR corpus execution |
| Performance | REGRESSION | measured benchmark on target deployment |
| Production telemetry | BLOCKED | deployed telemetry evidence |
| Canary/rollback | BLOCKED | deployed canary + rollback evidence |
| Production certification | BLOCKED | all above gates satisfied |

## Open certification blocker

Issue #62 tracks the remaining exact-head and LIVE evidence requirements.

## Rule

`PRODUCTION CERTIFIED` is prohibited until every required live evidence item is executed and tied to the exact deployed revision.
