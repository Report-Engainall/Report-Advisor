# Migration reconciliation matrix — 2026-08-29

Project: `fnqbvfuwbdpwvhcgzksl`
Baseline: `4da16b9a7433e66ccf8a62b183552a872a718ef8`

This is append-only evidence. It does not promote unrecovered live migrations to exact provenance.

| Live version | Live name | Repository status |
|---|---|---|
| 20260829153438 | harden_decision_state_dml | RECOVERED / mirrored |
| 20260829153456 | harden_decision_state_truncate | RECONSTRUCTED from live privilege state |
| 20260829155128 | harden_audit_log_append_only | RECONSTRUCTED from live privilege state |
| 20260829161705 | harden_recommendation_alert_mutations | RECONSTRUCTED from live privilege state |
| 20260829162224 | harden_financial_numeric_invariants | NOT RECOVERED |
| 20260829163329 | harden_financial_referential_integrity | NOT RECOVERED |
| 20260829163748 | harden_decision_outcome_mutation_boundary | NOT RECOVERED |
| 20260829164431 | harden_decision_domain_invariants | NOT RECOVERED |
| 20260829164443 | refine_decision_evidence_invariants | NOT RECOVERED |
| 20260829164510 | validate_decision_domain_invariants | NOT RECOVERED |
| 20260829165148 | deep_decision_truth_hardening | NOT RECOVERED |
| 20260829165208 | decision_completion_atomicity_hardening | NOT RECOVERED |
| 20260829165511 | 20260829173000_harden_inventory_intelligence_tenant_truth | NOT RECOVERED |
| 20260829165542 | 20260829174500_add_canonical_sales_velocity_events | NOT RECOVERED |
| 20260829165825 | harden_financial_temporal_and_payment_invariants | NOT RECOVERED |
| 20260829170107 | harden_financial_nonnegative_invariants | NOT RECOVERED |
| 20260829170510 | harden_payment_amount_currency_invariants | NOT RECOVERED |
| 20260829171319 | enforce_financial_entity_tenant_triggers | NOT RECOVERED |
| 20260829171552 | harden_inventory_movement_quantity_strictly_positive | RECONSTRUCTED from live constraint state |
| 20260829175705 | harden_cross_tenant_reference_integrity_v2 | RECOVERED / mirrored |
| 20260829180903 | harden_watched_report_file_tenant_boundary | RECOVERED / mirrored |

## Rule

Recovered means repository SQL was obtained from an existing execution branch/PR or the exact applied SQL was already captured.

Reconstructed means the exact historical source was not recovered; the migration is derived only from the current live schema/privilege state and is explicitly labeled as such.

Unrecovered migrations remain open. Fresh-environment equivalence is NOT CERTIFIED until these gaps are either recovered or safely reconstructed and independently verified.
