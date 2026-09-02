// Temporary audit helper intentionally inert: records the normalization rule used by the lineage audit.
// It is not a CI gate and must not query production.
const normalize = (name) => name.replace(/^\d{14}_/, '').toLowerCase();
console.log(normalize('20260828191236_runtime_lifecycle_idempotency_hardening_reconciliation_v2.sql'));
