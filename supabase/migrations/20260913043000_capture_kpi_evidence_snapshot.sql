create or replace function public.capture_kpi_evidence_snapshot(
  p_kpi_key text,
  p_as_of date default current_date,
  p_months integer default 6
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid := public.current_company_id();
  v_months integer := least(greatest(coalesce(p_months, 6), 1), 24);
  v_snapshot jsonb;
  v_value numeric;
  v_quality text;
  v_formula text;
  v_source_tables text[];
  v_row public.kpi_evidence_snapshots%rowtype;
begin
  if auth.uid() is null or v_company_id is null then
    raise exception 'TENANT_CONTEXT_REQUIRED';
  end if;

  if p_kpi_key not in (
    'dashboard.total_sales',
    'dashboard.total_cost',
    'dashboard.gross_profit',
    'dashboard.receivables',
    'dashboard.overdue_receivables',
    'dashboard.payables',
    'dashboard.inventory_value',
    'dashboard.invoice_count'
  ) then
    raise exception 'KPI_EVIDENCE_KEY_NOT_ALLOWED';
  end if;

  v_snapshot := public.get_dashboard_snapshot(v_months, p_as_of);

  v_quality := case
    when v_snapshot->>'status' = 'CALCULATED'
      and coalesce((v_snapshot->'quality'->>'badInvoiceRows')::integer, 0) = 0
      and coalesce((v_snapshot->'quality'->>'badSaleItemRows')::integer, 0) = 0
      and coalesce((v_snapshot->'quality'->>'badPurchaseRows')::integer, 0) = 0
      and coalesce((v_snapshot->'quality'->>'badInventoryRows')::integer, 0) = 0
      and coalesce((v_snapshot->'quality'->>'salesCurrencyMismatchRows')::integer, 0) = 0
      and coalesce((v_snapshot->'quality'->>'purchaseCurrencyMismatchRows')::integer, 0) = 0
    then 'verified'
    else 'insufficient'
  end;

  case p_kpi_key
    when 'dashboard.total_sales' then
      v_value := (v_snapshot->>'totalSales')::numeric;
      v_formula := 'sum(sales_invoices.subtotal) for non-cancelled invoices through as_of';
      v_source_tables := array['sales_invoices'];
    when 'dashboard.total_cost' then
      v_value := (v_snapshot->>'totalCost')::numeric;
      v_formula := 'sum(sale_items.quantity * sale_items.cost_price) for validated sale items';
      v_source_tables := array['sales_invoices','sale_items'];
    when 'dashboard.gross_profit' then
      v_value := (v_snapshot->>'grossProfit')::numeric;
      v_formula := 'totalSales - totalCost from canonical dashboard snapshot';
      v_source_tables := array['sales_invoices','sale_items'];
    when 'dashboard.receivables' then
      v_value := (v_snapshot->>'totalReceivables')::numeric;
      v_formula := 'sum(sales_invoices.total - sales_invoices.paid_amount)';
      v_source_tables := array['sales_invoices'];
    when 'dashboard.overdue_receivables' then
      v_value := (v_snapshot->>'overdueReceivables')::numeric;
      v_formula := 'sum(outstanding where due_date < as_of and paid_amount < total)';
      v_source_tables := array['sales_invoices'];
    when 'dashboard.payables' then
      v_value := (v_snapshot->>'totalPayables')::numeric;
      v_formula := 'sum(purchase_invoices.total - purchase_invoices.paid_amount)';
      v_source_tables := array['purchase_invoices'];
    when 'dashboard.inventory_value' then
      v_value := (v_snapshot->>'inventoryValue')::numeric;
      v_formula := 'sum(inventory_balances.quantity * inventory_balances.unit_cost)';
      v_source_tables := array['inventory_balances'];
    when 'dashboard.invoice_count' then
      v_value := (v_snapshot->>'invoiceCount')::numeric;
      v_formula := 'count(sales_invoices) through as_of excluding cancelled and void';
      v_source_tables := array['sales_invoices'];
  end case;

  if v_value is null or not isfinite(v_value) then
    raise exception 'KPI_EVIDENCE_VALUE_UNAVAILABLE';
  end if;

  insert into public.kpi_evidence_snapshots (
    company_id, kpi_key, observed_at, value, quality, source_evidence
  ) values (
    v_company_id,
    p_kpi_key,
    clock_timestamp(),
    v_value,
    v_quality,
    jsonb_build_object(
      'source_rpc', 'get_dashboard_snapshot',
      'source_tables', to_jsonb(v_source_tables),
      'company_id', v_company_id,
      'as_of', p_as_of,
      'months', v_months,
      'formula', v_formula,
      'snapshot_status', v_snapshot->>'status',
      'snapshot_quality', v_snapshot->'quality'
    )
  ) returning * into v_row;

  return jsonb_build_object(
    'id', v_row.id,
    'company_id', v_row.company_id,
    'kpi_key', v_row.kpi_key,
    'value', v_row.value,
    'observed_at', v_row.observed_at,
    'quality', v_row.quality,
    'source_evidence', v_row.source_evidence
  );
end;
$$;

revoke all on function public.capture_kpi_evidence_snapshot(text,date,integer) from public;
revoke all on function public.capture_kpi_evidence_snapshot(text,date,integer) from anon;
grant execute on function public.capture_kpi_evidence_snapshot(text,date,integer) to authenticated;
