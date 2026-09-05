# Alternative-group membership FK index rationale

`public.alternative_item_group_members.group_id` references `public.alternative_item_groups.id` with `ON DELETE CASCADE`.

The table's existing unique indexes are `(company_id, group_id, sku)` and `(company_id, sku)`. Because `group_id` is not the leading column of either index, PostgreSQL cannot use either as a general-purpose index for operations keyed by `group_id` alone. A standalone `group_id` index is therefore added to support FK maintenance and group-scoped membership access without changing RLS, privileges, or application semantics.
