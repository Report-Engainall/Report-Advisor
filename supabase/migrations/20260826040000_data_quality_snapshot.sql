-- Authoritative Data Quality snapshot.
-- Business truth is computed server-side from the authenticated tenant context.
-- The RPC accepts no tenant identifier and fails closed when no tenant exists.

CREATE OR REPLACE FUNCTION public.get_data_quality_snapshot()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company uuid := public.current_company_id();
  v_result jsonb;
BEGIN
  IF v_company IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH: no authenticated default company context';
  END IF;

  WITH
  c AS (
    SELECT count(*)::int AS total,
      count(*) FILTER (WHERE nullif(btrim(name), '') IS NULL)::int AS missing_name,
      count(*) FILTER (WHERE nullif(btrim(phone), '') IS NULL)::int AS missing_phone,
      count(*) FILTER (WHERE nullif(btrim(code), '') IS NULL)::int AS missing_code,
      COALESCE((SELECT sum(n) FROM (SELECT count(*) n FROM customers WHERE company_id=v_company AND nullif(btrim(name),'') IS NOT NULL GROUP BY btrim(name) HAVING count(*) > 1) d),0)::int AS duplicate_names
    FROM customers WHERE company_id = v_company
  ),
  p AS (
    SELECT count(*)::int AS total,
      count(*) FILTER (WHERE nullif(btrim(sku), '') IS NULL)::int AS missing_sku,
      count(*) FILTER (WHERE nullif(btrim(name), '') IS NULL)::int AS missing_name,
      count(*) FILTER (WHERE coalesce(selling_price,0) <= 0)::int AS zero_price,
      count(*) FILTER (WHERE coalesce(cost_price,0) < 0 OR coalesce(selling_price,0) < 0)::int AS negative_price,
      COALESCE((SELECT sum(n) FROM (SELECT count(*) n FROM products WHERE company_id=v_company AND nullif(btrim(sku),'') IS NOT NULL GROUP BY btrim(sku) HAVING count(*) > 1) d),0)::int AS duplicate_sku
    FROM products WHERE company_id = v_company
  ),
  i AS (
    SELECT count(*)::int AS total,
      count(*) FILTER (WHERE coalesce(total,0) <= 0)::int AS zero_total,
      count(*) FILTER (WHERE coalesce(total,0) < 0)::int AS negative_total,
      count(*) FILTER (WHERE coalesce(paid_amount,0) > coalesce(total,0))::int AS paid_exceeds,
      count(*) FILTER (WHERE customer_id IS NULL)::int AS missing_customer,
      count(*) FILTER (WHERE invoice_date IS NULL)::int AS missing_date,
      COALESCE((SELECT sum(n) FROM (SELECT count(*) n FROM sales_invoices WHERE company_id=v_company AND nullif(btrim(invoice_number),'') IS NOT NULL GROUP BY btrim(invoice_number) HAVING count(*) > 1) d),0)::int AS duplicate_number
    FROM sales_invoices WHERE company_id = v_company
  ),
  b AS (
    SELECT count(*)::int AS total,
      count(*) FILTER (WHERE coalesce(quantity,0) < 0)::int AS negative_quantity,
      count(*) FILTER (WHERE coalesce(unit_cost,0) < 0)::int AS negative_cost,
      count(*) FILTER (WHERE product_id IS NULL)::int AS missing_product
    FROM inventory_balances WHERE company_id = v_company
  ),
  metrics AS (
    SELECT c.*, p.*, i.*, b.*,
      (c.missing_name+c.missing_phone+c.missing_code+c.duplicate_names)::int AS customer_issues,
      (p.missing_sku+p.missing_name+p.zero_price+p.negative_price+p.duplicate_sku)::int AS product_issues,
      (i.zero_total+i.negative_total+i.paid_exceeds+i.missing_customer+i.missing_date+i.duplicate_number)::int AS invoice_issues,
      (b.negative_quantity+b.negative_cost+b.missing_product)::int AS balance_issues
    FROM c,p,i,b
  )
  SELECT jsonb_build_object(
    'status','OK',
    'tenant_id',v_company,
    'entities',jsonb_build_array(
      jsonb_build_object('name','العملاء','total',customer_total,'issues',customer_issues,'score',CASE WHEN customer_total>0 THEN round(((customer_total-customer_issues)::numeric/customer_total)*100) ELSE 100 END,'icon','users'),
      jsonb_build_object('name','المنتجات','total',product_total,'issues',product_issues,'score',CASE WHEN product_total>0 THEN round(((product_total-product_issues)::numeric/product_total)*100) ELSE 100 END,'icon','package'),
      jsonb_build_object('name','الفواتير','total',invoice_total,'issues',invoice_issues,'score',CASE WHEN invoice_total>0 THEN round(((invoice_total-invoice_issues)::numeric/invoice_total)*100) ELSE 100 END,'icon','receipt'),
      jsonb_build_object('name','المخزون','total',balance_total,'issues',balance_issues,'score',CASE WHEN balance_total>0 THEN round(((balance_total-balance_issues)::numeric/balance_total)*100) ELSE 100 END,'icon','warehouse')
    ),
    'issues',jsonb_build_array(
      jsonb_build_object('entity','العملاء','field','الاسم','issue','اسم فارغ','count',missing_name,'severity','critical'),
      jsonb_build_object('entity','العملاء','field','الهاتف','issue','هاتف فارغ','count',missing_phone,'severity','warning'),
      jsonb_build_object('entity','العملاء','field','الكود','issue','كود فارغ','count',missing_code,'severity','info'),
      jsonb_build_object('entity','العملاء','field','الاسم','issue','أسماء مكررة','count',duplicate_names,'severity','warning'),
      jsonb_build_object('entity','المنتجات','field','SKU','issue','SKU فارغ','count',missing_sku,'severity','critical'),
      jsonb_build_object('entity','المنتجات','field','الاسم','issue','اسم فارغ','count',missing_name,'severity','critical'),
      jsonb_build_object('entity','المنتجات','field','السعر','issue','سعر صفري','count',zero_price,'severity','warning'),
      jsonb_build_object('entity','المنتجات','field','السعر','issue','سعر سالب','count',negative_price,'severity','critical'),
      jsonb_build_object('entity','المنتجات','field','SKU','issue','SKU مكرر','count',duplicate_sku,'severity','critical'),
      jsonb_build_object('entity','الفواتير','field','الإجمالي','issue','إجمالي صفري','count',zero_total,'severity','warning'),
      jsonb_build_object('entity','الفواتير','field','الإجمالي','issue','إجمالي سالب','count',negative_total,'severity','critical'),
      jsonb_build_object('entity','الفواتير','field','المدفوع','issue','مدفوع يتجاوز الإجمالي','count',paid_exceeds,'severity','critical'),
      jsonb_build_object('entity','الفواتير','field','العميل','issue','عميل فارغ','count',missing_customer,'severity','critical'),
      jsonb_build_object('entity','الفواتير','field','التاريخ','issue','تاريخ فارغ','count',missing_date,'severity','critical'),
      jsonb_build_object('entity','الفواتير','field','رقم الفاتورة','issue','أرقام مكررة','count',duplicate_number,'severity','warning'),
      jsonb_build_object('entity','المخزون','field','الكمية','issue','كمية سالبة','count',negative_quantity,'severity','critical'),
      jsonb_build_object('entity','المخزون','field','التكلفة','issue','تكلفة سالبة','count',negative_cost,'severity','critical'),
      jsonb_build_object('entity','المخزون','field','المنتج','issue','منتج فارغ','count',missing_product,'severity','critical')
    )
  ) INTO v_result FROM metrics;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_data_quality_snapshot() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_data_quality_snapshot() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_data_quality_snapshot() TO authenticated;

COMMENT ON FUNCTION public.get_data_quality_snapshot() IS
  'Authoritative tenant-scoped data-quality metrics. No client tenant parameter; tenant comes from current_company_id().';
