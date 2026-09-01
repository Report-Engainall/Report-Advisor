# Query planner hardening contract

The canonical `planQuery` API intentionally does not accept a caller-supplied `companyId`. Tenant/company scope is not accepted from the caller and must remain governed by the canonical runtime/security boundary.

This contract test therefore verifies that unsafe filter keys are dropped, `company_id` remains a safe projected column, limits are capped, and fingerprints are deterministic without asserting a caller-supplied tenant filter.
