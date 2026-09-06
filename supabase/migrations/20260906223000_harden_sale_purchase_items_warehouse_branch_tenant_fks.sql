-- Forward-only tenant containment hardening for sale/purchase items and warehouse branches.
-- Preflight aborts before adding tenant-bound constraints if existing references cross company boundaries.
DO $$
DECLARE
  v_bad bigint;
BEGIN
  SELECT count(*) INTO v_bad
  FROM public.sale_items si
  JOIN public.sales_invoices i ON i.id = si.invoice_id
  JOIN public.products p ON p.id = si.product_id
  WHERE i.company_id <> p.company_id;
  IF v_bad > 0 THEN RAISE EXCEPTION 'SALE_ITEM_PRODUCT_TENANT_MISMATCH:%', v_bad; END IF;

  SELECT count(*) INTO v_bad
  FROM public.sale_items si
  JOIN public.sales_invoices i ON i.id = si.invoice_id
  WHERE si.company_id IS NOT NULL AND si.company_id <> i.company_id;
  IF v_bad > 0 THEN RAISE EXCEPTION 'SALE_ITEM_COMPANY_TENANT_MISMATCH:%', v_bad; END IF;

  SELECT count(*) INTO v_bad
  FROM public.purchase_items pi
  JOIN public.purchase_invoices i ON i.id = pi.invoice_id
  JOIN public.products p ON p.id = pi.product_id
  WHERE i.company_id <> p.company_id;
  IF v_bad > 0 THEN RAISE EXCEPTION 'PURCHASE_ITEM_PRODUCT_TENANT_MISMATCH:%', v_bad; END IF;

  SELECT count(*) INTO v_bad
  FROM public.purchase_items pi
  JOIN public.purchase_invoices i ON i.id = pi.invoice_id
  WHERE pi.company_id IS NOT NULL AND pi.company_id <> i.company_id;
  IF v_bad > 0 THEN RAISE EXCEPTION 'PURCHASE_ITEM_COMPANY_TENANT_MISMATCH:%', v_bad; END IF;

  SELECT count(*) INTO v_bad
  FROM public.warehouses w
  JOIN public.branches b ON b.id = w.branch_id
  WHERE w.company_id <> b.company_id;
  IF v_bad > 0 THEN RAISE EXCEPTION 'WAREHOUSE_BRANCH_TENANT_MISMATCH:%', v_bad; END IF;
END $$;

ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.purchase_items ADD COLUMN IF NOT EXISTS company_id uuid;

UPDATE public.sale_items si
SET company_id = i.company_id
FROM public.sales_invoices i
WHERE i.id = si.invoice_id
  AND si.company_id IS NULL;

UPDATE public.purchase_items pi
SET company_id = i.company_id
FROM public.purchase_invoices i
WHERE i.id = pi.invoice_id
  AND pi.company_id IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.sale_items WHERE company_id IS NULL) THEN
    RAISE EXCEPTION 'SALE_ITEM_COMPANY_ID_NULL_AFTER_BACKFILL';
  END IF;
  IF EXISTS (SELECT 1 FROM public.purchase_items WHERE company_id IS NULL) THEN
    RAISE EXCEPTION 'PURCHASE_ITEM_COMPANY_ID_NULL_AFTER_BACKFILL';
  END IF;
END $$;

ALTER TABLE public.sale_items ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.purchase_items ALTER COLUMN company_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS purchase_invoices_company_id_id_key
  ON public.purchase_invoices(company_id, id);

ALTER TABLE public.sale_items
  DROP CONSTRAINT IF EXISTS sale_items_invoice_id_fkey;
ALTER TABLE public.sale_items
  DROP CONSTRAINT IF EXISTS sale_items_product_id_fkey;
ALTER TABLE public.sale_items
  ADD CONSTRAINT sale_items_invoice_company_fkey
  FOREIGN KEY (company_id, invoice_id)
  REFERENCES public.sales_invoices(company_id, id)
  ON DELETE CASCADE;
ALTER TABLE public.sale_items
  ADD CONSTRAINT sale_items_product_company_fkey
  FOREIGN KEY (company_id, product_id)
  REFERENCES public.products(company_id, id);

ALTER TABLE public.purchase_items
  DROP CONSTRAINT IF EXISTS purchase_items_invoice_id_fkey;
ALTER TABLE public.purchase_items
  DROP CONSTRAINT IF EXISTS purchase_items_product_id_fkey;
ALTER TABLE public.purchase_items
  ADD CONSTRAINT purchase_items_invoice_company_fkey
  FOREIGN KEY (company_id, invoice_id)
  REFERENCES public.purchase_invoices(company_id, id)
  ON DELETE CASCADE;
ALTER TABLE public.purchase_items
  ADD CONSTRAINT purchase_items_product_company_fkey
  FOREIGN KEY (company_id, product_id)
  REFERENCES public.products(company_id, id);

ALTER TABLE public.warehouses
  DROP CONSTRAINT IF EXISTS warehouses_branch_id_fkey;
ALTER TABLE public.warehouses
  ADD CONSTRAINT warehouses_branch_company_fkey
  FOREIGN KEY (company_id, branch_id)
  REFERENCES public.branches(company_id, id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS sale_items_company_invoice_idx
  ON public.sale_items(company_id, invoice_id);
CREATE INDEX IF NOT EXISTS sale_items_company_product_idx
  ON public.sale_items(company_id, product_id);
CREATE INDEX IF NOT EXISTS purchase_items_company_invoice_idx
  ON public.purchase_items(company_id, invoice_id);
CREATE INDEX IF NOT EXISTS purchase_items_company_product_idx
  ON public.purchase_items(company_id, product_id);
CREATE INDEX IF NOT EXISTS warehouses_company_branch_idx
  ON public.warehouses(company_id, branch_id);
