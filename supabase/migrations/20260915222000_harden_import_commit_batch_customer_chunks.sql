-- Keep the governed import_commit_batch transaction intact while preventing the authenticated-role 8s statement timeout on large customer batches.
-- Each batch is still executed inside the same function transaction, so any later failure rolls back the entire import atomically.

create or replace function public.import_commit_batch(p_company_id uuid, p_entity_type text, p_rows jsonb, p_null_policy text default 'preserve', p_source_hash text default null)
returns jsonb
language plpgsql
set search_path = ''
as $function$
-- The authoritative implementation is applied on staging by the same migration before fresh certification.
declare
  v_company_id uuid := public.current_company_id();
  v_row jsonb;
  v_id uuid;
  v_count integer := 0;
  v_ids jsonb := '[]'::jsonb;
  v_existing public.canonical_import_commits%rowtype;
  v_batch_start bigint := 1;
  v_batch_end bigint;
begin
  if v_company_id is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if p_company_id is distinct from v_company_id then raise exception 'TENANT_CONTEXT_MISMATCH'; end if;
  if p_source_hash is null or btrim(p_source_hash) = '' then raise exception 'IMPORT_SOURCE_HASH_REQUIRED'; end if;
  if p_source_hash !~ '^sha256:[0-9a-fA-F]{64}$' then raise exception 'IMPORT_SOURCE_HASH_INVALID'; end if;
  if p_entity_type not in ('products','customers','sales_invoices') then raise exception 'IMPORT_ENTITY_TYPE_UNSUPPORTED'; end if;
  if jsonb_typeof(p_rows) is distinct from 'array' then raise exception 'IMPORT_ROWS_MUST_BE_ARRAY'; end if;

  select * into v_existing from public.canonical_import_commits c
  where c.company_id=v_company_id and c.entity_type=p_entity_type and c.source_hash=p_source_hash for update;
  if found then return jsonb_build_object('committed',v_existing.committed_count,'ids',v_existing.committed_ids,'idempotent_replay',true); end if;

  if jsonb_array_length(p_rows)=0 then
    insert into public.canonical_import_commits(company_id,entity_type,source_hash,committed_ids,committed_count)
    values(v_company_id,p_entity_type,p_source_hash,'[]'::jsonb,0);
    return jsonb_build_object('committed',0,'ids','[]'::jsonb,'idempotent_replay',false);
  end if;

  if p_entity_type='customers' and jsonb_array_length(p_rows) <= 10 then
    for v_row in select value from jsonb_array_elements(p_rows) loop
      select target_id into v_id from public.import_upsert_customer(v_company_id,v_row->>'name',v_row->>'code',v_row->>'phone',v_row->>'email',v_row->>'segment',nullif(v_row->>'credit_limit','')::numeric,nullif(v_row->>'payment_terms_days','')::integer,p_null_policy);
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

    while v_batch_start <= jsonb_array_length(p_rows) loop
      v_batch_end := least(jsonb_array_length(p_rows), v_batch_start + 99);

      update public.customers c
      set name=case when p_null_policy='preserve' and t.name is null then c.name else coalesce(t.name,c.name) end,
          phone=case when p_null_policy='preserve' and t.phone is null then c.phone else coalesce(t.phone,c.phone) end,
          email=case when p_null_policy='preserve' and t.email is null then c.email else coalesce(t.email,c.email) end,
          segment=case when p_null_policy='preserve' and t.segment is null then c.segment else coalesce(t.segment,c.segment) end,
          credit_limit=case when p_null_policy='preserve' and t.credit_limit is null then c.credit_limit else coalesce(t.credit_limit,c.credit_limit) end,
          payment_terms_days=case when p_null_policy='preserve' and t.payment_terms_days is null then c.payment_terms_days else coalesce(t.payment_terms_days,c.payment_terms_days) end
      from tmp_import_customers t
      where t.ord between v_batch_start and v_batch_end
        and t.norm_code is not null and c.company_id=v_company_id and c.code is not null and btrim(c.code) <> ''
        and public.normalize_import_key(c.code)=t.norm_code;

      insert into public.customers(company_id,name,code,phone,email,segment,credit_limit,payment_terms_days)
      select v_company_id,t.name,t.code,t.phone,t.email,coalesce(t.segment,'regular'),coalesce(t.credit_limit,0),coalesce(t.payment_terms_days,30)
      from tmp_import_customers t
      where t.ord between v_batch_start and v_batch_end and t.norm_code is not null and not exists (
        select 1 from public.customers c where c.company_id=v_company_id and c.code is not null and btrim(c.code) <> '' and public.normalize_import_key(c.code)=t.norm_code
      )
      on conflict do nothing;

      update tmp_import_customers t set target_id=c.id
      from public.customers c
      where t.ord between v_batch_start and v_batch_end and t.norm_code is not null
        and c.company_id=v_company_id and c.code is not null and btrim(c.code) <> '' and public.normalize_import_key(c.code)=t.norm_code;

      v_batch_start := v_batch_end + 1;
    end loop;

    for v_row in select to_jsonb(t) from tmp_import_customers t where t.norm_code is null order by t.ord loop
      select target_id into v_id from public.import_upsert_customer(v_company_id,v_row->>'name',null,v_row->>'phone',v_row->>'email',v_row->>'segment',nullif(v_row->>'credit_limit','')::numeric,nullif(v_row->>'payment_terms_days','')::integer,p_null_policy);
      if v_id is null then raise exception 'IMPORT_TARGET_ID_MISSING'; end if;
      update tmp_import_customers set target_id=v_id where ord=(v_row->>'ord')::bigint;
    end loop;

    if exists (select 1 from tmp_import_customers where target_id is null) then raise exception 'IMPORT_TARGET_ID_MISSING'; end if;
    select count(*)::integer, coalesce(jsonb_agg(target_id order by ord),'[]'::jsonb) into v_count,v_ids from tmp_import_customers;
  else
    for v_row in select value from jsonb_array_elements(p_rows) loop
      if p_entity_type='products' then
        select target_id into v_id from public.import_upsert_product(v_company_id,v_row->>'sku',v_row->>'name',v_row->>'unit',nullif(v_row->>'cost_price','')::numeric,nullif(v_row->>'selling_price','')::numeric,nullif(v_row->>'min_stock','')::numeric,nullif(v_row->>'reorder_point','')::numeric,case when v_row ? 'is_active' and v_row->>'is_active'<>'' then (v_row->>'is_active')::boolean else null end,p_null_policy);
      else
        select target_id into v_id from public.import_upsert_sales_invoice(v_company_id,v_row->>'invoice_number',nullif(v_row->>'invoice_date','')::date,nullif(v_row->>'customer_id','')::uuid,v_row->>'customer_name',nullif(v_row->>'subtotal','')::numeric,nullif(v_row->>'tax_amount','')::numeric,nullif(v_row->>'total','')::numeric,nullif(v_row->>'paid_amount','')::numeric,v_row->>'status',p_null_policy);
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
