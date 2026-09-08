-- Tenant-safe read model for recommendation -> alternatives -> decision.
-- SECURITY INVOKER intentionally keeps RLS/current_company_id as the authority.

CREATE OR REPLACE FUNCTION public.get_alternative_item_groups(
  p_limit integer DEFAULT 100
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_company uuid := public.current_company_id();
BEGIN
  IF v_company IS NULL THEN
    RAISE EXCEPTION 'TENANT_REQUIRED';
  END IF;
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 200 THEN
    RAISE EXCEPTION 'ALTERNATIVE_QUERY_INVALID_LIMIT';
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(to_jsonb(q) ORDER BY q.group_name, q.group_id)
    FROM (
      SELECT
        g.id AS group_id,
        g.name AS group_name,
        g.description,
        g.base_unit,
        g.is_active,
        COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'member_id', m.id,
              'sku', m.sku,
              'conversion_factor', m.conversion_factor,
              'product_id', p.id,
              'product_name', p.name,
              'unit', p.unit,
              'is_product_active', COALESCE(p.is_active, false),
              'cost_price', p.cost_price,
              'selling_price', p.selling_price
            )
            ORDER BY m.sku
          )
          FROM public.alternative_item_group_members m
          LEFT JOIN public.products p
            ON p.company_id = v_company
           AND p.sku = m.sku
          WHERE m.company_id = v_company
            AND m.group_id = g.id
        ), '[]'::jsonb) AS members
      FROM public.alternative_item_groups g
      WHERE g.company_id = v_company
      ORDER BY g.name, g.id
      LIMIT p_limit
    ) q
  ), '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.get_alternative_item_groups(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_alternative_item_groups(integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_alternative_item_groups(integer) TO authenticated;
