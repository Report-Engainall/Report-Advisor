-- Canonical tenant authority for alternative-item-group mutations.
-- Remove caller-supplied tenant arguments from the authorization boundary.
DROP FUNCTION IF EXISTS public.create_alternative_item_group(uuid,text,text,text);
DROP FUNCTION IF EXISTS public.add_alternative_item_group_member(uuid,uuid,text,numeric);
DROP FUNCTION IF EXISTS public.remove_alternative_item_group_member(uuid,uuid);

CREATE OR REPLACE FUNCTION public.create_alternative_item_group(
  p_name text,
  p_description text DEFAULT NULL,
  p_base_unit text DEFAULT 'unit'
)
RETURNS public.alternative_item_groups
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company uuid := public.current_company_id();
  v_group public.alternative_item_groups;
BEGIN
  IF v_company IS NULL THEN RAISE EXCEPTION 'tenant resolution failed'; END IF;
  IF NULLIF(trim(p_name), '') IS NULL THEN RAISE EXCEPTION 'group name is required'; END IF;
  INSERT INTO public.alternative_item_groups(company_id,name,description,base_unit)
  VALUES (v_company,trim(p_name),NULLIF(trim(p_description),''),COALESCE(NULLIF(trim(p_base_unit),''),'unit'))
  RETURNING * INTO v_group;
  RETURN v_group;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_alternative_item_group_member(
  p_group_id uuid,
  p_sku text,
  p_conversion_factor numeric DEFAULT 1
)
RETURNS public.alternative_item_group_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company uuid := public.current_company_id();
  v_member public.alternative_item_group_members;
BEGIN
  IF v_company IS NULL THEN RAISE EXCEPTION 'tenant resolution failed'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.alternative_item_groups WHERE id=p_group_id AND company_id=v_company) THEN
    RAISE EXCEPTION 'group does not belong to current tenant';
  END IF;
  IF NULLIF(trim(p_sku),'') IS NULL THEN RAISE EXCEPTION 'SKU is required'; END IF;
  IF p_conversion_factor IS NULL OR p_conversion_factor <= 0 THEN RAISE EXCEPTION 'conversion factor must be greater than zero'; END IF;
  INSERT INTO public.alternative_item_group_members(company_id,group_id,sku,conversion_factor)
  VALUES (v_company,p_group_id,trim(p_sku),p_conversion_factor)
  RETURNING * INTO v_member;
  RETURN v_member;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_alternative_item_group_member(
  p_member_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_company uuid := public.current_company_id();
BEGIN
  IF v_company IS NULL THEN RAISE EXCEPTION 'tenant resolution failed'; END IF;
  DELETE FROM public.alternative_item_group_members
  WHERE id=p_member_id AND company_id=v_company;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_alternative_item_group(text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_alternative_item_group_member(uuid,text,numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_alternative_item_group_member(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.create_alternative_item_group(text,text,text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.add_alternative_item_group_member(uuid,text,numeric) FROM anon;
REVOKE EXECUTE ON FUNCTION public.remove_alternative_item_group_member(uuid) FROM anon;
