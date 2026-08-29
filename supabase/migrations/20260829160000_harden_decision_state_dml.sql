-- Security hardening: force decision lifecycle mutations through canonical RPCs.
-- Reads remain available to authenticated tenants through existing RLS policies.
-- SECURITY DEFINER lifecycle RPCs retain the required write path.

revoke insert, update, delete, truncate on table public.decision_approvals from authenticated;
revoke update, delete, truncate on table public.business_intelligence_decisions from authenticated;
revoke update, delete, truncate on table public.decision_work_items from authenticated;
revoke insert, update, delete, truncate on table public.recommendation_outcomes from authenticated;
revoke insert, update, delete, truncate on table public.decision_action_receipts from authenticated;

grant select on table public.decision_approvals to authenticated;
grant select on table public.business_intelligence_decisions to authenticated;
grant select on table public.decision_work_items to authenticated;
grant select on table public.recommendation_outcomes to authenticated;
grant select on table public.decision_action_receipts to authenticated;
