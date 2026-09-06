-- Forward-only tenant containment hardening for financial/inventory relations.
-- Preflight aborts before constraint replacement if existing data violates company boundaries.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.payments p JOIN public.customers c ON c.id = p.customer_id WHERE p.company_id <> c.company_id) THEN RAISE EXCEPTION 'payments/customer tenant mismatch'; END IF;
  IF EXISTS (SELECT 1 FROM public.payments p JOIN public.sales_invoices i ON i.id = p.invoice_id WHERE p.invoice_id IS NOT NULL AND p.company_id <> i.company_id) THEN RAISE EXCEPTION 'payments/invoice tenant mismatch'; END IF;
  IF EXISTS (SELECT 1 FROM public.payments p JOIN public.suppliers s ON s.id = p.supplier_id WHERE p.supplier_id IS NOT NULL AND p.company_id <> s.company_id) THEN RAISE EXCEPTION 'payments/supplier tenant mismatch'; END IF;
  IF EXISTS (SELECT 1 FROM public.purchase_invoices i JOIN public.suppliers s ON s.id = i.supplier_id WHERE i.company_id <> s.company_id) THEN RAISE EXCEPTION 'purchase invoice/supplier tenant mismatch'; END IF;
  IF EXISTS (SELECT 1 FROM public.inventory_balances x JOIN public.products p ON p.id = x.product_id WHERE x.company_id <> p.company_id) THEN RAISE EXCEPTION 'inventory balance/product tenant mismatch'; END IF;
  IF EXISTS (SELECT 1 FROM public.inventory_balances x JOIN public.warehouses w ON w.id = x.warehouse_id WHERE x.company_id <> w.company_id) THEN RAISE EXCEPTION 'inventory balance/warehouse tenant mismatch'; END IF;
  IF EXISTS (SELECT 1 FROM public.inventory_movements x JOIN public.products p ON p.id = x.product_id WHERE x.company_id <> p.company_id) THEN RAISE EXCEPTION 'inventory movement/product tenant mismatch'; END IF;
  IF EXISTS (SELECT 1 FROM public.inventory_movements x JOIN public.warehouses w ON w.id = x.warehouse_id WHERE x.company_id <> w.company_id) THEN RAISE EXCEPTION 'inventory movement/warehouse tenant mismatch'; END IF;
  IF EXISTS (SELECT 1 FROM public.sales_invoices i JOIN public.branches b ON b.id = i.branch_id WHERE i.branch_id IS NOT NULL AND i.company_id <> b.company_id) THEN RAISE EXCEPTION 'sales invoice/branch tenant mismatch'; END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS sales_invoices_company_id_id_key ON public.sales_invoices(company_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS suppliers_company_id_id_key ON public.suppliers(company_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS products_company_id_id_key ON public.products(company_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS warehouses_company_id_id_key ON public.warehouses(company_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS branches_company_id_id_key ON public.branches(company_id, id);

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_customer_id_fkey;
ALTER TABLE public.payments ADD CONSTRAINT payments_customer_company_fkey FOREIGN KEY (company_id, customer_id) REFERENCES public.customers(company_id, id);
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_invoice_fk;
ALTER TABLE public.payments ADD CONSTRAINT payments_invoice_company_fkey FOREIGN KEY (company_id, invoice_id) REFERENCES public.sales_invoices(company_id, id);
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_supplier_id_fkey;
ALTER TABLE public.payments ADD CONSTRAINT payments_supplier_company_fkey FOREIGN KEY (company_id, supplier_id) REFERENCES public.suppliers(company_id, id);

ALTER TABLE public.purchase_invoices DROP CONSTRAINT IF EXISTS purchase_invoices_supplier_id_fkey;
ALTER TABLE public.purchase_invoices ADD CONSTRAINT purchase_invoices_supplier_company_fkey FOREIGN KEY (company_id, supplier_id) REFERENCES public.suppliers(company_id, id);

ALTER TABLE public.inventory_balances DROP CONSTRAINT IF EXISTS inventory_balances_product_id_fkey;
ALTER TABLE public.inventory_balances ADD CONSTRAINT inventory_balances_product_company_fkey FOREIGN KEY (company_id, product_id) REFERENCES public.products(company_id, id);
ALTER TABLE public.inventory_balances DROP CONSTRAINT IF EXISTS inventory_balances_warehouse_id_fkey;
ALTER TABLE public.inventory_balances ADD CONSTRAINT inventory_balances_warehouse_company_fkey FOREIGN KEY (company_id, warehouse_id) REFERENCES public.warehouses(company_id, id);

ALTER TABLE public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_product_id_fkey;
ALTER TABLE public.inventory_movements ADD CONSTRAINT inventory_movements_product_company_fkey FOREIGN KEY (company_id, product_id) REFERENCES public.products(company_id, id);
ALTER TABLE public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_warehouse_id_fkey;
ALTER TABLE public.inventory_movements ADD CONSTRAINT inventory_movements_warehouse_company_fkey FOREIGN KEY (company_id, warehouse_id) REFERENCES public.warehouses(company_id, id);

ALTER TABLE public.sales_invoices DROP CONSTRAINT IF EXISTS sales_invoices_branch_id_fkey;
ALTER TABLE public.sales_invoices ADD CONSTRAINT sales_invoices_branch_company_fkey FOREIGN KEY (company_id, branch_id) REFERENCES public.branches(company_id, id);
