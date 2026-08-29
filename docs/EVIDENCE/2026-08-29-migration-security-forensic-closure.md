# Forensic closure — migration drift and security boundary

Date: 2026-08-29
Mode: OWNER-LEVEL / EVIDENCE-FIRST
Baseline: 4da16b9a7433e66ccf8a62b183552a872a718ef8
Supabase project: fnqbvfuwbdpwvhcgzksl

## Live migration inventory evidence

The live project reports the following post-baseline migrations. These are evidence of live schema history, not proof that repository history is reconciled:

- 20260829153438 harden_decision_state_dml
- 20260829153456 harden_decision_state_truncate
- 20260829155128 harden_audit_log_append_only
- 20260829161705 harden_recommendation_alert_mutations
- 20260829162224 harden_financial_numeric_invariants
- 20260829163329 harden_financial_referential_integrity
- 20260829163748 harden_decision_outcome_mutation_boundary
- 20260829164431 harden_decision_domain_invariants
- 20260829164443 refine_decision_evidence_invariants
- 20260829164510 validate_decision_domain_invariants
- 20260829165148 deep_decision_truth_hardening
- 20260829165208 decision_completion_atomicity_hardening
- 20260829165511 20260829173000_harden_inventory_intelligence_tenant_truth
- 20260829165542 20260829174500_add_canonical_sales_velocity_events
- 20260829165825 harden_financial_temporal_and_payment_invariants
- 20260829170107 harden_financial_nonnegative_invariants
- 20260829170510 harden_payment_amount_currency_invariants
- 20260829171319 enforce_financial_entity_tenant_triggers
- 20260829171552 harden_inventory_movement_quantity_strictly_positive
- 20260829175705 harden_cross_tenant_reference_integrity_v2
- 20260829180903 harden_watched_report_file_tenant_boundary

## Decision

Migration reconciliation is NOT PROVEN CLOSED. No historical migration file is rewritten and no destructive reset is permitted. Exact SQL provenance must be recovered from repository branches/PRs where available; only unrecoverable deltas may be reconstructed from live schema evidence, with provenance explicitly recorded.

## Security evidence

The live security advisor reports authenticated execution of several SECURITY DEFINER functions. Database inspection confirmed that the observed functions use a fixed public search path and, for sensitive decision/runtime mutations, derive tenant context with current_company_id() and actor context with auth.uid().

Observed authenticated-executable SECURITY DEFINER functions include decision approval/execution, report-job claiming, data-quality snapshot, trust checks, recommendation/alert lifecycle, watched-file recording, and outcome recording.

This is not automatically a vulnerability: some are deliberate privileged boundaries. However, each must have a documented caller contract and least-privilege grant. Repository consumer search found no direct source consumers for several trust/certification helper functions, so they remain candidates for privilege minimization after runtime caller verification.

public.companies has RLS enabled with no policies. This is currently an intentional deny-by-policy shape unless a direct Data API read is required; do not add a permissive policy merely to silence the advisor.

## Required next closure

1. Recover exact migration SQL provenance from PR #93, #95 and any originating branches for the remaining post-baseline migrations.
2. Mirror exact SQL into canonical repository migration history without rewriting old migrations.
3. Reconcile repository migration names/order against the live history.
4. Review authenticated EXECUTE grants for every SECURITY DEFINER function and remove only those proven unused by runtime callers.
5. Add regression contracts for privileged RPC caller boundaries.
6. Run advisors again after any justified security/DDL mutation.
7. Run exact-head CI and fresh runtime verification on the resulting SHA.

Certification remains BLOCKED.
