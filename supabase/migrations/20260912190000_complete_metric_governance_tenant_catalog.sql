-- Complete the canonical semantic metric catalog without weakening tenant isolation.
-- Existing metric_governance rows are global seed definitions; RLS is tenant-scoped.
-- Re-materialize the canonical definitions per real tenant using an actual active membership
-- to satisfy the existing current_company_id() trigger contract. No service-role bypass.

DO $$
DECLARE
  v_company uuid;
  v_user uuid;
BEGIN
  FOR v_company IN SELECT DISTINCT company_id FROM public.company_memberships WHERE is_active = true LOOP
    SELECT user_id INTO v_user
    FROM public.company_memberships
    WHERE company_id = v_company AND is_active = true
    ORDER BY is_default DESC, user_id
    LIMIT 1;

    IF v_user IS NULL THEN
      RAISE EXCEPTION 'METRIC_GOVERNANCE_TENANT_MEMBER_REQUIRED:%', v_company;
    END IF;

    PERFORM set_config('request.jwt.claim.sub', v_user::text, true);
    PERFORM set_config('role', 'authenticated', true);

    INSERT INTO public.metric_governance (
      metric_id,name,version,definition,formula,source,dimensions,filters,time_semantics,
      freshness,owner,dependencies,consumers,tests,evidence,certification_status,company_id
    ) VALUES
    ('metric.net_sales','صافي المبيعات',1,'قيمة المبيعات المعتمدة من حقل subtotal المرجعي في فواتير البيع.','SUM(sales_invoices.subtotal)',ARRAY['sales_invoices'],ARRAY['company','branch','customer','product','category','period'],ARRAY[]::text[],jsonb_build_object('period','transaction_date','primary','transaction','timezone','source'),jsonb_build_object('mode','source-derived','maxAgeMinutes',1440),'core-data',ARRAY['sales'],ARRAY['dashboard','reports','chatbi','forecast','recommendations','decision-engine'],ARRAY['golden:net_sales'],ARRAY['sales_invoices'],'REVIEWED',v_company),
    ('metric.gross_profit','مجمل الربح',1,'مجمل الربح من مبيعات البيع بعد تكلفة الأصناف.','SUM(sale_items.line_total - sale_items.cost_price * sale_items.quantity)',ARRAY['sales_invoices','sale_items'],ARRAY['company','branch','product','category','period'],ARRAY[]::text[],jsonb_build_object('period','transaction_date','primary','transaction','timezone','source'),jsonb_build_object('mode','source-derived','maxAgeMinutes',1440),'core-data',ARRAY['sales','cost'],ARRAY['dashboard','reports','decision-engine'],ARRAY['golden:gross_profit'],ARRAY['sales_invoices','sale_items'],'REVIEWED',v_company),
    ('metric.sales_cost','تكلفة المبيعات',1,'تكلفة المبيعات المحسوبة من تكلفة الصنف في بنود البيع.','SUM(sale_items.quantity * sale_items.cost_price)',ARRAY['sales_invoices','sale_items'],ARRAY['company','branch','product','category','period'],ARRAY[]::text[],jsonb_build_object('period','transaction_date','primary','transaction','timezone','source'),jsonb_build_object('mode','source-derived','maxAgeMinutes',1440),'core-data',ARRAY['sales','cost'],ARRAY['dashboard','reports','decision-engine'],ARRAY['golden:sales_cost'],ARRAY['sale_items'],'REVIEWED',v_company),
    ('metric.purchases','المشتريات',1,'إجمالي المشتريات المعتمدة من فواتير الشراء غير الملغاة.','SUM(purchase_invoices.total)',ARRAY['purchase_invoices'],ARRAY['company','supplier','period'],ARRAY[]::text[],jsonb_build_object('period','transaction_date','primary','transaction','timezone','source'),jsonb_build_object('mode','source-derived','maxAgeMinutes',1440),'core-data',ARRAY['purchases'],ARRAY['dashboard','reports','cashflow','decision-engine'],ARRAY['golden:purchases'],ARRAY['purchase_invoices'],'REVIEWED',v_company),
    ('metric.receivables','الذمم المدينة',1,'الرصيد المستحق من فواتير البيع بعد المدفوعات.','SUM(sales_invoices.total - sales_invoices.paid_amount)',ARRAY['sales_invoices'],ARRAY['company','customer','period'],ARRAY[]::text[],jsonb_build_object('period','transaction_date','primary','transaction','timezone','source'),jsonb_build_object('mode','source-derived','maxAgeMinutes',1440),'core-data',ARRAY['sales'],ARRAY['dashboard','reports','collections','decision-engine'],ARRAY['golden:receivables'],ARRAY['sales_invoices'],'REVIEWED',v_company),
    ('metric.payables','الذمم الدائنة',1,'الرصيد المستحق من فواتير الشراء بعد المدفوعات.','SUM(purchase_invoices.total - purchase_invoices.paid_amount)',ARRAY['purchase_invoices'],ARRAY['company','supplier','period'],ARRAY[]::text[],jsonb_build_object('period','transaction_date','primary','transaction','timezone','source'),jsonb_build_object('mode','source-derived','maxAgeMinutes',1440),'core-data',ARRAY['purchases'],ARRAY['dashboard','reports','cashflow','decision-engine'],ARRAY['golden:payables'],ARRAY['purchase_invoices'],'REVIEWED',v_company),
    ('metric.cash','النقدية',1,'صافي التدفقات النقدية من المدفوعات الداخلة والخارجة ضمن فترة as-of.','SUM(payments.direction=in) - SUM(payments.direction=out)',ARRAY['payments'],ARRAY['company','currency','period'],ARRAY[]::text[],jsonb_build_object('period','payment_date','primary','transaction','timezone','source'),jsonb_build_object('mode','source-derived','maxAgeMinutes',60),'core-data',ARRAY['payments'],ARRAY['dashboard','cashflow','decision-engine'],ARRAY['golden:cash_liquidity'],ARRAY['payments'],'REVIEWED',v_company),
    ('metric.inventory_value','قيمة المخزون',1,'قيمة المخزون من الكمية مضروبة في تكلفة الوحدة.','SUM(inventory_balances.quantity * inventory_balances.unit_cost)',ARRAY['inventory_balances'],ARRAY['company','warehouse','product','category'],ARRAY[]::text[],jsonb_build_object('period','data_as_of','primary','snapshot','timezone','source'),jsonb_build_object('mode','source-derived','maxAgeMinutes',60),'core-data',ARRAY['inventory'],ARRAY['dashboard','inventory-intelligence','recommendations','decision-engine'],ARRAY['golden:inventory_value'],ARRAY['inventory_balances'],'REVIEWED',v_company),
    ('metric.inventory_liquidity_velocity','سيولة وحركة المخزون',1,'حركة المخزون ومتوسط المبيعات اليومية ومدة التصريف وتصنيف moving/frozen.','inventory_liquidity_velocity(company, as_of, days)',ARRAY['inventory_balances','sale_items','sales_invoices','products'],ARRAY['company','product','category','period'],ARRAY[]::text[],jsonb_build_object('period','as_of','primary','snapshot','timezone','source'),jsonb_build_object('mode','source-derived','maxAgeMinutes',60),'core-data',ARRAY['inventory','sales'],ARRAY['dashboard','inventory-intelligence','recommendations','decision-engine'],ARRAY['golden:inventory_velocity'],ARRAY['inventory_liquidity_velocity'],'REVIEWED',v_company),
    ('metric.demand','الطلب',1,'متوسط الطلب اليومي المبني على حركة البيع ضمن نافذة as-of.','inventory_liquidity_velocity.avg_daily_sales',ARRAY['sale_items','sales_invoices','products'],ARRAY['company','product','period'],ARRAY[]::text[],jsonb_build_object('period','as_of','primary','snapshot','timezone','source'),jsonb_build_object('mode','source-derived','maxAgeMinutes',60),'core-data',ARRAY['sales','inventory'],ARRAY['forecast','reorder','recommendations','decision-engine'],ARRAY['golden:demand'],ARRAY['inventory_liquidity_velocity','demand_reorder_snapshot'],'REVIEWED',v_company),
    ('metric.reorder','نقطة إعادة الطلب',1,'نقطة إعادة الطلب والكمية المقترحة وفق الطلب اليومي ومدة التوريد وأيام الأمان.','demand * (lead_time_days + safety_days); suggested=max(0,demand*(lead_time+safety+30)-stock)',ARRAY['inventory_balances','sale_items','sales_invoices','products'],ARRAY['company','product','period'],ARRAY[]::text[],jsonb_build_object('period','as_of','primary','snapshot','timezone','source'),jsonb_build_object('mode','source-derived','maxAgeMinutes',60),'core-data',ARRAY['demand','inventory'],ARRAY['dashboard','reorder','recommendations','decision-engine'],ARRAY['golden:reorder'],ARRAY['demand_reorder_snapshot'],'REVIEWED',v_company),
    ('metric.forecast','التنبؤ',1,'قيمة التنبؤ المخزنة الناتجة عن نموذج التنبؤ المعتمد مع حدوده وثقة النموذج ونقاط البيانات.','forecasts.forecast_value with lower_bound/upper_bound, quality_score, confidence, data_points',ARRAY['forecasts','sales_invoices','sale_items'],ARRAY['company','entity','metric','period'],ARRAY[]::text[],jsonb_build_object('period','forecast.period','primary','forecast','timezone','source'),jsonb_build_object('mode','source-derived','maxAgeMinutes',1440),'core-data',ARRAY['sales','demand'],ARRAY['dashboard','forecast','recommendations','decision-engine'],ARRAY['golden:forecast'],ARRAY['get_forecast_snapshot'],'REVIEWED',v_company)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- The legacy global seed rows are not tenant-visible under the canonical RLS policy.
-- Remove only those null-tenant seed rows after tenant copies exist.
DELETE FROM public.metric_governance WHERE company_id IS NULL;
