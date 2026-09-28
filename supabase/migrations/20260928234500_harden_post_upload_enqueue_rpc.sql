-- Security closure for the post-upload durable enqueue boundary.
-- The browser never calls this RPC directly; the server boundary uses service_role.
revoke all on function public.enqueue_report_execution_job(uuid,text,text,text,text[],integer) from public, anon, authenticated;
grant execute on function public.enqueue_report_execution_job(uuid,text,text,text,text[],integer) to service_role;
