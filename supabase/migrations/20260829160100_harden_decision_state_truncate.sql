-- Follow-up hardening for the same decision lifecycle surface.
-- Authenticated clients must not be able to bypass lifecycle controls with TRUNCATE.
revoke truncate on table public.decision_approvals from authenticated;
revoke truncate on table public.business_intelligence_decisions from authenticated;
revoke truncate on table public.decision_work_items from authenticated;
revoke truncate on table public.recommendation_outcomes from authenticated;
revoke truncate on table public.decision_action_receipts from authenticated;
