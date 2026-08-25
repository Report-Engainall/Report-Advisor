-- Metric Single Source of Truth
-- Authoritative metric metadata lives in SQL; UI/report/AI consumers must read
-- the same definitions and deterministic values. Missing evidence is NULL/UNKNOWN,
-- never a fabricated zero.

CREATE TABLE IF NOT EXISTS metric_definitions (
  metric_id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  formula text NOT NULL,
  source_tables text[] NOT NULL,
  allowed_dimensions text[] NOT NULL DEFAULT '{}',
  time_semantics text NOT NULL,
  freshness_requirement_minutes integer NOT NULL DEFAULT 1440 CHECK (freshness_requirement_minutes >= 0),
  owner text NOT NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  dependencies text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','DEPRECATED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO metric_definitions
(metric_id,name,description,formula,source_tables,allowed_dimensions,time_semantics,freshness_requirement_minutes,owner,version,dependencies)
VALUES
('revenue','Revenue','Authoritative posted/confirmed sales revenue after line-level discounts/taxes according to the sales policy.','SUM(sale_items.line_total)','{sales_invoices,sale_items}','{company,branch,customer,product,category,period}','invoice_date',1440,'finance',1,'{sales}'),
('cost','Cost of Sales','Verified cost basis attached to sold lines.','SUM(sale_items.quantity * sale_items.cost_price)','{sales_invoices,sale_items}','{company,branch,product,category,period}','invoice_date',1440,'finance',1,'{sales,cost-basis}'),
('gross_profit','Gross Profit','Revenue minus verified cost of sales.','revenue - cost','{sales_invoices,sale_items}','{company,branch,product,category,period}','invoice_date',1440,'finance',1,'{revenue,cost}'),
('gross_margin_pct','Gross Margin %','Gross profit divided by revenue when both are evidenced.','gross_profit / revenue * 100','{sales_invoices,sale_items}','{company,branch,product,category,period}','invoice_date',1440,'finance',1,'{gross_profit,revenue}'),
('inventory_value','Inventory Value','Current inventory quantity multiplied by verified unit cost.','SUM(inventory_balances.quantity * inventory_balances.unit_cost)','{inventory_balances}','{company,warehouse,product,category}','inventory_updated_at',120,'inventory',1,'{inventory}'),
('receivables','Receivables','Outstanding customer balances on non-cancelled sales.','SUM(GREATEST(invoice.total - invoice.paid_amount,0))','{sales_invoices}','{company,customer,period}','invoice_date',1440,'finance',1,'{sales,payments}'),
('payables','Payables','Outstanding supplier balances on non-cancelled purchases.','SUM(GREATEST(invoice.total - invoice.paid_amount,0))','{purchase_invoices}','{company,supplier,period}','invoice_date',1440,'finance',1,'{purchasing,payments}'),
('cash','Cash Position','Recorded cash inflows minus cash outflows within the selected period.','SUM(inflows) - SUM(outflows)','{payments}','{company,period}','payment_date',120,'finance',1,'{payments}'),
('dso','DSO','Days sales outstanding using evidenced receivables and sales over the selected window.','receivables / revenue * days','{sales_invoices,payments}','{company,period}','invoice_date',1440,'finance',1,'{receivables,revenue}'),
('dio','DIO','Days inventory outstanding using evidenced inventory and cost of sales.','inventory_value / cost * days','{inventory_balances,sale_items}','{company,warehouse,period}','inventory_updated_at',120,'finance',1,'{inventory_value,cost}'),
('dpo','DPO','Days payable outstanding using evidenced payables and purchases/cost basis.','payables / purchases * days','{purchase_invoices,payments}','{company,supplier,period}','invoice_date',1440,'finance',1,'{payables,purchasing}'),
('ccc','CCC','Cash conversion cycle derived from DSO + DIO - DPO.','dso + dio - dpo','{sales_invoices,purchase_invoices,inventory_balances,payments}','{company,period}','mixed',1440,'finance',1,'{dso,dio,dpo}')
ON CONFLICT (metric_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  formula = EXCLUDED.formula,
  source_tables = EXCLUDED.source_tables,
  allowed_dimensions = EXCLUDED.allowed_dimensions,
  time_semantics = EXCLUDED.time_semantics,
  freshness_requirement_minutes = EXCLUDED.freshness_requirement_minutes,
  owner = EXCLUDED.owner,
  version = EXCLUDED.version,
  dependencies = EXCLUDED.dependencies,
  status = EXCLUDED.status,
  updated_at = now();

ALTER TABLE metric_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS metric_definitions_read ON metric_definitions;
CREATE POLICY metric_definitions_read
ON metric_definitions FOR SELECT
TO authenticated, anon
USING (true);

-- Central deterministic evaluation. Values are NULL when the required source
-- evidence does not exist. Consumers must render NULL as UNKNOWN/INSUFFICIENT_EVIDENCE.
CREATE OR REPLACE FUNCTION get_canonical_metric_snapshot(
  p_company_id uuid,
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
WITH sales AS (
  SELECT
    count(*)::integer AS rows_count,
    sum(si.line_total)::numeric AS revenue,
    sum(si.quantity * si.cost_price)::numeric AS cost,
    max(s.created_at) AS source_updated_at
  FROM sale_items si
  JOIN sales_invoices s ON s.id = si.invoice_id
  WHERE s.company_id = p_company_id
    AND s.status NOT IN ('cancelled','void')
    AND (p_from IS NULL OR s.invoice_date >= p_from)
    AND (p_to IS NULL OR s.invoice_date <= p_to)
),
receivables AS (
  SELECT
    count(*)::integer AS rows_count,
    sum(greatest(s.total - s.paid_amount,0))::numeric AS value,
    max(s.created_at) AS source_updated_at
  FROM sales_invoices s
  WHERE s.company_id = p_company_id
    AND s.status NOT IN ('cancelled','void')
    AND (p_to IS NULL OR s.invoice_date <= p_to)
),
payables AS (
  SELECT
    count(*)::integer AS rows_count,
    sum(greatest(p.total - p.paid_amount,0))::numeric AS value,
    max(p.created_at) AS source_updated_at
  FROM purchase_invoices p
  WHERE p.company_id = p_company_id
    AND p.status NOT IN ('cancelled','void')
    AND (p_to IS NULL OR p.invoice_date <= p_to)
),
stock AS (
  SELECT
    count(*)::integer AS rows_count,
    sum(ib.quantity * ib.unit_cost)::numeric AS value,
    max(ib.updated_at) AS source_updated_at
  FROM inventory_balances ib
  WHERE ib.company_id = p_company_id
),
payments AS (
  SELECT
    count(*)::integer AS rows_count,
    sum(CASE WHEN direction = 'in' THEN amount ELSE 0 END)::numeric AS inflow,
    sum(CASE WHEN direction = 'out' THEN amount ELSE 0 END)::numeric AS outflow,
    max(created_at) AS source_updated_at
  FROM payments p
  WHERE p.company_id = p_company_id
    AND (p_from IS NULL OR p.payment_date >= p_from)
    AND (p_to IS NULL OR p.payment_date <= p_to)
),
base AS (
  SELECT
    sales.*, receivables.rows_count AS ar_rows, receivables.value AS ar_value,
    receivables.source_updated_at AS ar_updated_at,
    payables.rows_count AS ap_rows, payables.value AS ap_value,
    payables.source_updated_at AS ap_updated_at,
    stock.rows_count AS stock_rows, stock.value AS inventory_value,
    stock.source_updated_at AS inventory_updated_at,
    payments.rows_count AS payment_rows, payments.inflow, payments.outflow,
    payments.source_updated_at AS payment_updated_at
  FROM sales, receivables, payables, stock, payments
),
metrics AS (
  SELECT jsonb_build_array(
    jsonb_build_object('metric_id','revenue','value',revenue,'status',CASE WHEN rows_count > 0 THEN 'CONFIRMED' ELSE 'UNKNOWN' END,'source_rows',rows_count,'source_updated_at',source_updated_at,'version',1),
    jsonb_build_object('metric_id','cost','value',CASE WHEN rows_count > 0 THEN cost ELSE NULL END,'status',CASE WHEN rows_count > 0 AND cost IS NOT NULL THEN 'CONFIRMED' ELSE 'UNKNOWN' END,'source_rows',rows_count,'source_updated_at',source_updated_at,'version',1),
    jsonb_build_object('metric_id','gross_profit','value',CASE WHEN rows_count > 0 AND cost IS NOT NULL THEN revenue-cost ELSE NULL END,'status',CASE WHEN rows_count > 0 AND cost IS NOT NULL THEN 'CALCULATED' ELSE 'UNKNOWN' END,'source_rows',rows_count,'source_updated_at',source_updated_at,'version',1),
    jsonb_build_object('metric_id','gross_margin_pct','value',CASE WHEN rows_count > 0 AND cost IS NOT NULL AND revenue <> 0 THEN round(((revenue-cost)/revenue)*100,2) ELSE NULL END,'status',CASE WHEN rows_count > 0 AND cost IS NOT NULL AND revenue <> 0 THEN 'CALCULATED' ELSE 'UNKNOWN' END,'source_rows',rows_count,'source_updated_at',source_updated_at,'version',1),
    jsonb_build_object('metric_id','receivables','value',CASE WHEN ar_rows > 0 THEN ar_value ELSE NULL END,'status',CASE WHEN ar_rows > 0 THEN 'CONFIRMED' ELSE 'UNKNOWN' END,'source_rows',ar_rows,'source_updated_at',ar_updated_at,'version',1),
    jsonb_build_object('metric_id','payables','value',CASE WHEN ap_rows > 0 THEN ap_value ELSE NULL END,'status',CASE WHEN ap_rows > 0 THEN 'CONFIRMED' ELSE 'UNKNOWN' END,'source_rows',ap_rows,'source_updated_at',ap_updated_at,'version',1),
    jsonb_build_object('metric_id','inventory_value','value',CASE WHEN stock_rows > 0 THEN inventory_value ELSE NULL END,'status',CASE WHEN stock_rows > 0 THEN 'CONFIRMED' ELSE 'UNKNOWN' END,'source_rows',stock_rows,'source_updated_at',inventory_updated_at,'version',1),
    jsonb_build_object('metric_id','cash','value',CASE WHEN payment_rows > 0 THEN inflow-outflow ELSE NULL END,'status',CASE WHEN payment_rows > 0 THEN 'CONFIRMED' ELSE 'UNKNOWN' END,'source_rows',payment_rows,'source_updated_at',payment_updated_at,'version',1)
  ) AS items
  FROM base
)
SELECT jsonb_build_object(
  'company_id', p_company_id,
  'data_as_of', coalesce(p_to, current_date),
  'snapshot_type','canonical_metrics',
  'metrics', metrics.items
)
FROM metrics;
$$;

GRANT SELECT ON metric_definitions TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_canonical_metric_snapshot(uuid,date,date) TO authenticated, anon;
