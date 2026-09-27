-- Canonical specialty import expansion: purchases, suppliers, inventory balances and payments.
-- Extends the existing import_commit_batch boundary; no parallel importer or RPC is introduced.

ALTER TABLE public.canonical_import_commits
  DROP CONSTRAINT IF EXISTS canonical_import_commits_entity_type_check;

ALTER TABLE public.canonical_import_commits
  ADD CONSTRAINT canonical_import_commits_entity_type_check
  CHECK (
    entity_type IN ('products','customers','sales_invoices','purchase_invoices','suppliers','inventory_balances','payments')
    OR entity_type ~ '^generic:[a-z][a-z0-9_-]{0,63}$'
  );

CREATE OR REPLACE FUNCTION public.import_commit_batch(
  p_company_id uuid,
  p_entity_type text,
  p_rows jsonb,
  p_null_policy text DEFAULT 'preserve'::text,
  p_source_hash text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog'
SET statement_timeout TO '30s'
AS $function$
declare
  v_company_id uuid := public.current_company_id();
  v_row jsonb;
  v_id uuid;
  v_count integer := 0;
  v_ids jsonb := '[]'::jsonb;
  v_existing public.canonical_import_commits%rowtype;
  v_coded_ids jsonb := '[]'::jsonb;
  v_null_ids jsonb := '[]'::jsonb;
begin
  if v_company_id is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if p_company_id is distinct from v_company_id then raise exception 'TENANT_CONTEXT_MISMATCH'; end if;
  if p_source_hash is null or btrim(p_source_hash) = '' then raise exception 'IMPORT_SOURCE_HASH_REQUIRED'; end if;
  if p_source_hash !~ '^sha256:[0-9a-fA-F]{64}$' then raise exception 'IMPORT_SOURCE_HASH_INVALID'; end if;
  if p_entity_type !~ '^generic:[A-Za-z][A-Za-z0-9_-]{0,63}$'
     and p_entity_type not in ('products','customers','sales_invoices') then
    raise exception 'IMPORT_ENTITY_TYPE_UNSUPPORTED';
  end if;
  if jsonb_typeof(p_rows) is distinct from 'array' then raise exception 'IMPORT_ROWS_MUST_BE_ARRAY'; end if;

  select * into v_existing
  from public.canonical_import_commits c
  where c.company_id=v_company_id
    and c.entity_type=p_entity_type
    and c.source_hash=p_source_hash
  for update;

  if found then
    return jsonb_build_object('committed',v_existing.committed_count,'ids',v_existing.committed_ids,'idempotent_replay',true);
  end if;

  if p_entity_type ~ '^generic:' then
    if jsonb_array_length(p_rows)=0 then
      insert into public.canonical_import_commits(company_id,entity_type,source_hash,committed_ids,committed_count)
      values(v_company_id,p_entity_type,p_source_hash,'[]'::jsonb,0)
      on conflict(company_id,entity_type,source_hash) do nothing;
      return jsonb_build_object('committed',0,'ids','[]'::jsonb,'idempotent_replay',false);
    end if;

    if exists (
      select 1 from jsonb_array_elements(p_rows) as x(value)
      where jsonb_typeof(value) is distinct from 'object'
         or jsonb_typeof(value->'data') is distinct from 'object'
         or jsonb_typeof(value->'provenance') is distinct from 'object'
         or nullif(value->>'row_number','') is null
         or (value->>'row_number')::integer < 1
         or nullif(btrim(value->>'record_key'),'') is null
         or value->'provenance'->>'sourceHash' is distinct from p_source_hash
    ) then
      raise exception 'GENERIC_CANONICAL_ROW_INVALID';
    end if;

    if exists (
      select 1
      from (
        select value->>'record_key' as record_key, count(*) as c
        from jsonb_array_elements(p_rows) as x(value)
        group by value->>'record_key'
        having count(*) > 1
      ) d
    ) then
      raise exception 'GENERIC_CANONICAL_DUPLICATE_RECORD_KEY';
    end if;

    insert into public.canonical_import_commits(company_id,entity_type,source_hash,committed_ids,committed_count)
    values(v_company_id,p_entity_type,p_source_hash,'[]'::jsonb,0)
    on conflict(company_id,entity_type,source_hash) do nothing;

    if not found then
      select * into v_existing
      from public.canonical_import_commits c
      where c.company_id=v_company_id and c.entity_type=p_entity_type and c.source_hash=p_source_hash
      for update;
      return jsonb_build_object('committed',v_existing.committed_count,'ids',v_existing.committed_ids,'idempotent_replay',true);
    end if;

    with inserted as (
      insert into public.canonical_dataset_records(
        company_id,import_job_id,source_hash,semantic_domain,row_number,record_key,data,provenance
      )
      select
        v_company_id,
        nullif(value->'provenance'->>'sourceDocumentId','')::uuid,
        p_source_hash,
        substr(p_entity_type,9),
        (value->>'row_number')::integer,
        value->>'record_key',
        value->'data',
        value->'provenance'
      from jsonb_array_elements(p_rows) as x(value)
      order by (value->>'row_number')::integer
      returning id,row_number
    )
    select count(*)::integer, coalesce(jsonb_agg(id order by row_number),'[]'::jsonb)
      into v_count,v_ids
    from inserted;

    if v_count <> jsonb_array_length(p_rows) then raise exception 'GENERIC_CANONICAL_COMMIT_COUNT_MISMATCH'; end if;

    update public.canonical_import_commits
      set committed_ids=v_ids, committed_count=v_count, committed_at=clock_timestamp()
      where company_id=v_company_id and entity_type=p_entity_type and source_hash=p_source_hash;

    return jsonb_build_object('committed',v_count,'ids',v_ids,'idempotent_replay',false);
  end if;

  if jsonb_array_length(p_rows)=0 then
    insert into public.canonical_import_commits(company_id,entity_type,source_hash,committed_ids,committed_count)
    values(v_company_id,p_entity_type,p_source_hash,'[]'::jsonb,0);
    return jsonb_build_object('committed',0,'ids','[]'::jsonb,'idempotent_replay',false);
  end if;

  if p_entity_type='customers' and jsonb_array_length(p_rows) <= 10 then
    for v_row in select value from jsonb_array_elements(p_rows) loop
      select target_id into v_id from public.import_upsert_customer(
        v_company_id,v_row->>'name',v_row->>'code',v_row->>'phone',v_row->>'email',v_row->>'segment',
        nullif(v_row->>'credit_limit','')::numeric,nullif(v_row->>'payment_terms_days','')::integer,p_null_policy
      );
      if v_id is null then raise exception 'IMPORT_TARGET_ID_MISSING'; end if;
      v_count:=v_count+1; v_ids:=v_ids||jsonb_build_array(v_id);
    end loop;
  elsif p_entity_type='customers' then
    create temp table tmp_import_customers on commit drop as
    select ord::bigint as ord,
      nullif(btrim(value->>'name'),'') as name,
      nullif(btrim(value->>'code'),'') as code,
      nullif(btrim(value->>'phone'),'') as phone,
      nullif(btrim(value->>'email'),'') as email,
      nullif(btrim(value->>'segment'),'') as segment,
      nullif(value->>'credit_limit','')::numeric as credit_limit,
      nullif(value->>'payment_terms_days','')::integer as payment_terms_days,
      public.normalize_import_key(nullif(btrim(value->>'code'),'')) as norm_code,
      null::uuid as target_id
    from jsonb_array_elements(p_rows) with ordinality as x(value,ord);
    if exists (select 1 from tmp_import_customers where name is null or name='') then raise exception 'customer name is required'; end if;
    update public.customers c
    set name=case when p_null_policy='preserve' and t.name is null then c.name else coalesce(t.name,c.name) end,
        phone=case when p_null_policy='preserve' and t.phone is null then c.phone else coalesce(t.phone,c.phone) end,
        email=case when p_null_policy='preserve' and t.email is null then c.email else coalesce(t.email,c.email) end,
        segment=case when p_null_policy='preserve' and t.segment is null then c.segment else coalesce(t.segment,c.segment) end,
        credit_limit=case when p_null_policy='preserve' and t.credit_limit is null then c.credit_limit else coalesce(t.credit_limit,c.credit_limit) end,
        payment_terms_days=case when p_null_policy='preserve' and t.payment_terms_days is null then c.payment_terms_days else coalesce(t.payment_terms_days,c.payment_terms_days) end
    from tmp_import_customers t
    where t.norm_code is not null and c.company_id=v_company_id and c.code is not null and btrim(c.code)<>'' and public.normalize_import_key(c.code)=t.norm_code;
    insert into public.customers(company_id,name,code,phone,email,segment,credit_limit,payment_terms_days)
    select v_company_id,t.name,t.code,t.phone,t.email,coalesce(t.segment,'regular'),coalesce(t.credit_limit,0),coalesce(t.payment_terms_days,30)
    from tmp_import_customers t
    where t.norm_code is not null and not exists (
      select 1 from public.customers c where c.company_id=v_company_id and c.code is not null and btrim(c.code)<>'' and public.normalize_import_key(c.code)=t.norm_code
    ) on conflict do nothing;
    for v_row in select to_jsonb(t) from tmp_import_customers t where t.norm_code is null order by t.ord loop
      select target_id into v_id from public.import_upsert_customer(
        v_company_id,v_row->>'name',null,v_row->>'phone',v_row->>'email',v_row->>'segment',
        nullif(v_row->>'credit_limit','')::numeric,nullif(v_row->>'payment_terms_days','')::integer,p_null_policy
      );
      if v_id is null then raise exception 'IMPORT_TARGET_ID_MISSING'; end if;
      update tmp_import_customers set target_id=v_id where ord=(v_row->>'ord')::bigint;
    end loop;
    select coalesce(jsonb_agg(c.id order by t.ord),'[]'::jsonb) into v_coded_ids
    from tmp_import_customers t
    join public.customers c on c.company_id=v_company_id and c.code is not null and btrim(c.code)<>'' and public.normalize_import_key(c.code)=t.norm_code
    where t.norm_code is not null;
    select coalesce(jsonb_agg(target_id order by ord),'[]'::jsonb) into v_null_ids
    from tmp_import_customers where norm_code is null and target_id is not null;
    v_ids := v_coded_ids || v_null_ids;
    v_count := jsonb_array_length(v_ids);
    if v_count <> jsonb_array_length(p_rows) then raise exception 'IMPORT_TARGET_ID_MISSING'; end if;
  elsif p_entity_type='suppliers' then
    for v_row in select value from jsonb_array_elements(p_rows) loop
      if nullif(btrim(v_row->>'name'),'') is null then raise exception 'SUPPLIER_NAME_REQUIRED'; end if;
      select id into v_id from public.suppliers
      where company_id=v_company_id
        and ((nullif(btrim(v_row->>'code'),'') is not null and public.normalize_import_key(code)=public.normalize_import_key(v_row->>'code'))
          or (nullif(btrim(v_row->>'code'),'') is null and public.normalize_import_key(name)=public.normalize_import_key(v_row->>'name')))
      order by id limit 1 for update;
      if v_id is null then
        insert into public.suppliers(company_id,name,code,phone,email,address,tax_id,payment_terms_days)
        values(v_company_id,btrim(v_row->>'name'),nullif(btrim(v_row->>'code'),''),nullif(btrim(v_row->>'phone'),''),nullif(btrim(v_row->>'email'),''),nullif(btrim(v_row->>'address'),''),nullif(btrim(v_row->>'tax_id'),''),nullif(v_row->>'payment_terms_days','')::integer)
        returning id into v_id;
      else
        update public.suppliers
        set name=case when p_null_policy='preserve' and v_row->>'name' is null then name else coalesce(nullif(btrim(v_row->>'name'),''),name) end,
            code=case when p_null_policy='preserve' and v_row->>'code' is null then code else coalesce(nullif(btrim(v_row->>'code'),''),code) end,
            phone=case when p_null_policy='preserve' and v_row->>'phone' is null then phone else coalesce(nullif(btrim(v_row->>'phone'),''),phone) end,
            email=case when p_null_policy='preserve' and v_row->>'email' is null then email else coalesce(nullif(btrim(v_row->>'email'),''),email) end,
            address=case when p_null_policy='preserve' and v_row->>'address' is null then address else coalesce(nullif(btrim(v_row->>'address'),''),address) end,
            tax_id=case when p_null_policy='preserve' and v_row->>'tax_id' is null then tax_id else coalesce(nullif(btrim(v_row->>'tax_id'),''),tax_id) end,
            payment_terms_days=case when p_null_policy='preserve' and v_row->>'payment_terms_days' is null then payment_terms_days else nullif(v_row->>'payment_terms_days','')::integer end
        where id=v_id and company_id=v_company_id;
      end if;
      if v_id is null then raise exception 'IMPORT_TARGET_ID_MISSING'; end if;
      v_count:=v_count+1; v_ids:=v_ids||jsonb_build_array(v_id);
    end loop;
  else
    for v_row in select value from jsonb_array_elements(p_rows) loop
      if p_entity_type='products' then
        select target_id into v_id from public.import_upsert_product(
          v_company_id,v_row->>'sku',v_row->>'name',v_row->>'unit',
          nullif(v_row->>'cost_price','')::numeric,nullif(v_row->>'selling_price','')::numeric,
          nullif(v_row->>'min_stock','')::numeric,nullif(v_row->>'reorder_point','')::numeric,
          case when v_row ? 'is_active' and v_row->>'is_active'<>'' then (v_row->>'is_active')::boolean else null end,p_null_policy
        );
      elsif p_entity_type='sales_invoices' then
        select target_id into v_id from public.import_upsert_sales_invoice(
          v_company_id,v_row->>'invoice_number',nullif(v_row->>'invoice_date','')::date,
          nullif(v_row->>'customer_id','')::uuid,v_row->>'customer_name',
          nullif(v_row->>'subtotal','')::numeric,nullif(v_row->>'tax_amount','')::numeric,
          nullif(v_row->>'total','')::numeric,nullif(v_row->>'paid_amount','')::numeric,
          v_row->>'status',p_null_policy
        );
      elsif p_entity_type='purchase_invoices' then
        select public.current_company_id() into v_company_id;
        if nullif(btrim(v_row->>'invoice_number'),'') is null then raise exception 'PURCHASE_INVOICE_NUMBER_REQUIRED'; end if;
        if nullif(btrim(v_row->>'invoice_date'),'') is null then raise exception 'PURCHASE_INVOICE_DATE_REQUIRED'; end if;
        if nullif(v_row->>'subtotal','') is null or (nullif(v_row->>'subtotal','')::numeric) < 0 then raise exception 'PURCHASE_SUBTOTAL_REQUIRED'; end if;
        if nullif(v_row->>'tax_amount','') is null or (nullif(v_row->>'tax_amount','')::numeric) < 0 then raise exception 'PURCHASE_TAX_AMOUNT_REQUIRED'; end if;
        if nullif(v_row->>'total','') is null or (nullif(v_row->>'total','')::numeric) < 0 then raise exception 'PURCHASE_TOTAL_REQUIRED'; end if;
        if nullif(v_row->>'paid_amount','') is null or (nullif(v_row->>'paid_amount','')::numeric) < 0 then raise exception 'PURCHASE_PAID_AMOUNT_REQUIRED'; end if;
        if nullif(btrim(v_row->>'status'),'') is null then raise exception 'PURCHASE_STATUS_REQUIRED'; end if;
        select id into v_id from public.suppliers
        where company_id=v_company_id and (
          (nullif(v_row->>'supplier_id','') is not null and id=nullif(v_row->>'supplier_id','')::uuid)
          or (nullif(v_row->>'supplier_code','') is not null and public.normalize_import_key(code)=public.normalize_import_key(v_row->>'supplier_code'))
          or (nullif(v_row->>'supplier_name','') is not null and public.normalize_import_key(name)=public.normalize_import_key(v_row->>'supplier_name'))
        ) order by id limit 1 for update;
        if v_id is null then raise exception 'PURCHASE_SUPPLIER_REQUIRED'; end if;
        select public.currency into v_company_currency from public.companies public where public.id=v_company_id;
        select id into v_id from public.purchase_invoices
        where company_id=v_company_id and public.normalize_import_key(invoice_number)=public.normalize_import_key(v_row->>'invoice_number')
        limit 1 for update;
        if v_id is null then
          insert into public.purchase_invoices(company_id,supplier_id,invoice_number,invoice_date,due_date,status,subtotal,discount_amount,tax_amount,total,paid_amount,currency,notes)
          values(v_company_id, (select id from public.suppliers where company_id=v_company_id and ((nullif(v_row->>'supplier_id','') is not null and id=nullif(v_row->>'supplier_id','')::uuid) or (nullif(v_row->>'supplier_code','') is not null and public.normalize_import_key(code)=public.normalize_import_key(v_row->>'supplier_code')) or (nullif(v_row->>'supplier_name','') is not null and public.normalize_import_key(name)=public.normalize_import_key(v_row->>'supplier_name'))) order by id limit 1), btrim(v_row->>'invoice_number'), (v_row->>'invoice_date')::date, nullif(v_row->>'due_date','')::date, btrim(v_row->>'status'), (v_row->>'subtotal')::numeric, nullif(v_row->>'discount_amount','')::numeric, (v_row->>'tax_amount')::numeric, (v_row->>'total')::numeric, (v_row->>'paid_amount')::numeric, coalesce(nullif(upper(btrim(v_row->>'currency')), ''), upper(v_company_currency)), nullif(btrim(v_row->>'notes'),'')
          returning id into v_id;
        else
          update public.purchase_invoices
          set supplier_id=(select id from public.suppliers where company_id=v_company_id and ((nullif(v_row->>'supplier_id','') is not null and id=nullif(v_row->>'supplier_id','')::uuid) or (nullif(v_row->>'supplier_code','') is not null and public.normalize_import_key(code)=public.normalize_import_key(v_row->>'supplier_code')) or (nullif(v_row->>'supplier_name','') is not null and public.normalize_import_key(name)=public.normalize_import_key(v_row->>'supplier_name'))) order by id limit 1),
              invoice_date=case when p_null_policy='preserve' and v_row->>'invoice_date' is null then invoice_date else (v_row->>'invoice_date')::date end,
              due_date=case when p_null_policy='preserve' and v_row->>'due_date' is null then due_date else nullif(v_row->>'due_date','')::date end,
              status=case when p_null_policy='preserve' and v_row->>'status' is null then status else btrim(v_row->>'status') end,
              subtotal=case when p_null_policy='preserve' and v_row->>'subtotal' is null then subtotal else (v_row->>'subtotal')::numeric end,
              discount_amount=case when p_null_policy='preserve' and v_row->>'discount_amount' is null then discount_amount else nullif(v_row->>'discount_amount','')::numeric end,
              tax_amount=case when p_null_policy='preserve' and v_row->>'tax_amount' is null then tax_amount else (v_row->>'tax_amount')::numeric end,
              total=case when p_null_policy='preserve' and v_row->>'total' is null then total else (v_row->>'total')::numeric end,
              paid_amount=case when p_null_policy='preserve' and v_row->>'paid_amount' is null then paid_amount else (v_row->>'paid_amount')::numeric end,
              currency=case when p_null_policy='preserve' and v_row->>'currency' is null then currency else coalesce(nullif(upper(btrim(v_row->>'currency')), ''), currency) end,
              notes=case when p_null_policy='preserve' and v_row->>'notes' is null then notes else coalesce(nullif(btrim(v_row->>'notes'),''), notes) end
          where id=v_id and company_id=v_company_id;
        end if;
      elsif p_entity_type='inventory_balances' then
        if nullif(v_row->>'quantity','') is null or (v_row->>'quantity')::numeric < 0 then raise exception 'INVENTORY_QUANTITY_REQUIRED'; end if;
        select id into v_id from public.products
        where company_id=v_company_id and ((nullif(v_row->>'product_id','') is not null and id=nullif(v_row->>'product_id','')::uuid) or (nullif(v_row->>'sku','') is not null and public.normalize_import_key(sku)=public.normalize_import_key(v_row->>'sku')))
        order by id limit 1;
        if v_id is null then raise exception 'INVENTORY_PRODUCT_REQUIRED'; end if;
        v_supplier_id := v_id;
        select id into v_warehouse_id from public.warehouses
        where company_id=v_company_id and ((nullif(v_row->>'warehouse_id','') is not null and id=nullif(v_row->>'warehouse_id','')::uuid) or (nullif(v_row->>'warehouse','') is not null and (public.normalize_import_key(code)=public.normalize_import_key(v_row->>'warehouse') or public.normalize_import_key(name)=public.normalize_import_key(v_row->>'warehouse'))))
        order by id limit 1;
        if v_warehouse_id is null then raise exception 'INVENTORY_WAREHOUSE_REQUIRED'; end if;
        select id into v_id from public.inventory_balances where company_id=v_company_id and warehouse_id=v_warehouse_id and product_id=v_supplier_id limit 1 for update;
        if v_id is null then
          insert into public.inventory_balances(company_id,warehouse_id,product_id,quantity,unit_cost,last_movement_date)
          values(v_company_id,v_warehouse_id,v_supplier_id,(v_row->>'quantity')::numeric,nullif(v_row->>'unit_cost','')::numeric,nullif(v_row->>'last_movement_date','')::date)
          returning id into v_id;
        else
          update public.inventory_balances
          set quantity=case when p_null_policy='preserve' and v_row->>'quantity' is null then quantity else (v_row->>'quantity')::numeric end,
              unit_cost=case when p_null_policy='preserve' and v_row->>'unit_cost' is null then unit_cost else nullif(v_row->>'unit_cost','')::numeric end,
              last_movement_date=case when p_null_policy='preserve' and v_row->>'last_movement_date' is null then last_movement_date else nullif(v_row->>'last_movement_date','')::date end
          where id=v_id and company_id=v_company_id;
        end if;
      elsif p_entity_type='payments' then
        if nullif(btrim(v_row->>'reference'),'') is null then raise exception 'PAYMENT_REFERENCE_REQUIRED'; end if;
        if v_row->>'direction' not in ('in','out') then raise exception 'PAYMENT_DIRECTION_INVALID'; end if;
        if nullif(v_row->>'payment_date','') is null then raise exception 'PAYMENT_DATE_REQUIRED'; end if;
        if nullif(v_row->>'payment_amount','') is null or (v_row->>'payment_amount')::numeric <= 0 then raise exception 'PAYMENT_AMOUNT_REQUIRED'; end if;
        select public.currency into v_company_currency from public.companies public where public.id=v_company_id;
        v_customer_id := nullif(v_row->>'customer_id','')::uuid;
        v_supplier_id := nullif(v_row->>'supplier_id','')::uuid;
        if v_customer_id is null and nullif(v_row->>'customer_name','') is not null then select id into v_customer_id from public.customers where company_id=v_company_id and public.normalize_import_key(name)=public.normalize_import_key(v_row->>'customer_name') order by id limit 1; end if;
        if v_supplier_id is null and nullif(v_row->>'supplier_name','') is not null then select id into v_supplier_id from public.suppliers where company_id=v_company_id and public.normalize_import_key(name)=public.normalize_import_key(v_row->>'supplier_name') order by id limit 1; end if;
        if v_customer_id is not null and not exists(select 1 from public.customers where id=v_customer_id and company_id=v_company_id) then raise exception 'PAYMENT_CUSTOMER_TENANT_MISMATCH'; end if;
        if v_supplier_id is not null and not exists(select 1 from public.suppliers where id=v_supplier_id and company_id=v_company_id) then raise exception 'PAYMENT_SUPPLIER_TENANT_MISMATCH'; end if;
        v_id := nullif(v_row->>'payment_id','')::uuid;
        if v_id is not null then select id into v_id from public.payments where id=v_id and company_id=v_company_id limit 1 for update; end if;
        if v_id is null then select id into v_id from public.payments where company_id=v_company_id and public.normalize_import_key(reference)=public.normalize_import_key(v_row->>'reference') and direction=v_row->>'direction' and payment_date=(v_row->>'payment_date')::date limit 1 for update; end if;
        if v_id is null then
          insert into public.payments(id,company_id,direction,customer_id,supplier_id,invoice_id,amount,payment_date,method,reference,currency,notes)
          values(coalesce(nullif(v_row->>'payment_id','')::uuid, gen_random_uuid()),v_company_id,v_row->>'direction',v_customer_id,v_supplier_id,nullif(v_row->>'invoice_id','')::uuid,(v_row->>'payment_amount')::numeric,(v_row->>'payment_date')::date,nullif(btrim(v_row->>'payment_method'),''),btrim(v_row->>'reference'),coalesce(nullif(upper(btrim(v_row->>'currency')), ''), upper(v_company_currency)),nullif(btrim(v_row->>'notes'),''))
          returning id into v_id;
        else
          update public.payments
          set direction=v_row->>'direction', customer_id=v_customer_id, supplier_id=v_supplier_id, invoice_id=nullif(v_row->>'invoice_id','')::uuid,
              amount=(v_row->>'payment_amount')::numeric, payment_date=(v_row->>'payment_date')::date,
              method=case when p_null_policy='preserve' and v_row->>'payment_method' is null then method else coalesce(nullif(btrim(v_row->>'payment_method'),''),method) end,
              reference=case when p_null_policy='preserve' and v_row->>'reference' is null then reference else btrim(v_row->>'reference') end,
              currency=case when p_null_policy='preserve' and v_row->>'currency' is null then currency else coalesce(nullif(upper(btrim(v_row->>'currency')), ''),currency) end,
              notes=case when p_null_policy='preserve' and v_row->>'notes' is null then notes else coalesce(nullif(btrim(v_row->>'notes'),''),notes) end
          where id=v_id and company_id=v_company_id;
        end if;
      else
        raise exception 'IMPORT_ENTITY_TYPE_UNSUPPORTED';
      end if;
      if v_id is null then raise exception 'IMPORT_TARGET_ID_MISSING'; end if;
      v_count:=v_count+1; v_ids:=v_ids||jsonb_build_array(v_id);
    end loop;
  end if;

  insert into public.canonical_import_commits(company_id,entity_type,source_hash,committed_ids,committed_count)
  values(v_company_id,p_entity_type,p_source_hash,v_ids,v_count);
  return jsonb_build_object('committed',v_count,'ids',v_ids,'idempotent_replay',false);
end;
$function$;


CREATE OR REPLACE FUNCTION public.import_commit_batch(
  p_company_id uuid,
  p_entity_type text,
  p_rows jsonb,
  p_null_policy text DEFAULT 'preserve'::text,
  p_source_hash text DEFAULT NULL::text,
  p_import_job_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog'
SET statement_timeout TO '30s'
AS $wrapper$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_file_record_id uuid;
  v_file_hash text;
  v_file_status text;
  v_file_security_status text;
  v_file_metadata jsonb;
  v_source_fingerprint text;
  v_job_type text;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  IF p_import_job_id IS NULL THEN RAISE EXCEPTION 'IMPORT_JOB_ID_REQUIRED'; END IF;
  IF p_source_hash IS NULL OR btrim(p_source_hash) = '' THEN RAISE EXCEPTION 'IMPORT_SOURCE_HASH_REQUIRED'; END IF;
  IF p_source_hash !~ '^sha256:[0-9a-fA-F]{64}$' THEN RAISE EXCEPTION 'IMPORT_SOURCE_HASH_INVALID'; END IF;

  SELECT i.file_record_id,fr.file_hash,fr.status,fr.security_status,fr.metadata,i.source_fingerprint,i.job_type
  INTO v_file_record_id,v_file_hash,v_file_status,v_file_security_status,v_file_metadata,v_source_fingerprint,v_job_type
  FROM public.import_jobs i
  JOIN public.file_records fr ON fr.id=i.file_record_id AND fr.company_id=i.company_id
  WHERE i.id=p_import_job_id AND i.company_id=v_company_id
  FOR SHARE OF i;

  IF NOT FOUND OR v_file_record_id IS NULL THEN RAISE EXCEPTION 'IMPORT_JOB_SOURCE_RECORD_NOT_FOUND_OR_FORBIDDEN'; END IF;
  IF v_file_hash IS NULL OR v_file_hash !~ '^sha256:[0-9a-fA-F]{64}$' THEN RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_HASH_INVALID'; END IF;
  IF v_file_hash IS DISTINCT FROM p_source_hash THEN RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_HASH_MISMATCH'; END IF;
  IF v_file_status IS DISTINCT FROM 'ready' OR v_file_security_status IS DISTINCT FROM 'passed' THEN RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_NOT_VERIFIED'; END IF;
  IF coalesce(v_file_metadata->>'storage_bucket','') IS DISTINCT FROM 'documents' THEN RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_STORAGE_BINDING_INVALID'; END IF;
  IF v_file_metadata->>'raw_bytes_sha256' IS DISTINCT FROM v_file_hash THEN RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_RAW_HASH_PROOF_MISSING'; END IF;
  IF v_source_fingerprint IS NULL OR btrim(v_source_fingerprint) = '' THEN RAISE EXCEPTION 'IMPORT_SOURCE_FINGERPRINT_REQUIRED'; END IF;
  IF v_source_fingerprint IS DISTINCT FROM v_file_hash THEN RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_HASH_DRIFT'; END IF;
  IF v_job_type IN ('products','customers','sales_invoices','purchase_invoices','suppliers','inventory_balances','payments')
     AND v_job_type IS DISTINCT FROM p_entity_type THEN
    RAISE EXCEPTION 'IMPORT_JOB_ENTITY_TYPE_MISMATCH';
  END IF;

  RETURN public.import_commit_batch(p_company_id,p_entity_type,p_rows,p_null_policy,p_source_hash);
END;
$wrapper$;

REVOKE EXECUTE ON FUNCTION public.import_commit_batch(uuid,text,jsonb,text,text) FROM anon;
GRANT EXECUTE ON FUNCTION public.import_commit_batch(uuid,text,jsonb,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.import_commit_batch(uuid,text,jsonb,text,text,uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.import_commit_batch(uuid,text,jsonb,text,text,uuid) TO authenticated;

COMMENT ON FUNCTION public.import_commit_batch(uuid,text,jsonb,text,text)
IS 'Canonical tenant-scoped import commit supporting products, customers, sales invoices, purchase invoices, suppliers, inventory balances, payments and generic datasets.';
COMMENT ON FUNCTION public.import_commit_batch(uuid,text,jsonb,text,text,uuid)
IS 'Authoritative source-bound import commit wrapper. It verifies import job/file provenance then delegates to the canonical commit boundary.';
