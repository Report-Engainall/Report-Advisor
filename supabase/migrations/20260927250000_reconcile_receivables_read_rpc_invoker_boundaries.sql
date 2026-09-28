-- Read-only receivables/cash reporting RPCs use tenant RLS plus explicit
-- role predicates; SECURITY INVOKER keeps the database policy layer authoritative.

CREATE OR REPLACE FUNCTION public.get_cash_account_balances()
RETURNS SETOF public.cash_accounts
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public', 'pg_catalog'
AS $function$
  SELECT ca.*
  FROM public.cash_accounts ca
  WHERE ca.company_id = public.current_company_id()
    AND EXISTS (
      SELECT 1
      FROM public.company_memberships cm
      WHERE cm.company_id = public.current_company_id()
        AND cm.user_id = auth.uid()
        AND cm.is_active = true
        AND cm.role IN ('owner','admin','accountant')
    )
  ORDER BY ca.name;
$function$;

CREATE OR REPLACE FUNCTION public.get_staff_receivables()
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public', 'pg_catalog'
AS $function$
  SELECT coalesce(sum(greatest(coalesce(si.total,0)-coalesce(si.paid_amount,0),0)),0)::numeric
  FROM public.sales_invoices si
  WHERE si.company_id = public.current_company_id()
    AND si.status NOT IN ('cancelled','void','draft')
    AND coalesce(si.total,0) > coalesce(si.paid_amount,0)
    AND EXISTS (
      SELECT 1
      FROM public.company_memberships cm
      WHERE cm.company_id = public.current_company_id()
        AND cm.user_id = auth.uid()
        AND cm.is_active = true
        AND cm.role IN ('owner','admin','accountant','sales')
    );
$function$;

ALTER FUNCTION public.get_cash_account_balances()
  SECURITY INVOKER;
ALTER FUNCTION public.get_cash_account_balances()
  SET search_path TO 'public', 'pg_catalog';

ALTER FUNCTION public.get_staff_receivables()
  SECURITY INVOKER;
ALTER FUNCTION public.get_staff_receivables()
  SET search_path TO 'public', 'pg_catalog';

REVOKE ALL ON FUNCTION public.get_cash_account_balances()
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_staff_receivables()
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_cash_account_balances()
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_staff_receivables()
  TO authenticated, service_role;
