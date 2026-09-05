-- Index the FK used by alternative-group membership joins/deletes.
-- The existing unique indexes begin with company_id and cannot efficiently
-- support predicates or FK maintenance keyed by group_id alone.
create index if not exists alternative_item_group_members_group_id_idx
  on public.alternative_item_group_members (group_id);
