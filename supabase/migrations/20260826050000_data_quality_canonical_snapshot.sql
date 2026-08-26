-- Authoritative Data Quality snapshot.
-- Business truth is computed server-side from the authenticated tenant context.
-- No client-supplied company_id is accepted.

CREATE OR REPLACE FUNCTION public.get_data_quality_snapshot()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH tenant AS (
  SELECT public.current_company_id() AS company_id
),
customer_name_dupes AS (
  SELECT name, count(*) AS n
  FROM public.customers c, tenant t
  WHERE c.company_id = t.company_id AND btrim(coalesce(c.name, '')) <> ''
  GROUP BY name HAVING count(*) > 1
),
product_sku_dupes AS (
  SELECT sku, count(*) AS n
  FROM public.products p, tenant t
  WHERE p.company_id = t.company_id AND btrim(coalesce(p.sku, '')) <> ''
  GROUP BY sku HAVING count(*) > 1
),
invoice_number_dupes AS (
  SELECT invoice_number, count(*) AS n
  FROM public.sales_invoices i, tenant t
  WHERE i.company_id = t.company_id AND btrim(coalesce(i.invoice_number, '')) <> ''
  GROUP BY invoice_number HAVING count(*) > 1
),
customers AS (
  SELECT
    count(*)::int AS total,
    count(*) FILTER (WHERE btrim(coalesce(c.name, '')) = '')::int AS missing_name,
    count(*) FILTER (WHERE btrim(coalesce(c.phone, '')) = '')::int AS missing_phone,
    count(*) FILTER (WHERE btrim(coalesce(c.code, '')) = '')::int AS missing_code,
    coalesce((SELECT sum(n) FROM customer_name_dupes), 0)::int AS duplicate_names
  FROM public.customers c, tenant t
  WHERE c.company_id = t.company_id
),
products AS (
  SELECT
    count(*)::int AS total,
    count(*) FILTER (WHERE btrim(coalesce(p.sku, '')) = '')::int AS missing_sku,
    count(*) FILTER (WHERE btrim(coalesce(p.name, '')) = '')::int AS missing_name,
    count(*) FILTER (WHERE coalesce(p.selling_price, 0) <= 0)::int AS zero_price,
    count(*) FILTER (WHERE coalesce(p.cost_price, 0) < 0 OR coalesce(p.selling_price, 0) < 0)::int AS negative_price,
    coalesce((SELECT sum(n) FROM product_sku_dupes), 0)::int AS duplicate_sku
  FROM public.products p, tenant t
  WHERE p.company_id = t.company_id
),
invoices AS (
  SELECT
    count(*)::int AS total,
    count(*) FILTER (WHERE coalesce(i.total, 0) <= 0)::int AS zero_total,
    count(*) FILTER (WHERE coalesce(i.total, 0) < 0)::int AS negative_total,
    count(*) FILTER (WHERE coalesce(i.paid_amount, 0) > coalesce(i.total, 0))::int AS paid_exceeds_total,
    count(*) FILTER (WHERE i.customer_id IS NULL)::int AS missing_customer,
    count(*) FILTER (WHERE i.invoice_date IS NULL)::int AS missing_date,
    coalesce((SELECT sum(n) FROM invoice_number_dupes), 0)::int AS duplicate_number
  FROM public.sales_invoices i, tenant t
  WHERE i.company_id = t.company_id
),
balances AS (
  SELECT
    count(*)::int AS total,
    count(*) FILTER (WHERE coalesce(b.quantity, 0) < 0)::int AS negative_quantity,
    count(*) FILTER (WHERE coalesce(b.unit_cost, 0) < 0)::int AS negative_cost,
    count(*) FILTER (WHERE b.product_id IS NULL)::int AS missing_product
  FROM public.inventory_balances b, tenant t
  WHERE b.company_id = t.company_id
),
entity_rows AS (
  SELECT 'العملاء'::text AS name, 'users'::text AS icon, total,
    (missing_name + missing_phone + missing_code + duplicate_names)::int AS issues
  FROM customers
  UNION ALL
  SELECT 'المنتجات', 'package', total,
    (missing_sku + missing_name + zero_price + negative_price + duplicate_sku)::int
  FROM products
  UNION ALL
  SELECT 'الفواتير', 'receipt', total,
    (zero_total + negative_total + paid_exceeds_total + missing_customer + missing_date + duplicate_number)::int
  FROM invoices
  UNION ALL
  SELECT 'المخزون', 'warehouse', total,
    (negative_quantity + negative_cost + missing_product)::int
  FROM balances
),
entity_json AS (
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', name,
      'total', total,
      'issues', issues,
      'score', CASE WHEN total > 0 THEN round(((total - issues)::numeric / total::numeric) * 100)::int ELSE 100 END,
      'icon', icon
    ) ORDER BY name
  ) AS value
  FROM entity_rows
),
issue_rows AS (
  SELECT jsonb_build_object('entity','العملاء','field','الاسم','issue','اسم فارغ','count',missing_name,'severity','critical') AS row FROM customers WHERE missing_name > 0
  UNION ALL SELECT jsonb_build_object('entity','العملاء','field','الهاتف','issue','هاتف فارغ','count',missing_phone,'severity','warning') FROM customers WHERE missing_phone > 0
  UNION ALL SELECT jsonb_build_object('entity','العملاء','field','الكود','issue','كود فارغ','count',missing_code,'severity','info') FROM customers WHERE missing_code > 0
  UNION ALL SELECT jsonb_build_object('entity','العملاء','field','الاسم','issue','أسماء مكررة','count',duplicate_names,'severity','warning') FROM customers WHERE duplicate_names > 0
  UNION ALL SELECT jsonb_build_object('entity','المنتجات','field','SKU','issue','SKU فارغ','count',missing_sku,'severity','critical') FROM products WHERE missing_sku > 0
  UNION ALL SELECT jsonb_build_object('entity','المنتجات','field','الاسم','issue','اسم فارغ','count',missing_name,'severity','critical') FROM products WHERE missing_name > 0
  UNION ALL SELECT jsonb_build_object('entity','المنتجات','field','السعر','issue','سعر صفري','count',zero_price,'severity','warning') FROM products WHERE zero_price > 0
  UNION ALL SELECT jsonb_build_object('entity','المنتجات','field','السعر','issue','سعر سالب','count',negative_price,'severity','critical') FROM products WHERE negative_price > 0
  UNION ALL SELECT jsonb_build_object('entity','المنتجات','field','SKU','issue','SKU مكرر','count',duplicate_sku,'severity','critical') FROM products WHERE duplicate_sku > 0
  UNION ALL SELECT jsonb_build_object('entity','الفواتير','field','الإجمالي','issue','إجمالي صفري','count',zero_total,'severity','warning') FROM invoices WHERE zero_total > 0
  UNION ALL SELECT jsonb_build_object('entity','الفواتير','field','الإجمالي','issue','إجمالي سالب','count',negative_total,'severity','critical') FROM invoices WHERE negative_total > 0
  UNION ALL SELECT jsonb_build_object('entity','الفواتير','field','المدفوع','issue','مدفوع يتجاوز الإجمالي','count',paid_exceeds_total,'severity','critical') FROM invoices WHERE paid_exceeds_total > 0
  UNION ALL SELECT jsonb_build_object('entity','الفواتير','field','العميل','issue','عميل فارغ','count',missing_customer,'severity','critical') FROM invoices WHERE missing_customer > 0
  UNION ALL SELECT jsonb_build_object('entity','الفواتير','field','التاريخ','issue','تاريخ فارغ','count',missing_date,'severity','critical') FROM invoices WHERE missing_date > 0
  UNION ALL SELECT jsonb_build_object('entity','الفواتير','field','رقم الفاتورة','issue','أرقام مكررة','count',duplicate_number,'severity','warning') FROM invoices WHERE duplicate_number > 0
  UNION ALL SELECT jsonb_build_object('entity','المخزون','field','الكمية','issue','كمية سالبة','count',negative_quantity,'severity','critical') FROM balances WHERE negative_quantity > 0
  UNION ALL SELECT jsonb_build_object('entity','المخزون','field','التكلفة','issue','تكلفة سالبة','count',negative_cost,'severity','critical') FROM balances WHERE negative_cost > 0
  UNION ALL SELECT jsonb_build_object('entity','المخزون','field','المنتج','issue','منتج فارغ','count',missing_product,'severity','critical') FROM balances WHERE missing_product > 0
),
issue_json AS (
  SELECT coalesce(jsonb_agg(row ORDER BY (row->>'count')::int DESC), '[]'::jsonb) AS value FROM issue_rows
),
totals AS (
  SELECT coalesce(sum(total),0)::int AS total_records, coalesce(sum(issues),0)::int AS total_issues FROM entity_rows
)
SELECT jsonb_build_object(
  'status', CASE WHEN t.total_records = 0 THEN 'NO_DATA' ELSE 'CALCULATED' END,
  'data_status', CASE WHEN t.total_records = 0 THEN 'NO_DATA' ELSE 'CALCULATED' END,
  'total_records', t.total_records,
  'total_issues', t.total_issues,
  'overall_score', CASE WHEN t.total_records > 0 THEN round(((t.total_records - t.total_issues)::numeric / t.total_records::numeric) * 100)::int ELSE 100 END,
  'entities', coalesce(e.value, '[]'::jsonb),
  'issues', i.value,
  'as_of', now()
)
FROM totals t CROSS JOIN entity_json e CROSS JOIN issue_json i;
$$;

REVOKE ALL ON FUNCTION public.get_data_quality_snapshot() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_data_quality_snapshot() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_data_quality_snapshot() TO authenticated;

COMMENT ON FUNCTION public.get_data_quality_snapshot() IS
  'Authoritative tenant-scoped data-quality snapshot. Business quality metrics are computed server-side from current_company_id(); the browser does not receive source collections.';
