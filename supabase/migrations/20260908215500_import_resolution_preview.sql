create or replace function public.import_resolution_preview(p_entity_type text, p_rows jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_company uuid := public.current_company_id();
  v_key_column text;
  v_sql text;
  v_result jsonb;
begin
  if v_company is null then raise exception 'IMPORT_TENANT_CONTEXT_REQUIRED'; end if;
  if p_entity_type not in ('products','customers','sales_invoices') then raise exception 'IMPORT_ENTITY_TYPE_UNSUPPORTED'; end if;
  if jsonb_typeof(p_rows) <> 'array' then raise exception 'IMPORT_PREVIEW_ROWS_MUST_BE_ARRAY'; end if;
  if jsonb_array_length(p_rows) > 500 then raise exception 'IMPORT_BATCH_TOO_LARGE'; end if;
  v_key_column := case p_entity_type when 'products' then 'sku' when 'sales_invoices' then 'invoice_number' else 'code' end;
  v_sql := format($sql$
    select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
    from public.%I t
    where t.company_id = $1
      and (
        public.normalize_import_key(t.%I) in (
          select public.normalize_import_key(value->>%L)
          from jsonb_array_elements($2) value
          where nullif(btrim(value->>%L), '') is not null
        )
        %s
      )
  $sql$, p_entity_type, v_key_column, v_key_column, v_key_column,
    case when p_entity_type = 'customers' then format('or public.normalize_import_key(t.name) in (select public.normalize_import_key(value->>''name'') from jsonb_array_elements($2) value where nullif(btrim(value->>''name''), '''') is not null)') else '' end);
  execute v_sql into v_result using v_company, p_rows;
  return coalesce(v_result, '[]'::jsonb);
end;
$$;
revoke execute on function public.import_resolution_preview(text,jsonb) from public, anon;
grant execute on function public.import_resolution_preview(text,jsonb) to authenticated;
