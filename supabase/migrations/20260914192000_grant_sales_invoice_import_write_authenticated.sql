-- The canonical sales-invoice import RPC executes as the authenticated caller
-- and already enforces company_id through current_company_id() plus sales_invoices RLS.
-- The table was missing the corresponding DML grants, so real imports failed at
-- committed with: permission denied for table sales_invoices.
GRANT INSERT, UPDATE ON TABLE public.sales_invoices TO authenticated;
