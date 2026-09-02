# Migration Lineage Identity Matrix — 2026-09-02

| Remote version | Remote name | Repository identity | Assessment |
|---|---|---|---|
| 20260828191236 | runtime_lifecycle_idempotency_hardening_reconciliation_v2 | `20260828191236_runtime_lifecycle_idempotency_hardening_reconciliation_v2.sql` | exact identity verified in PR #304 |
| 20260830030530 | semantic_metric_governance_current_main | `20260830030530_semantic_metric_governance_current_main.sql` | exact identity verified in PR #304 |
| 20260901005857 | report_execution_worker_lifecycle | `20260901005857_report_execution_worker_lifecycle.sql` | exact identity verified in PR #304 |
| 20260902090134 | add_profitability_snapshot_rpc | `20260902090134_add_profitability_snapshot_rpc.sql` | exact identity verified in PR #304 |

## Key finding

The four migrations above are **not** evidence of a missing remote migration. They are evidence that repository source files can restore the canonical source identity while preserving the remote applied version. The remaining reconciliation problem is the broader set of remote version/name pairs and the CI rule that currently expects remote migration versions to be present as local filename prefixes.

## Safe next change

Do not create duplicate files for later deployment-time versions. Update the parity checker to compare remote records against repository migration *names/content lineage* where the deployment system has transformed source timestamps, while still rejecting genuinely unknown migration names.
