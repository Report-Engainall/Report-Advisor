-- W2.1 security closure: SECURITY DEFINER runtime RPCs must not retain PostgreSQL's
-- default PUBLIC EXECUTE privilege. Authenticated tenant actors are the only
-- supported callers; tenant enforcement remains inside each function.

REVOKE ALL ON FUNCTION public.request_decision_approval(uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decide_approval(uuid,boolean,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.start_decision_work_item(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_decision_action_receipt(uuid,text,text,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_decision_work_item(uuid,numeric,jsonb) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.request_decision_approval(uuid,text) FROM anon;
REVOKE ALL ON FUNCTION public.decide_approval(uuid,boolean,text) FROM anon;
REVOKE ALL ON FUNCTION public.start_decision_work_item(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.create_decision_action_receipt(uuid,text,text,uuid) FROM anon;
REVOKE ALL ON FUNCTION public.complete_decision_work_item(uuid,numeric,jsonb) FROM anon;

GRANT EXECUTE ON FUNCTION public.request_decision_approval(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decide_approval(uuid,boolean,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_decision_work_item(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_decision_action_receipt(uuid,text,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_decision_work_item(uuid,numeric,jsonb) TO authenticated;
