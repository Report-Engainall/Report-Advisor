-- Bind product/category relationships to the same tenant.
-- Preflight refuses to harden over cross-tenant or orphaned references.
DO $$
DECLARE v_bad bigint;
BEGIN
  SELECT count(*) INTO v_bad
  FROM public.products p
  LEFT JOIN public.categories c ON c.id=p.category_id AND c.company_id=p.company_id
  WHERE p.category_id IS NOT NULL AND c.id IS NULL;
  IF v_bad > 0 THEN RAISE EXCEPTION 'PRODUCT_CATEGORY_TENANT_MISMATCH:%',v_bad; END IF;

  SELECT count(*) INTO v_bad
  FROM public.categories c
  LEFT JOIN public.categories parent ON parent.id=c.parent_id AND parent.company_id=c.company_id
  WHERE c.parent_id IS NOT NULL AND parent.id IS NULL;
  IF v_bad > 0 THEN RAISE EXCEPTION 'CATEGORY_PARENT_TENANT_MISMATCH:%',v_bad; END IF;
END $$;

ALTER TABLE public.categories
  ADD CONSTRAINT categories_company_id_id_key UNIQUE (company_id,id);

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_category_id_fkey;

ALTER TABLE public.products
  ADD CONSTRAINT products_category_company_fkey
  FOREIGN KEY (company_id,category_id)
  REFERENCES public.categories(company_id,id)
  ON DELETE SET NULL;

ALTER TABLE public.categories
  DROP CONSTRAINT IF EXISTS categories_parent_id_fkey;

ALTER TABLE public.categories
  ADD CONSTRAINT categories_parent_company_fkey
  FOREIGN KEY (company_id,parent_id)
  REFERENCES public.categories(company_id,id)
  ON DELETE SET NULL;
