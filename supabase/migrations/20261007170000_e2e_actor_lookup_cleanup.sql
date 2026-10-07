create or replace function public.lookup_e2e_actor_by_email(p_email text)
returns table(user_id uuid, email text, raw_user_meta_data jsonb, created_at timestamptz)
language sql
security definer
set search_path = auth, pg_catalog
as $$
  select u.id, u.email, u.raw_user_meta_data, u.created_at
  from auth.users u
  where lower(u.email) = lower(trim(p_email))
    and coalesce(u.raw_user_meta_data->>'e2e_actor','') = 'true'
    and coalesce(u.raw_user_meta_data->>'e2e_purpose','') = 'full-product-browser-e2e'
  limit 1
$$;

revoke all on function public.lookup_e2e_actor_by_email(text) from public, anon, authenticated;
grant execute on function public.lookup_e2e_actor_by_email(text) to service_role;

create or replace function public.list_stale_e2e_actor_ids(p_before timestamptz, p_limit integer default 250)
returns table(user_id uuid, created_at timestamptz)
language sql
security definer
set search_path = auth, pg_catalog
as $$
  select u.id, u.created_at
  from auth.users u
  where u.created_at < p_before
    and coalesce(u.raw_user_meta_data->>'e2e_actor','') = 'true'
    and coalesce(u.raw_user_meta_data->>'e2e_purpose','') = 'full-product-browser-e2e'
  order by u.created_at asc
  limit greatest(1, least(coalesce(p_limit, 250), 1000))
$$;

revoke all on function public.list_stale_e2e_actor_ids(timestamptz, integer) from public, anon, authenticated;
grant execute on function public.list_stale_e2e_actor_ids(timestamptz, integer) to service_role;
